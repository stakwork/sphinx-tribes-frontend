import { makeAutoObservable, runInAction, computed } from 'mobx';
import { TribesURL } from 'config';
import { useMemo } from 'react';
import { BountyCard, BountyCardStatus } from './interface';
import { uiStore } from './ui';

export class BountyCardStore {
  bountyCards: BountyCard[] = [];
  currentWorkspaceId: string;
  loading = false;
  error: string | null = null;
  pagination = {
    currentPage: 1,
    pageSize: 10,
    total: 0
  };

  constructor(workspaceId: string) {
    this.currentWorkspaceId = workspaceId;
    makeAutoObservable(this);
    this.loadWorkspaceBounties();
  }

  private constructQueryParams(): string {
    const { currentPage, pageSize } = this.pagination;
    return new URLSearchParams({
      page: currentPage.toString(),
      limit: pageSize.toString()
    }).toString();
  }

  private calculateBountyStatus(bounty: BountyCard): BountyCardStatus {
    if (bounty.paid) {
      return 'Paid';
    }
    if (bounty.completed || bounty.payment_pending) {
      return 'Complete';
    }
    if (bounty.assignee_img) {
      return 'Assigned';
    }
    return 'Todo';
  }

  loadWorkspaceBounties = async (): Promise<void> => {
    if (!this.currentWorkspaceId || !uiStore.meInfo?.tribe_jwt) {
      runInAction(() => {
        this.error = 'Missing workspace ID or authentication';
      });
      return;
    }

    try {
      runInAction(() => {
        this.loading = true;
        this.error = null;
      });

      const queryParams = this.constructQueryParams();
      const response = await fetch(
        `${TribesURL}/gobounties/bounty-cards?workspace_uuid=${this.currentWorkspaceId}&${queryParams}`,
        {
          method: 'GET',
          headers: {
            'x-jwt': uiStore.meInfo.tribe_jwt,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load bounties: ${response.statusText}`);
      }

      const data = (await response.json()) as BountyCard[] | null;

      runInAction(() => {
        if (this.pagination.currentPage === 1) {
          this.bountyCards = (data || []).map((bounty: BountyCard) => ({
            ...bounty,
            status: this.calculateBountyStatus(bounty)
          }));
        } else {
          this.bountyCards = [
            ...this.bountyCards,
            ...(data || []).map((bounty: BountyCard) => ({
              ...bounty,
              status: this.calculateBountyStatus(bounty)
            }))
          ];
        }
        this.pagination.total = data?.length || 0;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'An unknown error occurred';
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  switchWorkspace = async (newWorkspaceId: string): Promise<void> => {
    if (this.currentWorkspaceId === newWorkspaceId) return;

    runInAction(() => {
      this.currentWorkspaceId = newWorkspaceId;
      this.pagination.currentPage = 1;
      this.bountyCards = [];
    });

    await this.loadWorkspaceBounties();
  };

  loadNextPage = async (): Promise<void> => {
    if (
      this.loading ||
      this.pagination.currentPage * this.pagination.pageSize >= this.pagination.total
    ) {
      return;
    }

    runInAction(() => {
      this.pagination.currentPage += 1;
    });

    await this.loadWorkspaceBounties();
  };

  @computed get todoItems() {
    return this.bountyCards.filter((card: BountyCard) => card.status === 'Todo');
  }

  @computed get assignedItems() {
    return this.bountyCards.filter((card: BountyCard) => card.status === 'Assigned');
  }

  @computed get completedItems() {
    return this.bountyCards.filter((card: BountyCard) => card.status === 'Complete');
  }

  @computed get paidItems() {
    return this.bountyCards.filter((card: BountyCard) => card.status === 'Paid');
  }

  @computed get hasMorePages(): boolean {
    return this.pagination.currentPage * this.pagination.pageSize < this.pagination.total;
  }
}

export const useBountyCardStore = (workspaceId: string) =>
  useMemo(() => new BountyCardStore(workspaceId), [workspaceId]);

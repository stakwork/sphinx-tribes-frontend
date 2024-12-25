import { makeAutoObservable, runInAction } from 'mobx';
import { TribesURL } from 'config';
import { useMemo } from 'react';
import { BountyCard } from './interface';
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
          this.bountyCards = data || [];
        } else {
          this.bountyCards = [...this.bountyCards, ...(data || [])];
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
}

export const useBountyCardStore = (workspaceId: string) =>
  useMemo(() => new BountyCardStore(workspaceId), [workspaceId]);

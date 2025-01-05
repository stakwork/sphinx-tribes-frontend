import { makeAutoObservable, runInAction, computed, observable, action } from 'mobx';
import { TribesURL } from 'config';
import { useMemo } from 'react';
import { BountyCard, BountyCardStatus } from './interface';
import { uiStore } from './ui';

interface FilterState {
  selectedFeatures: string[];
  timestamp: number;
}

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
  @observable selectedFeatures: string[] = [];

  constructor(workspaceId: string) {
    this.currentWorkspaceId = workspaceId;
    makeAutoObservable(this);
    this.loadWorkspaceBounties();
    this.restoreFilterState();
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
    if (typeof bounty.pow === 'number' && bounty.pow > 0) {
      return 'Review';
    }
    if (bounty.assignee_img) {
      return 'Assigned';
    }
    return 'Todo';
  }

  loadWorkspaceBounties = async (): Promise<void> => {
    const jwt = uiStore.meInfo?.tribe_jwt;

    if (!this.currentWorkspaceId || !jwt) {
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
      const url = `${TribesURL}/gobounties/bounty-cards?workspace_uuid=${this.currentWorkspaceId}&${queryParams}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-jwt': jwt,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load bounties: ${response.statusText}`);
      }

      const data = (await response.json()) as BountyCard[] | null;

      // Fetch proof counts for each bounty
      const bountyCardsWithProofs = await Promise.all(
        (data || []).map(async (bounty: BountyCard) => {
          try {
            const proofsUrl = `${TribesURL}/gobounties/${bounty.id}/proofs`;
            const proofsResponse = await fetch(proofsUrl, {
              method: 'GET',
              headers: {
                'x-jwt': jwt,
                'Content-Type': 'application/json'
              }
            });

            if (!proofsResponse.ok) {
              return { ...bounty, pow: 0 };
            }

            const proofs = await proofsResponse.json();
            return {
              ...bounty,
              pow: Array.isArray(proofs) ? proofs.length : 0
            };
          } catch (error) {
            console.error(`Error fetching proofs for bounty ${bounty.id}:`, error);
            return { ...bounty, pow: 0 };
          }
        })
      );

      runInAction(() => {
        if (this.pagination.currentPage === 1) {
          this.bountyCards = bountyCardsWithProofs.map((bounty: BountyCard) => ({
            ...bounty,
            status: this.calculateBountyStatus(bounty)
          }));
        } else {
          this.bountyCards = [
            ...this.bountyCards,
            ...bountyCardsWithProofs.map((bounty: BountyCard) => ({
              ...bounty,
              status: this.calculateBountyStatus(bounty)
            }))
          ];
        }
        this.pagination.total = data?.length || 0;
      });
    } catch (error) {
      console.error('Error loading bounties:', error);
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

  @computed get reviewItems() {
    return this.bountyCards.filter((card: BountyCard) => card.status === 'Review');
  }

  @action
  saveFilterState() {
    sessionStorage.setItem(
      'bountyFilterState',
      JSON.stringify({
        selectedFeatures: this.selectedFeatures,
        timestamp: Date.now()
      })
    );
  }

  @action
  restoreFilterState() {
    const saved = sessionStorage.getItem('bountyFilterState');
    if (saved) {
      const state = JSON.parse(saved) as FilterState;
      runInAction(() => {
        this.selectedFeatures = state.selectedFeatures;
      });
    }
  }

  @action
  toggleFeature(featureId: string) {
    if (this.selectedFeatures.includes(featureId)) {
      this.selectedFeatures = this.selectedFeatures.filter((id: string) => id !== featureId);
    } else {
      this.selectedFeatures.push(featureId);
    }
    this.saveFilterState();
  }

  @action
  clearAllFilters() {
    this.selectedFeatures = [];
    sessionStorage.removeItem('bountyFilterState');
    this.saveFilterState();
  }

  @computed
  get filteredBountyCards() {
    if (this.selectedFeatures.length === 0) {
      return this.bountyCards;
    }

    return this.bountyCards.filter((card: BountyCard) => {
      const hasNoFeature = !card.features?.uuid;
      const isNoFeatureSelected = this.selectedFeatures.includes('no-feature');
      const hasSelectedFeature =
        card.features?.uuid && this.selectedFeatures.includes(card.features.uuid);

      if (hasNoFeature && isNoFeatureSelected) {
        return true;
      }

      if (hasSelectedFeature) {
        return true;
      }

      return false;
    });
  }

  @computed
  get hasCardsWithoutFeatures() {
    return this.bountyCards.some((card: BountyCard) => !card.features?.uuid);
  }
}

export const useBountyCardStore = (workspaceId: string) =>
  useMemo(() => new BountyCardStore(workspaceId), [workspaceId]);

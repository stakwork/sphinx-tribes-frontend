import { makeAutoObservable, runInAction, computed, observable, action } from 'mobx';
import { TribesURL } from 'config';
import { useMemo } from 'react';
import { BountyCard, BountyCardStatus } from './interface';
import { uiStore } from './ui';

interface FilterState {
  selectedFeatures: string[];
  selectedPhases: string[];
  selectedStatuses: BountyCardStatus[];
  timestamp: number;
}

export class BountyCardStore {
  bountyCards: BountyCard[] = [];
  currentWorkspaceId: string;
  loading = false;
  error: string | null = null;

  @observable selectedFeatures: string[] = [];
  @observable selectedPhases: string[] = [];
  @observable selectedStatuses: BountyCardStatus[] = [];

  constructor(workspaceId: string) {
    this.currentWorkspaceId = workspaceId;
    makeAutoObservable(this);
    this.loadWorkspaceBounties();
    this.restoreFilterState();
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

      const url = `${TribesURL}/gobounties/bounty-cards?workspace_uuid=${this.currentWorkspaceId}`;

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
        this.bountyCards = bountyCardsWithProofs.map((bounty: BountyCard) => ({
          ...bounty
        }));
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
      this.bountyCards = [];
      this.clearAllFilters();
    });

    await this.loadWorkspaceBounties();
  };

  @computed get todoItems() {
    return this.filteredBountyCards.filter((card: BountyCard) => card.status === 'TODO');
  }

  @computed get assignedItems() {
    return this.filteredBountyCards.filter((card: BountyCard) => card.status === 'IN_PROGRESS');
  }

  @computed get completedItems() {
    return this.filteredBountyCards.filter((card: BountyCard) => card.status === 'COMPLETED');
  }

  @computed get paidItems() {
    return this.filteredBountyCards.filter((card: BountyCard) => card.status === 'PAID');
  }

  @computed get reviewItems() {
    return this.filteredBountyCards.filter((card: BountyCard) => card.status === 'IN_REVIEW');
  }

  @action
  togglePhase(phaseId: string) {
    this.selectedPhases = this.selectedPhases.includes(phaseId)
      ? this.selectedPhases.filter((id: string) => id !== phaseId)
      : [...this.selectedPhases, phaseId];
    this.saveFilterState();
  }

  @action
  toggleStatus(status: BountyCardStatus) {
    this.selectedStatuses = this.selectedStatuses.includes(status)
      ? this.selectedStatuses.filter((s: BountyCardStatus) => s !== status)
      : [...this.selectedStatuses, status];
    this.saveFilterState();
  }

  @action
  toggleFeature(featureId: string) {
    this.selectedFeatures = this.selectedFeatures.includes(featureId)
      ? this.selectedFeatures.filter((id: string) => id !== featureId)
      : [...this.selectedFeatures, featureId];

    if (this.selectedFeatures.length === 0) {
      this.selectedPhases = [];
    }

    this.saveFilterState();
  }

  @action
  clearAllFilters() {
    this.selectedFeatures = [];
    this.selectedPhases = [];
    this.selectedStatuses = [];
    sessionStorage.removeItem('bountyFilterState');
    this.saveFilterState();
  }

  @action
  saveFilterState() {
    const filterState: FilterState = {
      selectedFeatures: this.selectedFeatures,
      selectedPhases: this.selectedPhases,
      selectedStatuses: this.selectedStatuses,
      timestamp: Date.now()
    };

    sessionStorage.setItem('bountyFilterState', JSON.stringify(filterState));
  }

  @action
  restoreFilterState() {
    try {
      const saved = sessionStorage.getItem('bountyFilterState');
      if (saved) {
        const state = JSON.parse(saved) as FilterState;
        runInAction(() => {
          this.selectedFeatures = state.selectedFeatures || [];
          this.selectedPhases = state.selectedPhases || [];
          this.selectedStatuses = state.selectedStatuses || [];
        });
      }
    } catch (error) {
      console.error('Error restoring filter state:', error);
      this.clearAllFilters();
    }
  }

  @computed
  get availablePhases(): string[] {
    if (this.selectedFeatures.length === 0) return [];

    return Array.from(
      new Set(
        this.filteredByFeatures
          .filter((card: BountyCard) => card.phase?.uuid)
          .map((card: BountyCard) => card.phase.uuid)
      )
    );
  }

  @computed
  get filteredByFeatures(): BountyCard[] {
    if (this.selectedFeatures.length === 0) {
      return this.bountyCards;
    }

    return this.bountyCards.filter((card: BountyCard) => {
      const hasNoFeature = !card.features?.uuid;
      const isNoFeatureSelected = this.selectedFeatures.includes('no-feature');
      const hasSelectedFeature =
        card.features?.uuid && this.selectedFeatures.includes(card.features.uuid);

      return (hasNoFeature && isNoFeatureSelected) || hasSelectedFeature;
    });
  }

  @computed
  get filteredBountyCards(): BountyCard[] {
    return this.filteredByFeatures.filter((card: BountyCard) => {
      const phaseMatch =
        this.selectedPhases.length === 0 ||
        (card.phase?.uuid && this.selectedPhases.includes(card.phase.uuid));

      const statusMatch =
        this.selectedStatuses.length === 0 ||
        (card.status && this.selectedStatuses.includes(card.status));

      return phaseMatch && statusMatch;
    });
  }

  @computed
  get filterStats() {
    return {
      totalCards: this.bountyCards.length,
      filteredCount: this.filteredBountyCards.length,
      hasActiveFilters:
        this.selectedFeatures.length > 0 ||
        this.selectedPhases.length > 0 ||
        this.selectedStatuses.length > 0
    };
  }

  @computed
  get hasCardsWithoutFeatures() {
    return this.bountyCards.some((card: BountyCard) => !card.features?.uuid);
  }
}

export const useBountyCardStore = (workspaceId: string) =>
  useMemo(() => new BountyCardStore(workspaceId), [workspaceId]);

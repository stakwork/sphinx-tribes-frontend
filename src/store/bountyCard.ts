import { makeAutoObservable, runInAction, computed, observable, action } from 'mobx';
import { TribesURL } from 'config';
import { useMemo } from 'react';
import { BountyCard, BountyCardStatus } from './interface';
import { uiStore } from './ui';

interface FilterState {
  selectedFeatures: string[];
  selectedPhases: string[];
  selectedStatuses: string[];
  timestamp: number;
  searchText: string;
}

export class BountyCardStore {
  bountyCards: BountyCard[] = [];
  currentWorkspaceId: string;
  loading = false;
  error: string | null = null;

  @observable selectedFeatures: string[] = [];
  @observable selectedPhases: string[] = [];
  @observable selectedStatuses: string[] = [];
  @observable searchText = '';

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
    });

    await this.loadWorkspaceBounties();
  };

  @computed get todoItems() {
    return this.bountyCards.filter((card: BountyCard) => card.status === 'TODO');
  }

  @computed get assignedItems() {
    return this.bountyCards.filter((card: BountyCard) => card.status === 'IN_PROGRESS');
  }

  @computed get completedItems() {
    return this.bountyCards.filter((card: BountyCard) => card.status === 'COMPLETED');
  }

  @computed get paidItems() {
    return this.bountyCards.filter((card: BountyCard) => card.status === 'PAID');
  }

  @computed get reviewItems() {
    return this.bountyCards.filter((card: BountyCard) => card.status === 'IN_REVIEW');
  }

  @action
  saveFilterState() {
    sessionStorage.setItem(
      'bountyFilterState',
      JSON.stringify({
        selectedFeatures: this.selectedFeatures,
        selectedPhases: this.selectedPhases,
        selectedStatuses: this.selectedStatuses,
        searchText: this.searchText,
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
        this.selectedPhases = state.selectedPhases;
        this.selectedStatuses = state.selectedStatuses;
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
  togglePhase(phaseId: string) {
    if (this.selectedPhases.includes(phaseId)) {
      this.selectedPhases = this.selectedPhases.filter((id: string) => id !== phaseId);
    } else {
      this.selectedPhases.push(phaseId);
    }
    this.saveFilterState();
  }

  @action
  toggleStatus(status: BountyCardStatus) {
    if (this.selectedStatuses.includes(status)) {
      this.selectedStatuses = this.selectedStatuses.filter((s: string) => s !== status);
    } else {
      this.selectedStatuses.push(status);
    }
    this.saveFilterState();
  }

  @action
  clearAllFilters() {
    this.selectedFeatures = [];
    this.selectedPhases = [];
    sessionStorage.removeItem('bountyFilterState');
    this.saveFilterState();
  }

  @action
  clearPhaseFilters() {
    this.selectedPhases = [];
    sessionStorage.removeItem('bountyFilterState');
    this.saveFilterState();
    this.selectedStatuses = [];
    this.searchText = '';
  }

  @action
  clearStatusFilters() {
    this.selectedStatuses = [];
    sessionStorage.removeItem('bountyFilterState');
    this.saveFilterState();
  }

  @computed
  get availablePhases() {
    if (this.selectedFeatures.length === 0) return [];

    const uniquePhases = new Map();

    this.bountyCards
      .filter((card: BountyCard) => {
        const featureMatch =
          this.selectedFeatures.length === 0 ||
          (this.selectedFeatures.includes('no-feature') && !card.features?.uuid) ||
          (card.features?.uuid && this.selectedFeatures.includes(card.features.uuid));

        return featureMatch && card.phase;
      })
      .forEach((card: BountyCard) => {
        if (card.phase) {
          uniquePhases.set(card.phase.name, card.phase);
        }
      });

    return Array.from(uniquePhases.values());
  }

  @computed
  get filteredBountyCards() {
    return this.bountyCards.filter((card: BountyCard) => {
      const searchMatch =
      !this.searchText ||
      [card.title, card.features?.name, card.phase?.name].some(
        (field: string | undefined) =>
          field?.toLowerCase().includes(this.searchText.toLowerCase().trim())
      );

      const featureMatch =
        this.selectedFeatures.length === 0 ||
        (this.selectedFeatures.includes('no-feature') && !card.features?.uuid) ||
        (card.features?.uuid && this.selectedFeatures.includes(card.features.uuid));

      const phaseMatch =
        this.selectedPhases.length === 0 ||
        (card.phase && this.selectedPhases.includes(card.phase.uuid));

      const statusMatch =
        this.selectedStatuses.length === 0 ||
        (card.status && this.selectedStatuses.includes(card.status));

      return searchMatch && featureMatch && phaseMatch && statusMatch;
    });
  }

  @computed
  get hasCardsWithoutFeatures() {
    return this.bountyCards.some((card: BountyCard) => !card.features?.uuid);
  }

  @action
  setSearchText(text: string) {
    this.searchText = text.trim();
    this.saveFilterState();
  }

  @action
  clearSearch() {
    this.searchText = '';
    this.saveFilterState();
  }

  private sanitizeSearchText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s-]/g, '')
      .trim();
  }
}

export const useBountyCardStore = (workspaceId: string) =>
  useMemo(() => new BountyCardStore(workspaceId), [workspaceId]);

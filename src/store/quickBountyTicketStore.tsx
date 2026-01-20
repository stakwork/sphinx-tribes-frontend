```
import { makeAutoObservable } from 'mobx';
import { mainStore } from './main.ts';
import { QuickBountyItem, QuickTicketItem } from './interface.ts';

type QuickStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'PAID';

export interface QuickBountyTicket {
  ID: string;
  bountyTicket: 'bounty' | 'ticket';
  featureID: string;
  phaseID: string;
  Title: string;
  status: QuickStatus;
  assignedAlias: string | null;
  bountyID?: number;
  ticketUUID?: string;
}

class QuickBountyTicketStore {
  quickBountyTickets: QuickBountyTicket[] = [];
  expandedPhases: { [key: string]: boolean } = {};

  constructor() {
    makeAutoObservable(this);
    this.loadExpandedStates();
  }

  private loadExpandedStates() {
    try {
      const savedState = localStorage.getItem('expandedPhases');
      if (savedState) {
        this.expandedPhases = JSON.parse(savedState);
      }
    } catch (error) {
      console.error('Error loading expanded states:', error);
    }
  }

  setPhaseExpanded(phaseId: string, expanded: boolean) {
    this.expandedPhases[phaseId] = expanded;
    this.saveExpandedStates();
  }

  private saveExpandedStates() {
    try {
      localStorage.setItem('expandedPhases', JSON.stringify(this.expandedPhases));
    } catch (error) {
      console.error('Error saving expanded states:', error);
    }
  }

  async fetchAndSetQuickData(featureUUID: string) {
    try {
      const bounties = await mainStore.fetchQuickBounties(featureUUID);
      const tickets = await mainStore.fetchQuickTickets(featureUUID);

      const processedData: QuickBountyTicket[] = [];

      if (bounties) {
        for (const phase in bounties.phases) {
          bounties.phases[phase].forEach((item: QuickBountyItem) => {
            processedData.push({
              ID: item.bountyID.toString(),
              bountyTicket: 'bounty',
              featureID: bounties.featureID,
              phaseID: item.phaseID || '',
              Title: item.bountyTitle,
              status: item.status as QuickStatus,
              assignedAlias: item.assignedAlias || null,
              bountyID: item.bountyID
            });
          });
        }
      }

      if (tickets) {
        for (const phase in tickets.phases) {
          tickets.phases[phase].forEach((item: QuickTicketItem) => {
            processedData.push({
              ID: item.ticketUUID.toString(),
              bountyTicket: 'ticket',
              featureID: tickets.featureID,
              phaseID: item.phaseID || '',
              Title: item.ticketTitle,
              status: item.status as QuickStatus,
              assignedAlias: item.assignedAlias || null,
              ticketUUID: item.ticketUUID
            });
          });
        }
      }

      return (this.quickBountyTickets = processedData);
    } catch (error) {
      console.error('Failed to fetch quick bounty and ticket data:', error);
    }
  }
}

export const quickBountyTicketStore = new QuickBountyTicketStore();
```
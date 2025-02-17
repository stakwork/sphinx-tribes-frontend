import { makeAutoObservable } from 'mobx';
import { mainStore } from './main.ts';
import { QuickBountyItem, QuickTicketItem } from './interface.ts';

type QuickStatus = 'ToDo' | 'In Progress' | 'In Review' | 'Paid';

export interface QuickBountyTicket {
  ID: string;
  bountyTicket: 'bounty' | 'ticket';
  featureID: string;
  phaseID: string;
  Title: string;
  status: QuickStatus;
  assignedAlias: string | null;
}

class QuickBountyTicketStore {
  quickBountyTickets: QuickBountyTicket[] = [];

  constructor() {
    makeAutoObservable(this);
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
              assignedAlias: item.assignedAlias || null
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
              assignedAlias: item.assignedAlias || null
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

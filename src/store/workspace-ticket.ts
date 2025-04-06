import { makeAutoObservable } from 'mobx';
import { Ticket } from './interface';

interface GroupTickets {
  [ticket_group: string]: Ticket[];
}

export class WorkspaceTicketStore {
  tickets: Map<string, Ticket> = new Map();
  groupTickets: GroupTickets = {};

  constructor() {
    makeAutoObservable(this);
  }

  addTicket(ticket: Ticket) {
    const uuid = ticket.UUID || ticket.uuid;
    const processedTicket = { ...ticket, uuid };

    this.tickets.set(uuid, processedTicket);

    const groupId = ticket.ticket_group || ticket.uuid;
    const currentGroupTickets = this.groupTickets[groupId] || [];
    this.groupTickets[groupId] = [...currentGroupTickets, processedTicket];
  }

  updateTicket(uuid: string, ticketUpdate: Partial<Ticket>) {
    const existingTicket = this.tickets.get(uuid);
    if (existingTicket) {
      const updatedTicket = { ...existingTicket, ...ticketUpdate } as Ticket;

      this.tickets.set(uuid, updatedTicket);

      const groupId = existingTicket.ticket_group || existingTicket.uuid;
      const groupTickets = this.groupTickets[groupId] || [];

      const updatedGroupTickets = groupTickets.map((t: Ticket) =>
        t.uuid === uuid ? updatedTicket : t
      );

      this.groupTickets[groupId] = updatedGroupTickets.sort(
        (a: Ticket, b: Ticket) => (b.version || 0) - (a.version || 0)
      );
    }
  }

  getTicket(uuid: string): Ticket | undefined {
    return this.tickets.get(uuid);
  }

  getTicketsByGroup(groupId: string): Ticket[] {
    return this.groupTickets[groupId] || [];
  }

  getLatestVersionFromGroup(groupId: string): Ticket | undefined {
    const ticketsInGroup = this.getTicketsByGroup(groupId);
    if (ticketsInGroup.length === 0) return undefined;

    return ticketsInGroup.reduce((latest: Ticket, current: Ticket) =>
      current.version > latest.version ? current : latest
    );
  }

  clearTickets() {
    this.tickets.clear();
    this.groupTickets = {};
  }

  organizeTicketsByGroup(tickets: Ticket[]): Ticket[] {
    const groupedTickets = tickets.reduce(
      (groups: Record<string, Ticket[]>, ticket: Ticket) => {
        const group = ticket.ticket_group || ticket.uuid;
        if (!groups[group]) {
          groups[group] = [];
        }
        groups[group].push(ticket);
        return groups;
      },
      {} as Record<string, Ticket[]>
    );

    return Object.values(groupedTickets).map((groupTickets: Ticket[]) =>
      groupTickets.reduce((latest: Ticket, current: Ticket) =>
        (current.version || 0) > (latest.version || 0) ? current : latest
      )
    );
  }
}

export const workspaceTicketStore = new WorkspaceTicketStore();

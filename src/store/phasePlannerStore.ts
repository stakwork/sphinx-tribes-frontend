import { makeAutoObservable } from 'mobx';
import { Ticket } from './interface';

export class PhasePlannerStore {
  tickets: Map<string, Ticket> = new Map();

  constructor() {
    makeAutoObservable(this);
  }

  addTicket(ticket: Ticket) {
    this.tickets.set(ticket.uuid, ticket);
  }

  updateTicket(uuid: string, ticketUpdate: Partial<Ticket>) {
    const existingTicket = this.tickets.get(uuid);
    if (existingTicket) {
      this.tickets.set(uuid, { ...existingTicket, ...ticketUpdate });
    }
  }

  getTicket(uuid: string): Ticket | undefined {
    return this.tickets.get(uuid);
  }

  setTickets(tickets: Ticket[]) {
    this.tickets.clear();
    tickets.forEach((ticket: Ticket) => this.tickets.set(ticket.uuid, ticket));
  }
}

export const phasePlannerStore = new PhasePlannerStore();

import { makeAutoObservable } from 'mobx';
import { Ticket } from './interface';

interface PhaseTickets {
  [phase_uuid: string]: Ticket[];
}

export interface TicketStore {
  tickets: Map<string, Ticket>;
  phaseTickets: PhaseTickets;

  addTicket: (ticket: Ticket) => void;
  updateTicket: (uuid: string, ticket: Partial<Ticket>) => void;
  getTicket: (uuid: string) => Ticket | undefined;
  getPhaseTickets: (phase_uuid: string) => Ticket[];
}

export class PhaseTicketStore implements TicketStore {
  tickets: Map<string, Ticket> = new Map();
  phaseTickets: PhaseTickets = {};

  constructor() {
    makeAutoObservable(this);
  }

  addTicket(ticket: Ticket) {
    this.tickets.set(ticket.uuid, ticket);

    const phaseTickets = this.phaseTickets[ticket.phase_uuid] || [];
    this.phaseTickets[ticket.phase_uuid] = [...phaseTickets, ticket];
  }

  updateTicket(uuid: string, ticketUpdate: Partial<Ticket>) {
    const existingTicket = this.tickets.get(uuid);
    if (existingTicket) {
      const updatedTicket = { ...existingTicket, ...ticketUpdate } as Ticket;

      this.tickets.set(uuid, updatedTicket);

      const phaseTickets = this.phaseTickets[existingTicket.phase_uuid] || [];
      this.phaseTickets[existingTicket.phase_uuid] = phaseTickets.map((t: Ticket) =>
        t.uuid === uuid ? updatedTicket : t
      );
    }
  }

  getTicket(uuid: string): Ticket | undefined {
    return this.tickets.get(uuid);
  }

  getPhaseTickets(phase_uuid: string): Ticket[] {
    return this.phaseTickets[phase_uuid] || [];
  }
}

export const phaseTicketStore = new PhaseTicketStore();

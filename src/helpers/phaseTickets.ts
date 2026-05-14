import type { Ticket } from 'store/interface';

type PhaseTicketEnvelope = Ticket[] | { tickets?: Ticket[]; data?: Ticket[] } | undefined;
type PhaseTicketWithFallbacks = Ticket & { ID?: string; id?: string; number?: number };

export function extractPhaseTickets(payload: PhaseTicketEnvelope): Ticket[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.tickets)) return payload.tickets;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

export function normalizePhaseTicket(
  ticket: PhaseTicketWithFallbacks,
  feature_uuid: string,
  phase_uuid: string,
  fallbackSequence: number
): Ticket | undefined {
  const uuid = ticket.uuid || ticket.UUID || ticket.ticketUUID || ticket.ID || ticket.id;
  if (!uuid) return undefined;

  const apiSequence = Number(ticket.sequence);
  const apiNumber = Number(ticket.number);
  const sequence = Number.isFinite(apiSequence)
    ? apiSequence
    : Number.isFinite(apiNumber)
      ? apiNumber
      : fallbackSequence;

  return {
    ...ticket,
    uuid,
    feature_uuid: ticket.feature_uuid || feature_uuid,
    phase_uuid: ticket.phase_uuid || phase_uuid,
    ticket_group: ticket.ticket_group || uuid,
    sequence
  };
}

import { extractPhaseTickets, normalizePhaseTicket } from '../phaseTickets';
import type { Ticket } from 'store/interface';

const baseTicket: Ticket = {
  uuid: 'ticket-1',
  feature_uuid: 'feature-1',
  phase_uuid: 'phase-1',
  name: 'Planner ticket',
  sequence: 1,
  description: 'Ticket description',
  status: 'DRAFT',
  version: 1
};

describe('phase ticket helpers', () => {
  describe('extractPhaseTickets', () => {
    it('returns a raw ticket array', () => {
      expect(extractPhaseTickets([baseTicket])).toEqual([baseTicket]);
    });

    it('returns wrapped tickets from tickets or data keys', () => {
      expect(extractPhaseTickets({ tickets: [baseTicket] })).toEqual([baseTicket]);
      expect(extractPhaseTickets({ data: [baseTicket] })).toEqual([baseTicket]);
    });

    it('returns an empty list for missing or unexpected payloads', () => {
      expect(extractPhaseTickets(undefined)).toEqual([]);
      expect(extractPhaseTickets({})).toEqual([]);
    });
  });

  describe('normalizePhaseTicket', () => {
    it('normalizes UUID and missing phase fields before storing the ticket', () => {
      const normalized = normalizePhaseTicket(
        {
          ...baseTicket,
          uuid: '',
          UUID: 'api-ticket-1',
          feature_uuid: '',
          phase_uuid: '',
          ticket_group: '',
          sequence: Number.NaN,
          number: 4
        },
        'feature-2',
        'phase-2',
        9
      );

      expect(normalized).toMatchObject({
        uuid: 'api-ticket-1',
        feature_uuid: 'feature-2',
        phase_uuid: 'phase-2',
        ticket_group: 'api-ticket-1',
        sequence: 4
      });
    });

    it('returns undefined when no usable ticket id is present', () => {
      expect(
        normalizePhaseTicket(
          {
            ...baseTicket,
            uuid: '',
            ticketUUID: '',
            UUID: ''
          },
          'feature-1',
          'phase-1',
          1
        )
      ).toBeUndefined();
    });
  });
});

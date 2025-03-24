import { mainStore } from '../main';
import { quickBountyTicketStore } from '../quickBountyTicketStore.tsx';

jest.mock('../main', () => ({
  mainStore: {
    fetchQuickBounties: jest.fn(),
    fetchQuickTickets: jest.fn()
  }
}));

describe('QuickBountyTicketStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with an empty quickBountyTickets array', () => {
    expect(quickBountyTicketStore.quickBountyTickets).toEqual([]);
  });

  it('should load phase states from localStorage', () => {
    localStorage.setItem('phaseStates', JSON.stringify({ phase1: true }));
    quickBountyTicketStore.loadPhaseStates();
    expect(quickBountyTicketStore.phaseStates).toEqual({ phase1: true });
  });

  it('should toggle phase state and update localStorage', () => {
    quickBountyTicketStore.togglePhaseState('phase12');
    expect(quickBountyTicketStore.phaseStates['phase12']).toBe(true);
    expect(JSON.parse(localStorage.getItem('phaseStates')!)).toMatchObject({ phase12: true });

    quickBountyTicketStore.togglePhaseState('phase12');
    expect(quickBountyTicketStore.phaseStates['phase12']).toBe(false);
    expect(JSON.parse(localStorage.getItem('phaseStates')!)).toMatchObject({ phase12: false });
  });

  it('should fetch and process quick bounty and ticket data', async () => {
    (mainStore.fetchQuickBounties as jest.Mock).mockResolvedValue({
      featureID: 'feature-1',
      phases: {
        phase1: [
          {
            bountyID: 123,
            bountyTitle: 'Bounty 1',
            phaseID: 'phase1',
            status: 'TODO',
            assignedAlias: 'user1'
          }
        ]
      }
    });

    (mainStore.fetchQuickTickets as jest.Mock).mockResolvedValue({
      featureID: 'feature-1',
      phases: {
        phase2: [
          {
            ticketUUID: 'abc-123',
            ticketTitle: 'Ticket 1',
            phaseID: 'phase2',
            status: 'IN_PROGRESS',
            assignedAlias: null
          }
        ]
      }
    });

    await quickBountyTicketStore.fetchAndSetQuickData('feature-1');

    expect(quickBountyTicketStore.quickBountyTickets).toEqual([
      {
        ID: '123',
        bountyTicket: 'bounty',
        featureID: 'feature-1',
        phaseID: 'phase1',
        Title: 'Bounty 1',
        status: 'TODO',
        assignedAlias: 'user1',
        bountyID: 123
      },
      {
        ID: 'abc-123',
        bountyTicket: 'ticket',
        featureID: 'feature-1',
        phaseID: 'phase2',
        Title: 'Ticket 1',
        status: 'IN_PROGRESS',
        assignedAlias: null,
        ticketUUID: 'abc-123'
      }
    ]);
  });
});

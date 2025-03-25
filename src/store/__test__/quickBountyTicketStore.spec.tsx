import { waitFor } from '@testing-library/react';
import { quickBountyTicketStore } from '../quickBountyTicketStore';

describe('QuickBountyTicketStore', () => {
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    localStorageMock = {};

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key) => localStorageMock[key]),
        setItem: jest.fn((key, value) => {
          localStorageMock[key] = value;
        }),
        removeItem: jest.fn((key) => delete localStorageMock[key]),
        clear: jest.fn(() => {
          localStorageMock = {};
        })
      },
      writable: true
    });

    quickBountyTicketStore.quickBountyTickets = [];
    quickBountyTicketStore.expandedPhases = {};
  });

  describe('initialization', () => {
    it('should initialize with empty quickBountyTickets', () => {
      expect(quickBountyTicketStore.quickBountyTickets).toEqual([]);
    });

    it('should initialize with empty expandedPhases', () => {
      expect(quickBountyTicketStore.expandedPhases).toEqual({});
    });

    it('should load expanded states from localStorage if available', () => {
      const savedState = { 'phase-1': true, 'phase-2': false };
      localStorageMock['expandedPhases'] = JSON.stringify(savedState);

      (quickBountyTicketStore as any).loadExpandedStates();

      expect(quickBountyTicketStore.expandedPhases).toEqual(savedState);
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorageMock['expandedPhases'] = 'invalid-json';

      (quickBountyTicketStore as any).loadExpandedStates();

      expect(quickBountyTicketStore.expandedPhases).toEqual({});
    });
  });

  describe('setPhaseExpanded', () => {
    it('should update expanded state for a phase', () => {
      quickBountyTicketStore.setPhaseExpanded('phase-1', true);

      expect(quickBountyTicketStore.expandedPhases['phase-1']).toBe(true);
    });

    it('should save to localStorage when updating state', () => {
      quickBountyTicketStore.setPhaseExpanded('phase-1', true);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'expandedPhases',
        JSON.stringify({ 'phase-1': true })
      );
    });

    it('should handle multiple phase states', () => {
      quickBountyTicketStore.setPhaseExpanded('phase-1', true);
      quickBountyTicketStore.setPhaseExpanded('phase-2', false);

      expect(quickBountyTicketStore.expandedPhases).toEqual({
        'phase-1': true,
        'phase-2': false
      });
    });
  });

  describe('fetchAndSetQuickData', () => {
    const mockBounties = {
      featureID: 'feature-1',
      phases: {
        'phase-1': [
          {
            bountyID: 1,
            phaseID: 'phase-1',
            bountyTitle: 'Test Bounty',
            status: 'TODO',
            assignedAlias: 'tester'
          }
        ]
      }
    };

    const mockTickets = {
      featureID: 'feature-1',
      phases: {
        'phase-1': [
          {
            ticketUUID: 'ticket-1',
            phaseID: 'phase-1',
            ticketTitle: 'Test Ticket',
            status: 'TODO',
            assignedAlias: 'tester'
          }
        ]
      }
    };

    beforeEach(() => {
      const mainStore = {
        fetchQuickBounties: jest.fn().mockResolvedValue(mockBounties),
        fetchQuickTickets: jest.fn().mockResolvedValue(mockTickets)
      };
      quickBountyTicketStore['main'] = mainStore;
    });

    it('should fetch and process bounties and tickets', async () => {
      const result = await quickBountyTicketStore.fetchAndSetQuickData('feature-1');

      waitFor(() => {
        expect(result).toHaveLength(2);
        expect(result?.find((item) => item.bountyTicket === 'bounty')).toBeTruthy();
        expect(result?.find((item) => item.bountyTicket === 'ticket')).toBeTruthy();
      });
    });

    it('should handle empty response', async () => {
      quickBountyTicketStore['main'].fetchQuickBounties.mockResolvedValue(null);
      quickBountyTicketStore['main'].fetchQuickTickets.mockResolvedValue(null);

      const result = await quickBountyTicketStore.fetchAndSetQuickData('feature-1');

      expect(result).toEqual([]);
    });

    it('should handle fetch errors', async () => {
      quickBountyTicketStore['main'].fetchQuickBounties.mockRejectedValue(
        new Error('Fetch failed')
      );

      const result = await quickBountyTicketStore.fetchAndSetQuickData('feature-1');

      waitFor(() => {
        expect(result).toBeUndefined();
      });
    });
  });
});

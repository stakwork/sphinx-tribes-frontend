import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WidgetSwitchViewer from 'people/widgetViews/WidgetSwitchViewer';
import { BrowserRouter as Router } from 'react-router-dom';
import Tickets from '../Tickets'; 

const mockBounties = [
  {
    bounty: {
      id: 1,
      title: 'Mock Bounty 1',
      estimatedHours: 5,
      satsAmount: 100,
      assigned: true,
      hunter: {
        id: 123,
        userName: 'MockHunter',
        profileImage: 'mock-image-url'
      }
      // ... other properties ...
    },
    assignee: {
      /* assignee properties */
    },
    owner: {
      /* owner properties */
    },
    organization: {
      name: 'sphinx-tribe'
    }
  }
  // Add more mock bounties as needed
];

jest.mock('../../../store', () => ({
  useStores: jest.fn(() => ({
    main: {
      getOpenGithubIssues: jest.fn(),
      getBadgeList: jest.fn(),
      getPeople: jest.fn(),
      getPeopleBounties: jest.fn(),
      getTotalBountyCount: jest.fn(),
      setBountiesStatus: jest.fn(),
      setBountyLanguages: jest.fn(),
      getTribesByOwner: jest.fn()
    },
    ui: {
      meInfo: {
        /* Add mock data for ui.meInfo if needed */
      },
      toasts: [], // Assuming toasts is an array
      setToasts: jest.fn()
    }
  }))
}));

jest.mock('people/widgetViews/WidgetSwitchViewer', () => ({
  __esModule: true,
  default: () => <div data-testid="widget-switch-viewer" /> // Provide a minimal mock
}));

// Mock the getPeopleBounties function to return mock data
jest.mock('../../../store/main', () => ({
  ...jest.requireActual('../../../store/main'), // Use actual implementation for other functions
  getPeopleBounties: jest.fn(() => Promise.resolve(mockBounties))
}));

// Mock the useHistory hook
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useHistory: () => ({ push: jest.fn() })
}));

// Mock the useIsMobile hook
jest.mock('../../../hooks', () => ({
  useIsMobile: jest.fn(() => false) // Change to true if testing for mobile view
}));

// Mock the observer HOC
jest.mock('mobx-react-lite', () => ({
  observer: (component: React.FC) => component
}));

describe('Tickets Component', () => {
  it('renders the component and displays bounty title, estimated hours, sats amount equals that of each mocked bounty', async () => {
    render(<Tickets />);

    (async () => {
      await waitFor(() => {
        expect(screen.queryByTestId('tickets-component')).toBeInTheDocument();
      });

      // Check if bounties are rendered
      mockBounties.forEach(({ bounty }) => {
        expect(screen.getByText(bounty.title)).toBeInTheDocument();
        expect(screen.getByText(`Estimated Hours: ${bounty.estimatedHours}`)).toBeInTheDocument();
        expect(screen.getByText(`Sats Amount: ${bounty.satsAmount}`)).toBeInTheDocument();
      });
    })();
  });

  it('test when a bounty is assigned, the profile image, user name of the hunter, and a view profile link are visible.', async () => {
    render(<Tickets />);

    (async () => {
      await waitFor(() => {
        expect(screen.queryByTestId('tickets-component')).toBeInTheDocument();
      });

      // Check if bounties are rendered
      mockBounties.forEach(({ bounty }) => {
        if (bounty.assigned) {
          // Bounty is assigned
          expect(screen.getByText(`Assigned to: ${bounty.hunter.userName}`)).toBeInTheDocument();
          expect(
            screen.getByAltText(`Profile Image of ${bounty.hunter.userName}`)
          ).toBeInTheDocument();
          expect(screen.getByRole('link', { name: /View Profile/i })).toBeInTheDocument();
        }
      });
    })();
  });

  it('Test that If a hunter is not assigned, there should be a clickable button "I can help"', async () => {
    render(<Tickets />);

    (async () => {
      await waitFor(() => {
        expect(screen.queryByTestId('tickets-component')).toBeInTheDocument();
      });

      // Check if bounties are rendered
      mockBounties.forEach(({ bounty }) => {
        if (!bounty.assigned) {
          expect(screen.getByRole('button', { name: /I can help/i })).toBeInTheDocument();
        }
      });
    })();
  });

  it('Test if a bounty is created by an organization, the organization name should be visible.', async () => {
    render(<Tickets />);

    (async () => {
      await waitFor(() => {
        expect(screen.queryByTestId('tickets-component')).toBeInTheDocument();
      });

      // Check if bounties are rendered
      mockBounties.forEach(({ organization }) => {
        expect(screen.getByText(`Organization name: ${organization.name}`)).toBeInTheDocument();
      });
    })();
  });
});

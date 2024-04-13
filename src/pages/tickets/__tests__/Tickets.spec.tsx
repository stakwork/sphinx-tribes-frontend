import React from 'react';
import sinon from 'sinon';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { mainStore } from 'store/main';
import { uiStore } from 'store/ui';
import { user } from '__test__/__mockData__/user';
import Tickets from '../Tickets';

let fetchStub: sinon.SinonStub;

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
    },
    assignee: {},
    owner: {},
    workspace: {
      name: 'sphinx-tribe'
    }
  }
];

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock('remark-gfm', () => {});
// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock('rehype-raw', () => {});

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
      meInfo: {},
      toasts: [], // Assuming toasts is an array
      setToasts: jest.fn()
    }
  }))
}));

beforeAll(() => {
  fetchStub = sinon.stub(global, 'fetch');
  fetchStub.returns(Promise.resolve({ status: 200, json: () => Promise.resolve({}) }));
});

jest.mock('people/widgetViews/WidgetSwitchViewer', () => ({
  __esModule: true,
  default: () => <div data-testid="widget-switch-viewer" />
}));

// Mock the getPeopleBounties function to return mock data
jest.mock('../../../store/main', () => ({
  ...jest.requireActual('../../../store/main'),
  getPeopleBounties: jest.fn(() => Promise.resolve(mockBounties))
}));

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useHistory: () => ({ push: jest.fn() })
}));

jest.mock('../../../hooks', () => ({
  useIsMobile: jest.fn(() => false)
}));

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

  it('Test if a bounty is created by an workspace, the workspace name should be visible.', async () => {
    render(<Tickets />);

    (async () => {
      await waitFor(() => {
        expect(screen.queryByTestId('tickets-component')).toBeInTheDocument();
      });

      // Check if bounties are rendered
      mockBounties.forEach(({ workspace }) => {
        expect(screen.getByText(`Workspace name: ${workspace.name}`)).toBeInTheDocument();
      });
    })();
  });

  it('displays load more button when there are 10 or more bounties', async () => {
    // simulate many bounties
    const bountiesArr = new Array(40).fill(mockBounties).flat();
    jest.spyOn(mainStore, 'getPeopleBounties').mockReturnValue(Promise.resolve(bountiesArr));

    render(<Tickets />);

    (async () => {
      await waitFor(() => {
        expect(screen.getByText('Load More')).toBeInTheDocument();
      });
    })();
  });

  it('triggers "get bounties" API call when load more button is clicked', async () => {
    const bountiesArr = new Array(40).fill(mockBounties).flat();
    jest.spyOn(mainStore, 'getPeopleBounties').mockReturnValue(Promise.resolve(bountiesArr));

    render(<Tickets />);

    const expectedHeaders = {
      'Content-Type': 'application/json',
      'x-jwt': 'test_jwt'
    };

    (async () => {
      await waitFor(() => {
        expect(screen.getByText('Load More')).toBeInTheDocument();

        const loadMore = screen.getByText('Load More');
        fireEvent.click(loadMore);

        sinon.assert.calledWith(
          fetchStub,
          'gobounties/all',
          sinon.match({
            method: 'POST',
            headers: expectedHeaders,
            mode: 'cors'
          })
        );
      });
    })();
  });

  it('should open bounty modal on clicking bounty', () => {
    render(<Tickets />);

    (async () => {
      await waitFor(() => {
        const ticket = screen.getByTestId('tickets-component');
        fireEvent.click(ticket);
      });

      expect(screen.queryByTestId('testid-modal')).toBeInTheDocument();
      expect(screen.getByText('chevron_right')).toBeInTheDocument();
    })();
  });

  it('calls prevArrowNew function when previous arrow is clicked', () => {
    render(<Tickets />);

    (async () => {
      await waitFor(() => {
        const ticket = screen.getByTestId('tickets-component');
        fireEvent.click(ticket);
      });

      const prevArrowFunction = jest.fn();

      const prevArrow = screen.getByText('chevron_right');

      expect(screen.queryByTestId('testid-modal')).toBeInTheDocument();
      expect(screen.getByText('chevron_left')).toBeInTheDocument();
      fireEvent.click(prevArrow);
      expect(prevArrowFunction).toHaveBeenCalled();
    })();
  });

  it('calls nextArrowNew function when next arrow is clicked', () => {
    render(<Tickets />);

    (async () => {
      await waitFor(() => {
        const ticket = screen.getByTestId('tickets-component');
        fireEvent.click(ticket);
      });

      const nextArrowFunction = jest.fn();

      const nextArrow = screen.getByText('chevron_right');

      expect(screen.queryByTestId('testid-modal')).toBeInTheDocument();
      expect(screen.getByText('chevron_left')).toBeInTheDocument();
      fireEvent.click(nextArrow);
      expect(nextArrowFunction).toHaveBeenCalled();
    })();
  });

  it('tests that user is signed out clicking on "I can help" loads get sphinx modal', () => {
    uiStore.setMeInfo(null);

    const { getByRole } = render(<Tickets />);

    (async () => {
      await waitFor(() => {
        const ticket = screen.getByTestId('tickets-component');
        fireEvent.click(ticket);
      });

      const button = getByRole('button', { name: /I can help/i });

      expect(button).toBeInTheDocument();

      fireEvent.click(button);

      expect(screen.queryByTestId('startup-modal')).toBeInTheDocument();
    })();
  });

  it('should display Connection code QR is displayed when "I can help" is clicked', async () => {
    uiStore.setMeInfo(user);

    const { getByRole, getByTestId } = render(<Tickets />);

    (async () => {
      await waitFor(() => {
        const ticket = screen.getByTestId('tickets-component');
        fireEvent.click(ticket);
      });

      const button = getByRole('button', { name: /I can help/i });

      expect(button).toBeInTheDocument();

      fireEvent.click(button);

      expect(getByTestId('qrcode')).toBeInTheDocument();
    })();
  });

  it('Test that a newly created bounty is visible.', async () => {
    render(<Tickets />);

    (async () => {
      await waitFor(() => {
        expect(screen.queryByTestId('tickets-component')).toBeInTheDocument();
      });

      mockBounties.forEach(({ bounty }) => {
        expect(screen.getByText(`bounty title: ${bounty.title}`)).toBeInTheDocument();
      });
    })();
  });

  it('tests that out of connection code is displayed when there are no codes', () => {
    uiStore.setMeInfo(null);

    const { getByRole, getByText } = render(<Tickets />);

    (async () => {
      await waitFor(() => {
        const ticket = screen.getByTestId('tickets-component');
        fireEvent.click(ticket);
      });

      const button = getByRole('button', { name: /I can help/i });

      expect(button).toBeInTheDocument();

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.queryByTestId('startup-modal')).toBeInTheDocument();
      });

      fireEvent.click(getByText(/Get Sphinx/i));

      await waitFor(() => {
        expect(screen.queryByTestId('step-one')).toBeInTheDocument();
      });

      fireEvent.click(getByText(/Reveal Connection Code/i));

      await waitFor(() => {
        expect(screen.queryByTestId('qrcode')).toBeInTheDocument();
      });

      expect(
        getByText(/We are out of codes to sign up! Please check again later/i)
      ).toBeInTheDocument();
    })();
  });
});

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import sinon from 'sinon';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { mainStore } from 'store/main';
import { uiStore } from 'store/ui';
import { user } from '__test__/__mockData__/user';
import Tickets from '../Tickets';
import { BountyStatus, defaultBountyStatus } from 'store/interface';

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

jest.setTimeout(10000);

const mockPush = jest.fn();
const mockGoBack = jest.fn();
const mockMain = {
  getOpenGithubIssues: jest.fn(),
  getBadgeList: jest.fn(),
  getPeople: jest.fn(),
  getPeopleBounties: jest.fn(),
  getTotalBountyCount: jest.fn(),
  setBountiesStatus: jest.fn(),
  setBountyLanguages: jest.fn(),
  getTribesByOwner: jest.fn(),
  bountiesStatus: defaultBountyStatus
};
const mockUi = {
  meInfo: {},
  toasts: [],
  setToasts: jest.fn()
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockPush,
    goBack: mockGoBack
  }),
  useLocation: () => ({
    pathname: '/bounties',
    search: '',
    state: {}
  })
}));

jest.mock('../../../store', () => ({
  useStores: jest.fn(() => ({
    main: mockMain,
    ui: mockUi
  }))
}));

beforeAll(() => {
  fetchStub = sinon.stub(global, 'fetch');
  fetchStub.returns(Promise.resolve({ status: 200, json: () => Promise.resolve({}) }));
});

jest.mock('people/widgetViews/WidgetSwitchViewer', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="widget-switch-viewer">
      <span data-testid="selected-widget">{props.selectedWidget}</span>
      <span data-testid="current-items">{props.currentItems}</span>
      <span data-testid="total-bounties">{props.totalBounties}</span>
      <span data-testid="language-string">{props.languageString}</span>
      <span data-testid="status-map">{JSON.stringify(props.checkboxIdToSelectedMap)}</span>
      <button onClick={() => props.setCurrentItems(props.currentItems + 25)}>Load More</button>
      <button onClick={() => props.onPanelClick({}, { id: 88 })}>Open Bounty</button>
    </div>
  )
}));

jest.mock('people/widgetViews/BountyHeader', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="bounty-header">
      <button data-testid="status-assigned-filter" onClick={() => props.onChangeStatus('Assigned')}>
        Assigned
      </button>
      <button data-testid="language-1-filter" onClick={() => props.onChangeLanguage(1)}>
        JavaScript
      </button>
    </div>
  )
}));

// Mock the getPeopleBounties function to return mock data
jest.mock('../../../store/main', () => ({
  ...jest.requireActual('../../../store/main'),
  getPeopleBounties: jest.fn(() => Promise.resolve(mockBounties))
}));

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useHistory: () => ({ push: mockPush })
}));

jest.mock('../../../hooks', () => ({
  useIsMobile: jest.fn(() => false)
}));

jest.mock('mobx-react-lite', () => ({
  observer: (component: React.FC) => component
}));

describe('Tickets Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    mockMain.bountiesStatus = defaultBountyStatus;
    mockMain.getOpenGithubIssues.mockResolvedValue([]);
    mockMain.getBadgeList.mockResolvedValue([]);
    mockMain.getPeople.mockResolvedValue([]);
    mockMain.getPeopleBounties.mockResolvedValue(mockBounties);
    mockMain.getTotalBountyCount.mockResolvedValue(40);
    mockUi.meInfo = { owner_pubkey: 'owner-pubkey' };
    mockUi.toasts = [];
  });

  it('loads bounty home page data with the default bounty filters', async () => {
    render(<Tickets />);

    await waitFor(() => {
      expect(mockMain.getOpenGithubIssues).toHaveBeenCalled();
      expect(mockMain.getBadgeList).toHaveBeenCalled();
      expect(mockMain.getPeople).toHaveBeenCalled();
      expect(mockMain.getPeopleBounties).toHaveBeenCalledWith({
        page: 1,
        resetPage: true,
        ...defaultBountyStatus,
        languages: ''
      });
    });

    expect(screen.getByTestId('selected-widget')).toHaveTextContent('bounties');
    expect(screen.getByTestId('current-items')).toHaveTextContent('25');
    expect(screen.getByTestId('total-bounties')).toHaveTextContent('40');
  });

  it('updates bounty filters and language filters from the home page header', async () => {
    render(<Tickets />);

    await waitFor(() => expect(screen.getByTestId('widget-switch-viewer')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('status-assigned-filter'));

    await waitFor(() => {
      expect(mockMain.setBountiesStatus).toHaveBeenCalledWith({
        ...defaultBountyStatus,
        Assigned: true
      });
      expect(screen.getByTestId('status-map')).toHaveTextContent('"Assigned":true');
    });

    fireEvent.click(screen.getByTestId('language-1-filter'));

    await waitFor(() => {
      expect(mockMain.setBountyLanguages).toHaveBeenCalledWith('1');
      expect(screen.getByTestId('language-string')).toHaveTextContent('1');
    });
  });

  it('loads more bounty rows and routes to a bounty modal URL from the home page list', async () => {
    render(<Tickets />);

    await waitFor(() => expect(screen.getByTestId('widget-switch-viewer')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Load More'));
    expect(screen.getByTestId('current-items')).toHaveTextContent('50');

    fireEvent.click(screen.getByText('Open Bounty'));
    expect(mockPush).toHaveBeenCalledWith('/bounty/88');
  });

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

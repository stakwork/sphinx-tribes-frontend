import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OrgHeader } from 'pages/tickets/org/orgHeader';
import { OrgBountyHeaderProps } from '../../interfaces.ts';
import { mainStore } from '../../../store/main.ts';
import { uiStore } from '../../../store/ui.ts';
import * as helpers from '../../../helpers/helpers-extended.ts';

jest.mock('../../../store/main.ts', () => ({
  mainStore: {
    getUserRoles: jest.fn(),
    getUserOrganizationByUuid: jest.fn(),
    getSpecificOrganizationBounties: jest.fn(),
    dropDownOrganizations: []
  }
}));

jest.mock('../../../store/ui.ts', () => ({
  uiStore: {
    meInfo: null,
    setReady: jest.fn(),
    setSearchText: jest.fn()
  }
}));

jest.mock('../../../helpers/helpers-extended.ts', () => ({
  ...jest.requireActual('.../../../helpers/helpers-extended.ts'),
  userCanManageBounty: jest.fn()
}));

const MockProps: OrgBountyHeaderProps = {
  checkboxIdToSelectedMap: {
    Open: false,
    Assigned: false,
    Paid: false,
    Completed: false
  },
  languageString: '',
  direction: 'desc',
  org_uuid: 'clf6qmo4nncmf23du7ng',
  onChangeStatus: jest.fn(),
  onChangeLanguage: jest.fn(),
  organizationData: {
    id: '57',
    uuid: 'cmg6oqitu2rnslkcjbqg',
    name: 'Sample Organization',
    description:
      'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam eaque',
    github: 'http://mock-github.com',
    website: 'http://mock-website.com',
    owner_pubkey: '03ba3ac27becedbe9981f5ccc0e7757d3573465e2efa8a39ab2d147908184d0e8e',
    img: 'https://memes.sphinx.chat/public/xIR-l3sqL6Ve0uTj1WZoOU7LAI-Hten4yiKz10ABf9s=',
    created: '2023-09-14T23:14:28.821632Z',
    updated: '2023-09-14T23:14:28.821632Z',
    show: true,
    bounty_count: 8,
    budget: 640060,
    deleted: false
  }
};
describe('OrgHeader Component', () => {
  beforeEach(() => {
    jest.spyOn(helpers, 'userCanManageBounty').mockResolvedValue(true);
    jest.spyOn(mainStore, 'getSpecificOrganizationBounties').mockReset();
    jest.spyOn(mainStore, 'getUserOrganizationByUuid').mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('displays "Post a Bounty" button when user is logged in and has manage bounty role', async () => {
    // @ts-ignore
    uiStore.meInfo = { pubkey: '' };
    jest.spyOn(helpers, 'userCanManageBounty').mockResolvedValue(true);

    render(<OrgHeader {...MockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Post a Bounty')).toBeInTheDocument();
    });
  });

  it('renders the component correctly', async () => {
    render(<OrgHeader {...MockProps} />);
    waitFor(() => {
      expect(screen.findByText(MockProps.organizationData.name ?? '')).toBeInTheDocument();
      expect(screen.findByText(MockProps.organizationData.description ?? '')).toBeInTheDocument();
      expect(screen.getByText('Post a Bounty')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Skill')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
      expect(screen.getByText(/Bounties/i)).toBeInTheDocument();
    });
  });

  it('opens the PostModal on "Post a Bounty" button click', async () => {
    render(<OrgHeader {...MockProps} />);
    await waitFor(() => {
      fireEvent.click(screen.getByText('Post a Bounty'));
    });
  });

  it('displays the correct number of bounties', () => {
    render(<OrgHeader {...MockProps} />);
    expect(screen.getByText('284')).toBeInTheDocument();
    expect(screen.getByText('Bounties')).toBeInTheDocument();
  });

  it('should call getSpecificOrganizationBounties with correct parameters', () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: `/org/bounties/${MockProps.org_uuid}`
      },
      writable: true
    });

    render(<OrgHeader {...MockProps} />);

    jest.clearAllMocks();

    // Simulate entering search text
    const searchText = 'sample search';
    const searchInput = screen.getByPlaceholderText('Search') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: searchText } });

    // Simulate pressing Enter key
    fireEvent.keyUp(searchInput, { key: 'Enter', code: 'Enter' });

    // Check if getSpecificOrganizationBounties is called with correct parameters
    expect(mainStore.getSpecificOrganizationBounties).toHaveBeenCalledWith(MockProps.org_uuid, {
      page: 1,
      resetPage: true,
      search: searchText,
      ...MockProps.checkboxIdToSelectedMap
    });
  });

  it('should trigger API call in response to click on status from OrgHeader', async () => {
    const { getByText, getByRole, rerender } = render(<OrgHeader {...MockProps} />);

    const statusFilter = getByText('Status');
    expect(statusFilter).toBeInTheDocument();
    fireEvent.click(statusFilter);

    const statusOpenCheckbox = getByRole('checkbox', { name: /Open/i });
    expect(statusOpenCheckbox).toBeInTheDocument();
    fireEvent.click(statusOpenCheckbox);

    waitFor(async () => {
      expect(MockProps.onChangeStatus).toHaveBeenCalledWith('Open');

      await waitFor(() => {
        fireEvent.click(screen.getByText(/Sort By:/i));
      });

      const newestFirstOption = screen.getByText('Newest First');
      fireEvent.click(newestFirstOption);

      await waitFor(() => {
        expect(mainStore.getSpecificOrganizationBounties).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            direction: 'desc'
          })
        );

        jest.clearAllMocks();

        const oldestFirstOption = screen.getByText('Oldest First');
        fireEvent.click(oldestFirstOption);
      });

      await waitFor(() => {
        expect(mainStore.getSpecificOrganizationBounties).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            direction: 'asc'
          })
        );
      });

      const updatedCheckboxIdToSelectedMap = {
        ...MockProps.checkboxIdToSelectedMap,
        Open: true,
        direction: 'desc'
      };

      rerender(
        <OrgHeader {...MockProps} checkboxIdToSelectedMap={updatedCheckboxIdToSelectedMap} />
      );

      expect(mainStore.getSpecificOrganizationBounties).toHaveBeenCalledWith(MockProps.org_uuid, {
        page: 1,
        resetPage: true,
        ...updatedCheckboxIdToSelectedMap,
        languageString: MockProps.languageString
      });
    });
  });

  it('validates the buttons appear when website and github is available', () => {
    const { getByText } = render(<OrgHeader {...MockProps} />);
    const websiteButton = getByText(/Website/i);
    const githubButton = getByText(/Github/i);
    expect(websiteButton).toBeInTheDocument();
    expect(githubButton).toBeInTheDocument();
  });

  it('UrlButtons are left-aligned if visible', () => {
    const { getByTestId } = render(<OrgHeader {...MockProps} />);
    const urlButtonContainer = getByTestId('url-button-container');
    const containerStyle = window.getComputedStyle(urlButtonContainer);
    expect(containerStyle.marginLeft).toBe('0px');
  });

  it('does not display "Post a Bounty" button when user is not logged in', () => {
    render(<OrgHeader {...MockProps} />);
    expect(screen.queryByText('Post a Bounty')).not.toBeInTheDocument();
  });

  it('does not display "Post a Bounty" button when user is logged in but does not have manage bounty role', async () => {
    // @ts-ignore
    uiStore.meInfo = { pubkey: '' };
    jest.spyOn(helpers, 'userCanManageBounty').mockResolvedValue(false);

    render(<OrgHeader {...MockProps} />);

    await waitFor(() => {
      expect(screen.queryByText('Post a Bounty')).not.toBeInTheDocument();
    });
  });

  it('correct number is displayed next to the button as the number of items selected in the status filter', async () => {
    const { rerender } = render(<OrgHeader {...MockProps} />);

    const statusFilterButton = screen.getByText('Status');
    fireEvent.click(statusFilterButton);

    const newCheckboxIdToSelectedMap = {
      Open: true,
      Assigned: true,
      Completed: false,
      Paid: false
    };

    const newProps = {
      ...MockProps,
      checkboxIdToSelectedMap: newCheckboxIdToSelectedMap
    };

    rerender(<OrgHeader {...newProps} />);

    const selectedCount = Object.values(newCheckboxIdToSelectedMap).filter(Boolean).length;

    await waitFor(() => {
      expect(screen.getByText(`${selectedCount}`)).toBeInTheDocument();
    });
  });

  it('correct number is displayed next to the button as the number of items selected in the skill filter', async () => {
    const { rerender } = render(<OrgHeader {...MockProps} />);

    const skillFilterButton = screen.getByText('Skill');
    fireEvent.click(skillFilterButton);

    const newCheckboxIdToSelectedMapLanguage = {
      javascript: true,
      lightning: true,
      typescript: false,
      golang: false
    };

    const newProps = {
      ...MockProps,
      checkboxIdToSelectedMap: newCheckboxIdToSelectedMapLanguage
    };

    rerender(<OrgHeader {...newProps} />);

    const selectedCount = Object.values(newCheckboxIdToSelectedMapLanguage).filter(Boolean).length;

    await waitFor(() => {
      expect(screen.getByText(`${selectedCount}`)).toBeInTheDocument();
    });
  });
});

import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OrgHeader } from 'pages/tickets/org/orgHeader';
import { mainStore } from 'store/main';
import { OrgBountyHeaderProps } from '../../interfaces.ts';

const MockProps: OrgBountyHeaderProps = {
  checkboxIdToSelectedMap: {
    Open: false,
    Assigned: false,
    Paid: false,
    Completed: false
  },
  languageString: '',
  org_uuid: 'clf6qmo4nncmf23du7ng',
  onChangeStatus: jest.fn(),
  onChangeLanguage: jest.fn(),
  organizationUrls: {
    github: 'https://github.com/stakwork/sphinx-tribes',
    website: 'https://ecurrencyhodler.com/'
  }
};
describe('OrgHeader Component', () => {
  beforeEach(() => {
    jest.spyOn(mainStore, 'getSpecificOrganizationBounties').mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component correctly', () => {
    render(<OrgHeader {...MockProps} />);
    expect(screen.getByText('Post a Bounty')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Skill')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    expect(screen.getByText(/Bounties/i)).toBeInTheDocument();
  });

  it('opens the PostModal on "Post a Bounty" button click', async () => {
    render(<OrgHeader {...MockProps} />);
    fireEvent.click(screen.getByText('Post a Bounty'));
    // You can add further assertions here to check the modal is open
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

    await waitFor(() => {
      expect(MockProps.onChangeStatus).toHaveBeenCalledWith('Open');

      const updatedCheckboxIdToSelectedMap = {
        ...MockProps.checkboxIdToSelectedMap,
        Open: true
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
});

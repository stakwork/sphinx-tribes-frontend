import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OrgHeader } from 'pages/tickets/org/orgHeader';
import { OrgBountyHeaderProps } from '../../interfaces.ts';
import { mainStore } from '../../../store/main.ts';

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
  organizationData: {
    id: '57',
    uuid: 'cmg6oqitu2rnslkcjbqg',
    name: 'Sample Organization',
    description: '',
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
    jest.spyOn(mainStore, 'getSpecificOrganizationBounties').mockReset();
    jest.spyOn(mainStore, 'getUserOrganizationByUuid').mockReset();
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

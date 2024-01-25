import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OrgHeader } from 'pages/tickets/org/orgHeader';
import { mainStore } from 'store/main';
import { OrgBountyHeaderProps } from '../../interfaces.ts';

const MockProps: OrgBountyHeaderProps = {
  organizationUrls: {
    github: 'https://github.com/stakwork/sphinx-tribes',
    website: 'https://ecurrencyhodler.com/'
  }
};

describe('OrgHeader Component', () => {
  beforeEach(() => {
    jest.spyOn(mainStore, 'getPeopleBounties').mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component correctly', () => {
    render(<OrgHeader {...MockProps} />);
    expect(screen.getByText('Post a Bounty')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Skill')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    expect(screen.getByText(/Bounties/i)).toBeInTheDocument();
  });

  it('opens the PostModal on "Post a Bounty" button click', async () => {
    render(<OrgHeader {...MockProps} />);
    fireEvent.click(screen.getByText('Post a Bounty'));
  });

  it('displays the correct number of bounties', () => {
    render(<OrgHeader {...MockProps} />);
    expect(screen.getByText('284')).toBeInTheDocument();
    expect(screen.getByText('Bounties')).toBeInTheDocument();
  });

  it('should call getPeopleBounties with correct parameters', () => {
    const orgUuid = 'cmkln4tm098m49vhlt80';
    Object.defineProperty(window, 'location', {
      value: {
        pathname: `/org/bounties/${orgUuid}`
      },
      writable: true
    });

    render(<OrgHeader {...MockProps} />);

    // Simulate entering search text
    const searchText = 'sample search';
    const searchInput = screen.getByPlaceholderText('Search') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: searchText } });

    // Simulate pressing Enter key
    fireEvent.keyUp(searchInput, { key: 'Enter', code: 'Enter' });

    // Check if getPeopleBounties is called with correct parameters
    expect(mainStore.getPeopleBounties).toHaveBeenCalledWith({
      page: 1,
      resetPage: true,
      search: searchText,
      org_uuid: orgUuid
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

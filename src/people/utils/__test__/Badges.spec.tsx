import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "testing-library/jest-dom";
import { useStores } from "store";
import Badges from "../Badges";
import { waitFor } from "@testing-library/react";
import { person } from "__test__/__mockData__/persons";

jest.mock("store", () => ({
    useStores: jest.fn(),
}));

jest.mock('hooks', () => ({
    useIsMobile: jest.fn().mockReturnValue(false),
}))



describe('Badges Component', () => {
  const mockUseStores = useStores as jest.Mock;
  const mockGetBadgeList = jest.fn();
  const mockGetBalances = jest.fn();

  const mockProps = {
    person: person,
  };

  beforeEach(() => {
    mockUseStores.mockReturnValue({
      main: {
        getBadgeList: mockGetBadgeList,
        getBalances: mockGetBalances
      },
      ui: {
        badgeList: [
          { id: 'badge1', name: 'Badge 1', description: 'Description 1', icon: 'icon1.png' },
          { id: 'badge2', name: 'Badge 2', description: 'Description 2', icon: 'icon2.png' }
        ],
        meInfo: {
          owner_pubkey: 'test-pubkey'
        }
      }
    });
  });

  test('renders the component', () => {
    render(<Badges {...mockProps} />);
    expect(screen.getByText('Badge 1')).toBeInTheDocument();
    expect(screen.getByText('Badge 2')).toBeInTheDocument();
  });

  test('displays the spinner when loading is true', () => {
    render(<Badges {...mockProps} />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  test('sets selectedBadge state when a badge is clicked', () => {
    render(<Badges {...mockProps} />);
    fireEvent.click(screen.getByText('Badge 1'));
    expect(screen.getByText('Back to all badges')).toBeInTheDocument();
  });

  test('resets selectedBadge state when "Back to all badges" button is clicked', () => {
    render(<Badges {...mockProps} />);
    fireEvent.click(screen.getByText('Badge 1'));
    fireEvent.click(screen.getByText('Back to all badges'));
    expect(screen.queryByText('Back to all badges')).not.toBeInTheDocument();
  });

  test('sets badgeToPush state when "Claim on Liquid" button is clicked', () => {
    render(<Badges {...mockProps} />);
    fireEvent.click(screen.getByText('Badge 1'));
    fireEvent.click(screen.getByText('Claim on Liquid'));
    expect(screen.getByTestId('badges-modal')).toBeInTheDocument();
  });

  test('displays BadgeStatus component with correct status', () => {
    render(<Badges {...mockProps} />);
    expect(screen.getByText('OFF-CHAIN')).toBeInTheDocument();
  });

  test('fetches badge list and balances on mount', async () => {
    render(<Badges {...mockProps} />);
    await waitFor(() => {
      expect(mockGetBadgeList).toHaveBeenCalled();
      expect(mockGetBalances).toHaveBeenCalledWith('test-pubkey');
    });
  });

    test('displays the badge list', () => {
        render(<Badges {...mockProps} />);
        expect(screen.getByText('Badge 1')).toBeInTheDocument();
        expect(screen.getByText('Badge 2')).toBeInTheDocument();
    });

});

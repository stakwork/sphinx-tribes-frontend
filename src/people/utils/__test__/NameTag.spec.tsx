import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useHistory } from 'react-router';
import * as StoreHooks from '../../../store';
import { useIsMobile } from '../../../hooks';
import NameTag from '../NameTag';

jest.mock('react-router', () => ({
  useHistory: jest.fn()
}));

jest.mock('../../../store', () => ({
  useStores: jest.fn()
}));

jest.mock('../../../hooks', () => ({
  useIsMobile: jest.fn()
}));

describe('NameTag', () => {
  const defaultProps = {
    owner_pubkey: 'test-pubkey',
    owner_alias: '',
    img: '',
    id: 0,
    widget: ''
  };

  const defaultImageUrl = '/static/avatarPlaceholders/placeholder_1.jpg';
  const mockGetUserAvatarPlaceholder = jest.fn().mockReturnValue(defaultImageUrl);
  const mockSetPersonViewOpenTab = jest.fn();
  const mockSetSelectedPerson = jest.fn();
  const mockSetSelectingPerson = jest.fn();
  const mockHistoryPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (StoreHooks.useStores as jest.Mock).mockReturnValue({
      main: {
        getUserAvatarPlaceholder: mockGetUserAvatarPlaceholder
      },
      ui: {
        selectedPerson: null,
        setPersonViewOpenTab: mockSetPersonViewOpenTab,
        setSelectedPerson: mockSetSelectedPerson,
        setSelectingPerson: mockSetSelectingPerson
      }
    });
    (useIsMobile as jest.Mock).mockReset();
    (useHistory as jest.Mock).mockReturnValue({ push: mockHistoryPush });
  });

  it('displays the default face image on desktop side', () => {
    (useIsMobile as jest.Mock).mockReturnValue(false);
    render(<NameTag {...defaultProps} />);
    expect(mockGetUserAvatarPlaceholder).toHaveBeenCalledWith(defaultProps.owner_pubkey);
    expect(screen.getByTestId('user-avatar')).toBeInTheDocument();
  });

  it('displays the default face image on mobile side', () => {
    (useIsMobile as jest.Mock).mockReturnValue(true);
    render(<NameTag {...defaultProps} />);
    expect(mockGetUserAvatarPlaceholder).toHaveBeenCalledWith(defaultProps.owner_pubkey);
    expect(screen.getByTestId('user-avatar')).toBeInTheDocument();
  });

  it('does nothing when clicking already selected person', () => {
    (useIsMobile as jest.Mock).mockReturnValue(false);
    (StoreHooks.useStores as jest.Mock).mockReturnValue({
      main: { getUserAvatarPlaceholder: mockGetUserAvatarPlaceholder },
      ui: { selectedPerson: 1 }
    });

    render(<NameTag {...defaultProps} owner_alias="test" id={1} />);

    const nameElement = screen.getByTestId('owner_name');
    fireEvent.click(nameElement);

    expect(mockSetSelectedPerson).not.toHaveBeenCalled();
  });

  it('sets widget tab when clicking unselected person', () => {
    (useIsMobile as jest.Mock).mockReturnValue(false);

    render(<NameTag {...defaultProps} owner_alias="test" id={1} widget="testWidget" />);

    const nameElement = screen.getByTestId('owner_name');
    fireEvent.click(nameElement);

    expect(mockSetPersonViewOpenTab).toHaveBeenCalledWith('testWidget');
  });

  it('uses placeholder when no image provided', () => {
    (useIsMobile as jest.Mock).mockReturnValue(false);

    render(<NameTag {...defaultProps} owner_alias="test" id={1} />);

    expect(mockGetUserAvatarPlaceholder).toHaveBeenCalledWith(defaultProps.owner_pubkey);
  });

  it('renders empty date when no created prop provided', () => {
    (useIsMobile as jest.Mock).mockReturnValue(false);

    render(<NameTag {...defaultProps} owner_alias="test" id={1} />);

    waitFor(() => {
      const dateElement = screen.getByText('');
      expect(dateElement).toBeInTheDocument();
    });
  });

  it('applies different styling for paid users on desktop', () => {
    (useIsMobile as jest.Mock).mockReturnValue(false);

    render(<NameTag {...defaultProps} owner_alias="test" id={1} isPaid={true} />);

    const avatar = screen.getByTestId('user-avatar');
    expect(avatar).toHaveStyle({ opacity: '0.3' });
  });

  it('applies margin-left when isBountyLandingPage is true', () => {
    (useIsMobile as jest.Mock).mockReturnValue(false);

    const { container } = render(
      <NameTag {...defaultProps} owner_alias="test" id={1} isBountyLandingPage={true} />
    );

    expect(container.firstChild).toHaveStyle({ marginLeft: '95px' });
  });

  it('applies custom style prop', () => {
    const customStyle = { backgroundColor: 'red' };

    const { container } = render(
      <NameTag {...defaultProps} owner_alias="test" id={1} style={customStyle} />
    );

    expect(container.firstChild).toHaveStyle(customStyle);
  });

  it('stops event propagation on click', () => {
    const mockStopPropagation = jest.fn();
    (useIsMobile as jest.Mock).mockReturnValue(false);

    render(<NameTag {...defaultProps} owner_alias="test" id={1} />);

    const nameElement = screen.getByTestId('owner_name');
    fireEvent.click(nameElement, { stopPropagation: mockStopPropagation });

    waitFor(() => {
      expect(mockStopPropagation).toHaveBeenCalled();
    });
  });

  it('renders empty name when owner_alias is empty', () => {
    (useIsMobile as jest.Mock).mockReturnValue(false);

    render(<NameTag {...defaultProps} id={1} />);

    const nameElement = screen.getByTestId('owner_name');
    expect(nameElement.textContent).toBe('');
  });

  it('shortens "a few seconds ago" to "just now"', () => {
    (useIsMobile as jest.Mock).mockReturnValue(false);
    const now = Math.floor(Date.now() / 1000);

    render(<NameTag {...defaultProps} owner_alias="test" id={1} created={now} />);

    expect(screen.getByText('just now')).toBeInTheDocument();
  });

  it('does not navigate when no UUID provided', () => {
    (useIsMobile as jest.Mock).mockReturnValue(false);

    render(<NameTag {...defaultProps} owner_alias="test" id={1} />);

    const nameElement = screen.getByTestId('owner_name');
    fireEvent.click(nameElement);

    expect(mockHistoryPush).not.toHaveBeenCalled();
  });
});

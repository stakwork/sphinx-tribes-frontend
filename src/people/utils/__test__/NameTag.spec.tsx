import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as StoreHooks from '../../../store';
import { useIsMobile } from '../../../hooks';
import NameTag from '../NameTag.tsx';

jest.mock('../../../store', () => ({
  useStores: jest.fn()
}));

jest.mock('../../../hooks', () => ({
  useIsMobile: jest.fn()
}));

describe('NameTag', () => {
  const mockOwnerPubkey = 'test-pubkey';
  const defaultImageUrl = '/static/avatarPlaceholders/placeholder_1.jpg';
  const mockGetUserAvatarPlaceholder = jest.fn().mockReturnValue(defaultImageUrl);

  beforeEach(() => {
    (StoreHooks.useStores as jest.Mock).mockReturnValue({
      main: {
        getUserAvatarPlaceholder: mockGetUserAvatarPlaceholder
      },
      ui: {
        selectedPerson: null
      }
    });
    (useIsMobile as jest.Mock).mockReset();
  });

  it('displays the default face image on desktop side', () => {
    (useIsMobile as jest.Mock).mockReturnValue(false);

    render(
      <NameTag owner_pubkey={mockOwnerPubkey} owner_alias={''} img={''} id={0} widget={undefined} />
    );

    expect(mockGetUserAvatarPlaceholder).toHaveBeenCalledWith(mockOwnerPubkey);
    const imageElement = screen.getByTestId('user-avatar');
    expect(imageElement).toBeInTheDocument();
  });

  it('displays the default face image on mobile side', () => {
    (useIsMobile as jest.Mock).mockReturnValue(true);

    render(
      <NameTag owner_pubkey={mockOwnerPubkey} owner_alias={''} img={''} id={0} widget={undefined} />
    );

    expect(mockGetUserAvatarPlaceholder).toHaveBeenCalledWith(mockOwnerPubkey);
    const imageElement = screen.getByTestId('user-avatar');
    expect(imageElement).toBeInTheDocument();
  });
});

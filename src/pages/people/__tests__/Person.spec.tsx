import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Person from '../Person';

const mockUser = {
  id: 1,
  img: 'https://community.sphinx.chat/static/avatarPlaceholders/placeholder_35.jpg',
  owner_alias: 'user1',
  owner_pubkey: 'xxxxx',
  unique_name: 'user1',
  squeeze: false,
  description: 'hello, I am user1',
  tags: ['Javascript', 'PHP'],
  photo_url: 'https://community.sphinx.chat/static/avatarPlaceholders/placeholder_35.jpg',
  alias: 'user1',
  route_hint: '',
  contact_key: '',
  price_to_meet: 0,
  url: '',
  verification_signature: '',
  extras: {}
};

describe('Person component', () => {
  beforeEach(() => {
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null
    });
    window.IntersectionObserver = mockIntersectionObserver;
  });

  it('should call select method when user is clicked and the page will not triger window.onload', () => {
    const onloadSpy = jest.fn();
    const selectMock = jest.fn();

    const { getByTestId } = render(
      <Person {...mockUser} hideActions={true} small={true} selected={false} select={selectMock} />
    );

    const personCard = getByTestId('person-card-small');
    fireEvent.click(personCard);

    window.onload = onloadSpy;
    expect(onloadSpy).not.toHaveBeenCalled();
    expect(selectMock).toHaveBeenCalledWith(
      mockUser.id,
      mockUser.unique_name,
      mockUser.owner_pubkey
    );
  });

  it('should show user contect qrcode modal when contect is clicked', async () => {
    const selectMock = jest.fn();

    const { getByText, getByTestId } = render(
      <Person
        {...mockUser}
        hideActions={false}
        small={false}
        selected={false}
        select={selectMock}
      />
    );

    const connectBtn = getByText('Connect');
    fireEvent.click(connectBtn); // click contect button and show qrcode modal

    expect(getByTestId('connect-modal')).toBeInTheDocument();
    expect(getByTestId('testid-qrcode')).toBeInTheDocument();
    expect(selectMock).not.toHaveBeenCalled();
  });
});

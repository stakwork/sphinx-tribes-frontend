import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { PersonPage } from './PersonPage';

const mockUseIsMobile = jest.fn();
const mockUsePerson = jest.fn();
const mockGetPersonByUuid = jest.fn();
const mockSetSelectedPerson = jest.fn();
const mockSetSelectingPerson = jest.fn();

let mockRouteUuid = 'person-uuid';
let mockSelectedPerson = 7;

jest.mock('components/common', () => {
  const React = jest.requireActual('react');

  return {
    Modal: ({ visible, children, close, ...props }: any) =>
      visible
        ? React.createElement(
            'div',
            { 'data-testid': props['data-testid'] || 'modal' },
            React.createElement('button', { type: 'button', onClick: close }, 'Close'),
            children
          )
        : null
  };
});

jest.mock('hooks', () => ({
  useIsMobile: () => mockUseIsMobile(),
  usePerson: (personId: number) => mockUsePerson(personId)
}));

jest.mock('store', () => ({
  useStores: () => ({
    main: {
      getPersonByUuid: mockGetPersonByUuid
    },
    ui: {
      selectedPerson: mockSelectedPerson,
      setSelectedPerson: mockSetSelectedPerson,
      setSelectingPerson: mockSetSelectingPerson
    }
  })
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ uuid: mockRouteUuid })
}));

jest.mock('people/userInfo', () => {
  const React = jest.requireActual('react');

  return {
    UserInfo: ({ setShowSupport }: { setShowSupport: (show: boolean) => void }) =>
      React.createElement(
        'button',
        { type: 'button', onClick: () => setShowSupport(true) },
        'Support Me'
      )
  };
});

jest.mock('./peopleList', () => {
  const React = jest.requireActual('react');

  return {
    PeopleList: () => React.createElement('div', { 'data-testid': 'people-list' })
  };
});

jest.mock('./tabs', () => {
  const React = jest.requireActual('react');

  return {
    TabsPages: () => React.createElement('div', { 'data-testid': 'tabs-pages' })
  };
});

describe('PersonPage support modal', () => {
  beforeEach(() => {
    mockRouteUuid = 'person-uuid';
    mockSelectedPerson = 7;
    mockUseIsMobile.mockReturnValue(false);
    mockUsePerson.mockReturnValue({
      canEdit: false,
      person: {
        owner_pubkey: 'owner-pubkey',
        img: 'https://example.com/profile.png'
      }
    });
    mockGetPersonByUuid.mockResolvedValue({ id: 7 });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('opens the support modal with the configured sphinx donation widget', async () => {
    const { container } = render(<PersonPage />);

    await waitFor(() => expect(mockGetPersonByUuid).toHaveBeenCalledWith('person-uuid'));
    expect(mockUsePerson).toHaveBeenCalledWith(7);

    fireEvent.click(screen.getByRole('button', { name: 'Support Me' }));

    expect(screen.getByTestId('modal_support')).toBeInTheDocument();

    const widget = container.querySelector('sphinx-widget');
    expect(widget).toBeInTheDocument();
    expect(widget).toHaveAttribute('pubkey', 'owner-pubkey');
    expect(widget).toHaveAttribute('amount', '500');
    expect(widget).toHaveAttribute('title', 'Support Me');
    expect(widget).toHaveAttribute('subtitle', "Because I'm awesome");
    expect(widget).toHaveAttribute('buttonlabel', 'Donate');
    expect(widget).toHaveAttribute('defaultinterval', 'weekly');
    expect(widget).toHaveAttribute('imgurl', 'https://example.com/profile.png');
  });

  it('uses the fallback image when the profile has no image', async () => {
    mockUsePerson.mockReturnValue({
      canEdit: false,
      person: {
        owner_pubkey: 'owner-pubkey',
        img: ''
      }
    });

    const { container } = render(<PersonPage />);

    await waitFor(() => expect(mockGetPersonByUuid).toHaveBeenCalledWith('person-uuid'));
    fireEvent.click(screen.getByRole('button', { name: 'Support Me' }));

    const widget = container.querySelector('sphinx-widget');
    expect(widget).toHaveAttribute(
      'imgurl',
      'https://i.scdn.co/image/28747994a80c78bc2824c2561d101db405926a37'
    );
  });

  it('does not render the widget without an owner pubkey', async () => {
    mockUsePerson.mockReturnValue({
      canEdit: false,
      person: {
        owner_pubkey: '',
        img: 'https://example.com/profile.png'
      }
    });

    const { container } = render(<PersonPage />);

    await waitFor(() => expect(mockGetPersonByUuid).toHaveBeenCalledWith('person-uuid'));
    fireEvent.click(screen.getByRole('button', { name: 'Support Me' }));

    expect(screen.getByTestId('modal_support')).toBeInTheDocument();
    expect(container.querySelector('sphinx-widget')).not.toBeInTheDocument();
  });
});

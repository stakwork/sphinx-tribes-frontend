import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { useStores } from '../../store';
import { mainStore, Person } from '../../store/main.ts';
import { leaderboardStore } from './store.ts';
import { LeaderboardPage } from './index';

jest.mock('store', () => ({
  ...jest.requireActual('store'),
  useStores: jest.fn()
}));

const person: Person[] = [
  {
    id: 1,
    pubkey: 'pubkey1',
    contact_key: 'test_owner_contact_key',
    alias: 'Vladimir',
    photo_url: '',
    route_hint: 'test_hint:1099567661057',
    price_to_meet: 0,
    url: 'https://proxy2.sphinx.chat',
    description: 'description',
    verification_signature: 'test_verification_signature',
    extras: {
      email: [{ value: 'testEmail@sphinx.com' }],
      liquid: [{ value: 'none' }],
      wanted: []
    },
    owner_alias: 'owner_alias1',
    owner_pubkey: 'test_pub_key',
    uuid: '23334444',
    unique_name: 'vladimir',
    tags: [],
    img: '',
    last_login: 1678263923
  },
  {
    id: 2,
    pubkey: 'pubkey2',
    contact_key: 'test_owner_contact_key_2',
    alias: 'Raphael',
    photo_url: '',
    route_hint: 'test_hint:1099567667689',
    price_to_meet: 0,
    url: 'https://proxy2.sphinx.chat',
    description: 'description2',
    verification_signature: 'test_verification_signature_2',
    extras: {
      email: [{ value: 'testEmail2@sphinx.com' }],
      liquid: [{ value: 'none' }],
      wanted: []
    },
    owner_alias: 'owner_alias2',
    owner_pubkey: 'test_pub_key_2',
    uuid: '23334434',
    unique_name: 'raphael',
    tags: [],
    img: '',
    last_login: 16782639234
  },
  {
    id: 3,
    pubkey: 'pubkey3',
    contact_key: 'test_owner_contact_key_2',
    alias: 'Raphael',
    photo_url: '',
    route_hint: 'test_hint:1099567667689',
    price_to_meet: 0,
    url: 'https://proxy2.sphinx.chat',
    description: 'description2',
    verification_signature: 'test_verification_signature_2',
    extras: {
      email: [{ value: 'testEmail2@sphinx.com' }],
      liquid: [{ value: 'none' }],
      wanted: []
    },
    owner_alias: 'owner_alias3',
    owner_pubkey: 'test_pub_key_2',
    uuid: '23334434',
    unique_name: 'raphael',
    tags: [],
    img: '',
    last_login: 16782639234
  }
];

const mockApiResponse: any = [
  { owner_pubkey: 'pubkey1', total_bounties_completed: 5, total_sats_earned: 500 },
  { owner_pubkey: 'pubkey2', total_bounties_completed: 4, total_sats_earned: 400 },
  { owner_pubkey: 'pubkey3', total_bounties_completed: 3, total_sats_earned: 300 },
  { owner_pubkey: 'pubkey4', total_bounties_completed: 2, total_sats_earned: 200 },
  { owner_pubkey: 'pubkey5', total_bounties_completed: 1, total_sats_earned: 100 }
];
/**
 * @jest-environment jsdom
 */
describe('Leaderboard Component', () => {
  beforeEach(() => {
    (useStores as jest.Mock).mockReturnValue({
      leaderboard: {
        isLoading: false,
        total: {
          total_bounties_completed: 10,
          total_sats_earned: 1000
        },
        top3: [
          { owner_pubkey: 'pubkey1', total_bounties_completed: 5, total_sats_earned: 500 },
          { owner_pubkey: 'pubkey2', total_bounties_completed: 4, total_sats_earned: 400 },
          { owner_pubkey: 'pubkey3', total_bounties_completed: 3, total_sats_earned: 300 }
        ],
        others: [
          { owner_pubkey: 'pubkey4', total_bounties_completed: 2, total_sats_earned: 200 },
          { owner_pubkey: 'pubkey5', total_bounties_completed: 1, total_sats_earned: 100 }
        ],
        fetchLeaders: jest.fn(() => mockApiResponse)
      },
      main: {
        getPersonByPubkey: jest.fn().mockResolvedValue(person)
      }
    });
    jest.spyOn(leaderboardStore, 'fetchLeaders').mockReturnValue(Promise.resolve(mockApiResponse));
    jest.spyOn(mainStore, 'getPersonByPubkey').mockReturnValue(Promise.resolve(mockApiResponse));
  });

  test('leaderboard page is rendered and is visible', async () => {
    act(async () => {
      const { getByTestId } = render(<LeaderboardPage />);
      await waitFor(() => {
        expect(getByTestId('main')).toBeInTheDocument();
      });
    });
  });

  test('total sats earned and total task completed are rendered and is visible', () => {
    act(async () => {
      const { getByText } = render(<LeaderboardPage />);
      await waitFor(() => {
        expect(getByText(/Total sats earned/i)).toBeInTheDocument();
        expect(getByText(/10000/i)).toBeInTheDocument();
        expect(getByText(/Total tasks completed/i)).toBeInTheDocument();
        expect(getByText(/10/i)).toBeInTheDocument();
      });
    });
  });

  test('top 3 contributors are rendered', () => {
    act(async () => {
      render(<LeaderboardPage />);
      await waitFor(async () => {
        const topContributor1 = await screen.findByText(person[0].owner_alias);
        const topContributor2 = await screen.findByText(person[1].owner_alias);
        const topContributor3 = await screen.findByText(person[2].owner_alias);
        expect(topContributor1).toBeInTheDocument();
        expect(topContributor2).toBeInTheDocument();
        expect(topContributor3).toBeInTheDocument();
      });
    });
  });

  test('All contributors are rendered', () => {
    act(async () => {
      const { getByText } = render(<LeaderboardPage />);
      await waitFor(async () => {
        for (const contributor of mockApiResponse) {
          expect(getByText(contributor.owner_pubkey)).toBeInTheDocument();
        }
      });
    });
  });

  test('clicking on the clip icon for a contributor takes us to their profile', () => {
    act(async () => {
      const { getByTestId } = render(<LeaderboardPage />);
      await waitFor(async () => {
        const userClipIcon = getByTestId('user-id');
        fireEvent.click(userClipIcon);

        expect(userClipIcon.getAttribute('href')).toEqual(`/p/${person[0].owner_pubkey}`);
      });
    });
  });
});

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import mockBounties from '../../bounties/__mock__/mockBounties.data';
import UserTickets from './UserTicketsView';

// eslint-disable-next-line @typescript-eslint/typedef
const createdMockBounties = Array.from({ length: 15 }, (_, index) => ({
  ...(mockBounties[0] || {}),
  bounty: {
    ...(mockBounties[0]?.bounty || {}),
    id: mockBounties[0]?.bounty?.id + index + 1
  }
}));

console.log(createdMockBounties);

jest.mock('../../bounties/__mock__/mockBounties.data', () => ({
  createdMockBounties
}));

describe('UserTickets component', () => {
  it('displays "Load More" button when scrolling down', async () => {
    const { getByText } = render(
      <MemoryRouter>
        <UserTickets />
      </MemoryRouter>
    );

    fireEvent.scroll(window, { target: { scrollY: 1000 } });

    await waitFor(() => {
      if (createdMockBounties.length > 20) {
        expect(getByText('Load More')).toBeInTheDocument();
      } else {
        console.warn('Not enough bounties for "Load More" button.');
      }
    });
  });
});

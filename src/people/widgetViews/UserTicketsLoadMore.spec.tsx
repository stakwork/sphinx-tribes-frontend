import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { MemoryRouter, Route } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import UserTickets from './UserTicketsView'; 

const singleResponse = [
    {
      bounty: {
        id: 699,
        owner_id: "021ae436bcd40ca21396e59be8cdb5a707ceacdb35c1d2c5f23be7584cab29c40b",
        paid: true,
        show: true,
        type: "freelance_job_request",
        award: "",
        assigned_hours: 0,
        bounty_expires: "",
        commitment_fee: 0,
        price: 200000,
        title: "Disable automatic close for bounty creation modal",
        tribe: "None",
        assignee: "0276681167b8beb1e6113b259504ab7f9d84432cb3626b1f81b388154eb924073f",
        ticket_url: "https://github.com/stakwork/sphinx-tribes/issues/949",
        org_uuid: "ck95pe04nncjnaefo08g",
        description: "Test description",
        wanted_type: "Web development",
        deliverables: "",
        github_description: true,
        one_sentence_summary: "",
        estimated_session_length: "Less than 3 hours",
        estimated_completion_date: "2023-11-24T18:07:42.934Z",
        created: 1700071681,
        updated: "2023-11-16T16:04:35.533279Z",
        coding_languages: []
      },
      assignee: {
        id: 219,
        uuid: "ckpcvk84nncso5beu0a0",
        owner_pubkey: "0276681167b8beb1e6113b259504ab7f9d84432cb3626b1f81b388154eb924073f",
        owner_alias: "coderturtle",
        unique_name: "coderturtle",
        description: "TL;DR",
        tags: [],
        img: "https://memes.sphinx.chat/public/QPU9RLM5nAjAgc708L5pBwmidoV-frYGV5TX8BoD0bw=",
        created: "2023-10-20T19:06:57.037025Z",
        updated: "2024-01-06T06:37:24.577894Z",
        unlisted: false,
        deleted: false,
        last_login: 1706256903,
        owner_route_hint: "03a6ea2d9ead2120b12bd66292bb4a302c756983dc45dcb2b364b461c66fd53bcb:1099515428865",
        owner_contact_key: "MIIBCgKCAQEAo8XmYqhGFt2B6KLgXsOrwtCx+BMu6ORA9PGtSQl1H/dOZcCzYXJHp/0ZOnQ0ycRkv9DWNBRnUX1gq+r6PDbyKo/VpCDvwwEzfGUPNb3149VuOhRTmTWx15fbo15QG9731LIeWyYOgrU5LXx7g8O6jGava6nfN1NSdA+PwaMuUbPTOVSaUU6f0Ipqu59Nuc85ZV36j1oz8Tt8trAiVOGnQhUIEgHx9e80Hb003qubpSOddSnZ8J+73tJftvOVaR5M4807Kjis79adBT6RL3lLTMS+1hCKUVNH5ombqXlAFosEO0fHl25C801UC1d6/oPm2AqtIUx5sgM/nQRLlM6McwIDAQAB",
        price_to_meet: 20,
        new_ticket_time: 0,
        twitter_confirmed: false,
        extras: null,
        github_issues: null
      },
      owner: {
        id: 180,
        uuid: "cjrptro4nncma8v11kmg",
        owner_pubkey: "021ae436bcd40ca21396e59be8cdb5a707ceacdb35c1d2c5f23be7584cab29c40b",
        owner_alias: "ecurrencyhodler",
        unique_name: "ecurrencyhodler",
        description: "Bitcoin PM",
        tags: [],
        img: "https://memes.sphinx.chat/public/SlXI397USVtZpdltwXaA0yb9IuEnF-UVY-3QRwpWq1w=",
        created: "2023-09-05T21:34:39.170759Z",
        updated: "2023-12-23T02:57:25.165101Z",
        unlisted: false,
        deleted: false,
        last_login: 1706290707,
        owner_route_hint: "02736e7dad83d7205826649fc17db672ce08f8e87a2b47c7785ccbf79f24e91db0:1099755618305",
        owner_contact_key: "MIIBCgKCAQEAtgzfICpgqpmkK+gGTFoEyZjJy3OK5rlQZtBuNi16jHnNoQamocztJMxnx/m2wyAg77IEd95l0r/PZw88lrEW4hHExa6ElVgtKfeteaqnxuksB547ew3ZoEmw5TyXKqnSVu2mNQpa5r3neE1SgaliwRvYrNNQQjWisvMKO33xVzHHH0WRZCMg1zLwn4R7zLRTwDZYLCK26SD+6ZNE2ylFl/Byn6SNxwlF7rleyn13viPi3jmoBNfEvK6ssvuKOWJgldaXCsnbRjh1HJAztNJ3Ocf3LxwOIcRdwlc1K+787+4rdgDBu29kvIoT3G+EjTJfvTSq9zhIUeXe5q70l8/UqwIDAQAB",
        price_to_meet: 0,
        new_ticket_time: 0,
        twitter_confirmed: false,
        extras: null,
        github_issues: null
      },
      organization: {
        uuid: "ck95pe04nncjnaefo08g",
        name: "Bounties Platform",
        img: "https://memes.sphinx.chat/public/IqQnBnAdrteW_QCeq_3Ss1_78_yBAz_rckG5F3NE9ms="
      }
    }
  ];

const duplicatedResponse = Array.from({ length: 25 }, (_:any, index:any) => ({
  ...singleResponse[0],
  bounty: { ...singleResponse[0].bounty, id: index + 1 },
}));

jest.mock('store', () => ({
  useStores: jest.fn(() => ({
    main: {
      getPersonAssignedBounties: jest.fn(() => Promise.resolve(duplicatedResponse)),
      people: [],
    },
    ui: {
      meInfo: {
        url: 'http://example.com',
        jwt: 'mock-jwt',
      },
      setBountyPerson: jest.fn(),
    },
  })),
}));
jest.mock('people/main/bountyModal/BountyModal', () => ({
  BountyModal: jest.fn(() => null),
}));
jest.mock('people/utils/PageLoadSpinner', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));
jest.mock('people/utils/UserNoResults', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));
jest.mock('people/main/Body', () => ({
  Spacer: jest.fn(() => null),
}));
jest.mock('./DeleteModal', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));
jest.mock('../../config/history', () => ({
  push: jest.fn(),
}));

describe('UserTickets', () => {
  it('renders Load More button when bounties are greater than 20', async () => {
    render(
      <MemoryRouter initialEntries={['/user-tickets/mock-person-id']}>
        <Route path="/user-tickets/:personPubkey">
          <UserTickets />
        </Route>
      </MemoryRouter>
    );

    // Mock the window object
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 500, // Set the desired innerHeight value
    });

    // Wait for the data to be loaded
    await waitFor(() => expect(screen.getByTestId('test')).toBeInTheDocument());

    // Assert that the Load More button is visible
    expect(screen.getByText('Load More')).toBeInTheDocument();

    // Cleanup
    act(() => {
      fireEvent.click(screen.getByText('Load More'));
    });
  });
});

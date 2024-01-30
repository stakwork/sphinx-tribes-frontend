import '@testing-library/jest-dom';
import { Router } from 'react-router-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { setupStore } from '../../../__test__/__mockData__/setupStore';
import { person } from '../../../__test__/__mockData__/persons.ts';
import { user } from '../../../__test__/__mockData__/user';
import { mockUsehistory } from '../../../__test__/__mockFn__/useHistory';
import Bounties from '../AssignedUnassignedBounties';
import history from '../../../config/history';

beforeAll(() => {
  nock.disableNetConnect();
  setupStore();
  mockUsehistory();
});

beforeEach(() => {
  // IntersectionObserver isn't available in test environment
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  });
  window.IntersectionObserver = mockIntersectionObserver;
});

/**
 * @jest-environment jsdom
 */
describe('Bounties Component', () => {
  nock(user.url).get('/person/id/1').reply(200, {});

  test('display bounty', () => {
    const bountyProps = {
      assignee: person,
      price: 0,
      sessionLength: '',
      priceMin: 0,
      priceMax: 0,
      codingLanguage: [],
      title: 'test_title',
      person: person,
      onPanelClick: jest.fn(),
      widget: {},
      created: 0,
      isPaid: false
    };

    render(
      <Router history={history}>
        <Bounties {...bountyProps} />
      </Router>
    );
    expect(screen.queryByText(bountyProps.title)).toBeInTheDocument();
  });

  test('display bounty with hover effect on DescriptionPriceContainer', async () => {
    const bountyProps = {
      assignee: undefined,
      price: 0,
      sessionLength: '',
      priceMin: 0,
      priceMax: 0,
      codingLanguage: [],
      title: 'test_title',
      person: person,
      onPanelClick: jest.fn(),
      widget: {},
      created: 0,
      isPaid: false
    };

    render(
      <Router history={history}>
        <Bounties {...bountyProps} />
      </Router>
    );

    const descriptionPriceContainer = screen.getByTestId('description-price-container');

    expect(descriptionPriceContainer).toBeInTheDocument();

    fireEvent.mouseEnter(descriptionPriceContainer);

    expect(descriptionPriceContainer).toHaveStyle('border: 2px solid rgba(0,140,230,0.2)');
  });
});

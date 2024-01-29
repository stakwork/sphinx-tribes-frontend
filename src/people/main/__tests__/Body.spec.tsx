import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useStores } from 'store';
import { useFuse } from 'hooks';
import nock from 'nock';
import Body from '../Body';
import '@testing-library/jest-dom';
import { user } from '../../../__test__/__mockData__/user';
import BodyComponent from '../Body';

jest.mock('hooks', () => ({
  ...jest.requireActual('hooks'),
  useIsMobile: jest.fn(),
  useScreenWidth: jest.fn(),
  useFuse: jest.fn()
}));

jest.mock('store', () => ({
  useStores: jest.fn()
}));

beforeAll(() => {
  nock.disableNetConnect();
});

describe('People Body Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should display No results when there are no active list items with filter of languages', async () => {
    // Mock return value for the store hook
    (useStores as jest.Mock).mockReturnValue({
      main: {
        people: [],
        getPeople: jest.fn()
      },
      ui: {
        peoplePageNumber: 1
      }
    });

    (useFuse as jest.Mock).mockReturnValue([]);

    // Render the component with a selected widget and empty lists
    render(<Body />);

    await waitFor(() => {
      expect(screen.getByText(/No results/i)).toBeInTheDocument();
    });
  });
});

describe('BodyComponent', () => {
  nock(user.url)
    .get(`/people?page=1&resetPage=true&search=&sortBy=last_login&limit=500`)
    .reply(200, {});

  it('content element has equal left and right margins', () => {
    render(<BodyComponent />);

    const contentElement = screen.getByTestId('content');

    expect(contentElement).toBeInTheDocument();

    const styles = window.getComputedStyle(contentElement);

    const { marginLeft, marginRight } = styles;

    expect(marginLeft).toEqual(marginRight);
  });
});

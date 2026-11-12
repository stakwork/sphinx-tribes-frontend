import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';
import { NotFoundPage } from '.';

const mockCapture = jest.fn();
const mockPostHog = {
  capture: mockCapture
};

jest.mock('posthog-js/react', () => ({
  usePostHog: () => mockPostHog
}));

describe('NotFoundPage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('tracks the missing route with the current path and search params', async () => {
    const history = createMemoryHistory({
      initialEntries: ['/does-not-exist?source=test']
    });

    render(
      <Router history={history}>
        <NotFoundPage />
      </Router>
    );

    await waitFor(() =>
      expect(mockCapture).toHaveBeenCalledWith('not_found_page_view', {
        path: '/does-not-exist',
        search: '?source=test'
      })
    );
  });

  it('returns users to the home route', () => {
    const history = createMemoryHistory({
      initialEntries: ['/missing-route']
    });

    render(
      <Router history={history}>
        <NotFoundPage />
      </Router>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Take me back' }));

    expect(history.location.pathname).toBe('/');
  });
});

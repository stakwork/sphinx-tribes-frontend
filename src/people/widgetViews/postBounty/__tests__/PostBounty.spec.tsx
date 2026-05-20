import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import React from 'react';
import { setupStore } from '../../../../__test__/__mockData__/setupStore';
import { user } from '../../../../__test__/__mockData__/user';
import { mockUsehistory } from '../../../../__test__/__mockFn__/useHistory';
import { PostBounty } from '../PostBounty';
import { PostModal } from '../PostModal';

beforeAll(() => {
  nock.disableNetConnect();
  setupStore();
  mockUsehistory();
  nock(user.url).persist().get('/feature-flags').reply(200, []);
  nock(user.url).persist().get('/workspaces/user/dropdown/1').reply(200, []);
  nock(user.url).persist().get(/\/features.*/).reply(200, []);
  nock(user.url).persist().get(/\/people.*/).reply(200, []);
  nock(user.url).persist().get(/\/snippet\/workspace.*/).reply(200, []);
});

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock('remark-gfm', () => {});

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock('rehype-raw', () => {});

describe('Post bounty', () => {
  nock(user.url).get('/person/id/1').reply(200, { user });
  nock(user.url).get('/ask').reply(200, {});

  test('signed in user can open, cancel, and start the post bounty flow', async () => {
    render(<PostBounty widget="bounties" />);

    const postBountyButton = await screen.findByRole('button', { name: /Post a Bounty/i });
    expect(postBountyButton).toBeInTheDocument();

    fireEvent.click(postBountyButton);

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('Choose Bounty type')).toBeInTheDocument();
    expect(screen.getByText('Freelance Job Request')).toBeInTheDocument();
    expect(screen.getByText('Choose the right developer')).toBeInTheDocument();
    expect(screen.getByText('Live Help')).toBeInTheDocument();
    expect(screen.getByText('Get instant help for your task')).toBeInTheDocument();
    expect(screen.getByText('Coming soon')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('close-btn'));
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    fireEvent.click(postBountyButton);
    fireEvent.click(screen.getByText('Start'));

    expect(await screen.findByText('Basic info')).toBeInTheDocument();
  });

  test('display error message if bounty fails to create', () => {
    const closeHandler = jest.fn();
    const formData = {
      workspace: 'workspace',
      title: 'title',
      category: 'Web development',
      description: 'description',
      price: 1
    };

    Object.defineProperty(window, 'navigator', {
      value: {
        onLine: false // This mocks the online status, change as needed
      },
      configurable: true
    });

    render(<PostModal isOpen={true} onClose={closeHandler} widget="bounties" />);
    fireEvent.click(screen.getByText('Start'));

    expect(screen.queryByText('Basic info')).toBeInTheDocument();
    expect(screen.queryByText('Next')).toHaveClass('disableText');
    waitFor(async () => {
      await userEvent.type(screen.getByLabelText('Bounty Title'), formData.title);
      userEvent.click(screen.getByTestId('Category'));
      userEvent.click(screen.getByText(formData.category));
      userEvent.click(screen.getByText('Next'));
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.queryAllByText('Description')[0]).toBeInTheDocument();
      await waitFor(async () => {
        await userEvent.type(screen.getByLabelText('Description'), formData.description);
        userEvent.click(screen.getByText('Next'));
      });
      expect(screen.getByText('Price and Estimate')).toBeInTheDocument();
      await waitFor(async () => {
        await userEvent.type(screen.getByLabelText('Price (Sats)*'), String(formData.price));
        userEvent.click(screen.getByText('Next'));
      });
      expect(screen.queryByText('Assign Developer')).toBeInTheDocument();
      await waitFor(async () => {
        userEvent.click(await screen.findByText('Decide Later'));
      });
      expect(screen.queryByText('Finish')).toBeInTheDocument();
      expect(
        screen.queryByText('Something went wrong! Unable to create bounty')
      ).toBeInTheDocument();
    });
  });
});

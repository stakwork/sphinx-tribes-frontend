import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import React from 'react';
import { setupStore } from '../../../../__test__/__mockData__/setupStore';
import { user } from '../../../../__test__/__mockData__/user';
import { mockUsehistory } from '../../../../__test__/__mockFn__/useHistory';
import { PostModal } from '../PostModal';

beforeAll(() => {
  nock.disableNetConnect();
  setupStore();
  mockUsehistory();
});

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock('remark-gfm', () => {});

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock('rehype-raw', () => {});

describe('Post bounty', () => {
  nock(user.url).get('/person/id/1').reply(200, { user });
  nock(user.url).get('/ask').reply(200, {});

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

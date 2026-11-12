import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { setupStore } from '../../../../__test__/__mockData__/setupStore';
import { user } from '../../../../__test__/__mockData__/user';
import { PostModal } from '../PostModal';

const mockFocusedViewProps: any[] = [];

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock('remark-gfm', () => {});

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock('rehype-raw', () => {});

jest.mock('../../../../hooks', () => ({
  ...jest.requireActual('../../../../hooks'),
  useIsMobile: () => true
}));

jest.mock('../../../main/FocusView', () => (props: any) => {
  mockFocusedViewProps.push(props);
  return <div data-testid="focused-view" />;
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn()
  })
}));

describe('PostModal mobile bounty creation', () => {
  beforeAll(() => {
    nock.disableNetConnect();
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      },
      configurable: true
    });
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      },
      configurable: true
    });
  });

  beforeEach(() => {
    mockFocusedViewProps.length = 0;
    nock.cleanAll();
    nock(user.url).persist().get('/person/id/1').reply(200, { user });
    nock(user.url).persist().get('/ask').reply(200, {});
    setupStore();
  });

  afterAll(() => {
    nock.cleanAll();
  });

  it('passes the bounty redirect callback to the mobile creation form', async () => {
    render(<PostModal isOpen={true} onClose={jest.fn()} widget="bounties" />);

    expect(screen.getByTestId('focused-view')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockFocusedViewProps[0]?.ReCallBounties).toEqual(expect.any(Function));
    });
    expect(mockFocusedViewProps[0]?.newDesign).toBe(true);
  });
});

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import nock from 'nock';
import { user } from '../../../__test__/__mockData__/user';
import BodyComponent from '../Body';

beforeAll(() => {
  nock.disableNetConnect();
});

describe('BodyComponent', () => {
  nock(user.url)
    .get(`/people?page=1&resetPage=true&search=&sortBy=last_login&limit=500`)
    .reply(200, {});

  it('content element has equal left and right margins', () => {
    const { getByTestId } = render(<BodyComponent />);

    const contentElement = getByTestId('content');

    expect(contentElement).toBeInTheDocument();

    const styles = window.getComputedStyle(contentElement);

    const { marginLeft, marginRight } = styles;

    expect(marginLeft).toEqual(marginRight);
  });

  it('content element has justifyContent and alignItems centered', async () => {
    const { getByTestId } = render(<BodyComponent />);

    const contentElement = getByTestId('content');

    expect(contentElement).toBeInTheDocument();

    const styles = window.getComputedStyle(contentElement);
    const { justifyContent, alignItems } = styles;

    expect(justifyContent).toEqual('center');
    expect(alignItems).toEqual('center');
  });

  it('filter is in viewport when device is mobile', async () => {
    Object.assign(window, { innerWidth: 375 });
    act(async () => {
      render(<BodyComponent />);
      await waitFor(() => {
        const filterNode = screen.getByTestId('PeopleHeader');

        const { left, right, bottom, top, width, height } = filterNode.getBoundingClientRect();

        expect(left).toBeGreaterThanOrEqual(0);
        expect(top).toBeGreaterThanOrEqual(0);
        expect(right - width).toBeGreaterThanOrEqual(0);
        expect(bottom - height).toBeGreaterThanOrEqual(0);
      });
    });
  });
});

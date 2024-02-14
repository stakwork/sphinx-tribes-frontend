import React from 'react';
import { render, screen } from '@testing-library/react';
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
    render(<BodyComponent />);

    const contentElement = screen.getByTestId('content');

    expect(contentElement).toBeInTheDocument();

    const styles = window.getComputedStyle(contentElement);

    const { marginLeft, marginRight } = styles;

    expect(marginLeft).toEqual(marginRight);
  });

  it('filter is in viewport when device is mobile', () => {
    Object.assign(window, { innerWidth: 375 });

    render(<BodyComponent />);
    const filterNode = screen.getByTestId('PeopleHeader');

    const { left, right, bottom, top, width, height } = filterNode.getBoundingClientRect();

    expect(left).toBeGreaterThanOrEqual(0);
    expect(top).toBeGreaterThanOrEqual(0);
    expect(right - width).toBeGreaterThanOrEqual(0);
    expect(bottom - height).toBeGreaterThanOrEqual(0);
  });
});

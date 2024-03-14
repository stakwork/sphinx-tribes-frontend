import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import { UserInfoDesktopView } from 'people/userInfo/UserInfoDesktopView';
import { MOCK_ENVIRONMENT_HOOKS } from '__test__/__mockStore__/constants';
import nock from 'nock';
import { user } from '__test__/__mockData__/user';
import MockStoreEnvironment from '../../../__test__/__mockStore__/MockStoreEnvironment';

describe('User Profile', () => {
  it('Should render edit profile button of self profile', () => {
    nock(user.url).get('/person/id/1').reply(200, {});
    render(
      <MockStoreEnvironment hooks={[MOCK_ENVIRONMENT_HOOKS.SELF_PROFILE_STORE]}>
        <UserInfoDesktopView setShowSupport={() => null} />
      </MockStoreEnvironment>
    );
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
  });
});

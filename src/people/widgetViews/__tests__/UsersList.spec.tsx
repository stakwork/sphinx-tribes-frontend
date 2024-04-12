import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Users from '../workspace/UsersList.tsx';

jest.mock('store', () => ({
  useStores: () => ({
    main: {
      bountyRoles: []
    },
    ui: {
      meInfo: {
        owner_pubkey: 'mocked_pubkey'
      }
    }
  })
}));

const mockedUsers = [
  {
    owner_pubkey: 'user1_pubkey',
    owner_alias: 'User 1',
    img: ''
  },
  {
    owner_pubkey: 'mocked_pubkey',
    owner_alias: 'User 2',
    img: ''
  }
];

const props = {
  users: mockedUsers,
  userRoles: ['VIEW'],
  handleDeleteClick: jest.fn(),
  handleSettingsClick: jest.fn(),
  org: { owner_pubkey: 'org_pubkey' }
};

describe('Users Component', () => {
  test('displays not-allowed cursor over disabled settings button', () => {
    // @ts-ignore
    const { getAllByTestId } = render(<Users {...props} />);
    const settingsIcons = getAllByTestId('settings-icon');
    // eslint-disable-next-line @typescript-eslint/typedef
    settingsIcons.forEach((icon) => {
      expect(icon).toHaveStyle('cursor: not-allowed');
    });
  });

  test('displays not-allowed cursor over disabled delete button', () => {
    // @ts-ignore
    const { getAllByTestId } = render(<Users {...props} />);
    const deleteIcons = getAllByTestId('delete-icon');
    // eslint-disable-next-line @typescript-eslint/typedef
    deleteIcons.forEach((icon) => {
      expect(icon).toHaveStyle('cursor: not-allowed');
    });
  });
});

import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import nock from 'nock';
import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import AddUserModal from '../organization/AddUserModal';

describe('AddUserModal Component', () => {
  it('filters people according to the search term, enables "Add User" Button and adds user when "Add User" button is clicked', async () => {
    const mockProps = {
      isOpen: true,
      close: jest.fn(),
      loading: false,
      onSubmit: jest.fn(),
      disableFormButtons: false,
      setDisableFormButtons: jest.fn()
    };

    const mockUser = {
      owner_pubkey: '03cbb9c01cdcf91a3ac3b543a556fbec9c4c3c2a6ed753e19f2706012a26367ae3',
      owner_alias: 'Ednum',
      img: ''
    };

    nock('https://community.sphinx.chat')
      .get('/people/search')
      .query({ search: 'Anish', sortBy: 'owner_alias', limit: '4' })
      .reply(200, [{ owner_pubkey: '...', owner_alias: 'Anish Yadav', img: '...' }]);

    const { getByPlaceholderText, getByText } = render(<AddUserModal {...mockProps} />);

    (async () => {
      const searchInput = getByPlaceholderText('Type to search ...');
      fireEvent.change(searchInput, { target: { value: 'Anish' } });
      await waitFor(() => expect(getByText('Anish Yadav')).toBeInTheDocument());
      await waitFor(() => {
        const addUserButton = getByText('Add User');
        expect(addUserButton).toBeEnabled();
        fireEvent.click(addUserButton);
        expect(mockProps.onSubmit).toHaveBeenCalledTimes(1);
        expect(mockProps.onSubmit).toHaveBeenCalledWith({
          owner_pubkey: mockUser.owner_pubkey
        });
      });
    })();
  });
});

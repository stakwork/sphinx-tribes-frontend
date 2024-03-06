import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';
import { useStores } from '../../../../store';
import { PeopleList } from '../../peopleList';

jest.mock('store', () => ({
  useStores: jest.fn()
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    replace: jest.fn()
  })
}));

describe('PeopleList Component', () => {
  it('clears the search bar when back arrow button is clicked', async () => {
    const mockSetSearchText = jest.fn();
    (useStores as jest.Mock).mockReturnValue({
      ui: {
        searchText: 'John Doe',
        setSearchText: mockSetSearchText,
        setSelectingPerson: jest.fn(),
        setSelectedPerson: jest.fn()
      },
      main: {
        getPeople: jest.fn(),
        people: []
      }
    });

    const history = createMemoryHistory();
    const { getByText, getByPlaceholderText } = render(
      <Router history={history}>
        <PeopleList />
      </Router>
    );
    expect(getByPlaceholderText('Search')).toHaveValue('John Doe');
    fireEvent.click(getByText('Back'));
    expect(mockSetSearchText).toHaveBeenCalledWith('');
  });
});

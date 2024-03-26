import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Header from '../Header';

jest.mock('../../../store', () => ({
  useStores: () => ({
    main: {
      getIsAdmin: jest.fn().mockResolvedValue(false),
      getSelf: jest.fn().mockResolvedValue({}),
      getPeople: jest.fn().mockResolvedValue([])
    },
    ui: {
      meInfo: null,
      setMeInfo: jest.fn(),
      setShowSignIn: jest.fn(),
      setSelectedPerson: jest.fn(),
      setSelectingPerson: jest.fn(),
      showSignIn: false,
      torFormBodyQR: ''
    }
  })
}));

describe('Header Component', () => {
  test('renders Header component', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
  });

  test('clicking on the "Get Sphinx" button calls the correct handler', async () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    const getSphinxsBtn = screen.getByText('Get Sphinx');
    fireEvent.click(getSphinxsBtn);
  });
});

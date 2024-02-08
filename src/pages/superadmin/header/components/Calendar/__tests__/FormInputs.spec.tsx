import '@testing-library/jest-dom';
import { render, screen, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import App from '../App';

describe('Test for components/Calendar/App', () => {
  it('enable manual inputs for dates', async () => {
    const setStartDateMock = jest.fn();
    const setEndDateMock = jest.fn();
    const setShowCalendar = jest.fn();

    render(
      <App
        filterEndDate={setEndDateMock}
        filterStartDate={setStartDateMock}
        setShowCalendar={setShowCalendar}
      />
    );

    const inputStart = await screen.getByAltText('start');
    expect(inputStart).toBeInTheDocument();

    userEvent.type(inputStart, '01/02/23');
    expect(inputStart).toHaveValue('01/02/23');

    const inputEnd = await screen.getByAltText('end');
    expect(inputEnd).toBeInTheDocument();

    userEvent.type(inputEnd, '02/05/24');
    expect(inputEnd).toHaveValue('02/05/24');
  });
});

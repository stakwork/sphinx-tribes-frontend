import '@testing-library/jest-dom';
import { waitFor } from '@testing-library/dom';
import { render, screen, within, act, fireEvent } from '@testing-library/react';
import moment from 'moment';
import nock from 'nock';
import React from 'react';
import { user } from '../../../../__test__/__mockData__/user';
import { Header } from '../';

Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr: any) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }
  }
});

describe('Header Component', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  nock(user.url).get('/person/id/1').reply(200, {});

  test('displays header with extras', async () => {
    const setStartDateMock = jest.fn();
    const setEndDateMock = jest.fn();
    const setWorkspaceMock = jest.fn();

    const exportCSVText = 'Export CSV';

    const { rerender } = render(
      <Header
        startDate={moment().subtract(7, 'days').startOf('day').unix()}
        endDate={moment().startOf('day').unix()}
        setStartDate={setStartDateMock}
        setEndDate={setEndDateMock}
        workspace={''}
        setWorkspace={setWorkspaceMock}
      />
    );

    const today = moment().startOf('day');
    const expectedStartDate = today.clone().subtract(7, 'days');
    const expectedEndDate = today;

    const leftWrapperElement = screen.getByTestId('leftWrapper');
    const monthElement = within(leftWrapperElement).getByTestId('month');

    expect(monthElement).toBeInTheDocument();
    const actualTextContent = monthElement.textContent?.trim();
    const expectedTextContent = `${expectedStartDate.format(
      'DD MMM YYYY'
    )} - ${expectedEndDate.format('DD MMM YYYY')}`;
    expect(actualTextContent).toBe(expectedTextContent);

    expect(screen.getByText(exportCSVText)).toBeInTheDocument();

    act(() => {
      rerender(
        <Header
          startDate={moment().subtract(30, 'days').startOf('day').unix()}
          endDate={moment().startOf('day').unix()}
          setStartDate={setStartDateMock}
          setEndDate={setEndDateMock}
          workspace={''}
          setWorkspace={setWorkspaceMock}
        />
      );
    });

    const StartDate30 = today.clone().subtract(30, 'days');
    expect(monthElement).toHaveTextContent(
      `${StartDate30.format('DD MMM YYYY')} - ${expectedEndDate.format('DD MMM YYYY')}`
    );

    act(() => {
      rerender(
        <Header
          startDate={moment().subtract(90, 'days').startOf('day').unix()}
          endDate={moment().startOf('day').unix()}
          setStartDate={setStartDateMock}
          setEndDate={setEndDateMock}
          workspace={''}
          setWorkspace={setWorkspaceMock}
        />
      );
    });

    const StartDate90 = today.clone().subtract(90, 'days');
    expect(monthElement).toHaveTextContent(
      `${StartDate90.format('DD MMM YYYY')} - ${expectedEndDate.format('DD MMM YYYY')}`
    );
  });

  test('displays same year for startDate and endDate', () => {
    const setStartDateMock = jest.fn();
    const setEndDateMock = jest.fn();
    const setWorkspaceMock = jest.fn();
    const exportCSVText = 'Export CSV';

    render(
      <Header
        startDate={moment().subtract(7, 'days').startOf('day').unix()}
        endDate={moment().subtract('days').startOf('day').unix()}
        setStartDate={setStartDateMock}
        setEndDate={setEndDateMock}
        workspace={''}
        setWorkspace={setWorkspaceMock}
      />
    );

    const today = moment().startOf('day');
    const expectedStartDate = today.clone().subtract(7, 'days');
    const expectedEndDate = today.clone().subtract('days');

    const leftWrapperElement = screen.getByTestId('leftWrapper');
    const monthElement = within(leftWrapperElement).getByTestId('month');

    expect(monthElement).toBeInTheDocument();

    // Log the formatted dates for debugging
    //console.log('Formatted Start Date:', formatUnixDate(expectedStartDate.unix()));
    //console.log('Formatted End Date:', formatUnixDate(expectedEndDate.unix()));

    const formattedStartDate = moment.unix(expectedStartDate.unix()).format('DD MMM YYYY');
    const formattedEndDate = moment.unix(expectedEndDate.unix()).format('DD MMM YYYY');

    expect(monthElement).toHaveTextContent(`${formattedStartDate} - ${formattedEndDate}`);

    expect(screen.getByText(exportCSVText)).toBeInTheDocument();

    // You can add additional assertions or test scenarios as needed
  });
  test('displays year for both dates for different startDate and endDate years', () => {
    const setStartDateMock = jest.fn();
    const setEndDateMock = jest.fn();
    const setWorkspaceMock = jest.fn();
    const exportCSVText = 'Export CSV';

    render(
      <Header
        startDate={moment().subtract(1, 'year').startOf('day').unix()}
        endDate={moment().subtract('days').startOf('day').unix()}
        setStartDate={setStartDateMock}
        setEndDate={setEndDateMock}
        workspace={''}
        setWorkspace={setWorkspaceMock}
      />
    );

    const today = moment().startOf('day');
    const expectedStartDate = today.clone().subtract(1, 'year');
    const expectedEndDate = today.clone().subtract('days');

    const leftWrapperElement = screen.getByTestId('leftWrapper');
    const monthElement = within(leftWrapperElement).getByTestId('month');

    expect(monthElement).toBeInTheDocument();

    const formattedStartDate = moment.unix(expectedStartDate.unix()).format('DD MMM YYYY');
    const formattedEndDate = moment.unix(expectedEndDate.unix()).format('DD MMM YYYY');

    expect(monthElement).toHaveTextContent(`${formattedStartDate} - ${formattedEndDate}`);

    expect(screen.getByText(exportCSVText)).toBeInTheDocument();

    // You can add additional assertions or test scenarios as needed
  });

  test('displays header with a 7-day difference by default', async () => {
    const setStartDateMock = jest.fn();
    const setEndDateMock = jest.fn();
    const setWorkspaceMock = jest.fn();
    const exportCSVText = 'Export CSV';

    // Adjusted to ensure a 7-day difference by default
    const startDate = moment().subtract(7, 'days').startOf('day').unix();
    const endDate = moment().startOf('day').unix();

    render(
      <Header
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDateMock}
        setEndDate={setEndDateMock}
        workspace={''}
        setWorkspace={setWorkspaceMock}
      />
    );

    const today = moment().startOf('day');
    const expectedStartDate = today.clone().subtract(7, 'days');
    const expectedEndDate = today;

    const leftWrapperElement = screen.getByTestId('leftWrapper');
    const monthElement = within(leftWrapperElement).getByTestId('month');

    expect(monthElement).toBeInTheDocument();

    const expectedTextContent = `${expectedStartDate.format(
      'DD MMM YYYY'
    )} - ${expectedEndDate.format('DD MMM YYYY')}`;
    expect(monthElement).toHaveTextContent(expectedTextContent);

    expect(screen.getByText(exportCSVText)).toBeInTheDocument();
  });

  test('displays "Custom" when dates are selected', async () => {
    const setStartDateMock = jest.fn();
    const setEndDateMock = jest.fn();
    const setWorkspaceMock = jest.fn();

    render(
      <Header
        startDate={moment().subtract(7, 'days').startOf('day').unix()}
        endDate={moment().startOf('day').unix()}
        setStartDate={setStartDateMock}
        setEndDate={setEndDateMock}
        workspace={''}
        setWorkspace={setWorkspaceMock}
      />
    );

    const dropDownButton = screen.getByTestId('DropDown');
    fireEvent.click(dropDownButton);

    const customOption = screen.getByText('Custom');
    fireEvent.click(customOption);

    expect(dropDownButton).toHaveTextContent('Custom');
  });

  test('displays current month and number of days dynamically based on current date', async () => {
    const setStartDateMock = jest.fn();
    const setEndDateMock = jest.fn();
    const setWorkspaceMock = jest.fn();

    const endDate = moment().startOf('day').unix();
    const startDate = moment().startOf('month').unix();

    render(
      <Header
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDateMock}
        setEndDate={setEndDateMock}
        workspace={''}
        setWorkspace={setWorkspaceMock}
      />
    );

    const dropDownButton = screen.getByTestId('DropDown');
    fireEvent.click(dropDownButton);

    waitFor(() => {
      const CurrentMonthOption = screen.getByText('Current Month');
      fireEvent.click(CurrentMonthOption);

      expect(dropDownButton).toHaveTextContent('Current Month');
    });

    const leftWrapperElement = screen.getByTestId('leftWrapper');
    const monthElement = within(leftWrapperElement).getByTestId('month');

    expect(monthElement).toBeInTheDocument();

    const expectedDateRange = `${moment.unix(startDate).format('DD MMM YYYY')} - ${moment
      .unix(endDate)
      .format('DD MMM YYYY')}`;
    expect(monthElement).toHaveTextContent(expectedDateRange);
  });
});

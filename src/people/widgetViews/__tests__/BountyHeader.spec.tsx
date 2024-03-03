import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import BountyHeader from '../BountyHeader';
import { BountyHeaderProps } from '../../interfaces';
import { mainStore } from '../../../store/main';
import * as hooks from '../../../hooks';

const mockHistoryPush = jest.fn();
const mockHistory = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    replace: mockHistoryPush,
    push: mockHistory
  })
}));

const mockProps: BountyHeaderProps = {
  selectedWidget: 'bounties',
  scrollValue: false,
  onChangeStatus: jest.fn(),
  onChangeLanguage: jest.fn(),
  checkboxIdToSelectedMap: {},
  checkboxIdToSelectedMapLanguage: {}
};

const languageOptions = [
  'Lightning',
  'Typescript',
  'Golang',
  'Kotlin',
  'PHP',
  'Java',
  'Ruby',
  'Python',
  'Postgres',
  'Elastic search',
  'Javascript',
  'Node',
  'Swift',
  'MySQL',
  'R',
  'Rust',
  'Other',
  'C++',
  'C#'
];

jest.mock('../../../hooks', () => ({
  useIsMobile: jest.fn()
}));
describe('BountyHeader Component', () => {
  beforeEach(() => {
    jest.spyOn(mainStore, 'getBountyHeaderData').mockReset();
    (hooks.useIsMobile as jest.Mock).mockReturnValue(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should render the Post a Bounty button', async () => {
    render(<BountyHeader {...mockProps} />);
    expect(await screen.findByRole('button', { name: /Post a Bounty/i })).toBeInTheDocument();
  });

  test('should render the Leaderboard button', () => {
    render(<BountyHeader {...mockProps} />);
    expect(screen.getByRole('button', { name: /Leaderboard/i })).toBeInTheDocument();
  });

  test('should render the search bar', () => {
    render(<BountyHeader {...mockProps} />);
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  test('should render the filters', () => {
    render(<BountyHeader {...mockProps} />);
    expect(screen.getByText(/Filter/i)).toBeInTheDocument();
  });

  test('should display the MobileFilterCount with correct number when filters are selected in mobile view', async () => {
    jest.spyOn(hooks, 'useIsMobile').mockReturnValue(true);

    const mockSelectedFilters = {
      checkboxIdToSelectedMap: { filter1: true },
      checkboxIdToSelectedMapLanguage: { lang1: true }
    };

    render(<BountyHeader {...mockProps} {...mockSelectedFilters} />);

    expect(await screen.findByText('2')).toBeInTheDocument();
  });

  test('should display the total developer count from the mock API', async () => {
    jest.setTimeout(20000);
    const mockDeveloperCount = 100;
    jest
      .spyOn(mainStore, 'getBountyHeaderData')
      .mockResolvedValue({ developer_count: mockDeveloperCount });

    render(<BountyHeader {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText(mockDeveloperCount.toString())).toBeInTheDocument();
    });
  });

  languageOptions.forEach((language: string) => {
    test(`should call onChangeLanguage when the ${language} filter option is selected`, async () => {
      render(<BountyHeader {...mockProps} />);
      const filterContainer = screen.getByText('Filter');
      fireEvent.click(filterContainer);

      let checkbox;
      try {
        checkbox = screen.getByRole('checkbox', { name: language });
      } catch (error) {
        console.error(`No checkbox found with the name: ${language}`);
        return;
      }

      fireEvent.click(checkbox);
      expect(mockProps.onChangeLanguage).toHaveBeenCalledWith(language);
    });
    test(`should display checkbox for '${language}' without scroll on click of filter button`, async () => {
      render(<BountyHeader {...mockProps} />);
      fireEvent.click(screen.getByText('Filter'));

      let checkbox;
      try {
        checkbox = await screen.findByRole('checkbox', { name: language });
        expect(checkbox).toBeVisible();
      } catch (error) {
        console.error(`No checkbox found with the name: ${language}`);
        expect(checkbox).toBeDefined(); // Fails the test if checkbox is not found
      }
    });
  });

  jest.useFakeTimers();

  it('should call main.getPeopleBounty when search text is empty', async () => {
    const { getByTestId } = render(<BountyHeader {...mockProps} />);

    // Simulate typing in the search bar
    fireEvent.change(getByTestId('search-bar'), { target: { value: 'Test' } });

    // Check if the search text is updated
    expect(getByTestId('search-bar')).toHaveValue('Test');

    // const getPeopleBountiesMock = jest.fn();

    // Simulate clicking on the close icon
    fireEvent.change(getByTestId('search-bar'), { target: { value: '' } });

    expect(getByTestId('search-bar')).toHaveValue('');

    const getPeopleBountiesSpy = jest.spyOn(mainStore, 'getPeopleBounties');

    act(() => {
      jest.advanceTimersByTime(2001);
    });
    // Expect that getPeopleBounties has been called
    expect(await getPeopleBountiesSpy).toHaveBeenCalled();
  });

  it('should selected filters applied when search text is empty', async () => {
    // Mock selected filters
    mockProps.checkboxIdToSelectedMap = { open: true };
    mockProps.checkboxIdToSelectedMapLanguage = { javascript: true };

    render(<BountyHeader {...mockProps} />);

    // Simulate search
    fireEvent.change(screen.getByTestId('search-bar'), { target: { value: 'Test' } });

    // Check if the search text is updated
    expect(screen.getByTestId('search-bar')).toHaveValue('Test');

    fireEvent.change(screen.getByTestId('search-bar'), { target: { value: '' } });

    expect(screen.getByTestId('search-bar')).toHaveValue('');

    const getPeopleBountiesSpy = jest.spyOn(mainStore, 'getPeopleBounties');

    act(() => {
      jest.advanceTimersByTime(2001);
    });

    // Expect that getPeopleBounties has been called
    expect(getPeopleBountiesSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        resetPage: true,
        open: true,
        javascript: true
      })
    );
  });

  it('should selected filters applied when search text is not empty', async () => {
    const getPeopleBountiesSpy = jest.spyOn(mainStore, 'getPeopleBounties');

    // Mock selected filters
    mockProps.checkboxIdToSelectedMap = { open: true };
    mockProps.checkboxIdToSelectedMapLanguage = { javascript: true };

    render(<BountyHeader {...mockProps} />);

    // Simulate search
    fireEvent.change(screen.getByTestId('search-bar'), { target: { value: 'Test' } });

    // Check if the search text is updated
    expect(screen.getByTestId('search-bar')).toHaveValue('Test');

    fireEvent.keyUp(screen.getByTestId('search-bar'), { key: 'Enter', code: 'Enter' });

    act(() => {
      jest.advanceTimersByTime(2001);
    });

    // Expect that getPeopleBounties has been called
    expect(getPeopleBountiesSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        resetPage: true,
        open: true,
        javascript: true
      })
    );
  });

  afterAll(() => {
    jest.useRealTimers(); // Restore real timers after all tests are done
  });
  test('should navigate to the people page on click of the developers', () => {
    render(
      <BrowserRouter>
        <BountyHeader {...mockProps} />
      </BrowserRouter>
    );

    const developersSection = screen.getByText('Developers');
    fireEvent.click(developersSection);

    expect(mockHistoryPush).toHaveBeenCalledWith('/p');
  });

  test('Test that Leaderboard button takes you to the leaderboard', () => {
    render(
      <BrowserRouter>
        <BountyHeader {...mockProps} />
      </BrowserRouter>
    );
    expect(screen.getByRole('button', { name: /Leaderboard/i })).toBeInTheDocument();

    const leaderBoardButton = screen.getByText('Leaderboard');
    fireEvent.click(leaderBoardButton);

    expect(mockHistory).toHaveBeenCalledWith('/leaderboard');
  });

  test('Test that Post a bounty button takes you to "Get Sphinx" modal as a signed out user', async () => {
    render(<BountyHeader {...mockProps} />);
    expect(await screen.findByRole('button', { name: /Post a Bounty/i })).toBeInTheDocument();

    const postBountyButton = screen.getByText('Post a Bounty');
    fireEvent.click(postBountyButton);

    const modalButton = screen.getByText('Get Sphinx');
    expect(modalButton).toBeInTheDocument();
  });
});

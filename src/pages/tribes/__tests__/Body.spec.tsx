import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useStores } from 'store';
import { useFuse } from 'hooks';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import Body from '../Body';

jest.mock('hooks', () => ({
  ...jest.requireActual('hooks'),
  useIsMobile: jest.fn(),
  useScreenWidth: jest.fn(),
  useFuse: jest.fn()
}));

jest.mock('store', () => ({
  useStores: jest.fn()
}));

describe('Tribes Body Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockTribeData = [
    {
      uuid: 'tribe1',
      unique_name: 'tribe_one',
      last_activity: '2021-07-01',
      members_count: 10,
      admin: 'Admin1',
      qr_code: 'QRCodeDummy',
      public_key: 'PublicKeyDummy'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useStores as jest.Mock).mockReturnValue({
      main: {
        tribes: mockTribeData,
        getTribes: jest.fn()
      },
      ui: {
        tribesPageNumber: 1,
        searchText: '',
        tags: []
      }
    });
  });

  test('should display No results when there are no tribes on search', async () => {
    // Mock return value for the store hook
    (useStores as jest.Mock).mockReturnValue({
      main: {
        tribes: [],
        getTribes: jest.fn()
      },
      ui: {
        peoplePageNumber: 1,
        searchText: 'abc',
        tags: []
      }
    });

    (useFuse as jest.Mock).mockReturnValue([]);

    // Render the component with a selected widget and empty lists
    render(<Body />);

    await waitFor(() => {
      expect(screen.getByText(/No results/i)).toBeInTheDocument();
    });
  });

  test('Public tribes are visible to users', async () => {
    act(async () => {
      render(<Body />);
      await waitFor(() => {
        expect(screen.getByText(mockTribeData[0].unique_name)).toBeInTheDocument();
      });
    });
  });

  test('Click on a tribe card to see its information', async () => {
    act(async () => {
      render(<Body />);
      await waitFor(() => {
        expect(screen.getByText(mockTribeData[0].unique_name)).toBeInTheDocument();
        userEvent.click(screen.getByText(mockTribeData[0].unique_name));
        expect(screen.getByText(mockTribeData[0].last_activity)).toBeInTheDocument();
        expect(screen.getByText(mockTribeData[0].members_count)).toBeInTheDocument();
        expect(screen.getByText(mockTribeData[0].admin)).toBeInTheDocument();
      });
    });
  });

  test('QR code to join the tribe is visible after selecting a tribe', async () => {
    act(async () => {
      render(<Body />);
      await waitFor(() => {
        expect(screen.getByText(mockTribeData[0].unique_name)).toBeInTheDocument();
        userEvent.click(screen.getByText(mockTribeData[0].unique_name));
        expect(screen.findByRole('svg', { name: 'qrcode' })).toBeInTheDocument();
      });
    });
  });

  test('Join button opens Sphinx app', async () => {
    act(async () => {
      render(<Body />);
      await waitFor(() => {
        expect(screen.getByText(mockTribeData[0].unique_name)).toBeInTheDocument();
        userEvent.click(screen.getByText(mockTribeData[0].unique_name));
        userEvent.click(screen.getByText(/Join/i));
        expect(window.open).toHaveBeenCalled();
      });
    });
  });

  test('Copy button copies the tribe public key', async () => {
    document.execCommand = jest.fn();
    act(async () => {
      render(<Body />);
      await waitFor(() => {
        expect(screen.getByText(mockTribeData[0].unique_name)).toBeInTheDocument();
        userEvent.click(screen.getByText(mockTribeData[0].unique_name));
        fireEvent.click(screen.getByText(/Copy/i));
        expect(document.execCommand).toHaveBeenCalledWith('copy');
      });
    });
  });

  test('Preview button takes you to a cached version of the chat', async () => {
    act(async () => {
      render(<Body />);
      await waitFor(() => {
        expect(screen.getByText(mockTribeData[0].unique_name)).toBeInTheDocument();
        userEvent.click(screen.getByText(mockTribeData[0].unique_name));
        userEvent.click(screen.getByText(/Preview/i));
        expect(window.open).toHaveBeenCalled();
      });
    });
  });
});

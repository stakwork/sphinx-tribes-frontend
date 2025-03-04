import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import StartUpModal from '../StartUpModal';
import api from '../../../api';
import { useStores } from '../../../store';

jest.mock('../../../api');
jest.mock('../../../store');
jest.mock('mobx-react-lite', () => ({
  observer: (component: any) => component
}));

const mockOpen = jest.fn();
window.open = mockOpen;

describe('StartUpModal', () => {
  const mockCloseModal = jest.fn();
  const mockSetShowSignIn = jest.fn();
  const mockDataObject = 'test-data';

  beforeEach(() => {
    jest.clearAllMocks();
    (useStores as jest.Mock).mockReturnValue({
      ui: {
        meInfo: null,
        setShowSignIn: mockSetShowSignIn
      }
    });
  });

  it('renders initial state (StepTwo view) correctly', () => {
    render(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    waitFor(() => {
      expect(screen.getByTestId('step-two')).toBeInTheDocument();
      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.getByText('Download App')).toBeInTheDocument();
      expect(screen.getByText('Android')).toBeInTheDocument();
      expect(screen.getByText('IOS')).toBeInTheDocument();
    });
  });

  it('opens correct URL when Android button is clicked', () => {
    render(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    fireEvent.click(screen.getByText('Android'));
    expect(mockOpen).toHaveBeenCalledWith(
      'https://play.google.com/store/apps/details?id=chat.sphinx.v2&hl=en_US',
      '_blank'
    );
  });

  it('opens correct URL when IOS button is clicked', () => {
    render(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    fireEvent.click(screen.getByText('IOS'));
    expect(mockOpen).toHaveBeenCalledWith('https://testflight.apple.com/join/p721ALD9', '_blank');
  });

  it('calls API and changes step when Reveal Connection Code is clicked', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({ connection_string: 'test-connection-string' });

    render(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    fireEvent.click(screen.getByText('Reveal Connection Code'));

    waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('connectioncodes');
      expect(screen.getByTestId('qrcode')).toBeInTheDocument();
    });
  });

  it('handles case when API returns no connection string', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({ connection_string: '' });

    render(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    fireEvent.click(screen.getByText('Reveal Connection Code'));

    waitFor(() => {
      expect(
        screen.getByText('We are out of codes to sign up! Please check again later.')
      ).toBeInTheDocument();
    });
  });

  it('resets step when Back button is clicked in QR view', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({ connection_string: 'test-connection-string' });

    render(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    fireEvent.click(screen.getByText('Reveal Connection Code'));
    waitFor(() => {
      expect(screen.getByTestId('qrcode')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Back'));
    waitFor(() => {
      expect(screen.getByTestId('step-two')).toBeInTheDocument();
    });
  });

  it('calls closeModal and setShowSignIn when Sign in button is clicked', () => {
    render(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    fireEvent.click(screen.getByText('Sign in'));

    expect(mockCloseModal).toHaveBeenCalled();
    expect(mockSetShowSignIn).toHaveBeenCalledWith(true);
  });

  it('does not call API when ui.meInfo exists', async () => {
    (useStores as jest.Mock).mockReturnValue({
      ui: {
        meInfo: { some: 'data' },
        setShowSignIn: mockSetShowSignIn
      }
    });

    render(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    fireEvent.click(screen.getByText('Reveal Connection Code'));
    waitFor(() => {
      expect(api.get).not.toHaveBeenCalled();
    });
  });

  it('does not call API when connection_string already exists', async () => {
    render(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    (api.get as jest.Mock).mockResolvedValueOnce({ connection_string: 'test-connection-string' });

    await act(async () => {
      fireEvent.click(screen.getByText('Reveal Connection Code'));
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByText('Back'));

    await act(async () => {
      fireEvent.click(screen.getByText('Reveal Connection Code'));
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(1);
    });
  });

  it('updates step when clicking on Android button', () => {
    render(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    fireEvent.click(screen.getByText('Android'));
    expect(screen.getByText('Step 2')).toBeInTheDocument();
  });

  it('updates step when clicking on IOS button', () => {
    render(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    fireEvent.click(screen.getByText('IOS'));
    expect(screen.getByText('Step 2')).toBeInTheDocument();
  });

  it('handles empty connection string response', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({ connection_string: '' });

    render(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Reveal Connection Code'));
    });

    await screen.findByText('We are out of codes to sign up! Please check again later.');
  });

  it('maintains step state between renders', () => {
    const { rerender } = render(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    fireEvent.click(screen.getByText('Android'));
    expect(screen.getByText('Step 2')).toBeInTheDocument();

    rerender(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    expect(screen.getByText('Step 2')).toBeInTheDocument();
  });

  it('should preserve connection string after multiple step changes', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({ connection_string: 'test-string' });

    render(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Reveal Connection Code'));
    });

    fireEvent.click(screen.getByText('Back'));

    await act(async () => {
      fireEvent.click(screen.getByText('Reveal Connection Code'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('qrcode')).toBeInTheDocument();
      expect(api.get).toHaveBeenCalledTimes(1);
    });
  });

  it('should maintain QR code visibility after component re-renders', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({ connection_string: 'test-string' });

    const { rerender } = render(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Reveal Connection Code'));
    });

    rerender(
      <StartUpModal closeModal={mockCloseModal} buttonColor="primary" dataObject={mockDataObject} />
    );

    expect(screen.getByTestId('qrcode')).toBeInTheDocument();
  });
});

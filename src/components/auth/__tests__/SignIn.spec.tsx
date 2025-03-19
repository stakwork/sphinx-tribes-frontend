import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { useStores } from 'store';
import SignIn from '../SignIn';

jest.mock('../../../store', () => ({
  useStores: jest.fn()
}));

const originalLocation = window.location;

beforeAll(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...originalLocation, href: '' }
  });
});

afterAll(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: originalLocation
  });
});

describe('SignIn Component', () => {
  const mockOnSuccess = jest.fn();
  const mockGetPeople = jest.fn();
  const mockSetMeInfo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useStores as jest.Mock).mockReturnValue({
      main: {
        getPeople: mockGetPeople
      },
      ui: {
        meInfo: { uuid: 'test-uuid' },
        setMeInfo: mockSetMeInfo
      }
    });
  });

  it('should redirect to the workspace page on successful login', async () => {
    render(<SignIn onSuccess={mockOnSuccess} />);

    const sphinxLoginButton = screen.getByText('Login with Sphinx');
    fireEvent.click(sphinxLoginButton);

    waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();

      expect(window.location.href).toBe('/p/test-uuid/workspaces');

      expect(mockGetPeople).toHaveBeenCalledWith({ resetPage: true });
    });
  });

  it('should redirect to the workspace page on successful LNAUTH login', async () => {
    render(<SignIn onSuccess={mockOnSuccess} />);

    waitFor(() => {
      const lnAuthButton = screen.getByText('Login with LNAUTH');
      fireEvent.click(lnAuthButton);

      const lnAuthLoginButton = screen.getByText('Login with Sphinx');
      fireEvent.click(lnAuthLoginButton);

      expect(mockOnSuccess).toHaveBeenCalled();

      expect(window.location.href).toBe('/p/test-uuid/workspaces');

      expect(mockGetPeople).toHaveBeenCalledWith({ resetPage: true });
    });
  });

  it('should render correctly on mobile view', () => {
    jest.mock('../../../hooks', () => ({
      useIsMobile: () => true
    }));

    waitFor(() => {
      render(<SignIn onSuccess={mockOnSuccess} />);

      expect(screen.getByAltText('Sphinx Logo')).toBeInTheDocument();
    });
  });

  it('should switch between login methods', () => {
    render(<SignIn onSuccess={mockOnSuccess} />);

    waitFor(() => {
      expect(screen.getByText('Login with Sphinx')).toBeInTheDocument();

      const lnAuthButton = screen.getByText('Login with LNAUTH');
      fireEvent.click(lnAuthButton);

      expect(screen.getByText('Login with Sphinx')).toBeInTheDocument();
    });
  });

  it('should handle login errors gracefully', async () => {
    mockGetPeople.mockImplementation(() => {
      throw new Error('Login failed');
    });

    render(<SignIn onSuccess={mockOnSuccess} />);

    waitFor(() => {
      const sphinxLoginButton = screen.getByText('Login with Sphinx');
      fireEvent.click(sphinxLoginButton);

      waitFor(() => {
        expect(screen.getByText('Login failed')).toBeInTheDocument();
      });
    });
  });
});

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useStores } from 'store';
import { DollarConverter, satToUsd, userHasRole } from 'helpers';
import WorkspaceBudget from '../workspace/WorkspaceBudget.tsx';

jest.mock('store');
jest.mock('helpers');

describe('WorkspaceBudget', () => {
  const mockMain = {
    getUserRoles: jest.fn(),
    bountyRoles: ['ADD USER', 'VIEW REPORT']
  };

  const mockUi = {
    meInfo: {
      owner_pubkey: 'owner123'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useStores as jest.Mock).mockReturnValue({ main: mockMain, ui: mockUi });
    (DollarConverter as jest.Mock).mockReturnValue('1,000');
    (satToUsd as jest.Mock).mockReturnValue('0.30');
    (userHasRole as jest.Mock).mockReturnValue(false);
    mockMain.getUserRoles.mockResolvedValue([]);
  });

  const defaultProps = {
    user_pubkey: 'user123',
    org: {
      uuid: 'org123',
      name: 'Test Workspace',
      budget: 1000,
      owner_pubkey: 'owner123'
    }
  };

  test('renders workspace name without budget for non-admin user without roles', async () => {
    render(<WorkspaceBudget {...defaultProps} />);

    waitFor(() => {
      expect(screen.getByText('Test Workspace')).toBeInTheDocument();
      expect(screen.queryByText(/SAT/)).not.toBeInTheDocument();
    });
  });

  test('renders workspace name and budget for workspace admin', async () => {
    render(<WorkspaceBudget {...defaultProps} />);

    waitFor(() => {
      expect(screen.getByText('Test Workspace')).toBeInTheDocument();
      expect(screen.getByText(/SAT/)).toBeInTheDocument();
      expect(screen.getByText(/USD/)).toBeInTheDocument();
    });
  });

  test('renders workspace name and budget for user with ADD USER role', async () => {
    (userHasRole as jest.Mock).mockReturnValue(true);
    mockMain.getUserRoles.mockResolvedValue(['ADD USER']);

    render(<WorkspaceBudget {...defaultProps} />);

    waitFor(() => {
      expect(screen.getByText('Test Workspace')).toBeInTheDocument();
      expect(screen.getByText(/SAT/)).toBeInTheDocument();
    });
  });

  test('handles null budget correctly', async () => {
    const propsWithNullBudget = {
      ...defaultProps,
      org: {
        ...defaultProps.org,
        budget: null
      }
    };

    render(<WorkspaceBudget {...propsWithNullBudget} />);

    waitFor(() => {
      expect(screen.getByText('Test Workspace')).toBeInTheDocument();
      expect(screen.getByText(/SAT/)).toBeInTheDocument();
      expect(DollarConverter).toHaveBeenCalledWith(0);
      expect(satToUsd).toHaveBeenCalledWith(0);
    });
  });

  test('handles undefined org properties', () => {
    const minimalProps = {
      user_pubkey: 'user123',
      org: {
        uuid: 'org123',
        name: 'Test Workspace'
      }
    };

    render(<WorkspaceBudget {...minimalProps} />);

    waitFor(() => {
      expect(screen.getByText('Test Workspace')).toBeInTheDocument();
      expect(screen.queryByText(/SAT/)).not.toBeInTheDocument();
    });
  });

  test('workspace link has correct href', () => {
    render(<WorkspaceBudget {...defaultProps} />);

    const link = screen.getByRole('link', { name: 'Test Workspace' });
    waitFor(() => {
      expect(link).toHaveAttribute('href', '/workspace/org123');
    });
  });

  test('getUserRoles is called with correct parameters', () => {
    render(<WorkspaceBudget {...defaultProps} />);

    waitFor(() => {
      expect(mockMain.getUserRoles).toHaveBeenCalledWith('org123', 'user123');
      expect(mockMain.getUserRoles).toHaveBeenCalledTimes(1);
    });
  });
});

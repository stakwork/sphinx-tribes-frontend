import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Workspace } from 'store/interface';
import EditWorkspaceModal from '../workspace/EditWorkspaceModal';
import { useStores } from '../../../store';

jest.mock('../../../store', () => ({
  useStores: jest.fn()
}));

const mockUpdateWorkspace = jest.fn();
const mockAddToast = jest.fn();

const mockWorkspace: Workspace = {
  id: '1',
  uuid: 'abc123',
  name: 'Tech Innovators Ltd.',
  website: 'https://test.org',
  github: 'https://github.com/stakwork',
  description: 'Test Descirption',
  owner_pubkey: 'xyz456',
  img: 'https://example.com/logo.png',
  created: '2024-01-15T12:00:00Z',
  updated: '2024-01-15T14:30:00Z',
  show: true,
  bounty_count: 5,
  budget: 100000,
  deleted: false
};

const props = {
  ...mockWorkspace,
  isOpen: true,
  onDelete: () => null,
  resetWorkspace: () => null,
  addToast: () => null,
  close: () => null
};

beforeEach(() => {
  mockUpdateWorkspace.mockReset();
  mockAddToast.mockReset();

  (useStores as jest.Mock).mockReturnValue({
    main: {
      updateWorkspace: mockUpdateWorkspace
    },
    ui: {
      meInfo: { owner_pubkey: 'xyz456' }
    }
  });
});

describe('EditWorkspaceModal Component', () => {
  test('displays the Workspace Name text field', () => {
    render(<EditWorkspaceModal {...props} />);
    expect(screen.getAllByText(/Workspace Name/i)).toHaveLength(2);
  });

  test('displays the Website text field', () => {
    render(<EditWorkspaceModal {...props} />);
    expect(screen.getAllByText(/Website/i)).toHaveLength(2);
  });

  test('displays the Github repo text field', () => {
    render(<EditWorkspaceModal {...props} />);
    expect(screen.getAllByText(/Github repo/i)).toHaveLength(2);
  });

  test('Padding for the Github repo text field should not be 0', () => {
    render(<EditWorkspaceModal {...props} />);
    expect(screen.getByLabelText(/Github repo/i)).not.toHaveStyle('padding: 0');
  });

  test('displays the Description box', () => {
    render(<EditWorkspaceModal {...props} />);
    expect(screen.getAllByText(/Description/i)).toHaveLength(2);
  });

  test('displays the Save changes button', () => {
    render(<EditWorkspaceModal {...props} />);
    expect(screen.getByText(/Save changes/i)).toBeInTheDocument();
  });

  test('displays the Delete button', () => {
    render(<EditWorkspaceModal {...props} />);
    expect(screen.getByText(/Delete Workspace/i)).toBeInTheDocument();
  });

  test('Save button is enabled if name have a value, and website, github, logo, description are empty', async () => {
    render(<EditWorkspaceModal {...props} />);

    fireEvent.change(screen.getByLabelText(/Workspace Name/i) as HTMLInputElement, {
      target: { value: 'Updated Workspace' }
    });

    await waitFor(() => {
      fireEvent.change(screen.getByLabelText(/Description/i) as HTMLInputElement, {
        target: { value: '' }
      });
      fireEvent.change(screen.getByLabelText(/Website/i) as HTMLInputElement, {
        target: { value: '' }
      });
      fireEvent.change(screen.getByLabelText(/Github repo/i) as HTMLInputElement, {
        target: { value: '' }
      });
      expect(screen.getByText(/Save changes/i)).toBeEnabled();
    });
  });

  test('Entering text in GitHub field does not increase character count in description field', async () => {
    render(<EditWorkspaceModal {...props} />);

    const initialDescriptionElement = screen.getByLabelText(/Description/i) as HTMLInputElement;
    const initialDescriptionLength = initialDescriptionElement.value.length;

    fireEvent.change(screen.getByLabelText(/Github repo/i) as HTMLInputElement, {
      target: { value: 'https://github.com/newRepo_testing_of_the_bounty' }
    });

    const updatedDescriptionElement = screen.getByLabelText(/Description/i) as HTMLInputElement;
    const updatedDescriptionLength = updatedDescriptionElement.value.length;

    expect(updatedDescriptionLength).toBe(initialDescriptionLength);
  });

  test('Entering text in Website field does not increase character count in description field', async () => {
    render(<EditWorkspaceModal {...props} />);

    const initialDescriptionElement = screen.getByLabelText(/Description/i) as HTMLInputElement;
    const initialDescriptionLength = initialDescriptionElement.value.length;

    fireEvent.change(screen.getByLabelText(/Website/i) as HTMLInputElement, {
      target: { value: 'https://test.org_the_sphinx_second_brain' }
    });

    const updatedDescriptionElement = screen.getByLabelText(/Description/i) as HTMLInputElement;
    const updatedDescriptionLength = updatedDescriptionElement.value.length;

    expect(updatedDescriptionLength).toBe(initialDescriptionLength);
  });

  test('Nothing happens if only spaces are entered in the Workspace Name', async () => {
    render(<EditWorkspaceModal {...props} />);

    const orgNameInput = screen.getByLabelText(/Workspace Name/i) as HTMLInputElement;
    fireEvent.change(orgNameInput, { target: { value: '   ' } });

    const saveChangesButton = screen.getByText('Save changes');
    fireEvent.click(saveChangesButton);

    await waitFor(() => {
      expect(mockUpdateWorkspace).not.toHaveBeenCalled();
      expect(mockAddToast).not.toHaveBeenCalledWith('Successfully updated workspace', 'success');
    });
  });
});

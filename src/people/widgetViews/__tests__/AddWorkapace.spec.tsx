import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { mainStore } from 'store/main';
import AddWorkspace from '../workspace/AddWorkspace';
const mockCloseHandler = jest.fn();
const mockGetUserWorkspaces = jest.fn();
const mockAddToast = jest.fn();
const mockOwnerPubKey = 'somePublicKey';

describe('AddWorkspace Component Tests', () => {
  beforeEach(() => {
    mockCloseHandler.mockReset();
    mockGetUserWorkspaces.mockReset();
    mockAddToast.mockReset();
    jest.clearAllMocks();
  });

  test('Workspace Name text field appears', () => {
    render(
      <AddWorkspace
        closeHandler={mockCloseHandler}
        getUserWorkspaces={mockGetUserWorkspaces}
        owner_pubkey={mockOwnerPubKey}
      />
    );
    expect(screen.getByPlaceholderText('My Workspace...')).toBeInTheDocument();
  });

  test('Website text field appears', () => {
    render(
      <AddWorkspace
        closeHandler={mockCloseHandler}
        getUserWorkspaces={mockGetUserWorkspaces}
        owner_pubkey={mockOwnerPubKey}
      />
    );
    expect(screen.getByPlaceholderText('Website URL...')).toBeInTheDocument();
  });

  test('Github repo text field appears', () => {
    render(
      <AddWorkspace
        closeHandler={mockCloseHandler}
        getUserWorkspaces={mockGetUserWorkspaces}
        owner_pubkey={mockOwnerPubKey}
      />
    );
    expect(screen.getByPlaceholderText('Github link...')).toBeInTheDocument();
  });

  test('Logo button appears', () => {
    render(
      <AddWorkspace
        closeHandler={mockCloseHandler}
        getUserWorkspaces={mockGetUserWorkspaces}
        owner_pubkey={mockOwnerPubKey}
      />
    );
    expect(screen.getByText('LOGO')).toBeInTheDocument();
  });

  test('Description box appears', () => {
    render(
      <AddWorkspace
        closeHandler={mockCloseHandler}
        getUserWorkspaces={mockGetUserWorkspaces}
        owner_pubkey={mockOwnerPubKey}
      />
    );
    expect(screen.getByPlaceholderText('Description Text...')).toBeInTheDocument();
  });

  test('Add Workspace button appears', () => {
    render(
      <AddWorkspace
        closeHandler={mockCloseHandler}
        getUserWorkspaces={mockGetUserWorkspaces}
        owner_pubkey={mockOwnerPubKey}
      />
    );
    expect(screen.getByText('Add Workspace')).toBeInTheDocument();
  });

  test('Workspace Name character limit restriction works', () => {
    render(
      <AddWorkspace
        closeHandler={mockCloseHandler}
        getUserWorkspaces={mockGetUserWorkspaces}
        owner_pubkey={mockOwnerPubKey}
      />
    );

    const orgNameInput = screen.getByPlaceholderText(/My Workspace.../i);
    fireEvent.change(orgNameInput, { target: { value: '123456789012345678901' } });

    expect(orgNameInput).toHaveStyle('border-color: #FF8F80');
    expect(screen.getByText('Name is too long.')).toBeInTheDocument();
  });

  test('Workspace Description character limit restriction works', () => {
    render(
      <AddWorkspace
        closeHandler={mockCloseHandler}
        getUserWorkspaces={mockGetUserWorkspaces}
        owner_pubkey={mockOwnerPubKey}
      />
    );

    const descriptionInput = screen.getByPlaceholderText(/Description Text.../i);
    fireEvent.change(descriptionInput, {
      target: {
        value:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam faucibus interdum nunc id malesuada. Nullam iaculis augue nec libero malesuada '
      }
    });

    expect(descriptionInput).toHaveStyle({
      borderColor: '#FF8F80'
    });
    expect(screen.getByText('Description is too long.')).toBeInTheDocument();
  });

  test('Clicking on Add Workspace button triggers an action', async () => {
    const mockCloseHandler = jest.fn();
    const mockGetUserWorkspaces = jest.fn();
    const mockOwnerPubKey = 'somePublicKey';
    jest.spyOn(mainStore, 'addWorkspace').mockReturnValueOnce(
      Promise.resolve({
        status: 200,
        json: () => Promise.resolve({})
      })
    );

    render(
      <AddWorkspace
        closeHandler={mockCloseHandler}
        getUserWorkspaces={mockGetUserWorkspaces}
        owner_pubkey={mockOwnerPubKey}
      />
    );

    const addButton = screen.getByText('Add Workspace');
    expect(addButton).toBeInTheDocument();
    const orgNameInput = screen.getByPlaceholderText(/My Workspace.../i);
    fireEvent.change(orgNameInput, { target: { value: 'My Workspace' } });

    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockCloseHandler).toHaveBeenCalled();
      expect(mockGetUserWorkspaces).toHaveBeenCalled();
    });
  });

  test('all fields are passed while adding workspace', async () => {
    const mockGetUserWorkspaces = jest.fn();
    const mockOwnerPubKey = 'somePublicKey';
    const mockWorkspaceSpy = jest.spyOn(mainStore, 'addWorkspace').mockReturnValueOnce(
      Promise.resolve({
        status: 200,
        json: () => Promise.resolve({})
      })
    );

    render(
      <AddWorkspace
        closeHandler={mockCloseHandler}
        getUserWorkspaces={mockGetUserWorkspaces}
        owner_pubkey={mockOwnerPubKey}
      />
    );

    const addButton = screen.getByText('Add Workspace');
    expect(addButton).toBeInTheDocument();
    const orgNameInput = screen.getByPlaceholderText(/My Workspace.../i);
    fireEvent.change(orgNameInput, { target: { value: 'My Workspace' } });

    const orgWebsiteInput = screen.getByPlaceholderText('Website URL...');
    fireEvent.change(orgWebsiteInput, { target: { value: 'https://john.doe' } });

    const orgGithubLink = screen.getByPlaceholderText('Github link...');
    fireEvent.change(orgGithubLink, { target: { value: 'https://github.com/john-doe' } });

    const orgDescription = screen.getByPlaceholderText('Description Text...');
    fireEvent.change(orgDescription, { target: { value: 'My org description' } });

    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockWorkspaceSpy).toHaveBeenCalledWith({
        owner_pubkey: mockOwnerPubKey,
        name: 'My Workspace',
        description: 'My org description',
        img: '',
        github: 'https://github.com/john-doe',
        website: 'https://john.doe'
      });
      expect(mockGetUserWorkspaces).toHaveBeenCalled();
    });
  });

  test('Nothing happens if only spaces are entered in the Workspace Name', async () => {
    jest
      .spyOn(mainStore, 'addWorkspace')
      .mockImplementation(() => Promise.resolve({ status: 200 }));

    render(
      <AddWorkspace
        closeHandler={mockCloseHandler}
        getUserWorkspaces={mockGetUserWorkspaces}
        owner_pubkey={mockOwnerPubKey}
      />
    );

    const orgNameInput = screen.getByPlaceholderText('My Workspace...');
    fireEvent.change(orgNameInput, { target: { value: '   ' } });

    const addButton = screen.getByText('Add Workspace');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mainStore.addWorkspace).not.toHaveBeenCalled();
      expect(mockCloseHandler).not.toHaveBeenCalled();
      expect(mockGetUserWorkspaces).not.toHaveBeenCalled();
      expect(mockAddToast).not.toHaveBeenCalledWith('Workspace created successfully', 'success');
    });
  });
});

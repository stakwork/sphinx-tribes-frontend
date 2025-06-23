import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { EuiGlobalToastList, EuiLoadingSpinner } from '@elastic/eui';
import { Box } from '@mui/system';
import { useDeleteConfirmationModal } from '../../../components/common';
import { useStores } from '../../../store';
import { Toast } from './interface.ts';
import { TextInput } from './style.ts';

const ModalContainer = styled.div`
  width: 600px;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
`;

const Header = styled.h2`
  margin-bottom: 20px;
`;

const Label = styled.label`
  font-weight: bold;
  font-size: 16px;
  width: 120px;
`;

const ValueText = styled.p`
  font-size: 16px;
  margin-top: 15px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  color: white;
  background: ${(props) =>
    props.color === 'primary' ? '#007bff' : props.color === 'danger' ? '#dc3545' : '#6c757d'};

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 10px;
  width: 100%;
`;

const ModalInnerWrapper = styled.div`
  margin-left: 20px;
`;

interface CodeSpaceMap {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  workspaceID: string;
  codeSpaceURL: string;
  userPubkey: string;
  username?: string;
  githubPat?: string;
  baseBranch?: string;
}

interface CodeSpaceProps {
  closeHandler: () => void;
  workspaceUUID: string;
  workspaceName?: string;
  userAlias?: string;
}

const ManageCodeSpaceModal: React.FC<CodeSpaceProps> = ({
  closeHandler,
  workspaceUUID,
  workspaceName,
  userAlias
}) => {
  const { main, ui } = useStores();
  const [codeSpace, setCodeSpace] = useState<CodeSpaceMap | null>(null);
  const [username, setUsername] = useState('');
  const [githubPat, setGithubPat] = useState('');
  const [baseBranch, setBaseBranch] = useState('');
  const [urlError, setUrlError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const { openDeleteConfirmation } = useDeleteConfirmationModal();

  const addToast = (title: string, color: 'success' | 'danger', text: string) => {
    setToasts([{ id: `${Date.now()}-codespace`, title, color, text }]);
  };

  const isValidUrl = (url: string) => {
    try {
      const validUrl = new URL(url);
      return validUrl.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const isValidCodeSpaceInput = (input: string) => {
    // Allow both URLs and freetext entries (e.g., 'hive', 'tribes')
    // Return true for any non-empty string
    return input.trim().length > 0;
  };

  useEffect(() => {
    const fetchCodeSpace = async () => {
      try {
        const response = await main.getCodeSpace(workspaceUUID);
        if (response && response.id) {
          // Check if response is valid and has an ID
          setCodeSpace(response);
          setUsername(response.username || ''); // Initialize Username state
          setGithubPat(response.githubPat || ''); // Initialize PAT state
          setBaseBranch(response.baseBranch || ''); // Initialize Base Branch state
          setUrlError(!isValidCodeSpaceInput(response.codeSpaceURL)); // Also validate fetched input
        } else {
          // Initialize state for creating a new code space
          setCodeSpace({
            id: '',
            createdAt: '',
            updatedAt: '',
            workspaceID: workspaceUUID,
            codeSpaceURL: '',
            userPubkey: ui.meInfo?.pubkey || ''
          });
        }
      } catch (error) {
        console.error('Error fetching CodeSpace:', error);
      }
    };

    fetchCodeSpace();
  }, [workspaceUUID, main, ui]);

  const handleDelete = async () => {
    if (!codeSpace?.id) return;
    setIsDeleteLoading(true);
    try {
      await main.deleteCodeSpace(codeSpace.id);
      addToast('Success', 'success', 'Code Space deleted successfully!');
      setCodeSpace(null);
      closeHandler();
    } catch (error) {
      addToast('Error', 'danger', 'Failed to delete Code Space');
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const deleteHandler = () => {
    openDeleteConfirmation({
      onDelete: handleDelete,
      children: (
        <Box fontSize={20} textAlign="center">
          Are you sure you want to <br />
          <Box component="span" fontWeight="500">
            Delete Code Space?
          </Box>
        </Box>
      )
    });
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!codeSpace) return;
    const newUrl = e.target.value;
    setCodeSpace({ ...codeSpace, codeSpaceURL: newUrl });
    setUrlError(!isValidCodeSpaceInput(newUrl));
  };

  const handlePatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGithubPat(e.target.value);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleBaseBranchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBaseBranch(e.target.value);
  };

  const handleSave = async () => {
    if (!codeSpace || !isValidCodeSpaceInput(codeSpace.codeSpaceURL)) return;

    setIsLoading(true);
    try {
      // Prepare the payload including the username, githubPat and baseBranch
      const payload = {
        ...codeSpace,
        username: username, // Add the Username from state
        githubPat: githubPat, // Add the PAT from state
        baseBranch: baseBranch, // Add the Base Branch from state
        workspaceID: workspaceUUID, // Ensure workspaceID is always set
        userPubkey: ui.meInfo?.pubkey || '' // Ensure userPubkey is always set
      };

      if (codeSpace.id) {
        // Update existing code space
        await main.updateCodeSpace(payload, codeSpace.id);
        addToast('Success', 'success', 'Code Space updated successfully!');
      } else {
        // Create new code space
        // Remove id, createdAt, updatedAt before creating
        const createPayload: Omit<CodeSpaceMap, 'id' | 'createdAt' | 'updatedAt'> & {
          username?: string;
          githubPat?: string;
          baseBranch?: string;
        } = {
          workspaceID: workspaceUUID,
          codeSpaceURL: codeSpace.codeSpaceURL,
          userPubkey: ui.meInfo?.pubkey || '',
          username: username,
          githubPat: githubPat,
          baseBranch: baseBranch
        };
        const newCodeSpace = await main.createCodeSpace(createPayload);
        if (newCodeSpace) {
          setCodeSpace(newCodeSpace);
          addToast('Success', 'success', 'Code Space created successfully!');
        }
      }
      closeHandler();
    } catch (error) {
      addToast('Error', 'danger', 'Failed to save Code Space');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalContainer>
      <Header>Code Space Management</Header>
      <ModalInnerWrapper>
        {workspaceName && (
          <Wrapper>
            <Label>Workspace:</Label>
            <ValueText>{workspaceName}</ValueText>
          </Wrapper>
        )}
        {userAlias && (
          <Wrapper>
            <Label>User:</Label>
            <ValueText>{userAlias}</ValueText>
          </Wrapper>
        )}
        <Wrapper>
          <Label>Codespace:</Label>
          <TextInput
            type="text"
            placeholder="Enter Code Space URL"
            value={codeSpace?.codeSpaceURL || ''}
            onChange={handleUrlChange}
            style={{ borderColor: urlError ? '#FF8F80' : '' }}
          />
        </Wrapper>
        <Wrapper>
          <Label>Username:</Label>
          <TextInput
            type="text"
            placeholder="Enter GitHub Username"
            value={username}
            onChange={handleUsernameChange}
          />
        </Wrapper>
        <Wrapper>
          <Label>GitHub PAT:</Label>
          <TextInput
            type="password" // Use password type for masking
            placeholder="Enter GitHub Personal Access Token"
            value={githubPat}
            onChange={handlePatChange}
          />
        </Wrapper>
        <Wrapper>
          <Label>Base Branch:</Label>
          <TextInput
            type="text"
            placeholder="Enter Base Branch (e.g., main, master)"
            value={baseBranch}
            onChange={handleBaseBranchChange}
          />
        </Wrapper>
        {urlError && (
          <p style={{ color: 'red', fontSize: '12px', marginLeft: '33%' }}>
            Enter a valid codespace url or pool name.
          </p>
        )}
        <ButtonGroup>
          <Button onClick={closeHandler} color="cancel">
            Cancel
          </Button>
          {codeSpace?.id && (
            <Button onClick={deleteHandler} color="danger">
              {isDeleteLoading ? <EuiLoadingSpinner size="m" /> : 'Delete'}
            </Button>
          )}
          <Button
            onClick={handleSave}
            color="primary"
            disabled={urlError || !codeSpace?.codeSpaceURL}
          >
            {isLoading ? <EuiLoadingSpinner size="m" /> : codeSpace?.id ? 'Update' : 'Create'}
          </Button>
        </ButtonGroup>
        <EuiGlobalToastList
          toasts={toasts}
          dismissToast={() => setToasts([])}
          toastLifeTimeMs={3000}
        />
      </ModalInnerWrapper>
    </ModalContainer>
  );
};

export default ManageCodeSpaceModal;

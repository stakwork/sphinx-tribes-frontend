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
  const [urlError, setUrlError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const { openDeleteConfirmation } = useDeleteConfirmationModal();

  const addToast = (title: string, color: 'success' | 'danger', text: string) => {
    setToasts([{ id: `${Date.now()}-codespace`, title, color, text }]);
  };

  useEffect(() => {
    const fetchCodeSpace = async () => {
      try {
        const response = await main.getCodeSpace(workspaceUUID);
        if (response) {
          setCodeSpace(response);
        } else {
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

  const isValidUrl = (url: string) => {
    try {
      const validUrl = new URL(url);
      return validUrl.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!codeSpace) return;
    const newUrl = e.target.value;
    setCodeSpace({ ...codeSpace, codeSpaceURL: newUrl });
    setUrlError(!isValidUrl(newUrl));
  };

  const handleSave = async () => {
    if (!codeSpace || !isValidUrl(codeSpace.codeSpaceURL)) return;

    setIsLoading(true);
    try {
      if (codeSpace.id) {
        await main.updateCodeSpace(codeSpace, codeSpace.id);
        addToast('Success', 'success', 'Code Space updated successfully!');
      } else {
        const payload = {
          workspaceID: workspaceUUID,
          codeSpaceURL: codeSpace.codeSpaceURL,
          userPubkey: ui.meInfo?.pubkey || ''
        };
        const newCodeSpace = await main.createCodeSpace(payload);
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
        {urlError && (
          <p style={{ color: 'red', fontSize: '12px', marginLeft: '33%' }}>
            Invalid URL. Ensure it starts with https://
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

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useStores } from 'store';
import { EuiGlobalToastList, EuiLoadingSpinner } from '@elastic/eui';
import { normalizeInput } from '../../../helpers';
import { Toast } from './interface';
import {
  TextInput,
  WorkspaceInputContainer,
  WorkspaceLabel,
  ActionButton,
  ButtonWrap
} from './style';

const AddWorkspaceWrapper = styled.div`
  min-width: 100%;
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;

  @media only screen and (max-width: 500px) {
    padding: 1rem;
    width: 100%;
  }
`;

const AddWorkspaceHeader = styled.h2`
  color: #3c3f41;
  font-family: 'Barlow';
  font-size: 1.875rem;
  font-style: normal;
  font-weight: 800;
  line-height: 1.875rem;
  margin-bottom: 0;
  min-width: 100%;

  @media only screen and (max-width: 500px) {
    text-align: center;
    font-size: 1.4rem;
  }
`;
const WorkspaceDetailsContainer = styled.div`
  margin-top: 3rem;
  min-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  @media only screen and (max-width: 500px) {
    flex-direction: column;
  }
`;

const FooterContainer = styled.div`
  display: flex;
  gap: 2rem;
  align-items: end;
  justify-content: space-between;
  margin-top: 15px;

  @media only screen and (max-width: 500px) {
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 10px;
  }
`;

const errcolor = '#FF8F80';

const MAX_NAME_LENGTH = 50;

const AddRepo = (props: {
  closeHandler: () => void;
  getRepositories: () => void;
  handleDelete: () => void;
  workspace_uuid: string | undefined;
  modalType: string;
  currentUuid: string;
  name: string;
  url: string;
}) => {
  const {
    workspace_uuid,
    getRepositories,
    closeHandler,
    modalType,
    currentUuid,
    handleDelete,
    name,
    url
  } = props;
  const [repoName, setRepoName] = useState('');
  const [repoNameError, setRepoNameError] = useState<boolean>(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [repoUrlError, setRepoUrlError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [originalValues, setOriginalValues] = useState({ name: '', url: '' });
  const { main } = useStores();
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Initialize form values and track original values for change detection
  useEffect(() => {
    if (modalType === 'edit') {
      setRepoName(name || '');
      setRepoUrl(url || '');
      setOriginalValues({ name: name || '', url: url || '' });
      setHasChanges(false);
    } else {
      setRepoName('');
      setRepoUrl('');
      setOriginalValues({ name: '', url: '' });
      setHasChanges(false);
    }
  }, [modalType, name, url]);

  // Check for changes in edit mode
  useEffect(() => {
    if (modalType === 'edit') {
      const nameChanged = repoName !== originalValues.name;
      const urlChanged = repoUrl !== originalValues.url;
      setHasChanges(nameChanged || urlChanged);
    } else {
      setHasChanges(true); // Always allow creation when fields are valid
    }
  }, [repoName, repoUrl, originalValues, modalType]);

  const handleRepoNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_NAME_LENGTH) {
      setRepoName(newValue);
      setRepoNameError(false);
    } else {
      setRepoNameError(true);
    }
  };

  const handleRepoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setRepoUrl(newValue);
    setRepoUrlError(false);
  };

  function addSuccessToast() {
    setToasts([
      {
        id: '1',
        title: 'Add Repository',
        color: 'success',
        text: 'Repository added successfully'
      }
    ]);
  }

  function addErrorToast(text: string) {
    setToasts([
      {
        id: '2',
        title: 'Add Repository',
        color: 'danger',
        text
      }
    ]);
  }

  function removeToast() {
    setToasts([]);
  }

  const AddRepos = async () => {
    try {
      setIsLoading(true);

      const repo = {
        workspace_uuid,
        name: normalizeInput(repoName),
        url: repoUrl
      };
      await main.createOrUpdateRepository1(repo);
      addSuccessToast();
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      addErrorToast(String(error));
      setIsLoading(false);
    }
    getRepositories();
  };

  const EditRepos = async () => {
    try {
      setIsLoading(true);
      const repo = {
        uuid: currentUuid,
        name: normalizeInput(repoName),
        url: repoUrl,
        workspace_uuid
      };
      await main.createOrUpdateRepository(repo);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
    getRepositories();
  };

  const handleSave = () => {
    if (modalType === 'add') {
      AddRepos();
    } else if (modalType === 'edit') {
      EditRepos();
    }
    closeHandler();
  };

  return (
    <AddWorkspaceWrapper>
      <AddWorkspaceHeader>
        {modalType === 'add' ? 'Add New Repository' : 'Edit Repository'}
      </AddWorkspaceHeader>
      <WorkspaceDetailsContainer>
        <WorkspaceInputContainer feature={true} style={{ color: repoNameError ? errcolor : '' }}>
          <WorkspaceLabel style={{ color: repoNameError ? errcolor : '' }}>
            Repository name *
          </WorkspaceLabel>
          <TextInput
            placeholder="Repository name"
            value={repoName}
            feature={true}
            data-testid="repo-name-input"
            onChange={handleRepoNameChange}
            style={{ borderColor: repoNameError ? errcolor : '' }}
          />
        </WorkspaceInputContainer>
        <WorkspaceInputContainer feature={true} style={{ color: repoUrlError ? errcolor : '' }}>
          <WorkspaceLabel style={{ color: repoUrlError ? errcolor : '' }}>
            Repository url *
          </WorkspaceLabel>
          <TextInput
            placeholder="Repository url"
            value={repoUrl}
            feature={true}
            data-testid="repo-url-input"
            onChange={handleRepoUrlChange}
            style={{ borderColor: repoUrlError ? errcolor : '' }}
          />
        </WorkspaceInputContainer>
      </WorkspaceDetailsContainer>
      <FooterContainer>
        <ButtonWrap>
          <ActionButton
            data-testid="feature-cancel-btn"
            onClick={props.closeHandler}
            color="cancel"
          >
            Cancel
          </ActionButton>
          <ActionButton
            disabled={
              repoNameError || 
              !repoName || 
              !repoUrl || 
              (modalType === 'edit' && !hasChanges)
            }
            data-testid="add-repo-btn"
            color="primary"
            onClick={handleSave}
          >
            {isLoading ? (
              <EuiLoadingSpinner size="m" />
            ) : (
              modalType === 'add' ? 'Create' : 'Update'
            )}
          </ActionButton>
          {modalType === 'edit' && (
            <ActionButton data-testid="delete-repo-btn" color="danger" onClick={handleDelete}>
              {isLoading ? <EuiLoadingSpinner size="m" /> : 'Delete'}
            </ActionButton>
          )}
        </ButtonWrap>
      </FooterContainer>
      <EuiGlobalToastList toasts={toasts} dismissToast={removeToast} toastLifeTimeMs={3000} />
    </AddWorkspaceWrapper>
  );
};

export default AddRepo;

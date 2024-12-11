import React, { useState } from 'react';
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
`;

const FooterContainer = styled.div`
  display: flex;
  gap: 2rem;
  align-items: end;
  justify-content: space-between;
  margin-top: 15px;
`;

const errcolor = '#FF8F80';
const MAX_NAME_LENGTH = 50;

interface AddCodeGraphProps {
  closeHandler: () => void;
  getCodeGraph: () => void;
  handleDelete?: () => void;
  workspace_uuid: string;
  modalType: 'add' | 'edit';
  currentUuid?: string;
  name?: string;
  url?: string;
}

const AddCodeGraph: React.FC<AddCodeGraphProps> = ({
  closeHandler,
  getCodeGraph,
  workspace_uuid,
  modalType,
  currentUuid,
  handleDelete,
  name = '',
  url = ''
}: AddCodeGraphProps) => {
  const [graphName, setGraphName] = useState(name);
  const [graphNameError, setGraphNameError] = useState(false);
  const [graphUrl, setGraphUrl] = useState(url);
  const [graphUrlError, setGraphUrlError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { main } = useStores();
  const [toasts, setToasts] = useState<Toast[]>([]);

  const handleGraphNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_NAME_LENGTH) {
      setGraphName(newValue);
      setGraphNameError(false);
    } else {
      setGraphNameError(true);
    }
  };

  const handleGraphUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setGraphUrl(newValue);
    setGraphUrlError(false);
  };

  const addSuccessToast = () => {
    setToasts([
      {
        id: '1',
        title: 'Code Graph',
        color: 'success',
        text: 'Code Graph added successfully'
      }
    ]);
  };

  const addErrorToast = (text: string) => {
    setToasts([
      {
        id: '2',
        title: 'Code Graph',
        color: 'danger',
        text
      }
    ]);
  };

  const removeToast = () => {
    setToasts([]);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const codeGraph = {
        workspace_uuid,
        uuid: currentUuid || '',
        name: normalizeInput(graphName),
        url: graphUrl
      };

      await main.createOrUpdateCodeGraph(codeGraph);
      addSuccessToast();
      getCodeGraph();
      closeHandler();
    } catch (error) {
      console.error(error);
      addErrorToast(String(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AddWorkspaceWrapper>
      <AddWorkspaceHeader>
        {modalType === 'add' ? 'Add New Code Graph' : 'Edit Code Graph'}
      </AddWorkspaceHeader>
      <WorkspaceDetailsContainer>
        <WorkspaceInputContainer feature={true} style={{ color: graphNameError ? errcolor : '' }}>
          <WorkspaceLabel style={{ color: graphNameError ? errcolor : '' }}>
            Code Graph name *
          </WorkspaceLabel>
          <TextInput
            placeholder="Code Graph name"
            value={graphName}
            feature={true}
            data-testid="graph-name-input"
            onChange={handleGraphNameChange}
            style={{ borderColor: graphNameError ? errcolor : '' }}
          />
        </WorkspaceInputContainer>
        <WorkspaceInputContainer feature={true} style={{ color: graphUrlError ? errcolor : '' }}>
          <WorkspaceLabel style={{ color: graphUrlError ? errcolor : '' }}>
            Code Graph url *
          </WorkspaceLabel>
          <TextInput
            placeholder="Code Graph url"
            value={graphUrl}
            feature={true}
            data-testid="graph-url-input"
            onChange={handleGraphUrlChange}
            style={{ borderColor: graphUrlError ? errcolor : '' }}
          />
        </WorkspaceInputContainer>
      </WorkspaceDetailsContainer>
      <FooterContainer>
        <ButtonWrap>
          <ActionButton data-testid="codegraph-cancel-btn" onClick={closeHandler} color="cancel">
            Cancel
          </ActionButton>
          <ActionButton
            disabled={graphNameError || !graphName || !graphUrl}
            data-testid="add-codegraph-btn"
            color="primary"
            onClick={handleSave}
          >
            {isLoading ? <EuiLoadingSpinner size="m" /> : 'Save'}
          </ActionButton>
          {modalType === 'edit' && handleDelete && (
            <ActionButton data-testid="delete-codegraph-btn" color="danger" onClick={handleDelete}>
              {isLoading ? <EuiLoadingSpinner size="m" /> : 'Delete'}
            </ActionButton>
          )}
        </ButtonWrap>
      </FooterContainer>
      <EuiGlobalToastList toasts={toasts} dismissToast={removeToast} toastLifeTimeMs={3000} />
    </AddWorkspaceWrapper>
  );
};

export default AddCodeGraph;

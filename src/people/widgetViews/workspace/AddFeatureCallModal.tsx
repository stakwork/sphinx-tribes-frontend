import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useStores } from 'store';
import { EuiGlobalToastList, EuiLoadingSpinner } from '@elastic/eui';
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

interface AddFeatureCallProps {
  closeHandler: () => void;
  getFeatureCall: () => void;
  handleDelete?: () => void;
  workspace_uuid: string;
  currentUuid?: string;
  url?: string;
}

const AddFeatureCall: React.FC<AddFeatureCallProps> = ({
  closeHandler,
  getFeatureCall,
  workspace_uuid,
  currentUuid,
  handleDelete,
  url
}: AddFeatureCallProps) => {
  const [featureCallUrl, setFeatureCallUrl] = useState(url || '');
  const [featureCallUrlError, setFeatureCallUrlError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { main } = useStores();
  const [toasts, setToasts] = useState<Toast[]>([]);

  function isValidUrl(url: string) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      try {
        new URL(`https://${url}`);
        return true;
      } catch (err) {
        return false;
      }
    }
  }

  useEffect(() => {
    if (featureCallUrl) {
      setFeatureCallUrlError(!isValidUrl(featureCallUrl));
    } else {
      setFeatureCallUrlError(false);
    }
  }, [featureCallUrl]);

  const handleFeatureCallUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFeatureCallUrl(e.target.value);
  };

  const addSuccessToast = () => {
    setToasts([
      {
        id: '1',
        title: 'Feature Call URL',
        color: 'success',
        text: 'Feature Call URL added successfully'
      }
    ]);
  };

  const addErrorToast = (text: string) => {
    setToasts([
      {
        id: '2',
        title: 'Feature Call',
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
      const featureCall = {
        id: currentUuid || '',
        workspace_id: workspace_uuid,
        url: featureCallUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await main.createOrUpdateFeatureCall(featureCall);
      addSuccessToast();
      getFeatureCall();
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
      <AddWorkspaceHeader>Edit Feature Call URL</AddWorkspaceHeader>
      <WorkspaceDetailsContainer>
        <WorkspaceInputContainer
          feature={true}
          style={{ color: featureCallUrlError ? errcolor : '' }}
        >
          <WorkspaceLabel style={{ color: featureCallUrlError ? errcolor : '' }}>
            Call url *
          </WorkspaceLabel>
          <TextInput
            placeholder="Feature call url"
            value={featureCallUrl}
            feature={true}
            data-testid="feature-call-url-input"
            onChange={handleFeatureCallUrlChange}
            style={{ borderColor: featureCallUrlError ? errcolor : '' }}
          />
        </WorkspaceInputContainer>
      </WorkspaceDetailsContainer>
      <FooterContainer>
        <ButtonWrap>
          <ActionButton data-testid="featurecall-cancel-btn" onClick={closeHandler} color="cancel">
            Cancel
          </ActionButton>
          <ActionButton
            disabled={featureCallUrlError || !featureCallUrl}
            data-testid="add-featurecall-btn"
            color="primary"
            onClick={handleSave}
          >
            {isLoading ? <EuiLoadingSpinner size="m" /> : 'Save'}
          </ActionButton>
          {handleDelete && (
            <ActionButton
              data-testid="delete-featurecall-btn"
              color="danger"
              onClick={handleDelete}
            >
              {isLoading ? <EuiLoadingSpinner size="m" /> : 'Delete'}
            </ActionButton>
          )}
        </ButtonWrap>
      </FooterContainer>
      <EuiGlobalToastList toasts={toasts} dismissToast={removeToast} toastLifeTimeMs={3000} />
    </AddWorkspaceWrapper>
  );
};

export default AddFeatureCall;

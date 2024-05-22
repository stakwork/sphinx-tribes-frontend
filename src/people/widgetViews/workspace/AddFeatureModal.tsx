import React, { useState } from 'react';
import styled from 'styled-components';
import { useStores } from 'store';
import { EuiGlobalToastList, EuiLoadingSpinner } from '@elastic/eui';
import history from 'config/history';
import { normalizeInput } from '../../../helpers';
import { Toast } from './interface';
import {
  TextInput,
  WorkspaceInputContainer,
  WorkspaceLabel,
  ActionButton,
  ButtonWrap,
  AddWorkspaceWrapper,
  AddWorkspaceHeader,
  WorkspaceDetailsContainer
} from './style';

const FooterContainer = styled.div`
  display: flex;
  gap: 3.56rem;
  align-items: end;
  justify-content: space-between;
  margin-top: 35px;

  @media only screen and (max-width: 500px) {
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 20px;
  }
`;

const errcolor = '#FF8F80';

const MAX_ORG_NAME_LENGTH = 20;

const AddFeature = (props: {
  closeHandler: () => void;
  getFeatures: () => void;
  workspace_uuid: string | undefined;
}) => {
  const [featureName, setFeatureName] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { main } = useStores();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [featureNameError, setFeatureNameError] = useState<boolean>(false);

  const handleWorkspaceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_ORG_NAME_LENGTH) {
      setFeatureName(newValue);
      setFeatureNameError(false);
    } else {
      setFeatureNameError(true);
    }
  };

  function addSuccessToast() {
    setToasts([
      {
        id: '1',
        title: 'Add Feature',
        color: 'success',
        text: 'Feature added successfully'
      }
    ]);
  }

  function addErrorToast(text: string) {
    setToasts([
      {
        id: '2',
        title: 'Add Feature',
        color: 'danger',
        text
      }
    ]);
  }

  function removeToast() {
    setToasts([]);
  }

  const addFeature = async () => {
    try {
      setIsLoading(true);

      if (!featureName.trim()) {
        addErrorToast('Feature name is required');
        setIsLoading(false);
        return;
      }

      const body = {
        workspace_uuid: props.workspace_uuid || '',
        name: normalizeInput(featureName)
      };

      const res = await main.addWorkspaceFeature(body);
      if (res.status === 200) {
        addSuccessToast();
        setTimeout(async () => {
          await props.getFeatures();
          setIsLoading(false);
          props.closeHandler();

          const feature = await res.json();
          history.push(`/feature/${feature.uuid}`);
        }, 500);
      } else {
        addErrorToast(await res.json());
        setIsLoading(false);
      }
    } catch (error) {
      addErrorToast('Error occured while  feature');
      console.error('Error occured', error);
      setIsLoading(false);
    }
  };

  return (
    <AddWorkspaceWrapper>
      <AddWorkspaceHeader>Add New Feature</AddWorkspaceHeader>
      <WorkspaceDetailsContainer style={{ display: 'flex' }}>
        <WorkspaceInputContainer feature={true} style={{ color: featureNameError ? errcolor : '' }}>
          <WorkspaceLabel style={{ color: featureNameError ? errcolor : '' }}>
            Feature Name *
          </WorkspaceLabel>
          <TextInput
            placeholder="Feature..."
            value={featureName}
            feature={true}
            data-testid="feature-input"
            onChange={handleWorkspaceNameChange}
            style={{ borderColor: featureNameError ? errcolor : '' }}
          />
        </WorkspaceInputContainer>
      </WorkspaceDetailsContainer>
      <FooterContainer>
        <ButtonWrap>
          <ActionButton
            data-testid="feature-cancel-btn"
            onClick={() => setFeatureName('')}
            color="cancel"
          >
            Cancel
          </ActionButton>
          <ActionButton
            disabled={featureNameError || !featureName}
            data-testid="add-feature-btn"
            color="primary"
            onClick={addFeature}
          >
            {isLoading ? <EuiLoadingSpinner size="m" /> : 'Add Feature'}
          </ActionButton>
        </ButtonWrap>
      </FooterContainer>
      <EuiGlobalToastList toasts={toasts} dismissToast={removeToast} toastLifeTimeMs={3000} />
    </AddWorkspaceWrapper>
  );
};

export default AddFeature;

import React, { useState } from 'react';
import { EuiGlobalToastList, EuiLoadingSpinner } from '@elastic/eui';
import { ChatWorkflow } from 'store/interface';
import { useStores } from 'store';
import { Toast } from './interface';
import {
  TextInput,
  WorkspaceInputContainer,
  WorkspaceLabel,
  ActionButton,
  ButtonWrap,
  AddWorkspaceWrapper,
  AddWorkspaceHeader,
  WorkspaceDetailsContainer,
  FooterContainer
} from './style';

const errcolor = '#FF8F80';

interface AddChatWorkflowProps {
  closeHandler: () => void;
  getChatWorkflow: () => void;
  handleDelete?: () => void;
  workspaceId: string;
  currentId?: number;
  url?: string;
}

const AddChatWorkflow: React.FC<AddChatWorkflowProps> = ({
  closeHandler,
  getChatWorkflow,
  workspaceId,
  currentId,
  handleDelete,
  url
}) => {
  const [chatWorkflowUrl, setChatWorkflowUrl] = useState(url || '');
  const [chatWorkflowUrlError, setChatWorkflowUrlError] = useState(false);
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

  const handleChatWorkflowUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setChatWorkflowUrl(value);
    setChatWorkflowUrlError(!isValidUrl(value));
  };

  const addSuccessToast = () => {
    setToasts([
      {
        id: `${Date.now()}-chatworkflow-success`,
        title: 'Success',
        color: 'success',
        text: 'Chat workflow URL updated successfully!'
      }
    ]);
  };

  const addErrorToast = (error: string) => {
    setToasts([
      {
        id: `${Date.now()}-chatworkflow-error`,
        title: 'Error',
        color: 'danger',
        text: error || 'Failed to update chat workflow URL'
      }
    ]);
  };

  const removeToast = () => {
    setToasts([]);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const chatWorkflow: ChatWorkflow = {
        id: currentId,
        workspaceId,
        url: chatWorkflowUrl,
        stackworkId: ''
      };

      await main.createOrUpdateChatWorkflow(chatWorkflow);
      addSuccessToast();
      getChatWorkflow();
      closeHandler();
    } catch (error) {
      console.error(error);
      addErrorToast(String(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AddWorkspaceWrapper data-testid="add-chat-workflow-component">
      <AddWorkspaceHeader>Edit Chat Workflow URL</AddWorkspaceHeader>
      <WorkspaceDetailsContainer>
        <WorkspaceInputContainer
          feature={true}
          style={{ color: chatWorkflowUrlError ? errcolor : '' }}
        >
          <WorkspaceLabel style={{ color: chatWorkflowUrlError ? errcolor : '' }}>
            Workflow URL *
          </WorkspaceLabel>
          <TextInput
            placeholder="Chat workflow URL"
            value={chatWorkflowUrl}
            feature={true}
            data-testid="chat-workflow-url-input"
            onChange={handleChatWorkflowUrlChange}
            style={{ borderColor: chatWorkflowUrlError ? errcolor : '' }}
          />
        </WorkspaceInputContainer>
      </WorkspaceDetailsContainer>
      <FooterContainer>
        <ButtonWrap>
          <ActionButton data-testid="chatworkflow-cancel-btn" onClick={closeHandler} color="cancel">
            Cancel
          </ActionButton>
          <ActionButton
            disabled={chatWorkflowUrlError || !chatWorkflowUrl}
            data-testid="add-chatworkflow-btn"
            color="primary"
            onClick={handleSave}
          >
            {isLoading ? <EuiLoadingSpinner size="m" /> : 'Save'}
          </ActionButton>
          {handleDelete && (
            <ActionButton
              data-testid="delete-chatworkflow-btn"
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

export default AddChatWorkflow;

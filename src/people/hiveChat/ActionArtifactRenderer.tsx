import React, { useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react-lite';
import MaterialIcon from '@material/react-material-icon';
import { renderMarkdown } from '../utils/RenderMarkdown.tsx';
import { ActionContent, Artifact, Option } from '../../store/interface';
import { useStores } from '../../store';
import { chatService } from '../../services/index';
import { ActionButtons } from './ActionButtons';

interface ActionArtifactRendererProps {
  messageId: string;
  chatId: string;
  websocketSessionId: string;
}

const ActionContainer = styled.div`
  margin: 8px 0;
  max-width: 20%;
  align-self: flex-start;
  width: 20%;
`;

const ActionBubble = styled.div`
  background-color: #f2f3f5;
  border-radius: 12px;
  padding: 12px 16px;
  color: #202124;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ResponseMessage = styled.div`
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #e6f4ea;
  border-radius: 8px;
  color: #137333;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ErrorMessage = styled(ResponseMessage)`
  background-color: #fce8e6;
  color: #c5221f;
`;

export const ActionArtifactRenderer: React.FC<ActionArtifactRendererProps> = observer(
  ({ messageId, chatId, websocketSessionId }) => {
    const { chat, ui } = useStores();
    const [isSending, setIsSending] = useState(false);
    const [isActionCompleted, setIsActionCompleted] = useState(false);
    const [responseStatus, setResponseStatus] = useState<{
      success: boolean;
      message: string;
    } | null>(null);

    const artifacts = chat.getMessageArtifacts(messageId);

    const actionArtifact = artifacts.find(
      (a: Artifact) => a.type === 'action' && chat.isActionContent(a.content)
    );

    if (!actionArtifact || !chat.isActionContent(actionArtifact.content)) {
      return null;
    }

    const content = actionArtifact.content as ActionContent;

    const hasButtonOptions =
      content.options && content.options.some((option) => option.action_type === 'button');

    if (!hasButtonOptions) {
      return null;
    }

    const handleButtonClick = async (option: Option) => {
      if (isSending || isActionCompleted) return;
      setIsSending(true);

      try {
        const payload = {
          action_webhook: option.webhook,
          chatId: chatId,
          messageId: messageId,
          message: option.option_response,
          sourceWebsocketId: websocketSessionId
        };

        if (option.option_response === 'textbox') {
          localStorage.setItem('activeWebhook', option.webhook);
          setIsActionCompleted(true);
          setResponseStatus({
            success: true,
            message: `Ready to receive your ${option.option_label.toLowerCase()} message`
          });
          return;
        }

        const response = await chatService.sendActionResponse(payload);

        if (response && response.success) {
          setIsActionCompleted(true);
          setResponseStatus({
            success: true,
            message: `Response "${option.option_label}" sent successfully`
          });

          chat.updateArtifactInStore(actionArtifact.id, {
            ...actionArtifact,
            completed: true
          });
        } else {
          throw new Error(response?.message || 'Failed to send response');
        }
      } catch (error: any) {
        console.error('Error sending action response:', error);
        setResponseStatus({
          success: false,
          message: `Error: ${error?.message || 'Failed to send response'}`
        });

        ui.setToasts([
          {
            title: 'Action Failed',
            color: 'danger',
            text: error?.message || 'Failed to send response'
          }
        ]);
      } finally {
        setIsSending(false);
      }
    };

    return (
      <ActionContainer>
        <ActionBubble>
          {renderMarkdown(content.actionText, {
            codeBlockBackground: '#282c34',
            textColor: '#abb2bf',
            bubbleTextColor: '',
            borderColor: '#444',
            codeBlockFont: 'Courier New'
          })}

          <ActionButtons
            options={content.options}
            onButtonClick={handleButtonClick}
            disabled={isSending || isActionCompleted}
          />

          {responseStatus &&
            (responseStatus.success ? (
              <ResponseMessage>
                <MaterialIcon icon="check_circle" />
                {responseStatus.message}
              </ResponseMessage>
            ) : (
              <ErrorMessage>
                <MaterialIcon icon="error" />
                {responseStatus.message}
              </ErrorMessage>
            ))}
        </ActionBubble>
      </ActionContainer>
    );
  }
);

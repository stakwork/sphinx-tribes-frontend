import { TribesURL } from '../config';
import {
  ActionContent,
  ActionResponsePayload,
  Artifact,
  Chat,
  ChatMessage,
  ChatStatuses,
  ContextTag
} from '../store/interface';
import { uiStore } from '../store/ui';

export class ChatService {
  async getLatestChatStatus(chatId: string): Promise<ChatStatuses | undefined> {
    try {
      if (!uiStore.meInfo) return undefined;
      const info = uiStore.meInfo;
      const response = await fetch(`${TribesURL}/hivechat/status/${chatId}/latest`, {
        method: 'GET',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return undefined;
        }
        throw new Error(`Failed to fetch chat status`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting latest chat status:', error);
      return undefined;
    }
  }

  async createChat(workspace_uuid: string, title: string): Promise<Chat | undefined> {
    try {
      if (!uiStore.meInfo) return undefined;
      const info = uiStore.meInfo;

      const response = await fetch(`${TribesURL}/hivechat`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workspaceId: workspace_uuid,
          title
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Create chat response:', result);

      if (!result.success || !result.data) {
        throw new Error('Invalid chat response');
      }

      return result.data;
    } catch (e) {
      console.error('Error creating chat:', e);
      return undefined;
    }
  }

  async archiveChat(chat_id: string): Promise<void> {
    try {
      if (!uiStore.meInfo) return;
      const info = uiStore.meInfo;

      const response = await fetch(`${TribesURL}/hivechat/${chat_id}/archive`, {
        method: 'PUT',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error('Failed to archive chat');
      }
    } catch (e) {
      console.error('Error archiving chat:', e);
      throw e;
    }
  }

  async getChatHistory(chat_id: string): Promise<ChatMessage[] | undefined> {
    try {
      if (!uiStore.meInfo) return undefined;
      const info = uiStore.meInfo;

      const response = await fetch(`${TribesURL}/hivechat/history/${chat_id}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      let messages: ChatMessage[] = [];

      if (Array.isArray(result)) {
        messages = result;
      } else if (result.success && Array.isArray(result.data)) {
        messages = result.data;
      } else if (result.data) {
        messages = Array.isArray(result.data) ? result.data : [result.data];
      } else {
        messages = [];
      }

      return messages.map((msg: ChatMessage) => ({
        ...msg,
        chat_id: msg.chat_id || msg.chatId || chat_id,
        context_tags: msg.context_tags || msg.contextTags
      }));
    } catch (e) {
      console.error('Error loading chat history:', e);
      return undefined;
    }
  }

  async getWorkspaceChats(workspace_uuid: string): Promise<Chat[] | undefined> {
    try {
      if (!uiStore.meInfo) return undefined;
      const info = uiStore.meInfo;

      const response = await fetch(`${TribesURL}/hivechat?workspace_id=${workspace_uuid}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Workspace chats response:', result);
      if (!result.success || !result.data) {
        throw new Error('Invalid workspace chats response');
      }

      return result.data;
    } catch (e) {
      console.error('Error loading workspace chats:', e);
      return undefined;
    }
  }

  async updateChatTitle(chat_id: string, title: string): Promise<void> {
    try {
      if (!uiStore.meInfo) return undefined;
      const info = uiStore.meInfo;

      const response = await fetch(`${TribesURL}/hivechat/${chat_id}`, {
        method: 'PUT',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.text}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error('Invalid chat title update response');
      }

      return result.data;
    } catch (error) {
      console.error('Error updating chat title:', error);
      throw error;
    }
  }

  hasActionOptions(content: Artifact['content']): content is ActionContent {
    return !!content && 'options' in content && Array.isArray(content.options);
  }

  async sendMessage(
    chat_id: string,
    message: string,
    sourceWebsocketID: string,
    workspaceUUID: string,
    mode: string,
    contextTags?: ContextTag[],
    pdfUrl?: string,
    modelSelection?: string,
    actionArtifact?: Artifact
  ): Promise<ChatMessage | undefined> {
    try {
      if (!uiStore.meInfo) return undefined;
      const info = uiStore.meInfo;

      let endpoint = `${TribesURL}/hivechat/send`;
      let body: any = {
        chat_id,
        message,
        context_tags: contextTags,
        sourceWebsocketID,
        workspaceUUID,
        pdf_url: pdfUrl,
        modelSelection,
        mode
      };

      if (
        actionArtifact &&
        actionArtifact.type === 'action' &&
        this.hasActionOptions(actionArtifact.content)
      ) {
        const firstOption = actionArtifact.content.options[0];

        if (firstOption?.action_type === 'chat') {
          endpoint = `${TribesURL}/hivechat/send/action`;
          body = {
            action_webhook: firstOption.webhook,
            chatId: chat_id,
            messageId: actionArtifact.message_id,
            message,
            sourceWebsocketId: sourceWebsocketID
          };
        }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error('Invalid send message response');
      }

      return result.data;
    } catch (e) {
      console.error('Error sending message:', e);
      return undefined;
    }
  }

  async sendActionResponse(payload: ActionResponsePayload): Promise<any> {
    try {
      if (!uiStore.meInfo) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${TribesURL}/hivechat/send/action`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'x-jwt': uiStore.meInfo.tribe_jwt,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending action response:', error);
      throw error;
    }
  }

  async uploadFile(file: File): Promise<{ success: boolean; url: string }> {
    try {
      if (!uiStore.meInfo) return { success: false, url: '' };
      const info = uiStore.meInfo;

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${TribesURL}/hivechat/upload`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Server error: ${response.status}`);
      }

      if (!result.success) {
        throw new Error(result.message || 'Upload failed');
      }

      return {
        success: true,
        url: result.url
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async createArtifact(artifact: Artifact): Promise<Artifact> {
    const response = await fetch(`${TribesURL}/hivechat/artefacts`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'x-jwt': uiStore.meInfo?.tribe_jwt ?? '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(artifact)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  async getArtifactsByChatId(chatId: string): Promise<Artifact[]> {
    const response = await fetch(`${TribesURL}/hivechat/artefacts/chat/${chatId}`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'x-jwt': uiStore.meInfo?.tribe_jwt ?? '',
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  async getArtifactById(artifactId: string): Promise<Artifact> {
    const response = await fetch(`${TribesURL}/hivechat/artefacts/${artifactId}`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'x-jwt': uiStore.meInfo?.tribe_jwt ?? '',
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  async getArtifactsByMessageId(messageId: string): Promise<Artifact[]> {
    const response = await fetch(`${TribesURL}/hivechat/artefacts/message/${messageId}`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'x-jwt': uiStore.meInfo?.tribe_jwt ?? '',
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  async updateArtifact(artifactId: string, artifactUpdate: Partial<Artifact>): Promise<Artifact> {
    const response = await fetch(`${TribesURL}/hivechat/artefacts/${artifactId}`, {
      method: 'PUT',
      mode: 'cors',
      headers: {
        'x-jwt': uiStore.meInfo?.tribe_jwt ?? '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(artifactUpdate)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  async deleteArtifact(artifactId: string): Promise<void> {
    const response = await fetch(`${TribesURL}/hivechat/artefacts/${artifactId}`, {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        'x-jwt': uiStore.meInfo?.tribe_jwt ?? '',
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  }

  async deleteArtifactsByChatId(chatId: string): Promise<void> {
    const response = await fetch(`${TribesURL}/hivechat/artefacts/chat/${chatId}`, {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        'x-jwt': uiStore.meInfo?.tribe_jwt ?? '',
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  }

  async getWorkspaceChatsWithPagination(
    workspace_uuid: string,
    limit = 5,
    offset = 0
  ): Promise<{ chats: Chat[]; total: number } | undefined> {
    try {
      if (!uiStore.meInfo) return undefined;
      const info = uiStore.meInfo;

      const limitParam = limit > 0 ? `&limit=${limit}` : '';
      const offsetParam = offset > 0 ? `&offset=${offset}` : '';

      const response = await fetch(
        `${TribesURL}/hivechat?workspace_id=${workspace_uuid}${limitParam}${offsetParam}`,
        {
          method: 'GET',
          mode: 'cors',
          headers: {
            'x-jwt': info.tribe_jwt,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error('Invalid workspace chats response');
      }

      return {
        chats: result.data.chats || [],
        total: result.data.total || 0
      };
    } catch (e) {
      console.error('Error loading paginated workspace chats:', e);
      return undefined;
    }
  }
}

export const chatService = new ChatService();

import { TribesURL } from '../config';
import { Chat, ChatMessage, ContextTag } from '../store/interface';
import { uiStore } from '../store/ui';

export class ChatService {
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

  async sendMessage(
    chat_id: string,
    message: string,
    sourceWebsocketID: string,
    workspaceUUID: string,
    contextTags?: ContextTag[]
  ): Promise<ChatMessage | undefined> {
    try {
      if (!uiStore.meInfo) return undefined;
      const info = uiStore.meInfo;

      const response = await fetch(`${TribesURL}/hivechat/send`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id,
          message,
          context_tags: contextTags,
          sourceWebsocketID,
          workspaceUUID
        })
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

  async archiveChat(chat_id: string): Promise<boolean> {
    try {
      if (!uiStore.meInfo) return false;
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
        throw new Error('Invalid archive chat response');
      }

      return true;
    } catch (e) {
      console.error('Error archiving chat:', e);
      return false;
    }
  }
}

export const chatService = new ChatService();

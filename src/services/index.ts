import { TribesURL } from '../config';
import { Chat, ChatMessage, ContextTag } from '../store/interface';
import { uiStore } from '../store/ui';

export class ChatService {
  async getChat(chat_id: string): Promise<Chat | undefined> {
    try {
      if (!uiStore.meInfo) return undefined;
      const info = uiStore.meInfo;

      const response = await fetch(`${TribesURL}/chat/${chat_id}`, {
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

      return response.json();
    } catch (e) {
      console.error('Error getting chat:', e);
      return undefined;
    }
  }

  async getChatHistory(chat_id: string): Promise<ChatMessage[] | undefined> {
    try {
      if (!uiStore.meInfo) return undefined;
      const info = uiStore.meInfo;

      const response = await fetch(`${TribesURL}/chat/${chat_id}/messages`, {
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

      return response.json();
    } catch (e) {
      console.error('Error loading chat history:', e);
      return undefined;
    }
  }

  async sendMessage(
    chat_id: string,
    message: string,
    contextTags?: ContextTag[]
  ): Promise<ChatMessage | undefined> {
    try {
      if (!uiStore.meInfo) return undefined;
      const info = uiStore.meInfo;

      const response = await fetch(`${TribesURL}/chat/${chat_id}/messages`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'x-jwt': info.tribe_jwt,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          context_tags: contextTags
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (e) {
      console.error('Error sending message:', e);
      return undefined;
    }
  }
}

export const chatService = new ChatService();

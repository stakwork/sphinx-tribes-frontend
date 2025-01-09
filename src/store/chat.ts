import { makeAutoObservable } from 'mobx';
import { chatService } from '../services';
import { Chat, ChatMessage, ContextTag } from './interface';

interface ChatMessages {
  [chat_id: string]: ChatMessage[];
}

export interface ChatStore {
  chats: Map<string, Chat>;
  chatMessages: ChatMessages;
  currentChatId: string | null;

  createChat: (workspace_uuid: string, title: string) => Promise<Chat | undefined>;
  addChat: (chat: Chat) => void;
  updateChat: (id: string, chat: Partial<Chat>) => void;
  getChat: (id: string) => Chat | undefined;
  getChatMessages: (chat_id: string) => ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, message: Partial<ChatMessage>) => void;
  getWorkspaceChats: (workspace_uuid: string) => Promise<Chat[]>;
}

export class ChatHistoryStore implements ChatStore {
  chats: Map<string, Chat> = new Map();
  chatMessages: ChatMessages = {};
  currentChatId: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async createChat(workspace_uuid: string, title: string): Promise<Chat | undefined> {
    const chat = await chatService.createChat(workspace_uuid, title);
    if (chat) {
      this.addChat(chat);
    }
    return chat;
  }

  addChat(chat: Chat) {
    this.chats.set(chat.id, chat);
    if (!this.chatMessages[chat.id]) {
      this.chatMessages[chat.id] = [];
    }
  }

  updateChat(id: string, chatUpdate: Partial<Chat>) {
    const existingChat = this.chats.get(id);
    if (existingChat) {
      this.chats.set(id, { ...existingChat, ...chatUpdate });
    }
  }

  getChat(id: string): Chat | undefined {
    return this.chats.get(id);
  }

  getChatMessages(chat_id: string): ChatMessage[] {
    return this.chatMessages[chat_id] || [];
  }

  async getWorkspaceChats(workspace_uuid: string): Promise<Chat[]> {
    try {
      const chats = await chatService.getWorkspaceChats(workspace_uuid);
      if (Array.isArray(chats)) {
        chats.forEach((chat: Chat) => {
          if (chat && chat.id) {
            this.addChat(chat);
          }
        });
        return chats;
      }
      return [];
    } catch (error) {
      console.error('Error getting workspace chats:', error);
      return [];
    }
  }

  addMessage(message: ChatMessage) {
    const chatId = message.chatId || message.chat_id;
    if (!chatId) return;

    if (!this.chatMessages[chatId]) {
      this.chatMessages[chatId] = [];
    }

    const isDuplicate = this.chatMessages[chatId].some((msg: ChatMessage) => msg.id === message.id);
    if (!isDuplicate) {
      this.chatMessages = {
        ...this.chatMessages,
        [chatId]: [...this.chatMessages[chatId], message]
      };
    }
  }

  updateMessage(id: string, messageUpdate: Partial<ChatMessage>) {
    Object.keys(this.chatMessages).forEach((chatId: string) => {
      const messages = this.chatMessages[chatId];
      const messageIndex = messages.findIndex((msg: ChatMessage) => msg.id === id);

      if (messageIndex !== -1) {
        const updatedMessages = [...messages];
        updatedMessages[messageIndex] = { ...messages[messageIndex], ...messageUpdate };

        this.chatMessages = {
          ...this.chatMessages,
          [chatId]: updatedMessages
        };
      }
    });
  }

  async loadChat(chat_id: string): Promise<ChatMessage[] | undefined> {
    const chat = await chatService.getChatHistory(chat_id);
    if (chat) {
      this.chatMessages[chat_id] = chat;
    }
    return chat;
  }

  async updateChatTitle(chat_id: string, newTitle: string): Promise<void> {
    try {
      await chatService.updateChatTitle(chat_id, newTitle);
      this.updateChat(chat_id, { title: newTitle });
    } catch (error) {
      console.error('Error updating chat title in store:', error);
      throw error;
    }
  }

  async loadChatHistory(chat_id: string): Promise<ChatMessage[] | undefined> {
    try {
      const messages = await chatService.getChatHistory(chat_id);
      if (messages) {
        const normalizedMessages = messages.map((msg: ChatMessage) => ({
          ...msg,
          chat_id: msg.chat_id || msg.chatId || chat_id,
          context_tags: msg.context_tags || msg.contextTags
        }));

        this.chatMessages[chat_id] = normalizedMessages;
        return normalizedMessages;
      }
      return undefined;
    } catch (error) {
      console.error('Error loading chat history:', error);
      return undefined;
    }
  }

  async archiveChat(chat_id: string): Promise<void> {
    try {
      await chatService.archiveChat(chat_id);
      this.chats.delete(chat_id);
    } catch (error) {
      console.error('Error archiving chat in store:', error);
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
      const newMessage = await chatService.sendMessage(
        chat_id,
        message,
        sourceWebsocketID,
        workspaceUUID,
        contextTags
      );
      if (newMessage) {
        if (!this.chatMessages[chat_id]) {
          this.chatMessages[chat_id] = [];
        }
        this.addMessage(newMessage);
        return newMessage;
      }
      return undefined;
    } catch (error) {
      console.error('Error sending message:', error);
      return undefined;
    }
  }
}

export const chatHistoryStore = new ChatHistoryStore();

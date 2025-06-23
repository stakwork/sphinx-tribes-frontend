import { makeAutoObservable } from 'mobx';
import { chatService } from '../services';
import {
  ActionContent,
  Artifact,
  Chat,
  ChatMessage,
  ContextTag,
  Example,
  TextContent,
  VisualContent,
  ChatStatuses
} from './interface';

interface ChatMessages {
  [chat_id: string]: ChatMessage[];
}

export interface ChatStore {
  chats: Map<string, Chat>;
  chatMessages: ChatMessages;
  currentChatId: string | null;
  chatStatuses: Map<string, ChatStatuses>;
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
  chatStatuses: Map<string, ChatStatuses> = new Map();
  artifacts: Map<string, Artifact> = new Map();
  messageArtifacts: { [message_id: string]: Artifact[] } = {};
  chatArtifacts: { [chat_id: string]: Artifact[] } = {};

  constructor() {
    makeAutoObservable(this);
  }

  async getChatStatus(chatId: string): Promise<ChatStatuses | undefined> {
    const status = await chatService.getLatestChatStatus(chatId);

    if (status) {
      this.chatStatuses.set(chatId, status);
    }

    return status;
  }

  updateChatStatus(chatId: string, status: string, message?: string): void {
    const existingStatus = this.chatStatuses.get(chatId);

    let statusMessage = message;

    if (!statusMessage) {
      if (status === 'success') {
        statusMessage = 'Agent workflow completed';
      } else if (status === 'error') {
        statusMessage = 'An error occurred during the workflow';
      } else {
        statusMessage = status;
      }
    }

    const updatedStatus: ChatStatuses = {
      success: existingStatus?.success ?? true,
      message: existingStatus?.message ?? 'Status updated',
      data: {
        ...(existingStatus?.data || {}),
        chatId,
        status,
        message: statusMessage,
        updated_at: new Date().toISOString()
      }
    };

    this.chatStatuses.set(chatId, updatedStatus);
  }

  processChatStatusUpdate(chatId: string, webhookData: any): void {
    let status = '';
    let message = '';

    if (webhookData.project_status === 'completed') {
      status = 'success';
    } else if (webhookData.project_status === 'error') {
      status = 'error';
      if (webhookData.error && webhookData.error.message) {
        const { message: errorMessage } = webhookData.error.message;
        message = errorMessage;
      }
    } else {
      status = webhookData.project_status;
    }

    this.updateChatStatus(chatId, status, message);
  }

  addArtifact(artifact: Artifact) {
    const messageId = artifact.messageId || artifact.message_id;

    if (!messageId) {
      console.error('Artifact is missing messageId:', artifact);
      return;
    }

    this.artifacts.set(artifact.id, artifact);

    if (!this.messageArtifacts[messageId]) {
      this.messageArtifacts[messageId] = [];
    }

    const isDuplicate = this.messageArtifacts[messageId].some(
      (a: Artifact) => a.id === artifact.id
    );

    if (!isDuplicate) {
      this.messageArtifacts[messageId].push(artifact);
    }

    const message = this.findMessageById(messageId);
    if (message?.chatId) {
      const { chatId } = message;

      if (!this.chatArtifacts[chatId]) {
        this.chatArtifacts[chatId] = [];
      }

      const isDuplicateInChat = this.chatArtifacts[chatId].some(
        (a: Artifact) => a.id === artifact.id
      );

      if (!isDuplicateInChat) {
        this.chatArtifacts = {
          ...this.chatArtifacts,
          [chatId]: [...this.chatArtifacts[chatId], artifact]
        };
      }
    }
  }

  deleteArtifactFromStore(artifactId: string) {
    const artifact = this.artifacts.get(artifactId);
    if (artifact) {
      this.artifacts.delete(artifactId);

      if (this.messageArtifacts[artifact.messageId]) {
        this.messageArtifacts = {
          ...this.messageArtifacts,
          [artifact.messageId]: this.messageArtifacts[artifact.messageId].filter(
            (a: Artifact) => a.id !== artifactId
          )
        };
      }

      const message = this.findMessageById(artifact.messageId);
      if (message && message.chatId && this.chatArtifacts[message.chatId]) {
        this.chatArtifacts = {
          ...this.chatArtifacts,
          [message.chatId]: this.chatArtifacts[message.chatId].filter(
            (a: Artifact) => a.id !== artifactId
          )
        };
      }
    }
  }

  clearChatArtifacts(chatId: string) {
    const messageIds = this.chatMessages[chatId]?.map((msg: ChatMessage) => msg.id) || [];

    if (this.chatArtifacts[chatId]) {
      delete this.chatArtifacts[chatId];
    }

    messageIds.forEach((messageId: string) => {
      if (this.messageArtifacts[messageId]) {
        const artifactIds = this.messageArtifacts[messageId].map((a: Artifact) => a.id);

        artifactIds.forEach((id: string) => this.artifacts.delete(id));

        delete this.messageArtifacts[messageId];
      }
    });
  }

  getMessageArtifacts(messageId: string): any {
    if (!messageId) {
      console.error('Invalid messageId provided:', messageId);
      return [];
    }

    if (this.messageArtifacts[messageId] === undefined) {
      return [];
    }

    return this.messageArtifacts[messageId];
  }

  getChatArtifacts(chatId: string): Artifact[] {
    return this.chatArtifacts[chatId] || [];
  }

  getArtifactById(artifactId: string): Artifact | undefined {
    return this.artifacts.get(artifactId);
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

        for (const message of normalizedMessages) {
          await this.loadArtifactsForMessage(message.id);
        }

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
    modelSelection: string,
    sourceWebsocketID: string,
    workspaceUUID: string,
    mode: string,
    contextTags?: ContextTag[],
    pdfUrl?: string,
    actionArtifact?: Artifact,
    artifacts?: Artifact[]
  ): Promise<ChatMessage | undefined> {
    try {
      const newMessage = await chatService.sendMessage(
        chat_id,
        message,
        sourceWebsocketID,
        workspaceUUID,
        mode,
        contextTags,
        pdfUrl,
        modelSelection,
        actionArtifact
      );
      if (newMessage) {
        if (!this.chatMessages[chat_id]) {
          this.chatMessages[chat_id] = [];
        }
        this.addMessage(newMessage);

        if (artifacts && artifacts.length > 0) {
          for (const artifact of artifacts) {
            const createdArtifact = await chatService.createArtifact({
              ...artifact,
              messageId: newMessage.id
            });

            if (createdArtifact) {
              this.addArtifact(createdArtifact);
            }
          }
        }
        return newMessage;
      }
      return undefined;
    } catch (error) {
      console.error('Error sending message:', error);
      return undefined;
    }
  }

  updateArtifactInStore(id: string, artifactUpdate: Partial<Artifact>) {
    const existingArtifact = this.artifacts.get(id);
    if (existingArtifact) {
      const updatedArtifact = { ...existingArtifact, ...artifactUpdate };
      this.artifacts.set(id, updatedArtifact);

      if (this.messageArtifacts[existingArtifact.messageId]) {
        const messageArtifacts = this.messageArtifacts[existingArtifact.messageId];
        const artifactIndex = messageArtifacts.findIndex((a: Artifact) => a.id === id);
        if (artifactIndex !== -1) {
          const updatedMessageArtifacts = [...messageArtifacts];
          updatedMessageArtifacts[artifactIndex] = updatedArtifact;
          this.messageArtifacts = {
            ...this.messageArtifacts,
            [existingArtifact.messageId]: updatedMessageArtifacts
          };
        }
      }

      const message = this.findMessageById(existingArtifact.messageId);
      if (message && message.chatId && this.chatArtifacts[message.chatId]) {
        const chatArtifacts = this.chatArtifacts[message.chatId];
        const artifactIndex = chatArtifacts.findIndex((a: Artifact) => a.id === id);
        if (artifactIndex !== -1) {
          const updatedChatArtifacts = [...chatArtifacts];
          updatedChatArtifacts[artifactIndex] = updatedArtifact;
          this.chatArtifacts = {
            ...this.chatArtifacts,
            [message.chatId]: updatedChatArtifacts
          };
        }
      }
    }
  }

  findMessageById(messageId: string): ChatMessage | undefined {
    for (const chatId in this.chatMessages) {
      const message = this.chatMessages[chatId].find((msg: ChatMessage) => msg.id === messageId);
      if (message) {
        return message;
      }
    }
    return undefined;
  }

  async loadArtifactsForMessage(messageId: string): Promise<Artifact[]> {
    try {
      const artifacts = await chatService.getArtifactsByMessageId(messageId);
      if (artifacts && Array.isArray(artifacts)) {
        artifacts.forEach((artifact: Artifact) => this.addArtifact(artifact));
        return artifacts;
      }
      return [];
    } catch (error) {
      console.error('Error loading artifacts for message:', error);
      return [];
    }
  }

  async loadArtifactsForChat(chatId: string): Promise<Artifact[]> {
    try {
      const artifacts = await chatService.getArtifactsByChatId(chatId);
      if (artifacts && Array.isArray(artifacts)) {
        artifacts.forEach((artifact: Artifact) => this.addArtifact(artifact));
        return artifacts;
      }
      return [];
    } catch (error) {
      console.error('Error loading artifacts for chat:', error);
      return [];
    }
  }

  async createArtifact(artifact: Artifact): Promise<Artifact | undefined> {
    try {
      const newArtifact = await chatService.createArtifact(artifact);
      if (newArtifact) {
        this.addArtifact(newArtifact);
        return newArtifact;
      }
      return undefined;
    } catch (error) {
      console.error('Error creating artifact:', error);
      return undefined;
    }
  }

  async updateArtifact(
    artifactId: string,
    artifactUpdate: Partial<Artifact>
  ): Promise<Artifact | undefined> {
    try {
      const updatedArtifact = await chatService.updateArtifact(artifactId, artifactUpdate);
      if (updatedArtifact) {
        this.addArtifact(updatedArtifact);
        return updatedArtifact;
      }
      return undefined;
    } catch (error) {
      console.error('Error updating artifact:', error);
      return undefined;
    }
  }

  async deleteArtifact(artifactId: string): Promise<boolean> {
    try {
      await chatService.deleteArtifact(artifactId);
      this.deleteArtifactFromStore(artifactId);
      return true;
    } catch (error) {
      console.error('Error deleting artifact:', error);
      return false;
    }
  }

  async deleteArtifactsForChat(chatId: string): Promise<boolean> {
    try {
      await chatService.deleteArtifactsByChatId(chatId);
      this.clearChatArtifacts(chatId);
      return true;
    } catch (error) {
      console.error('Error deleting chat artifacts:', error);
      return false;
    }
  }

  getFirstVisualForMessage(messageId: string): Example | undefined {
    const artifacts = this.getMessageArtifacts(messageId);
    const visualArtifacts = artifacts.filter((a: Artifact) => a.type === 'visual');

    for (const artifact of visualArtifacts) {
      const content = artifact.content as VisualContent;
      if (content && content.examples && content.examples.length > 0) {
        return content.examples[0];
      }
    }

    return undefined;
  }

  getCodeExamplesForMessage(messageId: string): TextContent[] {
    const artifacts = this.getMessageArtifacts(messageId);
    return artifacts
      .filter((a: Artifact) => a.type === 'text')
      .map((a: Artifact) => a.content as TextContent)
      .filter((c: TextContent) => c.text_type === 'code' || c.text_type === 'rag');
  }

  getActionsForMessage(messageId: string): ActionContent | undefined {
    const artifacts = this.getMessageArtifacts(messageId);
    const actionArtifacts = artifacts.filter((a: Artifact) => a.type === 'action');

    if (actionArtifacts.length > 0) {
      return actionArtifacts[0].content as ActionContent;
    }

    return undefined;
  }

  getAllVisualsForMessage(messageId: string): Example[] {
    const artifacts = this.getMessageArtifacts(messageId);
    const visualArtifacts = artifacts.filter((a: Artifact) => a.type === 'visual');

    let examples: Example[] = [];

    for (const artifact of visualArtifacts) {
      const content = artifact.content as VisualContent;
      if (content && content.examples && content.examples.length > 0) {
        examples = [...examples, ...content.examples];
      }
    }

    return examples;
  }

  getAllCodeExamplesForChat(chatId: string): { messageId: string; content: TextContent }[] {
    const artifacts = this.getChatArtifacts(chatId);

    return artifacts
      .filter((a: Artifact) => a.type === 'text')
      .map((a: Artifact) => ({
        messageId: a.messageId,
        content: a.content as TextContent
      }))
      .filter(
        (item: { messageId: string; content: TextContent }) =>
          item.content.text_type === 'code' || item.content.text_type === 'rag'
      );
  }

  hasVisuals(messageId: string): boolean {
    return this.getFirstVisualForMessage(messageId) !== undefined;
  }

  hasCodeExamples(messageId: string): boolean {
    return this.getCodeExamplesForMessage(messageId).length > 0;
  }

  hasActions(messageId: string): boolean {
    return this.getActionsForMessage(messageId) !== undefined;
  }

  isActionContent(content: Artifact['content']): content is ActionContent {
    return !!content && (content as ActionContent).actionText !== undefined;
  }

  async getWorkspaceChatsWithPagination(
    workspace_uuid: string,
    limit = 5,
    offset = 0
  ): Promise<{ chats: Chat[]; total: number }> {
    try {
      const result = await chatService.getWorkspaceChatsWithPagination(
        workspace_uuid,
        limit,
        offset
      );

      if (result && Array.isArray(result.chats)) {
        result.chats.forEach((chat: Chat) => {
          if (chat && chat.id) {
            this.addChat(chat);
          }
        });
        return result;
      }
      return { chats: [], total: 0 };
    } catch (error) {
      console.error('Error getting paginated workspace chats:', error);
      return { chats: [], total: 0 };
    }
  }
}

export const chatHistoryStore = new ChatHistoryStore();

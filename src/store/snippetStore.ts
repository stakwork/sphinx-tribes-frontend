import { makeAutoObservable } from 'mobx';
import { mainStore } from './main.ts';

export interface TextSnippet {
  id: string;
  workspaceUUID: string;
  title: string;
  snippet: string;
  dateCreated?: Date;
  lastEdited?: Date;
}

class SnippetStore {
  snippets: TextSnippet[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  async loadSnippets(workspaceUUID: string): Promise<void> {
    try {
      this.snippets = await mainStore.getSnippetsByWorkspace(workspaceUUID);
    } catch (error) {
      console.error('Error loading snippets:', error);
    }
  }

  async createSnippet(workspaceUUID: string, title: string, snippet: string): Promise<boolean> {
    try {
      const success = await mainStore.createSnippet(workspaceUUID, title, snippet);
      if (success) {
        await this.loadSnippets(workspaceUUID);
      }
      return success;
    } catch (error) {
      console.error('Error creating snippet:', error);
      return false;
    }
  }

  async getSnippet(id: string): Promise<TextSnippet | null> {
    try {
      return await mainStore.getSnippetByID(id);
    } catch (error) {
      console.error('Error fetching snippet by ID:', error);
      return null;
    }
  }

  async updateSnippet(
    id: string,
    title: string,
    snippet: string,
    workspaceUUID: string
  ): Promise<boolean> {
    try {
      const success = await mainStore.updateSnippet(id, title, snippet);
      if (success) {
        await this.loadSnippets(workspaceUUID);
      }
      return success;
    } catch (error) {
      console.error('Error updating snippet:', error);
      return false;
    }
  }

  async deleteSnippet(id: string, workspaceUUID: string): Promise<boolean> {
    try {
      const success = await mainStore.deleteSnippet(id);
      if (success) {
        await this.loadSnippets(workspaceUUID);
      }
      return success;
    } catch (error) {
      console.error('Error deleting snippet:', error);
      return false;
    }
  }

  getAllSnippets(): TextSnippet[] {
    return this.snippets;
  }

  clearSnippets(): void {
    this.snippets = [];
  }
}

export const snippetStore = new SnippetStore();

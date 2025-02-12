import { makeAutoObservable, runInAction } from 'mobx';
import { IActivity, INewActivity } from './interface';
import { mainStore } from './main';

export class ActivityStore {
  activities: Map<string, IActivity> = new Map();
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get threadedActivities(): { [key: string]: IActivity[] } {
    const grouped: { [key: string]: IActivity[] } = {};
    Array.from(this.activities.values()).forEach((activity: IActivity) => {
      const threadId = activity.threadId || activity.id;
      if (!grouped[threadId]) {
        grouped[threadId] = [];
      }
      grouped[threadId].push(activity);
    });
    Object.keys(grouped).forEach((threadId: string) => {
      grouped[threadId].sort((a: IActivity, b: IActivity) => a.sequence - b.sequence);
    });
    return grouped;
  }

  get rootActivities(): IActivity[] {
    return Array.from(this.activities.values())
      .filter((activity: IActivity) => !activity.threadId)
      .sort(
        (a: IActivity, b: IActivity) =>
          new Date(b.timeCreated).getTime() - new Date(a.timeCreated).getTime()
      );
  }

  getThreadResponses(threadId: string): IActivity[] {
    return Array.from(this.activities.values())
      .filter((activity: IActivity) => activity.threadId === threadId)
      .sort((a: IActivity, b: IActivity) => a.sequence - b.sequence);
  }

  async fetchWorkspaceActivities(workspace: string): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      const activities = await mainStore.fetchWorkspaceActivities(workspace);
      runInAction(() => {
        this.activities.clear();
        activities.forEach((activity: IActivity) => {
          this.activities.set(activity.id, activity);
        });
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        this.loading = false;
      });
    }
  }

  async createActivity(newActivity: INewActivity): Promise<IActivity | null> {
    try {
      const activity = await mainStore.createActivity(newActivity);
      if (activity) {
        runInAction(() => {
          this.activities.set(activity.id, activity);
        });
      }
      return activity;
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Unknown error';
      });
      return null;
    }
  }

  async createThreadResponse(
    threadId: string,
    newActivity: Omit<INewActivity, 'threadId'>
  ): Promise<IActivity | null> {
    return this.createActivity({ ...newActivity, threadId });
  }

  async updateActivity(
    id: string,
    updates: Partial<Omit<IActivity, 'id' | 'threadId' | 'sequence'>>
  ): Promise<boolean> {
    try {
      const success = await mainStore.updateActivity(id, updates);
      if (success) {
        const activity = this.activities.get(id);
        if (activity) {
          runInAction(() => {
            this.activities.set(id, { ...activity, ...updates });
          });
        }
      }
      return success;
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Unknown error';
      });
      return false;
    }
  }

  async deleteActivity(id: string): Promise<boolean> {
    try {
      const success = await mainStore.deleteActivity(id);
      if (success) {
        runInAction(() => {
          this.activities.delete(id);
        });
      }
      return success;
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Unknown error';
      });
      return false;
    }
  }

  clearError(): void {
    this.error = null;
  }
}

export const activityStore = new ActivityStore();

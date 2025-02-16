import { makeAutoObservable, runInAction } from 'mobx';
import { IActivity, INewActivity, IActivityResponse } from './interface';
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
      const threadId = activity.thread_id || activity.ID;
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
    const allActivities = Array.from(this.activities.values());
    const rootActivities = allActivities.filter(
      (activity: IActivity) =>
        // Root activities should have no thread_id or have thread_id equal to their own ID
        !activity.thread_id || activity.thread_id === activity.ID
    );

    return rootActivities.sort(
      (a: IActivity, b: IActivity) =>
        new Date(b.time_created).getTime() - new Date(a.time_created).getTime()
    );
  }

  getThreadResponses(threadId: string): IActivity[] {
    return Array.from(this.activities.values())
      .filter((activity: IActivity) => activity.thread_id === threadId)
      .sort((a: IActivity, b: IActivity) => a.sequence - b.sequence);
  }

  async fetchWorkspaceActivities(workspace: string): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      const response = await mainStore.fetchWorkspaceActivities(workspace);
      console.log('Raw response:', response);

      // Handle both IActivity[] and IActivityResponse cases
      const activities = Array.isArray(response)
        ? (response as IActivity[])
        : response && typeof response === 'object' && 'data' in response
        ? (response as IActivityResponse).data
        : [];
      console.log('Processed activities:', activities);

      runInAction(() => {
        this.activities.clear();
        activities.forEach((activity: IActivity) => {
          if (!activity.ID) {
            console.warn('Activity missing id:', activity);
            return;
          }
          this.activities.set(activity.ID, activity);
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
          this.activities.set(activity.ID, activity);
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
    newActivity: Omit<INewActivity, 'thread_id'>
  ): Promise<IActivity | null> {
    try {
      const activity = await mainStore.createThreadResponse(threadId, newActivity);
      if (activity) {
        runInAction(() => {
          this.activities.set(activity.ID, activity);
        });
        return activity;
      }
      return null;
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Unknown error';
      });
      return null;
    }
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

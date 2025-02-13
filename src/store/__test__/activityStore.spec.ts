import { activityStore } from '../activityStore';
import { mainStore } from '../main';
import { IActivity, INewActivity } from '../interface';

jest.mock('../main');

describe('ActivityStore', () => {
  const mockActivity: IActivity = {
    id: '1',
    threadId: null,
    sequence: 1,
    contentType: 'feature_creation',
    content: 'Test activity',
    workspace: 'test',
    featureUUID: 'feature1',
    phaseUUID: 'phase1',
    feedback: undefined,
    actions: [],
    questions: [],
    timeCreated: new Date().toISOString(),
    timeUpdated: new Date().toISOString(),
    status: 'active',
    author: 'human',
    authorRef: 'user1'
  };

  beforeEach(() => {
    activityStore.activities.clear();
    activityStore.loading = false;
    activityStore.error = null;
  });

  describe('fetchWorkspaceActivities', () => {
    it('should fetch and store activities', async () => {
      const mockActivities = [mockActivity];
      (mainStore.fetchWorkspaceActivities as jest.Mock).mockResolvedValue(mockActivities);

      await activityStore.fetchWorkspaceActivities('test');

      expect(activityStore.activities.size).toBe(1);
      expect(activityStore.activities.get('1')).toEqual(mockActivity);
      expect(activityStore.loading).toBe(false);
    });

    it('should handle errors', async () => {
      (mainStore.fetchWorkspaceActivities as jest.Mock).mockRejectedValue(
        new Error('Fetch failed')
      );

      await activityStore.fetchWorkspaceActivities('test');

      expect(activityStore.error).toBe('Fetch failed');
      expect(activityStore.loading).toBe(false);
    });
  });

  describe('createActivity', () => {
    it('should create and store a new activity', async () => {
      const newActivity: INewActivity = {
        workspace: 'test',
        content: 'New activity',
        contentType: 'feature_creation',
        featureUUID: 'feature1',
        phaseUUID: 'phase1',
        author: 'human',
        authorRef: 'user1'
      };

      (mainStore.createActivity as jest.Mock).mockResolvedValue(mockActivity);

      const result = await activityStore.createActivity(newActivity);

      expect(result).toEqual(mockActivity);
      expect(activityStore.activities.get('1')).toEqual(mockActivity);
    });

    it('should handle creation errors', async () => {
      const newActivity: INewActivity = {
        workspace: 'test',
        content: 'New activity',
        contentType: 'feature_creation',
        featureUUID: 'feature1',
        phaseUUID: 'phase1',
        author: 'human',
        authorRef: 'user1'
      };

      (mainStore.createActivity as jest.Mock).mockRejectedValue(new Error('Creation failed'));

      const result = await activityStore.createActivity(newActivity);

      expect(result).toBeNull();
      expect(activityStore.error).toBe('Creation failed');
    });

    it('should create activity with title', async () => {
      const newActivity: INewActivity = {
        workspace: 'test',
        content: 'New activity',
        contentType: 'feature_creation',
        featureUUID: 'feature1',
        phaseUUID: 'phase1',
        author: 'human',
        authorRef: 'user1',
        title: 'Test Title'
      };

      const mockResponseActivity = {
        ...mockActivity,
        title: 'Test Title'
      };

      (mainStore.createActivity as jest.Mock).mockResolvedValue(mockResponseActivity);

      const result = await activityStore.createActivity(newActivity);

      expect(result).toEqual(mockResponseActivity);
      expect(activityStore.activities.get('1')?.title).toBe('Test Title');
    });

    it('should create activity without title', async () => {
      const newActivity: INewActivity = {
        workspace: 'test',
        content: 'New activity',
        contentType: 'feature_creation',
        featureUUID: 'feature1',
        phaseUUID: 'phase1',
        author: 'human',
        authorRef: 'user1'
      };

      (mainStore.createActivity as jest.Mock).mockResolvedValue(mockActivity);

      const result = await activityStore.createActivity(newActivity);

      expect(result).toEqual(mockActivity);
      expect(activityStore.activities.get('1')?.title).toBeUndefined();
    });
  });

  describe('createThreadResponse', () => {
    it('should create a thread response', async () => {
      const threadResponse: INewActivity = {
        workspace: 'test',
        content: 'Thread response',
        contentType: 'general_update',
        featureUUID: 'feature1',
        phaseUUID: 'phase1',
        author: 'human',
        authorRef: 'user1'
      };

      const mockResponse = {
        ...mockActivity,
        id: '2',
        threadId: '1'
      };

      (mainStore.createActivity as jest.Mock).mockResolvedValue(mockResponse);

      const result = await activityStore.createThreadResponse('1', threadResponse);

      expect(result).toEqual(mockResponse);
      expect(activityStore.activities.get('2')).toEqual(mockResponse);
    });
  });

  describe('updateActivity', () => {
    it('should update an activity', async () => {
      activityStore.activities.set('1', mockActivity);
      const updates = { content: 'Updated content' };

      (mainStore.updateActivity as jest.Mock).mockResolvedValue(true);

      const result = await activityStore.updateActivity('1', updates);

      expect(result).toBe(true);
      expect(activityStore.activities.get('1')?.content).toBe('Updated content');
    });

    it('should handle update errors', async () => {
      activityStore.activities.set('1', mockActivity);
      const updates = { content: 'Updated content' };

      (mainStore.updateActivity as jest.Mock).mockRejectedValue(new Error('Update failed'));

      const result = await activityStore.updateActivity('1', updates);

      expect(result).toBe(false);
      expect(activityStore.error).toBe('Update failed');
    });

    it('should update activity title', async () => {
      activityStore.activities.set('1', mockActivity);
      const updates = { title: 'Updated Title' };

      (mainStore.updateActivity as jest.Mock).mockResolvedValue(true);

      const result = await activityStore.updateActivity('1', updates);

      expect(result).toBe(true);
      expect(activityStore.activities.get('1')?.title).toBe('Updated Title');
    });

    it('should update activity without title', async () => {
      const activityWithTitle = { ...mockActivity, title: 'Initial Title' };
      activityStore.activities.set('1', activityWithTitle);

      const updates = { content: 'Updated content' };

      (mainStore.updateActivity as jest.Mock).mockResolvedValue(true);

      const result = await activityStore.updateActivity('1', updates);

      expect(result).toBe(true);
      expect(activityStore.activities.get('1')).toEqual({
        ...activityWithTitle,
        content: 'Updated content'
      });

      expect(activityStore.activities.get('1')?.title).toBe('Initial Title');
    });
  });

  describe('deleteActivity', () => {
    it('should delete an activity', async () => {
      activityStore.activities.set('1', mockActivity);

      (mainStore.deleteActivity as jest.Mock).mockResolvedValue(true);

      const result = await activityStore.deleteActivity('1');

      expect(result).toBe(true);
      expect(activityStore.activities.has('1')).toBe(false);
    });

    it('should handle deletion errors', async () => {
      activityStore.activities.set('1', mockActivity);

      (mainStore.deleteActivity as jest.Mock).mockRejectedValue(new Error('Deletion failed'));

      const result = await activityStore.deleteActivity('1');

      expect(result).toBe(false);
      expect(activityStore.error).toBe('Deletion failed');
    });
  });

  describe('threadedActivities', () => {
    it('should group activities by thread', () => {
      const threadActivity: IActivity = {
        ...mockActivity,
        threadId: '1',
        id: '2'
      };

      activityStore.activities.set('1', mockActivity);
      activityStore.activities.set('2', threadActivity);

      const threaded = activityStore.threadedActivities;
      expect(threaded['1'].length).toBe(2);
      expect(threaded['1'][0]).toEqual(mockActivity);
      expect(threaded['1'][1]).toEqual(threadActivity);
    });
  });

  describe('rootActivities', () => {
    it('should return root activities sorted by date', () => {
      const olderActivity: IActivity = {
        ...mockActivity,
        id: '2',
        timeCreated: new Date('2023-01-01').toISOString()
      };

      activityStore.activities.set('1', mockActivity);
      activityStore.activities.set('2', olderActivity);

      const roots = activityStore.rootActivities;
      expect(roots.length).toBe(2);
      expect(roots[0].id).toBe('1');
      expect(roots[1].id).toBe('2');
    });
  });

  describe('getThreadResponses', () => {
    it('should return responses for a thread', () => {
      const threadResponse: IActivity = {
        ...mockActivity,
        id: '2',
        threadId: '1'
      };

      activityStore.activities.set('1', mockActivity);
      activityStore.activities.set('2', threadResponse);

      const responses = activityStore.getThreadResponses('1');
      expect(responses.length).toBe(1);
      expect(responses[0]).toEqual(threadResponse);
    });
  });

  describe('clearError', () => {
    it('should clear the error state', () => {
      activityStore.error = 'Test error';
      activityStore.clearError();
      expect(activityStore.error).toBeNull();
    });
  });
});

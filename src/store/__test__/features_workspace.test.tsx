import '@testing-library/jest-dom';
import { waitFor } from '@testing-library/react';
import { featuresWorkspaceStore } from '../features_workspace';
import { mainStore } from '../main';
import { Feature, CreateFeatureInput } from '../interface';

jest.mock('../main');

describe('FeaturesWorkspaceStore', () => {
  const mockWorkspaceUuid = 'workspace-123';
  const mockFeature: Feature = {
    uuid: 'feature-123',
    workspace_uuid: mockWorkspaceUuid,
    name: 'Test Feature',
    brief: 'Test Brief',
    requirements: 'Test Requirements',
    architecture: 'Test Architecture',
    url: 'test-url',
    priority: 1,
    feat_status: 'active'
  } as Feature;

  beforeEach(() => {
    featuresWorkspaceStore.clearWorkspaceFeatures(mockWorkspaceUuid);
    featuresWorkspaceStore.state.error = null;
    featuresWorkspaceStore.state.loading = false;
    featuresWorkspaceStore.state.totalCount = 0;
    jest.clearAllMocks();
  });

  describe('fetchFeatures', () => {
    it('should fetch and store features for a workspace', async () => {
      const mockFeatures = [mockFeature];
      (mainStore.getWorkspaceFeatures as jest.Mock).mockResolvedValue(mockFeatures);

      await featuresWorkspaceStore.fetchFeatures(mockWorkspaceUuid, {});

      expect(featuresWorkspaceStore.state.features.get(mockFeature.uuid)).toEqual(mockFeature);
      expect(featuresWorkspaceStore.state.workspaceFeatures[mockWorkspaceUuid]).toContain(
        mockFeature.uuid
      );
      expect(featuresWorkspaceStore.state.loading).toBe(false);
      expect(featuresWorkspaceStore.state.error).toBeNull();
    });

    it('should handle fetch errors', async () => {
      const error = new Error('Network error');
      (mainStore.getWorkspaceFeatures as jest.Mock).mockRejectedValue(error);

      await featuresWorkspaceStore.fetchFeatures(mockWorkspaceUuid, {});

      waitFor(() => {
        expect(featuresWorkspaceStore.state.error).toBe('Network error');
        expect(featuresWorkspaceStore.state.loading).toBe(false);
        expect(featuresWorkspaceStore.state.features.size).toBe(0);
      });
    });

    it('should clear existing workspace features before fetching new ones', async () => {
      const oldFeature = { ...mockFeature, uuid: 'old-feature' };
      const newFeature = { ...mockFeature, uuid: 'new-feature' };

      featuresWorkspaceStore.state.features.set(oldFeature.uuid, oldFeature);
      featuresWorkspaceStore.state.workspaceFeatures[mockWorkspaceUuid] = [oldFeature.uuid];

      (mainStore.getWorkspaceFeatures as jest.Mock).mockResolvedValue([newFeature]);

      await featuresWorkspaceStore.fetchFeatures(mockWorkspaceUuid, {});

      waitFor(() => {
        expect(featuresWorkspaceStore.state.workspaceFeatures[mockWorkspaceUuid]).toEqual([
          newFeature.uuid
        ]);
        expect(featuresWorkspaceStore.state.features.has(oldFeature.uuid)).toBeFalsy();
      });
    });
  });

  describe('fetchFeatureByUuid', () => {
    it('should fetch and store a single feature', async () => {
      (mainStore.getFeaturesByUuid as jest.Mock).mockResolvedValue(mockFeature);

      await featuresWorkspaceStore.fetchFeatureByUuid(mockFeature.uuid);

      expect(featuresWorkspaceStore.state.features.get(mockFeature.uuid)).toEqual(mockFeature);
      expect(featuresWorkspaceStore.state.loading).toBe(false);
      expect(featuresWorkspaceStore.state.error).toBeNull();
    });

    it('should handle fetch errors for single feature', async () => {
      const error = new Error('Feature not found');
      (mainStore.getFeaturesByUuid as jest.Mock).mockRejectedValue(error);

      await featuresWorkspaceStore.fetchFeatureByUuid('non-existent');

      waitFor(() => {
        expect(featuresWorkspaceStore.state.error).toBe('Feature not found');
        expect(featuresWorkspaceStore.state.loading).toBe(false);
      });
    });

    it('should update workspace index when fetching single feature', async () => {
      (mainStore.getFeaturesByUuid as jest.Mock).mockResolvedValue(mockFeature);

      await featuresWorkspaceStore.fetchFeatureByUuid(mockFeature.uuid);

      expect(featuresWorkspaceStore.state.workspaceFeatures[mockWorkspaceUuid]).toContain(
        mockFeature.uuid
      );
    });
  });

  describe('createFeature', () => {
    const mockInput: CreateFeatureInput = {
      workspace_uuid: mockWorkspaceUuid,
      name: 'New Feature'
    };

    it('should create and store a new feature', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue(mockFeature)
      };
      (mainStore.addWorkspaceFeature as jest.Mock).mockResolvedValue(mockResponse);

      const result = await featuresWorkspaceStore.createFeature(mockInput);

      expect(result).toEqual(mockFeature);
      expect(featuresWorkspaceStore.state.features.get(mockFeature.uuid)).toEqual(mockFeature);
      expect(featuresWorkspaceStore.state.workspaceFeatures[mockWorkspaceUuid]).toContain(
        mockFeature.uuid
      );
    });

    it('should handle creation errors', async () => {
      const error = new Error('Creation failed');
      (mainStore.addWorkspaceFeature as jest.Mock).mockRejectedValue(error);

      const result = await featuresWorkspaceStore.createFeature(mockInput);

      waitFor(() => {
        expect(result).toBeNull();
        expect(featuresWorkspaceStore.state.error).toBe('Failed to create feature');
        expect(featuresWorkspaceStore.state.loading).toBe(false);
      });
    });
  });

  describe('archiveFeature', () => {
    it('should successfully archive a feature', async () => {
      featuresWorkspaceStore.state.features.set(mockFeature.uuid, mockFeature);
      (mainStore.archiveFeature as jest.Mock).mockResolvedValue(true);

      const result = await featuresWorkspaceStore.archiveFeature(mockFeature.uuid);

      expect(result).toBe(true);
      expect(featuresWorkspaceStore.state.features.get(mockFeature.uuid)?.feat_status).toBe(
        'archived'
      );
    });

    it('should handle archive errors', async () => {
      const error = new Error('Archive failed');
      (mainStore.archiveFeature as jest.Mock).mockRejectedValue(error);

      const result = await featuresWorkspaceStore.archiveFeature(mockFeature.uuid);

      waitFor(() => {
        expect(result).toBe(false);
        expect(featuresWorkspaceStore.state.error).toBe('Failed to archive feature');
      });
    });
  });

  describe('fetchWorkspaceFeaturesCount', () => {
    it('should fetch and store the total count', async () => {
      const mockCount = 42;
      (mainStore.getWorkspaceFeaturesCount as jest.Mock).mockResolvedValue(mockCount);

      await featuresWorkspaceStore.fetchWorkspaceFeaturesCount(mockWorkspaceUuid);

      expect(featuresWorkspaceStore.state.totalCount).toBe(mockCount);
      expect(featuresWorkspaceStore.state.loading).toBe(false);
      expect(featuresWorkspaceStore.state.error).toBeNull();
    });

    it('should handle count fetch errors', async () => {
      const error = new Error('Count fetch failed');
      (mainStore.getWorkspaceFeaturesCount as jest.Mock).mockRejectedValue(error);

      await featuresWorkspaceStore.fetchWorkspaceFeaturesCount(mockWorkspaceUuid);

      waitFor(() => {
        expect(featuresWorkspaceStore.state.error).toBe('Failed to fetch features count');
        expect(featuresWorkspaceStore.state.loading).toBe(false);
      });
    });
  });

  describe('getFeature', () => {
    it('should return a feature by uuid', () => {
      featuresWorkspaceStore.state.features.set(mockFeature.uuid, mockFeature);

      const result = featuresWorkspaceStore.getFeature(mockFeature.uuid);

      expect(result).toEqual(mockFeature);
    });

    it('should return undefined for non-existent feature', () => {
      const result = featuresWorkspaceStore.getFeature('non-existent');

      expect(result).toBeUndefined();
    });
  });

  describe('getWorkspaceFeatures', () => {
    it('should return all features for a workspace', () => {
      const features = [mockFeature, { ...mockFeature, uuid: 'feature-456' }];
      features.forEach((feature: Feature) => {
        featuresWorkspaceStore.state.features.set(feature.uuid, feature);
      });
      featuresWorkspaceStore.state.workspaceFeatures[mockWorkspaceUuid] = features.map(
        (f: Feature) => f.uuid
      );

      const result = featuresWorkspaceStore.getWorkspaceFeatures(mockWorkspaceUuid);

      expect(result).toHaveLength(2);
      expect(result).toEqual(expect.arrayContaining(features));
    });

    it('should return empty array for non-existent workspace', () => {
      const result = featuresWorkspaceStore.getWorkspaceFeatures('non-existent');

      expect(result).toEqual([]);
    });
  });

  describe('clearWorkspaceFeatures', () => {
    it('should clear all features for a workspace', () => {
      featuresWorkspaceStore.state.features.set(mockFeature.uuid, mockFeature);
      featuresWorkspaceStore.state.workspaceFeatures[mockWorkspaceUuid] = [mockFeature.uuid];

      featuresWorkspaceStore.clearWorkspaceFeatures(mockWorkspaceUuid);

      waitFor(() => {
        expect(featuresWorkspaceStore.state.features.size).toBe(0);
        expect(featuresWorkspaceStore.state.workspaceFeatures[mockWorkspaceUuid]).toBeUndefined();
      });
    });

    it('should not affect other workspaces', () => {
      const otherWorkspace = 'other-workspace';
      const otherFeature = { ...mockFeature, workspace_uuid: otherWorkspace };

      featuresWorkspaceStore.state.features.set(mockFeature.uuid, mockFeature);
      featuresWorkspaceStore.state.features.set(otherFeature.uuid, otherFeature);
      featuresWorkspaceStore.state.workspaceFeatures[mockWorkspaceUuid] = [mockFeature.uuid];
      featuresWorkspaceStore.state.workspaceFeatures[otherWorkspace] = [otherFeature.uuid];

      featuresWorkspaceStore.clearWorkspaceFeatures(mockWorkspaceUuid);

      waitFor(() => {
        expect(featuresWorkspaceStore.state.features.has(otherFeature.uuid)).toBeTruthy();
        expect(featuresWorkspaceStore.state.workspaceFeatures[otherWorkspace]).toEqual([
          otherFeature.uuid
        ]);
      });
    });
  });
});

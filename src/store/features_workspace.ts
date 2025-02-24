import { makeAutoObservable, runInAction } from 'mobx';
import { Feature, CreateFeatureInput, QueryParams } from './interface';
import { mainStore } from './main';

export interface IFeatureWorkspaceState {
  features: Map<string, Feature>;
  workspaceFeatures: { [workspace_uuid: string]: string[] };
  loading: boolean;
  error: string | null;
  totalCount: number;
}

export class FeaturesWorkspaceStore {
  state: IFeatureWorkspaceState = {
    features: new Map(),
    workspaceFeatures: {},
    loading: false,
    error: null,
    totalCount: 0
  };

  constructor() {
    makeAutoObservable(this);
  }

  getFeature(uuid: string): Feature | undefined {
    return this.state.features.get(uuid);
  }

  getWorkspaceFeatures(workspace_uuid: string): Feature[] {
    const featureIds = this.state.workspaceFeatures[workspace_uuid] || [];
    return featureIds
      .map((id: string) => this.state.features.get(id))
      .filter((f: Feature | undefined): f is Feature => f !== undefined);
  }

  async fetchFeatures(workspace_uuid: string, params: QueryParams): Promise<void> {
    try {
      this.setLoading(true);
      const features = await mainStore.getWorkspaceFeatures(workspace_uuid, params);

      runInAction(() => {
        this.state.workspaceFeatures[workspace_uuid] = [];

        features.forEach((feature: Feature) => {
          this.state.features.set(feature.uuid, feature);
          if (!this.state.workspaceFeatures[workspace_uuid]) {
            this.state.workspaceFeatures[workspace_uuid] = [];
          }
          this.state.workspaceFeatures[workspace_uuid].push(feature.uuid);
        });
      });
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to fetch features');
    } finally {
      this.setLoading(false);
    }
  }

  async fetchFeatureByUuid(uuid: string): Promise<void> {
    try {
      this.setLoading(true);
      const feature = await mainStore.getFeaturesByUuid(uuid);

      if (feature) {
        runInAction(() => {
          this.state.features.set(feature.uuid, feature);
          if (feature.workspace_uuid) {
            if (!this.state.workspaceFeatures[feature.workspace_uuid]) {
              this.state.workspaceFeatures[feature.workspace_uuid] = [];
            }
            if (!this.state.workspaceFeatures[feature.workspace_uuid].includes(feature.uuid)) {
              this.state.workspaceFeatures[feature.workspace_uuid].push(feature.uuid);
            }
          }
        });
      }
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to fetch feature');
    } finally {
      this.setLoading(false);
    }
  }

  async createFeature(input: CreateFeatureInput): Promise<Feature | null> {
    try {
      this.setLoading(true);
      const response = await mainStore.addWorkspaceFeature(input);
      const feature = await response.json();

      if (feature) {
        runInAction(() => {
          this.state.features.set(feature.uuid, feature);
          if (!this.state.workspaceFeatures[feature.workspace_uuid]) {
            this.state.workspaceFeatures[feature.workspace_uuid] = [];
          }
          this.state.workspaceFeatures[feature.workspace_uuid].push(feature.uuid);
        });
        return feature;
      }
      return null;
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to create feature');
      return null;
    } finally {
      this.setLoading(false);
    }
  }

  async archiveFeature(uuid: string): Promise<boolean> {
    try {
      this.setLoading(true);
      const result = await mainStore.archiveFeature(uuid);

      if (result) {
        runInAction(() => {
          const feature = this.state.features.get(uuid);
          if (feature) {
            feature.feat_status = 'archived';
            this.state.features.set(uuid, feature);
          }
        });
        return true;
      }
      return false;
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to archive feature');
      return false;
    } finally {
      this.setLoading(false);
    }
  }

  private setLoading(loading: boolean): void {
    this.state.loading = loading;
    this.state.error = null;
  }

  private setError(error: string): void {
    this.state.error = error;
    this.state.loading = false;
  }

  clearWorkspaceFeatures(workspace_uuid: string): void {
    const featureIds = this.state.workspaceFeatures[workspace_uuid] || [];
    featureIds.forEach((id: string) => this.state.features.delete(id));
    delete this.state.workspaceFeatures[workspace_uuid];
  }

  async fetchWorkspaceFeaturesCount(workspace_uuid: string): Promise<void> {
    try {
      this.setLoading(true);
      const count = await mainStore.getWorkspaceFeaturesCount(workspace_uuid);

      runInAction(() => {
        this.state.totalCount = count;
      });
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to fetch features count');
    } finally {
      this.setLoading(false);
    }
  }
}

export const featuresWorkspaceStore = new FeaturesWorkspaceStore();

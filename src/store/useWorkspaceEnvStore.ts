import { create } from 'zustand';

interface EnvVar {
  key: string;
  value: string;
}

interface WorkspaceEnvState {
  envVars: EnvVar[];
  isLoading: boolean;
  setEnvVars: (vars: EnvVar[]) => void;
  updateEnvVar: (key: string, value: string) => void;
  addEnvVar: (var: EnvVar) => void;
  removeEnvVar: (key: string) => void;
}

export const useWorkspaceEnvStore = create<WorkspaceEnvState>((set) => ({
  envVars: [],
  isLoading: false,
  setEnvVars: (vars) => set({ envVars: vars }),
  updateEnvVar: (key, value) => set((state) => ({
    envVars: state.envVars.map(v => v.key === key ? { ...v, value } : v)
  })),
  addEnvVar: (newVar) => set((state) => ({
    envVars: [...state.envVars, newVar]
  })),
  removeEnvVar: (key) => set((state) => ({
    envVars: state.envVars.filter(v => v.key !== key)
  })),
}));

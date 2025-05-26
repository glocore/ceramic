import { create } from "zustand";

interface SystemState {
  homeDir?: string;
  setHomeDir: (homeDir: string) => void;
}

export const useSystemStore = create<SystemState>()((set) => {
  return {
    setHomeDir(homeDir) {
      return set({ homeDir });
    },
  };
});

window.electronApi?.getHomeDir().then((homeDir) => {
  return useSystemStore.getState().setHomeDir(homeDir);
});

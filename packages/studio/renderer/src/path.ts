import { useSystemStore } from "./store";

export const getPrintablePath = (path: string) => {
  const homeDir = useSystemStore.getState().homeDir;

  if (!homeDir) {
    return path;
  }

  const printablePath = path.replace(homeDir, "~");

  return printablePath;
};

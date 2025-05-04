import { contextBridge, ipcRenderer } from "electron";

const electronApi = {
  initialRenderComplete: () => ipcRenderer.send("initial-render-complete"),
  closeWindow: () => ipcRenderer.send("close-window"),
  createNewProject: (options: { projectName: string }) =>
    ipcRenderer.invoke("create-new-project", options),
  requestNewProjectTargetDir: () =>
    ipcRenderer.invoke("request-new-project-target-dir"),
  getRecentProjects: () => ipcRenderer.invoke("get-recent-projects"),
} as const;

contextBridge.exposeInMainWorld("electronApi", electronApi);

export type ElectronApi = typeof electronApi;

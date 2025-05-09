import { contextBridge, ipcRenderer } from "electron";

const electronApi = {
  initialRenderComplete: () => ipcRenderer.send("initial-render-complete"),
  closeWindow: () => ipcRenderer.send("close-window"),
  createNewProject: (options: { projectName: string; projectPath: string }) =>
    ipcRenderer.invoke("create-new-project", options),
  requestNewProjectTargetDir: (): Promise<string> =>
    ipcRenderer.invoke("request-new-project-target-dir"),
  getRecentProjects: () => ipcRenderer.invoke("get-recent-projects"),
  openProject: (props: { project: { name: string; path: string } }) =>
    ipcRenderer.invoke("open-project", { project: props.project }),
} as const;

contextBridge.exposeInMainWorld("electronApi", electronApi);

export type ElectronApi = typeof electronApi;

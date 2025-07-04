import { File } from "@ceramic/common";
import { contextBridge, ipcRenderer } from "electron";

const electronApi = {
  initialRenderComplete: () => ipcRenderer.send("initial-render-complete"),

  closeWindow: () => ipcRenderer.send("close-window"),

  getHomeDir: () => ipcRenderer.invoke("get-home-dir"),

  createNewProject: (options: {
    projectName: string;
    projectIdentifier: string;
    projectPath: string;
  }): Promise<string> => ipcRenderer.invoke("create-new-project", options),

  requestNewProjectTargetDir: (): Promise<string> =>
    ipcRenderer.invoke("request-new-project-target-dir"),

  getRecentProjects: () => ipcRenderer.invoke("get-recent-projects"),

  openProject: (props: { project: { path: string } }) =>
    ipcRenderer.invoke("open-project", { project: props.project }),

  getProjectFiles: (props: { path: string }): Promise<File[]> =>
    ipcRenderer.invoke("get-project-files", props),

  getFileContents: (props: { path: string }) =>
    ipcRenderer.invoke("get-file-contents", props),
} as const;

contextBridge.exposeInMainWorld("electronApi", electronApi);

export type ElectronApi = typeof electronApi;

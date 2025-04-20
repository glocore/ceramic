import { contextBridge, ipcRenderer } from "electron";

const electronApi = {
  initialRenderComplete: () => ipcRenderer.send("initial-render-complete"),
  closeWindow: () => ipcRenderer.send("close-window"),
} as const;

contextBridge.exposeInMainWorld("electronApi", electronApi);

export type ElectronApi = typeof electronApi;

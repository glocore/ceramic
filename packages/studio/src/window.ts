import { BaseWindow } from "electron";

type WindowId = "welcome" | "ide";

export const windows = new Map<WindowId, BaseWindow>();

export const closeWindow = (windowId: WindowId) => {
  const window = windows.get(windowId);

  window?.close();
  windows.delete(windowId);
};

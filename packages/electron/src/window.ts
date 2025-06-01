import { BaseWindow } from "electron";

type WindowId = "welcome" | "ide";

export const windows = new Map<WindowId, BaseWindow>();

/**
 * use this function to close windows instead of `window.close()`.
 */
export const closeWindow = (windowId: WindowId) => {
  const window = windows.get(windowId);

  // @ts-expect-error this is the only place where the `close()` method is directly invoked.
  window?.close();
  windows.delete(windowId);
};

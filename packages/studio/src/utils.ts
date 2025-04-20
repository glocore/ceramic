import { BaseWindow } from "electron";

export const closeWindow = (window?: BaseWindow) => {
  window?.hide();
  window?.close();
};

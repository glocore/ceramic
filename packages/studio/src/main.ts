import log from "electron-log/main";

log.errorHandler.startCatching({ showDialog: false });

import { app, BrowserWindow, ipcMain } from "electron";
import started from "electron-squirrel-startup";
import { createWelcomeWindow } from "./windows/welcome/window";
import { closeWindow } from "./window";
import { createIdeWindow } from "./windows/ide/window";

if (started) {
  app.quit();
}

app.on("ready", createWelcomeWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWelcomeWindow();
  }
});

ipcMain.handle(
  "open-project",
  (_, { project }: { project: { name: string; path: string } }) => {
    closeWindow("welcome");
    createIdeWindow({ project });
  }
);

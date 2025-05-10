import log from "electron-log/main";

log.errorHandler.startCatching({ showDialog: false });

import { app, BrowserWindow, ipcMain } from "electron";
import started from "electron-squirrel-startup";
import { createWelcomeWindow } from "./windows/welcome/window";
import { closeWindow } from "./window";
import { createIdeWindow } from "./windows/ide/window";
import { createCeramicApp } from "./createCeramicApp";

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
  (_, { project }: { project: { path: string } }) => {
    closeWindow("welcome");
    createIdeWindow({ project });
  }
);

ipcMain.handle(
  "create-new-project",
  (
    e,
    {
      projectName,
      projectIdentifier,
      projectPath: targetDir,
    }: { projectName: string; projectIdentifier: string; projectPath: string }
  ) => {
    const projectPath = createCeramicApp({
      projectName,
      projectIdentifier,
      targetDir,
    });

    return projectPath;
  }
);
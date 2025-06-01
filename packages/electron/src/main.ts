import log from "electron-log/main";

log.errorHandler.startCatching({ showDialog: false });

import { app, BrowserWindow, ipcMain } from "electron";
import started from "electron-squirrel-startup";
import { createWelcomeWindow } from "./windows/welcome/window";
import { closeWindow } from "./window";
import { createIdeWindow } from "./windows/ide/window";
import { createCeramicApp } from "./createCeramicApp";
import fs from "node:fs/promises";
import os from "node:os";
import { getFiles } from "./utils";

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

ipcMain.handle("get-home-dir", () => {
  return os.homedir();
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

ipcMain.handle("get-project-files", (_, project: { path: string }) => {
  return getFiles({ path: project.path });
});

ipcMain.handle("get-file-contents", async (e, props: { path: string }) => {
  return fs.readFile(props.path, { encoding: "utf-8" });
});

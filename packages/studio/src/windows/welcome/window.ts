import { BrowserWindow, dialog, ipcMain, Menu } from "electron";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import { createCeramicApp } from "src/createCeramicApp";
import { store } from "src/store";
import { closeWindow } from "../../utils";
import { createIdeWindow } from "../ide/window";

declare const RENDERER_VITE_DEV_SERVER_URL: string;
declare const RENDERER_VITE_NAME: string;

let welcomeWindow: BrowserWindow | undefined;

export const createWelcomeWindow = () => {
  welcomeWindow = new BrowserWindow({
    width: 742,
    height: 462,
    frame: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    show: false,
    paintWhenInitiallyHidden: true,
    title: "Welcome to Ceramic Studio",

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  if (RENDERER_VITE_DEV_SERVER_URL) {
    welcomeWindow.loadURL(`${RENDERER_VITE_DEV_SERVER_URL}/welcome`);
  } else {
    welcomeWindow.loadURL(
      url.format({
        protocol: "file",
        slashes: true,
        pathname: path.join(
          __dirname,
          `../renderer/${RENDERER_VITE_NAME}/index.html`
        ),
      })
    );
  }

  // prevent the html <title> from updating the window title (shown in the window picker for example)
  welcomeWindow.on("page-title-updated", (e) => e.preventDefault());

  welcomeWindow.on("ready-to-show", () => {
    const template = [
      { role: "appMenu" },
      { role: "fileMenu" },
      { role: "editMenu" },
      // { role: 'viewMenu' }
      {
        label: "View",
        submenu: [
          { role: "reload" },
          { role: "forceReload" },
          { role: "toggleDevTools" },
          { type: "separator" },
          { type: "separator" },
          { role: "togglefullscreen" },
        ],
      },
      { role: "windowMenu" },
      { role: "help" },
    ] satisfies Parameters<typeof Menu.buildFromTemplate>[0];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  });

  welcomeWindow.webContents.ipc.on("initial-render-complete", () => {
    welcomeWindow?.show();
  });

  welcomeWindow.webContents.ipc.on("close-window", () =>
    closeWindow(welcomeWindow)
  );

  welcomeWindow.webContents.ipc.handle("get-recent-projects", () => {
    const storedRecents = new Set(store.get("recents", []).reverse());

    const recents = new Map<string, string>();

    storedRecents.forEach((projectPath) => {
      const pkg = JSON.parse(
        fs.readFileSync(path.join(projectPath, "package.json"), "utf-8")
      );
      const projectName = pkg.name;
      recents.set(projectPath, projectName);
    });

    return recents;
  });
};

let newProjectTargetDir: string;

ipcMain.handle("request-new-project-target-dir", async () => {
  const result = await dialog.showOpenDialog(welcomeWindow, {
    title: "Select destination",
    properties: ["openDirectory"],
  });

  if (result.canceled) return;

  newProjectTargetDir = result.filePaths[0] as string | undefined;

  return newProjectTargetDir;
});

ipcMain.handle(
  "create-new-project",
  (e, { projectName }: { projectName: string }) => {
    const projectPath = createCeramicApp({
      projectName,
      targetDir: newProjectTargetDir,
    });

    const recents = store.get("recents", []);
    recents.push(projectPath);

    store.set("recents", recents);

    welcomeWindow.close();

    createIdeWindow({ projectPath });
  }
);

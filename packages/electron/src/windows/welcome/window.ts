import { invariant } from "@ceramic/common";
import { BrowserWindow, dialog, ipcMain, Menu } from "electron";
import path from "node:path";
import { closeWindow, windows } from "src/window";

export const createWelcomeWindow = () => {
  const welcomeWindow = new BrowserWindow({
    width: 742,
    height: 462,
    frame: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    show: true,
    paintWhenInitiallyHidden: true,
    title: "Welcome to Ceramic Studio",

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  windows.set("welcome", welcomeWindow);

  welcomeWindow.loadURL("http://localhost:5173/welcome");

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
    closeWindow("welcome")
  );
};

ipcMain.handle("request-new-project-target-dir", async () => {
  const window = windows.get("welcome");

  invariant(!!window);

  const result = await dialog.showOpenDialog(window, {
    title: "Select project destination",
    properties: ["openDirectory"],
  });

  if (result.canceled) return;

  const newProjectTargetDir = result.filePaths[0] as string | undefined;

  return newProjectTargetDir;
});

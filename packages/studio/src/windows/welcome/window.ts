import { BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import url from "node:url";
import { closeWindow } from "../../utils";

declare const WELCOME_WINDOW_VITE_DEV_SERVER_URL: string;
declare const WELCOME_WINDOW_VITE_NAME: string;

let welcomeWindow: BrowserWindow;

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
  if (WELCOME_WINDOW_VITE_DEV_SERVER_URL) {
    welcomeWindow.loadURL(WELCOME_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    welcomeWindow.loadURL(
      url.format({
        protocol: "file",
        slashes: true,
        pathname: path.join(
          __dirname,
          `../renderer/${WELCOME_WINDOW_VITE_NAME}/index.html`
        ),
      })
    );
  }

  // prevent the html <title> from updating the window title (shown in the window picker for example)
  welcomeWindow.on("page-title-updated", (e) => e.preventDefault());
};

ipcMain.on("initial-render-complete", () => {
  welcomeWindow?.show();
});

ipcMain.on("close-window", () => closeWindow(welcomeWindow));

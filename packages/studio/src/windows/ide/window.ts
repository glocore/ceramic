import { BrowserWindow } from "electron";
import path from "node:path";
import url from "node:url";
import { closeWindow } from "src/window";

declare const RENDERER_VITE_DEV_SERVER_URL: string;
declare const RENDERER_VITE_NAME: string;

let ideWindow: BrowserWindow;

export const createIdeWindow = ({ project }: { project: { path: string } }) => {
  ideWindow = new BrowserWindow({
    titleBarStyle: "hiddenInset",
    frame: false,
    show: true,
    paintWhenInitiallyHidden: true,
    title: path.basename(project.path),
    width: 1280,
    height: 800,

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  if (RENDERER_VITE_DEV_SERVER_URL) {
    const url = new URL("/ide", RENDERER_VITE_DEV_SERVER_URL);
    url.searchParams.set("projectPath", project.path);

    ideWindow.loadURL(url.toString());
  } else {
    ideWindow.loadURL(
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
  ideWindow.on("page-title-updated", (e) => e.preventDefault());

  ideWindow.webContents.ipc.on("initial-render-complete", () => {
    ideWindow?.show();
  });

  ideWindow.webContents.ipc.on("close-window", () => closeWindow("ide"));
};

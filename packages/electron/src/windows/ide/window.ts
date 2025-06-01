import { BrowserWindow } from "electron";
import path from "node:path";
import { closeWindow } from "src/window";

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

  const url = new URL("/ide", "http://localhost:5173");
  url.searchParams.set("projectPath", project.path);
  ideWindow.loadURL(url.toString());

  // prevent the html <title> from updating the window title (shown in the window picker for example)
  ideWindow.on("page-title-updated", (e) => e.preventDefault());

  ideWindow.webContents.ipc.on("initial-render-complete", () => {
    ideWindow?.show();
  });

  ideWindow.webContents.ipc.on("close-window", () => closeWindow("ide"));
};

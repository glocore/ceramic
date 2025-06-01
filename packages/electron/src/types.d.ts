declare module "electron" {
  interface BrowserWindow extends Electron.BrowserWindow {
    close: never;
  }
  interface BaseWindow extends Electron.BaseWindow {
    close: never;
  }
}

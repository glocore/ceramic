import type { ElectronApi } from "../src/windows/welcome/preload";

declare global {
  interface Window {
    electronApi: ElectronApi;
  }
}

import type { ElectronApi } from "../../src/preload";

declare global {
  interface Window {
    electronApi?: ElectronApi;
  }
}

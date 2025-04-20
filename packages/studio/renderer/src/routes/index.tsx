import {
  RiAddBoxLine,
  RiCloseLine,
  RiDownloadLine,
  RiFolder2Line,
} from "@remixicon/react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import pkg from "../../../package.json";
import icon from "/icon.png";

export const Route = createFileRoute("/")({
  component: Index,
});

const closeWindow = () => {
  window.electronApi.closeWindow();
};

function Index() {
  useEffect(() => {
    requestAnimationFrame(() => {
      window.electronApi.initialRenderComplete();
    });
  }, []);

  return (
    <div className="flex flex-row h-screen w-screen">
      <div className="flex flex-col items-center justify-center gap-8 basis-3/5 bg-white [-webkit-app-region:_drag]">
        <button
          onClick={closeWindow}
          className="absolute top-3 start-3 bg-[#bcbcbc] active:bg-[#acabab] hover:bg-[#929292] rounded-full w-4 h-4 flex items-center justify-center"
        >
          <RiCloseLine className="w-3 text-white" />
        </button>
        <div className="flex flex-col gap-2 items-center">
          <img src={icon} className="h-30 w-30" />
          <div className="flex flex-col  items-center">
            <h1 className="text-4xl font-semibold">Ceramic Studio</h1>
            <span className="text-neutral-500">Version {pkg.version}</span>
          </div>
        </div>

        <div className="flex flex-col w-full max-w-80 gap-2.5">
          <button className="bg-[#f1f1f1] active:bg-[#e7e6e6] rounded-lg p-2 flex flex-row items-center gap-2 flex-1 font-medium text-sm">
            <RiAddBoxLine className="text-neutral-500 w-5" />
            Create New Project...
          </button>
          <button className="bg-[#f1f1f1] active:bg-[#e7e6e6] rounded-lg p-2 flex flex-row items-center gap-2 flex-1 font-medium text-sm">
            <RiDownloadLine className="text-neutral-500 w-5" />
            Clone Git Repository...
          </button>
          <button className="bg-[#f1f1f1] active:bg-[#e7e6e6] rounded-lg p-2 flex flex-row items-center gap-2 flex-1 font-medium text-sm">
            <RiFolder2Line className="text-neutral-500 w-5" />
            Open Existing Project...
          </button>
        </div>
      </div>
      <div className="flex-1 bg-[#e4e4e4]" />
    </div>
  );
}

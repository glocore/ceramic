import { invariant } from "@ceramic/common";
import {
  RiAddBoxLine,
  RiCloseLine,
  RiDownloadLine,
  RiFolder2Line,
} from "@remixicon/react";
import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useRef } from "react";
import { db } from "src/db";
import { cn } from "src/utils";
import pkg from "../../../../package.json";
import icon from "/icon.png";

export const Route = createFileRoute("/welcome/")({
  component: WelcomePage,
});

type Project = { name: string; path: string };

function WelcomePage() {
  const recentProjects = useLiveQuery(() => db.recentProjects.toArray()) ?? [];

  useEffect(() => {
    requestAnimationFrame(() => {
      window.electronApi?.initialRenderComplete();
    });
  }, []);

  const navigate = Route.useNavigate();

  const createNewProject = async () => {
    const targetDir = await window.electronApi?.requestNewProjectTargetDir();

    invariant(typeof targetDir === "string");

    navigate({
      to: "/welcome/new-project",
      search: { projectPath: targetDir },
    });
  };

  const handleRecentProjectClick = (project: Project) => {
    window.electronApi?.openProject({ project });
  };

  return (
    <div className="flex flex-row h-screen w-screen">
      <div className="flex flex-col items-center justify-center gap-8 basis-3/5 bg-white window-drag">
        <CloseButton className="absolute top-3 start-3" />
        <div className="flex flex-col gap-2 items-center">
          <img src={icon} className="h-30 w-30" />
          <div className="flex flex-col items-center">
            <h1 className="text-4xl font-semibold">Ceramic Studio</h1>
            <div className="no-window-drag select-text! flex justify-center w-full">
              <span className="text-neutral-500 select-text!">
                Version {pkg.version}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-full max-w-80 gap-2.5">
          <button
            className="bg-[#f1f1f1] active:bg-[#e7e6e6] rounded-lg p-2 flex flex-row items-center gap-2 flex-1 font-medium text-sm"
            onClick={createNewProject}
          >
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
      <div className="flex-1 bg-[#e4e4e4]">
        {recentProjects.map((project) => (
          <button
            key={project.path}
            onClick={() => handleRecentProjectClick(project)}
          >
            <p>{project.name}</p>
            <p>{project.path}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

const CloseButton = ({
  className,
  ...delegated
}: React.ComponentProps<"button">) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={buttonRef}
      onClick={closeWindow}
      className={cn(
        "bg-[#bcbcbc] active:bg-[#acabab] hover:bg-[#929292] rounded-full w-4 h-4 flex items-center justify-center",
        className
      )}
      {...delegated}
    >
      <RiCloseLine className="w-3 text-white" />
    </button>
  );
};

const closeWindow = () => {
  window.electronApi?.closeWindow();
};

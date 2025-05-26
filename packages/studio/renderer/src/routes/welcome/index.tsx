import { invariant } from "@ceramic/common";
import {
  RiAddBoxLine,
  RiBox3Line,
  RiCloseLine,
  RiDownloadLine,
  RiFolder2Line,
} from "@remixicon/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { db } from "src/db";
import { tinykeys } from "src/tinykeys";
import { cn } from "src/utils";
import pkg from "../../../../package.json";
import icon from "/icon.png";
import { getPrintablePath } from "src/path";

export const Route = createFileRoute("/welcome/")({
  component: WelcomePage,
});

function WelcomePage() {
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
      <RecentProjects />
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

const RecentProjects = () => {
  const { data: recentProjects } = useSuspenseQuery({
    queryKey: ["recent-projects"],
    queryFn: () => db.recentProjects.toArray(),
  });

  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const handleListItemClick = (index: number) => {
    setSelectedIndex(index);
  };

  const handleListItemDoubleClick = (index: number) => {
    const project = recentProjects[index];

    if (!project) {
      return;
    }

    return window.electronApi?.openProject({ project });
  };

  const listRef = useRef<HTMLUListElement>(null);

  const openProjectAtCurrentIndex = () => {
    const project = recentProjects[selectedIndex];

    if (!project) {
      return;
    }

    return window.electronApi?.openProject({ project });
  };

  useEffect(() => {
    if (!listRef.current) {
      return;
    }

    const unsubscribe = tinykeys(listRef.current, {
      ArrowUp: () => {
        return setSelectedIndex((currentIndex) => {
          let nextIndex = currentIndex - 1;
          if (nextIndex < 0) {
            nextIndex = 0;
          }

          return nextIndex;
        });
      },
      ArrowDown: () => {
        return setSelectedIndex((currentIndex) => {
          let nextIndex = currentIndex + 1;
          if (nextIndex > recentProjects.length - 1) {
            nextIndex = recentProjects.length - 1;
          }

          return nextIndex;
        });
      },
      Enter: () => {
        openProjectAtCurrentIndex();
      },
    });

    return () => {
      unsubscribe();
    };
  }, [recentProjects]);

  return (
    <ul
      ref={listRef}
      className="flex-1 bg-[#e4e4e4] overflow-y-auto py-2.5"
      role="listbox"
      aria-labelledby="recent_projects"
      aria-activedescendant={recentProjects[selectedIndex]?.path}
      tabIndex={0}
    >
      {recentProjects.map((project, index) => (
        <li
          key={project.path}
          id={project.path}
          onClick={() => handleListItemClick(index)}
          onDoubleClick={() => handleListItemDoubleClick(index)}
          className="group/project flex items-center gap-2.5 px-2.5 py-1.5 mx-2.5 rounded-md text-sm aria-selected:bg-emerald-500 aria-selected:text-white"
          role="option"
          aria-selected={index === selectedIndex}
          aria-label={project.name}
        >
          <RiBox3Line className="text-neutral-700 group-aria-selected/project:text-white" />
          <div className="flex flex-col">
            <span className="font-semibold text-neutral-700 group-aria-selected/project:text-white">
              {project.name}
            </span>
            <span className="text-xs text-neutral-500/80 group-aria-selected/project:text-neutral-100/80">
              {getPrintablePath(project.path)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
};

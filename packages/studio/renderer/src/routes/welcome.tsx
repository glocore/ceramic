import {
  RiAddBoxLine,
  RiCloseLine,
  RiDownloadLine,
  RiFolder2Line,
} from "@remixicon/react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import pkg from "../../../package.json";
import { cn } from "../utils";
import icon from "/icon.png";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/welcome")({
  component: WelcomePage,
  loader({ context: { queryClient } }) {
    return queryClient.ensureQueryData(recentProjectsQueryOptions);
  },
});

function WelcomePage() {
  const recentProjectsQuery = useSuspenseQuery(recentProjectsQueryOptions);

  const recentProjects = [] as { name: string; path: string }[];

  recentProjectsQuery.data.forEach((projectName, projectPath) =>
    recentProjects.push({ name: projectName, path: projectPath })
  );

  useEffect(() => {
    requestAnimationFrame(() => {
      window.electronApi?.initialRenderComplete();
    });
  }, []);

  const navigate = Route.useNavigate();

  const createNewProject = async () => {
    await window.electronApi.requestNewProjectTargetDir();
    navigate({ to: "/new-project" });
  };

  return (
    <div className="flex flex-row h-screen w-screen">
      <div className="flex flex-col items-center justify-center gap-8 basis-3/5 bg-white [-webkit-app-region:_drag]">
        <CloseButton className="absolute top-3 start-3" />
        <div className="flex flex-col gap-2 items-center">
          <img src={icon} className="h-30 w-30" />
          <div className="flex flex-col items-center">
            <h1 className="text-4xl font-semibold">Ceramic Studio</h1>
            <div className="[-webkit-app-region:_no-drag] select-text! flex justify-center w-full">
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
          <div>
            <p>{project.name}</p>
            <p>{project.path}</p>
          </div>
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
  window.electronApi.closeWindow();
};

const recentProjectsQueryOptions = queryOptions<Map<string, string>>({
  queryKey: ["recent-projects"],
  queryFn: window.electronApi.getRecentProjects,
});

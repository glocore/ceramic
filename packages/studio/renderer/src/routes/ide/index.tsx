import { File } from "@ceramic/common";
import { RiSideBarLine } from "@remixicon/react";
import { queryOptions } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ImperativePanelHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import { Editor } from "./-components/Editor";
import { FileTree } from "./-components/FileTree";

export const Route = createFileRoute("/ide/")({
  component: RouteComponent,
  validateSearch: (
    search: Record<string, unknown>
  ): { projectPath: string } => ({ projectPath: search.projectPath as string }),

  loaderDeps: ({ search: { projectPath } }) => ({ projectPath }),

  loader({ context: { queryClient }, deps }) {
    return queryClient.ensureQueryData(
      projectFilesQueryOptions({ path: deps.projectPath })
    );
  },
});

function RouteComponent() {
  useEffect(() => {
    requestAnimationFrame(() => {
      window.electronApi?.initialRenderComplete();
    });
  }, []);

  const [selectedFile, setSelectedFile] = useState<File | undefined>();

  const navigatorPanelRef = useRef<ImperativePanelHandle>(null);
  const [isNavigatorCollapsed, setIsNavigatorCollapsed] = useState(false);

  function toggleNavigator() {
    const navigatorPanel = navigatorPanelRef.current;

    if (!navigatorPanel) {
      return;
    }

    if (isNavigatorCollapsed) {
      navigatorPanel.expand();
    } else {
      navigatorPanel.collapse();
    }

    setIsNavigatorCollapsed(navigatorPanel.isCollapsed());
  }

  const navigatorPanelMinSize = usePercentForPixels(220);

  return (
    <div className="h-screen [--title-bar-height:calc(var(--spacing)_*_10)] relative">
      <PanelGroup direction="horizontal" className="bg-neutral-200">
        <Panel
          ref={navigatorPanelRef}
          id="navigator"
          minSize={navigatorPanelMinSize}
          defaultSize={navigatorPanelMinSize}
          collapsible
          collapsedSize={0}
          onCollapse={() => setIsNavigatorCollapsed(true)}
          onExpand={() => setIsNavigatorCollapsed(false)}
          className="flex flex-col"
        >
          <div className="relative h-(--title-bar-height) border-b border-neutral-300">
            <div className="absolute inset-0 end-2 window-drag" />
          </div>
          <div className="overflow-auto flex-1">
            <FileTree onFileSelect={(file) => setSelectedFile(file)} />
          </div>
        </Panel>
        <PanelResizeHandle className="no-window-drag peer/handle" />
        <Panel
          id="editor"
          minSize={20}
          className="flex flex-col border-s-[0.5px] border-black/10 bg-clip-padding \
          transition-shadow shadow-[-2px_0_5px_-3px_rgba(0,0,0,0.1)] \
          peer-data-[resize-handle-state=hover]/handle:shadow-[-6px_0_10px_-6px_rgba(0,0,0,0.2)] \
          peer-data-[resize-handle-state=drag]/handle:shadow-[-8px_0_10px_-6px_rgba(0,0,0,0.2)]"
        >
          <div className="relative h-(--title-bar-height) border-b border-neutral-200 bg-white/50 shrink-0">
            <div className="absolute inset-0 start-2 window-drag" />
          </div>
          <div className="flex-1 bg-white min-h-0">
            <Editor filePath={selectedFile?.path} />
          </div>
        </Panel>
      </PanelGroup>

      <button
        className="px-1.25 rounded absolute start-25 top-1.75 \
        hover:bg-neutral-500/15 active:bg-neutral-500/30 \
        text-neutral-500/70 active:text-neutral-500"
        onClick={toggleNavigator}
        title={isNavigatorCollapsed ? "Show Navigator" : "Hide Navigator"}
        aria-label={isNavigatorCollapsed ? "Show Navigator" : "Hide Navigator"}
      >
        <RiSideBarLine />
      </button>
    </div>
  );
}

const projectFilesQueryOptions = (props: { path: string }) =>
  queryOptions<File[]>({
    queryKey: ["project-files", props.path],
    queryFn: async () => {
      return (
        (await window.electronApi?.getProjectFiles({
          path: props.path,
        })) ?? []
      );
    },
  });

function usePercentForPixels(px: number) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(function () {
    function listener() {
      setWindowWidth(window.innerWidth);
    }

    window.addEventListener("resize", listener);

    return function () {
      window.removeEventListener("resize", listener);
    };
  }, []);

  return (px * 100) / windowWidth;
}

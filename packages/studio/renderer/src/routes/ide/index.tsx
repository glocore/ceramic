import { File } from "@ceramic/common";
import { RiCloseLine, RiSideBarLine } from "@remixicon/react";
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
import { useTabStore } from "./-components/Tabs";

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

  const {
    tabs,
    activeTabIndex,
    previewTabIndex,
    setActiveTab,
    addTab,
    previewTab,
    removeTab,
  } = useTabStore();

  const handleFileSelect = (file: File) => {
    previewTab(file.path);
  };

  const handleFileOpen = (file: File) => {
    addTab(file.path);
  };

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

  const editorFilePath: string | undefined = tabs[activeTabIndex];

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
            <FileTree
              onFileSelect={(file) => handleFileSelect(file)}
              onFileOpen={(file) => handleFileOpen(file)}
            />
          </div>
        </Panel>
        <PanelResizeHandle className="no-window-drag peer/handle" />
        <Panel
          id="editor"
          minSize={20}
          className="flex flex-col border-s-[0.5px] bg-white border-black/10 bg-clip-padding \
          transition-shadow shadow-[-2px_0_5px_-3px_rgba(0,0,0,0.1)] \
          peer-data-[resize-handle-state=hover]/handle:shadow-[-6px_0_10px_-6px_rgba(0,0,0,0.2)] \
          peer-data-[resize-handle-state=drag]/handle:shadow-[-8px_0_10px_-6px_rgba(0,0,0,0.2)]"
        >
          <div className="relative h-(--title-bar-height) border-b border-neutral-200 bg-white/50 shrink-0">
            <div className="absolute inset-0 start-2 window-drag" />
          </div>
          <div className="flex divide-x divide-neutral-300">
            {tabs.map((tab, index) => (
              <div
                key={tab}
                onClick={() => setActiveTab(tab)}
                onDoubleClick={() => addTab(tab)}
                className={`group/tab px-2 flex items-center gap-1 ${index === activeTabIndex ? "text-emerald-700 bg-emerald-100" : "text-neutral-500"} ${index === previewTabIndex ? "italic" : ""}`}
              >
                <button
                  onClick={() => removeTab(tab)}
                  className="text-neutral-500 group-hover/tab:visible hover:bg-neutral-700/10 rounded-xs"
                >
                  <RiCloseLine className="w-4 h-4" />
                </button>
                <span>{tab.split("/").at(-1)}</span>
              </div>
            ))}
          </div>
          <div className="flex-1 min-h-0">
            {editorFilePath && <Editor filePath={editorFilePath} />}
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

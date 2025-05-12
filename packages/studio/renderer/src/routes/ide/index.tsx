import { queryOptions } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Editor } from "./-components/Editor";
import { FileTree } from "./-components/FileTree";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { File } from "src/types";
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

  const { projectPath } = Route.useSearch();

  const [selectedFile, setSelectedFile] = useState<File | undefined>();

  return (
    <div className="h-screen">
      <PanelGroup direction="horizontal">
        <Panel id="fileTree" minSize={10} defaultSize={20}>
          <div className="bg-neutral-200 h-full overflow-auto">
            <FileTree
              rootPath={projectPath}
              onFileSelect={(file) => setSelectedFile(file)}
            />
          </div>
        </Panel>
        <PanelResizeHandle />
        <Panel id="editor" minSize={20}>
          <Editor filePath={selectedFile?.path} />
        </Panel>
      </PanelGroup>
    </div>
  );
}

const projectFilesQueryOptions = (props: { path: string }) =>
  queryOptions<File[]>({
    queryKey: ["project-files"],
    queryFn: async () => {
      return (
        (await window.electronApi?.getProjectFiles({
          projectPath: props.path,
        })) ?? []
      );
    },
  });

import { RiArrowRightSLine } from "@remixicon/react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Button,
  Collection,
  Tree,
  TreeItem,
  TreeItemContent,
} from "react-aria-components";
import { Editor } from "./-components/Editor";

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

  const { data: projectFiles } = useSuspenseQuery(
    projectFilesQueryOptions({ path: projectPath })
  );

  const [selectedFile, setSelectedFile] = useState<string | undefined>();

  return (
    <div className="flex">
      <Tree
        items={projectFiles}
        aria-label="File tree"
        className="w-60 h-screen overflow-auto"
      >
        {function renderItem({ id, name, children }) {
          return (
            <TreeItem textValue={name} className="group">
              <TreeItemContent>
                {({ hasChildItems }) => (
                  <div
                    className="flex items-center space-x-2 py-2 ps-[calc(calc(var(--tree-item-level)_-_1)_*_calc(var(--spacing)_*_3))]"
                    onClick={() => {
                      if (hasChildItems) {
                        return;
                      }

                      setSelectedFile(id);
                    }}
                  >
                    {hasChildItems ? (
                      <Button
                        slot="chevron"
                        className="shrink-0 w-8 h-8 group-data-[expanded=true]:rotate-90 transition-rotate duration-200 inline-flex items-center justify-center bg-transparent border-0 me-0 cursor-default outline-hidden"
                      >
                        <RiArrowRightSLine />
                      </Button>
                    ) : (
                      <div className="shrink-0 w-8 h-8" />
                    )}
                    <span>{name}</span>
                  </div>
                )}
              </TreeItemContent>
              <Collection items={children}>{renderItem}</Collection>
            </TreeItem>
          );
        }}
      </Tree>
      <Editor className="flex-1 h-screen" filePath={selectedFile} />
    </div>
  );
}

type Folder = { id: string; name: string; children?: Folder }[];

const projectFilesQueryOptions = (props: { path: string }) =>
  queryOptions<Folder>({
    queryKey: ["project-files"],
    queryFn: async () => {
      return (
        (await window.electronApi?.getProjectFiles({
          projectPath: props.path,
        })) ?? []
      );
    },
  });

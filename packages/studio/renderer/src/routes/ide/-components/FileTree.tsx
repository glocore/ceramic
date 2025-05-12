import { File, invariant } from "@ceramic/common";
import {
  RiArrowRightSLine,
  RiFolder2Fill,
  RiFolder2Line,
} from "@remixicon/react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FileIcon } from "./FileIcon";

export function FileTree(props: {
  rootPath: string;
  onFileSelect?: (file: File) => void;
}) {
  const { data: projectFiles } = useSuspenseQuery(
    projectFilesQueryOptions({ path: props.rootPath })
  );

  return (
    <div
      onClick={(e) => {
        const target = e.target as EventTarget & HTMLDivElement;
        const isTargetFile = target.getAttribute("data-is-file");

        if (isTargetFile) {
          const targetFile = JSON.parse(
            target.getAttribute("data-file") ?? "{}"
          );
          props.onFileSelect?.(targetFile as File);
        }
      }}
      className="p-2 [--item-height:calc(6.5_*_0.25rem)]"
    >
      <FolderItem name="root" files={projectFiles} defaultExpanded />
    </div>
  );
}

function FileItem(props: { file: File }) {
  const { isDirectory } = props.file;

  invariant(
    !isDirectory,
    `Expected file not to be a directory, received: ${props.file}`
  );

  return (
    <div
      data-is-file={true}
      data-file={JSON.stringify(props.file)}
      className="text-sm h-(--item-height) flex items-center gap-x-2 text-nowrap"
    >
      <div className="shrink-0 ps-0.5">
        <FileIcon file={props.file} />
      </div>
      {props.file.name}
    </div>
  );
}

function FolderItem(props: {
  name: string;
  files: File[];
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(props.defaultExpanded ?? false);

  function toggleExpanded() {
    setExpanded((e) => !e);
  }

  return (
    <div className="flex flex-col">
      <div
        data-expanded={expanded}
        className="group flex items-center gap-x-2 h-(--item-height)"
        onDoubleClick={toggleExpanded}
      >
        <div className="flex items-center gap-x-0.5">
          <RiArrowRightSLine
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              toggleExpanded();
            }}
            className="shrink-0 w-4 group-data-[expanded=true]:rotate-90 transition-transform duration-200"
          />
          {props.files.length > 0 ? (
            <RiFolder2Fill className="w-4 shrink-0 fill-sky-400" />
          ) : (
            <RiFolder2Line className="w-4 shrink-0 fill-sky-400" />
          )}
        </div>
        <div className="shrink-0 text-sm">{props.name}</div>
      </div>

      {expanded && (
        <div className={`flex flex-col`}>
          {props.files
            .sort((a, b) => {
              // Folders come before files
              if (a.isDirectory && !b.isDirectory) return -1;
              if (!a.isDirectory && b.isDirectory) return 1;

              // If both are folders or both are files, sort alphabetically (case-insensitive)
              return a.name.localeCompare(b.name, undefined, {
                sensitivity: "base",
              });
            })
            .map((file) => (
              <div
                key={file.path}
                title={file.path}
                className={`${file.isDirectory ? "ms-4" : "ms-8"}`}
              >
                {file.isDirectory ? (
                  <FolderItem
                    key={file.path}
                    name={file.name}
                    files={file.children}
                  />
                ) : (
                  <FileItem key={file.path} file={file} />
                )}
              </div>
            ))}
        </div>
      )}
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
        })) ?? ([] as File[])
      );
    },
  });

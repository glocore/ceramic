import { File, invariant } from "@ceramic/common";
import {
  RiArrowRightSLine,
  RiFolder2Fill,
  RiFolder2Line,
} from "@remixicon/react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { create } from "zustand";
import { Route } from "..";
import { FileIcon } from "./FileIcon";

export function FileTree(props: { onFileSelect?: (file: File) => void }) {
  const { projectPath } = Route.useSearch();
  const projectName = projectPath.split("/").pop()!;

  const { data: projectFiles } = useSuspenseQuery(
    projectFilesQueryOptions({ path: projectPath })
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
      className="p-2 text-neutral-700 text-sm [--item-height:calc(6.5_*_0.25rem)]"
      style={
        {
          "--level-offset": "calc(var(--spacing) * 4)",
        } as React.CSSProperties
      }
    >
      <FolderItem
        path={projectPath}
        name={projectName}
        files={projectFiles}
        defaultExpanded
      />
    </div>
  );
}

function FileItem(props: { file: File }) {
  const { isDirectory } = props.file;

  invariant(
    !isDirectory,
    `Expected file not to be a directory, received: ${props.file}`
  );

  const isSelected = useFileTreeStore((state) =>
    state.selectedFiles.has(props.file.path)
  );
  const setSelected = useFileTreeStore((state) => state.setSelectedFile);

  return (
    <div
      data-is-file={true}
      data-file={JSON.stringify(props.file)}
      data-is-selected={isSelected}
      className="rounded h-(--item-height) flex items-center gap-x-2 \
      pe-2 ps-[calc(calc(var(--level,_0)_*_var(--level-offset)))] \
      data-[is-selected=true]:bg-emerald-500 data-[is-selected=true]:text-white"
      onClick={() => setSelected(props.file.path)}
    >
      <span
        data-file={JSON.stringify(props.file)}
        data-is-file={true}
        className="shrink-0 ps-0.5"
      >
        <FileIcon file={props.file} />
      </span>
      <span
        data-file={JSON.stringify(props.file)}
        data-is-file={true}
        className="text-nowrap overflow-hidden text-ellipsis min-w-0"
      >
        {props.file.name}
      </span>
    </div>
  );
}

function FolderItem(props: {
  name: string;
  path: string;
  files: File[];
  defaultExpanded?: boolean;
  level?: number;
}) {
  const level = props.level ?? 0;

  const [expanded, setExpanded] = useState(props.defaultExpanded ?? false);

  function toggleExpanded() {
    setExpanded((e) => !e);
  }

  const isSelected = useFileTreeStore((state) =>
    state.selectedFiles.has(props.path)
  );
  const setSelected = useFileTreeStore((state) => state.setSelectedFile);

  return (
    <div className="flex flex-col">
      <div
        data-expanded={expanded}
        data-selected={isSelected}
        className="group rounded flex items-center gap-x-2 h-(--item-height) min-w-0 overflow-hidden \
        pe-2 ps-[calc(var(--level,_0)_*_var(--level-offset))] \
        fill-neutral-500 data-[selected=true]:fill-white \
        text-neutral-700 data-[selected=true]:text-white \
        bg-transparent data-[selected=true]:bg-emerald-500"
        onClick={() => {
          setSelected(props.path);
        }}
        onDoubleClick={() => {
          setSelected(props.path);
          toggleExpanded();
        }}
      >
        <div className="flex items-center gap-x-0.5 shrink-0 min-w-0 overflow-hidden">
          <RiArrowRightSLine
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              toggleExpanded();
            }}
            onDoubleClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            className="shrink-0 w-4 group-data-[expanded=true]:rotate-90 transition-transform duration-200 fill-inherit"
          />
          {props.files.length > 0 ? (
            <RiFolder2Fill className="w-4 shrink-0 fill-inherit" />
          ) : (
            <RiFolder2Line className="w-4 shrink-0 fill-inherit" />
          )}
        </div>
        <span className="text-inherit overflow-hidden text-ellipsis min-w-0 text-nowrap">
          {props.name}
        </span>
      </div>

      {expanded && (
        <div
          className="flex flex-col"
          style={
            {
              "--level": level + 1,
              "--file-offset": `${props.files.find((file) => file.isDirectory) ? "calc(1 * var(--level-offset))" : "0"}`,
            } as React.CSSProperties
          }
        >
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
              <div key={file.path} title={file.path}>
                {file.isDirectory ? (
                  <FolderItem
                    key={file.path}
                    path={file.path}
                    name={file.name}
                    files={file.children}
                    level={level + 1}
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
          path: props.path,
        })) ?? ([] as File[])
      );
    },
  });

type FileTreeState = {
  selectedFiles: Set<string>;
  addSelectedFile: (file: string) => void;
  setSelectedFile: (file: string) => void;
};

const useFileTreeStore = create<FileTreeState>()((set) => {
  return {
    selectedFiles: new Set(),
    addSelectedFile: (file) =>
      set((state) => ({ selectedFiles: state.selectedFiles.add(file) })),
    setSelectedFile: (file) => set(() => ({ selectedFiles: new Set([file]) })),
  };
});
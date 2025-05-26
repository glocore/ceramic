import { File } from "@ceramic/common";
import { RiFileList2Line } from "@remixicon/react";
import { FileIconId } from "src/types";
import "./fileicons/font/fileicons.css";

export function FileIcon(props: { file: File; className?: string }) {
  const fileIconId = getFileIconIdForFile({ file: props.file });

  switch (fileIconId) {
    case "css":
    case "git":
    case "html":
    case "javascript":
    case "json":
    case "markdown":
    case "react":
    case "svg":
    case "tsconfig":
    case "typescript":
    case "vite":
      return <Icon icon={fileIconId} className={props.className} />;
    case "text":
      return <DefaultFileIcon className={props.className} />;

    default: {
      function exhaustivenessCheck(value: never) {
        console.error(`No file icon found for ID: ${value}`);
        return <DefaultFileIcon />;
      }

      return exhaustivenessCheck(fileIconId);
    }
  }
}

function DefaultFileIcon({
  className,
  ...delegated
}: React.ComponentProps<typeof RiFileList2Line>) {
  return (
    <RiFileList2Line
      className={`w-4 text-neutral-500 group-data-[selected=true]/file-item:text-inherit ${className}`}
      {...delegated}
    />
  );
}

function Icon({
  icon,
  className,
  style,
  ...delegated
}: React.ComponentProps<"i"> & { icon: FileIconId }) {
  return (
    <i
      className={`text-(--color) group-data-[selected=true]/file-item:text-inherit fileicons-${icon} ${className}`}
      style={
        {
          "--color": defaultColor[icon],
          ...style,
        } as React.CSSProperties
      }
      {...delegated}
    />
  );
}

const defaultColor = {
  css: "#529BBA",
  git: "#F34F29",
  html: "#EF7623",
  javascript: "#FBC02D",
  json: "#E44D26",
  markdown: "#529BBA",
  react: "#4F8FAA",
  text: "#737373",
  tsconfig: "#3178C6",
  typescript: "#007ACC",
  vite: "#FBC02D",
  svg: "#9068B0",
} satisfies Record<FileIconId, `#${string}`>;

function getFileIconIdForFile({ file }: { file: File }): FileIconId {
  function endsWith(searchString: string) {
    return file.name.endsWith(searchString) ? file : false;
  }

  function matches(string: string) {
    return file.name === string ? file : false;
  }

  switch (file) {
    case matches(".gitignore"):
      return "git";

    case endsWith("vite.config.js"):
    case endsWith("vite.config.mjs"):
    case endsWith("vite.config.cjs"):
    case endsWith("vite.config.ts"):
    case endsWith("vite.config.mts"):
    case endsWith("vite.config.cts"):
      return "vite";

    case endsWith(".md"):
      return "markdown";

    case matches("tsconfig.json"):
      return "tsconfig";

    case endsWith(".html"):
      return "html";

    case endsWith(".css"):
      return "css";

    case endsWith(".js"):
    case endsWith(".mjs"):
    case endsWith(".cjs"):
      return "javascript";

    case endsWith(".ts"):
    case endsWith(".mts"):
    case endsWith(".cts"):
      return "typescript";

    case endsWith(".jsx"):
    case endsWith(".mjsx"):
    case endsWith(".cjsx"):
    case endsWith(".tsx"):
    case endsWith(".mtsx"):
    case endsWith(".ctsx"):
      return "react";

    case endsWith(".json"):
      return "json";

    default:
      return "text";
  }
}

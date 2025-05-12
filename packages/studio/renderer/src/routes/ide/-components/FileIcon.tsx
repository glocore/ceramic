import { File } from "@ceramic/common";
import { RiFileList2Line } from "@remixicon/react";
import { FileIconId } from "src/types";
import cssIcon from "/icons/css.svg";
import gitIgnoreIcon from "/icons/git_ignore.svg";
import htmlIcon from "/icons/html.svg";
import reactIcon from "/icons/react.svg";
import typescriptIcon from "/icons/typescript.svg";
import javascriptIcon from "/icons/javascript.svg";
import jsonIcon from "/icons/json.svg";
import tsconfigIcon from "/icons/tsconfig.svg";
import viteIcon from "/icons/vite.svg";
import markdownIcon from "/icons/markdown.svg";
import { cn } from "src/utils";

export function FileIcon(props: { file: File }) {
  const fileIconId = getFileIconIdForFile({ file: props.file });

  switch (fileIconId) {
    case "css":
      return <SvgIcon src={cssIcon} />;
    case "git_ignore":
      return <SvgIcon src={gitIgnoreIcon} />;
    case "html":
      return <SvgIcon src={htmlIcon} />;
    case "javascript":
      return <SvgIcon src={javascriptIcon} />;
    case "json":
      return <SvgIcon src={jsonIcon} />;
    case "markdown":
      return <SvgIcon src={markdownIcon} />;
    case "react":
      return <SvgIcon src={reactIcon} />;
    case "tsconfig":
      return <SvgIcon src={tsconfigIcon} />;
    case "typescript":
      return <SvgIcon src={typescriptIcon} />;
    case "vite":
      return <SvgIcon src={viteIcon} />;
    case "text":
      return <RiFileList2Line className="w-4 fill-neutral-500" />;

    default: {
      function exhaustivenessCheck(value: never) {
        console.error(`No file icon found for ID: ${value}`);
        return <RiFileList2Line className="w-4 fill-neutral-500" />;
      }

      return exhaustivenessCheck(fileIconId);
    }
  }
}

function SvgIcon({ className, ...delegated }: React.ComponentProps<"img">) {
  return (
    <div className="-ms-2 mt-0.25 translate-x-1">
      <img className={cn("w-6", className)} {...delegated} />
    </div>
  );
}

function getFileIconIdForFile({ file }: { file: File }): FileIconId {
  function endsWith(searchString: string) {
    return file.name.endsWith(searchString) ? file : false;
  }

  function matches(string: string) {
    return file.name === string ? file : false;
  }

  switch (file) {
    case matches(".gitignore"):
      return "git_ignore";

    case endsWith("vite.config.js"):
    case endsWith("vite.config.mjs"):
    case endsWith("vite.config.cjs"):
    case endsWith("vite.config.ts"):
    case endsWith("vite.config.mts"):
    case endsWith("vite.config.cts"):
      return "vite";

    case endsWith(".md"):
      return "markdown";

    case endsWith("tsconfig.json"):
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

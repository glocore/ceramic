#!/usr/bin/env -S pnpx tsx

import * as prompts from "@clack/prompts";
import mri from "mri";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const argv = mri(process.argv.slice(2));

const argTargetDir = argv._[0] ? formatTargetDir(String(argv._[0])) : undefined;

async function init() {
  const cancel = () => {
    prompts.cancel("Operation cancelled.");
    process.exit(0);
  };

  prompts.intro(`create-ceramic-app`);

  let targetDir = argTargetDir;

  if (!targetDir) {
    const projectName = await prompts.text({
      message: "Project name:",
      placeholder: "my-ceramic-app",
      defaultValue: "my-ceramic-app",
      validate(dir) {
        if (!dir) return;
        
        if (!isValidProjectName(dir)) {
          return "Invalid project name";
        }
      },
    });

    if (prompts.isCancel(projectName)) cancel();

    targetDir = formatTargetDir(projectName as string);
  }

  if (fs.existsSync(targetDir) && !isEmpty(targetDir)) {
    const overwrite = await prompts.select({
      message:
        (targetDir === "."
          ? "Current directory"
          : `Target directory "${targetDir}"`) +
        ` is not empty. Please choose how to proceed:`,
      options: [
        {
          label: "Cancel operation",
          value: "no",
        },
        {
          label: "Remove existing files and continue",
          value: "yes",
        },
      ],
    });

    if (prompts.isCancel(overwrite)) cancel();

    switch (overwrite) {
      case "yes":
        emptyDir(targetDir);
        break;
      default:
        cancel();
    }
  }

  const projectName = toValidProjectName(
    path.basename(path.resolve(targetDir))
  );

  const root = path.join(process.cwd(), targetDir);

  fs.mkdirSync(root, { recursive: true });

  prompts.log.step(`Scaffolding project in ${root}...`);

  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    "../..",
    `template`
  );

  const files = fs.readdirSync(templateDir);

  const renameFiles: Record<string, string | undefined> = {
    _gitignore: ".gitignore",
    _prettierignore: ".prettierignore",
    _vscode: ".vscode",
  };

  const write = (file: string, content?: string) => {
    const targetPath = path.join(root, renameFiles[file] ?? file);
    if (content) {
      fs.writeFileSync(targetPath, content, "utf-8");
    } else {
      copy(path.join(templateDir, file), targetPath);
    }
  };

  for (const file of files.filter(
    (f) => !["package.json", "README.md"].includes(f)
  )) {
    write(file);
  }

  const pkg = JSON.parse(
    fs.readFileSync(path.join(templateDir, `package.json`), "utf-8")
  );

  pkg.name = projectName;
  write("package.json", JSON.stringify(pkg, null, 2) + "\n");

  let readme = fs.readFileSync(path.join(templateDir, `README.md`), "utf-8");

  readme = readme.replace("my-ceramic-app", projectName);

  write("README.md", readme);

  prompts.outro(
    `Ceramic app created at ${path.basename(path.resolve(targetDir))}`
  );
}

function copy(src: string, dest: string) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    fs.copyFileSync(src, dest);
  }
}

function copyDir(srcDir: string, destDir: string) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);
    copy(srcFile, destFile);
  }
}

function formatTargetDir(targetDir: string) {
  return targetDir.trim().replace(/\/+$/g, "");
}

function isEmpty(path: string) {
  const files = fs.readdirSync(path);
  return files.length === 0 || (files.length === 1 && files[0] === ".git");
}

function emptyDir(dir: string) {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const file of fs.readdirSync(dir)) {
    if (file === ".git") {
      continue;
    }
    fs.rmSync(path.resolve(dir, file), { recursive: true, force: true });
  }
}

function isValidProjectName(projectName: string) {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(
    projectName
  );
}

function toValidProjectName(projectName: string) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^[._]/, "")
    .replace(/[^a-z\d\-~]+/g, "-");
}

init().catch(console.error);

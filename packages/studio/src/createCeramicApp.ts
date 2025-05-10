import fs from "node:fs";
import path from "node:path";

export const createCeramicApp = (props: {
  targetDir: string;
  projectName: string;
  projectIdentifier: string;
}) => {
  const targetDir = props.targetDir;

  const root = path.join(targetDir, props.projectIdentifier);

  fs.mkdirSync(root, { recursive: true });

  const templateDir = path.resolve("..", "create-ceramic-app", `template`);

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

  pkg.name = props.projectIdentifier;
  write("package.json", JSON.stringify(pkg, null, 2) + "\n");

  let readme = fs.readFileSync(path.join(templateDir, `README.md`), "utf-8");

  readme = readme.replace("my-ceramic-app", props.projectName);

  write("README.md", readme);

  return root;
};

export function isValidProjectName(projectName: string) {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(
    projectName
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

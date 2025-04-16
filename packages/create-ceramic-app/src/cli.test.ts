import runTest, { DOWN, ENTER } from "cli-prompts-test";
import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe.sequential("cli", () => {
  const testRoot = path.join(__dirname, "temp");

  beforeEach(() => {
    fs.mkdirSync(testRoot, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(testRoot, { recursive: true, force: true });
  });

  describe("no project name supplied", () => {
    test("scaffolds project without input", async () => {
      const { exitCode, stdout } = await runTest(
        [path.join(__dirname, "cli.ts")],
        [ENTER],
        { testPath: testRoot }
      );
      expect(exitCode).toBe(0);
      expect(stdout).toContain("Ceramic app created at my-ceramic-app");
    });

    test("scaffolds project with project name as argument", async () => {
      const projectName = "test-app";

      const { exitCode, stdout } = await runTest(
        [path.join(__dirname, "cli.ts")],
        [`${projectName}${ENTER}`],
        { testPath: testRoot }
      );
      expect(exitCode).toBe(0);
      expect(stdout).toContain(`Ceramic app created at ${projectName}`);
    });
  });

  describe("with project name supplied", () => {
    test("scaffolds project with project name", async () => {
      const projectName = "test-app";

      const { exitCode, stdout } = await runTest(
        [path.join(__dirname, "cli.ts"), projectName],
        [ENTER],
        { testPath: testRoot }
      );
      expect(exitCode).toBe(0);
      expect(stdout).toContain(`Ceramic app created at ${projectName}`);
    });

    test("scaffolds project without current directory name", async () => {
      const { exitCode, stdout } = await runTest(
        [path.join(__dirname, "cli.ts"), "."],
        [ENTER],
        { testPath: testRoot }
      );
      expect(exitCode).toBe(0);
      expect(stdout).toContain("Ceramic app created at temp");
    });
  });

  describe("non-empty directory", () => {
    const createTestFile = (destination?: string) => {
      const fileName = "test.txt";
      fs.writeFileSync(
        path.join(destination ?? "./", fileName),
        "test",
        "utf-8"
      );
      return fileName;
    };

    test("cancels operation", async () => {
      createTestFile(testRoot);

      const { exitCode, stdout } = await runTest(
        [path.join(__dirname, "cli.ts"), "."],
        [ENTER],
        { testPath: testRoot }
      );

      expect(exitCode).toBe(0);
      expect(stdout).toContain("Operation cancelled.");
    });

    test("removes existing files and continues", async () => {
      const testFileName = createTestFile(testRoot);

      const { exitCode, stdout } = await runTest(
        [path.join(__dirname, "cli.ts"), "."],
        [DOWN, ENTER],
        { testPath: testRoot }
      );

      expect(exitCode).toBe(0);
      expect(stdout).toContain("Ceramic app created at temp");
      expect(fs.readdirSync(testRoot)).not.toContain(testFileName);
    });
  });

  test("generates expected files", async () => {
    const { exitCode } = await runTest(
      [path.join(__dirname, "cli.ts"), "."],
      [ENTER],
      { testPath: testRoot }
    );

    expect(exitCode).toBe(0);

    const files = (
      fs.readdirSync(testRoot, { recursive: true }) as string[]
    ).filter((filePath) =>
      fs.lstatSync(path.join(testRoot, filePath)).isFile()
    );

    expect(files).toMatchSnapshot();

    for (const filePath of files) {
      const fileContents = fs
        .readFileSync(path.join(testRoot, filePath), "utf-8")
        .toString();

      await expect(fileContents).toMatchFileSnapshot(
        `./__snapshots__/tempate/${filePath}.snap`
      );
    }
  });

  test("adds the project name in the relevant places", async () => {
    const projectName = "test-app";

    const { exitCode } = await runTest(
      [path.join(__dirname, "cli.ts"), projectName],
      [ENTER],
      { testPath: testRoot }
    );

    expect(exitCode).toBe(0);

    expect(
      fs
        .readFileSync(path.join(testRoot, projectName, "README.md"), "utf-8")
        .toString()
    ).toContain(projectName);

    const pkg = JSON.parse(
      fs
        .readFileSync(path.join(testRoot, projectName, "package.json"), "utf-8")
        .toString()
    );

    expect(pkg.name).toEqual(projectName);
  });
});

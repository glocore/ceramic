import { File } from "@ceramic/common";
import fs from "node:fs/promises";
import path from "node:path";

export const getFiles = async (props: { path: string }) => {
  const walk = async (filePath: string): Promise<File[]> => {
    const contents = await fs.readdir(filePath);

    return Promise.all(
      contents.map(async (item) => {
        const absolute = path.join(filePath, item);
        const isDirectory = (await fs.stat(absolute)).isDirectory();

        if (isDirectory) {
          return {
            path: absolute,
            name: item,
            isDirectory: true,
            children: await walk(absolute),
          } satisfies File;
        }

        return {
          path: absolute,
          name: item,
          isDirectory: false,
        } satisfies File;
      })
    );
  };

  return walk(props.path);
};

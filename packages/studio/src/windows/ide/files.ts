import fs from "node:fs/promises";
import path from "node:path";

export const getFiles = async (props: { path: string }) => {
  type Folder = { id: string; name: string; children?: Folder[] } | Folder[];

  const walk = async (filePath: string): Promise<Folder[]> => {
    const contents = await fs.readdir(filePath);

    return Promise.all(
      contents.map(async (item) => {
        const absolute = path.join(filePath, item);
        const isDirectory = (await fs.stat(absolute)).isDirectory();

        return {
          id: absolute,
          name: item,
          children: isDirectory ? await walk(absolute) : undefined,
        };
      })
    );
  };

  return walk(props.path);
};

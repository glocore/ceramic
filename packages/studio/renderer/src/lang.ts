import { Lang } from "./types";

export const langForFile = (filePath: string): Lang => {
  const fileName = filePath.split("/").at(-1);

  switch (fileName) {
    default:
      return filePath?.split(".").at(-1) as Lang;
  }
};

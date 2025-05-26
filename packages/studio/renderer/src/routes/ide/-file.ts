import { File } from "@ceramic/common"

export const getFileForPath = (path: string) => {
  return { 
    path, 
    name: path.split('/').at(-1), 
    isDirectory: false 
  } as File
}
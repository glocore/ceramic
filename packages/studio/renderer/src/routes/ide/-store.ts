import { File } from "@ceramic/common";
import { create } from "zustand";

interface SelectedFileState {
  selectedFile?: File;
  setSelectedFile: (file: File) => void
}

export const useSelectedFileStore = create<SelectedFileState>()(set => {
  return {
    setSelectedFile(file) {
      return set({ selectedFile: file })
    },
  }
})
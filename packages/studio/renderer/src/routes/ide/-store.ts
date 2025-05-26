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

interface TabsState {
  tabs: string[];
  previewTabIndex: number;
  activeTabIndex: number;
  setActiveTab: (tab: string) => void;
  addTab: (tab: string) => void;
  previewTab: (tab: string) => void;
  removeTab: (tab: string) => void;
}

export const useTabStore = create<TabsState>()((set) => ({
  tabs: [],
  previewTabIndex: -1,
  activeTabIndex: -1,
  setActiveTab(tab) {
    return set((state) => {
      const tabIndex = state.tabs.indexOf(tab);

      if (tabIndex > -1) {
        return { activeTabIndex: tabIndex };
      }

      return {};
    });
  },
  addTab(tab) {
    return set((state) => {
      /** there is already a preview tab open for the incoming tab */
      if (state.tabs[state.previewTabIndex] === tab) {
        return { activeTabIndex: state.previewTabIndex, previewTabIndex: -1 };
      }

      /** the incoming tab is the same as the currently active tab */
      if (state.tabs[state.activeTabIndex] === tab) {
        return {};
      }

      const indexOfTab = state.tabs.indexOf(tab);
      /** there's already an open tab for the incoming tab */
      if (indexOfTab > -1) {
        return { activeTabIndex: indexOfTab };
      }

      /** there's neither a preview nor an open tab for the incoming tab */
      const tabs = structuredClone(state.tabs);
      tabs.splice(state.activeTabIndex, 0, tab);
      const tabIndex = tabs.indexOf(tab) + 1;

      return { tabs, activeTabIndex: tabIndex };
    });
  },
  previewTab(tab) {
    return set((state) => {
      /** there's already a preview tab open for the incoming tab */
      if (state.tabs[state.previewTabIndex] === tab) {
        return { activeTabIndex: state.previewTabIndex };
      }

      /** there's already an open tab for the incoming tab */
      if (state.tabs.includes(tab)) {
        return { activeTabIndex: state.tabs.indexOf(tab) };
      }

      /** there's already a preview tab that is different from the incoming tab */
      if (state.previewTabIndex > -1) {
        const tabs = structuredClone(state.tabs);
        tabs.splice(state.previewTabIndex, 1, tab);
        const tabIndex = tabs.indexOf(tab);
        return { tabs, activeTabIndex: tabIndex, previewTabIndex: tabIndex };
      }

      /** there are no preview tabs */
      const tabs = structuredClone(state.tabs);
      tabs.splice(state.activeTabIndex + 1, 0, tab);
      const tabIndex = tabs.indexOf(tab);

      return { tabs, activeTabIndex: tabIndex, previewTabIndex: tabIndex };
    });
  },
  removeTab(tab) {
    return set((state) => {
      const getNewActiveTabIndex = (tabs: typeof state.tabs) => {
        if (state.activeTabIndex - 1 === -1) {
          return tabs.length - 1;
        }

        return state.activeTabIndex - 1;
      };

      /** incoming tab is a preview tab */
      if (state.tabs[state.previewTabIndex] === tab) {
        const tabs = structuredClone(state.tabs);
        tabs.splice(state.previewTabIndex, 1);

        /** incoming tab is the same as the currently active tab */
        if (state.tabs[state.activeTabIndex] === tab) {
          return {
            tabs,
            previewTabIndex: -1,
            activeTabIndex: getNewActiveTabIndex(tabs),
          };
        }

        return { tabs, previewTabIndex: -1 };
      }

      /** incoming tab is the same as the currently active tab */
      if (state.tabs[state.activeTabIndex] === tab) {
        const tabs = structuredClone(state.tabs);
        tabs.splice(state.activeTabIndex, 1);
        return { tabs, activeTabIndex: getNewActiveTabIndex(tabs) };
      }

      /** the incoming tab is neither an active nor a preview tab */
      const tabs = structuredClone(state.tabs);
      tabs.splice(tabs.indexOf(tab), 1);
      const activeTab = state.tabs[state.activeTabIndex];
      const previewTab = state.tabs[state.previewTabIndex];
      return {
        tabs,
        activeTabIndex: tabs.indexOf(activeTab),
        previewTabIndex: tabs.indexOf(previewTab),
      };
    });
  },
}));

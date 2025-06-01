import { useEffect } from "react";
import { useSelectedFileStore, useTabStore } from "../-store";
import { RiCloseLine } from "@remixicon/react";
import "./Tabs.css";
import { getFileForPath } from "../-file";
import { FileIcon } from "./FileIcon";

export const Tabs = () => {
  const {
    tabs,
    activeTabIndex,
    previewTabIndex,
    setActiveTab,
    addTab,
    removeTab,
  } = useTabStore();

  useEffect(() => {
    const unsubscribe = useTabStore.subscribe(({ activeTabIndex, tabs }) => {
      useSelectedFileStore
        .getState()
        .setSelectedFile(getFileForPath(tabs[activeTabIndex]));
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex *:border-s *:last:border-e overflow-x-auto">
      {tabs.map((tab, index) => (
        <div
          key={tab}
          onClick={() => setActiveTab(tab)}
          onDoubleClick={() => addTab(tab)}
          data-active={index === activeTabIndex}
          data-preview={index === previewTabIndex}
          className="group/tab ps-1.5 pe-5.5 flex items-center gap-1 border-neutral-200 \
          text-neutral-500 data-[active=true]:text-emerald-700 \
          data-[active=true]:bg-emerald-100 \
            data-[preview=true]:italic"
        >
          <button
            onClick={() => removeTab(tab)}
            className="invisible group-hover/tab:visible rounded-xs \
            hover:bg-neutral-600/10 group-data-[active=true]/tab:hover:bg-emerald-500/20 \
            text-neutral-500 group-data-[active=true]/tab:text-emerald-700"
          >
            <RiCloseLine className="w-4 h-4" />
          </button>
          <FileIcon
            file={getFileForPath(tab)}
            className="me-1 -mb-0.25 text-[0.8rem]!"
          />
          <span>{tab.split("/").at(-1)}</span>
        </div>
      ))}
    </div>
  );
};

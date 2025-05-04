import Store from "electron-store";

export const store = new Store<{ recents: string[] }>({
  schema: {
    recents: {
      type: "array",
    },
  },
});

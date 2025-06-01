import Dexie, { type EntityTable } from "dexie";

interface RecentProject {
  path: string;
  name: string;
}

const db = new Dexie("database") as Dexie & {
  recentProjects: EntityTable<RecentProject, "path">;
};

db.version(1).stores({
  recentProjects: "++path, name",
});

export type { RecentProject };
export { db };

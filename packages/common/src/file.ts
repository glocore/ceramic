export type File =
  // file
  | { path: string; name: string; isDirectory: false }
  // folder
  | { path: string; name: string; isDirectory: true; children: File[] };

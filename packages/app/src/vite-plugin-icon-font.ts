import path from "node:path";
import svgtofont from "svgtofont";
import { type Plugin } from "vite";

export function iconFontPlugin(options?: {
  /**
   * List of directories where SVG icons are located. The output font will be generated in the same directory.
   */
  paths: string[];
}) {
  function generateIconFont() {
    return Promise.all(
      options?.paths.map((directory) => {
        const fontName = path.basename(directory);

        svgtofont({
          src: directory,
          dist: path.join(directory, "font"),
          fontName,
          outSVGReact: false,
          outSVGReactNative: false,
          css: {
            // only include css, don't include scss https://github.com/jaywcjlove/svgtofont/blob/eee1608c682e51b92ab509a82f788881ae28fa2d/src/utils.ts#L311
            include: /(?<!s)css/gm,
            fontSize: "16px",
          },
          emptyDist: true,

          excludeFormat: ["eot", "ttf", "woff", "symbol.svg", "svg"],
        });
      }) ?? []
    );
  }

  return {
    name: "icon-font-plugin",
    async configureServer(server) {
      await generateIconFont();

      server.watcher.on("change", (changedFile) => {
        const handleFileChange = async () => {
          try {
            if (options?.paths.some((p) => changedFile === path.dirname(p))) {
              await generateIconFont();
            }
          } catch (error) {
            console.error(
              "[icon-font-plugin] Error generating icon font:",
              error
            );
          }
        };
        void handleFileChange();
      });
    },
  } satisfies Plugin;
}

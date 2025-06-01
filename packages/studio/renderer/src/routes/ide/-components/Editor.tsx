import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { jsonc } from "@shopify/lang-jsonc";
import {
  bracketMatching,
  defaultHighlightStyle,
  foldGutter,
  foldKeymap,
  indentOnInput,
  LanguageSupport,
  syntaxHighlighting,
} from "@codemirror/language";
import { lintKeymap } from "@codemirror/lint";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { EditorState } from "@codemirror/state";
import {
  crosshairCursor,
  drawSelection,
  dropCursor,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  rectangularSelection,
  ViewPlugin,
} from "@codemirror/view";
import React, { useEffect, useRef, useState } from "react";
import "./Editor.css";
import { cn } from "src/utils";
import { Lang } from "src/types";
import { langForFile } from "src/lang";

type EditorProps = React.ComponentProps<"div"> & {
  filePath?: string;
};

export const Editor = ({ filePath, className, ...divProps }: EditorProps) => {
  const [fileContents, setFileContents] = useState<string | null>(null);

  if (filePath) {
    window.electronApi
      ?.getFileContents({ path: filePath })
      .then(setFileContents);
  }

  const lang = langForFile(filePath ?? "");

  const editorRef = useEditor({ doc: fileContents, lang: lang });

  return (
    <div
      ref={editorRef}
      className={cn("w-full h-full rotate", className)}
      {...divProps}
    />
  );
};

function useEditor(props: { lang?: Lang; doc?: string | null } = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView>(null);

  useEffect(() => {
    if (props.doc && containerRef.current) {
      editorViewRef.current?.destroy();

      const state = EditorState.create({
        doc: props.doc,
        extensions: [
          // A line number gutter
          lineNumbers(),
          // A gutter with code folding markers
          foldGutter({
            markerDOM(open) {
              const icon = document.createElement("i");
              icon.classList = "ri-arrow-right-s-line inline-block";

              if (open) {
                icon.classList.add("rotate-90");
              }

              return icon;
            },
          }),
          // Replace non-printable characters with placeholders
          highlightSpecialChars(),
          // The undo history
          history(),
          // Replace native cursor/selection with our own
          drawSelection(),
          // Show a drop cursor when dragging over the editor
          dropCursor(),
          // Allow multiple cursors/selections
          EditorState.allowMultipleSelections.of(true),
          // Re-indent lines when typing specific input
          indentOnInput(),
          // Highlight syntax with a default style
          syntaxHighlighting(defaultHighlightStyle),
          // Highlight matching brackets near cursor
          bracketMatching(),
          // Automatically close brackets
          closeBrackets(),
          // Load the autocompletion system
          autocompletion(),
          // Allow alt-drag to select rectangular regions
          rectangularSelection(),
          // Change the cursor to a crosshair when holding alt
          crosshairCursor(),
          // Style the current line specially
          highlightActiveLine(),
          // Style the gutter for current line specially
          highlightActiveLineGutter(),
          // Highlight text that matches the selected text
          highlightSelectionMatches(),
          keymap.of([
            // Closed-brackets aware backspace
            ...closeBracketsKeymap,
            // A large set of basic bindings
            ...defaultKeymap,
            // Search-related keys
            ...searchKeymap,
            // Redo/undo keys
            ...historyKeymap,
            // Code folding bindings
            ...foldKeymap,
            // Autocompletion keys
            ...completionKeymap,
            // Keys related to the linter system
            ...lintKeymap,
          ]),
          themeExtension,
          toggleActiveLineClass,
          ...getExtensionsForLanguage({ lang: props.lang }),
        ],
      });

      editorViewRef.current = new EditorView({
        parent: containerRef.current,
        state,
      });
    }
  }, [props.doc, props.lang]);

  return function handleContainerRef(ref: HTMLDivElement) {
    containerRef.current = ref;
  };
}

const getExtensionsForLanguage = (props: {
  lang?: Lang;
}): LanguageSupport[] => {
  switch (props.lang) {
    case undefined:
      return [];

    case "ts":
    case "js":
    case "cjs":
    case "mjs":
    case "cts":
    case "mts":
    case "jsx":
    case "tsx":
    case "mjsx":
    case "cjsx":
    case "mtsx":
    case "ctsx":
      return [
        javascript({
          jsx: ["jsx", "tsx", "mjsx", "mtsx", "cjsx", "ctsx"].includes(
            props.lang
          ),
          typescript: ["ts", "cts", "mts", "tsx", "mtsx", "ctsx"].includes(
            props.lang
          ),
        }),
      ];
    case "json":
    case "jsonc":
      return [jsonc()];
    default: {
      const exhaustivenessCheck: never = props.lang;
      console.error(`No extension found for language: ${exhaustivenessCheck}`);
      return [];
    }
  }
};

const toggleActiveLineClass = ViewPlugin.fromClass(class {});

const color = {
  cursor: "var(--color-emerald-500)",
  selection: "var(--color-emerald-100)",
  highlightBackground:
    "color-mix(in oklab, var(--color-emerald-500) 5%, transparent)",
};

const themeExtension = EditorView.theme({
  ".cm-gutters": {
    backgroundColor: "var(--color-white)",
    border: "none",
  },

  ".cm-foldGutter .cm-gutterElement .ri-arrow-right-s-line.rotate-90": {
    transitionProperty: "opacity",
    transitionDuration: "150ms",
    opacity: 0,
  },

  ".cm-foldGutter .cm-gutterElement .ri-arrow-right-s-line": {
    /* always show fold icon when code is folded */
    opacity: 1,
  },

  ".cm-gutters:hover .cm-foldGutter .cm-gutterElement .ri-arrow-right-s-line": {
    opacity: 1,
  },

  ".cm-activeLine, .cm-activeLineGutter": {
    backgroundColor: color.highlightBackground,
  },

  ".cm-cursor, .cm-dropCursor": {
    borderInlineStartColor: color.cursor,
    borderInlineStartWidth: "2px",
  },

  ".cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
    backgroundColor: "var(--color-neutral-200)",
  },

  "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
    {
      backgroundColor: color.selection,
    },

  ".cm-selectionMatch": {
    borderRadius: "0.25rem",
    paddingBlock: "0.125rem",
    backgroundColor:
      "color-mix(in oklab, var(--color-neutral-500) 15%, transparent)",
  },
});

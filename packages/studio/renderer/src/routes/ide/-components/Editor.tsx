import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import {
  bracketMatching,
  defaultHighlightStyle,
  foldGutter,
  foldKeymap,
  indentOnInput,
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
} from "@codemirror/view";
import React, { useEffect, useRef, useState } from "react";
import "./Editor.css";

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

  const editorRef = useEditor({ doc: fileContents });

  return <div ref={editorRef} className={className} {...divProps} />;
};

function useEditor(props: { doc?: string | null } = {}) {
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
          foldGutter(),
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
        ],
      });

      editorViewRef.current?.setState(state);

      editorViewRef.current = new EditorView({
        parent: containerRef.current,
        state,
      });
    }
  }, [props.doc]);

  return function handleContainerRef(ref: HTMLDivElement) {
    containerRef.current = ref;
  };
}

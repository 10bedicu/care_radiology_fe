import React, {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  MutableRefObject,
} from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

interface EditorProps {
  readOnly?: boolean;
  defaultValue?: any;
  height?: number;             // ← added height prop
}

const Editor = forwardRef<Quill | null, EditorProps>(
  ({ readOnly = false, defaultValue, height = 200 }, ref) => {

    const containerRef = useRef<HTMLDivElement | null>(null);
    const quillRef = useRef<Quill | null>(null);
    const toolbarRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      if (!containerRef.current) return;

      const wrapper = containerRef.current;

      // Toolbar (hidden initially)
      const toolbarDiv = document.createElement("div");
      toolbarDiv.style.display = "none";
      toolbarDiv.innerHTML = `
  <span class="ql-formats">
    <select class="ql-size"></select>
  </span>

  <span class="ql-formats">
    <button class="ql-bold"></button>
    <button class="ql-italic"></button>
    <button class="ql-underline"></button>
    <button class="ql-strike"></button>
  </span>

  <span class="ql-formats">
    <button class="ql-link"></button>
  </span>

  <span class="ql-formats">
    <button class="ql-list" value="ordered"></button>
    <button class="ql-list" value="bullet"></button>
  </span>

  <span class="ql-formats">
    <button class="ql-indent" value="-1"></button>
    <button class="ql-indent" value="+1"></button>
  </span>

  <span class="ql-formats">
    <select class="ql-align"></select>
  </span>

  <span class="ql-formats">
    <button class="ql-clean"></button>
  </span>
`;

      wrapper.appendChild(toolbarDiv);
      toolbarRef.current = toolbarDiv;

      const editorContainer = document.createElement("div");
      editorContainer.style.height = "auto";
      editorContainer.style.minHeight = height + "px";
      editorContainer.style.maxHeight = "none";
      wrapper.appendChild(editorContainer);

      const quill = new Quill(editorContainer, {
        theme: "snow",
        readOnly,
        modules: {
          toolbar: toolbarDiv,
        },
      });

      if (defaultValue) quill.setContents(defaultValue);

      // Show toolbar when editor is focused
quill.on("selection-change", (range) => {
  if (range) {
    toolbarDiv.style.display = "block";
  }
});

// Hide toolbar only when clicking OUTSIDE editor + toolbar
document.addEventListener("mousedown", (e) => {
  if (
    !wrapper.contains(e.target as Node) &&     // not editor
    !toolbarDiv.contains(e.target as Node)     // not toolbar
  ) {
    toolbarDiv.style.display = "none";
  }
});

      quillRef.current = quill;
      if (typeof ref === "function") ref(quill);
      else if (ref) (ref as MutableRefObject<Quill | null>).current = quill;

      return () => {
        if (ref && typeof ref !== "function") {
          (ref as MutableRefObject<Quill | null>).current = null;
        }
        wrapper.innerHTML = "";
      };
    }, [height]);

    return <div ref={containerRef} className="w-full" />;
  }
);

Editor.displayName = "Editor";
export default Editor;

import React from "react";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import "./chapterEditor.scss";
export default function ChapterEditor({ chapter, content, setContent,}) {
  return (
    <>
      <div className="editor-wrapper">
        <CKEditor
          editor={ClassicEditor}
          data={content || chapter?.content || ""}
          config={{
            toolbar: [
              "heading",
              "|",
              "bold",
              "italic",
              "link",
              "|",
              "bulletedList",
              "numberedList",
              "|",
              "undo",
              "redo",
              "|",
              "style",
            ],
            style: {
              definitions: [
                {
                  name: "Dropcap Paragraph",
                  element: "p",
                  classes: ["dropcap"],
                },
              ],
            },
          }}
          onChange={(e, editor) => setContent(editor.getData())}
        />
      </div>
    </>
  );
}
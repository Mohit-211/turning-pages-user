import React, { useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import "./chapterEditor.scss";

export default function ChapterEditor({ chapter, content, setContent }) {
  const [editorReady, setEditorReady] = useState(false);

  return (
    <div className="editor-wrapper">
      {!editorReady && (
        <div className="editor-loader">
          ✨ Editor ready to edit...
        </div>
      )}

      <Editor
        apiKey="mibv7kc74dumv3uazcc6tu9xu601iqybxjb0qnglj1fn1258"
        value={content || chapter?.content || ""}
        init={{
          height: 500,
          menubar: true,
          branding: false,
          plugins: "table link image lists media charmap emoticons",
          toolbar:
            "undo redo | blocks fontfamily fontsize | bold italic underline forecolor backcolor | " +
            "alignleft aligncenter alignright alignjustify | bullist numlist | link image media table | removeformat",
          font_family_formats: `
            Arial=arial,helvetica,sans-serif;
            Calibri=calibri,arial,helvetica,sans-serif;
            Times New Roman=times new roman,times,serif;
            Georgia=georgia,palatino,serif;
            Verdana=verdana,geneva,sans-serif;
            Courier New=courier new,courier,monospace;
          `,
          automatic_uploads: true,
          file_picker_types: "image",

          setup: (editor) => {
            editor.on("init", () => {
              setTimeout(() => {
                setEditorReady(true);
              }, 2000); // ⏱ 2 seconds pause
            });
          },
        }}
        onEditorChange={(newContent) => setContent(newContent)}
      />
    </div>
  );
}

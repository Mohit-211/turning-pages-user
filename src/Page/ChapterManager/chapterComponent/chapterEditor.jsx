import React, { useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import "./ChapterEditor.scss";

export default function ChapterEditor({
  content,
  setContent,
  onlyView,
  editorRef,
}) {
  const [editorReady, setEditorReady] = useState(false);

  return (
    <div className="editor-wrapper">
      {!editorReady && (
        <div className="editor-loader">
          <span className="loader-text">Loading editor... 📝</span>
        </div>
      )}

      <Editor
        apiKey="l8z8itk8wu9fzhh5rycablwg5569p08i4rnr84vdohk2wh3m"

        value={content || ""}

        onInit={(evt, editor) => {
          editorRef.current = editor;
          setTimeout(() => setEditorReady(true), 300);
        }}
        disabled={onlyView}

        init={{
          height: 580,
          menubar: false,
          branding: false,
          statusbar: false,

          plugins:
            "advlist autolink lists link image charmap preview anchor table media",
          toolbar:
            "undo redo | blocks fontfamily fontsize | bold italic underline forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist | link image media table | removeformat",

          // toolbar:
          //   "undo redo | blocks | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image table",
          images_upload_handler: (blobInfo) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result); // data:image/...;base64,...
              reader.onerror = () =>
                reject("Image upload failed: could not read file.");
              reader.readAsDataURL(blobInfo.blob());
            }),
          content_style: `
            body { 
              font-family: Georgia, serif; 
              font-size: 16px; 
              line-height: 1.6; 
            }
          `,
        }}

        onEditorChange={(newContent) => {
          setContent(newContent);
        }}
      />
    </div>
  );
}
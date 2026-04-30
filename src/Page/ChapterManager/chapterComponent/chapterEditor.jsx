import React, { useState, useRef, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import "./ChapterEditor.scss";

export default function ChapterEditor({
  content,
  setContent,
  onlyView,
}) {
  const [editorReady, setEditorReady] = useState(false);
  const editorRef = useRef(null);

  // This is the key fix: Update editor content when `content` prop changes
  useEffect(() => {
    if (editorRef.current && content !== undefined) {
      const currentEditorContent = editorRef.current.getContent();
      
      // Only update if content is actually different to avoid cursor jumps
      if (currentEditorContent !== content) {
        editorRef.current.setContent(content || "");
      }
    }
  }, [content]);

  return (
    <div className="editor-wrapper">
      {/* Loader */}
      {!editorReady && (
        <div className="editor-loader">
          <span className="loader-text">Loading editor... 📝</span>
        </div>
      )}

      <Editor
        apiKey="l8z8itk8wu9fzhh5rycablwg5569p08i4rnr84vdohk2wh3m"
        
        // Keep initialValue for first load only
        initialValue={content || ""}

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

          plugins: "advlist autolink lists link image charmap preview anchor table",
          toolbar: "undo redo | blocks | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image table",

          content_style: `
            body { 
              font-family: Georgia, serif; 
              font-size: 16px; 
              line-height: 1.6; 
            }
          `,
        }}

        // Update parent state when editor content changes
        onEditorChange={(newContent) => {
          if (newContent !== content) {
            setContent(newContent);
          }
        }}
      />
    </div>
  );
}
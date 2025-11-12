import React from "react";
import { Button } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default function ChapterEditor({ chapter, content, setContent, onSave, saving }) {
  return (
    <>
      <div className="editor-header">
        <h2>{chapter?.title}</h2>
        <Button icon={<SaveOutlined />} loading={saving} onClick={onSave}>
          Save
        </Button>
      </div>

      <div className="editor-wrapper">
        <CKEditor
          editor={ClassicEditor}
          data={chapter?.content || ""}
          onChange={(e, editor) => setContent(editor.getData())}
        />
      </div>
    </>
  );
}

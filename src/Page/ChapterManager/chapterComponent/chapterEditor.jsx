import React from "react";
import { Button } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Autoformat,
  BlockQuote,
  Bold,
  Essentials,
  GeneralHtmlSupport,
  Heading,
  Image,
  ImageCaption,
  ImageStyle,
  ImageToolbar,
  Indent,
  Italic,
  Link,
  List,
  MediaEmbed,
  Paragraph,
  PasteFromOffice,
  Style,
  Table,
  TableToolbar,
  TextTransformation,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";

// Same content features as the old predefined classic build, so existing chapters load unchanged,
// plus Style (and GeneralHtmlSupport, which it needs) for the dropcap paragraph style.
const editorConfig = {
  licenseKey: import.meta.env.VITE_CKEDITOR_LICENSE_KEY || "GPL",
  plugins: [
    Autoformat,
    BlockQuote,
    Bold,
    Essentials,
    GeneralHtmlSupport,
    Heading,
    Image,
    ImageCaption,
    ImageStyle,
    ImageToolbar,
    Indent,
    Italic,
    Link,
    List,
    MediaEmbed,
    Paragraph,
    PasteFromOffice,
    Style,
    Table,
    TableToolbar,
    TextTransformation,
  ],
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
  image: {
    toolbar: ["imageStyle:inline", "imageStyle:block", "imageStyle:side", "|", "toggleImageCaption", "imageTextAlternative"],
  },
  table: {
    contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
  },
  style: {
    definitions: [
      {
        name: "Dropcap Paragraph",
        element: "p",
        classes: ["dropcap"],
      },
    ],
  },
};

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
          data={content || chapter?.content || ""}
          config={editorConfig}
          onChange={(e, editor) => setContent(editor.getData())}
        />
      </div>
    </>
  );
}

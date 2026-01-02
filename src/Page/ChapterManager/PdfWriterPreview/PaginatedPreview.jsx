import React, { useRef, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useReactToPrint } from "react-to-print";
import PaginatedPreview from "./PaginatedPreview";
import "./PdfWriterPreview.scss";

const PdfWriterPreview = () => {
  const [content, setContent] = useState("");
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: "PDF-Document",
  });

  return (
    <div className="pdf-writer-layout">
      {/* ✍️ Editor */}
      <div className="editor-panel">
        <h3>Write Content</h3>

        <CKEditor
          editor={ClassicEditor}
          data={content}
          onChange={(event, editor) => {
            setContent(editor.getData());
          }}
        />
      </div>

      {/* 📄 Preview */}
      <div className="preview-panel">
        <div className="preview-header">
          <h3>PDF Preview</h3>
          <button className="print-btn" onClick={handlePrint}>
            Print / Save PDF
          </button>
        </div>

        {/* Printable Area */}
        <div ref={printRef}>
          <PaginatedPreview html={content} />
        </div>
      </div>
    </div>
  );
};

export default PdfWriterPreview;

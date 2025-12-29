import React, { useState } from "react";
import { Document, Page } from "react-pdf";

export default function PdfPreview({ file }) {
  const [pages, setPages] = useState(0);

  if (!file) return <p>No PDF generated</p>;

  return (
    <Document
      file={file}
      onLoadSuccess={(pdf) => setPages(pdf.numPages)}
    >
      {Array.from(new Array(pages), (_, i) => (
        <Page
          key={i}
          pageNumber={i + 1}
          width={600}
        />
      ))}
    </Document>
  );
}

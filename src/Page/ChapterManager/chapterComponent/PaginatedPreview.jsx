import React, { useEffect, useRef, useState } from "react";
import "./PaginatedPreview.scss";

const PAGE_HEIGHT = 1050;

export default function PaginatedPreview({ html }) {
  const measureRef = useRef(null);
  const [pages, setPages] = useState([]);

  useEffect(() => {
    if (!measureRef.current) return;

    const measure = measureRef.current;
    measure.innerHTML = "";

    // Create a page shell INSIDE the measuring container
    const page = document.createElement("div");
    page.className = "page page-measure";

    const content = document.createElement("div");
    content.className = "page-content";

    page.appendChild(content);
    measure.appendChild(page);

    const temp = document.createElement("div");
    temp.innerHTML = html;

    const newPages = [];

    Array.from(temp.childNodes).forEach((node) => {
      content.appendChild(node.cloneNode(true));

      if (page.scrollHeight > PAGE_HEIGHT) {
        // remove overflowing node
        content.removeChild(content.lastChild);

        // save page
        newPages.push(content.innerHTML);

        // reset page
        content.innerHTML = "";
        content.appendChild(node.cloneNode(true));
      }
    });

    if (content.innerHTML.trim()) {
      newPages.push(content.innerHTML);
    }

    setPages(newPages);
  }, [html]);

  return (
    <>
      {/* Hidden measurement container */}
      <div className="pagination-measure" ref={measureRef} />

      {/* Visible pages */}
      <div className="pages-container">
        {pages.map((content, i) => (
          <div className="page" key={i}>
            <div
              className="page-content"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            <div className="page-number">{i + 1}</div>
          </div>
        ))}
      </div>
    </>
  );
}

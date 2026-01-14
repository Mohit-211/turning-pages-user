import React, { useEffect, useRef, useState } from "react";
import "./PaginatedPreview.scss";

const PAGE_HEIGHT = 1020; // content-only height (buffer included)

export default function PaginatedPreview({ html }) {
  const measureRef = useRef(null);
  const [pages, setPages] = useState([]);

  useEffect(() => {
    const paginate = async () => {
      if (!measureRef.current) return;

      // ✅ wait for fonts to avoid reflow issues
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      const measure = measureRef.current;
      measure.innerHTML = "";

      // page shell for measuring
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
        // ✅ ignore empty text nodes
        if (
          node.nodeType === Node.TEXT_NODE &&
          !node.textContent.trim()
        ) {
          return;
        }

        content.appendChild(node.cloneNode(true));

        // ✅ measure content only
        if (content.scrollHeight > PAGE_HEIGHT) {
          // remove overflowing node
          content.removeChild(content.lastChild);

          // save page
          if (content.innerHTML.trim()) {
            newPages.push(content.innerHTML);
          }

          // reset page
          content.innerHTML = "";
          content.appendChild(node.cloneNode(true));
        }
      });

      // push last page if content exists
      if (content.innerHTML.trim()) {
        newPages.push(content.innerHTML);
      }

      setPages(newPages);
    };

    paginate();
  }, [html]);

  return (
    <>
      {/* Hidden measurement container */}
      <div className="pagination-measure" ref={measureRef} />

      {/* Visible paginated preview */}
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

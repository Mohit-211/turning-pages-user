import React, { useEffect, useRef, useState } from "react";
import "./PaginatedPreview.scss";

const PAGE_HEIGHT_PX = 1050; // ~A4 content height in pixels (adjust if needed)

export default function PaginatedPreview({ html, isOpen, onClose }) {
  const [pages, setPages] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !html) {
      setPages([]);
      return;
    }

    const paginateContent = () => {
      if (!containerRef.current) return;

      // Create temporary container for measurement
      const temp = document.createElement("div");
      temp.innerHTML = html;
      temp.style.position = "absolute";
      temp.style.visibility = "hidden";
      temp.style.width = "720px";
      temp.style.padding = "70px 80px";
      temp.style.fontFamily = '"Georgia", "Times New Roman", serif';
      temp.style.fontSize = "16px";
      temp.style.lineHeight = "1.65";
      document.body.appendChild(temp);

      const pageElements = [];
      let currentPage = document.createElement("div");
      currentPage.className = "page-content";

      const walker = document.createTreeWalker(
        temp,
        NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT
      );
      let currentNode = walker.nextNode();

      while (currentNode) {
        const clone = currentNode.cloneNode(true);
        currentPage.appendChild(clone);

        // Check overflow
        if (currentPage.scrollHeight > PAGE_HEIGHT_PX) {
          // Remove the overflowing node and start new page
          currentPage.removeChild(clone);
          if (currentPage.innerHTML.trim()) {
            pageElements.push(currentPage.innerHTML);
          }
          currentPage = document.createElement("div");
          currentPage.className = "page-content";
          currentPage.appendChild(clone);
        }

        currentNode = walker.nextNode();
      }

      // Push last page
      if (currentPage.innerHTML.trim()) {
        pageElements.push(currentPage.innerHTML);
      }

      document.body.removeChild(temp);
      setPages(pageElements);
    };

    paginateContent();
  }, [html, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="preview-modal-overlay" onClick={onClose}>
      <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Book Preview</h2>
          <button
            className="close-btn"
            onClick={onClose}
            aria-label="Close preview"
          >
            <X size={24} />
          </button>
        </div>

        <div className="pages-wrapper">
          {pages.length === 0 ? (
            <div className="empty-preview">
              <p>No content to preview yet</p>
            </div>
          ) : (
            pages.map((pageHtml, index) => (
              <div key={index} className="preview-page">
                <div
                  className="page-content"
                  dangerouslySetInnerHTML={{ __html: pageHtml }}
                />
                <div className="page-number">{index + 1}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { Skeleton } from "antd";
import {
  GetTagsApi,
  GetAllQuotesApi,
  GetQuotesByTagApi,
} from "../../../../api/operations/quote.api";
import "./QuotesPanel.scss";

/* ── Icons ── */
const IconCopy = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconInsert = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 5v14M5 12l7 7 7-7" />
  </svg>
);
const IconSearch = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const tagAccents = {
  All: "#1e2d40",
  Motivation: "#e8323c",
  Wisdom: "#2e7d6e",
  Life: "#5a4fcf",
  Inspiration: "#f47b20",
  Love: "#c2405a",
};

const getItemTag = (item) => {
  const raw = typeof item.tag === "object" ? item.tag?.title : item.tag;
  return (raw ?? "").trim();
};

const LIMIT_PER_PAGE = 30;

export default function QuotesPanel({
  editorRef,
  onClose,
})  {
  const [quotes, setQuotes]           = useState([]);
  const [quotesTotal, setQuotesTotal]           = useState();

  const [allQuotes, setAllQuotes]     = useState([]);
  const [tags, setTags]               = useState(["All"]);
  const [activeTag, setActiveTag]     = useState("All");
  const [isLoading, setIsLoading]     = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied]           = useState(null);
  const [inserted, setInserted]       = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore]         = useState(true);
  const searchRef                     = useRef(null);
  const listRef                       = useRef(null);
  const loadingMoreRef                = useRef(false);

  /* fetch tags once */
  useEffect(() => {
    GetTagsApi()
      .then((res) => {
        const list = res?.data?.data?.data || [];
        setTags(["All", ...list.map((t) => t.title.trim())]);
      })
      .catch(() => {});
  }, []);

  /* fetch quotes when tag changes */
  useEffect(() => {
    setIsLoading(true);
    setCurrentPage(1);
    setAllQuotes([]);
    setQuotes([]);
    setHasMore(true);

    const fn =
      activeTag === "All"
        ? GetAllQuotesApi(1, LIMIT_PER_PAGE)
        : GetQuotesByTagApi(activeTag, 1, LIMIT_PER_PAGE);

    fn.then((res) => {
      console.log(res,"res")
      const list = res?.data?.data?.data || [];
      setQuotesTotal(res?.data?.data.total)
      console.log(list,"list")
      setAllQuotes(list);
      setQuotes(list);
      setHasMore(list.length === LIMIT_PER_PAGE);
    })
      .catch(() => {
        setQuotes([]);
        setAllQuotes([]);
      })
      .finally(() => setIsLoading(false));
  }, [activeTag]);
console.log(quotesTotal,"===>")
  /* fetch more quotes when scrolling */
  const loadMoreQuotes = async () => {
    if (loadingMoreRef.current || isLoadingMore || !hasMore) return;

    loadingMoreRef.current = true;
    setIsLoadingMore(true);

    const nextPage = currentPage + 1;
    const fn =
      activeTag === "All"
        ? GetAllQuotesApi(nextPage, LIMIT_PER_PAGE)
        : GetQuotesByTagApi(activeTag, nextPage, LIMIT_PER_PAGE);

    try {
      const res = await fn;
      const list = res?.data?.data?.data || [];

      setAllQuotes((prev) => [...prev, ...list]);
      setQuotes((prev) => [...prev, ...list]);
      setCurrentPage(nextPage);
      setHasMore(list.length === LIMIT_PER_PAGE);
    } catch {
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
      loadingMoreRef.current = false;
    }
  };

  /* detect scroll to bottom */
  useEffect(() => {
    const handleScroll = () => {
      if (!listRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

      // Load more when user is 300px from bottom
      if (distanceFromBottom < 300 && !isLoadingMore && hasMore) {
        loadMoreQuotes();
      }
    };

    const element = listRef.current;
    if (element) {
      element.addEventListener("scroll", handleScroll);
      return () => element.removeEventListener("scroll", handleScroll);
    }
  }, [isLoadingMore, hasMore, currentPage, activeTag]);

  /* live search filter */
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setQuotes(allQuotes);
      return;
    }
    setQuotes(
      allQuotes.filter(
        (item) =>
          item.quote?.toLowerCase().includes(q) ||
          item.author?.toLowerCase().includes(q) ||
          getItemTag(item).toLowerCase().includes(q)
      )
    );
  }, [searchQuery, allQuotes]);

  const handleCopy = (quote) => {
    navigator.clipboard.writeText(`"${quote.quote}" — ${quote.author}`);
    setCopied(quote.id);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleInsert = (quote) => {
    const quoteHtml = `
      <blockquote>
        <p>"${quote.quote}"</p>
        <footer>— ${quote.author}</footer>
      </blockquote>
    `;

    if (editorRef?.current) {
      editorRef.current.focus();
      editorRef.current.insertContent(quoteHtml);
    }

    setInserted(quote.id);

    setTimeout(() => {
      setInserted(null);
    }, 1500);
  };

  return (
    <div className="quotes-panel">

      {/* ── Header ── */}
      <div className="quotes-panel__header">
        <div className="quotes-panel__header-left">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <span className="quotes-panel__title">Quotes Library</span>
        </div>
        <button className="quotes-panel__close" onClick={onClose}>
          <IconClose />
        </button>
      </div>

      {/* ── Search ── */}
      <div className="quotes-panel__search-wrap">
        <span className="quotes-panel__search-icon"><IconSearch /></span>
        <input
          ref={searchRef}
          className="quotes-panel__search"
          placeholder="Search quotes, authors…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className="quotes-panel__search-clear"
            onClick={() => setSearchQuery("")}
          >
            <IconClose />
          </button>
        )}
      </div>

      {/* ── Tag Pills ── */}
      <div className="quotes-panel__tags">
        {tags.map((tag) => (
          <button
            key={tag}
            className={`quotes-panel__tag ${activeTag === tag ? "quotes-panel__tag--active" : ""}`}
            style={{ "--accent": tagAccents[tag] || "#1e2d40" }}
            onClick={() => { setActiveTag(tag); setSearchQuery(""); }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* ── Count ── */}
      <div className="quotes-panel__count">
        {isLoading ? (
          <Skeleton.Button active size="small" shape="round" style={{ width: 50 }} />
        ) : (
          <span>{quotesTotal} quote{quotes.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      {/* ── List ── */}
      <div className="quotes-panel__list" ref={listRef}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="quotes-panel__skeleton" />
          ))
        ) : quotes.length === 0 ? (
          <div className="quotes-panel__empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p>No quotes found</p>
            <span>Try a different search or category</span>
          </div>
        ) : (
          <>
            {quotes?.map((quote) => {
              const tag = getItemTag(quote);
              const accent = tagAccents[tag] || "#1e2d40";
              return (
                <div
                  key={quote.id}
                  className="quotes-panel__card"
                  style={{ "--accent": accent }}
                >
                  {/* Quote mark watermark */}
                  <span className="quotes-panel__card-watermark">"</span>

                  {/* Quote text */}
                  <p className="quotes-panel__card-text">{quote.quote}</p>

                  {/* Author + tag row */}
                  <div className="quotes-panel__card-author-row">
                    <span className="quotes-panel__card-author">— {quote.author}</span>
                    {tag && (
                      <span className="quotes-panel__card-tag">{tag}</span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="quotes-panel__card-actions">
                    <button
                      className={`quotes-panel__action-btn ${copied === quote.id ? "quotes-panel__action-btn--done" : ""}`}
                      onClick={() => handleCopy(quote)}
                    >
                      {copied === quote.id
                        ? <><IconCheck /><span>Copied!</span></>
                        : <><IconCopy /><span>Copy</span></>
                      }
                    </button>

                    {editorRef  && (
                      <button
                        className={`quotes-panel__action-btn quotes-panel__action-btn--insert ${inserted === quote.id ? "quotes-panel__action-btn--done" : ""}`}
                        onClick={() => handleInsert(quote)}
                      >
                        {inserted === quote.id
                          ? <><IconCheck /><span>Inserted!</span></>
                          : <><IconInsert /><span>Insert</span></>
                        }
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading more indicator */}
            {isLoadingMore && (
              <div className="quotes-panel__loading-more">
                <Skeleton.Button active size="small" shape="round" style={{ width: 80 }} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
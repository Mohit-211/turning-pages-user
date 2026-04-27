import { useState, useEffect, useRef } from "react";
import "./QuotesPage.scss";

import {
  GetTagsApi,
  GetAllQuotesApi,
  GetQuotesByTagApi
} from "../../api/operations/quote.api";
import { Skeleton } from "antd";
import EmptyState from "../EmptyState";

/* ==================== Icons ==================== */
const IconCopy = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const IconCheck = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconGrid = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);

/* ==================== Accent Colors ==================== */
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

const filterQuotes = (source, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return source;

  return source.filter(item =>
    item.quote?.toLowerCase().includes(q) ||
    item.author?.toLowerCase().includes(q) ||
    getItemTag(item).toLowerCase().includes(q)
  );
};

export default function QuotesPage() {
  const [allQuotes, setAllQuotes] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [tags, setTags] = useState(["All"]);
  const [activeTag, setActiveTag] = useState("All");
  const [totalCount, setTotalCount] = useState(0);
  const [copied, setCopied] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [catSearch, setCatSearch] = useState("");

  const searchRef = useRef(null);
  const fullQuotesRef = useRef([]);
  const fullFetchedRef = useRef(false);

  const fetchTags = async () => {
    try {
      const res = await GetTagsApi();
      const tagList = res?.data?.data?.data || [];
      setTags(["All", ...tagList.map(t => t.title.trim())]);
    } catch { }
  };

  const fetchAllForSearch = async () => {
    if (fullFetchedRef.current) return fullQuotesRef.current;
    try {
      const res = await GetAllQuotesApi(1, 9999);
      const list = res?.data?.data?.data || [];
      fullQuotesRef.current = list;
      fullFetchedRef.current = true;
      return list;
    } catch {
      return [];
    }
  };

  const fetchQuotesByTag = async (tag) => {
    setIsLoading(true);
    try {
      const res = tag === "All"
        ? await GetAllQuotesApi(1, 30)
        : await GetQuotesByTagApi(tag, 1, 30);

      const list = res?.data?.data?.data || [];
      const total = res?.data?.data?.total || list.length;

      setAllQuotes(list);
      setQuotes(list);
      setTotalCount(total);
    } catch {
      setQuotes([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = async () => {
    const q = searchQuery.trim();
    if (!q) return setQuotes(allQuotes);

    setSearchLoading(true);

    const matchedTag = tags.find(t => t.toLowerCase() === q.toLowerCase());
    if (matchedTag) {
      setActiveTag(matchedTag);
      setSearchQuery("");
      setSearchLoading(false);
      return;
    }

    const source = fullFetchedRef.current
      ? fullQuotesRef.current
      : await fetchAllForSearch();

    setQuotes(filterQuotes(source, q));
    setSearchLoading(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setQuotes(allQuotes);
    searchRef.current?.focus();
  };

  const handleCatSelect = (tag) => {
    setActiveTag(tag);
    setSearchQuery("");
    setShowCatModal(false);
  };

  useEffect(() => { fetchTags(); }, []);
  useEffect(() => { fetchQuotesByTag(activeTag); }, [activeTag]);

  const isSearchActive = searchQuery.trim().length > 0;

  return (
    <div className="quotes-page">

      {/* Header */}
      <header className="quotes-header">
        <p className="quotes-header__eyebrow">A curated collection</p>
        <h1 className="quotes-header__title">
          Words that <br /><em>move the soul</em>
        </h1>
        <div className="quotes-header__rule" />

        <div className="quotes-search-wrap">
          <div className={`quotes-search ${isSearchActive ? "quotes-search--active" : ""}`}>
            <span className="quotes-search__icon"><IconSearch /></span>
            <input
              ref={searchRef}
              className="quotes-search__input"
              placeholder="Search quotes, authors…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
            />
            {isSearchActive && (
              <button className="quotes-search__clear" onClick={clearSearch}>
                <IconClose />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="quotes-main">
        {/* Tags Row */}
        <div className={`quotes-tags-row ${isSearchActive ? "quotes-tags-row--search-active" : ""}`}>
          <button className="all-cats-btn" onClick={() => setShowCatModal(true)}>
            <IconGrid /> ALL CATEGORIES
          </button>

          <nav className="quotes-tags">
            <div className="quotes-tags__inner">
              {tags.map(tag => (
                <button
                  key={tag}
                  className={`tag-btn ${activeTag === tag ? "tag-btn--active" : ""}`}
                  style={{ "--accent": tagAccents[tag] || "#1e2d40" }}
                  onClick={() => {
                    setActiveTag(tag);
                    setSearchQuery("");
                  }}
                >
                  {tag}
                  {activeTag === tag && <span className="tag-btn__dot" />}
                </button>
              ))}
            </div>
          </nav>
        </div>

        <hr className="quotes-divider" />

        {/* Count Bar */}
        <div className="quotes-count">
          <span className="quotes-count__number">
            {searchLoading || isLoading ? (
              <Skeleton.Button active size="small" shape="round" style={{ width: 30 }} />
            ) : (
              isSearchActive ? quotes.length : totalCount
            )}
          </span>
          <span className="quotes-count__label">
            {searchLoading || isLoading
              ? "Loading..."
              : `quote${totalCount !== 1 ? "s" : ""}${activeTag !== "All" ? ` in ${activeTag}` : ""}`
            }
          </span>
        </div>

        {/* Loading State */}
        {(isLoading || searchLoading) && (
          <div className="quotes-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`quote-card quote-card--skeleton ${i % 3 === 0 ? "quote-card--tall" : ""}`}
              />
            ))}
          </div>
        )}

     {/* Quotes / Empty State */}
{!isLoading && !searchLoading && (
  quotes.length === 0 ? (
    <div className="quotes-empty-wrapper">
      <EmptyState
        title="No results found"
        description="Try different keywords"
       
      
      />
    </div>
  ) : (
    <div className="quotes-grid">
      {quotes.map((quote, i) => (
        <article
          key={quote.id}
          className={`quote-card ${i % 4 === 0 ? "quote-card--tall" : ""}`}
          style={{ "--accent": tagAccents[getItemTag(quote)] || "#1e2d40" }}
        >
          <p className="quote-text">"{quote.quote}"</p>

          <footer className="quote-footer">
            <div className="quote-meta">
              <span className="quote-author">— {quote.author}</span>
              <span className="quote-tag">{getItemTag(quote)}</span>
            </div>

            <button
              className={`copy-btn ${copied === quote.id ? "copy-btn--copied" : ""}`}
              onClick={() => {
                navigator.clipboard.writeText(`"${quote.quote}" — ${quote.author}`);
                setCopied(quote.id);
                setTimeout(() => setCopied(null), 1500);
              }}
            >
              {copied === quote.id ? <><IconCheck /> Copied</> : <><IconCopy /> Copy</>}
            </button>
          </footer>
        </article>
      ))}
    </div>
  )
)}
      </main>

      {/* All Categories Modal */}
      {showCatModal && (
        <div className="cat-modal-overlay" onClick={() => setShowCatModal(false)}>
          <div className="cat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cat-modal__header">
              <h2 className="cat-modal__title">All Categories</h2>
              <button className="cat-modal__close" onClick={() => setShowCatModal(false)}>
                <IconClose />
              </button>
            </div>
            <div className="cat-modal__search">
              <span className="cat-modal__search-icon"><IconSearch /></span>
              <input
                className="cat-modal__search-input"
                placeholder="Filter categories…"
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
                autoFocus
              />
              {catSearch && (
                <button className="cat-modal__search-clear" onClick={() => setCatSearch("")}>
                  <IconClose />
                </button>
              )}
            </div>
            <div className="cat-modal__grid">
              {tags
                .filter(t => t.toLowerCase().includes(catSearch.toLowerCase()))
                .map(tag => (
                  <button
                    key={tag}
                    className={`cat-modal__item ${activeTag === tag ? "cat-modal__item--active" : ""}`}
                    style={{ "--accent": tagAccents[tag] || "#1e2d40" }}
                    onClick={() => handleCatSelect(tag)}
                  >
                    <span className="cat-modal__dot" style={{ background: tagAccents[tag] || "#1e2d40" }} />
                    {tag}
                    {activeTag === tag && <span className="cat-modal__active-badge">Active</span>}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
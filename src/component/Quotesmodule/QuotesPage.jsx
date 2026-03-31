import { useState, useEffect, useRef, useCallback } from "react";
import "./QuotesPage.scss";

import {
  GetTagsApi,
  GetAllQuotesApi,
  GetQuotesByTagApi
} from "../../api/operations/quote.api";

/* ─── Icons ─── */
const IconCopy = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
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

/* ─── Accent Colors ─── */
const tagAccents = {
  All: "#c8a96e",
  Motivation: "#e07b5d",
  Wisdom: "#6b9080",
  Life: "#8b7bb5",
  Inspiration: "#c8a96e",
  Love: "#d96d8a",
};

/* ─── Utility: extract tag string from item (handles string or object) ─── */
const getItemTag = (item) => {
  const raw = typeof item.tag === "object" ? item.tag?.title : item.tag;
  return (raw ?? "").trim();
};

/* ─── Core filter function (pure, no setState) ─── */
const filterQuotes = (source, query, availableTags) => {
  const q = query.trim().toLowerCase();
  if (!q) return source;

  // If query exactly matches a tag → show only quotes from that tag
  const matchedTag = availableTags.find(t => t.toLowerCase() === q);
  if (matchedTag) {
    return source.filter(item => getItemTag(item).toLowerCase() === q);
  }

  // Otherwise broad search: quote text, author, tag substring
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
  const [allQoutesLength, setAllQoutesLength] = useState(0);
  const [copied, setCopied] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCatModal, setShowCatModal] = useState(false);
  const [catSearch, setCatSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [hasMore, setHasMore] = useState(true);

  const searchRef = useRef(null);
  const debounceRef = useRef(null);
  const loaderRef = useRef(null);
  const fullQuotesRef = useRef([]);
  const fullFetchedRef = useRef(false);
  const tagsRef = useRef(["All"]);
  const allQuotesRef = useRef([]);

  useEffect(() => { tagsRef.current = tags; }, [tags]);
  useEffect(() => { allQuotesRef.current = allQuotes; }, [allQuotes]);

  const normalize = (str) => str?.trim();

  /* ─── Fetch Tags ─── */
  const fetchTags = async () => {
    try {
      const res = await GetTagsApi();
      const tagList = res?.data?.data?.data || [];
      setTags(["All", ...tagList.map(t => normalize(t.title))]);
    } catch (err) { console.log(err); }
  };

  /* ─── Fetch paginated quotes for current tag ─── */
  const fetchQuotes = useCallback(async (currentLimit) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = activeTag === "All"
        ? await GetAllQuotesApi(1, currentLimit)
        : await GetQuotesByTagApi(normalize(activeTag), 1, currentLimit);

      const total = res?.data?.data?.total;
      const quoteList = res?.data?.data?.data || [];

      setAllQoutesLength(total);
      setAllQuotes(prev => {
        const merged = Array.from(
          new Map([...prev, ...quoteList].map(item => [item.id, item])).values()
        );
        return merged;
      });
      if (quoteList.length < currentLimit) setHasMore(false);
    } catch (err) { console.log(err); }
    setLoading(false);
  }, [activeTag]); // eslint-disable-line

  /* ─── Fetch ALL quotes globally (once per session) for search ─── */
  const fetchAllForSearch = async () => {
    if (fullFetchedRef.current) return fullQuotesRef.current;
    setSearchLoading(true);
    try {
      const res = await GetAllQuotesApi(1, 9999);
      const quoteList = res?.data?.data?.data || [];
      fullQuotesRef.current = quoteList;
      fullFetchedRef.current = true;
    } catch (err) {
      console.log(err);
      fullQuotesRef.current = allQuotesRef.current;
      fullFetchedRef.current = true;
    }
    setSearchLoading(false);
    return fullQuotesRef.current;
  };

  /* ─── Debounced search ─── */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const q = searchQuery.trim();

      if (!q) {
        // Search cleared — restore paginated view
        setQuotes(allQuotesRef.current);
        return;
      }

      // If query exactly matches a tag → switch active tag but KEEP search input value
      const matchedTag = tagsRef.current.find(
        t => t.toLowerCase() === q.toLowerCase()
      );
      if (matchedTag) {
        // ✅ Removed setSearchQuery("") — input stays as user typed
        setActiveTag(matchedTag);
        return;
      }

      // Otherwise broad search across full dataset
      const source = fullFetchedRef.current
        ? fullQuotesRef.current
        : await fetchAllForSearch();

      const results = filterQuotes(source, q, tagsRef.current);
      setQuotes(results);
    }, 6000);

    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]); // eslint-disable-line

  /* ─── Keep displayed quotes in sync when allQuotes loads (non-search) ─── */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setQuotes(allQuotes);
    }
  }, [allQuotes]); // eslint-disable-line

  const handleSearch = (value) => setSearchQuery(value);

  const clearSearch = () => {
    setSearchQuery("");
    setQuotes(allQuotesRef.current);
    searchRef.current?.focus();
  };

  /* ─── Initial fetch ─── */
  useEffect(() => { fetchTags(); }, []);

  /* ─── Reset when activeTag changes ─── */
  useEffect(() => {
    setAllQuotes([]);
    setQuotes([]);
    setLimit(10);
    setHasMore(true);
    setSearchQuery("");
    setShowSkeleton(true);

    const timer = setTimeout(() => {
      setShowSkeleton(false);
      fetchQuotes(10);
    }, 600);
    return () => clearTimeout(timer);
  }, [activeTag]); // eslint-disable-line

  /* ─── Infinite scroll ─── */
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loading && hasMore && !searchQuery) {
        setLimit(prev => {
          const next = prev + 10;
          fetchQuotes(next);
          return next;
        });
      }
    }, { threshold: 1 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore, searchQuery, fetchQuotes]);

  /* ─── Copy ─── */
  const handleCopy = (quote) => {
    navigator.clipboard.writeText(`"${quote.quote}" — ${quote.author}`);
    setCopied(quote.id);
    setTimeout(() => setCopied(null), 2000);
  };

  /* ─── Category modal ─── */
  const handleCatSelect = (tag) => {
    setActiveTag(normalize(tag));
    setShowCatModal(false);
    setCatSearch("");
  };

  const filteredCats = tags.filter(t =>
    t.toLowerCase().includes(catSearch.toLowerCase())
  );

  /* ─── Derived display values ─── */
  const isSearchActive = searchQuery.trim().length > 0;
  const accent = tagAccents[activeTag] || "#c8a96e";
  const searchMatchedTag = isSearchActive
    ? tags.find(t => t.toLowerCase() === searchQuery.trim().toLowerCase()) ?? null
    : null;

  const countNumber = isSearchActive
    ? quotes.length
    : activeTag === "All" ? allQoutesLength : quotes.length;

  const countLabel = isSearchActive
    ? searchMatchedTag
      ? `quote${quotes.length !== 1 ? "s" : ""} in ${searchMatchedTag}`
      : `result${quotes.length !== 1 ? "s" : ""} for "${searchQuery}"`
    : `quote${countNumber !== 1 ? "s" : ""}${activeTag !== "All" ? ` in ${activeTag}` : " in collection"}`;

  return (
    <div className="quotes-page">

      {/* ── Header ── */}
      <header className="quotes-header" style={{ "--accent": accent }}>
        <p className="quotes-header__eyebrow">A curated collection</p>
        <h1 className="quotes-header__title">Words that <br /><em>move the soul</em></h1>
        <div className="quotes-header__rule" />
        <div className="quotes-search-wrap">
          <div className={`quotes-search ${isSearchActive ? "quotes-search--active" : ""}`}>
            <span className="quotes-search__icon"><IconSearch /></span>
            <input
              ref={searchRef}
              className="quotes-search__input"
              placeholder="Search quotes, authors…"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {isSearchActive && (
              <button className="quotes-search__clear" onClick={clearSearch} aria-label="Clear search">
                <IconClose />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="quotes-main">

        {/* ── Tags Row ── */}
        <div className={`quotes-tags-row ${isSearchActive && !searchMatchedTag ? "quotes-tags-row--search-active" : ""}`}>
          <button className="all-cats-btn" onClick={() => setShowCatModal(true)}>
            <IconGrid /> All Categories
          </button>
          <nav className="quotes-tags">
            <div className="quotes-tags__inner">
              {tags.map(tag => {
                const isActive = isSearchActive
                  ? tag.toLowerCase() === searchQuery.trim().toLowerCase()
                  : activeTag === tag;
                return (
                  <button
                    key={tag}
                    className={`tag-btn ${isActive ? "tag-btn--active" : ""}`}
                    style={{ "--accent": tagAccents[tag] || "#c8a96e" }}
                    onClick={() => {
                      setActiveTag(tag);
                      // ✅ Only clears search when user explicitly clicks a tag
                      if (isSearchActive) {
                        setSearchQuery("");
                        setQuotes([]);
                      }
                    }}
                  >
                    {tag}
                    {isActive && <span className="tag-btn__dot" />}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        <hr className="quotes-divider" />

        {/* ── Count ── */}
        <div className="quotes-count">
          <span className="quotes-count__number">{countNumber}</span>
          <span className="quotes-count__label">{countLabel}</span>
        </div>

        {/* ── Skeleton (tag switch) ── */}
        {showSkeleton && (
          <div className="quotes-grid">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className={`quote-card quote-card--skeleton ${i % 4 === 0 ? "quote-card--tall" : ""}`} />
            ))}
          </div>
        )}

        {/* ── Search loading skeleton ── */}
        {!showSkeleton && searchLoading && (
          <div className="quotes-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`quote-card quote-card--skeleton ${i % 4 === 0 ? "quote-card--tall" : ""}`} />
            ))}
          </div>
        )}

        {/* ── Quotes Grid ── */}
        {!showSkeleton && !searchLoading && (
          <div className="quotes-grid">
            {quotes.map((quote, i) => (
              <article
                key={quote.id}
                className={`quote-card ${i % 4 === 0 ? "quote-card--tall" : ""}`}
                style={{
                  "--accent": tagAccents[getItemTag(quote)] || tagAccents[quote.tag] || "#c8a96e",
                  animationDelay: `${(i % 6) * 0.06}s`,
                }}
              >
                <p className="quote-text">"{quote.quote}"</p>
                <footer className="quote-footer">
                  <div className="quote-meta">
                    <span className="quote-author">— {quote.author}</span>
                    <span className="quote-tag">{getItemTag(quote) || quote.tag}</span>
                  </div>
                  <button
                    className={`copy-btn ${copied === quote.id ? "copy-btn--copied" : ""}`}
                    onClick={() => handleCopy(quote)}
                  >
                    {copied === quote.id ? <><IconCheck /> Copied</> : <><IconCopy /> Copy</>}
                  </button>
                </footer>
              </article>
            ))}

            {isSearchActive && quotes.length === 0 && !loading && (
              <div className="quotes-empty">
                <p className="quotes-empty__title">No results found</p>
                <p className="quotes-empty__sub">Try a different keyword or author name</p>
              </div>
            )}
          </div>
        )}

        <div ref={loaderRef} style={{ height: "40px" }} />
      </main>

      {/* ══ All Categories Modal ══ */}
      {showCatModal && (
        <div className="cat-modal-overlay" onClick={() => setShowCatModal(false)}>
          <div className="cat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cat-modal__header">
              <h2 className="cat-modal__title">All Categories</h2>
              <button className="cat-modal__close" onClick={() => setShowCatModal(false)} aria-label="Close">
                <IconClose />
              </button>
            </div>
            <div className="cat-modal__search">
              <span className="cat-modal__search-icon"><IconSearch /></span>
              <input
                type="text"
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
              {filteredCats.map(tag => (
                <button
                  key={tag}
                  className={`cat-modal__item ${activeTag === tag ? "cat-modal__item--active" : ""}`}
                  style={{ "--accent": tagAccents[tag] || "#c8a96e" }}
                  onClick={() => handleCatSelect(tag)}
                >
                  <span className="cat-modal__dot" style={{ background: tagAccents[tag] || "#c8a96e" }} />
                  {tag}
                  {activeTag === tag && <span className="cat-modal__active-badge">Active</span>}
                </button>
              ))}
              {filteredCats.length === 0 && (
                <p className="cat-modal__empty">No categories match "{catSearch}"</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
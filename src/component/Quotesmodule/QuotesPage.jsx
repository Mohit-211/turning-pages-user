import { useState, useEffect, useRef } from "react";
import "./QuotesPage.scss";

import {
  GetTagsApi,
  GetAllQuotesApi,
  GetQuotesByTagApi
} from "../../api/operations/quote.api";

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

const tagAccents = {
  All: "#c8a96e",
  Motivation: "#e07b5d",
  Wisdom: "#6b9080",
  Life: "#8b7bb5",
  Inspiration: "#c8a96e",
  Love: "#d96d8a",
};

export default function QuotesPage() {

  const [quotes, setQuotes] = useState([]);
  const [tags, setTags] = useState(["All"]);
  const [activeTag, setActiveTag] = useState("All");

  const [allQoutesLength, setAllQoutesLength] = useState();
  const [copied, setCopied] = useState(null);

  const [loading, setLoading] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);

  const page = 1;
  const [limit, setLimit] = useState(10);
  const [hasMore, setHasMore] = useState(true);

  const loaderRef = useRef(null);

  // ─── Fetch Tags ───────────────────────────────

  const fetchTags = async () => {
    try {

      const res = await GetTagsApi();
      const tagList = res?.data?.data?.data || [];
      const tagNames = tagList.map(t => t.title);

      setTags(["All", ...tagNames]);

    } catch (err) {
      console.log("Tag API error", err);
    }
  };

  // ─── Fetch Quotes ─────────────────────────────

  const fetchQuotes = async () => {

    setLoading(true);

    try {

      let res;

      if (activeTag === "All") {
        res = await GetAllQuotesApi(page, limit);
      } else {
        res = await GetQuotesByTagApi(activeTag, page, limit);
      }

      const AllQuotesLength = res?.data?.data?.total;
      setAllQoutesLength(AllQuotesLength);

      const quoteList = res?.data?.data?.data || [];

      setQuotes(quoteList);

      if (quoteList.length < limit) {
        setHasMore(false);
      }

    } catch (err) {
      console.log("Quote API error", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchTags();
  }, []);

  // ─── Tag Change Skeleton ─────────────────────

  useEffect(() => {

    setQuotes([]);
    setLimit(10);
    setHasMore(true);

    setShowSkeleton(true);

    const timer = setTimeout(() => {

      setShowSkeleton(false);
      fetchQuotes();

    }, 1000);

    return () => clearTimeout(timer);

  }, [activeTag]);

  // infinite scroll fetch
  useEffect(() => {

    if (!showSkeleton) {
      fetchQuotes();
    }

  }, [limit]);

  // ─── Infinite Scroll ─────────────────────────

  useEffect(() => {

    const observer = new IntersectionObserver(
      entries => {

        if (entries[0].isIntersecting && !loading && hasMore) {
          setLimit(prev => prev + 10);
        }

      },
      { threshold: 1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();

  }, [loading, hasMore]);

  // ─── Copy Quote ───────────────────────────────

  const handleCopy = (quote) => {

    const text = `"${quote.quote}" — ${quote.author}`;

    navigator.clipboard.writeText(text);

    setCopied(quote.id);

    setTimeout(() => setCopied(null), 2000);
  };

  const accent = tagAccents[activeTag] || "#c8a96e";

  return (
    <div className="quotes-page">

      <header className="quotes-header" style={{ "--accent": accent }}>
        <p className="quotes-header__eyebrow">A curated collection</p>

        <h1 className="quotes-header__title">
          Words that <br /> <em>move the soul</em>
        </h1>

        <div className="quotes-header__rule" />
      </header>

      <main className="quotes-main">

        {/* Tags */}

        <nav className="quotes-tags">
          <div className="quotes-tags__inner">

            {tags.map(tag => (
              <button
                key={tag}
                className={`tag-btn ${activeTag === tag ? "tag-btn--active" : ""}`}
                style={{ "--accent": tagAccents[tag] || "#c8a96e" }}
                onClick={() => setActiveTag(tag)}
              >
                {tag}
                {activeTag === tag && <span className="tag-btn__dot" />}
              </button>
            ))}

          </div>
        </nav>

        <hr className="quotes-divider" />

        {/* Count */}

        <div className="quotes-count">
          <span className="quotes-count__number">
            {activeTag === "All" ? allQoutesLength : quotes.length}
          </span>

          <span className="quotes-count__label">
            quote{quotes.length !== 1 ? "s" : ""}
            {activeTag !== "All" ? ` in ${activeTag}` : " in collection"}
          </span>
        </div>

        {/* Skeleton */}

        {showSkeleton && (
          <div className="quotes-grid">

            {Array.from({ length: 10 }).map((_, i) => (

              <div
                key={i}
                className={`quote-card quote-card--skeleton ${i % 4 === 0 ? "quote-card--tall" : ""}`}
              />

            ))}

          </div>
        )}

        {/* Quotes */}

        {!showSkeleton && (
          <div className="quotes-grid">

            {quotes.map((quote, i) => (

              <article
                key={quote.id}
                className={`quote-card ${i % 4 === 0 ? "quote-card--tall" : ""}`}
                style={{
                  "--accent": tagAccents[quote.tag] || "#c8a96e",
                  animationDelay: `${(i % 6) * 0.06}s`,
                }}
              >

                <p className="quote-text">
                  "{quote.quote}"
                </p>

                <footer className="quote-footer">

                  <div className="quote-meta">

                    <span className="quote-author">
                      — {quote.author}
                    </span>

                    <span className="quote-tag">
                      {quote.tag}
                    </span>

                  </div>

                  <button
                    className={`copy-btn ${copied === quote.id ? "copy-btn--copied" : ""}`}
                    onClick={() => handleCopy(quote)}
                  >

                    {copied === quote.id
                      ? <><IconCheck /> Copied</>
                      : <><IconCopy /> Copy</>
                    }

                  </button>

                </footer>

              </article>

            ))}

          </div>
        )}

        <div ref={loaderRef} style={{ height: "40px" }} />

      </main>

      {/* <footer className="quotes-footer">
        <p>Quotes that inspire · words that endure</p>
      </footer> */}

    </div>
  );
}
import { useState, useEffect } from "react";
import "./FeedPage.scss";

import ComposeBox from "./ComposeBox";
import FeedCard from "./FeedCard";

import { GetAllMyFeedApi } from "../../api/operations/feed.api";
import { GetAllGenreApi } from "../../api/operations/genre.api";

export default function FeedPage() {
  const [feeds, setfeeds] = useState([]);
  const [genres, setGenres] = useState({});
  const [loading, setLoading] = useState(true);

  const loadFeeds = async () => {
    try {
      const res = await GetAllMyFeedApi();
      setfeeds(res?.data?.data?.rows || []);
    } catch (err) {
      console.error("Feed fetch error", err);
    }
  };

  const loadGenres = async () => {
    try {
      const res = await GetAllGenreApi();
      const map = {};
      (res?.data?.data || []).forEach((g) => { map[g.id] = g.title; });
      setGenres(map);
    } catch (err) {
      console.error("Genre fetch error", err);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([loadFeeds(), loadGenres()]);
      setLoading(false);
    };
    load();
  }, []);

  const handlefeedCreated = (newfeed) => {
    setfeeds((prev) => [newfeed, ...prev]);
  };

  return (
    <div className="feed-page">
      {/* STICKY HEADER */}
      {/* <header className="feed-page__header">
        <div className="header-inner">
          <div className="header-wordmark">
            Read<span>·</span>Feed
          </div>
        </div>
      </header> */}

      <div className="feed-page__body">
        <main className="feed-page__main">
<div style={{marginTop:"20px"}}>

          <ComposeBox onfeedCreated={handlefeedCreated}  
               reloadFeeds={loadFeeds}  
               
               />
               </div>

          {loading && <p>Loading feeds…</p>}

          {!loading && feeds.length === 0 && (
            <div className="feed-page__empty">
              <div className="empty-icon">📭</div>
              <p>No feeds yet. Be the first to share something.</p>
            </div>
          )}

          {!loading && feeds.map((feed) => (
            <FeedCard
              key={feed.id}
              feed={feed}
              genreName={genres[feed.genre_id]}
               reloadFeeds={loadFeeds}  
            />
          ))}

        </main>
      </div>
    </div>
  );
}

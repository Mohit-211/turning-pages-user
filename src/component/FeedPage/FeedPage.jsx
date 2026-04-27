import { useState, useEffect } from "react";
import "./FeedPage.scss";

import ComposeBox from "./ComposeBox";
import FeedCard from "./FeedCard";

import { GetAllMyFeedApi } from "../../api/operations/feed.api";
import { GetAllGenreApi } from "../../api/operations/genre.api";
import EmptyState from "../EmptyState";

export default function FeedPage() {
  const [feeds, setFeeds] = useState([]);
  const [genres, setGenres] = useState({});
  const [loading, setLoading] = useState(true);

  const loadFeeds = async () => {
    try {
      const res = await GetAllMyFeedApi();
      setFeeds(res?.data?.data?.rows || []);
    } catch (err) {
      console.error("Feed fetch error", err);
    }
  };

  const loadGenres = async () => {
    try {
      const res = await GetAllGenreApi();
      const map = {};
      (res?.data?.data || []).forEach((g) => {
        map[g.id] = g.title;
      });
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

  return (
    <div className="feed-page">
      <div className="feed-page__body">
        <main className="feed-page__main">
          <ComposeBox reloadFeeds={loadFeeds} />

          {loading && <p>Loading feeds…</p>}

         {!loading && feeds.length === 0 && (
  <EmptyState
    icon={<div style={{ fontSize: "40px" }}>📭</div>}
    title="No feeds yet"
    description="Be the first to share something"
    // buttonText="Create post"
    onButtonClick={() => navigate("/create-post")} // update route if needed
  />
)}

          {!loading &&
            feeds.map((feed) => (
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

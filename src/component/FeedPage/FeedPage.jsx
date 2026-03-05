import { useState, useEffect } from "react";
import "./FeedPage.scss";

import ComposeBox from "./ComposeBox";
import FeedCard from "./FeedCard";

import { GetAllFeedApi } from "../../api/operations/feed.api";
import { GetAllGenreApi } from "../../api/operations/genre.api";

export default function FeedPage() {

  const [posts, setPosts] = useState([]);
  const [genres, setGenres] = useState({});
  const [loading, setLoading] = useState(true);

  // ───────────────
  // Load Feeds
  // ───────────────

  const loadFeeds = async () => {
    try {
      const res = await GetAllFeedApi();
      const data = res?.data?.data?.rows;

      setPosts(data || []);
    } catch (err) {
      console.error("Feed fetch error", err);
    }
  };

  // ───────────────
  // Load Genres
  // ───────────────

  const loadGenres = async () => {
    try {
      const res = await GetAllGenreApi();
      console.log(res,"res")
      const list = res?.data?.data || [];

      const map = {};

      list.forEach((g) => {
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

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };
console.log(genres,"genreName")
  return (
    <div className="feed-page">
      <div className="feed-page__body">

        <main className="feed-page__main">

          <ComposeBox onPostCreated={handlePostCreated} />

          {loading && <p>Loading posts...</p>}

          {!loading && posts?.map((post) => (
            <FeedCard
              key={post.id}
              post={post}
              genreName={genres[post.genre_id]}
            />
          ))}

        </main>

      </div>
    </div>
  );
}
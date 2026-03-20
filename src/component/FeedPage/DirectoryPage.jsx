import { useState, useEffect } from "react";
import "./DirectoryPage.scss";
import ComposeBox from "./ComposeBox";
import FeedCard from "./FeedCard";
import { GetAllFeedApi, GetAllFeedByGenreId } from "../../api/operations/feed.api";
import { GetAllDirectoryApi } from "../../api/operations/directory.api";

export default function DirectoryPage() {
  const [feeds, setFeeds] = useState([]);
  const [genres, setGenres] = useState({});
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null); // null = "All"
  const [loading, setLoading] = useState(true);
  const [feedsLoading, setFeedsLoading] = useState(false);

  // Load all feeds (no genre filter)
  const loadFeeds = async () => {
    try {
      const res = await GetAllFeedApi();
      setFeeds(res?.data?.data?.rows || []);
    } catch (err) {
      console.error("Feed fetch error", err);
    }
  };

  // Load feeds filtered by genre_id  →  feeds?page=1&limit=10&genre_id=<id>
  const loadFeedsByGenre = async (genreId) => {
    try {
      setFeedsLoading(true);
      const res = await GetAllFeedByGenreId(genreId);
      setFeeds(res?.data?.data?.rows || []);
    } catch (err) {
      console.error("Genre feed fetch error", err);
    } finally {
      setFeedsLoading(false);
    }
  };

  // Load sidebar groups via GetAllDirectoryApi
  // Response: { data: [ { genre_id, book_genre: { id, title } } ] }
  const loadJoinedGroups = async () => {
    try {
      const res = await GetAllDirectoryApi();
      const groups = res?.data?.data || [];
      setJoinedGroups(groups);

      // Build genres map from the same response — no separate genre API needed
      const map = {};
      groups.forEach((g) => {
        if (g.book_genre) map[g.book_genre.id] = g.book_genre.title;
      });
      setGenres(map);
    } catch (err) {
      console.error("Directory fetch error", err);
    }
  };

  // Initial load
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([loadFeeds(), loadJoinedGroups()]);
      setLoading(false);
    };
    load();
  }, []);

  // Re-fetch feeds whenever active group changes (skip on first mount)
  const handleGroupSelect = async (genreId) => {
    setActiveGroup(genreId);
    if (genreId === null) {
      await loadFeeds();
    } else {
      await loadFeedsByGenre(genreId);
    }
  };

  const handleFeedCreated = (newFeed) => {
    setFeeds((prev) => [newFeed, ...prev]);
  };

  // reloadFeeds respects the current active group
  const reloadFeeds = () => {
    if (activeGroup === null) return loadFeeds();
    return loadFeedsByGenre(activeGroup);
  };

  const activeGroupTitle =
    activeGroup === null
      ? "All Feeds"
      : joinedGroups.find((g) => g.genre_id === activeGroup)?.book_genre
          ?.title ?? "Feeds";

  const isLoading = loading || feedsLoading;

  return (
    <div className="directory-page">
      {/* SIDEBAR */}
      <aside className="directory-page__sidebar">
        <div className="sidebar__heading">My Groups</div>

        <button
          className={`sidebar__item ${activeGroup === null ? "sidebar__item--active" : ""}`}
          onClick={() => handleGroupSelect(null)}
        >
          <span className="sidebar__item-icon">🏠</span>
          <span className="sidebar__item-label">All Feeds</span>
        </button>

        {joinedGroups.map((group) => (
          <button
            key={group.genre_id}
            className={`sidebar__item ${activeGroup === group.genre_id ? "sidebar__item--active" : ""}`}
            onClick={() => handleGroupSelect(group.genre_id)}
          >
            {/* {group.genre_id} */}
            <span className="sidebar__item-icon">📚</span>
            <span className="sidebar__item-label">
              {group.book_genre?.title}
            </span>
          </button>
        ))}
      </aside>

      {/* MAIN CONTENT */}
      <div className="feed-page__body">
        <main className="feed-page__main">
          {/* Section title */}
          <div className="feed-page__section-title">
            <h2>{activeGroupTitle}</h2>
            {activeGroup !== null && (
              <span className="feed-page__feed-count">
                {feeds.length}{" "}
                {feeds.length === 1 ? "post" : "posts"}
              </span>
            )}
          </div>

          {/* <ComposeBox
            onfeedCreated={handleFeedCreated}
            reloadFeeds={reloadFeeds}
          /> */}

          {isLoading && <p>Loading feeds…</p>}

          {!isLoading && feeds.length === 0 && (
            <div className="feed-page__empty">
              <div className="empty-icon">📭</div>
              <p>
                {activeGroup === null
                  ? "No feeds yet. Be the first to share something."
                  : "No posts in this group yet."}
              </p>
            </div>
          )}

          {!isLoading &&
            feeds.map((feed) => (
              <FeedCard
                key={feed.id}
                feed={feed}
                genreName={genres[feed.genre_id]}
                reloadFeeds={reloadFeeds}
              />
            ))}
        </main>
      </div>
    </div>
  );
}
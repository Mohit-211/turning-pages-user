import { useState, useEffect } from "react";
import "./DirectoryPage.scss";
import ComposeBox from "./ComposeBox";
import FeedCard from "./FeedCard";
import { GetAllFeedApi, GetAllFeedByGenreId } from "../../api/operations/feed.api";
import { GetAllDirectoryApi } from "../../api/operations/directory.api";

export default function DirectoryPage() {
  const [feeds, setFeeds] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedsLoading, setFeedsLoading] = useState(false);

  const loadFeeds = async () => {
    try {
      const res = await GetAllFeedApi();
      setFeeds(res?.data?.data?.rows || []);
    } catch (err) {
      console.error("Feed fetch error", err);
    }
  };

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

  const loadJoinedGroups = async () => {
    try {
      const res = await GetAllDirectoryApi();
      setJoinedGroups(res?.data?.data || []);
    } catch (err) {
      console.error("Directory fetch error", err);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([loadFeeds(), loadJoinedGroups()]);
      setLoading(false);
    };
    load();
  }, []);

  const handleGroupSelect = async (genreId) => {
    setActiveGroup(genreId);
    if (genreId === null) {
      await loadFeeds();
    } else {
      await loadFeedsByGenre(genreId);
    }
  };

  const reloadFeeds = () => {
    if (activeGroup === null) return loadFeeds();
    return loadFeedsByGenre(activeGroup);
  };

  const activeGroupTitle = activeGroup === null 
    ? "All Feeds" 
    : joinedGroups.find((g) => g.genre_id === activeGroup)?.book_genre?.title ?? "Feeds";

  const isLoading = loading || feedsLoading;

  return (
    <div className="directory-page">
      {/* Sidebar */}
      <aside className="directory-page__sidebar">
        <div className="sidebar__heading">My Groups</div>

        <button
          className={`sidebar__item${activeGroup === null ? " sidebar__item--active" : ""}`}
          onClick={() => handleGroupSelect(null)}
        >
          <span className="sidebar__item-icon">🏠</span>
          <span className="sidebar__item-label">All Feeds</span>
        </button>

        {joinedGroups.map((group) => (
          <button
            key={group.genre_id}
            className={`sidebar__item${activeGroup === group.genre_id ? " sidebar__item--active" : ""}`}
            onClick={() => handleGroupSelect(group.genre_id)}
          >
            <span className="sidebar__item-icon">📚</span>
            <span className="sidebar__item-label">{group.book_genre?.title}</span>
          </button>
        ))}
      </aside>

      {/* Main Content */}
      <div className="feed-page__body">
        <ComposeBox reloadFeeds={reloadFeeds} />

        <main className="feed-page__main">
          <div className="feed-page__section-title">
            <h2>{activeGroupTitle}</h2>
            {activeGroup !== null && feeds.length > 0 && (
              <span className="feed-page__feed-count">
                {feeds.length} {feeds.length === 1 ? "post" : "posts"}
              </span>
            )}
          </div>

          {isLoading && <p className="loading-text">Loading feeds…</p>}

          {!isLoading && feeds.length === 0 && (
            <div className="feed-page__empty">
              <div className="empty-icon">📖</div>
              <p>
                {activeGroup === null
                  ? "No feeds yet. Be the first to share your writing journey."
                  : "No posts in this group yet. Start the conversation!"}
              </p>
            </div>
          )}

          {!isLoading &&
            feeds.map((feed) => (
              <FeedCard
                key={feed.id}
                feed={feed}
                genreName={joinedGroups.find(g => g.genre_id === feed.genre_id)?.book_genre?.title}
                reloadFeeds={reloadFeeds}
              />
            ))}
        </main>
      </div>
    </div>
  );
}
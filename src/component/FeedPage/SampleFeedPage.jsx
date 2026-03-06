import { useState, useEffect } from "react";
import "./SampleFeedPage.scss";

import ComposeBox from "./ComposeBox";

import { GetAllFeedApi } from "../../api/operations/feed.api";
import { GetAllGenreApi } from "../../api/operations/genre.api";
import SampleFeedCard from "./SampleFeedCard";

export default function SampleFeedPage() {

  const [posts, setPosts] = useState([]);
  const [genres, setGenres] = useState([]);

  // Fetch Feeds
  const loadFeeds = async () => {
    const res = await GetAllFeedApi();
    const data = res?.data?.data?.rows || [];
    setPosts(data);
  };

  // Fetch Genres
  const loadGenres = async () => {
    const res = await GetAllGenreApi();
    const data = res?.data?.data || [];
    setGenres(data);
  };

  useEffect(() => {
    loadFeeds();
    loadGenres();
  }, []);

  return (
    <main className="feed-page__main">

      <ComposeBox />

      {posts.map((post) => (
        <SampleFeedCard
          key={post.id}
          post={post}
          genres={genres}
        />
      ))}

    </main>
  );
}
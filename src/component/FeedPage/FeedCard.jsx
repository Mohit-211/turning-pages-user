import { useEffect, useState } from "react";
import "./FeedCard.scss";

import {
  CreateFeedCommentApi,
  ToggleFeedLikeApi,
  ReplayCommentOnFeedApi,
  GetAllFeedCommentApi,
} from "../../api/operations/feed.api";

import { UserProfileApi } from "../../api/users/users.api";

export default function FeedCard({ feed, genreName, reloadFeeds }) {
  const IMAGE_BASE = import.meta.env.VITE_BOOK_IMAGE_URL;

  const [showBox, setShowBox] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyBoxId, setReplyBoxId] = useState(null);
  const [loadingComment, setLoadingComment] = useState(false);
  const [loadingReply, setLoadingReply] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const formattedTime = new Date(feed.created_at).toLocaleString("en-US", {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  useEffect(() => {
    UserProfileApi()
      .then((res) => setUserProfile(res?.id))
      .catch(() => {});
  }, []);

  const loadComments = async () => {
    try {
      const res = await GetAllFeedCommentApi(feed.id);
      setComments(res?.data?.data || []);
    } catch {
      // silently ignore
    }
  };

  const handleToggleLike = async () => {
    try {
      setLoadingLike(true);
      await ToggleFeedLikeApi(feed.id);
      await reloadFeeds();
    } catch (err) {
      console.error("Like toggle error", err);
    } finally {
      setLoadingLike(false);
    }
  };

  const handleCreateComment = async () => {
    if (!commentText.trim()) return;
    try {
      setLoadingComment(true);
      await CreateFeedCommentApi({ feed_id: feed.id, content: commentText });
      setCommentText("");
      await loadComments();
    } catch (err) {
      console.error("Comment create error", err);
    } finally {
      setLoadingComment(false);
    }
  };

  const handleReply = async (parentId) => {
    if (!replyText.trim()) return;
    try {
      setLoadingReply(true);
      await ReplayCommentOnFeedApi({
        feed_id: feed.id,
        content: replyText,
        parent_id: parentId,
      });
      setReplyText("");
      setReplyBoxId(null);
      await loadComments();
    } catch (err) {
      console.error("Reply error", err);
    } finally {
      setLoadingReply(false);
    }
  };

  const isLiked = feed?.feed_likes?.some((like) => like.user_id === userProfile);

  return (
    <article className="feed-card">
      <div className="feed-card__inner">
        <div className="feed-card__header">
          <div className="feed-card__author-row">
            <div className="feed-card__avatar">
              {feed?.feed_user?.user_profile?.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <span className="feed-card__author-name">
                {feed?.feed_user?.user_profile?.name}
              </span>
              <p className="feed-card__time">{formattedTime}</p>
            </div>
          </div>
          {genreName && (
            <span className={`feed-card__role-pill genre-${feed.genre_id}`}>
              {genreName}
            </span>
          )}
        </div>

        {feed.title && <h3 className="feed-card__title">{feed.title}</h3>}
        <p className="feed-card__body">{feed.content}</p>
      </div>

      {feed.img_uri && (
        <div className="feed-card__image">
          <img src={`${IMAGE_BASE}${feed.img_uri}`} alt="feed visual" />
        </div>
      )}

      <div className="feed-card__actions">
        <button
          onClick={handleToggleLike}
          disabled={loadingLike}
          className={`feed-card__like-btn${isLiked ? " feed-card__like-btn--liked" : ""}`}
        >
          <span>{isLiked ? "❤️" : "🤍"}</span>
          <span className="feed-card__action-count">
            {feed?.feed_likes?.length || 0}
          </span>
        </button>

        <button
          className="feed-card__comment-btn"
          onClick={() => {
            setShowBox((prev) => {
              const next = !prev;
              if (next) loadComments();
              return next;
            });
          }}
        >
          <span>💬</span>
          <span className="feed-card__action-count">{feed?.comment_count}</span>
        </button>
      </div>

      {showBox && (
        <div className="feed-card__comments">
          {comments.map((comment) => (
            <div key={comment.id} className="feed-card__comment">
              <div className="feed-card__comment-avatar">
                {comment?.feed_comment_user?.user_profile?.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="feed-card__comment-content">
                <p className="feed-card__comment-text">{comment.content}</p>
                <span className="feed-card__comment-time">
                  {new Date(comment.created_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
                <button
                  className="feed-card__reply-btn"
                  onClick={() =>
                    setReplyBoxId(replyBoxId === comment.id ? null : comment.id)
                  }
                >
                  ↩ Reply
                </button>

                {comment.replies?.map((reply) => (
                  <div key={reply.id} className="feed-card__reply">
                    <div className="feed-card__comment-avatar">
                      {reply?.user_profile?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p>{reply.content}</p>
                      <span>
                        {new Date(reply.created_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                ))}

                {replyBoxId === comment.id && (
                  <div className="feed-card__reply-box">
                    <input
                      placeholder="Write a reply…"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleReply(comment.id);
                      }}
                    />
                    <button
                      onClick={() => handleReply(comment.id)}
                      disabled={loadingReply}
                    >
                      {loadingReply ? "..." : "Reply"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="feed-card__comment-box">
            <div className="feed-card__comment-avatar">
              {feed?.feed_user?.user_profile?.name?.[0]?.toUpperCase() || "?"}
            </div>
            <input
              className="feed-card__comment-input"
              placeholder="Add a comment…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateComment();
              }}
            />
            <button
              className="feed-card__comment-send"
              onClick={handleCreateComment}
              disabled={loadingComment}
            >
              {loadingComment ? "..." : "Post"}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

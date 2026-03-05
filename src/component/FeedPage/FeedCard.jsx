import { useState } from "react";
import "./FeedCard.scss";
import TypeBadge from "./TypeBadge";

import {
  CreateFeedCommentApi,
  ToggleFeedLikeApi,
  ReplayCommentOnFeedApi,
} from "../../api/operations/feed.api";

export default function FeedCard({ post ,genreName}) {
  console.log(genreName,"genreName")
  const IMAGE_BASE = import.meta.env.VITE_BOOK_IMAGE_URL;

  const [liked, setLiked] = useState(post.is_liked || false);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);

  const [showBox, setShowBox] = useState(false);
  const [comments, setComments] = useState(post.replies || []);
  const [commentText, setCommentText] = useState("");

  const [replyText, setReplyText] = useState("");
  const [replyBoxId, setReplyBoxId] = useState(null);

  const [loadingComment, setLoadingComment] = useState(false);
  const [loadingReply, setLoadingReply] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);

  const formattedTime = new Date(post.created_at).toLocaleString();

  // ─────────────────────────────
  // TOGGLE LIKE
  // ─────────────────────────────

  const handleToggleLike = async () => {
    try {
      setLoadingLike(true);

      await ToggleFeedLikeApi(post.id);

      setLiked(!liked);

      if (liked) {
        setLikeCount((prev) => prev - 1);
      } else {
        setLikeCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Like toggle error", err);
    } finally {
      setLoadingLike(false);
    }
  };

  // ─────────────────────────────
  // CREATE COMMENT
  // ─────────────────────────────

  const handleCreateComment = async () => {
    if (!commentText.trim()) return;

    try {
      setLoadingComment(true);

      const payload = {
        feed_id: post.id,
        content: commentText,
      };

      const res = await CreateFeedCommentApi(payload);

      const newComment = res?.data?.data;

      setComments((prev) => [...prev, newComment]);

      setCommentText("");
    } catch (err) {
      console.error("Comment create error", err);
    } finally {
      setLoadingComment(false);
    }
  };

  // ─────────────────────────────
  // REPLY COMMENT
  // ─────────────────────────────

  const handleReply = async (parentId) => {
    console.log(parentId,"parentId")
    if (!replyText.trim()) return;

    try {
      setLoadingReply(true);

      const payload = {
        feed_id: post.id,
        content: replyText,
        parent_id: parentId,
      };

      const res = await ReplayCommentOnFeedApi(payload);

      const newReply = res?.data?.data;

      setComments((prev) =>
        prev.map((c) => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), newReply],
            };
          }
          return c;
        })
      );

      setReplyText("");
      setReplyBoxId(null);
    } catch (err) {
      console.error("Reply error", err);
    } finally {
      setLoadingReply(false);
    }
  };

  return (
    <article className="feed-card">
      {/* HEADER */}
      <div className="feed-card__header">
        <div className="feed-card__author-row">
          <div className="feed-card__avatar">{post.user_id}</div>

          <div>
            <div>
              <span className="feed-card__author-name">
                User {post.user_id}
              </span>

        
            </div>

            <p className="feed-card__time">{formattedTime}</p>
          </div>
        </div>
      <span className={`feed-card__role-pill genre-${post.genre_id}`}>
  {genreName}
</span>
        {/* <TypeBadge type="post" /> */}
      </div>

      {/* TITLE */}
      {post.title && (
        <h3 className="feed-card__title">{post.title}</h3>
      )}

      {/* BODY */}
      <p className="feed-card__body">{post.content}</p>

      {/* IMAGE */}
      {post.img_uri && (
        <div className="feed-card__image">
          <img
            src={`${IMAGE_BASE}${post.img_uri}`}
            alt="feed"
            className="images"
          />
        </div>
      )}

      {/* ACTIONS */}
      <div className="feed-card__actions">
        <button
          onClick={handleToggleLike}
          disabled={loadingLike}
          className={`feed-card__like-btn ${
            liked ? "feed-card__like-btn--liked" : ""
          }`}
        >
          <span>{liked ? "❤️" : "🤍"}</span>
          <span className="feed-card__action-count">{likeCount}</span>
        </button>

        <button
          className="feed-card__comment-btn"
          onClick={() => setShowBox((v) => !v)}
        >
          <span>💬</span>
          <span className="feed-card__action-count">
            {comments.length}
          </span>
        </button>
      </div>

      {/* COMMENTS */}
      {showBox && (
        <div className="feed-card__comments">
          {comments?.map((comment) => (
            <div key={comment.id} className="feed-card__comment">

              {/* COMMENT */}
              <div className="feed-card__comment-avatar">
                {comment.user_id}
              </div>

              <div className="feed-card__comment-content">
                <p className="feed-card__comment-text">
                  {comment.content}
                </p>

                <span className="feed-card__comment-time">
                  {new Date(comment.created_at).toLocaleString()}
                </span>

                <button
                  className="feed-card__reply-btn"
                  onClick={() =>
                    setReplyBoxId(
                      replyBoxId === comment.id ? null : comment.id
                    )
                  }
                >
                  Reply
                </button>

                {/* REPLIES */}
                {comment.replies?.map((reply) => (
                  <div
                    key={reply.id}
                    className="feed-card__reply"
                  >
                    <div className="feed-card__comment-avatar">
                      {reply.user_id}
                    </div>

                    <div>
                      <p>{reply.content}</p>
                      <span>
                        {new Date(reply.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}

                {/* REPLY BOX */}
                {replyBoxId === comment.id && (
                  <div className="feed-card__reply-box">
                    <input
                      placeholder="Write reply..."
                      value={replyText}
                      onChange={(e) =>
                        setReplyText(e.target.value)
                      }
                    />

                    <button
                      onClick={() =>
                        handleReply(comment.id)
                      }
                      disabled={loadingReply}
                    >
                      {loadingReply ? "..." : "Reply"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* ADD COMMENT */}
          <div className="feed-card__comment-box">
            <div className="feed-card__comment-avatar">Y</div>

            <input
              className="feed-card__comment-input"
              placeholder="Add a comment…"
              value={commentText}
              onChange={(e) =>
                setCommentText(e.target.value)
              }
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
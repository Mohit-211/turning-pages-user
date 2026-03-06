import { useState } from "react";
import "./SampleFeedCard.scss";
import TypeBadge from "./TypeBadge";
import CoverPreview from "./CoverPreview";
import BookProgress from "./BookProgress";

import {
  CreateFeedCommentApi,
  ToggleFeedLikeApi,
  ReplayCommentOnFeedApi,
} from "../../api/operations/feed.api";

export default function SampleFeedCard({ post }) {
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

  // LIKE
  const toggleLike = async () => {
    try {
      setLoadingLike(true);

      await ToggleFeedLikeApi(post.id);

      setLiked(!liked);
      setLikeCount((c) => (liked ? c - 1 : c + 1));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLike(false);
    }
  };

  // CREATE COMMENT
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
      console.error(err);
    } finally {
      setLoadingComment(false);
    }
  };

  // REPLY COMMENT
  const handleReply = async (parentId) => {
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
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...(c.replies || []), newReply] }
            : c
        )
      );

      setReplyText("");
      setReplyBoxId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReply(false);
    }
  };
  console.log(post, "post==")
  return (
    <article
      className={`feed-card ${post.isAnnouncement ? "feed-card--announcement" : ""
        }`}
    >
      {/* HEADER */}
      <div className="feed-card__header">
        <div className="feed-card__author-row">
          <div
            className="feed-card__avatar"
            style={{
              background: `${post.avatarColor}18`,
              border: `2px solid ${post.avatarColor}40`,
              color: post.avatarColor,
            }}
          >
            {post.avatar}
          </div>

          <div>
            <div>
              <span className="feed-card__author-name">{post.author}</span>

              <span
                className="feed-card__role-pill"
                style={{
                  background: `${post.avatarColor}15`,
                  color: post.avatarColor,
                }}
              >
                {post.title}
              </span>
            </div>

            <p className="feed-card__time">{formattedTime}</p>
          </div>
        </div>

        <TypeBadge type={post.type} />
      </div>

      {/* BODY */}
      <p className="feed-card__body">{post.content}</p>

      {post.hasCoverPreview && (
        <CoverPreview
          colorClass={post.coverColor}
          title={post.bookTitle}
        />
      )}

      {post.progress && post.bookTitle && !post.hasCoverPreview && (
        <BookProgress
          title={post.bookTitle}
          progress={post.progress}
          from={post.progressFrom}
          to={post.progressTo}
        />
      )}

      {/* ACTIONS */}
      <div className="feed-card__actions">
        <button
          onClick={toggleLike}
          disabled={loadingLike}
          className={`feed-card__like-btn ${liked ? "feed-card__like-btn--liked" : ""
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

        <button className="feed-card__share-btn">
          <span>↗</span>
          <span>Share</span>
        </button>
      </div>

      {/* COMMENTS */}
      {showBox && (
        <div className="feed-card__comments">
          {comments?.map((comment) => (
            <div key={comment.id} className="feed-card__comment">
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
                  <div key={reply.id} className="feed-card__reply">
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
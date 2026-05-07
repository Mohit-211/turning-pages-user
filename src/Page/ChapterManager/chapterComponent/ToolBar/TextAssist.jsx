import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Sparkles,
  Send,
  Copy,
  CheckCheck,
  RefreshCw,
  PenLine,
  X,
  TextSelect,
  ChevronDown,
  MessageSquare,
  SquarePen,
} from "lucide-react";
import { message, Tooltip } from "antd";
import { GetAssistantChatMessagesApi, GetAssistantConversationListApi, SendAssistantChatApi } from "../../../../api/operations/assistent.api";


// ─── Quick Action Chips ───────────────────────────────────────
const CHIPS = [
  { label: "Improve writing",      prompt: "Improve the writing of this text" },
  { label: "Make shorter",         prompt: "Make this text shorter and more concise" },
  { label: "Make longer",          prompt: "Expand this text with more detail" },
  { label: "Fix grammar",          prompt: "Fix the grammar and punctuation" },
  { label: "Rephrase",             prompt: "Rephrase this text differently" },
  { label: "Suggest alternatives", prompt: "Suggest 3 alternative versions of this text" },
];

// ─── Single Message Bubble ────────────────────────────────────
function MessageBubble({ msg, onCopy, onInsert, onRetry, copiedId }) {
  const isUser = msg.role === "user";

  return (
    <div className={`ta-msg ${isUser ? "ta-msg--user" : ""}`}>
      {!isUser && (
        <div className="ta-avatar ta-avatar--ai" aria-hidden="true">
          <Sparkles size={12} />
        </div>
      )}

      <div className="ta-bubble-wrap">
        <div className={`ta-bubble ${isUser ? "ta-bubble--user" : "ta-bubble--ai"}`}>
          {msg.typing ? (
            <span className="ta-typing-dots">
              <span /><span /><span />
            </span>
          ) : (
            <span dangerouslySetInnerHTML={{ __html: msg.content }} />
          )}
        </div>

        {!isUser && !msg.typing && (
          <div className="ta-bubble-actions">
            <Tooltip title={copiedId === msg.id ? "Copied!" : "Copy"} placement="top">
              <button className="ta-bubble-btn" onClick={() => onCopy(msg)}>
                {copiedId === msg.id ? <CheckCheck size={11} /> : <Copy size={11} />}
                {copiedId === msg.id ? "Copied" : "Copy"}
              </button>
            </Tooltip>
            <Tooltip title="Insert into editor" placement="top">
              {/* <button className="ta-bubble-btn ta-bubble-btn--primary" onClick={() => onInsert(msg)}>
                <PenLine size={11} /> Insert
              </button> */}
            </Tooltip>
            <Tooltip title="Retry" placement="top">
              <button className="ta-bubble-btn" onClick={() => onRetry(msg)}>
                <RefreshCw size={11} />
              </button>
            </Tooltip>
          </div>
        )}
      </div>

      {isUser && (
        <div className="ta-avatar ta-avatar--user" aria-hidden="true">U</div>
      )}
    </div>
  );
}

// ─── Normalise a raw API message → internal shape ────────────
function normaliseMsg(raw) {
  return {
    id:      String(raw.id ?? raw._id ?? Date.now()),
    role:    raw.role === "user" ? "user" : "assistant",
    content: (raw.content ?? raw.message ?? "").replace(/\n/g, "<br>"),
  };
}

// ─── Main Component ───────────────────────────────────────────
export default function TextAssist({
  selectedText = "",
  onClearSelection,
  onInsertContent,
}) {
  const [messages,        setMessages]        = useState([]);
  const [input,           setInput]           = useState("");
  const [loading,         setLoading]         = useState(false);
  const [copiedId,        setCopiedId]        = useState(null);
  // Conversation state
  const [conversationId,  setConversationId]  = useState(null);
  const [convList,        setConvList]        = useState([]);
  const [convListOpen,    setConvListOpen]    = useState(false);
  const [convListLoading, setConvListLoading] = useState(false);
  const [historyLoading,  setHistoryLoading]  = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [input]);

  /* ── New Chat ─────────────────────────────────────────────── */
  const startNewChat = () => {
    setMessages([]);
    setConversationId(null);
    setConvListOpen(false);
    setInput("");
    textareaRef.current?.focus();
  };

  /* ── Load conversation list ───────────────────────────────── */
  const loadConversationList = useCallback(async () => {
    setConvListLoading(true);
    try {
      const res  = await GetAssistantConversationListApi();
      const list = res?.data?.data ?? res?.data ?? [];
      setConvList(Array.isArray(list) ? list : []);
    } catch {
      message.error("Failed to load conversations");
    } finally {
      setConvListLoading(false);
    }
  }, []);

  /* ── Load messages for a conversation ────────────────────── */
  const loadConversationMessages = useCallback(async (convId) => {
    setHistoryLoading(true);
    setConvListOpen(false);
    try {
      const res  = await GetAssistantChatMessagesApi(convId);
      const msgs = res?.data?.data ?? res?.data ?? [];
      const normalised = Array.isArray(msgs) ? msgs.map(normaliseMsg) : [];
      setMessages(normalised);
      setConversationId(convId);
    } catch {
      message.error("Failed to load conversation history");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  /* ── Send Message ─────────────────────────────────────────── */
  const sendMessage = useCallback(
    async (text = input) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      // Optimistic user bubble
      const userMsg = {
        id:      Date.now().toString(),
        role:    "user",
        content: trimmed,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      // Include selected text as context if present
      const fullPrompt = selectedText
        ? `Selected text:\n"${selectedText}"\n\nInstruction: ${trimmed}`
        : trimmed;

      // Optimistic AI typing bubble
      const aiMsgId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        { id: aiMsgId, role: "assistant", content: "", typing: true },
      ]);

      try {
        const payload = {
          message: fullPrompt,
          ...(conversationId ? { conversation_id: conversationId } : {}),
        };

        const res  = await SendAssistantChatApi(payload);
        const data = res?.data?.data ?? res?.data ?? {};

        // Persist the conversation_id returned by the first message
        if (!conversationId && data.conversation_id) {
          setConversationId(data.conversation_id);
        }

        const replyContent = (
          data.reply ?? data.message ?? data.content ?? ""
        ).replace(/\n/g, "<br>");

        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? { ...m, content: replyContent, typing: false }
              : m
          )
        );
      } catch {
        message.error("Text Assist request failed");
        setMessages((prev) => prev.filter((m) => m.id !== aiMsgId));
      } finally {
        setLoading(false);
      }
    },
    [input, loading, selectedText, conversationId]
  );

  const handleCopy = useCallback(async (msg) => {
    const plain = msg.content.replace(/<br>/g, "\n").replace(/<[^>]+>/g, "");
    await navigator.clipboard.writeText(plain);
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleInsert = useCallback(
    (msg) => {
      onInsertContent?.(msg.content);
      message.success("Inserted into editor");
    },
    [onInsertContent]
  );

  const handleRetry = useCallback(
    (msg) => {
      setMessages((prev) => {
        const idx     = prev.findIndex((m) => m.id === msg.id);
        const userMsg = idx > 0 ? prev[idx - 1] : null;
        const sliced  = prev.slice(0, idx);
        if (userMsg) setTimeout(() => sendMessage(userMsg.content), 0);
        return sliced;
      });
    },
    [sendMessage]
  );

  const toggleConvList = () => {
    if (!convListOpen) loadConversationList();
    setConvListOpen((v) => !v);
  };

  return (
    <>
      <style>{`
        .ta-root {
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 0;
          position: relative;
        }

        /* ── Chips ── */
        .ta-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          padding: 8px 12px;
          border-bottom: 1px solid var(--border-color, #e8e8e8);
          flex-shrink: 0;
        }
        .ta-chip {
          font-size: 11px;
          padding: 3px 9px;
          border-radius: 20px;
          border: 1px solid var(--border-color, #e0e0e0);
          background: transparent;
          color: var(--text-secondary, #666);
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
        }
        .ta-chip:hover {
          background: var(--hover-bg, #f5f5f5);
          color: var(--text-primary, #1a1a1a);
        }

        /* ── Conversation history bar ── */
        .ta-conv-bar {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 12px;
          border-bottom: 1px solid var(--border-color, #e8e8e8);
          flex-shrink: 0;
          position: relative;
        }
        .ta-conv-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: var(--text-secondary, #666);
          background: none;
          border: 1px solid var(--border-color, #e0e0e0);
          border-radius: 6px;
          padding: 3px 8px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .ta-conv-btn:hover { background: var(--hover-bg, #f5f5f5); }

        .ta-new-chat-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 500;
          color: #fff;
          background: #e5283c;
          border: none;
          border-radius: 6px;
          padding: 4px 10px;
          cursor: pointer;
          margin-left: auto;
          white-space: nowrap;
          transition: opacity 0.15s;
        }
        .ta-new-chat-btn:hover { opacity: 0.85; }

        .ta-conv-id {
          font-size: 11px;
          color: #bbb;
          max-width: 90px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .ta-conv-dropdown {
          position: absolute;
          top: calc(100% + 2px);
          left: 12px;
          right: 12px;
          background: #fff;
          border: 1px solid var(--border-color, #e0e0e0);
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
          z-index: 50;
          max-height: 220px;
          overflow-y: auto;
        }
        .ta-conv-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          font-size: 12px;
          cursor: pointer;
          color: var(--text-primary, #1a1a1a);
          border-bottom: 1px solid var(--border-color, #f0f0f0);
          transition: background 0.12s;
        }
        .ta-conv-item:last-child { border-bottom: none; }
        .ta-conv-item:hover { background: #f9f9f9; }
        .ta-conv-item--active { background: #fff1f2; color: #e5283c; }
        .ta-conv-item__title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ta-conv-item__date { font-size: 11px; color: #bbb; flex-shrink: 0; }
        .ta-conv-empty { padding: 14px 12px; font-size: 12px; color: #bbb; text-align: center; }
        .ta-conv-loading { padding: 14px 12px; font-size: 12px; color: #bbb; text-align: center; }

        /* ── Context bar ── */
        .ta-context-bar {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #fff7ed;
          border-bottom: 1px solid #fed7aa;
          font-size: 12px;
          color: #92400e;
          flex-shrink: 0;
        }
        .ta-context-bar__text {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-style: italic;
        }
        .ta-context-clear {
          background: none;
          border: none;
          cursor: pointer;
          color: #92400e;
          display: flex;
          padding: 2px;
          border-radius: 4px;
          flex-shrink: 0;
        }
        .ta-context-clear:hover { background: #fed7aa; }

        /* ── Messages ── */
        .ta-messages {
          flex: 1;
          overflow-y: auto;
          padding: 14px 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-height: 0;
        }
        .ta-history-loading {
          text-align: center;
          font-size: 12px;
          color: #bbb;
          padding: 20px 0;
        }

        .ta-msg { display: flex; gap: 7px; align-items: flex-start; }
        .ta-msg--user { flex-direction: row-reverse; }

        .ta-avatar {
          width: 24px; height: 24px; border-radius: 50%;
          flex-shrink: 0; display: flex; align-items: center;
          justify-content: center; font-size: 10px; font-weight: 600; margin-top: 2px;
        }
        .ta-avatar--ai   { background: #e5283c; color: #fff; }
        .ta-avatar--user { background: #dbeafe; color: #1d4ed8; }

        .ta-bubble-wrap { display: flex; flex-direction: column; gap: 4px; max-width: 84%; }

        .ta-bubble {
          padding: 8px 12px; border-radius: 14px;
          font-size: 13px; line-height: 1.55; word-break: break-word;
        }
        .ta-bubble--ai {
          background: var(--bubble-ai-bg, #f5f5f5);
          color: var(--text-primary, #1a1a1a);
          border: 1px solid var(--border-color, #e8e8e8);
          border-top-left-radius: 4px;
        }
        .ta-bubble--user { background: #e5283c; color: #fff; border-bottom-right-radius: 4px; }

        .ta-bubble-actions { display: flex; gap: 4px; flex-wrap: wrap; }
        .ta-bubble-btn {
          font-size: 11px; padding: 3px 7px; border-radius: 5px;
          border: 1px solid var(--border-color, #e0e0e0); background: transparent;
          color: var(--text-secondary, #666); cursor: pointer;
          display: flex; align-items: center; gap: 3px; transition: background 0.15s;
        }
        .ta-bubble-btn:hover { background: var(--hover-bg, #f0f0f0); }
        .ta-bubble-btn--primary { border-color: #e5283c; color: #e5283c; }
        .ta-bubble-btn--primary:hover { background: #fff1f2; }

        .ta-typing-dots { display: inline-flex; gap: 3px; align-items: center; height: 16px; }
        .ta-typing-dots span {
          display: block; width: 6px; height: 6px; border-radius: 50%;
          background: #aaa; animation: ta-blink 1.2s infinite;
        }
        .ta-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .ta-typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes ta-blink { 0%,80%,100%{opacity:0.3} 40%{opacity:1} }

        /* ── Composer ── */
        .ta-composer {
          border-top: 1px solid var(--border-color, #e8e8e8);
          padding: 8px 10px; display: flex; flex-direction: column; gap: 6px; flex-shrink: 0;
        }
        .ta-composer-row { display: flex; gap: 6px; align-items: flex-end; }
        .ta-textarea {
          flex: 1; resize: none;
          border: 1px solid var(--border-color, #e0e0e0); border-radius: 10px;
          padding: 7px 11px; font-size: 13px; line-height: 1.5;
          outline: none; min-height: 36px; max-height: 120px; font-family: inherit;
          background: var(--input-bg, #fafafa); color: var(--text-primary, #1a1a1a);
          transition: border-color 0.15s;
        }
        .ta-textarea:focus { border-color: #e5283c; }
        .ta-textarea::placeholder { color: #aaa; }
        .ta-textarea:disabled { opacity: 0.6; }
        .ta-send-btn {
          width: 34px; height: 34px; border-radius: 50%;
          background: #e5283c; border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0; color: #fff;
          transition: opacity 0.15s, transform 0.1s;
        }
        .ta-send-btn:hover:not(:disabled) { opacity: 0.85; transform: scale(1.05); }
        .ta-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .ta-composer-footer { display: flex; align-items: center; }
        .ta-composer-hint { font-size: 11px; color: #bbb; }
      `}</style>

      <div className="ta-root">
        {/* <div className="ta-chips">
          {CHIPS.map((chip) => (
            <button
              key={chip.label}
              className="ta-chip"
              onClick={() => { setInput(chip.prompt); textareaRef.current?.focus(); }}
            >
              {chip.label}
            </button>
          ))}
        </div> */}

        <div className="ta-conv-bar">
          <Tooltip title="Browse past conversations" placement="top">
            <button className="ta-conv-btn" onClick={toggleConvList}>
              <MessageSquare size={12} />
              History
              <ChevronDown size={11} style={{ transform: convListOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
            </button>
          </Tooltip>

          {/* {conversationId && (
            <span className="ta-conv-id" title={conversationId}>
              #{String(conversationId).slice(-8)}
            </span>
          )} */}

          <Tooltip title="Start a new chat" placement="top">
            <button className="ta-new-chat-btn" onClick={startNewChat}>
              <SquarePen size={12} />
              New Chat
            </button>
          </Tooltip>

          {/* Dropdown */}
          {convListOpen && (
            <div className="ta-conv-dropdown">
              {convListLoading ? (
                <div className="ta-conv-loading">Loading…</div>
              ) : convList.length === 0 ? (
                <div className="ta-conv-empty">No conversations yet</div>
              ) : (
                convList.map((conv) => {
                  const id    = conv.id ?? conv._id ?? conv.conversation_id;
                  const title = conv.title ?? conv.name ?? `Conversation ${String(id).slice(-6)}`;
                  const date  = conv.updated_at ?? conv.created_at;
                  return (
                    <div
                      key={id}
                      className={`ta-conv-item ${conversationId === id ? "ta-conv-item--active" : ""}`}
                      onClick={() => loadConversationMessages(id)}
                    >
                      <MessageSquare size={12} />
                      <span className="ta-conv-item__title">{title}</span>
                      {date && (
                        <span className="ta-conv-item__date">
                          {new Date(date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
          
        </div>

        {/* Selected text context bar */}
        {selectedText && (
          <div className="ta-context-bar">
            <TextSelect size={13} />
            <span className="ta-context-bar__text">"{selectedText}"</span>
            <button className="ta-context-clear" onClick={onClearSelection} aria-label="Clear selection">
              <X size={12} />
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="ta-messages">
          {historyLoading ? (
            <div className="ta-history-loading">Loading conversation…</div>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                onCopy={handleCopy}
                onInsert={handleInsert}
                onRetry={handleRetry}
                copiedId={copiedId}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        <div className="ta-composer">
          <div className="ta-composer-row">
            <textarea
              ref={textareaRef}
              className="ta-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedText ? "What should I do with this text?" : "Ask anything about your text…"}
              rows={1}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
              }}
            />
            <Tooltip title={loading ? "Sending…" : "Send (Enter)"} placement="top">
              <button
                className="ta-send-btn"
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                aria-label="Send message"
              >
                {loading
                  ? <span className="ta-typing-dots" style={{ transform: "scale(0.75)" }}><span /><span /><span /></span>
                  : <Send size={14} />
                }
              </button>
            </Tooltip>
          </div>
          <div className="ta-composer-footer">
            <span className="ta-composer-hint">Enter to send · Shift+Enter for newline</span>
          </div>
        </div>
      </div>
    </>
  );
}
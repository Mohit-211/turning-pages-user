import { useEffect, useState, useRef, useCallback } from "react";
import { Modal, Form, Input, Button, Select, message } from "antd";
import {
  CreateSupportApi,
  GetAllSupportApi,
  GetSupportByIdApi,
  ReplySupportApi,
} from "../../api/operations/support.api";
import "./Support.scss";

// ─── Icons ────────────────────────────────────────────────────────────────────
const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const TicketIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v14" />
  </svg>
);
const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const AgentIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const PRIORITIES = ["low", "medium", "high", "urgent"];

// ─── Badge ────────────────────────────────────────────────────────────────────
// function Badge({ value }) {
//   const cls = value?.replace(/\s+/g, "-").toLowerCase();
//   return (
//     <span className="badge badge">
//       {/* <span className="badge__dot" /> */}
//       {value === "in-progress" ? "In Progress" : value?.charAt(0).toUpperCase() + value?.slice(1)}
//     </span>
//   );
// }

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ width = "100%", height = 16, radius = 6 }) {
  return <div className="skeleton" style={{ width, height, borderRadius: radius }} />;
}

// ─── New Ticket Modal (Ant Design) ────────────────────────────────────────────
function NewTicketModal({ open, onClose, onCreated }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Reset form whenever modal opens
  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await CreateSupportApi({
        subject: values.subject.trim(),
        description: values.description.trim(),
        priority: values.priority,
      });
      message.success("Ticket created successfully!");
      await onCreated();
      onClose();
    } catch (err) {
      // Ant Design form validation errors are handled inline — no extra handling needed
      if (err?.errorFields) return; // validation error, don't log
      console.error("Create ticket error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div className="modal-antd-title">
          <div className="modal__header-icon"><TicketIcon /></div>
          <span>New Support Ticket</span>
        </div>
      }
      footer={[
        <Button key="cancel" onClick={onClose} disabled={loading} className="btn-cancel">
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleOk}
          className="btn-submit"
          style={{ background: "linear-gradient(135deg,#174f78,#ed1c24)", border: "none" }}
        >
          Create Ticket
        </Button>,
      ]}
      width={480}
      centered
      destroyOnClose
      maskClosable={!loading}
      closable={!loading}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ priority: "low" }}
        className="ticket-form"
      >
        <Form.Item
          label={<span className="form-label">Subject</span>}
          name="subject"
          rules={[{ required: true, message: "Subject is required." }]}
        >
          <Input
            className="form-input"
            placeholder="e.g. Payment not processing"
            autoFocus
          />
        </Form.Item>

        <Form.Item
          label={<span className="form-label">Describe your issue</span>}
          name="description"
          rules={[{ required: true, message: "Please describe your issue." }]}
        >
          <Input.TextArea
            className="form-input"
            placeholder="Please describe the issue in detail…"
            rows={4}
            style={{ resize: "vertical" }}
          />
        </Form.Item>

        <Form.Item
          label={<span className="form-label">Priority</span>}
          name="priority"
        >
          <div className="priority-selector">
            {/* Use Form.Item watch pattern to keep priority in sync */}
            <Form.Item name="priority" noStyle>
              <PrioritySelector />
            </Form.Item>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}

// ─── Priority Selector (controlled, works inside Form.Item) ──────────────────
function PrioritySelector({ value, onChange }) {
  return (
    <div className="priority-selector">
      {PRIORITIES.map((p) => (
        <button
          key={p}
          type="button"
          className={`priority-btn priority-btn--${p}${value === p ? " active" : ""}`}
          onClick={() => onChange?.(p)}
        >
          {p.charAt(0).toUpperCase() + p.slice(1)}
        </button>
      ))}
    </div>
  );
}

// ─── Chat Bubble ──────────────────────────────────────────────────────────────
function ChatBubble({ msg, isUser }) {
  const time = msg.created_at
    ? new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";
  console.log(isUser, "isUser")
  console.log(msg, "msg")
  return (
    <div className={`chat-bubble chat-bubble--${isUser ? "user" : "admin"}`}>
      {isUser
        ? <div className="chat-bubble__user-avatar">Me</div>
        : <div className="chat-bubble__avatar"><AgentIcon /></div>
      }
      <div className={`chat-bubble__content chat-bubble__content--${isUser ? "user" : "admin"}`}>
        <div className={`chat-bubble__text chat-bubble__text--${isUser ? "user" : "admin"}`}>
          {msg.message || msg.description}
        </div>
        {time && <span className="chat-bubble__time">{time}</span>}
      </div>
    </div>
  );
}

// ─── Ticket Chat ──────────────────────────────────────────────────────────────
function TicketChat({ ticket, onBack }) {
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingTicket, setLoadingTicket] = useState(true);
  const [ticketDetail, setTicketDetail] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const loadTicket = useCallback(async () => {
    try {
      const res = await GetSupportByIdApi(ticket.id);
      const data = res?.data?.data;

      setTicketDetail(data);

      const thread = [];

      // Add initial description as first message
      if (data?.description) {
        thread.push({
          id: "desc",
          message: data.description,
          sender: "user",
          created_at: data.created_at,
        });
      }

      // ✅ FIXED: use ticket_messages instead of replies
      if (Array.isArray(data?.ticket_messages)) {
        data.ticket_messages
          // .filter((msg) => !msg.is_internal) // ❗ hide internal messages
          .forEach((msg) => {
            thread.push({
              id: msg.id,
              message: msg.message,
              sender: msg.sender_role === "user" ? "user" : "admin",
              created_at: msg.created_at,
            });
          });
      }

      setMessages(thread);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTicket(false);
    }
  }, [ticket.id]);

  useEffect(() => {
    setLoadingTicket(true);
    setMessages([]);
    setTicketDetail(null);
    setReply("");
    loadTicket();
  }, [loadTicket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = reply.trim();
    if (!text || sending) return;
    setSending(true);
    const optId = `opt-${Date.now()}`;
    setMessages((prev) => [...prev, { id: optId, message: text, sender: "user", created_at: new Date().toISOString() }]);
    setReply("");
    try {
      await ReplySupportApi(ticket.id, { message: text, ticket_id: ticket.id });
      await loadTicket();
    } catch (err) {
      console.error(err);
      setMessages((prev) => prev.filter((m) => m.id !== optId));
      setReply(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleTextareaChange = (e) => {
    setReply(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
  };

  const detail = ticketDetail || ticket;

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="chat-header__left">
          <button className="btn-icon" type="button" onClick={onBack}><BackIcon /></button>
          <div className="chat-header__ticket-icon"><TicketIcon /></div>
          <div>
            <p className="chat-header__subject">{detail.subject || "Support Ticket"}</p>
            <p className="chat-header__code">{detail.ticket_code}</p>
          </div>
        </div>
        <div className="chat-header__badges">
          {/* <Badge value={detail.status || "pending"} /> */}
          {detail.priority}
        </div>
      </div>

      <div className="messages-area">
        {loadingTicket ? (
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={`messages-area__skeleton-row${i % 2 === 0 ? " messages-area__skeleton-row--reverse" : ""}`}>
                <Skeleton width={30} height={30} radius={15} />
                <Skeleton width={200} height={52} radius={12} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="messages-area__empty">
            <div className="messages-area__empty-icon"><AgentIcon /></div>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, i) => (

            <ChatBubble key={msg.id || i} msg={msg} isUser={msg.sender === "user"} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area">
        <textarea
          ref={inputRef}
          rows={1}
          value={reply}
          onChange={handleTextareaChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
          }}
          placeholder="Type your message… (Enter to send, Shift+Enter for new line)"
          disabled={sending}
        />
        <button className="btn-send" type="button" onClick={handleSend} disabled={!reply.trim() || sending}>
          <SendIcon />
        </button>
      </div>
    </div>
  );
}

// ─── Ticket List Item ─────────────────────────────────────────────────────────
function TicketItem({ ticket, active, onClick }) {
  console.log(ticket, "ticket")
  return (
    <div
      className={`ticket-item${active ? " ticket-item--active" : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
    >
      <div className="ticket-item__inner">
        <div className="ticket-item__icon-wrap"><TicketIcon /></div>
        <div className="ticket-item__content">
          <p className="ticket-item__subject">{ticket.subject}</p>
          <p className="ticket-item__code">{ticket.ticket_code}</p>
          <div className="ticket-item__badges">
            <div className={`badge badge--${ticket.status?.replace("_", "-")}`}>
              {ticket.status === "open" ? <span></span> : <span className="badge__dot" />}
              {ticket.status?.replace("_", " ")}
            </div>

            <div className={`badge badge--${ticket.priority}`}>

              <span className="badge__dot" />
              {ticket.priority}
            </div>
          </div>
        </div>
        <span className="ticket-item__chevron"><ChevronIcon /></span>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [search, setSearch] = useState("");

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await GetAllSupportApi();
      setTickets(res?.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const filtered = tickets.filter((t) =>
    t.subject?.toLowerCase().includes(search.toLowerCase()) ||
    t.ticket_code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="support-root">
        <div className="support-sidebar">
          <div className="sidebar-brand">
            <div className="sidebar-brand__inner">
              <div className="sidebar-brand__icon"><AgentIcon /></div>
              <span className="sidebar-brand__title">Support</span>
            </div>
            <button className="btn-new" type="button" onClick={() => setShowNewModal(true)}>
              <PlusIcon /><span>New</span>
            </button>
          </div>

          <div className="sidebar-search">
            <input
              placeholder="Search tickets…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="sidebar-list">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton-ticket-row">
                  <Skeleton width={38} height={38} radius={10} />
                  <div className="skeleton-ticket-row__lines">
                    <Skeleton width="70%" height={12} />
                    <Skeleton width="40%" height={10} />
                    <Skeleton width="55%" height={18} radius={9} />
                  </div>
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="sidebar-list__empty">
                {search ? "No tickets match your search." : "No tickets yet."}
              </div>
            ) : (
              filtered.map((t) => (
                <TicketItem
                  key={t.id}
                  ticket={t}
                  active={activeTicket?.id === t.id}
                  onClick={() => setActiveTicket(t)}
                />
              ))
            )}
          </div>
        </div>

        <div className="support-main">
          {activeTicket ? (
            <TicketChat ticket={activeTicket} onBack={() => setActiveTicket(null)} />
          ) : (
            <div className="support-empty">
              <div className="support-empty__icon"><TicketIcon /></div>
              <h2>Select a ticket</h2>
              <p>Choose a ticket from the list or raise a new one to get started.</p>
              <button className="btn-submit" type="button" onClick={() => setShowNewModal(true)}>
                <PlusIcon /> Raise a Ticket
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Ant Design Modal — mounts into document.body automatically */}
      <NewTicketModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        onCreated={fetchTickets}
      />
    </>
  );
}
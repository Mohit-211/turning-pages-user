import { useState } from "react";

export default function TicketDetails({ ticket, onBack }) {
  const [message, setMessage] = useState("");

  return (
    <div className="conversation-page">
      <button className="back-btn" onClick={onBack}>
        ← Back to tickets
      </button>

      <div className="conversation-header">
        <h3>{ticket.subject}</h3>
        <span>{ticket.status}</span>
      </div>

      <div className="messages">
        {ticket.messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            <p>{msg.text}</p>
            <small>{msg.time}</small>
          </div>
        ))}
      </div>

      <div className="reply-box">
        <textarea
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button>Send</button>
      </div>
    </div>
  );
}

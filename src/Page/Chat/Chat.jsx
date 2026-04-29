"use client";
import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./Chat.scss";
import { GetAllChatListApi, CreateChatApi } from "../../api/operations/chat.api";

// 🔥 Firebase (ONLY LISTENER, no manual write)
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../config/firebaseConfig";

import { Info } from "lucide-react";
import { Tooltip } from "antd";
import EmptyState from "../../component/EmptyState";

const Chat = () => {
  const { book_room_id } = useParams();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messagesByRoom, setMessagesByRoom] = useState({});
  const [text, setText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState(false); // ✅ prevent double send

  const messagesEndRef = useRef(null);

  const senderId = localStorage.getItem("userId");
  const senderRoleId = localStorage.getItem("role_id");

  const isDirectChat = !!book_room_id;

  const currentMessages = selectedUser
    ? messagesByRoom[selectedUser.id] || []
    : [];

  // 🚀 FETCH CHAT LIST
  useEffect(() => {
    const fetchChatList = async () => {
      try {
        const res = await GetAllChatListApi();
console.log(res,"res")
        const chatData = res?.data?.data || [];

        const mappedUsers = chatData.map((item) => ({
          id: item.chat_room_id,
          name:
            item?.chat_room?.type === "BOOK_GROUP"
              ? item?.chat_room?.book_details?.title
              : item?.chat_room?.chat_participant_ad?.name,
          role: item.role,
          avatar: "👤",
          last_message: item.chat_room?.last_message,
          chat_room: item.chat_room,
        }));

        setUsers(mappedUsers);

        if (book_room_id) {
          const foundUser = mappedUsers.find(
            (u) => String(u.id) === String(book_room_id)
          );
          if (foundUser) setSelectedUser(foundUser);
        } else {
          if (mappedUsers.length > 0) {
            setSelectedUser(mappedUsers[0]);
          }
        }
      } catch (err) {
        console.error("Chat list API error:", err);
      }
    };

    fetchChatList();
  }, [book_room_id]);

  // 🔥 REAL-TIME FIREBASE LISTENER
  useEffect(() => {
    if (!selectedUser?.id) return;

    const chatRoomId = selectedUser.id;

    const q = query(
      collection(db, "messages", String(chatRoomId), "chat"),
      orderBy("created_at", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          text: data.text,
          user:
            String(data.sender_role) === senderRoleId ? "self" : "other",
          time: data.created_at?.toDate
            ? data.created_at.toDate().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
            : "",
        };
      });

      setMessagesByRoom((prev) => ({
        ...prev,
        [chatRoomId]: msgs,
      }));
    });

    return () => unsubscribe();
  }, [selectedUser, senderRoleId]);

  // 📩 SEND MESSAGE (FIXED ✅)
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!text.trim() || !selectedUser?.id || sending) return;

    setSending(true);

    try {
      await CreateChatApi({
        chat_room_id: selectedUser.id,
        message: text,
      });

      setText("");
    } catch (err) {
      console.error("Send message error:", err);
    } finally {
      setSending(false);
    }
  };

  // 🔍 SEARCH
  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 🔽 AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  return (
    <div className="chat-panel">
      {/* ✅ Sidebar */}
      {!isDirectChat && (
        <div className="chat-sidebar">
          <div className="chat-header-fix">
            <h2>Chats</h2>
            <Tooltip
              title="Chat is initiated when you create a book. After submission, an editor is assigned for editing. You can then chat live with your editor here."
              placement="left"
            >
              <Info style={{ marginLeft: "auto", cursor: "pointer" }} />
            </Tooltip>
          </div>

          <input
            type="text"
            placeholder="Search..."
            className="chat-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="chat-users">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`chat-user ${selectedUser?.id === user.id ? "active" : ""
                  }`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="avatar">{user.avatar}</div>
                <div>
                  <div className="user-name">
                    {user?.chat_room?.type === "BOOK_GROUP"
                      ? user?.chat_room?.book_details?.title
                      : user?.chat_room?.chat_participant_ad?.name}
                  </div>
                  <div className="last-msg">{user.last_message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ Chat Content */}
      <div className="chat-content">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <div className="avatar">{selectedUser.avatar}</div>
              <div className="user-name">
                {selectedUser?.chat_room?.type === "BOOK_GROUP"
                  ? selectedUser?.chat_room?.book_details?.title
                  : selectedUser?.chat_room?.chat_participant_ad?.name}
              </div>
            </div>

            <div className="chat-messages">
              {currentMessages.length === 0 && (
                <div className="no-messages">
                  <p>Start conversation 👋</p>
                </div>
              )}

              {currentMessages && currentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-message ${msg.user !== "self" ? "self" : "other"
                    }`}
                >
                  <span>{msg.text}</span>
                  <div className="msg-time">{msg.time}</div>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input" onSubmit={sendMessage}>
              <input
                type="text"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button type="submit" disabled={sending}>
                ➤
              </button>
            </form>
          </>
        ) : (
          <EmptyState
            icon={<span style={{ fontSize: "40px" }}>💬</span>}
            title="No chat selected"
            description="Select a user from the list to begin"
          />
        )}
      </div>
    </div>
  );
};

export default Chat;
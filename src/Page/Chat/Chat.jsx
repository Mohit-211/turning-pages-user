import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./Chat.scss";
import { GetAllChatListApi, CreateChatApi } from "../../api/operations/chat.api";

// 🔥 Firebase
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
console.log(db, "db")
const Chat = () => {
  const { book_room_id } = useParams();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messagesByRoom, setMessagesByRoom] = useState({});
  const [text, setText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const messagesEndRef = useRef(null);

  const senderId = localStorage.getItem("userId") || "1";

  // 👉 check if direct chat mode
  const isDirectChat = !!book_room_id;

  // 👉 current messages
  const currentMessages = selectedUser
    ? messagesByRoom[selectedUser.id] || []
    : [];
  console.log(currentMessages, "currentMessages")
  // 🚀 FETCH CHAT LIST + AUTO SELECT
  useEffect(() => {
    const fetchChatList = async () => {
      try {
        const res = await GetAllChatListApi();
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

          // ✅ ADD THIS (very important)
          chat_room: item.chat_room,
        }));
        setUsers(mappedUsers);

        // ✅ If URL param exists → auto select that chat
        if (book_room_id) {
          const foundUser = mappedUsers.find(
            (u) => String(u.id) === String(book_room_id)
          );
          if (foundUser) {
            setSelectedUser(foundUser);
          }
        } else {
          // ✅ Normal flow
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

  // 🔥 REAL-TIME FIREBASE
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
          user: data.sender_id === senderId ? "self" : "other",
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
  }, [selectedUser, senderId]);

  // 📩 SEND MESSAGE
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!text.trim() || !selectedUser?.id) return;

    const chatRoomId = selectedUser.id;
    const messageText = text;

    try {
      // ✅ API
      await CreateChatApi({
        chat_room_id: chatRoomId,
        message: messageText,
      });

      // // ✅ Firebase
      // await addDoc(
      //   collection(db, "messages", String(chatRoomId), "chat"),
      //   {
      //     sender_id: String(senderId),
      //     text: messageText,
      //     type: "TEXT",
      //     created_at: serverTimestamp(),
      //     updated_at: null,
      //     read_by: [String(senderId)],
      //     delivered_to: [],
      //     is_edited: false,
      //     is_deleted: false,
      //     reply_to: null,
      //     attachment: {
      //       url: null,
      //       type: null,
      //       size: null,
      //     },
      //     meta: {
      //       device: "web",
      //       ip: null,
      //     },
      //   }
      // );

      setText("");
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  // 🔍 SEARCH
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 🔽 AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);
  console.log(selectedUser, 'selectedUser')
  return (
    <div className="chat-panel">
      {/* ✅ Sidebar (hidden in direct chat) */}
      {!isDirectChat && (
        <div className="chat-sidebar">
          <h2>Chats</h2>

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
                    <div className="user-name">
  {user?.chat_room?.type === "BOOK_GROUP"
    ? user?.chat_room?.book_details?.title
    : user?.chat_room?.chat_participant_ad?.name}
</div>

                  </div>

                  <div className="last-msg">{user.last_message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Content */}
      <div className="chat-content">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <div className="avatar">{selectedUser.avatar}</div>
              <div>
                <div className="user-name">
                  {selectedUser?.chat_room?.type === "BOOK_GROUP"
    ? selectedUser?.chat_room?.book_details?.title
    : selectedUser?.chat_room?.chat_participant_ad?.name}
                </div>
                {/* <div className="user-role">{selectedUser.role}</div> */}
              </div>
            </div>

            <div className="chat-messages">
              {/* {currentMessages.length === 0 && (
                <div className="no-messages">
                  <p>Start conversation</p>
                </div>
              )} */}
              {currentMessages.length === 0 && (
                <div className="no-messages">
                  <p>Start conversation 👋</p>
                </div>
              )}

              {currentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-message ${msg.user === "self" ? "self" : "other"
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
              <button type="submit">➤</button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <p>No chat selected</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
import client from "../client";
import { CHATCONVERSATION_ENDPOINTS } from "../endpoints";

// Send Chat Message
export const SendAssistantChatApi = (payload) =>
    client.post(CHATCONVERSATION_ENDPOINTS.SEND_MESSAGE, payload);

// Get Conversation List
export const GetAssistantConversationListApi = () =>
    client.get(CHATCONVERSATION_ENDPOINTS.CONVERSATION_LIST);

// Get Chat Messages
export const GetAssistantChatMessagesApi = (conversation_id) =>
  client.get(
    `${CHATCONVERSATION_ENDPOINTS.CHAT_MESSAGES}/${conversation_id}`
  );
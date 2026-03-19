import client from "../client";
import { Chat_ENDPOINTS } from "../endpoints";
// Create Chat
export const CreateChatApi = (payload) =>
    client.post(Chat_ENDPOINTS.CREATE, payload);
// Get All chat list
export const GetAllChatListApi = () =>
    client.get(Chat_ENDPOINTS.GET_ALL);
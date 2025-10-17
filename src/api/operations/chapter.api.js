import client from "../client";
import { Chapter_ENDPOINTS } from "../endpoints";

// Create Chapter
export const CreateChapterApi = (payload) =>
  client.post(Chapter_ENDPOINTS.CREATE, payload);

// Get All Chapters
export const GetAllChapterApi = () =>
  client.get(Chapter_ENDPOINTS.GET_ALL);

// Update Chapter
export const UpdateChapterApi = (payload) =>
  client.patch(Chapter_ENDPOINTS.UPDATE, payload);

// ✅ Delete Chapter
export const DeleteChapterApi = (payload) =>
  client.delete(Chapter_ENDPOINTS.DELETE, { data: payload });

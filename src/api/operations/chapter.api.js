import client from "../client";
import { Chapter_ENDPOINTS } from "../endpoints";

// Create Chapter
export const CreateChapterApi = (payload) =>
  client.post(Chapter_ENDPOINTS.CREATE, payload);

// Get All Chapters
export const GetAllChapterApi = (bookId) =>
  client.get(Chapter_ENDPOINTS.GET_ALL(bookId));

// Update Chapter
export const UpdateChapterApi = (payload) =>
  client.patch(Chapter_ENDPOINTS.UPDATE, payload);

// Delete Chapter
export const DeleteChapterApi = (payload) =>
  client.delete(Chapter_ENDPOINTS.DELETE, { data: payload });

// Generate Chapter Content
export const GenerateChapterContentAPI = (payload) =>
  client.post(Chapter_ENDPOINTS.GENERATE_CHAPTER_CONTENT, payload);

// Plagiarism Check
export const PlagiarismCheck = (text) =>
  client.post(Chapter_ENDPOINTS.PLAGIARISM_CHECK, { text });

// ✅ FIXED Consistency Check
export const ConsistencyCheck = (bookId) =>
  client.post(Chapter_ENDPOINTS.CONSISTENCY_CHECK, {
    book_id: bookId,
  });

// Generate Summary
export const GenerateSummary = (bookId, chapterId) =>
  client.post(Chapter_ENDPOINTS.GENERATE_SUMMARY, {
    book_id: bookId,
    chapter_id: chapterId,
  });

// Fact Check
export const FactChecking = (text) =>
  client.post(Chapter_ENDPOINTS.FACT_CHECK, { text });

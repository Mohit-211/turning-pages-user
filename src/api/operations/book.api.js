import client from "../client";
import { Book_ENDPOINTS } from "../endpoints";

// Create
export const CreateBookApi = (payload) =>
  client.post(Book_ENDPOINTS.CREATE, payload);

// Get books
export const GetAllBooksApi = () =>
  client.get(Book_ENDPOINTS.GET_ALL);

// Get book by ID
export const GetBookByIdApi = (id) =>
  client.get(Book_ENDPOINTS.GET_BY_ID(id));

// Books update (status)
export const GetBooksByStatusApi = (payload) =>
  client.post(Book_ENDPOINTS.GET_BY_STATUS, payload);

// Search
export const SearchBookApi = (payload) =>
  client.post(Book_ENDPOINTS.SEARCH, payload);

// Delete
export const DeleteBookApi = (bookId) =>
  client.delete(Book_ENDPOINTS.DELETE, {
    data: { book_id: bookId },
  });

/* ============================
   UPDATE BOOK COVER (UPLOAD)
============================ */
export const UpdateBookCoverApi = (formData) =>
  client.put(Book_ENDPOINTS.UPDATE, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

/* ============================
   🔥 GENERATE BOOK COVER (AI)
============================ */
export const GenerateBookCoverApi = (payload) =>
  client.post(Book_ENDPOINTS.GENERATE_COVER, payload);

// book submit 
export const GetBooksBySubmittion = (payload) =>
  client.post(Book_ENDPOINTS.SUBMITTION, payload);

export const GetBookSubmittionHistoryApi = () =>
  client.get(Book_ENDPOINTS.GET_SUBMITTION_HISTORY);

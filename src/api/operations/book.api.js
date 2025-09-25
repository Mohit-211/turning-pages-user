import client from "../client";
import { Book_ENDPOINTS } from "../endpoints";
// Create
export const CreateBookApi = (payload) => client.post(Book_ENDPOINTS.CREATE, payload);
// Get books
export const GetAllBooksApi = () => client.get(Book_ENDPOINTS.GET_ALL);
// Get book by ID
export const GetBookByIdApi = (id) => client.get(Book_ENDPOINTS.GET_BY_ID(id));
// books update
export const GetBooksByStatusApi = () => client.post(Book_ENDPOINTS.GET_BY_STATUS,payload);
// Search
export const SearchBookApi = (payload) => client.post(Book_ENDPOINTS.SEARCH, payload);

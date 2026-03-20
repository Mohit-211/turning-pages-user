import client from "../client";
import { Genre_ENDPOINTS } from "../endpoints";

export const GetAllGenreApi = () => client.get(Genre_ENDPOINTS.GET_ALL);


import client from "../client";
import { DIRECTORY_ENDPOINTS } from "../endpoints";

export const GetAllDirectoryApi = () =>
  client.get(DIRECTORY_ENDPOINTS.GET_ALL);

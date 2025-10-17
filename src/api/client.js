import axios from "axios";
import config from "../constants/config";
import { handleApiError } from "../errors/ApiErrorHandler";
console.log(config,"config")
const client = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: config.TIMEOUT,
  headers: {
    timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,
    "Content-Type": "application/json",
    
  },
});

client.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("book_publish_token");
    console.log(token,"token")
    if (token) {
      req.headers['x-access-token'] = `${token}`;
    }
    return req;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (res) => res,
  (error) => handleApiError(error)
);

export default client;

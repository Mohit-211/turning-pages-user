export const AUTH_ENDPOINTS = {
  LOGIN: "user/auth/login",
  REGISTER: "user/auth/register",
  LOGOUT: "user/auth/logout",
  SEND_OTP: "user/auth/otp",
  VERIFY_OTP: "user/auth/verify-otp",
  FORGOT_PASSWORD: "user/auth/forgot-password",
  RESET_PASSWORD: "user/auth/reset-password",
  CHANGE_PASSWORD: "user/auth/change-password",
};
export const USER_ENDPOINTS = {
  PROFILE: "user/profile",
};
// export const POST_ENDPOINTS = {
//   GET_ALL: "/posts",
//   CREATE: "/posts",
//   DELETE: (id) => `/posts/${id}`,
// };
export const Genre_ENDPOINTS = {
  GET_ALL: "genres",

};
export const Book_ENDPOINTS = {
  CREATE: "books",
  GET_ALL: "books",
  GET_BY_ID: (id) => `books/${id}`,
  GET_BY_STATUS: "books/status/update",
  SEARCH: "books/search",
  DELETE: "books/remove"
};
export const Chapter_ENDPOINTS = {
  CREATE: "chapters",
  GET_ALL: (id) => `chapters/${id}`,
  UPDATE: "chapters",
  DELETE: "chapters/remove",
  GenerateChapterContent: "/chapters/generate/chapter/content"
};
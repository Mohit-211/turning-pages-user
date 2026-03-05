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
  DELETE: "books/remove",
  UPDATE: "books",
  GENERATE_COVER: "chapters/generate/cover",
  SUBMITTION: "books/submission/update",
  GET_SUBMITTION_HISTORY: "books/all/book/submission/history",
};

export const Chapter_ENDPOINTS = {
  CREATE: "chapters",
  GET_ALL: (id) => `chapters/${id}`,
  UPDATE: "chapters",
  DELETE: "chapters/remove",
  GENERATE_CHAPTER_CONTENT: "chapters/generate/chapter/content",
  PLAGIARISM_CHECK: "books/plagiarism/check",
  CONSISTENCY_CHECK: "books/consistency/check",
  GENERATE_SUMMARY: "books/chapter/summerize",
  FACT_CHECK: "books/fact/check",
};


// export const Payment_ENDPOINTS = {
//   STRIPE: "payments/intent/generate",
// };

export const PAYMENT_ENDPOINTS = {
  STRIPE: "payments/intent/generate",
  GET_ALL: "payments/all",
};
export const SUPPORT_ENDPOINTS = {
  CREATE_TICKET: "support",
  GET_ALL_TICKETS: "support",
  GET_TICKET_BY_ID: (id) => `support/${id}`,
  // ADD_MESSAGE: "support/tickets/message/add",
};
export const FEED_ENDPOINTS = {
  CREATE: "feeds",
  CREATE_COMMENT: "feeds/comment",
  GET_ALL: "feeds",
  REPLAY_COMMENT:"feeds/comment",
  LIKE: (feedId) => `feeds/${feedId}/like`

  //   GET_ALL: (id) => `chapters/${id}`,
  //   UPDATE: "chapters",
  //   DELETE: "chapters/remove",
  //   GENERATE_CHAPTER_CONTENT: "chapters/generate/chapter/content",
  //   PLAGIARISM_CHECK: "books/plagiarism/check",
  //   CONSISTENCY_CHECK: "books/consistency/check",
  //   GENERATE_SUMMARY: "books/chapter/summerize",
  //   FACT_CHECK: "books/fact/check",
};

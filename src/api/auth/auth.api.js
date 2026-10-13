import client from "../client";
import { AUTH_ENDPOINTS } from "../endpoints";

// Auth
export const loginApi = (payload) => client.post(AUTH_ENDPOINTS.LOGIN, payload);
export const registerApi = (payload) => client.post(AUTH_ENDPOINTS.REGISTER, payload);
export const logoutApi = () => client.get(AUTH_ENDPOINTS.LOGOUT);

// OTP
export const sendOtpApi = (payload) => client.post(AUTH_ENDPOINTS.SEND_OTP, payload);
export const verifyOtpApi = (payload) => client.post(AUTH_ENDPOINTS.VERIFY_OTP, payload);

// Password 
export const forgotPasswordApi = (payload) => client.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, payload);
// Changing the password signs out every other session, so the old token stops working.
export const changePasswordApi = async (payload) => {
  const response = await client.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, payload);
  const token = response?.data?.data?.tokens?.access?.token;
  if (token) localStorage.setItem("book_publish_token", token);
  return response;
};

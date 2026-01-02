import client from "../client";
import { PAYMENT_ENDPOINTS } from "../endpoints";

export const stripePaymentApi = (payload) =>
  client.post(PAYMENT_ENDPOINTS.STRIPE, payload);

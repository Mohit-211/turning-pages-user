import client from "../client";
import { PAYMENT_ENDPOINTS } from "../endpoints";

export const stripePaymentApi = (payload) =>
  client.post(PAYMENT_ENDPOINTS.STRIPE, payload);

// Get All Payments
export const GetAllPaymentsApi = () =>
  client.get(PAYMENT_ENDPOINTS.GET_ALL);

export const GetPaymentSpendingListApi = () =>
  client.get(PAYMENT_ENDPOINTS.SPENDING_LISt);

export const CreateSubscriptionApi = (payload) =>
  client.post(PAYMENT_ENDPOINTS.SUBSCRIPTION, payload);

export const GetUserSubscriptionsApi = () =>
  client.get(PAYMENT_ENDPOINTS.GET_USER_SUBSCRIPTIONS);

export const GetAllPaymentListApi = () =>
  client.get(PAYMENT_ENDPOINTS.GET_ALL_PAYMENTS);
import client from "../client";
import { CREDIT_ENDPOINTS } from "../endpoints";

export const GetCreditApi = () =>
  client.get(CREDIT_ENDPOINTS.GET);

import client from "../client";
import { SUPPORT_ENDPOINTS } from "../endpoints";

// Create Ticket
export const CreateSupportApi = (payload) =>
  client.post(SUPPORT_ENDPOINTS.CREATE_TICKET, payload);

// Get All Tickets
export const GetAllSupportApi = () =>
  client.get(SUPPORT_ENDPOINTS.GET_ALL_TICKETS);

// Get Ticket By ID
export const GetSupportByIdApi = (id) =>
  client.get(SUPPORT_ENDPOINTS.GET_TICKET_BY_ID(id));

// ✅ Reply to Ticket (User Message)
export const ReplySupportApi = (id, payload) =>
  client.post(SUPPORT_ENDPOINTS.REPLY_TICKET(id), payload);
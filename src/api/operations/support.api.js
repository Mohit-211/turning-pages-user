import client from "../client";
import { SUPPORT_ENDPOINTS } from "../endpoints";

// Create
export const CreateSupportApi = (payload) =>
    client.post(SUPPORT_ENDPOINTS.CREATE_TICKET, payload);

// Get Support
export const GetAllSupportApi = () =>
    client.get(SUPPORT_ENDPOINTS.GET_ALL_TICKETS);

// Get Support by ID
export const GetSupportByIdApi = (id) =>
    client.get(SUPPORT_ENDPOINTS.GET_TICKET_BY_ID(id));

import client from "../client";
import { Quote_ENDPOINTS } from "../endpoints";

export const GetTagsApi = (page, limit) =>
  client.get(Quote_ENDPOINTS.GET_TAGS(page, limit));

export const GetAllQuotesApi = (page, limit) =>
  client.get(Quote_ENDPOINTS.GET_ALL_QUOTES(page, limit));

export const GetQuotesByTagApi = (slug, page, limit) =>
  client.get(Quote_ENDPOINTS.GET_QUOTES_BY_TAG(slug, page, limit));
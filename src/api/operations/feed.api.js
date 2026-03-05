import client from "../client";
import { FEED_ENDPOINTS } from "../endpoints";

// Create Chapter
export const CreateFeedApi = (payload) =>
    client.post(FEED_ENDPOINTS.CREATE, payload);
export const GetAllFeedApi = () =>
  client.get(FEED_ENDPOINTS.GET_ALL);
export const CreateFeedCommentApi = (payload) =>
    client.post(FEED_ENDPOINTS.CREATE_COMMENT, payload);
export const ToggleFeedLikeApi = (feedId) =>
  client.post(FEED_ENDPOINTS.LIKE(feedId));
export const ReplayCommentOnFeedApi = (payload) =>
    client.post(FEED_ENDPOINTS.REPLAY_COMMENT, payload);
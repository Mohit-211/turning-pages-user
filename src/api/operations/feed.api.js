import client from "../client";
import { FEED_ENDPOINTS, Genre_ENDPOINTS } from "../endpoints";
// Create Chapter
export const CreateFeedApi = (payload) =>
  client.post(FEED_ENDPOINTS.CREATE, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const GetAllFeedApi = () =>
  client.get(FEED_ENDPOINTS.GET_ALL);
export const GetAllMyFeedApi = () =>
  client.get(FEED_ENDPOINTS.GET_ALL_MY_FEED);
export const CreateFeedCommentApi = (payload) =>
  client.post(FEED_ENDPOINTS.CREATE_COMMENT, payload);
export const ToggleFeedLikeApi = (feedId) =>
  client.post(FEED_ENDPOINTS.LIKE(feedId));
export const ReplayCommentOnFeedApi = (payload) =>
  client.post(FEED_ENDPOINTS.REPLAY_COMMENT, payload);
export const GetAllFeedCommentApi = (feedId) =>
  client.get(FEED_ENDPOINTS.ALL_Comment(feedId));
export const GetAllFeedByGenreId= (GENER_ID) => client.get(FEED_ENDPOINTS.GET_ALL_FEED_BY_GENER_ID(GENER_ID));

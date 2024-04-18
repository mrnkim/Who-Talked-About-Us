import axios from "axios";

const SERVER_BASE_URL = window.location.hostname?.includes("replit")
  ? new URL(`https://${window.location.hostname}:3000`)
  : new URL(
      `${process.env.REACT_APP_SERVER_URL}:${process.env.REACT_APP_PORT_NUMBER}`,
    );

const apiConfig = {
  TWELVE_LABS_API: axios.create({
    baseURL: SERVER_BASE_URL.toString(),
  }),
  INDEXES_URL: "/indexes",
  SEARCH_URL: "/search",
  TASKS_URL: "/tasks",
  JSON_VIDEO_INFO_URL: new URL("/json-video-info", SERVER_BASE_URL),
  CHANNEL_VIDEO_INFO_URL: new URL("/channel-video-info", SERVER_BASE_URL),
  PLAYLIST_VIDEO_INFO_URL: new URL("/playlist-video-info", SERVER_BASE_URL),
  DOWNLOAD_URL: new URL("/download", SERVER_BASE_URL),
  UPDATE_VIDEO_URL: new URL("/update", SERVER_BASE_URL),
};

export default apiConfig;

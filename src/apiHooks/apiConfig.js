import axios from "axios";

const apiConfig = {
  TWELVE_LABS_API: axios.create({
    baseURL: `${process.env.REACT_APP_SERVER_URL}:${process.env.REACT_APP_PORT_NUMBER}`,
  }),
  INDEXES_URL: "/indexes",
  SEARCH_URL: "/search",
  TASKS_URL: "/tasks",
};

export default apiConfig;

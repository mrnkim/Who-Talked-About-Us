import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { keys } from "./keys";

const SERVER_BASE_URL = `${process.env.REACT_APP_SERVER_URL}:${process.env.REACT_APP_PORT_NUMBER}`;
const axiosInstance = axios.create({
  baseURL: SERVER_BASE_URL,
});
const INDEXES_URL = "/indexes";
const INDEX_URL = "/index";
const SEARCH_URL = "/search";
const TASKS_URL = "/tasks";

export function useGetIndexes(page, pageLimit) {
  return useQuery({
    queryKey: [keys.INDEXES, page],
    queryFn: () =>
      axiosInstance
        .get(`${INDEXES_URL}?page=${page}&page_limit=${pageLimit}`)
        .then((res) => res.data),
  });
}

export function useGetIndex(indexId) {
  return useQuery({
    queryKey: [keys.INDEX],
    queryFn: async () => {
      const response = await axiosInstance.get(`${INDEXES_URL}/${indexId}`);
      if (response.data.error) {
        return { error: response.data.error };
      }
      return response.data;
    },
  });
}

export function useCreateIndex(setIndexId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (indexName) =>
      axiosInstance.post(INDEXES_URL, { indexName }).then((res) => res.data),
    onSuccess: (newIndex) => {
      setIndexId(newIndex._id);
      queryClient.invalidateQueries([keys.INDEX]);
    },
    mutationKey: "createIndex",
  });
}

export function useDeleteIndex(setIndexId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (indexId) =>
      axiosInstance
        .delete(`${INDEXES_URL}?indexId=${indexId}`)
        .then((res) => res.data),
    onSuccess: (indexId) => {
      setIndexId(null);
      queryClient.invalidateQueries([keys.INDEX]);
    },
    mutationKey: "deleteIndex",
  });
}

export function useGetVideos(indexId, page, pageLimit) {
  return useQuery({
    queryKey: [keys.VIDEOS, indexId, page],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(
          `${INDEXES_URL}/${indexId}/videos`,
          {
            params: { page, page_limit: pageLimit },
          }
        );
        return response.data;
      } catch (error) {
        throw error.response?.data || error;
      }
    },
  });
}

export function useGetAllAuthors(indexId) {
  return useQuery({
    queryKey: [keys.AUTHORS, indexId],
    queryFn: () =>
      axiosInstance
        .get(`${INDEXES_URL}/${indexId}/authors`)
        .then((res) => res.data),
  });
}

export function useSearchVideo(indexId, query) {
  return useQuery({
    queryKey: [keys.SEARCH, indexId, query],
    queryFn: () =>
      axiosInstance
        .post(SEARCH_URL, { indexId, query })
        .then((res) => res.data),
  });
}

export function useGetTask(taskId) {
  return useQuery({
    queryKey: [keys.TASK, taskId],
    queryFn: () =>
      axiosInstance.get(`${TASKS_URL}/${taskId}`).then((res) => res.data),
    refetchInterval: (data) => {
      return data?.status === "ready" ? false : 5000;
    },
    refetchIntervalInBackground: true,
  });
}

export function useGetVideoOfSearchResults(indexId, query) {
  const { data: searchVideoQuery, refetch } = useSearchVideo(indexId, query);

  const searchResults = searchVideoQuery.data || [];

  const results = useQueries({
    queries: searchResults.map((result) => ({
      queryKey: [keys.SEARCH, indexId, result.video_id],
      queryFn: () =>
        axiosInstance
          .get(`${INDEXES_URL}/${indexId}/videos/${result.video_id}`)
          .then((res) => res.data),
    })),
  });

  // Extract 'data' property from each object in 'results'
  const searchResultVideos = results.map(({ data }) => data);

  return { searchResults, searchResultVideos, refetch };
}

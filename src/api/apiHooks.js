import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { keys } from "./keys";

const SERVER_BASE_URL = new URL(
  `${process.env.REACT_APP_SERVER_URL}:${process.env.REACT_APP_PORT_NUMBER}`
);
const INDEXES_URL = new URL("/indexes", SERVER_BASE_URL);
const INDEX_URL = new URL("/index", SERVER_BASE_URL);
const SEARCH_URL = new URL("/search", SERVER_BASE_URL);
const TASKS_URL = new URL("/tasks", SERVER_BASE_URL);

export function useGetIndexes(page, pageLimit) {
  return useQuery({
    queryKey: [keys.INDEXES, page],
    queryFn: () =>
      fetch(`${INDEXES_URL}?page=${page}&page_limit=${pageLimit}`).then((res) =>
        res.json()
      ),
  });
}

export function useGetIndex(indexId) {
  return useQuery({
    queryKey: [keys.INDEX],
    queryFn: () => fetch(`${INDEXES_URL}/${indexId}`).then((res) => res.json()),
  });
}

export function useCreateIndex() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (indexName) =>
      fetch(`${INDEXES_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ indexName }),
      }).then((res) => res.json()),
    onSuccess: () => queryClient.invalidateQueries([keys.INDEXES]),
    mutationKey: "createIndex",
  });
}

export function useDeleteIndex() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (indexId) =>
      fetch(`${INDEXES_URL}?indexId=${indexId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ indexId }),
      }).then((res) => res.json()),
    onSuccess: () => queryClient.invalidateQueries([keys.INDEXES]),
    mutationKey: "deleteIndex",
  });
}

export function useGetVideos(currIndex, vidPage, vidPageLimit) {
  return useQuery({
    queryKey: [keys.VIDEOS, currIndex, vidPage],
    queryFn: () =>
      fetch(
        `${INDEXES_URL}/${currIndex}/videos?page=${vidPage}&page_limit=${vidPageLimit}`
      ).then((res) => res.json()),
  });
}

export function useGetAllAuthors(indexId) {
  return useQuery({
    queryKey: [keys.AUTHORS, indexId],
    queryFn: () =>
      fetch(`${INDEXES_URL}/${indexId}/authors`).then((res) => res.json()),
  });
}

export function useSearchVideo(indexId, query) {
  return useQuery({
    queryKey: [keys.SEARCH, indexId, query],
    queryFn: () => {
      return fetch(`${SEARCH_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ indexId, query }),
      }).then((res) => res.json());
    },
  });
}

export function useGetTask(taskId) {
  return useQuery({
    queryKey: [keys.TASK, taskId],
    queryFn: () => fetch(`${TASKS_URL}/${taskId}`).then((res) => res.json()),
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
        fetch(`${INDEXES_URL}/${indexId}/videos/${result.video_id}`).then(
          (res) => res.json()
        ),
    })),
  });

  // Extract 'data' property from each object in 'results'
  const searchResultVideos = results.map(({ data }) => data);

  return { searchResults, searchResultVideos, refetch };
}

import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import axios from "axios";
import keys from "./keys";

//TODO: Separate out URLs into a different file and combine with the ones in UploadYouTubeVideo
const SERVER_BASE_URL = `${process.env.REACT_APP_SERVER_URL}:${process.env.REACT_APP_PORT_NUMBER}`;
const axiosInstance = axios.create({ baseURL: SERVER_BASE_URL });
const INDEXES_URL = "/indexes";
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
export function useGetSearchResults(indexId, pageToken) {
  return useInfiniteQuery({
    queryKey: [keys.SEARCH, pageToken],
    queryFn: () =>
      axiosInstance.get(`${SEARCH_URL}/${pageToken}`).then(async (res) => {
        const searchData = res.data;

        // Fetch videos for each search result
        const videosPromises = searchData.data.map(async (searchResult) => {
          const videoResponse = await axiosInstance.get(
            `${INDEXES_URL}/${indexId}/videos/${searchResult.id}`
          );
          return videoResponse.data;
        });

        // Wait for all video requests to complete
        const videos = await Promise.all(videosPromises);

        // Attach videos to the search result data
        const searchDataWithVideos = {
          ...searchData,
          videos: videos,
        };
        return searchDataWithVideos;
      }),
    getNextPageParam: (lastPage) => {
      const nextPageToken = lastPage.page_info.next_page_token || undefined;
      return nextPageToken || null;
    },
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

export function useGetVideosOfSearchResults(indexId, query) {
  const {
    data: initialSearchData,
    refetch,
    isLoading,
  } = useSearchVideo(indexId, query);
  const initialSearchResults = initialSearchData.data || [];

  const resultVideos = useQueries({
    queries: initialSearchResults.map((searchResult) => ({
      queryKey: [keys.SEARCH, indexId, searchResult.id],
      queryFn: () =>
        axiosInstance
          .get(`${INDEXES_URL}/${indexId}/videos/${searchResult.id}`)
          .then((res) => res.data),
    })),
  });
  const initialSearchResultVideos = resultVideos.map(({ data }) => data);
  return {
    initialSearchData,
    initialSearchResults,
    initialSearchResultVideos,
    refetch,
    isLoading,
  };
}

export async function fetchNextPageSearchResults(queryClient, nextPageToken) {
  try {
    const response = await queryClient.fetchQuery({
      queryKey: [keys.SEARCH, nextPageToken],
      queryFn: async () => {
        const response = await axiosInstance.get(
          `${SEARCH_URL}/${nextPageToken}`
        );
        const data = response.data;
        return data;
      },
    });
    return response;
  } catch (error) {
    console.error("Error fetching next page of search results:", error);
    throw error;
  }
}

export async function fetchNextPageSearchResultVideos(
  queryClient,
  currIndex,
  nextPageResultId
) {
  try {
    const response = await queryClient.fetchQuery({
      queryKey: [keys.VIDEOS, currIndex, nextPageResultId],
      queryFn: async () => {
        const response = await axiosInstance.get(
          `${INDEXES_URL}/${currIndex}/videos/${nextPageResultId}`
        );
        const data = response.data;
        return data;
      },
    });
    return response;
  } catch (error) {
    console.error("Error fetching next page of search results:", error);
    throw error;
  }
}

import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import keys from "./keys";
import apiConfig from "./apiConfig";

export function useGetIndexes(page, pageLimit) {
  return useQuery({
    queryKey: [keys.INDEXES, page],
    queryFn: () =>
      apiConfig.TWELVE_LABS_API.get(
        `${apiConfig.INDEXES_URL}?page=${page}&page_limit=${pageLimit}`
      ).then((res) => res.data),
  });
}

export function useGetIndex(indexId) {
  return useQuery({
    queryKey: [keys.INDEX, indexId],
    queryFn: async () => {
      const response = await apiConfig.TWELVE_LABS_API.get(
        `${apiConfig.INDEXES_URL}/${indexId}`
      );
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
      apiConfig.TWELVE_LABS_API.post(apiConfig.INDEXES_URL, { indexName }).then(
        (res) => res.data
      ),
    onSuccess: (newIndex) => {
      setIndexId(newIndex._id);
      queryClient.invalidateQueries([keys.INDEX, newIndex._id]);
    },
    mutationKey: "createIndex",
  });
}

export function useDeleteIndex(setIndexId) {
  return useMutation({
    mutationFn: (indexId) =>
      apiConfig.TWELVE_LABS_API.delete(
        `${apiConfig.INDEXES_URL}?indexId=${indexId}`
      ).then((res) => res.data),
    onSuccess: () => {
      setIndexId(null);
    },
    mutationKey: "deleteIndex",
  });
}

export function useGetVideos(indexId, page, pageLimit) {
  return useQuery({
    queryKey: [keys.VIDEOS, indexId, page],
    queryFn: async () => {
      try {
        const response = await apiConfig.TWELVE_LABS_API.get(
          `${apiConfig.INDEXES_URL}/${indexId}/videos`,
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

export async function fetchVideo(queryClient, indexId, videoId) {
  try {
    const response = await queryClient.fetchQuery({
      queryKey: [keys.VIDEO, indexId, videoId],
      queryFn: async () => {
        const response = await apiConfig.TWELVE_LABS_API.get(
          `${apiConfig.INDEXES_URL}/${indexId}/videos/${videoId}`
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

export function useGetAllAuthors(indexId) {
  return useQuery({
    queryKey: [keys.AUTHORS, indexId],
    queryFn: () =>
      apiConfig.TWELVE_LABS_API.get(
        `${apiConfig.INDEXES_URL}/${indexId}/authors`
      ).then((res) => res.data),
  });
}

export function useSearchVideo(indexId, query) {
  return useQuery({
    queryKey: [keys.SEARCH, indexId, query],
    queryFn: () =>
      apiConfig.TWELVE_LABS_API.post(apiConfig.SEARCH_URL, {
        indexId,
        query,
      }).then((res) => res.data),
  });
}

export function useGetSearchResults(indexId, pageToken) {
  return useInfiniteQuery({
    queryKey: [keys.SEARCH, pageToken],
    queryFn: () =>
      apiConfig.TWELVE_LABS_API.get(
        `${apiConfig.SEARCH_URL}/${pageToken}`
      ).then(async (res) => {
        const searchData = res.data;

        // Fetch videos for each search result
        const videosPromises = searchData.data.map(async (searchResult) => {
          const videoResponse = await apiConfig.TWELVE_LABS_API.get(
            `${apiConfig.INDEXES_URL}/${indexId}/videos/${searchResult.id}`
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
      apiConfig.TWELVE_LABS_API.get(`${apiConfig.TASKS_URL}/${taskId}`).then(
        (res) => res.data
      ),
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
        apiConfig.TWELVE_LABS_API.get(
          `${apiConfig.INDEXES_URL}/${indexId}/videos/${searchResult.id}`
        ).then((res) => res.data),
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
        const response = await apiConfig.TWELVE_LABS_API.get(
          `${apiConfig.SEARCH_URL}/${nextPageToken}`
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
        const response = await apiConfig.TWELVE_LABS_API.get(
          `${apiConfig.INDEXES_URL}/${currIndex}/videos/${nextPageResultId}`
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

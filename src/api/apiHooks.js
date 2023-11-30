import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import TwelveLabsApi from "./api";
import { keys } from "./keys";

export function useGetIndexes(page, pageLimit) {
  return useQuery({
    queryKey: [keys.INDEXES, page],
    queryFn: () => TwelveLabsApi.getIndexes(page, pageLimit),
    keepPreviousData: true,
  });
}

export function useCreateIndex() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (indexName) => TwelveLabsApi.createIndex(indexName),
    onSuccess: () => queryClient.invalidateQueries([keys.INDEXES]),
  });
}

export function useDeleteIndex() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (indexId) => TwelveLabsApi.deleteIndex(indexId),
    onSuccess: () => queryClient.invalidateQueries([keys.INDEXES]),
  });
}

export function useGetVideos(currIndex, vidPage, pageLimit) {
  return useQuery({
    queryKey: [keys.VIDEOS, currIndex, vidPage],
    queryFn: () => TwelveLabsApi.getVideos(currIndex, vidPage, pageLimit),
  });
}

export function useSearchVideo(indexId, query) {
  return useQuery({
    queryKey: [keys.SEARCH, indexId, query],
    queryFn: () => TwelveLabsApi.searchVideo(indexId, query),
  });
}

export function useGetVideoOfSearchResults(indexId, query) {
  const { data: searchVideoQuery, refetch } = useSearchVideo(indexId, query);
  const searchResults = searchVideoQuery.data || [];

  const results = useQueries({
    queries: searchResults.map((result) => ({
      queryKey: [keys.SEARCH, indexId, result.video_id],
      queryFn: () => TwelveLabsApi.getVideo(indexId, result.video_id),
    })),
  });

  // Extract 'data' property from each object in 'results'
  const searchResultVideos = results.map(({ data }) => data);

  return { searchResults, searchResultVideos, refetch };
}

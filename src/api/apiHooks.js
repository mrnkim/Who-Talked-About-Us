import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TwelveLabsApi from "./api";
import { keys } from "./keys";

export function useGetIndexes() {
  return useQuery({
    queryKey: [keys.INDEXES],
    queryFn: TwelveLabsApi.getIndexes,
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

export function useGetVideos(indexId) {
  return useQuery({
    queryKey: [keys.VIDEOS, indexId],
    queryFn: () => TwelveLabsApi.getVideos(indexId),
  });
}

export function useSearchVideo() {
  return useMutation({
    mutationFn: ({ indexId, query }) =>
      TwelveLabsApi.searchVideo(indexId, query),
  });
}

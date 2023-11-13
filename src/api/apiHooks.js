import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TwelveLabsApi from "./api";

export function useGetIndexes() {
  return useQuery({
    queryKey: ["indexes"],
    queryFn: TwelveLabsApi.getIndexes,
  });
}

export function useCreateIndex() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (indexName) => TwelveLabsApi.createIndex(indexName),
    onSuccess: () => queryClient.invalidateQueries(["indexes"]),
  });
}

export function useDeleteIndex() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (indexId) => TwelveLabsApi.deleteIndex(indexId),
    onSuccess: () => queryClient.invalidateQueries(["indexes"]),
  });
}

export function useGetVideos(indexId) {
  return useQuery({
    queryKey: ["videos", indexId],
    queryFn: () => TwelveLabsApi.getVideos(indexId),
  });
}

export function useSearchVideo() {
  return useMutation({
    mutationFn: ({ indexId, query }) =>
      TwelveLabsApi.searchVideo(indexId, query),
  });
}


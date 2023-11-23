import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export function useGetVideos(indexId, page, pageLimit) {
  return useQuery({
    queryKey: [keys.VIDEOS, indexId, page],
    queryFn: () => TwelveLabsApi.getVideos(indexId, page, pageLimit),
  });
}

// export function useSearchVideo() {
//   return useMutation({
//     mutationFn: ({ indexId, query }) =>
//       TwelveLabsApi.searchVideo(indexId, query),
//   });
// }

export function useSearchVideo(indexId, query) {
  return useQuery({
    queryKey: [keys.SEARCH, indexId, query],
    queryFn: () => TwelveLabsApi.searchVideo(indexId, query),
  });
}

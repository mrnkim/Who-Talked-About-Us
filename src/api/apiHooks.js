import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TwelveLabsApi from "./api";

export function useGetIndexes() {
  return useQuery({
    queryKey: ["indexes"],
    queryFn: TwelveLabsApi.getIndexes,
    // refetchOnWindowFocus: false,
  });
}

export function useCreateIndex() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (indexName) => TwelveLabsApi.createIndex(indexName),
    onSuccess: () => queryClient.invalidateQueries(["indexes"]),
    // refetchOnWindowFocus: false,
  });
}

export function useDeleteIndex() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (indexId) => TwelveLabsApi.deleteIndex(indexId),
    onSuccess: () => queryClient.invalidateQueries(["indexes"]),
    // refetchOnWindowFocus: false,
  });
}

export function useGetVideos(indexId) {
  return useQuery({
    queryKey: ["videos", indexId],
    queryFn: () => TwelveLabsApi.getVideos(indexId),
    // refetchOnWindowFocus: false,
  });
}

export function useSearchVideo() {
  return useMutation({
    mutationFn: ({ indexId, query }) =>
      TwelveLabsApi.searchVideo(indexId, query),
    // refetchOnWindowFocus: false,
  });
}

// export function useGetTask(taskId) {
//   const query = {
//     queryKey: ["task", taskId],
//     queryFn: () => TwelveLabsApi.getTask(taskId),
//     refetchOnWindowFocus: false,
//     refetchInterval: (data) => (data.status === "ready" ? false : 5000),
//     refetchIntervalInBackground: true,
//   };
//   return useQuery(query);
// }

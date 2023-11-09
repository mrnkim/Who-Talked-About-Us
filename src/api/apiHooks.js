import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TwelveLabsApi from "./api";

export function useGetIndexes() {
  return useQuery({ queryKey: ["indexes"], queryFn: TwelveLabsApi.getIndexes });
}

export function useCreateIndex() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (indexName) => TwelveLabsApi.createIndex(indexName),
    onSuccess: () => queryClient.invalidateQueries(["indexes"]),
  });
}

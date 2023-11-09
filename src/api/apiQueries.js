import { useQuery, useMutation } from "@tanstack/react-query";
import TwelveLabsApi from "./api";

export function useGetIndexes() {
  return useQuery({ key: ["indexes"], queryFn: TwelveLabsApi.getIndexes });
}

export function useCreateIndex() {
  return useMutation({
    mutationFn: (indexName) => TwelveLabsApi.createIndex(indexName),
  });
}

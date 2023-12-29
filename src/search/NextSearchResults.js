import { useGetSearchResults } from "../apiHooks/apiHooks";

export default function NextSearchResults({
  useSearchVideoData,
  setCombinedSearchResults,
}) {
  const { data } = useGetSearchResults(
    useSearchVideoData.page_info.next_page_token
  );
  setCombinedSearchResults((prevData) => [...prevData, ...data.data]);
}

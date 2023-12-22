import { React, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetVideosOfSearchResults } from "../apiHooks/apiHooks";
import keys from "../apiHooks/keys";
import "./SearchResults.css";
import SearchResult from "./SearchResult";
import { useInView } from "react-intersection-observer";
import axios from "axios";
import upIcon from "../svg/ChevronUpMini.svg";

const SERVER_BASE_URL = `${process.env.REACT_APP_SERVER_URL}:${process.env.REACT_APP_PORT_NUMBER}`;
const axiosInstance = axios.create({ baseURL: SERVER_BASE_URL });
const SEARCH_URL = "/search";
const INDEXES_URL = "/indexes";

/** Shows the search result
 *
 *  VideoComponents -> SearchResults
 *
 */

function SearchResults({ currIndex, finalSearchQuery, allAuthors }) {
  const queryClient = useQueryClient();
  const { ref, inView } = useInView();
  console.log("🚀 > SearchResults > inView=", inView);

  /** Get initial search results and corresponding videos */
  const {
    initialSearchData: {
      page_info: { next_page_token: initialNextPageToken } = {},
    } = {},
    initialSearchResults,
    initialSearchResultVideos,
    refetch,
  } = useGetVideosOfSearchResults(currIndex, finalSearchQuery);
  console.log(
    "🚀 > SearchResults > initialNextPageToken=",
    initialNextPageToken
  );
  const [nextPageToken, setNextPageToken] = useState(initialNextPageToken);
  // let nextPageToken =

  const [combinedSearchResults, setCombinedSearchResults] =
    useState(initialSearchResults);
  const [combinedSearchResultVideos, setCombinedSearchResultVideos] = useState(
    initialSearchResultVideos
  );
  const [organizedResults, setOrganizedResults] = useState(null);
  console.log("🚀 > SearchResults > organizedResults=", organizedResults);
  const [loading, setLoading] = useState(false); // Loading state

  async function fetchNextPage(pageToken) {
    try {
      const response = await axiosInstance.get(`${SEARCH_URL}/${pageToken}`);
      const data = response.data;
      return data;
    } catch (error) {
      console.error("Error fetching JSON video info:", error);
      throw error;
    }
  }

  async function fetchNextPageAndConcat(token) {
    try {
      setLoading(true); // Set loading to true before fetching the next page
      const nextPageResults = await fetchNextPage(token);

      const nextPageResultVideosPromises = nextPageResults.data.map(
        async (nextPageResult) => {
          const videoResponses = await axiosInstance.get(
            `${INDEXES_URL}/${currIndex}/videos/${nextPageResult.id}`
          );
          return videoResponses.data;
        }
      );

      const nextPageResultVideos = await Promise.all(
        nextPageResultVideosPromises
      );

      // Update state only after both asynchronous operations are completed
      setCombinedSearchResults((prevData) => [
        ...prevData,
        ...nextPageResults.data,
      ]);

      setCombinedSearchResultVideos((prevData) => [
        ...prevData,
        ...nextPageResultVideos,
      ]);

      if (nextPageResults) {
        setNextPageToken(nextPageResults.page_info?.next_page_token || null);
      }

      // Organize results after updating state
      const organizedResultsData = organizeResults(
        combinedSearchResults,
        combinedSearchResultVideos
      );
      setOrganizedResults(organizedResultsData);
    } catch (error) {
      console.error("Error fetching and concatenating next page:", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  }

  /** Function to convert seconds to "mm:ss" format */
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = remainingSeconds.toString().padStart(2, "0");
    return `${formattedMinutes}:${formattedSeconds}`;
  }

  /** Organize search results by author and video_id
   *
   * {vidAuthor: {videoTitle: results, videoTitle: results},
   *  vidAuthor2: {videoTitle: results},
   *  ...
   * }
   *
   * results = {clips: [clip, clip2...], id: 'video_id'}
   *
   *
   */

  function organizeResults(combinedSearchResults, combinedSearchResultVideos) {
    const organizedResults = {};
    if (combinedSearchResults && combinedSearchResultVideos) {
      combinedSearchResults.forEach((searchResult) => {
        const videoId = searchResult.id;
        const video = combinedSearchResultVideos.find(
          (searchResultVideo) => searchResultVideo._id === videoId
        );
        if (video) {
          const videoAuthor = video.metadata?.author;
          const videoTitle = video.metadata?.filename.replace(".mp4", "");
          if (!organizedResults[videoAuthor]) {
            organizedResults[videoAuthor] = {};
          }
          if (!organizedResults[videoAuthor][videoTitle]) {
            organizedResults[videoAuthor][videoTitle] = {};
          }
          organizedResults[videoAuthor][videoTitle] = searchResult;
        }
      });
    }
    return organizedResults;
  }
  /** Authors whose videos are not part of the search results */
  const noResultAuthors = [];
  for (let author of allAuthors) {
    const resultAuthors = organizedResults ? Object.keys(organizedResults) : [];
    if (!resultAuthors.includes(author)) {
      noResultAuthors.push(author);
    }
  }

  const handleLoadMore = () => {
    if (nextPageToken && !loading) {
      console.log("Fetching next page...");
      fetchNextPageAndConcat(nextPageToken);
      console.log("Next page fetched successfully");
    }
  };

  useEffect(() => {
    setNextPageToken(initialNextPageToken);
    setCombinedSearchResultVideos(initialSearchResultVideos);
    setCombinedSearchResults(initialSearchResults);
  }, [initialNextPageToken]);

  useEffect(() => {
    const fetchNextPageData = async () => {
      try {
        if (!inView && nextPageToken && !loading) {
          console.log("Fetching next page...");
          await fetchNextPageAndConcat(nextPageToken);
          console.log("Next page fetched successfully");
        }
      } catch (error) {
        console.error("Error fetching next page:", error);
      }
    };

    fetchNextPageData();
  }, [inView, nextPageToken, loading]);

  useEffect(() => {
    const organizedResults = organizeResults(
      combinedSearchResults,
      combinedSearchResultVideos
    );
    setOrganizedResults(organizedResults);
  }, [combinedSearchResults, combinedSearchResultVideos]);

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: [keys.SEARCH, currIndex, finalSearchQuery],
    });
  }, [currIndex, finalSearchQuery]);

  return (
    <div>
      {initialSearchResults && initialSearchResults.length === 0 && (
        <div className="title">No results. Let's try with other queries!</div>
      )}
      {initialSearchResults && initialSearchResults.length > 0 && (
        <div className="searchResultTitle">
          Search Results for "{finalSearchQuery}"
          {organizedResults &&
            Object.entries(organizedResults).map(
              ([videoAuthor, authVids], index) => {
                const totalSearchResults = Object.values(authVids).reduce(
                  (total, results) => total + (results.clips.length || 0),
                  0
                );
                return (
                  <div key={index} className="searchResultWrapper">
                    <SearchResult
                      videoAuthor={videoAuthor}
                      totalSearchResults={totalSearchResults}
                      refetch={refetch}
                      authVids={authVids}
                      searchResultVideos={combinedSearchResultVideos}
                      forwardedRef={
                        index === Object.keys(organizedResults).length - 1
                          ? ref
                          : undefined
                      }
                      loading={loading}
                    />
                  </div>
                );
              }
            )}
          {!nextPageToken && (
            <div className="channelPills">
              <div className="subtitle">
              😊 {Object.keys(organizedResults).length} Influencers talked about{" "}
                "{finalSearchQuery}"
              </div>
              {Array.from(new Set(Object.keys(organizedResults))).map(
                (author, index) => (
                  <div key={index} className="channelResultPill">
                    {author}
                  </div>
                )
              )}
            </div>
          )}
          {!nextPageToken && noResultAuthors.length > 0 && (
            <div className="channelPills">
              <div className="subtitle">
                😢 {new Set(noResultAuthors).size} Influencers have not
              </div>
              {Array.from(new Set(noResultAuthors)).map((author, index) => (
                <div key={index} className="channelNoResultPill">
                  {author}
                </div>
              ))}
            </div>
          )}
          {nextPageToken && (
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="showMoreButton"
            >
              {loading ? (
                "Loading..."
              ) : (
                <>
                  <img src={upIcon} alt="Icon" className="icon" /> Show More
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchResults;

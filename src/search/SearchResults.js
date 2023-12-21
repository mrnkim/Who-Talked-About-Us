import {
  React,
  Suspense,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Col, Row, Container } from "react-bootstrap";
import ReactPlayer from "react-player";
import {
  useGetSearchResults,
  useGetVideosOfSearchResults,
} from "../apiHooks/apiHooks";
import keys from "../apiHooks/keys";
import ErrorFallback from "../common/ErrorFallback";
import LoadingSpinner from "../common/LoadingSpinner";
import "./SearchResults.css";
import SearchResultList from "./SearchResultList";
import NextSearchResults from "./NextSearchResults";
import { useInView } from "react-intersection-observer";

/** Shows the search result
 *
 *  VideoComponents -> SearchResultList
 *
 */

function SearchResults({ currIndex, finalSearchQuery, allAuthors }) {
  const { ref, inView } = useInView();
  console.log("🚀 > SearchResults > inView =", inView);

  const {
    initialSearchData,
    initialSearchResults,
    initialSearchResultVideos,
    refetch,
  } = useGetVideosOfSearchResults(currIndex, finalSearchQuery);

  let nextPageToken = initialSearchData.page_info.next_page_token || null;

  const {
    data: useGetSearchResultsResponse,
    isSuccess,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    nextPage,
  } = useGetSearchResults(currIndex, nextPageToken);
  console.log("🚀 > SearchResults > nextPage=", nextPage);

  console.log("🚀 > SearchResults >  hasNextPage=", hasNextPage);
  console.log(
    "🚀 > SearchResults > useGetSearchResultsResponse=",
    useGetSearchResultsResponse
  );

  // const observer = useRef();
  // const lastSearchResultRef = useCallback(
  //   (node) => {
  //     if (isLoading) return;
  //     if (observer.current) observer.current.disconnect();
  //     observer.current = new IntersectionObserver((entries) => {
  //       if (entries[0].isIntersecting && nextPageToken) {
  //         return (
  //           <NextSearchResults
  //             useSearchVideoData={useSearchVideoData}
  //             setCombinedSearchResults={setCombinedSearchResults}
  //           />
  //         );
  //       }
  //     });
  //     if (node) observer.current.observe(node);
  //   },
  //   [isLoading, nextPageToken]
  // );

  useEffect(() => {
    if (!inView && hasNextPage) {
      console.log("Fetching next page...");

      fetchNextPage();
      console.log("Next page fetched successfully");
    }
  }, [inView, fetchNextPage, hasNextPage]);

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
  const organizedResults = {};
  if (initialSearchResults && initialSearchResultVideos) {
    initialSearchResults.forEach((searchResult) => {
      const videoId = searchResult.id;
      const video = initialSearchResultVideos.find(
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
  /** Authors whose videos are not part of the search results */
  const noResultAuthors = [];
  for (let author of allAuthors) {
    const resultAuthors = Object.keys(organizedResults);
    if (!resultAuthors.includes(author)) {
      noResultAuthors.push(author);
    }
  }

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
                  <div key={index}>
                    <SearchResultList
                      videoAuthor={videoAuthor}
                      totalSearchResults={totalSearchResults}
                      refetch={refetch}
                      authVids={authVids}
                      searchResultVideos={initialSearchResultVideos}
                      forwardedRef={index === 0 ? ref : undefined}
                    />
                  </div>
                );
              }
            )}
          {initialSearchResults &&
            initialSearchResults.length > 0 &&
            noResultAuthors.length > 0 && (
              <div className="channelPills">
                <div className="subtitle">No results from</div>
                {Array.from(new Set(noResultAuthors)).map((author, index) => (
                  <div key={index} className="channelNoResultPill">
                    {author}
                  </div>
                ))}
              </div>
            )}
        </div>
      )}
    </div>
  );
}

export default SearchResults;

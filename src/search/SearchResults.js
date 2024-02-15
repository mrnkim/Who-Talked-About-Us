import { React, useState, useEffect, Suspense } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import {
  useGetVideosOfSearchResults,
  fetchNextPageSearchResults,
  fetchNextPageSearchResultVideos,
} from "../apiHooks/apiHooks";
import ErrorFallback from "../common/ErrorFallback";
import keys from "../apiHooks/keys";
import "./SearchResults.css";
import SearchResult from "./SearchResult";
import upIcon from "../svg/ChevronUpMini.svg";
import LoadingSpinner from "../common/LoadingSpinner";

/** Shows the search result
 *
 *  VideoComponents -> SearchResults -> SearchResult
 *
 */

function SearchResults({ currIndex, finalSearchQuery, allAuthors }) {
  const queryClient = useQueryClient();

  /** Get initial search results and corresponding videos */
  const {
    initialSearchData: {
      page_info: { next_page_token: initialNextPageToken } = {},
    } = {},
    initialSearchResults,
    initialSearchResultVideos,
    refetch,
  } = useGetVideosOfSearchResults(currIndex, finalSearchQuery);

  const [nextPageToken, setNextPageToken] = useState(initialNextPageToken);
  const [combinedSearchResults, setCombinedSearchResults] =
    useState(initialSearchResults);
  const [combinedSearchResultVideos, setCombinedSearchResultVideos] = useState(
    initialSearchResultVideos
  );
  const [organizedResults, setOrganizedResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /** Fetch next page search results and update combined search results */
  async function ConcatNextPageResults() {
    try {
      setLoading(true);

      const nextPageResultsData = await fetchNextPageSearchResults(
        queryClient,
        nextPageToken
      );
      console.log("🚀 > ConcatNextPageResults > nextPageResultsData=", nextPageResultsData)

      const nextPageResults = nextPageResultsData.data;
      const nextPageResultVideosPromises = nextPageResults.map(
        async (nextPageResult) => {
          const videoResponses = await fetchNextPageSearchResultVideos(
            queryClient,
            currIndex,
            nextPageResult.id
          );
          return videoResponses;
        }
      );
      const nextPageResultVideos = await Promise.all(
        nextPageResultVideosPromises
      );

      setCombinedSearchResults((prevData) => [...prevData, ...nextPageResults]);
      setCombinedSearchResultVideos((prevData) => [
        ...prevData,
        ...nextPageResultVideos,
      ]);

      if (nextPageResults) {
        setNextPageToken(
          nextPageResultsData.page_info?.next_page_token || null
        );
      }
    } catch (error) {
      setError(error);
      setLoading(false);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
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
          const videoAuthor = video.user_metadata?.author;
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

  /** Load next page search result */
  const handleLoadMore = () => {
    if (nextPageToken && !loading) {
      ConcatNextPageResults();
    }
  };

  useEffect(() => {
    setNextPageToken(initialNextPageToken);
    setCombinedSearchResultVideos(initialSearchResultVideos);
    setCombinedSearchResults(initialSearchResults);
  }, [initialNextPageToken]);

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
        <div className="title">
          No results for "{finalSearchQuery}". Let's try with other queries!
        </div>
      )}

      {initialSearchResults && initialSearchResults.length > 0 && (
        <div>
          <div className="searchResultTitle">
            Search Results for "{finalSearchQuery}"
          </div>

          {organizedResults &&
            Object.entries(organizedResults).map(
              ([videoAuthor, authVids], index) => {
                const totalSearchResults = Object.values(authVids).reduce(
                  (total, results) => total + (results.clips.length || 0),
                  0
                );
                return (
                  <div key={index} className="searchResultWrapper">
                    <ErrorBoundary
                      FallbackComponent={({ error }) => (
                        <ErrorFallback error={error} />
                      )}
                      onReset={() => refetch()}
                      resetKeys={[keys.SEARCH, currIndex, finalSearchQuery]}
                    >
                      <Suspense fallback={<LoadingSpinner />}>
                        <SearchResult
                          videoAuthor={videoAuthor}
                          totalSearchResults={totalSearchResults}
                          authVids={authVids}
                          searchResultVideos={combinedSearchResultVideos}
                        />
                      </Suspense>
                    </ErrorBoundary>
                  </div>
                );
              }
            )}

          {organizedResults && !nextPageToken && (
            <Suspense fallback={<LoadingSpinner />}>
              <div className="channelPills">
                <div className="subtitle">
                  😊 {Object.keys(organizedResults).length} Influencers talked
                  about "{finalSearchQuery}"
                </div>
                {Array.from(new Set(Object.keys(organizedResults))).map(
                  (author, index) => (
                    <div key={index} className="channelResultPill">
                      {author}
                    </div>
                  )
                )}
              </div>
            </Suspense>
          )}

          {organizedResults && !nextPageToken && noResultAuthors.length > 0 && (
            <Suspense fallback={<LoadingSpinner />}>
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
            </Suspense>
          )}

          {organizedResults && nextPageToken && (
            <Suspense fallback={<LoadingSpinner />}>
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
            </Suspense>
          )}

          {error && <ErrorFallback error={error} />}
        </div>
      )}
    </div>
  );
}

export default SearchResults;

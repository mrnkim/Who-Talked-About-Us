import { React, useState, Suspense } from "react";
import { useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import {
  fetchNextPageSearchResults,
  fetchNextPageSearchResultVideos,
} from "../apiHooks/apiHooks";
import apiConfig from "../apiHooks/apiConfig";
import ErrorFallback from "../common/ErrorFallback";
import keys from "../apiHooks/keys";
import "./SearchResults.css";
import SearchResult from "./SearchResult";
import upIcon from "../svg/ChevronUpMini.svg";
import LoadingSpinner from "../common/LoadingSpinner";

function SearchResults({ currIndex, finalSearchQuery, allAuthors }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState(null);

  const {
    data: searchData,
    isLoading,
    error: searchError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [keys.SEARCH, currIndex, finalSearchQuery],
    queryFn: async ({ pageParam = null }) => {
      try {
        if (!pageParam) {
          // Initial search
          if (!currIndex || !finalSearchQuery) {
            throw new Error("Index ID and query are required");
          }

          // Create FormData
          const formData = new FormData();
          formData.append("index_id", currIndex);
          formData.append("query_text", finalSearchQuery);

          const response = await apiConfig.TWELVE_LABS_API.post(
            apiConfig.SEARCH_URL,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          if (!response.data) {
            throw new Error("No data received from search");
          }

          // Fetch videos for initial results
          const videosPromises = response.data.data.map((result) =>
            fetchNextPageSearchResultVideos(queryClient, currIndex, result.id)
          );
          const videos = await Promise.all(videosPromises);

          return {
            ...response.data,
            videos,
            nextPageToken: response.data.page_info?.next_page_token,
          };
        }

        // Fetch next page
        const nextPageData = await fetchNextPageSearchResults(
          queryClient,
          pageParam
        );
        const nextPageVideos = await Promise.all(
          nextPageData.data.map((result) =>
            fetchNextPageSearchResultVideos(queryClient, currIndex, result.id)
          )
        );

        return {
          ...nextPageData,
          videos: nextPageVideos,
          nextPageToken: nextPageData.page_info?.next_page_token,
        };
      } catch (error) {
        console.error("Search error:", error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPageToken || undefined,
    enabled: Boolean(currIndex && finalSearchQuery),
  });

  // Combine all pages of results
  const allResults = searchData?.pages.reduce(
    (acc, page) => ({
      data: [...(acc.data || []), ...(page.data || [])],
      videos: [...(acc.videos || []), ...(page.videos || [])],
    }),
    { data: [], videos: [] }
  );

  // Organize results by author and video
  const organizedResults = {};
  if (allResults?.data && allResults?.videos) {
    allResults.data.forEach((searchResult) => {
      const videoId = searchResult.id;
      const video = allResults.videos.find(
        (searchResultVideo) => searchResultVideo._id === videoId
      );
      if (video) {
        const videoAuthor = video.user_metadata?.author;
        const videoTitle = video.system_metadata?.filename.replace(".mp4", "");
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

  // Find authors with no results
  const noResultAuthors = allAuthors.filter(
    (author) => !Object.keys(organizedResults).includes(author)
  );

  /** Load next page search results */
  const handleLoadMore = async () => {
    if (isFetchingNextPage) return;
    try {
      await fetchNextPage();
    } catch (err) {
      console.error("Error loading more results:", err);
      setError(err);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (searchError) {
    return <ErrorFallback error={searchError} />;
  }

  return (
    <div>
      {(!allResults?.data || allResults.data.length === 0) && (
        <div className="title">
          No results for "{finalSearchQuery}". Let's try with other queries!
        </div>
      )}

      {allResults?.data && allResults.data.length > 0 && (
        <div>
          <div className="searchResultTitle">
            Search Results for "{finalSearchQuery}"
          </div>

          {Object.entries(organizedResults).map(
            ([videoAuthor, authVids], index) => {
              const totalSearchResults = Object.values(authVids).reduce(
                (total, results) => total + (results.clips?.length || 0),
                0
              );
              return (
                <div key={index} className="searchResultWrapper">
                  <ErrorBoundary
                    FallbackComponent={({ error }) => (
                      <ErrorFallback error={error} />
                    )}
                  >
                    <Suspense fallback={<LoadingSpinner />}>
                      <SearchResult
                        videoAuthor={videoAuthor}
                        totalSearchResults={totalSearchResults}
                        authVids={authVids}
                        searchResultVideos={allResults.videos}
                      />
                    </Suspense>
                  </ErrorBoundary>
                </div>
              );
            }
          )}

          {!hasNextPage && (
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

          {!hasNextPage && noResultAuthors.length > 0 && (
            <Suspense fallback={<LoadingSpinner />}>
              <div className="channelPills">
                <div className="subtitle">
                  😢 {noResultAuthors.length} Influencers have not
                </div>
                {noResultAuthors.map((author, index) => (
                  <div key={index} className="channelNoResultPill">
                    {author}
                  </div>
                ))}
              </div>
            </Suspense>
          )}

          {hasNextPage && (
            <Suspense fallback={<LoadingSpinner />}>
              <button
                onClick={handleLoadMore}
                disabled={isFetchingNextPage}
                className="showMoreButton"
              >
                {isFetchingNextPage ? (
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

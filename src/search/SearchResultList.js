import { React, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Col, Row, Container } from "react-bootstrap";
import ReactPlayer from "react-player";
import { useGetVideosOfSearchResults } from "../apiHooks/apiHooks";
import keys from "../apiHooks/keys";
import ErrorFallback from "../common/ErrorFallback";
import LoadingSpinner from "../common/LoadingSpinner";
import "./SearchResultList.css";

/** Shows the search result
 *
 *  VideoComponents -> SearchResultList
 *
 */

function SearchResultList({
  currIndex,
  finalSearchQuery,
  allAuthors,
  setIndexId,
}) {
  const { useSearchVideoData, searchResults, searchResultVideos, refetch } =
    useGetVideosOfSearchResults(currIndex, finalSearchQuery);
  console.log("🚀 > useSearchVideoData=", useSearchVideoData);
  console.log("🚀 > searchResults=", searchResults);

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
  if (searchResults && searchResultVideos) {
    searchResults.forEach((searchResult) => {
      const videoId = searchResult.id;
      const video = searchResultVideos.find(
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
  console.log("🚀 > organizedResults=", organizedResults);

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
      {searchResults && searchResults.length === 0 && (
        <div className="title">No results. Let's try with other queries!</div>
      )}

      {searchResults && searchResults.length > 0 && (
        <div className="searchResultTitle">
          Search Results for "{finalSearchQuery}"
          {organizedResults &&
            Object.entries(organizedResults).map(([videoAuthor, authVids]) => {
              const totalSearchResults = Object.values(authVids).reduce(
                (total, results) => total + (results.clips.length || 0),
                0
              );
              return (
                <div key={videoAuthor} className="m-3">
                  <div className="channelResultPill">
                    {videoAuthor} ({totalSearchResults}{" "}
                    {totalSearchResults <= 1 ? "Result" : "Results"})
                  </div>
                  <ErrorBoundary
                    FallbackComponent={ErrorFallback}
                    onReset={() => refetch()}
                    resetKeys={[keys.VIDEOS]}
                  >
                    <Suspense fallback={<LoadingSpinner />}>
                      <Row>
                        {Object.entries(authVids).map(
                          ([videoTitle, results]) => (
                            <Container key={videoTitle} className="mt-2 mb-2">
                              <h6
                                style={{ textAlign: "left", fontWeight: "600" }}
                              >
                                {videoTitle} ({results.clips.length})
                              </h6>
                              <Row>
                                {results.clips.map((clip, index) => (
                                  <Col
                                    sm={12}
                                    md={6}
                                    lg={4}
                                    xl={3}
                                    className="mb-4 mt-2"
                                    key={clip.video_id + "-" + index}
                                  >
                                    <ReactPlayer
                                      url={
                                        `${
                                          searchResultVideos.find(
                                            (vid) => vid._id === clip.video_id
                                          ).metadata.youtubeUrl
                                        }` +
                                        `?start=${clip.start}&end=${clip.end}`
                                      }
                                      controls
                                      width="100%"
                                      height="100%"
                                      light={clip.thumbnail_url}
                                    />
                                    <div className="resultDescription">
                                      Start {formatTime(clip.start)} | End{" "}
                                      {formatTime(clip.end)} |{" "}
                                      <span
                                        className="confidence"
                                        style={{
                                          backgroundColor:
                                            clip.confidence === "high"
                                              ? "#2EC29F"
                                              : clip.confidence === "medium"
                                              ? "#FDC14E"
                                              : "#B7B9B4",
                                        }}
                                      >
                                        {clip.confidence}
                                      </span>
                                    </div>
                                  </Col>
                                ))}
                              </Row>
                            </Container>
                          )
                        )}
                      </Row>
                    </Suspense>
                  </ErrorBoundary>
                </div>
              );
            })}
          {searchResults &&
            searchResults.length > 0 &&
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

export default SearchResultList;

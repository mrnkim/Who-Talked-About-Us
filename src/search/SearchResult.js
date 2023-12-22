import { React, Suspense, useState, useRef, useCallback } from "react";
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

export default function SearchResult({
  videoAuthor,
  totalSearchResults,
  refetch,
  authVids,
  searchResultVideos,
  forwardedRef,
  loading,
}) {
  /** Function to convert seconds to "mm:ss" format */
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = remainingSeconds.toString().padStart(2, "0");
    return `${formattedMinutes}:${formattedSeconds}`;
  }

  return (
    <div
      key={videoAuthor}
      className="m-3"
      ref={forwardedRef}
      style={{ minHeight: "50px" }}
    >
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
            {Object.entries(authVids).map(([videoTitle, results]) => (
              <Container key={videoTitle} className="mt-3 mb-3">
                <h6 style={{ textAlign: "left", fontWeight: "600" }}>
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
                            )?.metadata.youtubeUrl
                          }` + `?start=${clip.start}&end=${clip.end}`
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
            ))}
            {/* {loading && (
              <LoadingSpinner style={{ margin: "20px", padding: "10px" }} />
            )}{" "} */}
          </Row>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

import { React, Suspense, useState } from "react";
import { Col, Row, Container } from "react-bootstrap";
import ReactPlayer from "react-player";
import LoadingSpinner from "../common/LoadingSpinner";
import "./SearchResults.css";

/** Shows each search result with time blocks, confidence, and video player
 *
 * SearchResults -> SearchResult
 *
 */

export default function SearchResult({
  videoAuthor,
  totalSearchResults,
  authVids,
  searchResultVideos,
}) {
  const [thumbnailClicked, setThumbnailClicked] = useState(false);

  /** Function to convert seconds to "mm:ss" format */
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = remainingSeconds.toString().padStart(2, "0");
    return `${formattedMinutes}:${formattedSeconds}`;
  }

  /** Function to get video URL safely */
  function getVideoUrl(videoId) {
    const video = searchResultVideos?.find((vid) => vid._id === videoId);
    const videoUrl = video?.hls?.video_url;

    if (!videoUrl) {
      console.warn(`No video URL found for video ${videoId}`);
      return null;
    }

    return videoUrl;
  }

  return (
    <div key={videoAuthor} className="m-3" style={{ minHeight: "50px" }}>
      <div className="channelResultPill">
        {videoAuthor} ({totalSearchResults}{" "}
        {totalSearchResults <= 1 ? "Result" : "Results"})
      </div>
      <Suspense fallback={<LoadingSpinner />}>
        <Row>
          {Object.entries(authVids).map(([videoTitle, results]) => (
            <Container key={videoTitle} className="mt-3 mb-3">
              <h6 style={{ textAlign: "left", fontWeight: "600" }}>
                {videoTitle} ({results.clips.length})
              </h6>
              <Row>
                {results.clips.map((clip, index) => {
                  const videoUrl = getVideoUrl(clip.video_id);

                  return (
                    <Col
                      sm={12}
                      md={6}
                      lg={4}
                      xl={3}
                      className="mb-4 mt-2"
                      key={clip.video_id + "-" + index}
                    >
                      <div
                        onClick={() => setThumbnailClicked(true)}
                        style={{ cursor: "pointer" }}
                      >
                        {videoUrl ? (
                          <ReactPlayer
                            url={videoUrl}
                            controls
                            width="100%"
                            height="100%"
                            light={
                              <img
                                src={clip.thumbnail_url}
                                width="100%"
                                height="100%"
                                alt="clipThumbnail"
                              />
                            }
                            playing={thumbnailClicked}
                            onProgress={(state) => {
                              if (state.playedSeconds >= clip.end) {
                                const player = document.querySelector("video");
                                if (player) {
                                  player.currentTime = clip.start;
                                }
                              }
                            }}
                            onPlay={() => {
                              const player = document.querySelector("video");
                              if (player) {
                                player.currentTime = clip.start;
                              }
                            }}
                            config={{
                              file: {
                                forceHLS: true,
                              },
                            }}
                          />
                        ) : (
                          <img
                            src={clip.thumbnail_url}
                            width="100%"
                            height="100%"
                            alt="clipThumbnail"
                            style={{ objectFit: "cover" }}
                          />
                        )}
                      </div>
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
                  );
                })}
              </Row>
            </Container>
          ))}
        </Row>
      </Suspense>
    </div>
  );
}

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
                {results.clips.map((clip, index) => (
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
                      <ReactPlayer
                        url={
                          `${
                            searchResultVideos.find((vid) => {
                              return vid._id === clip.video_id;
                            })?.source?.url
                          }` + `?start=${clip.start}&end=${clip.end}`
                        }
                        controls
                        width="100%"
                        height="100%"
                        light={
                          <img
                            src={clip.thumbnail_url}
                            width="100%"
                            height="100%"
                          />
                        }
                        playing={thumbnailClicked}
                      ></ReactPlayer>
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
                ))}
              </Row>
            </Container>
          ))}
        </Row>
      </Suspense>
    </div>
  );
}

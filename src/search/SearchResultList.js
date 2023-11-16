import React from "react";
import { Col, Row, Container } from "react-bootstrap";
import ReactPlayer from "react-player";

import "./SearchResultList.css";

/** Shows the search result
 *
 *  VideoIndex -> SearchResultList
 */
function SearchResultList({ searchResults, videos }) {
  /** Function to convert seconds to "mm:ss" format */
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = remainingSeconds.toString().padStart(2, "0");
    return `${formattedMinutes}:${formattedSeconds}`;
  }

  /** Organize search results by author and video_id */
  const organizedResults = {};
  searchResults?.forEach((result) => {
    const videoId = result.video_id;
    const video = videos?.find((vid) => vid._id === videoId);

    if (video) {
      const videoAuthor = video.metadata.author;
      const videoTitle = video.metadata.filename.replace(".mp4", "");

      if (!organizedResults[videoAuthor]) {
        organizedResults[videoAuthor] = {};
      }

      if (!organizedResults[videoAuthor][videoTitle]) {
        organizedResults[videoAuthor][videoTitle] = [];
      }

      organizedResults[videoAuthor][videoTitle].push(result);
    }
  });

  const noResultAuthors = [];
  for (let video of videos) {
    const authors = Object.keys(organizedResults);
    const authorName = video.metadata.author;
    if (!authors.includes(authorName)) {
      noResultAuthors.push(authorName);
    }
  }

  return (
    <div>
      {organizedResults &&
        Object.entries(organizedResults).map(([videoAuthor, authVids]) => {
          const totalSearchResults = Object.values(authVids).reduce(
            (total, video) => total + video?.length,
            0
          );

          return (
            <div key={videoAuthor} className="m-3">
              <div className="channelResultPill">
                {videoAuthor} ({totalSearchResults}{" "}
                {totalSearchResults <= 1 ? "Result" : "Results"})
              </div>
              <Row>
                {Object.entries(authVids).map(([videoTitle, results]) => (
                  <Container
                    key={videoTitle}
                    className="videoResults mt-2 mb-2"
                  >
                    <h6
                      style={{
                        textAlign: "left",
                      }}
                    >
                      {videoTitle} ({results?.length})
                    </h6>
                    <Row>
                      {results.map((data, index) => (
                        <Col
                          sm={12}
                          md={6}
                          lg={4}
                          xl={3}
                          className="mb-4"
                          key={data.video_id + "-" + index}
                        >
                          <ReactPlayer
                            url={
                              `${
                                videos.find(
                                  (vid) => vid._id === results[0].video_id
                                ).metadata.youtubeUrl
                              }` + `?start=${data.start}&end=${data.end}`
                            }
                            controls
                            width="100%"
                            height="100%"
                            light={data.thumbnail_url}
                          />
                          <div className="resultDescription">
                            Start {formatTime(data.start)} | End{" "}
                            {formatTime(data.end)} |{" "}
                            <span
                              className="confidence"
                              style={{
                                backgroundColor:
                                  data.confidence === "high"
                                    ? "#2EC29F"
                                    : data.confidence === "medium"
                                    ? "#FDC14E"
                                    : "#B7B9B4",
                              }}
                            >
                              {data.confidence}
                            </span>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </Container>
                ))}
              </Row>
            </div>
          );
        })}

      {searchResults?.length > 0 && noResultAuthors.length > 0 && (
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
  );
}

export default SearchResultList;

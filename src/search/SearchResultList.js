import React from "react";
import { Col, Row, Badge, Container } from "react-bootstrap";
import ReactPlayer from "react-player";
import { useState, useRef } from "react";

function SearchResultList({ index_id, searchResults, videos }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const playerRef = useRef(null);

  const handleProgress = (progress, videoId) => {
  // Find the result with the matching video_id
    const result = searchResults.data.find((data) => data.video_id === videoId);

    // Check if the video has reached the 'end' time
    if (result && playerRef.current && progress.playedSeconds >= result.end) {
      // Seek the video back to the 'start' time
      playerRef.current.seekTo(result.start);
    }
  };

  // Function to convert seconds to "mm:ss" format
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = remainingSeconds.toString().padStart(2, "0");
    return `${formattedMinutes}:${formattedSeconds}`;
  }

  // Organize search results by author and video_id
  const organizedResults = {};
  searchResults.data.forEach((result) => {
    const videoId = result.video_id;
    const video = videos?.data.find((vid) => vid._id === videoId);
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

  for (let video of videos.data) {
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
            (total, video) => total + video.length,
            0
          );

          return (
            <div key={videoAuthor} className="m-3">
              <Badge
                pill
                bg="primary"
                style={{
                  fontSize: "1.2rem",
                  padding: "0.5em",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                {videoAuthor} ({totalSearchResults}{" "}
                {totalSearchResults <= 1 ? "Result" : "Results"})
              </Badge>
              <Row>
                {Object.entries(authVids).map(([videoTitle, results]) => (
                  <Container
                    key={videoTitle}
                    className="videoResults mt-2 mb-2"
                  >
                    <h5
                      style={{
                        fontWeight: "bold",
                        textAlign: "left",
                      }}
                    >
                      {videoTitle} ({results.length})
                    </h5>
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
                                videos.data.find(
                                  (vid) => vid._id === results[0].video_id
                                ).metadata.youtubeUrl
                              }` + `?start=${data.start}&end=${data.end}`
                            }
                            controls
                            width="100%"
                            height="100%"
                            light={data.thumbnail_url}
                            loop
                            config={{
                              youtube: {
                                playerVars: {
                                  start: data.start, // Set the start time for looping
                                },
                              },
                            }}
                            onProgress={(progress) =>
                              handleProgress(progress, data.video_id)
                            }
                          />

                          <div style={{ fontSize: "0.9rem" }}>
                            Start: {formatTime(data.start)}, End:{" "}
                            {formatTime(data.end)},{" "}
                            <span
                              style={{
                                color:
                                  data.confidence === "high"
                                    ? "green"
                                    : data.confidence === "medium"
                                    ? "orange"
                                    : "red",
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
      {searchResults.data.length > 0 && noResultAuthors.length > 0 && (
        <div style={{ fontSize: "2rem", textAlign: "left", marginTop: "3rem" }}>
          <span>
            <i className="bi bi-emoji-frown"></i> No results from...
          </span>
          {Array.from(new Set(noResultAuthors)).map((author, index) => (
            <Badge
              key={index}
              className="m-1"
              pill
              bg="danger"
              style={{ fontSize: "1.2rem", padding: "0.5em" }}
            >
              {author}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchResultList;

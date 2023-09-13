import React from "react";
import { Col, Row, Badge, Container } from "react-bootstrap";
import Video from "../videos/Video";
import VideoSegmentPlayer from "../videos/VideoSegmentPlayer";
import ReactPlayer from "react-player";

function SearchResultList({ index_id, searchResults, videos }) {
  // Organize search results by author and video_id
  const organizedResults = {};
  console.log("🚀 > SearchResultList > organizedResults=", organizedResults);
  searchResults.data.forEach((result) => {
    const videoId = result.video_id;
    const video = videos.data.find((vid) => vid._id === videoId);
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
  console.log("🚀 > SearchResultList > noResultAuthors=", noResultAuthors);

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
                          className="mb-3"
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
                          />
                          <div style={{ fontSize: "0.9rem" }}>
                            Start: {data.start}, End: {data.end},{" "}
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

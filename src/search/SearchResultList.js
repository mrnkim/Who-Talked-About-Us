import React from "react";
import { Col, Row, Badge, Container } from "react-bootstrap";
import Video from "../videos/Video";

function SearchResultList({ index_id, searchResults, videos }) {
  // Organize search results by author and video_id
  const organizedResults = {};
  console.log("🚀 > SearchResultList > organizedResults=", organizedResults);
  searchResults.data.forEach((result) => {
    const videoId = result.video_id;
    const videoAuthor = videos.data.find((vid) => vid._id === videoId).metadata
      .author;
    const videoTitle = videos.data
      .find((vid) => vid._id === videoId)
      .metadata.filename.replace(".mp4", "");

    if (!organizedResults[videoAuthor]) {
      organizedResults[videoAuthor] = {};
    }

    if (!organizedResults[videoAuthor][videoTitle]) {
      organizedResults[videoAuthor][videoTitle] = [];
    }

    organizedResults[videoAuthor][videoTitle].push(result);
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
        Object.entries(organizedResults).map(([videoAuthor, videos]) => {
          const totalSearchResults = Object.values(videos).reduce(
            (total, video) => total + video.length,
            0
          );

          return (
            <div key={videoAuthor}>
              <h2>
                {videoAuthor} ({totalSearchResults})
              </h2>
              <Row>
                {Object.entries(videos).map(([videoTitle, results]) => (
                  <Container key={videoTitle}>
                    <h4 style={{ textAlign: "left" }}>
                      Video Title: {videoTitle} ({results.length})
                    </h4>
                    <Row>
                      {results.map((data, index) => (
                        <Col
                          sm={12}
                          md={6}
                          lg={4}
                          xl={3}
                          className="mb-4"
                          key={data._id + "-" + index}
                        >
                          <Video
                            index_id={index_id}
                            video_id={data.video_id}
                            start={data.start}
                            end={data.end}
                            showDeleteButton={false}
                          />
                          Start: {data.start}, End: {data.end}, Confidence:{" "}
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
        <div>
          <h2>Channels with no search results</h2>
          {noResultAuthors.map((author, index) => (
            <Badge key={index} className="mr-2">
              {author}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchResultList;

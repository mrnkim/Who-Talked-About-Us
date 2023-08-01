import React from "react";
import { Col } from "react-bootstrap";
import Video from "../videos/Video";

/** Shows search results
 *
 *  VideoIndex -> SearchResultList -> Video
 */

function SearchResultList({ index_id, searchResults }) {
  return searchResults.data.map((data, index) => (
    <Col sm={12} md={6} lg={4} xl={3} className="mb-4" key={data._id + "-" + index}>
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
  ));
}

export default SearchResultList;

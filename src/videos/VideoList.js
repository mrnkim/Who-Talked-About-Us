import React from "react";
import { Col, Badge, Container } from "react-bootstrap";
import ReactPlayer from "react-player";
import "./VideoList.css";

/** Shows list of the video in an index
 *
 *  VideoIndex -> VideoList -> Video
 */

function VideoList({ index_id, videos, deleteVideo }) {
  return videos.data.map((video, index) => (
    <Col
      sm={12}
      md={6}
      lg={4}
      xl={3}
      className="mb-5"
      key={video._id + "-" + index}
    >
      <ReactPlayer
        url={video.metadata.youtubeUrl}
        controls
        width="100%"
        height="100%"
      ></ReactPlayer>
      <div className="channelAndVideoName">
        <Badge bg="primary" pill style={{ marginRight: "0.5rem" }}>
          {video.metadata.author}
        </Badge>
        <span className="filename-text">
          {video.metadata.filename.replace(".mp4", "")}
        </span>
      </div>
    </Col>
  ));
}

export default VideoList;

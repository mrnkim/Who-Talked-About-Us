import React from "react";
import { Col, Badge } from "react-bootstrap";
import ReactPlayer from "react-player";
import "./VideoList.css";

/** Shows list of the video in an index
 *
 *  VideoIndex -> VideoList -> Video
 */
function VideoList({ videos }) {
  return videos.data.map((video, index) => (
    <Col
      sm={12}
      md={6}
      lg={4}
      xl={3}
      className="mb-5 mt-3"
      key={video._id + "-" + index}
    >
      <ReactPlayer
        url={video.metadata.youtubeUrl}
        controls
        width="100%"
        height="100%"
      ></ReactPlayer>
      <div className="channelAndVideoName">
        <div className="channelPillSmall">{video.metadata.author}</div>
        <div className="filename-text">
          {video.metadata.filename.replace(".mp4", "")}
        </div>
      </div>
    </Col>
  ));
}

export default VideoList;

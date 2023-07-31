import React from "react";
import { Col } from "react-bootstrap";
import Video from "./Video";

/** Shows list of the video in an index
 *
 *  VideoIndex -> VideoList -> Video
 */

function VideoList({ index_id, videos, deleteVideo }) {
  return videos.data.map((data) => (
    <Col sm={12} md={6} lg={4} xl={3} className="mb-4" key={data._id}>
      <Video
        index_id={index_id}
        video_id={data._id}
        deleteVideo={deleteVideo}
        showDeleteButton={true}
        key={data._id}
      />
    </Col>
  ));
}

export default VideoList;

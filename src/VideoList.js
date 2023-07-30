import React from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import Video from "./Video";
import { v4 as uuidv4 } from "uuid";

function VideoList({ index_id, videos, deleteVideo }) {
  return videos.data.map((data) => (
    <Col sm={12} md={6} lg={4} xl={3} className="mb-4" key={uuidv4()}>
      <Video
        index_id={index_id}
        video_id={data._id}
        deleteVideo={deleteVideo}
        showDeleteButton={true}
        key={uuidv4()}
      />
    </Col>
  ));
}

export default VideoList;

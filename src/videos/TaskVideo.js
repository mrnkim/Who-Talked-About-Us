import { Container, Card } from "react-bootstrap";
import "./TaskVideo.css";

function TaskVideo({ taskVideo }) {
  return (
    <Container key={taskVideo.video_url || taskVideo.url} className="taskVideo">
      <Container>
        <Card style={{ border: "none", margin: "0.5rem" }}>
          <a
            href={taskVideo.video_url || taskVideo.url}
            target="_blank"
            rel="noreferrer"
          >
            <Card.Img
              src={taskVideo.thumbnails[0].url || taskVideo.bestThumbnail.url}
              style={{ width: "100%", height: "100%" }}
            />
          </a>
        </Card>
        <Card.Text className="taskVideoTitle">{taskVideo.title}</Card.Text>
      </Container>
    </Container>
  );
}

export default TaskVideo;

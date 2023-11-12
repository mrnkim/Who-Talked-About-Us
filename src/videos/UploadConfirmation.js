import { Container } from "react-bootstrap";
import "./UploadYouTubeVideo.css";

export function UploadConfirmation({
  indexYouTubeVideos,
  pendingApiRequest,
  handleReset,
  mainMessage,
}) {
  return (
    <Container className="wrapper">
      <Container
        direction="row"
        sx={{ pb: "2vh", width: "100%", bgcolor: "#121212", "z-index": 5 }}
        position="fixed"
        top="0"
        justifycontent="center"
        alignitems="end"
      >
        <Container className="m-3">
          <button
            className="button"
            onClick={indexYouTubeVideos}
            disabled={pendingApiRequest ? true : false}
            style={{ marginRight: "5px" }}
          >
            Continue
          </button>
          <button
            className="button"
            onClick={handleReset}
            disabled={pendingApiRequest ? true : false}
          >
            Back
          </button>
        </Container>
      </Container>

      <Container className="mainMessageWrapper">{mainMessage}</Container>

      {/* <Container fluid>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "8px",
            justifyContent: "center",
            alignitems: "center",
          }}
        >
          {taskVideos.length === 1 ? (
            <div className="single-video">{taskVideos}</div>
          ) : (
            taskVideos
          )}
        </div>
      </Container> */}
    </Container>
  );
}

import { Container } from "react-bootstrap";
import "./UploadForm.css";

/** Allow an user to either proceed to index video or go back
 *
 *  UploadYouTubeVideo -> UploadConfirmation
 *
 */

function UploadConfirmation({
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
    </Container>
  );
}

export default UploadConfirmation;

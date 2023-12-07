import { Container } from "react-bootstrap";
import uploadIcon from "../svg/Upload.svg";
import "./UploadForm.css";

/** Video upload form
 *
 *  UploadYouTubeVideo -> UploadForm
 *
 */

function UploadForm({
  selectedJSON,
  youtubeChannelId,
  youtubePlaylistId,
  handleJSONSelect,
  indexId,
  handleYoutubeChannelIdEntry,
  handleYoutubePlaylistIdEntry,
  getInfo,
  handleReset,
  mainMessage,
  pendingApiRequest,
}) {
  return (
    <Container
      display="flex"
      justifycontent="center"
      alignitems="center"
      direction="column"
    >
      <Container
        style={{ marginBottom: "1rem" }}
        display="flex"
        justifycontent="center"
        alignitems="center"
      >
        <label
          htmlFor="jsonFileInput"
          className={
            !!selectedJSON || !!youtubeChannelId || !!youtubePlaylistId
              ? "jsonDisabled"
              : "selectJsonButton"
          }
        >
          Select JSON File
        </label>
        <input
          id="jsonFileInput"
          type="file"
          accept=".json"
          hidden
          onChange={handleJSONSelect}
          disabled={
            !!youtubeChannelId || !!youtubePlaylistId || pendingApiRequest
          }
          value={undefined}
        />
        <span className="selectedFile">
          Selected File:
          {selectedJSON ? selectedJSON.name : "none"}{" "}
        </span>
      </Container>

      <Container display="flex" xs={3} style={{ marginBottom: "1rem" }}>
        <input
          className={
            !!selectedJSON || !!indexId || !!youtubePlaylistId
              ? "customDisabled"
              : "youTubeId"
          }
          placeholder="YouTube Channel ID"
          onChange={handleYoutubeChannelIdEntry}
          disabled={!!selectedJSON || !!youtubePlaylistId}
          value={youtubeChannelId}
        />
      </Container>

      <Container display="flex" xs={3} style={{ marginBottom: "1rem" }}>
        <input
          className={
            !!selectedJSON || !!indexId || !!youtubeChannelId
              ? "customDisabled"
              : "youTubeId"
          }
          placeholder="YouTube Playlist ID"
          onChange={handleYoutubePlaylistIdEntry}
          disabled={!!selectedJSON || !!youtubeChannelId}
          value={youtubePlaylistId}
        />
      </Container>

      <Container display="flex" className="buttons">
        <button className="button" onClick={getInfo}>
          {uploadIcon && (
            <img src={uploadIcon} alt="Icon" className="uploadIcon" />
          )}
          Upload
        </button>
        <button className="button cancel" onClick={handleReset}>
          Cancel
        </button>
      </Container>
      <Container className="mainMessageWrapper">{mainMessage}</Container>
    </Container>
  );
}

export default UploadForm;

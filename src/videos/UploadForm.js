import { Container } from "react-bootstrap";
import uploadIcon from "../svg/Upload.svg";
import infoIcon from "../svg/Info.svg";
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
    <Container className="upload-form-container">
      <Container className="json-input-container">
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

      <Container className="input-field-container">
        <div className="inputWithInfo">
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
          <a
            href="https://mixedanalytics.com/blog/find-a-youtube-channel-id/"
            target="_blank"
            rel="noopener noreferrer"
            className="helpLink"
          >
            <img src={infoIcon} alt="Help" className="infoIcon" />
          </a>
        </div>
      </Container>

      <Container className="input-field-container">
        <div className="inputWithInfo">
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
          <a
            href="https://www.sociablekit.com/find-youtube-playlist-id/#:~:text=Go%20to%20your%20target%20YouTube,playlist%20ID%20is%20PLFs4vir_WsTwEd%2DnJgVJCZPNL3HALHHpF"
            target="_blank"
            rel="noopener noreferrer"
            className="helpLink"
          >
            <img src={infoIcon} alt="Help" className="infoIcon" />
          </a>
        </div>
      </Container>

      <Container className="buttons-container">
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

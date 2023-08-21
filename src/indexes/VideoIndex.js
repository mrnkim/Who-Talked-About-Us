import { Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import SearchForm from "../search/SearchForm";
import TwelveLabsApi from "../api/api";
import UploadForm from "../videos/UploadForm";
import UploadYoutubeVideo from "../videos/UploadYouTubeVideo";
import { Container, Row, Col, Alert } from "react-bootstrap";
import SearchResultList from "../search/SearchResultList";
import VideoList from "../videos/VideoList";

// const SERVER_BASE_URL = new URL("http://localhost:4000");
// const INDEX_ID_INFO_URL = new URL("/get-index-info", SERVER_BASE_URL);
// const JSON_VIDEO_INFO_URL = new URL("/json-video-info", SERVER_BASE_URL);
// const CHANNEL_VIDEO_INFO_URL = new URL("/channel-video-info", SERVER_BASE_URL);
// const DOWNLOAD_URL = new URL("/download", SERVER_BASE_URL);
// const CHECK_TASKS_URL = new URL("/check-tasks", SERVER_BASE_URL);

/** Show video list and videos, search form and search result list
 *
 * - showComponents: state whether to show the components or not
 *                   true or false
 *
 *
 * - videos: list of videos and loading state
 *
 *   { data: [{_id: '1', created_at: '2023-07-30T21:24:25Z', updated_at: {…}', ...},
 *            {_id: '2', created_at: '2023-07-31T21:24:25Z', updated_at: {…}', ...}]
 *            , isLoading: false }
 *
 *
 * - searchResults: list of videos and loading state
 *
 *   { data: [{score: 92.28, start: 260, end: 263, video_id: '1', confidence: 'high', ...},
 *            {score: 92.28, start: 316, end: 322, video_id: '3', confidence: 'medium', ...} ]
 *            , isLoading: false }
 *
 *
 * - taskResponse: status of a video uploading task
 *
 *   {video_id: '1', status: 'pending'}
 *
 *
 * App -> VideoIndex -> { SearchForm, SearchResultList, UploadForm, VideoList}
 */

function VideoIndex({ index, deleteIndex, index_id }) {
  const currIndex = index._id;
  const [showComponents, setShowComponents] = useState(false);
  const [videos, setVideos] = useState({ data: null, isLoading: true });
  const [searchResults, setSearchResults] = useState({
    data: [],
    isLoading: true,
  });
  const [taskResponse, setTaskResponse] = useState({
    video_id: null,
    status: null,
  });
  const [isUploading, setUploading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [error, setError] = useState("");
  const [indexedVideos, setIndexedVideos] = useState();

  useEffect(() => {
    if (taskResponse.status === "ready") {
      setVideos((videos) => ({
        data: [...videos.data, taskResponse.video_id],
        isLoading: false,
      }));
    }
  }, [taskResponse]);

  useEffect(() => {
    fetchVideos();
  }, []);

  /** Fetches videos and update videos state */
  async function fetchVideos() {
    const responses = await TwelveLabsApi.getVideos(currIndex);
    setVideos({ data: responses, isLoading: false });
  }

  /** Searches videos in an index with a given query*/
  async function searchVideo(indexId, query) {
    const result = await TwelveLabsApi.searchVideo(indexId, query);
    setSearchResults({
      data: [...result?.data],
      isLoading: false,
    });
    setSearchPerformed(true);
  }

  /** Uploads video and check status of the uploading task every 5 seconds */
  async function uploadVideo(indexId, videoUrl) {
    //download videos using ytdl

    setUploading(true);
    const newTask = await TwelveLabsApi.uploadVideo(indexId, videoUrl);

    if (newTask) {
      const intervalId = setInterval(async () => {
        let response = await TwelveLabsApi.checkStatus(newTask._id);
        setTaskResponse({
          video_id: response.video_id,
          status: response.status,
        });
        console.log("🚀 > intervalId > newVideoStatus=", response.status);

        if (response.status === "ready") {
          setUploading(false);
          fetchVideos();
          clearInterval(intervalId);
        }
      }, 5000);
    } else {
      setError("Failed to get new task for uploading a video");
    }
  }

  /** Deletes a video from an index  */
  async function deleteVideo(indexId, videoId) {
    try {
      const response = await TwelveLabsApi.deleteVideo(indexId, videoId);
      //TODO: add validation if response is success
      const updatedVideos = videos.data.filter(
        (video) => video._id !== videoId
      );
      setVideos((videos) => ({
        data: updatedVideos,
        isLoading: false,
      }));
    } catch (err) {
      console.error(err);
    }
  }

  /** Toggle whether to show or not show the components  */
  function handleClick() {
    setShowComponents(!showComponents);
  }

  return (
    <div>
      <Row className="align-items-center">
        <Col>
          <Button
            variant="secondary"
            onClick={handleClick}
            style={{ width: "100%" }}
          >
            {index.index_name}
          </Button>
        </Col>
        <Col xs="auto">
          <Button variant="danger" onClick={() => deleteIndex(currIndex)}>
            Delete
          </Button>
        </Col>
      </Row>
      {showComponents && (
        <div>
          <div>
            <h2 className="m-5">🔎 Search Results</h2>
            <Container className="m-5">
              <SearchForm index={currIndex} search={searchVideo} />
            </Container>
            <Container fluid className="m-3">
              <Row>
                {searchPerformed &&
                  !searchResults.isLoading &&
                  searchResults.data.length === 0 && <p>No results found</p>}
                {searchResults.data && (
                  <SearchResultList
                    searchResults={searchResults}
                    index_id={currIndex}
                  />
                )}
              </Row>
            </Container>
          </div>
          <div>
            <div>
              <h2>📹 All Videos</h2>
              <Container className="m-5">
                <UploadYoutubeVideo
                  indexedVideos={indexedVideos}
                  setIndexedVideos={setIndexedVideos}
                  index={index}
                  index_id={index_id}
                />

                <Row className="m-3">
                  {isUploading && (
                    <p>It might take a couple of minutes to finish uploading</p>
                  )}
                  {error && (
                    <Alert variant="danger" dismissible>
                      {error}
                    </Alert>
                  )}
                  {isUploading && taskResponse.status && (
                    <div>
                      <p>Status: {taskResponse.status}...</p>
                    </div>
                  )}
                </Row>
              </Container>
            </div>
            <Container fluid className="m-3">
              <Row>
                {videos.data && (
                  <VideoList
                    index_id={currIndex}
                    videos={videos}
                    deleteVideo={deleteVideo}
                  />
                )}
              </Row>
            </Container>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoIndex;

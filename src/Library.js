import { Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import SearchForm from "./SearchForm";
import TwelveLabsApi from "./api";
import VideoList from "./VideoList";
import UploadForm from "./UploadForm";
import { Container, Row, Col } from "react-bootstrap";
import SearchResultList from "./SearchResultList";

function Library({ index, deleteIndex }) {
  const currIndex = index._id;
  const [showComponents, setShowComponents] = useState(false);
  const [videos, setVideos] = useState({ data: null, isLoading: true });
  const [searchResults, setSearchResults] = useState({
    data: [],
    isLoading: true,
  });
  console.log("🚀 > Library > searchResults=", searchResults);
  const [taskResponse, setTaskResponse] = useState({
    video_id: null,
    status: null,
  });
  const [isUploading, setUploading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

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

  async function fetchVideos() {
    const responses = await TwelveLabsApi.getVideos(currIndex);
    setVideos({ data: responses, isLoading: false });
  }

  async function searchVideo(indexId, query) {
    const result = await TwelveLabsApi.searchVideo(indexId, query);
    setSearchResults({
      data: [...result?.data],
      isLoading: false,
    });
    setSearchPerformed(true);
  }

  async function uploadVideo(indexId, videoUrl) {
    setUploading(true);
    const newTask = await TwelveLabsApi.uploadVideo(indexId, videoUrl);
    console.log("🚀 > uploadVideo > newTask=", newTask);

    const intervalId = setInterval(async () => {
      let response = await TwelveLabsApi.checkStatus(newTask._id);
      setTaskResponse({ video_id: response.video_id, status: response.status });
      console.log("🚀 > intervalId > newVideoStatus=", response.status);

      if (response.status === "ready") {
        setUploading(false);
        fetchVideos();
        clearInterval(intervalId);
      }
    }, 5000);
  }

  async function deleteVideo(indexId, videoId) {
    await TwelveLabsApi.deleteVideo(indexId, videoId);
    setVideos((prevState) => ({
      ...prevState,
      data: prevState.data.filter((video) => video._id !== videoId),
    }));
  }

  const handleClick = () => {
    setShowComponents(!showComponents);
  };
  console.log("Is UploadForm rendered?", showComponents && <UploadForm />);

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
                <UploadForm
                  index={currIndex}
                  upload={uploadVideo}
                  data-testid="upload-form"
                />
                <Row className="m-3">
                  {isUploading && (
                    <p>It might take a couple of minutes to finish uploading</p>
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

export default Library;

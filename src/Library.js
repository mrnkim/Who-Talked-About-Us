import { Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import SearchForm from "./SearchForm";
import TwelveLabsApi from "./api";
import Video from "./Video";
import VideoList from "./VideoList";
import SearchResult from "./SearchResult";
import UploadForm from "./UploadForm";
import { Container, Row, Col } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";

function Library({ data }) {
  const currIndex = data._id;
  const [showComponents, setShowComponents] = useState(false);
  const [videos, setVideos] = useState({ data: null, isLoading: true });
  console.log("🚀 > Library > videos=", videos);
  const [searchResults, setSearchResults] = useState({
    data: [],
    isLoading: true,
  });
  const [taskResponse, setTaskResponse] = useState({
    video_id: null,
    status: null,
  });
  const [isUploading, setUploading] = useState(false);

  console.log("🚀 > Library > taskResponse=", taskResponse);

  useEffect(() => {
    if (taskResponse.status === "ready") {
      setVideos((videos) => ({
        data: [...videos.data, taskResponse.video_id],
        isLoading: false,
      }));
    }
  }, [taskResponse]);

  useEffect(function fetchVideosOnMount() {
    async function fetchVideos() {
      const responses = await TwelveLabsApi.getVideos(currIndex);
      setVideos({ data: responses, isLoading: false });
    }
    fetchVideos();
  }, []);

  async function searchVideo(indexId, query) {
    const result = await TwelveLabsApi.searchVideo(indexId, query);
    setSearchResults({
      data: [...result?.data],
      isLoading: false,
    });
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
        clearInterval(intervalId);
      }
    }, 5000);
  }

  const handleClick = () => {
    setShowComponents(!showComponents);
  };

  return (
    <div>
      <Row>
        <Button variant="secondary" onClick={handleClick}>
          {data.index_name}
        </Button>
      </Row>
      {showComponents && (
        <div>
          {searchResults.data && (
            <div>
              <h2 className="m-5">🔎 Search Results</h2>
              <Container className="m-5">
                <SearchForm index={currIndex} search={searchVideo} />
              </Container>
              <Container fluid className="m-3">
                <Row>
                  {searchResults.data.map((data) => (
                    <Col
                      sm={12}
                      md={6}
                      lg={4}
                      xl={3}
                      className="mb-4"
                      key={uuidv4()}
                    >
                      <Video
                        index_id={currIndex}
                        video_id={data.video_id}
                        start={data.start}
                        end={data.end}
                      />
                      Start: {data.start}, End: {data.end}, Confidence:{" "}
                      <span
                        style={{
                          color:
                            data.confidence === "high"
                              ? "green"
                              : data.confidence === "medium"
                              ? "orange"
                              : "red",
                        }}
                      >
                        {data.confidence}
                      </span>
                    </Col>
                  ))}
                </Row>
              </Container>
            </div>
          )}
          <div>
            <div>
              <h2>📹 All Videos</h2>
              <Container className="m-5">
                <UploadForm index={currIndex} upload={uploadVideo} />
                <Row className="m-3">
                  {isUploading && taskResponse.status && (
                    <p>{taskResponse.status}...</p>
                  )}
                </Row>
              </Container>
            </div>
            <Container fluid className="m-3">
              <Row>
                {videos.data &&
                  videos.data.map((data) => (
                    <Col
                      sm={12}
                      md={6}
                      lg={4}
                      xl={3}
                      className="mb-4"
                      key={data._id}
                    >
                      <Video index_id={currIndex} video_id={data._id} />
                    </Col>
                  ))}
              </Row>
            </Container>
          </div>
        </div>
      )}
    </div>
  );
}

export default Library;

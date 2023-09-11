import { Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import SearchForm from "../search/SearchForm";
import TwelveLabsApi from "../api/api";
import UploadForm from "../videos/UploadForm";
import UploadYoutubeVideo from "../videos/UploadYouTubeVideo";
import { Container, Row, Col, Alert } from "react-bootstrap";
import SearchResultList from "../search/SearchResultList";
import VideoList from "../videos/VideoList";
import axios from "axios";
import Badge from "react-bootstrap/Badge";
import Stack from "react-bootstrap/Stack";

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

const SERVER_BASE_URL = new URL("http://localhost:4001");
const FETCH_VIDEOS_URL = new URL("fetch-videos", SERVER_BASE_URL);

function VideoIndex({ index, deleteIndex, index_id }) {
  const currIndex = index._id;
  const [taskVideos, setTaskVideos] = useState(null);
  console.log("🚀 > VideoIndex > taskVideos=", taskVideos);
  const [showComponents, setShowComponents] = useState(false);
  const [videos, setVideos] = useState({ data: null, isLoading: true });
  console.log("🚀 > VideoIndex > videos=", videos);
  const [searchResults, setSearchResults] = useState({
    data: [],
    isLoading: true,
  });
  console.log("🚀 > VideoIndex > searchResults=", searchResults);
  const [taskResponse, setTaskResponse] = useState({
    video_id: null,
    status: null,
  });
  const [isUploading, setUploading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [error, setError] = useState("");
  const [indexedVideos, setIndexedVideos] = useState();
  const [searchQuery, setSearchQuery] = useState(null);

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
    updateMetadata();
  }, [indexedVideos]);

  /** Fetches videos and update videos state */
  const fetchVideos = async () => {
    const queryUrl = FETCH_VIDEOS_URL;
    queryUrl.searchParams.set("INDEX_ID", currIndex);
    const response = await fetch(queryUrl.href);
    const data = await response.json();
    setVideos({ data: data.data, isLoading: false });
  };

  /** Add "author" and "youtubeUrl" meta data to each video **/
  async function updateMetadata() {
    if (indexedVideos) {
      for (const indexedVid of indexedVideos) {
        const matchingVid = taskVideos?.find(
          (taskVid) =>
            taskVid.metadata.filename === indexedVid.metadata.filename
        );
        console.log("🚀 > indexedVideos.forEach > matchingVid=", matchingVid);

        if (matchingVid) {
          const authorName = matchingVid.author.name;
          console.log("🚀 > indexedVideos.forEach > AUTHOR NAME=", authorName);
          const youtubeUrl = matchingVid.video_url || matchingVid.shortUrl;
          console.log("🚀 > updateMetadata > YouTubeUrl=", youtubeUrl);
          const TWELVE_LABS_API_KEY = process.env.REACT_APP_API_KEY;

          const VIDEO_URL = `${process.env.REACT_APP_API_URL}/indexes/${currIndex}/videos/${indexedVid._id}`;

          console.log("🚀 > updateMetadata > VIDEO_URL=", VIDEO_URL);
          const data = {
            metadata: {
              author: authorName,
              youtubeUrl: youtubeUrl,
            },
          };

          const options = {
            method: "PUT",
            url: VIDEO_URL,
            headers: {
              "Content-Type": "application/json",
              "x-api-key": TWELVE_LABS_API_KEY,
            },
            data: data,
          };
          console.log("🚀 > updateMetadata > options=", options);

          try {
            const response = await axios.request(options);
            console.log("Response from API:", response.status);
          } catch (error) {
            console.error("Error updating metadata:", error);
          }
        }
      }
    }
  }

  /** Searches videos in an index with a given query*/
  async function searchVideo(indexId, query) {
    setSearchQuery(query);
    const result = await TwelveLabsApi.searchVideo(indexId, searchQuery);
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
    console.log("🚀 > deleteVideo > indexId, videoId=", indexId, videoId);
    try {
      const response = await TwelveLabsApi.deleteVideo(indexId, videoId);
      console.log("🚀 > deleteVideo > response=", response);
      //TODO: add validation if response is success
      // const updatedVideos = videos.data.filter(
      //   (video) => video._id !== videoId
      // );
      // setVideos((videos) => ({
      //   data: updatedVideos,
      //   isLoading: false,
      // }));
    } catch (err) {
      console.error(err);
    }
  }
  // async function setAuthorDataToFalse() {
  //   const TWELVE_LABS_API_KEY = process.env.REACT_APP_API_KEY;
  //   let count = 0;

  //   for (let video of videos.data) {
  //     const VIDEO_URL = `https://api.twelvelabs.io/v1.1/indexes/${currIndex}/videos/${video._id}`;

  //     const data = {
  //       metadata: {
  //         author: false,
  //       },
  //     };

  //     const options = {
  //       method: "PUT",
  //       url: VIDEO_URL,
  //       headers: {
  //         "Content-Type": "application/json",
  //         "x-api-key": TWELVE_LABS_API_KEY,
  //       },
  //       data: data,
  //     };

  //     try {
  //       const response = await axios.request(options);
  //       console.log("Response from API:", response.status);
  //       console.log("metadata:", video.metadata);

  //       count++;

  //       if (count === 10) {
  //         break;
  //       }
  //     } catch (error) {
  //       console.error("Error updating metadata:", error);
  //     }
  //   }
  // }

  /** Toggle whether to show or not show the components  */
  function handleClick() {
    setShowComponents(!showComponents);
  }

  function reset() {
    setShowComponents(true);
    setSearchPerformed(false);
  }

  const uniqueAuthors = new Set();
  videos?.data?.forEach((vid) => {
    uniqueAuthors.add(vid.metadata.author);
  });

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
            <i className="bi bi-trash"></i>{" "}
          </Button>
        </Col>
      </Row>
      {showComponents && videos.data.length === 0 && (
        <Container fluid style={{ marginTop: "5em", marginBottom: "5em" }}>
          <h1 className="display-6 m-5">Add New Videos</h1>
          <UploadYoutubeVideo
            indexedVideos={indexedVideos}
            setIndexedVideos={setIndexedVideos}
            index={index}
            index_id={index_id}
            taskVideos={taskVideos}
            setTaskVideos={setTaskVideos}
          />
        </Container>
      )}
      {showComponents && !searchPerformed && videos.data.length > 0 && (
        <div>
          <div>
            <Container className="m-5">
              <SearchForm index={currIndex} search={searchVideo} />
            </Container>
          </div>
          <div>
            <div>
              <Container className="m-5">
                <Container fluid className="m-4 mt-5">
                  <div
                    style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
                  >
                    <span style={{ fontSize: "1.5em" }}>
                      {" "}
                      All Channels in Index:{" "}
                    </span>
                    {[...uniqueAuthors].map((author) => (
                      <Badge
                        key={author}
                        pill
                        bg="success"
                        style={{ fontSize: "1em", padding: "0.5em" }}
                      >
                        {author}
                      </Badge>
                    ))}
                  </div>
                </Container>
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
            <Container fluid className="mb-5">
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
            <Container fluid style={{ marginTop: "5em", marginBottom: "5em" }}>
              <h1 className="display-6 m-5">Add New Videos</h1>
              <UploadYoutubeVideo
                indexedVideos={indexedVideos}
                setIndexedVideos={setIndexedVideos}
                index={index}
                index_id={index_id}
                taskVideos={taskVideos}
                setTaskVideos={setTaskVideos}
              />
            </Container>
          </div>
        </div>
      )}
      {searchPerformed && (
        <div>
          <h1 className="mt-5 display-6">
            🔎 Search Results For "{searchQuery}"{" "}
          </h1>
          <SearchForm index={currIndex} search={searchVideo} />
          <Button onClick={reset} className="m-5">
            <i className="bi bi-arrow-counterclockwise"></i>
            Back to All Videos
          </Button>
          <Container fluid className="m-3">
            <Row>
              {!searchResults.isLoading && searchResults.data.length === 0 && (
                <p>No results found</p>
              )}
              {!searchResults.isLoading && searchResults.data.length > 0 && (
                <SearchResultList
                  searchResults={searchResults}
                  index_id={currIndex}
                  videos={videos}
                />
              )}
            </Row>
          </Container>
        </div>
      )}
    </div>
  );
}

export default VideoIndex;

import { useState, useEffect } from "react";
import SearchForm from "../search/SearchForm";
import TwelveLabsApi from "../api/api";
import UploadYoutubeVideo from "../videos/UploadYouTubeVideo";
import { Button, Container, Row, Col, Modal, Alert } from "react-bootstrap";
import SearchResultList from "../search/SearchResultList";
import VideoList from "../videos/VideoList";
import axios from "axios";
import Badge from "react-bootstrap/Badge";
import "./VideoIndex.css";
import CustomPagination from "./CustomPagination";

const SERVER_BASE_URL = new URL("http://localhost:4001");
const FETCH_VIDEOS_URL = new URL("fetch-videos", SERVER_BASE_URL);

/**
 * Show video list and videos, search form and search result list
 *
 * App -> VideoIndex -> { SearchForm, SearchResultList, UploadForm, VideoList}
 */
function VideoIndex({ index, index_id, indexes, setIndexes, icon }) {
  const currIndex = index._id;
  const [taskVideos, setTaskVideos] = useState(null);
  const [showComponents, setShowComponents] = useState(false);
  const [videos, setVideos] = useState({ data: null, isLoading: true });
  const [searchResults, setSearchResults] = useState({
    data: [],
    isLoading: true,
  });
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [indexedVideos, setIndexedVideos] = useState();
  const [searchQuery, setSearchQuery] = useState(null);
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  /** State variables for default pagination */
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 12;
  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = videos.data?.slice(indexOfFirstVideo, indexOfLastVideo);
  const totalPages = Math.ceil(videos.data?.length / videosPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  /** State variables for delete confirmation modal */
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const showDeleteConfirmationMessage = () => {
    setShowDeleteConfirmation(true);
  };

  const hideDeleteConfirmationMessage = () => {
    setShowDeleteConfirmation(false);
  };

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

  /** Deletes an index */
  async function deleteIndex() {
    await TwelveLabsApi.deleteIndex(index_id);
    setIndexes((prevState) => ({
      ...prevState,
      data: prevState.data.filter((index) => index._id !== index_id),
    }));
    hideDeleteConfirmationMessage();
  }

  /** Add "author" and "youtubeUrl" meta data to each video **/
  async function updateMetadata() {
    if (indexedVideos) {
      const updatePromises = indexedVideos.map(async (indexedVid) => {
        const matchingVid = taskVideos?.find(
          (taskVid) =>
            taskVid.metadata.filename === indexedVid.metadata.filename
        );

        if (matchingVid) {
          const authorName = matchingVid.author.name;
          const youtubeUrl = matchingVid.video_url || matchingVid.shortUrl;
          const TWELVE_LABS_API_KEY = process.env.REACT_APP_API_KEY;
          const VIDEO_URL = `${process.env.REACT_APP_API_URL}/indexes/${currIndex}/videos/${indexedVid._id}`;

          //include custom data to add to the existing metadata
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

          try {
            const response = await axios.request(options);
            console.log("Response from API:", response.status);
          } catch (error) {
            console.error("Error updating metadata:", error);
          }
        }
      });

      // Wait for all metadata updates to complete
      await Promise.all(updatePromises);

      // Now that all updates are done, trigger the page reload
      window.location.reload();
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

  /** Toggle whether to show or not show the components  */
  function handleClick() {
    setIsSelected(!isSelected);
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
    <Container>
      <div
        onClick={handleClick}
        onMouseEnter={() => setShowDeleteButton(true)}
        onMouseLeave={() => setShowDeleteButton(false)}
        className={isSelected ? "selected-index" : "default-index"}
      >
        <div style={{ marginLeft: "auto", marginRight: "auto" }}>
          <i className="bi bi-folder"></i>
          <span style={{ marginLeft: "10px" }}>{index.index_name}</span>
          <span style={{ marginLeft: "5px" }}>
            ({videos.data?.length} videos)
          </span>
        </div>
        {showDeleteButton && (
          <button
            className="deleteButton"
            onClick={showDeleteConfirmationMessage}
          >
            {icon && <img src={icon} alt="Icon" className="icon" />}
          </button>
        )}

        {/* Delete Confirmation Message */}
        {showDeleteConfirmation && (
          <Modal
            show={showDeleteConfirmation}
            onHide={hideDeleteConfirmationMessage}
            backdrop="static"
            keyboard={false}
          >
            <Modal.Body>Are you sure you want to delete this index?</Modal.Body>
            <Modal.Footer>
              <Button variant="danger" onClick={deleteIndex}>
                Delete
              </Button>
              <Button
                variant="secondary"
                onClick={hideDeleteConfirmationMessage}
              >
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </div>

      {showComponents && !searchPerformed && (
        <Container fluid style={{ marginTop: "5em", marginBottom: "5em" }}>
          <h1 className="display-6 m-5">
            <i className="bi bi-upload"></i> Add New Videos
          </h1>
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

      {showComponents && !searchPerformed && currentVideos.length > 0 && (
        <div>
          <Container fluid style={{ marginTop: "3em", marginBottom: "3em" }}>
            <h1 className="display-6">
              <i className="bi bi-search"></i> Search Videos
            </h1>
            <SearchForm index={currIndex} search={searchVideo} />
          </Container>

          <div>
            <div>
              <Container className="mt-5 mb-2">
                <Container fluid>
                  <div
                    className="channels"
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "1.2em",
                      }}
                    >
                      All Channels in Index:{" "}
                    </span>
                    {[...uniqueAuthors].map((author) => (
                      <Badge
                        key={author + "-" + index}
                        pill
                        bg="primary"
                        style={{ fontSize: "1rem" }}
                      >
                        {author}
                      </Badge>
                    ))}
                  </div>
                </Container>
              </Container>
            </div>
            <Container fluid className="mb-5">
              <Row>
                {videos.data && (
                  <VideoList
                    index_id={currIndex}
                    videos={{
                      data: currentVideos,
                      isLoading: videos.isLoading,
                    }}
                  />
                )}
                <Container fluid className="my-5 d-flex justify-content-center">
                  <CustomPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    nextPage={nextPage}
                    prevPage={prevPage}
                  />
                </Container>
              </Row>
            </Container>
          </div>
        </div>
      )}
      {searchPerformed && (
        <div>
          {!searchResults.isLoading && searchResults.data.length > 0 && (
            <h1 className="mt-5 display-6">
              <i className="bi bi-binoculars"></i> Search Results for "
              {searchQuery}"{" "}
            </h1>
          )}

          <SearchForm index={currIndex} search={searchVideo} />

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
          <Button onClick={reset} className="m-5" variant="secondary">
            <i className="bi bi-arrow-counterclockwise"></i>
            &nbsp;Back to All Videos
          </Button>
        </div>
      )}
    </Container>
  );
}

export default VideoIndex;

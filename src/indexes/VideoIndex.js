import { useState, useEffect } from "react";
import SearchForm from "../search/SearchForm";
import TwelveLabsApi from "../api/api";
import UploadYoutubeVideo from "../videos/UploadYouTubeVideo";
import closeIcon from "../svg/Close.svg";
import backIcon from "../svg/Back.svg";
import { Button, Container, Row, Modal } from "react-bootstrap";
import SearchResultList from "../search/SearchResultList";
import VideoList from "../videos/VideoList";
import "./VideoIndex.css";
import CustomPagination from "./CustomPagination";
import { useDeleteIndex, useGetVideos, useSearchVideo } from "../api/apiHooks";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Show video list and videos, search form and search result list
 *
 * App -> VideoIndex -> { SearchForm, SearchResultList, UploadYoutubeVideo, VideoList}
 */
function VideoIndex({ index }) {
  const queryClient = useQueryClient();
  queryClient.invalidateQueries({ queryKey: ["videos"] });
  const currIndex = index._id;

  const { isLoading: videosLoading, data: videosData } = useGetVideos(
    index._id
  );
  const videos = videosData?.data;

  const searchVideoMutation = useSearchVideo();
  const searchResults = searchVideoMutation.data?.data;

  const deleteIndexMutation = useDeleteIndex();

  const [taskVideos, setTaskVideos] = useState(null);
  const [showComponents, setShowComponents] = useState(false);

  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  /** State variables for default pagination */
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 12;
  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = videos?.slice(indexOfFirstVideo, indexOfLastVideo);
  const totalPages = Math.ceil(videos?.length / videosPerPage);

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

  /** Deletes an index */
  async function deleteIndex() {
    await deleteIndexMutation.mutateAsync(currIndex);
    hideDeleteConfirmationMessage();
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
  videos?.forEach((vid) => {
    uniqueAuthors.add(vid.metadata.author);
  });

  function searchResultsContent() {
    if (searchVideoMutation.isSuccess) {
      if (searchResults.length === 0) {
        return (
          <div className="title">No results. Let's try with other queries!</div>
        );
      } else {
        return (
          <SearchResultList searchResults={searchResults} videos={videos} />
        );
      }
    }
  }

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
          <span style={{ marginLeft: "10px", fontSize: "1.1rem" }}>
            {index.index_name}
          </span>
          <span style={{ marginLeft: "5px" }}>({videos?.length} videos)</span>
        </div>
        {showDeleteButton && (
          <button
            className="deleteButton"
            onClick={showDeleteConfirmationMessage}
          >
            {closeIcon && <img src={closeIcon} alt="Icon" className="icon" />}
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
        <div className="videoUploadForm">
          <div className="display-6 m-4">Upload New Videos</div>
          <UploadYoutubeVideo
            currIndex={currIndex}
            taskVideos={taskVideos}
            setTaskVideos={setTaskVideos}
          />
        </div>
      )}

      {showComponents && !searchPerformed && currentVideos.length > 0 && (
        <div>
          <div className="videoSearchForm">
            <div className="title">Search Videos</div>
            <div className="m-auto p-3 searchFormContainer">
              <SearchForm
                index={currIndex}
                searchVideoMutation={searchVideoMutation}
                setSearchPerformed={setSearchPerformed}
                setSearchQuery={setSearchQuery}
                searchQuery={searchQuery}
              />
            </div>
          </div>
          <div className="channelPills">
            <div
              style={{
                fontSize: "1.8rem",
              }}
            >
              All Channels in Index{" "}
            </div>
            {[...uniqueAuthors].map((author) => (
              <div key={author + "-" + index} className="channelPill">
                {author}
              </div>
            ))}
          </div>
          <Container fluid className="mb-5">
            <Row>
              {videos && (
                <VideoList index_id={currIndex} videos={currentVideos} />
              )}
              {videosLoading && <LoadingSpinner />}
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
      )}

      {searchPerformed && (
        <div>
          {!searchVideoMutation.isPending && searchResults.length > 0 && (
            <div className="searchResultTitle">
              Search Results for "{searchQuery}"
            </div>
          )}
          <div className="videoSearchForm">
            <div className="m-auto p-3 searchFormContainer">
              <SearchForm
                index={currIndex}
                searchVideoMutation={searchVideoMutation}
                setSearchPerformed={setSearchPerformed}
                setSearchQuery={setSearchQuery}
                searchQuery={searchQuery}
              />
            </div>
          </div>
          <Container fluid className="m-3">
            <Row>{searchResultsContent()}</Row>
          </Container>
          <div className="resetButtonWrapper">
            <button className="resetButton" onClick={reset}>
              {backIcon && <img src={backIcon} alt="Icon" className="icon" />}
              &nbsp;Back to All Videos
            </button>
          </div>
        </div>
      )}
    </Container>
  );
}

export default VideoIndex;

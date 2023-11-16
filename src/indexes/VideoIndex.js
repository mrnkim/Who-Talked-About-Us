import { useState, useEffect } from "react";
import SearchForm from "../search/SearchForm";
import UploadYoutubeVideo from "../videos/UploadYouTubeVideo";
import closeIcon from "../svg/Close.svg";
import backIcon from "../svg/Back.svg";
import infoIcon from "../svg/Info.svg";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import ErrorFallback from "../common/ErrorFallback";
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
  const { data: videosData, refetch } = useGetVideos(index._id);
  const videos = videosData?.data;

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["videos"] });
  }, [videos]);

  const currIndex = index._id;

  const searchVideoMutation = useSearchVideo();
  const searchResults = searchVideoMutation.data?.data;

  const deleteIndexMutation = useDeleteIndex();

  const [taskVideos, setTaskVideos] = useState(null);
  const [showVideos, setShowVideos] = useState(false);

  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [isIndexSelected, setIsIndexSelected] = useState(false);

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
    setIsIndexSelected(!isIndexSelected);
    setShowVideos(!showVideos);
  }

  /** Reset search and show videos */
  function reset() {
    setShowVideos(true);
    setSearchPerformed(false);
  }

  const uniqueAuthors = new Set();
  videos?.forEach((vid) => {
    uniqueAuthors.add(vid.metadata.author);
  });

  const searchResultsContent =
    searchVideoMutation.isSuccess && searchResults.length === 0 ? (
      <div className="title">No results. Let's try with other queries!</div>
    ) : (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingSpinner />}>
          <SearchResultList searchResults={searchResults} videos={videos} />
        </Suspense>
      </ErrorBoundary>
    );

  return (
    <Container className="m-auto defaultContainer">
      <div
        onClick={handleClick}
        onMouseEnter={() => setShowDeleteButton(true)}
        onMouseLeave={() => setShowDeleteButton(false)}
        className={isIndexSelected ? "selected-index" : "default-index"}
      >
        <div className="indexBar">
          <i className="bi bi-folder"></i>
          <span style={{ marginLeft: "10px", fontSize: "1.1rem" }}>
            {index.index_name}
          </span>
          <span style={{ marginLeft: "5px" }}>({videos?.length} videos)</span>
        </div>

        {/* Delete Index Button */}
        <div className="deleteButtonWrapper">
          {showDeleteButton && (
            <button
              className="deleteButton"
              onClick={showDeleteConfirmationMessage}
            >
              {closeIcon && <img src={closeIcon} alt="Icon" className="icon" />}
            </button>
          )}
        </div>

        {/* Delete Index Confirmation Message */}
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

      {/* Video Upload Form */}
      {showVideos && !searchPerformed && (
        <div className="videoUploadForm">
          <div className="display-6 m-4">Upload New Videos</div>
          <UploadYoutubeVideo
            currIndex={currIndex}
            taskVideos={taskVideos}
            setTaskVideos={setTaskVideos}
          />
        </div>
      )}

      {videos?.length === 0 && showVideos && (
        <div className="doNotLeaveMessageWrapper">
          <img src={infoIcon} alt="infoIcon" className="icon"></img>
          <div className="doNotLeaveMessage">
            There are no videos. Start indexing ones!
          </div>
        </div>
      )}

      {videos?.length > 0 && showVideos && (
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => refetch()}
          resetKeys={[videos]}
        >
          <Suspense fallback={<LoadingSpinner />}>
            {/* Video Search Form */}
            {showVideos && !searchPerformed && currentVideos.length > 0 && (
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
                  <div className="subtitle">All Channels in Index </div>
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
                    <Container
                      fluid
                      className="my-5 d-flex justify-content-center"
                    >
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

            {/* Video Search Results */}
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
                  <Row>{searchResultsContent}</Row>
                </Container>
                <div className="resetButtonWrapper">
                  <button className="resetButton" onClick={reset}>
                    {backIcon && (
                      <img src={backIcon} alt="Icon" className="icon" />
                    )}
                    &nbsp;Back to All Videos
                  </button>
                </div>
              </div>
            )}
          </Suspense>
        </ErrorBoundary>
      )}
    </Container>
  );
}

export default VideoIndex;

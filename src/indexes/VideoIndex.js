import { useState, useEffect, Suspense } from "react";
import SearchForm from "../search/SearchForm";
import UploadYoutubeVideo from "../videos/UploadYouTubeVideo";
import backIcon from "../svg/Back.svg";
import infoIcon from "../svg/Info.svg";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "../common/ErrorFallback";
import { Container, Row } from "react-bootstrap";
import SearchResultList from "../search/SearchResultList";
import VideoList from "../videos/VideoList";
import "./VideoIndex.css";
import { PageNav } from "../common/PageNav";
import { useDeleteIndex, useGetVideos } from "../api/apiHooks";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { keys } from "../api/keys";
import { IndexBar } from "./IndexBar";
import { useQueryClient } from "@tanstack/react-query";

const PAGE_LIMIT = 12;

/**
 * Show video list and videos, search form and search result list
 *
 * App -> VideoIndex -> { SearchForm, SearchResultList, UploadYoutubeVideo, VideoList}
 */
function VideoIndex({ index }) {
  const currIndex = index._id;
  const [vidPage, setVidPage] = useState(1);

  const queryClient = useQueryClient();
  const {
    data: videosData,
    refetch: refetchVideos,
    isPreviousData,
  } = useGetVideos(currIndex, vidPage, PAGE_LIMIT);
  const videos = videosData?.data;

  const deleteIndexMutation = useDeleteIndex();

  const [taskVideos, setTaskVideos] = useState(null);
  const [showVideos, setShowVideos] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [finalSearchQuery, setFinalSearchQuery] = useState("");
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [isIndexSelected, setIsIndexSelected] = useState(false);

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
    setSearchQuery(false);
    setFinalSearchQuery(false);
  }

  const uniqueAuthors = new Set();
  videos?.forEach((vid) => {
    uniqueAuthors.add(vid.metadata.author);
  });

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: [keys.VIDEOS, currIndex, vidPage],
    });
  }, [videos, currIndex, vidPage]);

  return (
    <Container className="m-auto defaultContainer">
      <IndexBar
        handleClick={handleClick}
        showDeleteButton={showDeleteButton}
        setShowDeleteButton={setShowDeleteButton}
        isIndexSelected={isIndexSelected}
        index={index}
        videosData={videosData}
        showDeleteConfirmationMessage={showDeleteConfirmationMessage}
        hideDeleteConfirmationMessage={hideDeleteConfirmationMessage}
        showDeleteConfirmation={showDeleteConfirmation}
        deleteIndex={deleteIndex}
      />
      {showVideos && videos?.length === 0 && (
        <div>
          <div className="doNotLeaveMessageWrapper">
            <img src={infoIcon} alt="infoIcon" className="icon"></img>
            <div className="doNotLeaveMessage">
              There are no videos. Start indexing ones!
            </div>
          </div>

          <div className="videoUploadForm">
            <div className="display-6 m-4">Upload New Videos</div>
            <UploadYoutubeVideo
              currIndex={currIndex}
              taskVideos={taskVideos}
              setTaskVideos={setTaskVideos}
              refetchVideos={refetchVideos}
            />
          </div>
        </div>
      )}

      {showVideos && videos?.length > 0 && (
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => refetchVideos()}
          resetKeys={[keys.VIDEOS]}
        >
          <div className="videoUploadForm">
            <div className="display-6 m-4">Upload New Videos</div>
            <UploadYoutubeVideo
              currIndex={currIndex}
              taskVideos={taskVideos}
              setTaskVideos={setTaskVideos}
              refetchVideos={refetchVideos}
            />
          </div>
          {/* Video Search Form */}
          {!finalSearchQuery && (
            <div>
              <div className="videoSearchForm">
                <div className="title">Search Videos</div>
                <div className="m-auto p-3 searchFormContainer">
                  <SearchForm
                    index={currIndex}
                    setSearchQuery={setSearchQuery}
                    searchQuery={searchQuery}
                    setFinalSearchQuery={setFinalSearchQuery}
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
                    <Suspense fallback={<LoadingSpinner />}>
                      <VideoList
                        videos={videos}
                        refetchVideos={refetchVideos}
                      />
                    </Suspense>
                  )}
                  <Container
                    fluid
                    className="my-5 d-flex justify-content-center"
                  >
                    <PageNav
                      page={vidPage}
                      setPage={setVidPage}
                      data={videosData}
                      inPreviousData={isPreviousData}
                    />
                  </Container>
                </Row>
              </Container>
            </div>
          )}

          {/* Video Search Results */}
          {finalSearchQuery && (
            <div>
              <div className="videoSearchForm">
                <div className="m-auto p-3 searchFormContainer">
                  <SearchForm
                    index={currIndex}
                    setSearchQuery={setSearchQuery}
                    searchQuery={searchQuery}
                    setFinalSearchQuery={setFinalSearchQuery}
                  />
                </div>
              </div>
              <Container fluid className="m-3">
                <Row>
                  {" "}
                  <Suspense fallback={<LoadingSpinner />}>
                    <SearchResultList
                      currIndex={currIndex}
                      videos={videos}
                      finalSearchQuery={finalSearchQuery}
                    />
                  </Suspense>
                </Row>
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
        </ErrorBoundary>
      )}
    </Container>
  );
}

export default VideoIndex;

import { useState, Suspense, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useQueryClient } from "@tanstack/react-query";
import { Container, Row } from "react-bootstrap";
import { useGetVideos, useGetAllAuthors } from "../apiHooks/apiHooks";
import UploadYoutubeVideo from "./UploadYouTubeVideo";
import ErrorFallback from "../common/ErrorFallback";
import keys from "../apiHooks/keys";
import SearchForm from "../search/SearchForm";
import SearchResultList from "../search/SearchResultList";
import PageNav from "../common/PageNav";
import VideoList from "../videos/VideoList";
import backIcon from "../svg/Back.svg";
import infoIcon from "../svg/Info.svg";
import LoadingSpinner from "../common/LoadingSpinner";
import "./VideoComponents.css";

const VID_PAGE_LIMIT = 12;

export function VideoComponents({
  currIndex,
  setIndexId,
  vidPage,
  setVidPage,
  taskVideos,
  setTaskVideos,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [finalSearchQuery, setFinalSearchQuery] = useState("");

  const queryClient = useQueryClient();

  const {
    data: videosData,
    refetch: refetchVideos,
    isPreviousData,
  } = useGetVideos(currIndex, vidPage, VID_PAGE_LIMIT);
  const videos = videosData?.data;

  const { data: authors } = useGetAllAuthors(currIndex);

  function reset() {
    setSearchQuery("");
    setFinalSearchQuery("");
  }

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: [[keys.VIDEOS, currIndex, vidPage], [keys.AUTHORS]],
    });
  }, [taskVideos, currIndex, vidPage]);

  return (
    <>
      {videos && videos.length === 0 && (
        <div>
          {!taskVideos && (
            <div className="doNotLeaveMessageWrapper">
              <img src={infoIcon} alt="infoIcon" className="icon"></img>
              <div className="doNotLeaveMessage">
                There are no videos. Start indexing ones!
              </div>
            </div>
          )}
          <div className="videoUploadForm">
            <div className="display-6 m-4">Upload New Videos</div>
            <UploadYoutubeVideo
              currIndex={currIndex}
              taskVideos={taskVideos}
              setTaskVideos={setTaskVideos}
              refetchVideos={refetchVideos}
            />
          </div>
          <div className="resetButtonWrapper">
            <button className="resetButton" onClick={() => setIndexId(null)}>
              {backIcon && <img src={backIcon} alt="Icon" className="icon" />}
              &nbsp;Back to Start
            </button>
          </div>
        </div>
      )}

      {videos && videos.length > 0 && (
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

          <div className="videoSearchForm">
            <div className="title">Search Videos</div>
            <div className="m-auto p-3 searchFormContainer">
              <SearchForm
                setSearchQuery={setSearchQuery}
                searchQuery={searchQuery}
                setFinalSearchQuery={setFinalSearchQuery}
              />
            </div>
          </div>

          {!finalSearchQuery && (
            <div>
              <div className="channelPills">
                <div className="subtitle">
                  All Channels in Index ({authors?.length || 0}){" "}
                </div>
                {authors.map((author) => (
                  <div key={author} className="channelPill">
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

              <div className="resetButtonWrapper">
                <button
                  className="resetButton"
                  onClick={() => setIndexId(null)}
                >
                  {backIcon && (
                    <img src={backIcon} alt="Icon" className="icon" />
                  )}
                  &nbsp;Back to Start
                </button>
              </div>
            </div>
          )}

          {finalSearchQuery && (
            <div>
              <Container fluid className="m-3">
                <Row>
                  <Suspense fallback={<LoadingSpinner />}>
                    <SearchResultList
                      currIndex={currIndex}
                      allAuthors={authors}
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
    </>
  );
}

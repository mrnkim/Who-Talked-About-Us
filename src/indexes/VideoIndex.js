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
import {
  useDeleteIndex,
  useGetIndex,
  useGetVideos,
  useGetAllAuthors,
} from "../api/apiHooks";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { keys } from "../api/keys";
import { IndexBar } from "./IndexBar";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { VideoComponents } from "../videos/VideoComponents";

const VID_PAGE_LIMIT = 12;

/**
 * Show video list and videos, search form and search result list
 *
 * App -> VideoIndex -> { SearchForm, SearchResultList, UploadYoutubeVideo, VideoList}
 */
function VideoIndex({ indexId, setIndexId }) {
  const [vidPage, setVidPage] = useState(1);
  const [taskVideos, setTaskVideos] = useState(null);

  const queryClient = useQueryClient();

  const { data: index, refetch, error, isError } = useGetIndex(indexId);
  // const currIndex = indexIdRef.current;
  const currIndex = index?._id;

  // const {
  //   data: videosData,
  //   refetch: refetchVideos,
  //   isPreviousData,
  // } = useGetVideos(currIndex, vidPage, VID_PAGE_LIMIT);
  // const videos = videosData?.data;

  // const { data: authors } = useGetAllAuthors(currIndex);

  // const deleteIndexMutation = useDeleteIndex(setIndexId);

  // const [taskVideos, setTaskVideos] = useState(null);
  // const [showVideos, setShowVideos] = useState(false);

  // const [searchQuery, setSearchQuery] = useState("");
  // const [finalSearchQuery, setFinalSearchQuery] = useState("");
  // const [showDeleteButton, setShowDeleteButton] = useState(false);
  // const [isIndexSelected, setIsIndexSelected] = useState(false);

  /** State variables for delete confirmation modal */
  // const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // const showDeleteConfirmationMessage = () => {
  //   setShowDeleteConfirmation(true);
  // };

  // const hideDeleteConfirmationMessage = () => {
  //   setShowDeleteConfirmation(false);
  // };

  /** Deletes an index */
  // async function deleteIndex() {
  //   await deleteIndexMutation.mutateAsync(currIndex);
  //   hideDeleteConfirmationMessage();
  // }

  /** Toggle whether to show or not show the components  */
  // function handleClick() {
  //   setIsIndexSelected(!isIndexSelected);
  //   setShowVideos(!showVideos);
  // }

  /** Reset search and show videos */
  // function reset() {
  //   // setShowVideos(true);
  //   setSearchQuery("");
  //   setFinalSearchQuery("");
  // }

  function onError() {
    toast.error(index.error.message);
    setIndexId(null);
  }

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: [keys.INDEX] });
  }, [index]);

  return (
    <Container className="m-auto defaultContainer">
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => refetch()}
        resetKeys={[keys.INDEX]}
      >
        <Suspense fallback={<LoadingSpinner />}>
          {index && !index.error ? (
            <div>
              <IndexBar
                className="indexBar"
                vidPage={vidPage}
                index={index}
                setIndexId={setIndexId}
                taskVideos={taskVideos}
              />
              <VideoComponents
                currIndex={currIndex}
                setIndexId={setIndexId}
                vidPage={vidPage}
                setVidPage={setVidPage}
                taskVideos={taskVideos}
                setTaskVideos={setTaskVideos}
              />
            </div>
          ) : (
            index &&
            index.error && (
              <ErrorFallback
                error={{ message: index.error.message }}
                resetErrorBoundary={() => refetch()}
                setIndexId={setIndexId}
              />
            )
          )}
        </Suspense>
      </ErrorBoundary>
    </Container>
  );
}

export default VideoIndex;

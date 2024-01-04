import { useState, useEffect, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "../common/ErrorFallback";
import { Container } from "react-bootstrap";
import "./VideoIndex.css";
import { useGetIndex } from "../apiHooks/apiHooks";
import LoadingSpinner from "../common/LoadingSpinner";
import keys from "../apiHooks/keys";
import { useQueryClient } from "@tanstack/react-query";
import { VideoComponents } from "../videos/VideoComponents";
import { IndexBar } from "./IndexBar";

/**
 * Show video list and videos, search form and search result list
 *
 * App -> VideoIndex -> { IndexBar, VideoComponents}
 *
 */

function VideoIndex({ indexId }) {
  const [vidPage, setVidPage] = useState(1);
  const [taskVideos, setTaskVideos] = useState(null);

  const queryClient = useQueryClient();

  const { data: index, refetch } = useGetIndex(indexId);

  const currIndex = index?._id;

  if (index.deleted) {
    index.error = { message: "This index no longer exists" };
  }

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: [keys.INDEX, indexId] });
  }, [index, taskVideos]);

  return (
    <Container className="m-auto defaultContainer">
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => refetch()}
        resetKeys={[keys.INDEX, indexId]}
      >
        <Suspense fallback={<LoadingSpinner />}>
          {index && !index.error ? (
            <>
              <IndexBar index={index} />
              <VideoComponents
                currIndex={currIndex}
                vidPage={vidPage}
                setVidPage={setVidPage}
                taskVideos={taskVideos}
                setTaskVideos={setTaskVideos}
              />
            </>
          ) : (
            index &&
            index.error && (
              <ErrorFallback error={{ message: index.error.message }} />
            )
          )}
        </Suspense>
      </ErrorBoundary>
    </Container>
  );
}

export default VideoIndex;

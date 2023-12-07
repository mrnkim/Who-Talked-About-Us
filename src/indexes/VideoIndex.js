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

/**
 * Show video list and videos, search form and search result list
 *
 * App -> VideoIndex -> { VideoComponents}
 *
 */

function VideoIndex({ indexId, setIndexId }) {
  const [vidPage, setVidPage] = useState(1);

  const queryClient = useQueryClient();

  const { data: index, refetch } = useGetIndex(indexId);
  const currIndex = index?._id;
  if (index.deleted) {
    index.error = { message: "This index no longer exists" };
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
            <VideoComponents
              index={index}
              currIndex={currIndex}
              setIndexId={setIndexId}
              vidPage={vidPage}
              setVidPage={setVidPage}
            />
          ) : (
            index &&
            index.error && (
              <ErrorFallback
                error={{ message: index.error.message }}
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

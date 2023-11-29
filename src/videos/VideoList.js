import { React, Suspense } from "react";
import { Col } from "react-bootstrap";
import ReactPlayer from "react-player";
import "./VideoList.css";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { ErrorBoundary } from "react-error-boundary";
import { keys } from "../api/keys";
import ErrorFallback from "../common/ErrorFallback";

/** Shows list of the video in an index
 *
 *  VideoIndex -> VideoList
 */
function VideoList({ videos, refetchVideos }) {
  return videos.map((video, index) => (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => refetchVideos()}
      resetKeys={[keys.VIDEOS]}
      key={video._id + "-" + index}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <Col sm={12} md={6} lg={4} xl={3} className="mb-5 mt-3">
          <ReactPlayer
            url={video.metadata.youtubeUrl}
            controls
            width="100%"
            height="100%"
          />
          <div className="channelAndVideoName">
            <div className="channelPillSmall">{video.metadata.author}</div>
            <div className="filename-text">
              {video.metadata.filename.replace(".mp4", "")}
            </div>
          </div>
        </Col>
      </Suspense>
    </ErrorBoundary>
  ));
}

export default VideoList;

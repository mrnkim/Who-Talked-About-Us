import React, { Suspense, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Col } from "react-bootstrap";
import ReactPlayer from "react-player";
import "./VideoList.css";
import LoadingSpinner from "../common/LoadingSpinner";
import { ErrorBoundary } from "react-error-boundary";
import keys from "../apiHooks/keys";
import ErrorFallback from "../common/ErrorFallback";
import { fetchVideo } from "../apiHooks/apiHooks";

/** Shows list of the video in an index
 *
 *  VideoComponents -> VideoList
 *
 */

function VideoList({ videos, refetchVideos, currIndex }) {
  const [videosInfo, setVideosInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const videoIds = videos.map((video) => video._id);

  useEffect(() => {
    const fetchVideosInfo = async () => {
      try {
        const fetchedVideosInfo = await Promise.all(
          videoIds.map((videoId) => fetchVideo(queryClient, currIndex, videoId))
        );
        setVideosInfo(fetchedVideosInfo);
      } catch (error) {
        console.error("Failed to fetch videos", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideosInfo();
  }, [videoIds, currIndex, queryClient]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const filteredVideosInfo = videosInfo.filter(
    (videoInfo) => videoInfo?.indexed_at
  );
  const numVideos = videosInfo.length;

  return (
    <>
      {filteredVideosInfo?.map((videoInfo, index) => (
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => refetchVideos()}
          resetKeys={[keys.VIDEOS, index]}
          key={videoInfo?._id + "-" + index}
        >
          <Suspense fallback={<LoadingSpinner />}>
            <Col
              sm={12}
              md={numVideos > 1 ? 6 : 12}
              lg={numVideos > 1 ? 4 : 12}
              xl={numVideos > 1 ? 3 : 12}
              className="mb-5 mt-3"
            >
              <ReactPlayer
                url={videoInfo?.source?.url || videoInfo?.metadata?.youtubeUrl}
                controls
                width="100%"
                height="250px"
              />
              <div className="channelAndVideoName">
                <div className="channelPillSmall">
                  {videoInfo?.source?.name || videoInfo?.metadata?.author}
                </div>
                <div className="filename-text">
                  {videoInfo?.metadata.filename.replace(".mp4", "")}
                </div>
              </div>
            </Col>
          </Suspense>
        </ErrorBoundary>
      ))}
    </>
  );
}

export default VideoList;

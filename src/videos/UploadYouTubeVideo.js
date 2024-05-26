import { useState, useEffect, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Container } from "react-bootstrap";
import sanitize from "sanitize-filename";
import ErrorFallback from "../common/ErrorFallback";
import infoIcon from "../svg/Info.svg";
import LoadingSpinner from "../common/LoadingSpinner";
import UploadForm from "./UploadForm";
import UploadConfirmation from "./UploadConfirmation";
import TaskVideo from "./TaskVideo";
import Task from "./Task";
import "./UploadYouTubeVideo.css";
import apiConfig from "../apiHooks/apiConfig";

/** Implements video download, submission, and indexing
 *
 * - taskIds: [
 *              {
 *                 _id: '656a20abe44fccd3724bf2af',
 *                 videoData: {
 *                   url: 'https://www.youtube.com/watch?v=...',
 *                   title: 'title',
 *                   authorName: 'authorName',
 *                   thumbnails: [Array]
 *                 }
 *               },
 *               ...
 *             ]
 *
 * App -> VideoComponents -> UploadYoutubeVideo -> { UploadForm, UploadConfirmation, TaskVideo, Task}
 *
 */

export function UploadYoutubeVideo({
  currIndex,
  taskVideos,
  setTaskVideos,
  refetchVideos,
  isSubmitting,
  setIsSubmitting,
  reset,
}) {
  const [selectedJSON, setSelectedJSON] = useState(null);
  const [youtubeChannelId, setYoutubeChannelId] = useState("");
  const [youtubePlaylistId, setYoutubePlaylistId] = useState("");
  const [taskIds, setTaskIds] = useState([]);
  const [completeTasks, setCompleteTasks] = useState([]);
  const [failedTasks, setFailedTasks] = useState([]);
  const [uploadIndexId, setUploadIndexId] = useState(null);
  const [pendingApiRequest, setPendingApiRequest] = useState(false);
  const [mainMessage, setMainMessage] = useState(null);

  const handleJSONSelect = (event) => {
    setSelectedJSON(event.target.files[0]);
  };

  const handleReset = () => {
    setPendingApiRequest(false);
    setMainMessage(null);
    setSelectedJSON(null);
    setYoutubeChannelId("");
    setYoutubePlaylistId("");
    setUploadIndexId(null);
    setTaskIds(null);
    setIsSubmitting(false);
    setCompleteTasks([]);
    setFailedTasks([]);
    reset();
    setTaskVideos(null);
  };

  const updateMainMessage = (text) => {
    if (text) {
      setPendingApiRequest(true);
      let apiRequestElement = (
        <div className="doNotLeaveMessageWrapper">
          <img src={infoIcon} alt="infoIcon" className="icon"></img>
          <div className="doNotLeaveMessage">{text}</div>
        </div>
      );
      setMainMessage(apiRequestElement);
    } else {
      setPendingApiRequest(false);
      setMainMessage(null);
    }
  };

  const handleYoutubeChannelIdEntry = (event) => {
    setYoutubeChannelId(event.target.value);
  };

  const handleYoutubePlaylistIdEntry = (event) => {
    setYoutubePlaylistId(event.target.value);
  };

  const getInfo = async () => {
    updateMainMessage("Getting Data...");
    if (selectedJSON) {
      let fileReader = new FileReader();
      fileReader.readAsText(selectedJSON);
      fileReader.onloadend = async () => {
        const jsonVideos = JSON.parse(fileReader.result);
        const response = await Promise.all(jsonVideos.map(getJsonVideoInfo));
        setTaskVideos(response);
      };
    } else if (youtubeChannelId) {
      const response = await getChannelVideoInfo(youtubeChannelId);
      setTaskVideos(response);
    } else if (youtubePlaylistId) {
      const response = await getPlaylistVideoInfo(youtubePlaylistId);
      setTaskVideos(response);
    }
    updateMainMessage();
  };

  const getJsonVideoInfo = async (videoData) => {
    const queryUrl = apiConfig.JSON_VIDEO_INFO_URL;
    queryUrl.searchParams.set("URL", videoData.url);
    try {
      const response = await fetch(queryUrl.href);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching JSON video info:", error);
      throw error;
    }
  };

  const getChannelVideoInfo = async () => {
    const queryUrl = apiConfig.CHANNEL_VIDEO_INFO_URL;
    queryUrl.searchParams.set("CHANNEL_ID", youtubeChannelId);
    try {
      const response = await fetch(queryUrl.href);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching JSON video info:", error);
      throw error;
    }
  };

  const getPlaylistVideoInfo = async () => {
    const queryUrl = apiConfig.PLAYLIST_VIDEO_INFO_URL;
    queryUrl.searchParams.set("PLAYLIST_ID", youtubePlaylistId);
    try {
      const response = await fetch(queryUrl.href);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching JSON video info:", error);
      throw error;
    }
  };

  const indexYouTubeVideos = async () => {
    setIsSubmitting(true);
    updateMainMessage(
      "Do not refresh the page while videos are uploading. You can still do the search!"
    );

    try {
      const results = await Promise.all(
        taskVideos.map(async (taskVideo) => {
          const response = await fetch(apiConfig.INDEX_URL.toString(), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url: taskVideo.video_url || taskVideo.shortUrl,
              index_id: currIndex,
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to index video: ${response.statusText}`);
          }

          const taskId = await response.json();
          setUploadIndexId(currIndex);
          const videoData = {
            url: taskVideo.video_url || taskVideo.url,
            title: taskVideo.title,
            authorName: taskVideo.author.name,
            thumbnails: taskVideo.thumbnails,
          };
          setTaskIds((prevIds) =>
            Array.isArray(prevIds)
              ? [...prevIds, { ...taskId, videoData }]
              : [{ ...taskId, videoData }]
          );
        })
      );
    } catch (error) {
      console.error("Error indexing videos:", error);
    }
  };

  useEffect(() => {
    if (
      taskIds &&
      taskVideos &&
      taskIds?.length === completeTasks?.length + failedTasks?.length
    ) {
      // updateMetadata();
      handleReset();
      refetchVideos();
    }
  }, [taskIds, completeTasks, failedTasks]);

  return (
    <div>
      {!taskVideos && (
        <UploadForm
          selectedJSON={selectedJSON}
          youtubeChannelId={youtubeChannelId}
          youtubePlaylistId={youtubePlaylistId}
          handleJSONSelect={handleJSONSelect}
          indexId={uploadIndexId}
          handleYoutubeChannelIdEntry={handleYoutubeChannelIdEntry}
          handleYoutubePlaylistIdEntry={handleYoutubePlaylistIdEntry}
          getInfo={getInfo}
          handleReset={handleReset}
          mainMessage={mainMessage}
          pendingApiRequest={pendingApiRequest}
        />
      )}

      {taskVideos && !isSubmitting && (
        <>
          <UploadConfirmation
            indexYouTubeVideos={indexYouTubeVideos}
            pendingApiRequest={pendingApiRequest}
            handleReset={handleReset}
            mainMessage={mainMessage}
          />
          <div className="taskVideoContainer">
            {taskVideos.map((taskVideo) => (
              <ErrorBoundary
                FallbackComponent={ErrorFallback}
                key={taskVideo.id || taskVideo.videoId}
              >
                <Suspense fallback={<LoadingSpinner />}>
                  <div className="taskVideo">
                    <TaskVideo taskVideo={taskVideo} />
                  </div>
                </Suspense>
              </ErrorBoundary>
            ))}
          </div>
        </>
      )}

      {taskVideos && isSubmitting && (
        <div className="wrapper">
          <Container className="mainMessageWrapper">{mainMessage}</Container>
          <div className="taskVideoContainer">
            {taskVideos.map((taskVideo) => {
              const matchingTaskId = taskIds?.find(
                (taskId) =>
                  taskId.videoData.url === taskVideo.video_url || taskVideo.url
              );
              return (
                <ErrorBoundary
                  FallbackComponent={ErrorFallback}
                  key={taskVideo.id || taskVideo.videoId}
                >
                  <Suspense fallback={<LoadingSpinner />}>
                    <div className="taskVideo">
                      <TaskVideo taskVideo={taskVideo} />
                      <div className="downloadSubmit">
                        {/* <LoadingSpinner /> */}
                        {matchingTaskId ? (
                          <Task
                            taskId={matchingTaskId}
                            setCompleteTasks={setCompleteTasks}
                            setFailedTasks={setFailedTasks}
                          />
                        ) : (
                          <>
                            <LoadingSpinner />
                            Downloading & Submitting
                          </>
                        )}
                      </div>
                    </div>
                  </Suspense>
                </ErrorBoundary>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadYoutubeVideo;

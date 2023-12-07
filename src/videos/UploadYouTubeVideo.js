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

const SERVER_BASE_URL = new URL(
  `${process.env.REACT_APP_SERVER_URL}:${process.env.REACT_APP_PORT_NUMBER}`
);
const JSON_VIDEO_INFO_URL = new URL("/json-video-info", SERVER_BASE_URL);
const CHANNEL_VIDEO_INFO_URL = new URL("/channel-video-info", SERVER_BASE_URL);
const PLAYLIST_VIDEO_INFO_URL = new URL(
  "/playlist-video-info",
  SERVER_BASE_URL
);
const DOWNLOAD_URL = new URL("/download", SERVER_BASE_URL);
const UPDATE_VIDEO_URL = new URL("/update", SERVER_BASE_URL);

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
 * App -> VideoComponents -> UploadYoutubeVideo
 *
 */

export function UploadYoutubeVideo({
  currIndex,
  taskVideos,
  setTaskVideos,
  refetchVideos,
  isSubmitting,
  setIsSubmitting,
}) {
  const [selectedJSON, setSelectedJSON] = useState(null);
  const [youtubeChannelId, setYoutubeChannelId] = useState("");
  const [youtubePlaylistId, setYoutubePlaylistId] = useState("");
  const [taskIds, setTaskIds] = useState(null);
  const [completeTasks, setCompleteTasks] = useState([]);
  const [failedTasks, setFailedTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState(null);
  const [indexId, setIndexId] = useState(null);
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
    setIndexId(null);
    setSearchQuery(null);
    setTaskIds(null);
    setIsSubmitting(false);
    setCompleteTasks([]);
    setFailedTasks([]);
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
    const queryUrl = JSON_VIDEO_INFO_URL;
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
    const queryUrl = CHANNEL_VIDEO_INFO_URL;
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
    const queryUrl = PLAYLIST_VIDEO_INFO_URL;
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
      "Do not close the current index or refresh the page while videos are uploading. You can still do the search!"
    );

    const videoData = taskVideos.map((taskVideo) => {
      return {
        url: taskVideo.video_url || taskVideo.url,
        title: taskVideo.title,
        authorName: taskVideo.author.name,
        thumbnails: taskVideo.thumbnails,
      };
    });

    const requestData = {
      videoData: videoData,
      index_id: currIndex,
    };

    const data = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    };

    const response = await fetch(DOWNLOAD_URL.toString(), data);
    const json = await response.json();
    setIndexId(json.indexId);
    setTaskIds(json.taskIds);
  };

  async function updateMetadata() {
    const updatePromises = completeTasks.map(async (completeTask) => {
      const matchingVid = taskVideos.find(
        (taskVid) =>
          `${sanitize(taskVid.title)}.mp4` === completeTask.metadata.filename
      );
      if (matchingVid) {
        const authorName = matchingVid.author.name;
        const youtubeUrl = matchingVid.video_url || matchingVid.shortUrl;
        const data = {
          metadata: {
            author: authorName,
            youtubeUrl: youtubeUrl,
            whoTalkedAboutUs: true,
          },
        };
        try {
          await fetch(
            `${UPDATE_VIDEO_URL}/${currIndex}/${completeTask.video_id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            }
          );
        } catch (error) {
          console.error(error);
        }
      }
    });
    await Promise.all(updatePromises);
  }

  useEffect(() => {
    if (
      taskIds &&
      taskVideos &&
      taskIds.length === completeTasks.length + failedTasks.length
    ) {
      updateMetadata();
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
          indexId={indexId}
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

      {taskVideos && isSubmitting && !taskIds && (
        <div className="wrapper">
          <Container className="mainMessageWrapper">{mainMessage}</Container>

          <div className="taskVideoContainer">
            {taskVideos.map((taskVideo) => (
              <ErrorBoundary
                FallbackComponent={ErrorFallback}
                key={taskVideo.id || taskVideo.videoId}
              >
                <Suspense fallback={<LoadingSpinner />}>
                  <div className="taskVideo">
                    <TaskVideo taskVideo={taskVideo} />
                    <div className="downloadSubmit">
                      <LoadingSpinner />
                      Downloading & Submitting
                    </div>
                  </div>
                </Suspense>
              </ErrorBoundary>
            ))}
          </div>
        </div>
      )}

      {taskVideos && isSubmitting && taskIds && (
        <div className="taskVideoContainer">
          {taskIds.map((taskId) => (
            <ErrorBoundary FallbackComponent={ErrorFallback} key={taskId._id}>
              <Suspense fallback={<LoadingSpinner />}>
                <div className="taskVideo">
                  <TaskVideo taskVideo={taskId.videoData} />
                  <div className="downloadSubmit">
                    <Task
                      taskId={taskId}
                      setCompleteTasks={setCompleteTasks}
                      setFailedTasks={setFailedTasks}
                    />
                  </div>
                </div>
              </Suspense>
            </ErrorBoundary>
          ))}
        </div>
      )}
    </div>
  );
}

export default UploadYoutubeVideo;

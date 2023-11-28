import { useState, useEffect, Suspense } from "react";
import { Container } from "react-bootstrap";
import "./UploadYouTubeVideo.css";
import infoIcon from "../svg/Info.svg";
import TwelveLabsApi from "../api/api";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "../common/ErrorFallback";
import { UploadForm } from "./UploadForm";
import { UploadConfirmation } from "./UploadConfirmation";
import { TaskVideo } from "./TaskVideo";
import { Task } from "./Task";

const SERVER_BASE_URL = new URL(process.env.REACT_APP_SERVER_URL);
const JSON_VIDEO_INFO_URL = new URL("/json-video-info", SERVER_BASE_URL);
const CHANNEL_VIDEO_INFO_URL = new URL("/channel-video-info", SERVER_BASE_URL);
const PLAYLIST_VIDEO_INFO_URL = new URL(
  "/playlist-video-info",
  SERVER_BASE_URL
);
const DOWNLOAD_URL = new URL("/download", SERVER_BASE_URL);

/** Implements video download, submission, and indexing
 *
 * App -> VideoIndex -> UploadYoutubeVideo
 */

export function UploadYoutubeVideo({
  currIndex,
  taskVideos,
  setTaskVideos,
  refetchVideos,
}) {
  const [pendingApiRequest, setPendingApiRequest] = useState(false);
  const [mainMessage, setMainMessage] = useState(null);
  const [selectedJSON, setSelectedJSON] = useState(null);
  const [youtubeChannelId, setYoutubeChannelId] = useState("");
  const [youtubePlaylistId, setYoutubePlaylistId] = useState("");
  const [indexId, setIndexId] = useState(null);
  const [searchQuery, setSearchQuery] = useState(null);
  const [taskIds, setTaskIds] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completeTasks, setCompleteTasks] = useState([]);
  const [failedTasks, setFailedTasks] = useState([]);

  const handleJSONSelect = (event) => {
    setSelectedJSON(event.target.files[0]);
  };

  const handleReset = () => {
    setPendingApiRequest(false);
    setTaskVideos(null);
    setSelectedJSON(null);
    setYoutubeChannelId("");
    setYoutubePlaylistId("");
    setSearchQuery(null);
    setIndexId(null);
    updateMainMessage(null);
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
      "Do not leave or refresh the page. Please wait until indexing is done for ALL videos."
    );

    const videoData = taskVideos.map((videoData) => {
      return {
        url: videoData.video_url || videoData.url,
        title: videoData.title,
        authorName: videoData.author.name,
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
    const taskIds = json.taskIds;
    setIndexId(json.indexId);
    setTaskIds(taskIds);
  };

  useEffect(() => {
    if (taskIds?.length === completeTasks.length + failedTasks.length) {
      updateMetadata();
      handleReset();
      refetchVideos();
    }
  }, [taskIds, completeTasks, failedTasks]);

  async function updateMetadata() {
    const updatePromises = completeTasks.map(async (completeTask) => {
      const matchingVid = taskVideos?.find(
        (taskVid) => `${taskVid.title}.mp4` === completeTask.metadata?.filename
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
        TwelveLabsApi.updateVideo(currIndex, completeTask.video_id, data);
      }
    });
    await Promise.all(updatePromises);
  }

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
            taskVideos={taskVideos}
          />

          <div className="taskVideoContainer">
            {taskVideos.map((taskVideo) => (
              <ErrorBoundary
                FallbackComponent={ErrorFallback}
                key={taskVideo.id || taskVideo.videoId}
              >
                <Suspense fallback={<LoadingSpinner />}>
                  <div className="taskVideo">
                    <TaskVideo taskVideo={taskVideo} className="taskVideo" />
                  </div>
                </Suspense>
              </ErrorBoundary>
            ))}
          </div>
        </>
      )}

      {taskVideos && isSubmitting && (
        <>
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
                      <TaskVideo
                        taskVideo={taskVideo}
                        pendingApiRequest={pendingApiRequest}
                        className="taskVideo"
                      />
                    </div>
                  </Suspense>
                </ErrorBoundary>
              ))}
            </div>
            {!taskIds && (
              <div className="downloadSubmit">
                <LoadingSpinner />
                Downloading & Submitting...
              </div>
            )}
            {taskIds && (
              <div className="taskVideoContainer">
                {taskIds.map((taskId) => (
                  <ErrorBoundary
                    FallbackComponent={ErrorFallback}
                    key={taskId._id}
                  >
                    <Suspense fallback={<LoadingSpinner />}>
                      <div className="task">
                        <Task
                          taskId={taskId._id}
                          taskVideos={taskVideos}
                          setCompleteTasks={setCompleteTasks}
                          setFailedTasks={setFailedTasks}
                        />
                      </div>
                    </Suspense>
                  </ErrorBoundary>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default UploadYoutubeVideo;

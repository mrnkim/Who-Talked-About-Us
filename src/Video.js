import { React, useEffect, useState } from "react";
import TwelveLabsApi from "./api";
import VideoPlayer from "./VideoPlayer";
import { Button } from "react-bootstrap";

function Video({
  index_id,
  video_id,
  start = 0,
  end: propEnd = 0,
  deleteVideo,
  showDeleteButton,
}) {
  const [videoData, setVideoData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [end, setEnd] = useState(null);
  const [options, setOptions] = useState({
    controls: true,
    responsive: true,
    fluid: true,
    sources: [],
    start: start,
  });

  useEffect(() => {
    async function fetchVideoData() {
      setIsLoading(true);
      const data = await TwelveLabsApi.getVideo(index_id, video_id);
      setVideoData(data);
      const endTime = propEnd !== 0 ? propEnd : data?.metadata?.duration ?? 0;
      setEnd(endTime);
      if (data?.hls) {
        // ensure that data.hls is available before updating the options
        setOptions((prevOptions) => ({
          ...prevOptions,
          sources: [
            {
              src: `${data.hls.video_url}#t=${start},${endTime}`,
              type: "application/x-mpegURL",
            },
          ],
        }));
      }
      setIsLoading(false);
    }
    fetchVideoData();
  }, [index_id, video_id, start, propEnd]);

  if (isLoading) return <i>Loading...</i>;
  return (
    <div>
      <VideoPlayer end={end} options={options} />
      <div className="m-1">
        {showDeleteButton && (
          <Button
            size="sm"
            variant="danger"
            onClick={() => deleteVideo(index_id, video_id)}
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}

export default Video;

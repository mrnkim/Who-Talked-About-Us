import { React, useEffect, useState } from "react";
import TwelveLabsApi from "./api";
import VideoPlayer from "./VideoPlayer";

function Video({ id }) {
  console.log("🚀 > Video > id=", id);
  const [videoData, setVideoData] = useState(null);

  useEffect(() => {
    async function fetchVideoData() {
      const data = await TwelveLabsApi.getVideo(id);
      console.log("🚀 > fetchVideoData > data=", data);
      setVideoData(data);
    }
    fetchVideoData();
  }, []);

  if (!videoData) return <i>Loading...</i>;

  return (
    <VideoPlayer
      options={{
        controls: true,
        responsive: true,
        fluid: true,
        sources: [
          {
            src: videoData.hls.video_url,
            type: "application/x-mpegURL",
          },
        ],
      }}
    />
  );
}

export default Video;

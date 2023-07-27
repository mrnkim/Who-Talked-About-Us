import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "./VideoPlayer.css";

function VideoPlayer({ options }) {
  const videoNode = useRef(null);

  useEffect(() => {
    if (videoNode.current) {
      const player = videojs(
        videoNode.current,
        options,
        function onPlayerReady() {
          console.log("onPlayerReady", this);
        }
      );
      return () => {
        player.dispose();
      };
    }
  }, [options]);

  return (
    <div className="video-wrapper">
      <div data-vjs-player>
        <video ref={videoNode} className="video-js" />
      </div>
    </div>
  );
}

export default VideoPlayer;

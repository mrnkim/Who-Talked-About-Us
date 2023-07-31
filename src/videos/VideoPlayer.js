import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "./VideoPlayer.css";

/** Shows a video player  */

function VideoPlayer({ options, end }) {
  const videoNode = useRef(null);
  const player = useRef(null);
  const endAsNumber = Number(end);

  useEffect(() => {
    if (videoNode.current) {
      player.current = videojs(
        videoNode.current,
        options,
        function onPlayerReady() {
          console.log("onPlayerReady", this);
        }
      );

      player.current.currentTime(options.start);

      player.current.on("timeupdate", function () {
        if (player.current.currentTime() > endAsNumber) {
          console.log("Pausing video...");
          player.current.currentTime(endAsNumber);
          player.current.pause();
        }
      });

      return () => {
        if (player.current) {
          player.current.dispose();
        }
      };
    }
  }, [options, end]);

  return (
    <div className="video-wrapper">
      <div data-vjs-player>
        <video ref={videoNode} className="video-js" />
      </div>
    </div>
  );
}

export default VideoPlayer;

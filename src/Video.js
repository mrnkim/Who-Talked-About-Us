import React from "react";

function Video() {
  return (
    <video
      id="my_video_1"
      className="video-js vjs-default-skin"
      controls
      preload="none"
      width="640"
      height="264"
      data-setup="{}"
    >
      <source
        src="https://deuqpmn4rs7j5.cloudfront.net/64b9c5e761a4766a5872b449/64c1b534e180755b8bc4e974/stream/706f929c-0309-4674-9c8b-caf9780ed4ee.m3u8"
        type="application/x-mpegURL"
      />
    </video>
  );
}

export default Video;

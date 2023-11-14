require("dotenv").config();

const express = require("express");
const cors = require("cors");
const ytdl = require("ytdl-core");
const ytpl = require("ytpl");
const fs = require("fs");
const bodyParser = require("body-parser");
const app = express();
const axios = require("axios").default;
const ytch = require("yt-channel-info");
const sanitize = require("sanitize-filename");
const util = require("util");
const streamPipeline = util.promisify(require("stream").pipeline);

/** Define constants and configure TL API endpoints */
const TWELVE_LABS_API_KEY = process.env.REACT_APP_API_KEY;
const API_BASE_URL = process.env.REACT_APP_API_URL;
const TWELVE_LABS_API = axios.create({
  baseURL: API_BASE_URL,
});
const PORT_NUMBER = process.env.REACT_APP_PORT_NUMBER;

/** Set up middleware for Express */
app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

/** Define error handling middleware */
const errorLogger = (error, request, response, next) => {
  console.error(error.stack);
  next(error);
};

const errorHandler = (error, request, response, next) => {
  return response
    .status(error.status || 500)
    .json(error || "Something Went Wrong...");
};

app.use(errorLogger, errorHandler);

process.on("uncaughtException", function (exception) {
  console.log(exception);
});

/** Set up Express server to listen on port 4001 */
app.listen(PORT_NUMBER, () => {
  console.log("Server Running. Listening on port 4001");
});

/** Takes a downloaded video and initiates the indexing process */
const indexVideo = async (videoPath, indexId) => {
  const headers = {
    headers: {
      accept: "application/json",
      "Content-Type": "multipart/form-data",
      "x-api-key": TWELVE_LABS_API_KEY,
    },
  };

  let params = {
    index_id: indexId,
    video_file: fs.createReadStream(videoPath),
    language: "en",
  };

  const response = await TWELVE_LABS_API.post("/tasks", params, headers);
  return await response.data;
};

/** Get JSON-formatted video information from a YouTube URL using ytdl */
app.get("/json-video-info", async (request, response, next) => {
  try {
    let url = request.query.URL;
    const videoId = ytdl.getURLVideoID(url);
    const videoInfo = await ytdl.getBasicInfo(videoId);

    response.json(videoInfo.videoDetails);
  } catch (error) {
    return next(error);
  }
});

/** Get JSON-formatted video information from a YouTube channel using ytch & ytdl */
app.get("/channel-video-info", async (request, response, next) => {
  try {
    const channelVideos = await ytch.getChannelVideos({
      channelId: request.query.CHANNEL_ID,
    });

    const channelVideosInfo = channelVideos.items.map(async (videoInfo) => {
      return await ytdl.getBasicInfo(videoInfo.videoId);
    });
    const videosData = await Promise.all(channelVideosInfo).catch(next);
    const videosDetails = videosData.map((video) => {
      return video.videoDetails;
    });
    response.json(videosDetails);
  } catch (error) {
    return next(error);
  }
});

/** Get JSON-formatted video information from a YouTube playlist using ytch & ytdl */
app.get("/playlist-video-info", async (request, response, next) => {
  try {
    const playlistVideos = await ytpl(request.query.PLAYLIST_ID);
    const playlistVideosDetail = playlistVideos.items;
    response.json(playlistVideosDetail);
  } catch (error) {
    return next(error);
  }
});

/** Download and index videos for analysis, returning task IDs and index ID */
app.post(
  "/download",
  bodyParser.urlencoded(),
  async (request, response, next) => {
    try {
      // Step 1: Extract video data and index information from the request
      const jsonVideos = request.body.videoData;
      const totalVideos = jsonVideos.length;
      let processedVideosCount = 0;
      const chunk_size = 5;
      let videoIndexingResponses = [];
      console.log("Downloading Videos...");

      // Step 2: Download videos in chunks
      for (let i = 0; i < totalVideos; i += chunk_size) {
        const videoChunk = jsonVideos.slice(i, i + chunk_size);
        const chunkDownloadedVideos = [];

        // Download each video in the current chunk.
        await Promise.all(
          videoChunk.map(async (videoData) => {
            try {
              // Generate a safe file name for the downloaded video
              const safeName = sanitize(videoData.title);
              const videoPath = `videos/${safeName}.mp4`;

              // Download the video from the provided URL
              const stream = ytdl(videoData.url, {
                filter: "videoandaudio",
                format: ".mp4",
              });
              await streamPipeline(stream, fs.createWriteStream(videoPath));

              console.log(`${videoPath} -- finished downloading`);
              chunkDownloadedVideos.push(videoPath);
            } catch (error) {
              console.log(`Error downloading ${videoData.title}`);
              console.error(error);
            }
          })
        );

        // Step 3: Submit downloaded videos for indexing
        console.log(
          `Submitting Videos For Indexing | Chunk ${
            Math.floor(i / chunk_size) + 1
          }`
        );

        const chunkVideoIndexingResponses = await Promise.all(
          chunkDownloadedVideos.map(async (video) => {
            console.log(`Submitting ${video} For Indexing...`);
            return await indexVideo(video, request.body.index_id);
          })
        ).catch(next);

        // Log indexing completion and update progress
        console.log("Indexing Submission Completed for Chunk | Task IDs:");

        processedVideosCount += videoChunk.length;
        console.log(
          `Processed ${processedVideosCount} out of ${totalVideos} videos`
        );
        videoIndexingResponses = videoIndexingResponses.concat(
          chunkVideoIndexingResponses
        );

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Step 4: Respond with task IDs for the indexing tasks and the index ID
      console.log(
        "Indexing Submission For All Videos Completed With Task IDs:"
      );
      console.log(videoIndexingResponses);

      response.json({
        taskIds: videoIndexingResponses,
        indexId: request.body.index_id,
      });
    } catch (error) {
      next(error);
    }
  }
);

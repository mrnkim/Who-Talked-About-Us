require("dotenv").config();
const express = require("express");
const cors = require("cors");
const ytdl = require("ytdl-core");
const fs = require("fs");
const bodyParser = require("body-parser");
const app = express();
const axios = require("axios").default;
const ytch = require("yt-channel-info");
const sanitize = require("sanitize-filename");
const util = require("util");
const streamPipeline = util.promisify(require("stream").pipeline);

const TWELVE_LABS_API_KEY = process.env.REACT_APP_API_KEY;
const API_BASE_URL = "https://api.twelvelabs.io/p/v1.1";

const TWELVE_LABS_API = axios.create({
  baseURL: API_BASE_URL,
});

app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

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

const createIndex = async (indexName) => {
  const headers = {
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": TWELVE_LABS_API_KEY,
    },
  };

  const params = JSON.stringify({
    engine_id: "marengo2.5",
    index_options: ["visual", "conversation", "text_in_video", "logo"],
    addons: ["thumbnail"],
    index_name: indexName,
  });

  const response = await TWELVE_LABS_API.post("/indexes", params, headers);
  return await response.data._id;
};

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

process.on("uncaughtException", function (exception) {
  console.log(exception);
});

app.listen(4001, () => {
  console.log("Server Running. Listening on port 4001");
});

app.get("/get-index-info", async (request, response, next) => {
  try {
    const indexId = request.query.INDEX_ID;
    const headers = {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "x-api-key": TWELVE_LABS_API_KEY,
      },
    };
    console.log(indexId);
    const videos = await TWELVE_LABS_API.get(
      `/indexes/${indexId}/videos?&page_limit=50`,
      headers
    );
    const mergedVideos = await Promise.all(
      videos.data.data.map(async (video) => {
        const videoInfo = await TWELVE_LABS_API.get(
          `/indexes/${indexId}/videos/${video._id}`,
          headers
        );
        const videoData = await videoInfo.data;
        return { ...video, ...videoData };
      })
    );
    response.json(mergedVideos);
  } catch (error) {
    return next(error);
  }
});

app.get("/json-video-info", async (request, response, next) => {
  try {
    let url = request.query.URL;
    const videoId = ytdl.getURLVideoID(url);
    const videoInfo = await ytdl.getBasicInfo(videoId);
    console.log("🚀 > app.get > videoInfo=", videoInfo);

    response.json(videoInfo.videoDetails);
  } catch (error) {
    return next(error);
  }
});

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

app.post(
  "/download",
  bodyParser.urlencoded(),
  async (request, response, next) => {
    console.log("🚀 > request=", request);

    try {
      const jsonVideos = request.body.videoData;
      const indexName = request.body.indexName;
      const totalVideos = jsonVideos.length;
      console.log("🚀 > totalVideos=", totalVideos);
      let processedVideosCount = 0;
      const chunk_size = 5;
      let videoIndexingResponses = [];

      // console.log("Creating Index...");
      // const indexId = await createIndex(indexName);
      // console.log(`Index Created With ID: ${indexId}`);

      console.log("Downloading Videos...");

      for (let i = 0; i < totalVideos; i += chunk_size) {
        const videoChunk = jsonVideos.slice(i, i + chunk_size);
        const chunkDownloadedVideos = [];

        await Promise.all(
          videoChunk.map(async (videoData) => {
            try {
              const safeName = sanitize(videoData.title);
              const videoPath = `videos/${safeName}.mp4`;
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
        ).catch(next);

        console.log(
          `Submitting Videos For Indexing | Chunk ${
            Math.floor(i / chunk_size) + 1
          }`
        );

        const chunkVideoIndexingResponses = await Promise.all(
          chunkDownloadedVideos.map(async (video) => {
            console.log(`Submitting ${video} For Indexing...`);
            return await indexVideo(video, request.body.indexName._id);
          })
        ).catch(next);

        console.log("Indexing Submission Completed for Chunk | Task IDs:");
        console.log(chunkVideoIndexingResponses);

        processedVideosCount += videoChunk.length;

        console.log(
          `Processed ${processedVideosCount} out of ${totalVideos} videos`
        );

        videoIndexingResponses = videoIndexingResponses.concat(
          chunkVideoIndexingResponses
        );

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      console.log(
        "Indexing Submission For All Videos Completed With Task IDs:"
      );
      console.log(videoIndexingResponses);

      response.json({ taskIds: videoIndexingResponses, indexId: request.body.indexName._id });
    } catch (error) {
      next(error);
    }
  }
);

app.get("/check-tasks", async (request, response, next) => {
  try {
    const taskId = request.query.TASK_ID;
    const headers = {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "x-api-key": TWELVE_LABS_API_KEY,
      },
    };

    const taskStatus = await TWELVE_LABS_API.get(`/tasks/${taskId}`, headers);
    response.json(taskStatus.data);
  } catch (error) {
    response.json(error);
    return next(error);
  }
});

app.put("/update-video", async (request, response, next) => {
  try {
    const videoId = request.query.VIDEO_ID;
  } catch (error) {
    return next(error);
  }
});

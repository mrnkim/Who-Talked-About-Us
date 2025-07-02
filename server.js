require("dotenv").config();
const express = require("express");
const cors = require("cors");
const ytdl = require("ytdl-core");
const ytpl = require("ytpl");
const fs = require("fs");
const FormData = require("form-data");
const bodyParser = require("body-parser");
const app = express();
const axios = require("axios").default;
const ytch = require("yt-channel-info");
const sanitize = require("sanitize-filename");
const util = require("util");
const streamPipeline = util.promisify(require("stream").pipeline);

/** Define constants and configure TL API endpoints */
const TWELVE_LABS_API_KEY = process.env.REACT_APP_API_KEY;
const TWELVE_LABS_API = axios.create({
  baseURL: "https://api.twelvelabs.io/v1.3",
});
const PORT_NUMBER = process.env.REACT_APP_PORT_NUMBER
  ? process.env.REACT_APP_PORT_NUMBER
  : 4000;
const PAGE_LIMIT_MAX = 50;

/** Set up middleware for Express */
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

/** Set up Express server to listen on port */
app.listen(PORT_NUMBER, () => {
  console.log(`Server Running. Listening on port ${PORT_NUMBER}`);
});

/*********************** TWELVE LABS API CALLS ********************************/

/** Get indexes */
app.get("/indexes", async (request, response, next) => {
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": TWELVE_LABS_API_KEY,
  };

  const params = {
    page: request.query.page,
    page_limit: request.query.page_limit,
    deleted: false,
  };

  try {
    const apiResponse = await TWELVE_LABS_API.get("/indexes", {
      headers,
      params,
    });
    response.json(apiResponse.data);
  } catch (error) {
    return next(error);
  }
});

/** Get index */
app.get("/indexes/:indexId", async (request, response, next) => {
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": TWELVE_LABS_API_KEY,
  };

  try {
    const apiResponse = await TWELVE_LABS_API.get(
      `/indexes/${request.params.indexId}`,
      {
        headers,
      }
    );
    response.json(apiResponse.data);
  } catch (error) {
    const errorResponse = { error: error.response.data };
    response.json(errorResponse);
  }
});

/** Creates an index */
app.post("/indexes", async (request, response, next) => {
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": TWELVE_LABS_API_KEY,
  };

  // Forward the correct fields to TwelveLabs API
  const data = {
    index_name: request.body.index_name,
    models: request.body.models,
    ...(request.body.addons ? { addons: request.body.addons } : {}),
  };

  try {
    const apiResponse = await TWELVE_LABS_API.post("/indexes", data, {
      headers,
    });
    response.json(apiResponse.data);
  } catch (error) {
    response
      .status(error.response?.status || 500)
      .json(error.response?.data || { error: "Unknown error" });
  }
});

/** Deletes an index */
app.delete("/indexes", async (request, response, next) => {
  const headers = {
    accept: "application/json",
    "Content-Type": "application/json",
    "x-api-key": TWELVE_LABS_API_KEY,
  };
  try {
    const apiResponse = await TWELVE_LABS_API.delete(
      `/indexes/${request.query.indexId}`,
      {
        headers,
      }
    );
    response.json(apiResponse.data);
  } catch (error) {
    return next(error);
  }
});

/** Get videos */
app.get("/indexes/:indexId/videos", async (request, response, next) => {
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": TWELVE_LABS_API_KEY,
  };

  const params = {
    page: request.query.page,
    page_limit: request.query.page_limit,
    whoTalkedAboutUs: true,
  };

  try {
    const apiResponse = await TWELVE_LABS_API.get(
      `/indexes/${request.params.indexId}/videos`,
      {
        headers,
        params,
      }
    );
    response.json(apiResponse.data);
  } catch (error) {
    console.error("Error getting videos:", error);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

/** Get all authors of an index */
app.get("/indexes/:indexId/authors", async (request, response, next) => {
  const indexId = request.params.indexId;
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": TWELVE_LABS_API_KEY,
  };

  try {
    const authors = new Set();
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      let apiResponse = await TWELVE_LABS_API.get(
        `/indexes/${indexId}/videos`,
        {
          headers,
          params: {
            page,
            page_limit: PAGE_LIMIT_MAX,
            whoTalkedAboutUs: true,
          },
        }
      );
      apiResponse = apiResponse.data;

      if (apiResponse && apiResponse.data.length > 0) {
        apiResponse.data.forEach((video) => {
          const sanitizedAuthor = sanitize(`${video.user_metadata.author}`);
          authors.add(sanitizedAuthor);
        });

        if (apiResponse.page_info && apiResponse.page_info.total_page > page) {
          page++;
        } else {
          hasMore = false;
        }
      } else {
        break;
      }
    }
    response.json(Array.from(authors));
  } catch (error) {
    return next(error);
  }
});

/** Search videos with a given query */
app.post("/search", async (request, response, next) => {
  const headers = {
    accept: "application/json",
    "Content-Type": "application/json",
    "x-api-key": TWELVE_LABS_API_KEY,
  };

  const data = {
    index_id: request.body.indexId,
    search_options: ["visual", "conversation", "text_in_video", "logo"],
    query: request.body.query,
    group_by: "video",
    sort_option: "clip_count",
    threshold: "medium",
    page_limit: 2,
  };

  try {
    const apiResponse = await TWELVE_LABS_API.post("/search", data, {
      headers,
    });
    response.json(apiResponse.data);
  } catch (error) {
    return next(error);
  }
});

/** Get a video of an index */
app.get(
  "/indexes/:indexId/videos/:videoId",
  async (request, response, next) => {
    const indexId = request.params.indexId;
    const videoId = request.params.videoId;

    const headers = {
      "Content-Type": "application/json",
      "x-api-key": TWELVE_LABS_API_KEY,
    };

    try {
      const apiResponse = await TWELVE_LABS_API.get(
        `/indexes/${indexId}/videos/${videoId}`,
        {
          headers,
        }
      );
      response.json(apiResponse.data);
    } catch (error) {
      return next(error);
    }
  }
);

/** Get search results of a specific page */
app.get("/search/:pageToken", async (request, response, next) => {
  const pageToken = request.params.pageToken;

  const headers = {
    "Content-Type": "application/json",
    "x-api-key": TWELVE_LABS_API_KEY,
  };

  try {
    const apiResponse = await TWELVE_LABS_API.get(`/search/${pageToken}`, {
      headers,
    });
    response.json(apiResponse.data);
  } catch (error) {
    return next(error);
  }
});

/** Updates a video's metadata */
app.put("/update/:indexId/:videoId", async (request, response, next) => {
  const indexId = request.params.indexId;
  const videoId = request.params.videoId;
  const data = request.body;
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": TWELVE_LABS_API_KEY,
  };

  try {
    const apiResponse = await TWELVE_LABS_API.put(
      `/indexes/${indexId}/videos/${videoId}`,
      data,
      { headers }
    );
    response.json(apiResponse.data);
  } catch (error) {
    return next(error);
  }
});

/** Check the status of a specific indexing task */
app.get("/tasks/:taskId", async (request, response, next) => {
  const taskId = request.params.taskId;
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": TWELVE_LABS_API_KEY,
  };

  try {
    const apiResponse = await TWELVE_LABS_API.get(`/tasks/${taskId}`, {
      headers,
    });
    response.json(apiResponse.data);
  } catch (error) {
    return next(error);
  }
});

/** Takes a downloaded video and initiates the indexing process */
const indexVideo = async (videoPath, indexId) => {
  const headers = {
    accept: "application/json",
    "Content-Type": "multipart/form-data",
    "x-api-key": TWELVE_LABS_API_KEY,
  };

  // Create FormData
  const formData = new FormData();
  formData.append("index_id", indexId);
  formData.append("video_file", fs.createReadStream(videoPath));
  formData.append("language", "en");

  try {
    console.log(`Uploading video to TwelveLabs: ${videoPath}`);
    const response = await TWELVE_LABS_API.post("/tasks", formData, {
      headers,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });
    console.log(`Successfully uploaded video: ${videoPath}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error uploading video ${videoPath} to TwelveLabs:`,
      error.response?.data || error
    );
    throw error;
  }
};

/**************************** OTHER CALLS *************************************/

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
                quality: "highest",
                filter: "audioandvideo",
                requestOptions: {
                  headers: {
                    "User-Agent":
                      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    Accept:
                      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                    "Accept-Language": "en-US,en;q=0.9",
                    "Sec-Fetch-Mode": "navigate",
                  },
                },
              });
              await streamPipeline(stream, fs.createWriteStream(videoPath));

              console.log(`${videoPath} -- finished downloading`);

              chunkDownloadedVideos.push({
                videoPath: videoPath,
                videoData: videoData,
              });
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
          chunkDownloadedVideos.map(async (chunkDownloadedVideo) => {
            console.log(
              `Submitting ${chunkDownloadedVideo.videoPath} For Indexing...`
            );
            const indexingResponse = await indexVideo(
              chunkDownloadedVideo.videoPath,
              request.body.index_id
            );

            // Add videoData to indexingResponse
            indexingResponse.videoData = chunkDownloadedVideo.videoData;

            return indexingResponse;
          })
        ).catch(next);

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

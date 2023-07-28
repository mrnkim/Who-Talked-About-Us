import { Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import SearchForm from "./SearchForm";
import TwelveLabsApi from "./api";
import Video from "./Video";
import VideoList from "./VideoList";
import SearchResult from "./SearchResult";
import UploadForm from "./UploadForm";

function Library({ data }) {
  const currIndex = data._id;
  const [showComponents, setShowComponents] = useState(false);
  const [videos, setVideos] = useState({ data: null, isLoading: true });
  const [searchResults, setSearchResults] = useState({
    data: [],
    isLoading: true,
  });
  const [newVideoStatus, setNewVideoStatus] = useState({});
  console.log("🚀 > Library > newVideoStatus=", newVideoStatus);

  useEffect(function fetchVideosOnMount() {
    async function fetchVideos() {
      const responses = await TwelveLabsApi.getVideos(currIndex);
      setVideos({ data: responses, isLoading: false });
    }
    fetchVideos();
  }, []);

  async function searchVideo(indexId, query) {
    const result = await TwelveLabsApi.searchVideo(indexId, query);
    setSearchResults({
      data: [...result.data],
      isLoading: false,
    });
  }

  async function uploadVideo(indexId, videoUrl) {
    const newVideo = await TwelveLabsApi.uploadVideo(indexId, videoUrl);
    console.log("🚀 > uploadVideo > newVideo=", newVideo);

    setNewVideoStatus((prevStatus) => ({
      ...prevStatus,
      [newVideo._id]: "pending",
    }));

    const intervalId = setInterval(async () => {
      let newVideoStatus = await TwelveLabsApi.checkStatus(newVideo._id);

      if (newVideoStatus[newVideo] === "ready") {
        clearInterval(intervalId);
        setNewVideoStatus(newVideoStatus[newVideo]);
      }
    }, 5000);

    setVideos((videos) => ({
      data: [...videos.data, newVideo],
      isLoading: false,
    }));
    console.log("🚀 > Library > videos=", videos);
  }

  const handleClick = () => {
    setShowComponents(!showComponents);
  };

  return (
    <div>
      <Button onClick={handleClick}>{data.index_name}</Button>
      {showComponents && (
        <div>
          <UploadForm index={currIndex} upload={uploadVideo} />

          <SearchForm index={currIndex} search={searchVideo} />
          {searchResults.data && (
            <div>
              <h2>Search Results</h2>
              {searchResults.data.map((data) => (
                <div>
                  <Video
                    key={data.start}
                    index_id={currIndex}
                    video_id={data.video_id}
                    start={data.start}
                    end={data.end}
                  />
                  start: {data.start}, end: {data.end}, confidence:{" "}
                  {data.confidence}
                </div>
              ))}
            </div>
          )}
          <div>
            <div>
              <h2>All Videos</h2>
            </div>
            {videos.data &&
              videos.data.map((data) => (
                <Video
                  key={data._id}
                  index_id={currIndex}
                  video_id={data._id}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Library;

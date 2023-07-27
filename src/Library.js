import { Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import SearchForm from "./SearchForm";
import TwelveLabsApi from "./api";
import Video from "./Video";
import VideoList from "./VideoList";
import SearchResult from "./SearchResult";

function Library({ data }) {
  const currIndex = data._id;
  const [showComponents, setShowComponents] = useState(false);
  const [videos, setVideos] = useState({ data: null, isLoading: true });
  console.log("🚀 > Library > videos=", videos);

  useEffect(function fetchVideosOnMount() {
    async function fetchVideos() {
      const responses = await TwelveLabsApi.getVideos();
      const filteredResponses = responses.filter(
        (response) => response.index_id === currIndex
      );
      setVideos({ data: filteredResponses, isLoading: false });
    }
    fetchVideos();
  }, []);

  // async function getVideo(id) {
  //   // const ids=videos.data.map(data => data._id);
  //   const videoData = await TwelveLabsApi.getVideo(id);
  //   console.log("🚀 > getVideo > videoData=", videoData);
  //   return videoData;
  // }

  const handleClick = () => {
    setShowComponents(!showComponents);
  };

  return (
    <div>
      <Button onClick={handleClick}>{data.index_name}</Button>
      {showComponents && (
        <div>
          <SearchForm />
          {/* <SearchResult /> */}
          <div>
            <div>
              <h2>All Videos</h2>
            </div>
            {videos.data &&
              videos.data.map((data) => <Video key={data._id} id={data._id} />)}
          </div>
        </div>
      )}
    </div>
  );
}

export default Library;

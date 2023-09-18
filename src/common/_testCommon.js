const TEST_INDEXES = {
  data: [
    { _id: 1, index_name: "INDEX1" },
    { _id: 2, index_name: "INDEX2" },
  ],
  isLoading: false,
};

const TEST_VIDEOS = {
  data: [
    { _id: 1, video_name: "VIDEO1" },
    { _id: 2, video_name: "VIDEO2" },
  ],
  isLoading: false,
};

const SEARCH_RESULT = {
  data: [
    {
      confidence: "high",
      end: 25,
      score: 83.82,
      start: 20,
      video_id: "VIDEO1",
      author: "AUTHOR",
      filename: "VIDEO1",
    },
  ],
  isLoading: false,
};

const TEST_OPTIONS = {
  controls: true,
  responsive: true,
  fluid: true,
  sources: [],
  start: 20,
};

export { TEST_INDEXES, TEST_VIDEOS, SEARCH_RESULT, TEST_OPTIONS };

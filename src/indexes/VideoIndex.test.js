import { render } from "@testing-library/react";
import VideoIndex from "./VideoIndex";
import TwelveLabsApi from "../api/api";

jest.mock("../api/api");

describe("VideoIndex", () => {
  beforeEach(() => {
    TwelveLabsApi.getVideos.mockClear();
    TwelveLabsApi.searchVideo.mockClear();
    TwelveLabsApi.uploadVideo.mockClear();
    TwelveLabsApi.deleteVideo.mockClear();
  });

  const index = {
    _id: "1234",
    index_name: "Test Index",
  };

  test("should render without crashing", () => {
    render(<VideoIndex index={index} />);
  });
});

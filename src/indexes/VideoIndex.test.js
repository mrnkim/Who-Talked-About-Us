import { render, fireEvent, waitFor } from "@testing-library/react";
import VideoIndex from "./VideoIndex";
import TwelveLabsApi from "../api/api";

jest.mock("../api/api"); 

describe("VideoIndex", () => {
  beforeEach(() => {
    // This will reset the mock status before each test.
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

  test("should fetch videos on mount", async () => {
    TwelveLabsApi.getVideos.mockResolvedValue([]);

    render(<VideoIndex index={index} />);

    await waitFor(() =>
      expect(TwelveLabsApi.getVideos).toHaveBeenCalledTimes(1)
    );
  });

  test("should call deleteIndex when Delete button is clicked", () => {
    const deleteIndexMock = jest.fn();
    const { getByText } = render(
      <VideoIndex index={index} deleteIndex={deleteIndexMock} />
    );

    const deleteButton = getByText("Delete");
    fireEvent.click(deleteButton);

    expect(deleteIndexMock).toHaveBeenCalledTimes(1);
    expect(deleteIndexMock).toHaveBeenCalledWith(index._id);
  });
});

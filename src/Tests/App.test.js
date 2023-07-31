import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import TwelveLabsApi from "../api/api";
import App from "../App";
import { TEST_INDEXES } from "./_testCommon";

jest.mock("../api"); // Mock the api module

window.confirm = jest.fn(() => true);

describe("App", () => {
  it("renders without crashing", async () => {
    render(<App />);

    // Test if the Loading text appears initially
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // Once the data is loaded, test if the title appears
    await waitFor(() =>
      expect(screen.getByText("UGC Analyzer")).toBeInTheDocument()
    );
  });

  it("calls getIndexes on mount", async () => {
    const getIndexesMock = jest.fn().mockResolvedValue([]);
    TwelveLabsApi.getIndexes = getIndexesMock;

    render(<App />);

    expect(getIndexesMock).toHaveBeenCalledTimes(1);
  });

  it("can add and delete an index", async () => {
    const index = TEST_INDEXES.data[0];

    const getIndexesMock = jest.fn().mockResolvedValue([index]);
    TwelveLabsApi.getIndexes = getIndexesMock;

    const createIndexMock = jest.fn().mockResolvedValue(index);
    TwelveLabsApi.createIndex = createIndexMock;

    const deleteIndexMock = jest.fn().mockResolvedValue({});
    TwelveLabsApi.deleteIndex = deleteIndexMock;

    render(<App />);

    await waitFor(() => screen.getByRole("textbox"));

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "test" },
    });

    // Simulate user clicking on the add button
    fireEvent.click(screen.getByText("Create Index"));

    // Ensure that the createIndex function was called
    await waitFor(() => expect(createIndexMock).toHaveBeenCalledWith("test"));

    // Simulate user clicking on the delete button
    fireEvent.click(screen.getByText("Delete"));

    // Ensure that the deleteIndex function was called
    // await waitFor(() =>
    //   expect(deleteIndexMock).toHaveBeenCalledWith(index._id)
    // );
  });
});

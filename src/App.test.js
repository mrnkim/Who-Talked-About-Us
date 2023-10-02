import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils"; // Add this import
import TwelveLabsApi from "./api/api";
import App from "./App";
import { TEST_INDEXES } from "./common/_testCommon";

jest.mock("./api/api"); // Mock the api module

window.confirm = jest.fn(() => true);

describe("App", () => {
  it("renders without crashing", async () => {
    render(<App />);

    // Test if the Loading text appears initially
    expect(screen.getByText("Loading")).toBeInTheDocument();

    // Once the data is loaded, test if the title appears
    await waitFor(() =>
      expect(
        screen.getByText(
          "Find the right influencers (organic brand fans) to reach out"
        )
      ).toBeInTheDocument()
    );
  });

  it("calls getIndexes on mount", async () => {
    const getIndexesMock = jest.fn().mockResolvedValue([]);
    TwelveLabsApi.getIndexes = getIndexesMock;

    render(<App />);

    expect(getIndexesMock).toHaveBeenCalledTimes(1);
  });
});

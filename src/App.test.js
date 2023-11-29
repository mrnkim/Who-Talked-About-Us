import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { useGetIndexes } from "./api/apiHooks";
import App from "./App";

jest.mock("./api/apiHooks");

const mockIndexes = {
  data: {
    data: [
      { _id: "1", index_name: "testIndex1", index_options: [] },
      { _id: "2", index_name: "testIndex2", index_options: [] },
    ],
  },
  isLoading: false,
};

describe("App", () => {
  beforeEach(() => {
    useGetIndexes.mockReturnValue(mockIndexes);
  });

  it("renders without crashing", async () => {
    render(<App />);

    // Wait for the data to be loaded
    await waitFor(() => {
      expect(screen.getByText(/who talked about us/i)).toBeInTheDocument();
      expect(
        screen.getByText(/find the right influencers/i)
      ).toBeInTheDocument();
    });
  });
});

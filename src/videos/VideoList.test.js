import React from "react";
import { render, screen } from "@testing-library/react";
import VideoList from "./VideoList.js";
import { TEST_VIDEOS } from "../common/_testCommon.js";

it("renders without crashing", function () {
  render(<VideoList videos={TEST_VIDEOS} />);
});

it("matches snapshot", function () {
  const { container } = render(<VideoList videos={TEST_VIDEOS} />);
  expect(container).toMatchSnapshot();
});

it("shows loading", function () {
  render(<VideoList videos={TEST_VIDEOS} />);
  const loadingElements = screen.getAllByText("Loading...");
  loadingElements.forEach((element) => {
    expect(element).toBeInTheDocument();
  });
});

import React from "react";
import { render, waitFor } from "@testing-library/react";
import Video from "../videos/Video.js";
import { TEST_VIDEOS } from "./_testCommon.js";

it("renders without crashing", function () {
  render(<Video videos={TEST_VIDEOS} />);
});

it("matches snapshot", function () {
  const { container } = render(<Video videos={TEST_VIDEOS} />);
  expect(container).toMatchSnapshot();
});
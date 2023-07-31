import React from "react";
import { render } from "@testing-library/react";
import Video from "./Video.js";
import { TEST_VIDEOS } from "../common/_testCommon.js";

it("renders without crashing", function () {
  render(<Video videos={TEST_VIDEOS} />);
});

it("matches snapshot", function () {
  const { container } = render(<Video videos={TEST_VIDEOS} />);
  expect(container).toMatchSnapshot();
});

import React from "react";
import { render, screen } from "@testing-library/react";
import SearchResultList from "../SearchResultList.js";
import { SEARCH_RESULT } from "./_testCommon.js";

it("renders without crashing", function () {
  render(<SearchResultList searchResults={SEARCH_RESULT} />);
});

it("matches snapshot", function () {
  const { container } = render(
    <SearchResultList searchResults={SEARCH_RESULT} />
  );
  expect(container).toMatchSnapshot();
});

// it("shows search result start and end times", async function () {
//   render(<SearchResultList searchResults={SEARCH_RESULT} />);
//   const startElement = await screen.findByText("Start: 20");
//   const endElement = await screen.findByText("End: 25");
//   expect(startElement).toBeInTheDocument();
//   expect(endElement).toBeInTheDocument();
// });

import React from "react";
import { render, fireEvent } from "@testing-library/react";
import SearchForm from "./SearchForm";

it("renders without crashing", function () {
  render(<SearchForm />);
});

it("matches snapshot", function () {
  const { container } = render(<SearchForm />);
  expect(container).toMatchSnapshot();
});

it("has the correct element and text", function () {
  const { container } = render(<SearchForm />);

  const button = container.querySelector("Button");
  expect(button.textContent).toBe("");
});

it("updates the form input on change", function () {
  const { getByTestId } = render(<SearchForm />);
  const input = getByTestId("search-input");

  fireEvent.change(input, { target: { value: "test query" } });

  expect(input.value).toBe("test query");
});

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
  expect(button.textContent).toBe("Search");
});

it("updates the form input on change", function () {
  const { getByTestId } = render(<SearchForm />);
  const input = getByTestId("search-input");

  fireEvent.change(input, { target: { value: "test query" } });

  expect(input.value).toBe("test query");
});

it("calls the search function with trimmed query on form submission with valid input", function () {
  const mockSearchFunction = jest.fn();
  const { getByTestId, getByText } = render(
    <SearchForm index="test-index" search={mockSearchFunction} />
  );

  // Simulate typing "test query" in the input field
  const input = getByTestId("search-input");
  fireEvent.change(input, { target: { value: "test query" } });

  // Click the submit button
  const submitButton = getByText("Search");
  fireEvent.click(submitButton);

  // Check if the search function is called with the correct arguments
  expect(mockSearchFunction).toHaveBeenCalledWith("test-index", "test query");
});

it("displays an error message when the form is submitted with empty input", function () {
  const { getByTestId, getByText } = render(<SearchForm />);
  const input = getByTestId("search-input");
  const submitButton = getByText("Search");

  fireEvent.click(submitButton);

  const errorMessage = getByText("Please enter the search term");
  expect(errorMessage).toBeInTheDocument();
});

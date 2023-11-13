import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import SearchForm from "./SearchForm";

jest.mock("../api/apiHooks");

describe("SearchForm", () => {
  it("renders without crashing", () => {
    const { getByLabelText } = render(<SearchForm />);
    expect(getByLabelText(/What are you looking for?/i)).toBeInTheDocument();
  });
});

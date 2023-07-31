import React from "react";
import { render } from "@testing-library/react";
import InputForm from "../InputForm.js";

it("renders without crashing", function () {
  render(<InputForm />);
});

it("matches snapshot", function () {
  const { container } = render(<InputForm />);
  expect(container).toMatchSnapshot();
});

it("has the correct element and text", function () {
  const { container } = render(<InputForm />);

  const button = container.querySelector("Button");
  expect(button.getAttribute("type")).toEqual("submit");
});

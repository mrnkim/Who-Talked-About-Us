import React from "react";
import { render } from "@testing-library/react";
import IndexForm from "../IndexForm";

it("renders without crashing", function () {
  render(<IndexForm />);
});

it("matches snapshot", function () {
  const { container } = render(<IndexForm />);
  expect(container).toMatchSnapshot();
});

it("has the correct element and text", function () {
  const { container } = render(<IndexForm />);

  const button = container.querySelector("Button");
  expect(button.textContent).toBe("Create Index");
});

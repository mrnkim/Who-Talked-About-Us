import React from "react";
import { render } from "@testing-library/react";
import IndexForm from "./IndexForm";

it("renders without crashing", function () {
  render(<IndexForm />);
});

it("matches snapshot", function () {
  const { container } = render(<IndexForm />);
  expect(container).toMatchSnapshot();
});



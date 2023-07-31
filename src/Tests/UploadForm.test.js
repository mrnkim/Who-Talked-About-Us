import React from "react";
import { render } from "@testing-library/react";
import UploadForm from "../videos/UploadForm.js";

it("renders without crashing", function () {
  render(<UploadForm />);
});

it("matches snapshot", function () {
  const { container } = render(<UploadForm />);
  expect(container).toMatchSnapshot();
});

it("has the correct element and text", function () {
  const { container } = render(<UploadForm />);

  const button = container.querySelector("Button");
  expect(button.textContent).toBe("Upload");
});

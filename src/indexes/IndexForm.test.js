import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import IndexForm from "./IndexForm";
import { useCreateIndex } from "../api/apiHooks";

// Mock the useCreateIndex hook
jest.mock("../api/apiHooks", () => ({
  useCreateIndex: () => ({
    mutateAsync: jest.fn(),
  }),
}));

describe("IndexForm", () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  it("renders without crashing", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <IndexForm />
      </QueryClientProvider>
    );

    expect(
      screen.getByLabelText(/Create an index and start analyzing videos!/i)
    ).toBeInTheDocument();
  });
});

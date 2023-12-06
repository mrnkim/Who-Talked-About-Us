import { React, Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import reportWebVitals from "./reportWebVitals";
import  LoadingSpinner from "./common/LoadingSpinner";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
    },
  },
});
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <QueryClientProvider client={queryClient}>
    <Suspense fallback={<LoadingSpinner />}>
      <App />
      <ReactQueryDevtools initialIsOpen />
    </Suspense>
  </QueryClientProvider>
);

reportWebVitals();

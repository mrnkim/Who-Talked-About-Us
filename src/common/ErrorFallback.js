import React from "react";

function ErrorFallback({ error, resetErrorBoundary, setIndexId }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: "red" }}>{error.message}</pre>
      <button className="resetButton" onClick={() => setIndexId(null)}>
        Go back
      </button>
    </div>
  );
}

export default ErrorFallback;

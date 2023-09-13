import React, { useState } from "react";
import InputForm from "../common/InputForm";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
/** Form to search videos
 *
 * - query: search term that updates based on the user input
 *
 * VideoIndex -> SearchForm -> InputForm
 */

function SearchForm({ index, search }) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  /** Updates form input */
  function handleChange(evt) {
    const input = evt.target;
    setQuery(input.value);
  }

  /** Calls parent function to search videos based on a query */
  async function handleSubmit(evt) {
    evt.preventDefault();
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError("Please enter the search term");
    } else {
      search(index, trimmedQuery);
    }
  }

  const closeErrorAlert = () => {
    setError("");
  };

  return (
    <div>
      <InputForm
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        input={query}
        type="What are you looking for? (e.g., applying MAC pink lipstick)"
        buttonText={
          <>
            <i className="bi bi-search"></i> Search
          </>
        }
      />
      {error && (
        <Alert
          severity="error"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={closeErrorAlert}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          style={{ width: "65%", margin: "auto", marginTop: "1rem" }}
        >
          {error}
        </Alert>
      )}
    </div>
  );
}

export default SearchForm;

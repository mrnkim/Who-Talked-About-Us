import React, { useState } from "react";
import InputForm from "../common/InputForm";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import searchIcon from "../svg/Union.svg";
import "./SearchForm.css";

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
    if (error && input.value.trim() !== "") {
      setError("");
    }
  }

  /** Calls parent function to search videos based on a query */
  async function handleSubmit(evt) {
    evt.preventDefault();
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError("Please enter the search term");
    } else {
      search(index, trimmedQuery);
      setQuery("");
    }
  }

  return (
    <div className="inputAndErrorSearch">
      <InputForm
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        input={query}
        type="What are you looking for? (e.g., applying MAC gold highlighter)"
        buttonText="Search"
        icon={searchIcon}
      />
      {error && <div className="errorMessageSearch">{error}</div>}
    </div>
  );
}

export default SearchForm;

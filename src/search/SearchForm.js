import React, { useState } from "react";
import InputForm from "../common/InputForm";
import searchIcon from "../svg/Union.svg";
import "./SearchForm.css";

/** Form to search videos
 *
 * - query: search term that updates based on the user input
 *
 * VideoIndex -> SearchForm -> InputForm
 */

function SearchForm({ searchQuery, setSearchQuery, setFinalSearchQuery }) {
  const [error, setError] = useState("");

  /** Updates form input */
  function handleChange(evt) {
    const input = evt.target;
    setSearchQuery(input.value);
    if (error && input.value.trim() !== "") {
      setError("");
    }
  }

  /** Calls parent function to search videos based on a query */
  function handleSubmit(evt) {
    evt.preventDefault();
    if (searchQuery) {
      const trimmedQuery = searchQuery.trim();
      if (!trimmedQuery) {
        setError("Please enter the search term");
      } else {
        try {
          setFinalSearchQuery(trimmedQuery);
        } catch (error) {
          console.error(error);
        }
      }
    }
  }

  return (
    <div className="inputAndErrorSearch">
      <InputForm
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        type="What are you looking for? (e.g., applying MAC gold highlighter)"
        buttonText="Search"
        icon={searchIcon}
        value={searchQuery}
      />
      {error && <div className="errorMessageSearch">{error}</div>}
    </div>
  );
}

export default SearchForm;

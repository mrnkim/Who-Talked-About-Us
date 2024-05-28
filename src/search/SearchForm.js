import React, { useState } from "react";
import sanitize from "sanitize-filename";
import InputForm from "../common/InputForm";
import searchIcon from "../svg/Union.svg";
import "./SearchForm.css";

/** Form to search videos
 *
 * VideoComponents -> SearchForm -> InputForm
 *
 */

function SearchForm({ searchQuery, setSearchQuery, setFinalSearchQuery }) {
  const [error, setError] = useState("");

  function handleChange(evt) {
    const input = evt.target;
    setSearchQuery(input.value);
    if (error && input.value.trim() !== "") {
      setError("");
    }
  }

  function handleSubmit(evt) {
    evt.preventDefault();
    if (searchQuery) {
      const sanitizedQuery = sanitize(searchQuery);
      if (!sanitizedQuery) {
        setError("Please enter the search term");
      } else {
        try {
          setFinalSearchQuery(sanitizedQuery);
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
        type="What are you looking for?"
        icon={searchIcon}
        value={searchQuery}
        className="searchTextField"
      />
      {error && <div className="errorMessageSearch">{error}</div>}
    </div>
  );
}

export default SearchForm;

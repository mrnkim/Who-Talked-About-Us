import { React, useState } from "react";
import InputForm from "./InputForm";
import { Alert } from "react-bootstrap";

function SearchForm({ index, search }) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  /** Update form input. */
  function handleChange(evt) {
    const input = evt.target;
    setQuery(input.value);
  }

  /** Call parent function and clear form. */
  async function handleSubmit(evt) {
    evt.preventDefault();
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError("Please enter the search term");
    } else {
      search(index, trimmedQuery);
    }
  }
  return (
    <div>
      <InputForm
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        input={query}
        type="Enter a search term"
        buttonText="Search"
      />
      {error && (
        <Alert variant="danger" dismissible>
          {error}
        </Alert>
      )}
    </div>
  );
}

export default SearchForm;

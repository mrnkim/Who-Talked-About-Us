import { React, useState } from "react";
import InputForm from "./InputForm";
import TwelveLabsApi from "./api";

function SearchForm({ index, search }) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [showComponents, setShowComponents] = useState(false);

  /** Update form input. */
  function handleChange(evt) {
    const input = evt.target;
    setQuery(input.value);
  }

  /** Call parent function and clear form. */
  async function handleSubmit(evt) {
    evt.preventDefault();
    const trimmedQuery = query.trim();
    const response = await search(index, trimmedQuery);
  }
  return (
    <div>
      <InputForm
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        input={query}
        type="search"
        buttonText="Search"
      />
    </div>
  );
}

export default SearchForm;

import { React, useState, useEffect } from "react";
import InputForm from "../common/InputForm";
import { Alert } from "react-bootstrap";

function IndexForm({ indexes, addIndex }) {
  const [indexName, setIndexName] = useState("");
  const [error, setError] = useState("");

  /** Update form input. */
  function handleChange(evt) {
    const input = evt.target;
    setIndexName(input.value);
  }

  /** Call parent function and clear form. */
  async function handleSubmit(evt) {
    evt.preventDefault();
    const trimmedIndexName = indexName.trim();

    if (!trimmedIndexName) {
      setError("Please enter the name of an index");
    } else {
      addIndex(trimmedIndexName);
    }
  }

  return (
    <div>
      <InputForm
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        input={indexName}
        type="Enter an index name"
        buttonText="Create Index"
      />

      {error && (
        <Alert variant="danger" dismissible>
          {error}
        </Alert>
      )}
    </div>
  );
}

export default IndexForm;

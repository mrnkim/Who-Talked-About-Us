import { React, useState, useEffect } from "react";
import InputForm from "./InputForm";
import TwelveLabsApi from "./api";
import { Alert } from "react-bootstrap";

function IndexForm({ indexes, setIndexes, addIndex }) {
  const [indexName, setIndexName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    console.log(indexes);
  }, [indexes]);

  /** Update form input. */
  function handleChange(evt) {
    const input = evt.target;
    setIndexName(input.value);
  }

  /** Call parent function and clear form. */
  async function handleSubmit(evt) {
    evt.preventDefault();
    const trimmedIndexName = indexName.trim();
    const newIndex = await addIndex(trimmedIndexName);
  }

  return (
    <div>
      <InputForm
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        input={indexName}
        type="indexName"
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

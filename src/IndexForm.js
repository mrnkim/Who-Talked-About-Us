import { React, useState } from "react";
import InputForm from "./InputForm";
import TwelveLabsApi from "./api";
import { Alert } from "react-bootstrap";

function IndexForm({ indexes, setIndexes }) {
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
    setIndexName(indexName.trim());

    if (!indexName) {
      setError("Please enter index name");
    } else {
      const response = await TwelveLabsApi.createIndex(indexName);
      setIndexes([...indexes, { ...response, index_name: indexName }]);
    }
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

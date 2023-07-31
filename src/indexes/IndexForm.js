import { React, useState } from "react";
import InputForm from "../common/InputForm";
import { Alert } from "react-bootstrap";

/** Form to create a new video index
 *
 * - indexName: a name of a new index that updates based on the user input
 *
 * IndexForm -> InputForm
 */

function IndexForm({ addIndex }) {
  const [indexName, setIndexName] = useState("");
  const [error, setError] = useState("");

  /** Updates form input */
  function handleChange(evt) {
    const input = evt.target;
    setIndexName(input.value);
  }

  /** Calls parent function to create/add a new index */
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

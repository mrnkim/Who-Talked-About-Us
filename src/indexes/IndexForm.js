import React, { useState } from "react";
import InputForm from "../common/InputForm";
import icon from "../svg/Create.svg";
import "./IndexForm.css";
import { useCreateIndex } from "../api/apiHooks";
import { ErrorBoundary } from "react-error-boundary";

/** Renders the input form for an index
 *
 * App -> IndexForm -> InputForm
 */

function IndexForm({ setIndexId }) {
  const createIndexMutation = useCreateIndex(setIndexId);

  const [indexName, setIndexName] = useState("");
  const [error, setError] = useState("");

  function handleChange(evt) {
    const input = evt.target;
    setIndexName(input.value);
    if (error && input.value.trim() !== "") {
      setError("");
    }
  }

  async function handleSubmit(evt) {
    evt.preventDefault();
    const trimmedIndexName = indexName.trim();
    if (!trimmedIndexName) {
      setError("Please enter the name of an index");
    } else {
      try {
        const { data: newIndex, error } = await createIndexMutation.mutateAsync(
          trimmedIndexName
        );

        if (error) {
          setError(
            error.status === 409
              ? `Index name ${trimmedIndexName} already exists. Please use another unique name and try again.`
              : "Error creating index. Please try again."
          );
        } else {
          setIndexName("");
        }
      } catch (error) {
        setError("An error occurred. Please try again later.");
      }
    }
  }

  return (
    <div className="inputAndError">
      <InputForm
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        value={indexName}
        type="Create Index (e.g., January Videos)"
        icon={icon}
        className="textField"
      />
      {error && <div className="errorMessage">{error}</div>}
    </div>
  );
}

export default IndexForm;

import React, { useState } from "react";
import InputForm from "../common/InputForm";
import icon from "../svg/Create.svg";
import "./IndexForm.css";
import { useCreateIndex } from "../api/apiQueries";

/** Renders the input form for an index
 *
 * App -> IndexForm -> InputForm
 */

function IndexForm({ handleRefetch }) {
  const createIndexMutation = useCreateIndex();
  
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
        await createIndexMutation.mutateAsync(trimmedIndexName);
        setIndexName("");
        handleRefetch();
      } catch (error) {
        console.error(error);
      }
    }
  }

  return (
    <div className="inputAndError">
      <InputForm
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        input={indexName}
        type="Create an index and start analyzing videos!"
        icon={icon}
      />
      {error && <div className="errorMessage">{error}</div>}
    </div>
  );
}

export default IndexForm;

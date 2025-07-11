import React, { useState } from "react";
import { useContext } from "react";
import setIndexIdContext from "../common/setIndexIdContext";
import InputForm from "../common/InputForm";
import icon from "../svg/Create.svg";
import "./IndexForm.css";
import { useCreateIndex } from "../apiHooks/apiHooks";

/** Renders the input form for an index
 *
 * App -> IndexForm -> InputForm
 *
 */

function IndexForm() {
  const [indexName, setIndexName] = useState("");
  const [error, setError] = useState("");
  const { setIndexId } = useContext(setIndexIdContext);

  const createIndexMutation = useCreateIndex(setIndexId);

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
    console.log("🚀 > handleSubmit > trimmedIndexName=", trimmedIndexName);
    if (!trimmedIndexName) {
      setError("Please enter the name of an index");
    } else {
      try {
        const { error } = await createIndexMutation.mutateAsync({
          indexName: trimmedIndexName,
        });
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

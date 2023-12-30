import { React, useState, useContext } from "react";
import setIndexIdContext from "../common/setIndexIdContext";
import InputForm from "../common/InputForm";
import icon from "../svg/Folder.svg";
import "./IndexForm.css";

/** Renders the input form for an index
 *
 * App -> ExistingIndexForm -> InputForm
 *
 */

function ExistingIndexForm() {
  const [inputIndexId, setInputIndexId] = useState("");
  const [error, setError] = useState("");
  const { setIndexId } = useContext(setIndexIdContext);

  function handleChange(evt) {
    const input = evt.target;
    setInputIndexId(input.value);
    if (error && input.value.trim() !== "") {
      setError("");
    }
  }

  async function handleSubmit(evt) {
    evt.preventDefault();
    const trimmedIndexId = inputIndexId.trim();

    if (!trimmedIndexId) {
      setError("Please enter the id of an index");
    } else {
      try {
        setIndexId(trimmedIndexId);
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
        input={inputIndexId}
        type="Access Index (e.g., 656e4c39e44fccd3724bf7a2)"
        icon={icon}
        className="textField"
      />
      {error && <div className="errorMessage">{error}</div>}
    </div>
  );
}

export default ExistingIndexForm;

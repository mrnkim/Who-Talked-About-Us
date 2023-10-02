import React, { useState } from "react";
import InputForm from "../common/InputForm";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import icon from "../svg/Create.svg";
import "./IndexForm.css";

function IndexForm({ addIndex }) {
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
      addIndex(trimmedIndexName);
      setIndexName("");
    }
  }

  return (
    <div className="inputAndError">
      <InputForm
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        input={indexName}
        type="Create an index and start analyzing videos!"
        buttonText="Create"
        icon={icon}
      />
      {error && <div className="errorMessage">{error}</div>}
    </div>
  );
}

export default IndexForm;

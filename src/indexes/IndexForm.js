import React, { useState } from "react";
import InputForm from "../common/InputForm";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

function IndexForm({ addIndex }) {
  const [indexName, setIndexName] = useState("");
  const [error, setError] = useState("");

  function handleChange(evt) {
    const input = evt.target;
    setIndexName(input.value);
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

  const closeErrorAlert = () => {
    setError("");
  };

  return (
    <div>
      <InputForm
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        input={indexName}
        type="Create an index and start analyzing videos!"
        buttonText={
          <>
            <i className="bi bi-folder-plus"></i> Create
          </>
        }
      />

      {error && (
        <Alert
          severity="error"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={closeErrorAlert}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          style={{ width: "65%", margin: "auto", marginTop: "1rem" }}
        >
          {error}
        </Alert>
      )}
    </div>
  );
}

export default IndexForm;

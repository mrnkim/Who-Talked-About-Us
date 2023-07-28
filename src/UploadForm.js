import { React, useState } from "react";
import InputForm from "./InputForm";
import TwelveLabsApi from "./api";
import { Alert } from "react-bootstrap";
import Video from "./Video";

function UploadForm({ index, upload }) {
  const [inputUrl, setInputUrl] = useState("");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  /** Update form input. */
  function handleChange(evt) {
    const input = evt.target;
    setInputUrl(input.value);
  }

  /** Call parent function and clear form. */
  async function handleSubmit(evt) {
    evt.preventDefault();

    if (!inputUrl) {
      setError("Please enter the url of a video");
    } else {
      console.log("🚀 > UploadForm > inputUrl=", inputUrl);
      const response = await upload(index, inputUrl);
      console.log("🚀 > handleSubmit > response=", response);
      setResponse(response);
    }
  }

  return (
    <div>
      <InputForm
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        input={inputUrl}
        type="Enter a video url"
        buttonText="Upload"
      />
      {error && (
        <Alert variant="danger" dismissible>
          {error}
        </Alert>
      )}
      {response && <Video />}
    </div>
  );
}

export default UploadForm;

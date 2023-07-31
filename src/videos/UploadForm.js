import { React, useState } from "react";
import InputForm from "../common/InputForm";
import { Alert } from "react-bootstrap";
import Video from "./Video";

/** Form to upload a new video to an index
 *
 * - inputUrl: an URL of a video that updates based on the user input
 *   "https://tinyurl.com/example"
 *
 * VideoIndex -> UploadForm -> InputForm
 */

function UploadForm({ index, upload }) {
  const [inputUrl, setInputUrl] = useState("");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  /** Updates form input */
  function handleChange(evt) {
    const input = evt.target;
    setInputUrl(input.value);
  }

  /** Calls parent function to upload a video */
  async function handleSubmit(evt) {
    evt.preventDefault();

    if (!inputUrl) {
      setError("Please enter the url of a video");
    } else {
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
        data-testid="upload-form"
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

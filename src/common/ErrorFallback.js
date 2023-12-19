import React from "react";
import WarningIcon from "../svg/Warning.svg";
import "./ErrorFallback.css";

function ErrorFallback({ error, setIndexId }) {
  return (
    <div role="alert">
      <p>Something went wrong</p>
      <div className="warningMessageWrapper">
        <img src={WarningIcon} alt="WarningIcon" className="icon"></img>
        <div className="warningMessage">{error?.message || null}</div>
      </div>
      {/* <button className="resetButton" onClick={() => setIndexId(null)}>
        Go back
      </button> */}
    </div>
  );
}

export default ErrorFallback;

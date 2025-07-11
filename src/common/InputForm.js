import React from "react";
import "./InputForm.css";
import infoIcon from "../svg/Info.svg";

function InputForm({
  handleSubmit,
  handleChange,
  value,
  type,
  icon,
  className,
  helpLink,
}) {
  return (
    <form onSubmit={handleSubmit} className="inputForm">
      <div className="inputContainer">
        <input
          onChange={handleChange}
          value={value}
          placeholder={type}
          className={className}
        />
        <button type="submit" className="submitButton">
          <img src={icon} alt="Submit" />
        </button>
        {helpLink && (
          <a
            href={helpLink}
            target="_blank"
            rel="noopener noreferrer"
            className="helpLink"
          >
            <img src={infoIcon} alt="Help" className="infoIcon" />
          </a>
        )}
      </div>
    </form>
  );
}

export default InputForm;

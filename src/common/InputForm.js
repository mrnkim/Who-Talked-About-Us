import React from "react";
import {useState} from "react";
import "./InputForm.css";

/** User input form
 *
 * { IndexForm, SearchForm } -> InputForm
 *
 */

function InputForm({
  handleSubmit,
  handleChange,
  input,
  type,
  buttonText,
  icon,
}) {
  const [isInputFocused, setInputFocused] = useState(false);

  const handleInputFocus = () => {
    setInputFocused(true);
  };

  const handleInputBlur = () => {
    setInputFocused(false);
  };

  return (
    <form
      className="d-flex justify-content-center align-items-center inputForm"
      onSubmit={handleSubmit}
    >
      <div className={`inputContainer ${isInputFocused ? "inputFocused" : ""}`}>
        <button className="primaryButton" type="submit">
          {icon && <img src={icon} alt="Icon" className="icon" />}
        </button>
        <input
          type={type}
          id={type}
          name={type}
          placeholder={type}
          onChange={handleChange}
          value={input}
          aria-label={type}
          data-testid="search-input"
          className="textField"
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
      </div>
    </form>
  );
}

export default InputForm;

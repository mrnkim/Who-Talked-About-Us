import React from "react";
import { useState } from "react";
import "./InputForm.css";

/** User input form
 *
 * { IndexForm, ExistingIndexForm, SearchForm } -> InputForm
 *
 */

function InputForm({
  handleSubmit,
  handleChange,
  value,
  type,
  icon,
  className,
}) {
  const [isInputFocused, setInputFocused] = useState(false);

  const handleInputFocus = () => {
    setInputFocused(true);
  };

  const handleInputBlur = () => {
    setInputFocused(false);
  };

  return (
    <form className="inputForm" onSubmit={handleSubmit}>
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
          value={value}
          aria-label={type}
          data-testid="search-input"
          className={className}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
      </div>
    </form>
  );
}

export default InputForm;

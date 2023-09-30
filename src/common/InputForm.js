import React from "react";
import { Container, Form, Button } from "react-bootstrap";
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
  return (
    <Container className="mt-5">
      <Form
        className="d-flex justify-content-center align-items-center"
        onSubmit={handleSubmit}
      >
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
        />
        <button className="primaryButton" type="submit">
          {icon && <img src={icon} alt="Icon" className="icon" />} {buttonText}
        </button>
      </Form>
    </Container>
  );
}

export default InputForm;

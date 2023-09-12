import React from "react";
import { Container, Form, Button } from "react-bootstrap";

/** User input form
 *
 * { SearchForm } -> InputForm
 *
 */

function InputForm({ handleSubmit, handleChange, input, type, buttonText }) {
  return (
    <Container className="mt-5">
      <Form
        className="d-flex justify-content-center align-items-center"
        onSubmit={handleSubmit}
      >
        <Form.Control
          type={type}
          id={type}
          name={type}
          placeholder={type}
          onChange={handleChange}
          value={input}
          aria-label={type}
          data-testid="search-input"
          style={{ width: "60%", fontSize: "1em" }}
        />
        <Button
          style={{ marginLeft: "3px" }}
          className="rounded"
          variant="secondary"
          type="submit"
        >
          {buttonText}
        </Button>
      </Form>
    </Container>
  );
}

export default InputForm;

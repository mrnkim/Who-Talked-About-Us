import React from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";

function InputForm({handleSubmit, handleChange, input, type, buttonText}) {
  return (
    <Container className="mt-5">
      <Row style={{ display: "flex", justifyContent: "center" }}>
        <Col sm={4}>
          <Form className="d-flex" onSubmit={handleSubmit}>
            <Form.Control
              type={type}
              id={type}
              name={type}
              placeholder={type}
              onChange={handleChange}
              value={input}
              aria-label={type}
            />
            <Button
              style={{ marginLeft: "3px" }}
              className="rounded"
              variant="primary"
              type="submit"
            >
              {buttonText}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default InputForm;

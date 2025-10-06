import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function NotAuthorized() {
  const navigate = useNavigate();

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", backgroundColor: "#FFF5E1" }}
    >
      <Row className="w-100 justify-content-center">
        <Col xs={10} sm={8} md={6} lg={4}>
          <Card
            className="border-0 shadow-sm text-center p-4"
            style={{
              borderRadius: "12px",
              backgroundColor: "#FFF9F2",
              border: "1px solid #D2B48C",
            }}
          >
            <Card.Body>
              <div className="mb-4">
                <i
                  className="bi bi-shield-lock-fill"
                  style={{
                    fontSize: "3.5rem",
                    color: "#D4AF37",
                  }}
                ></i>
              </div>

              <h3
                className="fw-bold mb-3"
                style={{ color: "#D4AF37", fontFamily: "'SUSE Mono', sans-serif" }}
              >
                Access Denied
              </h3>

              <p
                className="mb-4"
                style={{
                  color: "#333333",
                  fontSize: "0.95rem",
                  lineHeight: "1.6",
                }}
              >
                Sorry, you don’t have permission to access this page.
                <br />
                Please contact the administrator if you believe this is a mistake.
              </p>

              <Button
                onClick={() => navigate("/")}
                style={{
                  backgroundColor: "#D4AF37",
                  color: "#FFF5E1",
                  border: "none",
                  fontWeight: "600",
                  borderRadius: "8px",
                  padding: "10px 0",
                  width: "100%",
                  transition: "background 0.2s ease-in-out",
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = "#c39b2f")}
                onMouseOut={(e) => (e.target.style.backgroundColor = "#D4AF37")}
              >
                Go Back Home
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

import React, { useState, useEffect, useContext } from "react";
import { Card, Container, Row, Col, Spinner, Badge } from "react-bootstrap";
import axios from "axios";
import UserContext from "../context/UserContext"; // Assuming you store the JWT here

export default function Schedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useContext(UserContext); // Get JWT token from context

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/schedule/get-all-schedule`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Pass token to backend
            },
          }
        );
        setSchedules(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [token]);

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  if (error)
    return (
      <div className="text-center mt-5 text-danger">
        Error fetching schedules: {error}
      </div>
    );

  return (
    <Container className="mt-4">
      <Row xs={1} md={2} lg={3} className="g-4">
        {schedules.map((schedule) => {
          const firstItem = schedule.scheduleOrdered[0]; // Use first product for title
          return (
            <Col key={schedule._id}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>
                    {firstItem?.productId?.category || "Unknown Category"}
                  </Card.Title>

                  <p>
                    {" "}
                    {schedule.userId && typeof schedule.userId === "object"
                      ? schedule.userId.codename
                      : "Unknown User"}
                  </p>

                  {schedule.scheduleOrdered.map((item) => (
                    <div key={item._id} className="mb-3 p-2 border rounded">
                      <h6>Schedule: {item.productId.name}</h6>
                      <p>
                        Amount: ₱{item.productId.amount.toLocaleString()} |
                        Number: {item.productId.number}
                      </p>
                      <Badge
                        bg={item.status === "paid" ? "success" : "warning"}
                      >
                        {item.status.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </Card.Body>
                <Card.Footer>
                  <strong>
                    Total Amount: ₱{schedule.totalAmount.toLocaleString()}
                  </strong>
                  <br />
                  Status:{" "}
                  <Badge
                    bg={schedule.status === "settled" ? "success" : "secondary"}
                  >
                    {schedule.status.toUpperCase()}
                  </Badge>
                </Card.Footer>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
}

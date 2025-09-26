// Schedule.js
import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  Container,
  Row,
  Col,
  Spinner,
  Badge,
  Button,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import io from "socket.io-client";
import UserContext from "../context/UserContext";
import PickSchedule from "../components/PickSchedule";

export default function Schedule() {
  const { user, token } = useContext(UserContext);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [socket, setSocket] = useState(null);

  // Fetch schedules
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/schedule/get-all-schedule`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSchedules(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load schedules.");
    } finally {
      setLoading(false);
    }
  };

  // Mark as Paid
  const handleMarkAsPaid = async (scheduleId, productId, productName, amount) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/chat/create`,
        {
          scheduleId,
          productId,
          message: `User ${user.codename} marked ${productName} as PAID (₱${amount})`,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      window.location.href = "/chat";
    } catch (err) {
      console.error("Error marking as paid:", err);
    }
  };

  // WebSocket updates
  useEffect(() => {
    fetchSchedules();

    const newSocket = io(process.env.REACT_APP_API_BASE_URL, {
      query: { token },
    });
    setSocket(newSocket);

    newSocket.on("scheduleUpdated", () => {
      fetchSchedules();
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  if (loading) {
    return (
      <Container className="schedule-container text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="schedule-container mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="schedule-container mt-4">
      <h3 className="mb-4 text-center">Schedules</h3>
      <PickSchedule onScheduleAdded={fetchSchedules} />

      <Row xs={1} md={2} lg={3} className="g-4 mt-3">
        {schedules.map((schedule) => {
          const disabled = !schedule.isActive; // ✅ disable if inactive

          return (
            <Col key={schedule._id}>
              <Card className={`h-100 ${disabled ? "opacity-50" : ""}`}>
                <Card.Body>
                  <Card.Title>
                    {schedule.scheduleOrdered[0]?.productId?.category || "Unknown Category"}
                  </Card.Title>
                  <p>{schedule.userId?.codename || "Unknown User"}</p>

                  {schedule.scheduleOrdered.map((item) => {
                    const userPaid = item.payments?.some(
                      (p) => p.userId === user.id
                    );
                    const totalPaidCount = item.payments?.filter(
                      (p) => p.status === "paid"
                    ).length;

                    return (
                      <div key={item._id} className="mb-3 p-2 border rounded">
                        <h6>Schedule: {item.productId.name}</h6>
                        <p>
                          Amount: ₱{item.productId.amount.toLocaleString()} | Number:{" "}
                          {item.productId.number}
                        </p>

                        <Badge bg={totalPaidCount > 0 ? "success" : "warning"}>
                          {totalPaidCount > 0 ? "PAID" : "UNPAID"} (
                          {totalPaidCount} user{totalPaidCount !== 1 ? "s" : ""} paid)
                        </Badge>

                        {!userPaid && (
                          <div className="mt-2">
                            <Button
                              variant="success"
                              size="sm"
                              disabled={disabled} // ✅ only change
                              onClick={() =>
                                handleMarkAsPaid(
                                  schedule._id,
                                  item.productId._id,
                                  item.productId.name,
                                  item.productId.amount
                                )
                              }
                            >
                              Mark as Paid
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </Card.Body>
                <Card.Footer>
                  <strong>Total Amount: ₱{schedule.totalAmount.toLocaleString()}</strong>
                  <br />
                  Status:{" "}
                  <Badge bg={schedule.status === "settled" ? "success" : "secondary"}>
                    {schedule.status.toUpperCase()}
                  </Badge>
                  {!schedule.isActive && (
                    <div className="mt-2 text-danger fw-bold">Inactive</div>
                  )}
                </Card.Footer>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
}

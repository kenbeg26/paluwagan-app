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
import { useNavigate } from "react-router-dom";
import UserContext from "../context/UserContext";
import PickSchedule from "../components/PickSchedule";

export default function Schedule() {
  const { user, token: contextToken } = useContext(UserContext);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  const token = contextToken || localStorage.getItem("token");

  // Fetch schedules
  const fetchSchedules = async () => {
    if (!token) {
      setError("No authentication token found. Please log in again.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/schedule/get-all-schedule`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSchedules(res.data);
    } catch (err) {
      console.error("Fetch schedules error:", err);
      setError("Failed to load schedules.");
    } finally {
      setLoading(false);
    }
  };

  // Mark as Paid → Redirect to Chat
  const handleMarkAsPaid = async (scheduleId, productId) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/schedule/paid`,
        { scheduleId, productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchSchedules(); // Refresh schedules
      navigate("/chat"); // ✅ Redirect to Chat page
    } catch (err) {
      console.error("Error marking as paid:", err);
      if (err.response?.status === 401) {
        setError("Your session expired. Please log in again.");
      } else {
        setError("Failed to mark as paid. Please try again.");
      }
    }
  };

  // WebSocket updates
  useEffect(() => {
    if (!token) return;

    fetchSchedules();

    const newSocket = io(process.env.REACT_APP_API_BASE_URL, {
      auth: { token },
    });

    newSocket.on("connect", () =>
      console.log("✅ Connected to schedule socket")
    );
    newSocket.on("connect_error", (err) =>
      console.error("❌ Socket error:", err.message)
    );

    newSocket.on("scheduleUpdated", fetchSchedules);

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [token]);

  if (!user || loading) {
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
          const disabled = !schedule.isActive;

          return (
            <Col key={schedule._id}>
              <Card className={`h-100 ${disabled ? "opacity-50" : ""}`}>
                <Card.Body>
                  <Card.Title>
                    {schedule.scheduleOrdered[0]?.productId?.category ||
                      "Unknown Category"}
                  </Card.Title>
                  <p>{schedule.userId?.codename || "Unknown User"}</p>

                  {schedule.scheduleOrdered.map((item) => {
                    const userIdStr = user?._id || user?.id;
                    const userPaid = item.payments?.some(
                      (p) =>
                        String(p.userId) === String(userIdStr) &&
                        p.status === "paid"
                    );

                    const totalPaidCount = item.payments?.filter(
                      (p) => p.status === "paid"
                    ).length;

                    return (
                      <div key={item._id} className="mb-3 p-2 border rounded">
                        <h6>Schedule: {item.productId.name}</h6>
                        <p>
                          Amount: ₱{item.productId.amount.toLocaleString()} |
                          Number: {item.productId.number}
                        </p>

                        <Badge bg={totalPaidCount > 0 ? "success" : "warning"}>
                          {totalPaidCount > 0 ? "PAID" : "UNPAID"} (
                          {totalPaidCount} user
                          {totalPaidCount !== 1 ? "s" : ""} paid)
                        </Badge>

                        <div className="mt-2">
                          <Button
                            variant={userPaid ? "secondary" : "success"}
                            size="sm"
                            disabled={disabled || userPaid}
                            onClick={() =>
                              handleMarkAsPaid(schedule._id, item.productId._id)
                            }
                          >
                            {userPaid ? "Already Paid" : "Mark as Paid"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </Card.Body>
                <Card.Footer>
                  <strong>
                    Total Amount: ₱{schedule.totalAmount.toLocaleString()}
                  </strong>
                  <br />
                  Status:{" "}
                  <Badge
                    bg={
                      schedule.status === "settled" ? "success" : "secondary"
                    }
                  >
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

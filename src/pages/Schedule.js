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
  Modal,
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
  const [showModal, setShowModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
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

      // Sort schedules by lowest product number in each schedule
      const sortedSchedules = res.data.slice().sort((a, b) => {
        const aMin = Math.min(...a.scheduleOrdered.map(item => item.productId.number));
        const bMin = Math.min(...b.scheduleOrdered.map(item => item.productId.number));
        return aMin - bMin;
      });

      setSchedules(sortedSchedules);
    } catch (err) {
      console.error("Fetch schedules error:", err);
      setError("Failed to load schedules.");
    } finally {
      setLoading(false);
    }
  };

  // Mark as Paid → Redirect to Chat
  const handleMarkAsPaid = async () => {
    if (!selectedSchedule || !selectedProduct) return;

    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/schedule/paid`,
        { scheduleId: selectedSchedule, productId: selectedProduct },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchSchedules(); // Refresh schedules
      setShowModal(false); // Close modal
      navigate("/chat"); // Redirect to Chat page
    } catch (err) {
      console.error("Error marking as paid:", err);
      if (err.response?.status === 401) {
        setError("Your session expired. Please log in again.");
      } else {
        setError("Failed to mark as paid. Please try again.");
      }
    }
  };

  // Show modal on button click
  const confirmMarkAsPaid = (scheduleId, productId) => {
    setSelectedSchedule(scheduleId);
    setSelectedProduct(productId);
    setShowModal(true);
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
                    {schedule.userId?.codename || "Unknown User"}
                  </Card.Title>

                  {schedule.scheduleOrdered[0]?.productId?.category ||
                    "Unknown Category"}

                  {schedule.scheduleOrdered
                    .slice()
                    .sort((a, b) => a.productId.number - b.productId.number)
                    .map((item) => {
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
                            Amount: ₱
                            {item.productId.amount.toLocaleString()} | Number:{" "}
                            {item.productId.number}
                          </p>

                          <Badge
                            bg={totalPaidCount > 0 ? "success" : "warning"}
                          >
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
                                confirmMarkAsPaid(
                                  schedule._id,
                                  item.productId._id
                                )
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
                    bg={schedule.status === "settled" ? "success" : "secondary"}
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

      {/* Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to mark this schedule as paid?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleMarkAsPaid}>
            Yes, Mark as Paid
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

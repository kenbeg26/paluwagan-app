import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  Container,
  Row,
  Col,
  Spinner,
  Badge,
  Button,
} from "react-bootstrap";
import axios from "axios";
import io from "socket.io-client";
import UserContext from "../context/UserContext";

export default function Schedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, user } = useContext(UserContext);
  const [socket, setSocket] = useState(null);

  // 🔹 Fetch schedules
  const fetchSchedules = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/schedule/get-all-schedule`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSchedules(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;

    fetchSchedules();

    // 🔹 Initialize Socket.IO connection
    const newSocket = io("http://localhost:4000", { auth: { token } });

    newSocket.on("connect", () => console.log("✅ Connected to server"));
    newSocket.on("connect_error", (err) =>
      console.error("❌ Socket error:", err)
    );

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [token]);

  // 🔹 Mark as Paid Handler
  const handleMarkAsPaid = async (scheduleId, productId, productName, amount) => {
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/schedule/paid`,
        { scheduleId, productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { paidCount } = response.data;

      // Update frontend state for current user's payment
      setSchedules((prevSchedules) =>
        prevSchedules.map((schedule) => {
          if (schedule._id === scheduleId) {
            return {
              ...schedule,
              scheduleOrdered: schedule.scheduleOrdered.map((item) => {
                if (item.productId._id === productId) {
                  const payments = [
                    ...(item.payments?.filter((p) => p.userId !== user.id) || []),
                    { userId: user.id, status: "paid", paidAt: new Date() },
                  ];
                  return { ...item, payments };
                }
                return item;
              }),
            };
          }
          return schedule;
        })
      );

      // 🔹 Send group chat notification
      if (socket) {
        const formattedAmount = Number(amount).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        const message = `${user.codename} paid ₱${formattedAmount} for the month of ${productName}`;
        socket.emit("sendMessage", { message });
      }
    } catch (err) {
      console.error("Error updating payment:", err);
      alert("❌ Failed to update payment.");
    }
  };

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
        {schedules.map((schedule) => (
          <Col key={schedule._id}>
            <Card className="h-100">
              <Card.Body>
                <Card.Title>
                  {schedule.scheduleOrdered[0]?.productId?.category || "Unknown Category"}
                </Card.Title>
                <p>{schedule.userId?.codename || "Unknown User"}</p>

                {schedule.scheduleOrdered.map((item) => {
                  const userPaid = item.payments?.some((p) => p.userId === user.id);
                  const totalPaidCount = item.payments?.filter(
                    (p) => p.status === "paid"
                  ).length;

                  return (
                    <div key={item._id} className="mb-3 p-2 border rounded">
                      <h6>Schedule: {item.productId.name}</h6>
                      <p>
                        Amount: ₱{item.productId.amount.toLocaleString()} | Number: {item.productId.number}
                      </p>

                      <Badge bg={totalPaidCount > 0 ? "success" : "warning"}>
                        {totalPaidCount > 0 ? "PAID" : "UNPAID"} ({totalPaidCount} user
                        {totalPaidCount !== 1 ? "s" : ""} paid)
                      </Badge>

                      {!userPaid && (
                        <div className="mt-2">
                          <Button
                            variant="success"
                            size="sm"
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
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

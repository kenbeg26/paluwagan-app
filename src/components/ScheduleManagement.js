// ScheduleManagement.js
import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Badge,
  Spinner,
  Form,
  Modal,
} from "react-bootstrap";

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    userId: "",
    status: "pending",
    isActive: false,
    paymentStatus: "unpaid",
  });
  const [saving, setSaving] = useState(false);

  // Fetch schedules
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/schedule/get-all-schedule`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch schedules");
      const data = await res.json();
      setSchedules(data);
    } catch (err) {
      console.error("Error fetching schedules:", err);
    } finally {
      setLoading(false);
    }
  };

  // Open modal for editing
  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      userId: schedule.userId?._id || "",
      status: schedule.status,
      isActive: schedule.isActive,
      // Just get first product's first payment for simplicity
      paymentStatus:
        schedule.scheduleOrdered?.[0]?.payments?.[0]?.status || "unpaid",
    });
  };

  // Update schedule
  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/schedule/${editingSchedule._id}/update`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            userId: formData.userId,
            status: formData.status,
            isActive: formData.isActive,
            // Example: update payment status for first payment in first product
            scheduleOrdered: [
              {
                ...editingSchedule.scheduleOrdered[0],
                payments: [
                  {
                    ...editingSchedule.scheduleOrdered[0]?.payments?.[0],
                    status: formData.paymentStatus,
                  },
                ],
              },
            ],
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to update schedule");
      await res.json();
      fetchSchedules();
      setEditingSchedule(null);
    } catch (err) {
      console.error("Error updating schedule:", err);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
    <div className="mt-5">
      <h3 className="mb-3 text-center">Schedule Management</h3>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>User ID</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Active</th>
              <th>Payment</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {schedules.length > 0 ? (
              schedules.map((schedule, index) => (
                <tr key={schedule._id}>
                  <td>{index + 1}</td>
                  <td>{schedule.userId?._id || "N/A"}</td>
                  <td>₱{schedule.totalAmount}</td>
                  <td>
                    <Badge
                      bg={
                        schedule.status === "pending" ? "warning" : "success"
                      }
                    >
                      {schedule.status}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={schedule.isActive ? "success" : "secondary"}>
                      {schedule.isActive ? "Yes" : "No"}
                    </Badge>
                  </td>
                  <td>
                    <Badge
                      bg={
                        schedule.scheduleOrdered?.[0]?.payments?.[0]?.status ===
                          "paid"
                          ? "success"
                          : "danger"
                      }
                    >
                      {schedule.scheduleOrdered?.[0]?.payments?.[0]?.status ||
                        "unpaid"}
                    </Badge>
                  </td>
                  <td className="text-center">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleEdit(schedule)}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No schedules found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {/* --- Edit Modal --- */}
      <Modal
        show={!!editingSchedule}
        onHide={() => setEditingSchedule(null)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Schedule</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>User ID</Form.Label>
              <Form.Control
                type="text"
                value={formData.userId}
                onChange={(e) =>
                  setFormData({ ...formData, userId: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="pending">Pending</option>
                <option value="settled">Settled</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Is Active"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Payment Status</Form.Label>
              <Form.Select
                value={formData.paymentStatus}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentStatus: e.target.value,
                  })
                }
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setEditingSchedule(null)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button variant="success" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner animation="border" size="sm" /> : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ScheduleManagement;

// UserManagement.js
import React, { useEffect, useState } from "react";
import { Table, Button, Spinner, Container, Card, Badge } from "react-bootstrap";

const API_URL = process.env.REACT_APP_API_URL;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(null);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/users/all-users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle user active status
  const handleToggleActive = async (userId) => {
    try {
      setUpdating(userId);
      const res = await fetch(`${API_URL}/users/${userId}/set-user-active`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        fetchUsers(); // Refresh list
      } else {
        console.error("Failed to toggle user status");
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Container className="mt-3">
      <Card>
        <Card.Header>
          <h4>User Management</h4>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" />
            </div>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Codename</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user, index) => (
                    <tr key={user._id}>
                      <td>{index + 1}</td>
                      <td>{user.name}</td>
                      <td>{user.codename}</td>
                      <td>
                        {user.isAdmin ? (
                          <Badge bg="primary">Admin</Badge>
                        ) : (
                          <Badge bg="secondary">User</Badge>
                        )}
                      </td>
                      <td>
                        {user.isActive ? (
                          <Badge bg="success">Active</Badge>
                        ) : (
                          <Badge bg="danger">Inactive</Badge>
                        )}
                      </td>
                      <td>
                        <Button
                          variant={user.isActive ? "danger" : "success"}
                          size="sm"
                          onClick={() => handleToggleActive(user._id)}
                          disabled={updating === user._id}
                        >
                          {updating === user._id ? (
                            <Spinner animation="border" size="sm" />
                          ) : user.isActive ? (
                            "Deactivate"
                          ) : (
                            "Activate"
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserManagement;

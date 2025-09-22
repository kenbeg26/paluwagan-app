import React, { useEffect, useState } from "react";
import {
  Container,
  Table,
  Button,
  Badge,
  Card,
  Stack,
  Spinner,
} from "react-bootstrap";
import EditProduct from "./EditProduct";
import ArchiveProduct from "./ArchiveProduct";
import AddProduct from "./AddProduct";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";

const AdminDashboard = () => {
  // --- Products ---
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // --- Users ---
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updatingUser, setUpdatingUser] = useState(null);

  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const navigate = useNavigate();

  // Fetch products
  const fetchProducts = () => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/product/all`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => setProducts(data))
      .catch((err) => console.error("Fetch error:", err));
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/users/all-users`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Toggle user active status
  const handleToggleUserActive = async (userId) => {
    try {
      setUpdatingUser(userId);
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/users/${userId}/set-user-active`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.ok) fetchUsers();
      else console.error("Failed to toggle user status");
    } catch (err) {
      console.error("Error toggling user status:", err);
    } finally {
      setUpdatingUser(null);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchUsers();
  }, []);

  const handleDisable = (product) => {
    setSelectedProduct(product);
    setShowDisableModal(true);
  };

  const handleActivate = (product) => {
    setSelectedProduct(product);
    setShowDisableModal(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  return (
    <Container className="py-4" fluid="md">
      <h2 className="text-center mb-4">Admin Dashboard</h2>

      {/* --- Product Management --- */}
      <Stack
        direction="horizontal"
        gap={3}
        className="justify-content-center mb-4 flex-wrap"
      >
        <Button
          variant="secondary"
          className="btn-hover-effect"
          onClick={() => setShowAddModal(true)}
        >
          Add New Product
        </Button>
      </Stack>

      {/* Products table/cards */}
      {isMobile ? (
        <div className="product-cards">
          {products.map((product) => (
            <Card key={product._id} className="mb-3">
              <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Text>
                  <small className="text-muted">
                    ID: {product._id.substring(0, 8)}...
                  </small>
                </Card.Text>
                <Card.Text className="text-truncate">{product.category}</Card.Text>
                <Card.Text>Amount: ₱{product.amount.toFixed(2)}</Card.Text>
                <Card.Text>Number: {Math.round(product.number)}</Card.Text>

                <Card.Text>
                  Active:{" "}
                  <Badge bg={product.isActive ? "success" : "secondary"}>
                    {product.isActive ? "Yes" : "No"}
                  </Badge>
                </Card.Text>
                <Card.Text>
                  Occupied:{" "}
                  <Badge bg={product.isOccupied ? "danger" : "secondary"}>
                    {product.isOccupied ? "Yes" : "No"}
                  </Badge>
                </Card.Text>

                <Stack direction="horizontal" gap={2} className="justify-content-center">
                  <Button variant="warning" size="sm" onClick={() => handleEdit(product)}>
                    Edit
                  </Button>
                  {product.isActive ? (
                    <Button variant="danger" size="sm" onClick={() => handleDisable(product)}>
                      Disable
                    </Button>
                  ) : (
                    <Button variant="success" size="sm" onClick={() => handleActivate(product)}>
                      Activate
                    </Button>
                  )}
                </Stack>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <Table striped bordered hover responsive className="mb-5">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Amount (₱)</th>
              <th>Number</th>
              <th>Active</th>
              <th>Occupied</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td style={{ maxWidth: "150px", wordWrap: "break-word" }}>{product._id}</td>
                <td>{product.name}</td>
                <td style={{ maxWidth: "300px", wordWrap: "break-word" }}>{product.category}</td>
                <td>{product.amount.toFixed(2)}</td>
                <td>{Math.round(product.number)}</td>
                <td>
                  <Badge bg={product.isActive ? "success" : "secondary"}>
                    {product.isActive ? "Yes" : "No"}
                  </Badge>
                </td>
                <td>
                  <Badge bg={product.isOccupied ? "danger" : "secondary"}>
                    {product.isOccupied ? "Yes" : "No"}
                  </Badge>
                </td>
                <td className="text-center">
                  <div className="d-flex justify-content-center flex-wrap gap-2">
                    <Button variant="warning" size="sm" onClick={() => handleEdit(product)}>
                      Edit
                    </Button>
                    {product.isActive ? (
                      <Button variant="danger" size="sm" onClick={() => handleDisable(product)}>
                        Disable
                      </Button>
                    ) : (
                      <Button variant="success" size="sm" onClick={() => handleActivate(product)}>
                        Activate
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* --- User Management --- */}
      <h3 className="mt-5 mb-3 text-center">User Management</h3>
      {loadingUsers ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Codename</th>
              <th>Role</th>
              <th>Status</th>
              <th className="text-center">Action</th>
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
                    {user.isAdmin ? <Badge bg="primary">Admin</Badge> : <Badge bg="secondary">User</Badge>}
                  </td>
                  <td>
                    {user.isActive ? <Badge bg="success">Active</Badge> : <Badge bg="danger">Inactive</Badge>}
                  </td>
                  <td className="text-center">
                    <Button
                      variant={user.isActive ? "danger" : "success"}
                      size="sm"
                      onClick={() => handleToggleUserActive(user._id)}
                      disabled={updatingUser === user._id}
                    >
                      {updatingUser === user._id ? (
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

      {/* --- Modals --- */}
      <EditProduct
        product={selectedProduct}
        fetchData={fetchProducts}
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
      />
      <ArchiveProduct
        product={selectedProduct}
        isActive={selectedProduct?.isActive}
        fetchData={fetchProducts}
        show={showDisableModal}
        onHide={() => setShowDisableModal(false)}
      />
      <AddProduct
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        fetchData={fetchProducts}
      />
    </Container>
  );
};

export default AdminDashboard;

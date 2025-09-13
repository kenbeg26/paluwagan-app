import React, { useEffect, useState } from "react";
import { Container, Table, Button, Badge, Card, Stack } from "react-bootstrap";
import EditProduct from './EditProduct';
import ArchiveProduct from './ArchiveProduct';
import AddProduct from './AddProduct';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const navigate = useNavigate();

  const fetchData = () => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/product/all`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }
        return res.json();
      })
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
      });
  };

  useEffect(() => {
    fetchData();
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
                <Card.Text>Number: {product.number.toFixed(2)}</Card.Text>

                {/* Status Badges */}
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

                <Stack
                  direction="horizontal"
                  gap={2}
                  className="justify-content-center"
                >
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleEdit(product)}
                  >
                    Edit
                  </Button>
                  {product.isActive ? (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDisable(product)}
                    >
                      Disable
                    </Button>
                  ) : (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleActivate(product)}
                    >
                      Activate
                    </Button>
                  )}
                </Stack>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <Table striped bordered hover responsive>
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
                <td style={{ maxWidth: "150px", wordWrap: "break-word" }}>
                  {product._id}
                </td>
                <td>{product.name}</td>
                <td style={{ maxWidth: "300px", wordWrap: "break-word" }}>
                  {product.category}
                </td>
                <td>{product.amount.toFixed(2)}</td>
                <td>{product.number.toFixed(2)}</td>

                {/* Active Badge */}
                <td>
                  <Badge bg={product.isActive ? "success" : "secondary"}>
                    {product.isActive ? "Yes" : "No"}
                  </Badge>
                </td>

                {/* Occupied Badge */}
                <td>
                  <Badge bg={product.isOccupied ? "danger" : "secondary"}>
                    {product.isOccupied ? "Yes" : "No"}
                  </Badge>
                </td>

                <td className="text-center">
                  <div className="d-flex justify-content-center flex-wrap gap-2">
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </Button>
                    {product.isActive ? (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDisable(product)}
                      >
                        Disable
                      </Button>
                    ) : (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleActivate(product)}
                      >
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

      {/* Modals */}
      <EditProduct
        product={selectedProduct}
        fetchData={fetchData}
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
      />
      <ArchiveProduct
        product={selectedProduct}
        isActive={selectedProduct?.isActive}
        fetchData={fetchData}
        show={showDisableModal}
        onHide={() => setShowDisableModal(false)}
      />
      <AddProduct
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        fetchData={fetchData}
      />
    </Container>
  );
};

export default AdminDashboard;

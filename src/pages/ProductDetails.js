import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Spinner, Alert, Row, Col, Form, Badge } from 'react-bootstrap';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

const notyf = new Notyf();

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isLoggedIn = Boolean(localStorage.getItem('token'));

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/product/${id}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const productData = data.data || data;

        if (!productData.amount) productData.amount = 0;
        setProduct(productData);
      } catch (err) {
        setError(err.message);
        notyf.dismissAll();
        notyf.error(`Failed to load product: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);


  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(price);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading product details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error loading product</Alert.Heading>
          <p>{error}</p>
          <Link to="/products" className="btn btn-primary">Back to Products</Link>
        </Alert>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <Alert.Heading>Product not found</Alert.Heading>
          <p>The requested product could not be found.</p>
          <Link to="/products" className="btn btn-primary">Back to Products</Link>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow-sm border-0 overflow-hidden">
            <Row className="g-0">
              <Col md={6} className="p-3 bg-light">
                <div className="position-relative" style={{ height: '400px', overflow: 'hidden' }}>
                  {product.isActive === false && (
                    <Badge pill bg="danger" className="position-absolute top-0 start-0 m-2">
                      Out of Stock
                    </Badge>
                  )}
                </div>
              </Col>

              <Col md={6} className="p-4">
                <Card.Body className="h-100 d-flex flex-column p-0">
                  <Card.Title as="h2" className="mb-3 fw-bold">
                    {product.name || 'No product name available'}
                  </Card.Title>

                  <Card.Text className="mb-4 fs-5 text-muted">
                    {product.category || 'No category available'}
                  </Card.Text>

                  <Card.Text className="mb-4 fs-5 text-muted">
                    {product.amount || 'No description available'}
                  </Card.Text>

                  <Card.Text className="mb-4 fs-5 text-muted">
                    {product.number || 'No description available'}
                  </Card.Text>

                  <div className="mb-4">
                    <h3 className="text-primary fw-bold">{formatPrice(product.price)}</h3>
                    <small className="text-muted">Inclusive of VAT</small>
                  </div>

                </Card.Body>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

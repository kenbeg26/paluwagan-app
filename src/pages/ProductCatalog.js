import { useState, useEffect } from 'react';
import { Container, Spinner, Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

const notyf = new Notyf();

export default function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/product/active`);

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        setProducts(data);
      } catch (err) {
        notyf.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Format price as Philippine Peso
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
        <p>Loading products...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h1 className="mb-4 text-center">Paluwagan</h1>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Category</th>
            <th>Product Name</th>
            <th>Amount</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>{product.category}</td>
              <td>{product.name}</td>
              <td>{formatPrice(product.amount)}</td>
              <td>{formatPrice(100000)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

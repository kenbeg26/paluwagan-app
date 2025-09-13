import { useState, useEffect } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { Notyf } from 'notyf';

const notyf = new Notyf(); // moved outside so it's not recreated every render

export default function EditProduct({ product, fetchData, show, onHide }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [number, setNumber] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isOccupied, setIsOccupied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setCategory(product.category || '');
      setAmount(product.amount || 0);
      setNumber(product.number || 0);
      setIsActive(product.isActive ?? false);
      setIsOccupied(product.isOccupied ?? false);
    }
  }, [product]);

  const editProduct = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/product/${product._id}/update`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            name,
            category,
            amount: Number(amount),
            number: Number(number),
            isActive,
            isOccupied,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        notyf.success('Successfully Updated');
        fetchData();
        onHide();
      } else {
        notyf.error(data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Edit error:', error);
      notyf.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Form onSubmit={editProduct}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="productName" className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="productCategory" className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Control
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="productAmount" className="mb-3">
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="productNumber" className="mb-3">
            <Form.Label>Number</Form.Label>
            <Form.Control
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              required
            />
          </Form.Group>

          {/* New fields */}
          <Form.Group controlId="productIsActive" className="mb-3">
            <Form.Check
              type="checkbox"
              label="Active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
          </Form.Group>

          <Form.Group controlId="productIsOccupied" className="mb-3">
            <Form.Check
              type="checkbox"
              label="Occupied"
              checked={isOccupied}
              onChange={(e) => setIsOccupied(e.target.checked)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

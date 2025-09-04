import { useState, useEffect } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { Notyf } from 'notyf';

export default function EditProduct({ product, fetchData, show, onHide }) {
  const notyf = new Notyf();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [number, setNumber] = useState('');
  const [isLoading, setIsLoading] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setCategory(product.category || '');
      setAmount(product.amount || 0);
      setNumber(product.number || 0);
    }
  }, [product]);

  const editProduct = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/product/${product._id}/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name,
          category,
          amount: Number(amount),
          number: Number(number)
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        notyf.success("Successfully Updated");
        fetchData();
        onHide();
      } else {
        notyf.error(data.message || "Update failed");
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
          </Form.Group>
        </Modal.Body>
      </Form>
    </Modal>
  )

}
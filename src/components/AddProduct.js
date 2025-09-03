import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { Notyf } from "notyf";

const AddProductModal = ({ show, onHide, fetchData }) => {
  const notyf = new Notyf();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [number, setNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const token = localStorage.getItem("token");

    fetch(`${process.env.REACT_APP_API_BASE_URL}/product/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        category,
        amount: Number(amount),
        number
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          notyf.success("Product Added Successfully");
          setName("");
          setCategory("");
          setAmount("");
          setNumber("");
          fetchData();
          onHide();
        } else {
          notyf.error("Failed to add product");
        }
      })
      .catch((err) => {
        console.error("Error", err);
        notyf.error("Something went wrong");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New Product</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>

          <Form.Group className="mb-3">
            <Form.Label>Name:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter product name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Category:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter category name"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Amount:</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter amount"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Number:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter number"
              required
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button
              variant="primary"
              type="submit"
              disabled={isLoading}
              className="mt-3"
            >
              {isLoading ? "Adding..." : "Add Product"}

            </Button>
          </div>

        </Form>
      </Modal.Body>

    </Modal>
  );
};

export default AddProductModal;
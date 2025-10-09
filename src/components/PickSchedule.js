import React, { useState, useEffect, useContext } from "react";
import { Button, Container, Spinner, Modal } from "react-bootstrap";
import { Wheel } from "react-custom-roulette";
import UserContext from "../context/UserContext";

export default function PickSchedule({ onScheduleAdded }) {
  const { user } = useContext(UserContext);
  const [products, setProducts] = useState([]);
  const [chosenProduct, setChosenProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [hasSchedule, setHasSchedule] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/product/active`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch products");

        const available = Array.isArray(data)
          ? data.filter((p) => p.isActive && !p.isOccupied)
          : [];
        setProducts(available);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const checkSchedule = async () => {
      if (!user) return;
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/schedule/get-schedule`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data) && data.length > 0) setHasSchedule(true);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProducts();
    checkSchedule();
  }, [user]);

  const handlePick = () => {
    if (hasSchedule) {
      setError("📅 You already picked a schedule");
      return;
    }
    if (products.length === 0) {
      setError("No products available to pick");
      return;
    }

    setError("");
    const idx = Math.floor(Math.random() * products.length);
    setPrizeNumber(idx);
    setMustSpin(true);
    setChosenProduct(null);
  };

  const onStopSpinning = async () => {
    setMustSpin(false);
    const product = products[prizeNumber];
    if (!product) {
      setError("Something went wrong in picking product");
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/schedule/pick-schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ productId: product._id }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to pick schedule");
        return;
      }

      // Show modal first, refresh after user closes
      setChosenProduct(product);
      setShowModal(true);
      setHasSchedule(true);
    } catch (err) {
      setError(err.message || "Error picking schedule");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (onScheduleAdded) onScheduleAdded();
  };

  const sliceColors = [
    "#d92b2bff", "#693706ff", "#a4a403ff", "#04b404ff", "#03038dff",
    "#7905ccff", "#3d016eff", "#be0166ff", "#04a7a9ff", "#e9c706ff"
  ];

  const wheelData = products.map((p, i) => ({
    option: p.name || "Unnamed",
    style: { backgroundColor: sliceColors[i % sliceColors.length], textColor: "#FFF5E1" },
  }));

  return (
    <Container className="my-4 text-center">
      {loading && <Spinner animation="border" />}
      {error && <div className="text-danger mb-2">{error}</div>}

      {wheelData.length > 0 && (
        <div style={{ width: "320px", margin: "0 auto" }}>
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={wheelData}
            onStopSpinning={onStopSpinning}
            spinDuration={4}
            outerBorderColor="#c39b2f"
            outerBorderWidth={5}
            innerBorderColor="#c39b2f"
            innerBorderWidth={5}
            radiusLineColor="#c39b2f"
            radiusLineWidth={2}
          />
        </div>
      )}

      {!chosenProduct && !hasSchedule && user?.isActive && (
        <Button
          className="mt-3 spin-wheel-btn"
          onClick={handlePick}
          disabled={mustSpin || wheelData.length === 0}
        >
          {mustSpin ? "Spinning..." : "Spin the Wheel"}
        </Button>
      )}

      {/* Prize Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>🎉 Congratulations!</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          You got: <strong>{chosenProduct?.name}</strong> <br />
          Amount: ₱{chosenProduct?.amount.toLocaleString()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

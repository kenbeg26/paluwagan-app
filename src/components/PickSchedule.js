// PickSchedule.js
import React, { useState, useEffect, useContext } from "react";
import { Button, Container, Spinner, Alert } from "react-bootstrap";
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
  const [spinAngle, setSpinAngle] = useState(0);

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
        if (res.ok && Array.isArray(data) && data.length > 0) {
          setHasSchedule(true);
        }
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

    // Faster spin with 10-12 full rotations
    const sliceAngle = 360 / products.length;
    const randomFullSpins = 10 + Math.random() * 2; // more rotations
    const targetAngle = 360 * randomFullSpins + idx * sliceAngle + sliceAngle / 2;
    setSpinAngle(targetAngle);

    setMustSpin(true);
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
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to pick schedule");
        return;
      }

      const picked = data.schedule?.scheduleOrdered?.[0]?.product;
      setChosenProduct(picked || product);
      setHasSchedule(true);

      if (onScheduleAdded) onScheduleAdded();
    } catch (err) {
      setError(err.message || "Error picking schedule");
    }
  };

  // Different colors for each slice (cycling your gold-tan theme)
  const sliceColors = ["#D4AF37", "#D2B48C", "#F0C987", "#FFD700", "#E6C07B", "#D4AF37"];
  const wheelData = Array.isArray(products)
    ? products.map((p, i) => ({
      option: p.name || "Unnamed",
      style: {
        backgroundColor: sliceColors[i % sliceColors.length],
        textColor: "#FFF5E1",
      },
    }))
    : [];

  return (
    <Container className="my-4 text-center">
      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {wheelData.length > 0 ? (
        <div style={{ width: "320px", margin: "0 auto" }}>
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={wheelData}
            onStopSpinning={onStopSpinning}
            spinDuration={4} // faster spin
            startAngle={-90}
            rotationAngle={spinAngle}
            outerBorderColor="#333"
            outerBorderWidth={5}
            innerBorderColor="#fff"
            innerBorderWidth={5}
            radiusLineColor="#fff"
            radiusLineWidth={2}
          />
        </div>
      ) : (
        <p className="text-muted mt-3">No active bundles to spin.</p>
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

      {chosenProduct && (
        <Alert variant="success" className="mt-3 p-3">
          🎉 You got: <strong>{chosenProduct.name}</strong> (
          ₱{chosenProduct.amount.toLocaleString()})
        </Alert>
      )}

      {hasSchedule && !chosenProduct && (
        <Alert variant="info" className="mt-3">
          📅 You already picked a schedule
        </Alert>
      )}
    </Container>
  );
}

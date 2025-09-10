// PickSchedule.js
import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { Button, Container, Spinner, Alert } from "react-bootstrap";
import UserContext from "../context/UserContext";

export default function PickSchedule() {
  const { user } = useContext(UserContext);
  const [products, setProducts] = useState([]);
  const [chosenProduct, setChosenProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const colors = ["#f87171", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa", "#f472b6"]; // alternating slice colors

  // Fetch available products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/product/active`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch products");
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handlePickSchedule = async () => {
    try {
      setError("");
      setSpinning(true);

      const randomSpins = Math.floor(Math.random() * 5) + 5; // 5–10 full spins
      const randomIndex = Math.floor(Math.random() * products.length);
      const anglePerSlice = 360 / products.length;
      const finalAngle = 360 - randomIndex * anglePerSlice - anglePerSlice / 2;

      const newRotation = rotation + randomSpins * 360 + finalAngle;
      setRotation(newRotation);

      setTimeout(async () => {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/schedule/pick-schedule`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to pick schedule");

        setChosenProduct(data.schedule.scheduleOrdered[0].product);
        setSpinning(false);
      }, 4000);
    } catch (err) {
      setError(err.message);
      setSpinning(false);
    }
  };

  return (
    <Container className="my-4 text-center">
      <h2 className="mb-4">Pick Your Schedule</h2>

      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Wheel container */}
      <div className="relative mx-auto my-4" style={{ width: 300, height: 300 }}>
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: 3.5, ease: "easeOut" }}
          className="absolute rounded-full border-4 border-dark"
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {products.map((p, i) => {
            const angle = (360 / products.length) * i;
            const bgColor = colors[i % colors.length];

            // Calculate the angle for the text to make it vertical and readable
            // This rotates the text to a standard vertical position, regardless of the slice's rotation.
            const textRotation = 90 + angle;

            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  clipPath: "polygon(50% 50%, 100% 0, 100% 100%)",
                  background: bgColor,
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: "50% 50%",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "75%",
                    transform: `rotate(${textRotation}deg)`, // Use the new calculated rotation
                    transformOrigin: "left center",
                    fontSize: 12, // You may need to adjust this based on the number of products
                    fontWeight: "bold",
                    color: "white",
                    whiteSpace: "nowrap", // Prevents the text from wrapping
                    textOverflow: "ellipsis", // Adds an ellipsis if the text is too long
                    overflow: "hidden", // Hides overflowing text
                  }}
                >
                  {p.name}
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Pointer */}
        <div
          style={{
            position: "absolute",
            top: "-20px",
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "15px solid transparent",
            borderRight: "15px solid transparent",
            borderBottom: "30px solid red",
          }}
        />
      </div>

      {!chosenProduct ? (
        <Button onClick={handlePickSchedule} disabled={spinning || products.length === 0}>
          {spinning ? "Spinning..." : "Spin the Wheel"}
        </Button>
      ) : (
        <Alert variant="success" className="mt-3">
          🎉 You got <strong>{chosenProduct.name}</strong> (₱{chosenProduct.amount})
        </Alert>
      )}
    </Container>
  );
}

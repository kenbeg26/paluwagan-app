// PickSchedule.js
import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { Button, Container, Spinner, Alert } from "react-bootstrap";
import UserContext from "../context/UserContext";

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

export default function PickSchedule() {
  const { user } = useContext(UserContext);
  const [products, setProducts] = useState([]);
  const [chosenProduct, setChosenProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [hasSchedule, setHasSchedule] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const colors = ["#f87171", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa", "#f472b6"];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/product/active`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch products");
        const availableProducts = data.filter((p) => p.isActive && !p.isOccupied);
        setProducts(availableProducts);
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
        if (res.ok && data && data.length > 0) {
          setHasSchedule(true);
        }
      } catch (err) {
        console.error("Error checking schedule:", err);
      }
    };

    fetchProducts();
    checkSchedule();
  }, [user]);

  const handlePickSchedule = async () => {
    if (hasSchedule) {
      setError("📅 You already picked a schedule");
      return;
    }

    try {
      setError("");
      setSpinning(true);

      const randomSpins = Math.floor(Math.random() * 5) + 5;
      const randomIndex = Math.floor(Math.random() * products.length);
      setSelectedIndex(randomIndex);

      const anglePerSlice = 360 / products.length;
      const sliceCenterAngle = randomIndex * anglePerSlice + anglePerSlice / 2;

      // ✅ FIXED: Align selected slice with BOTTOM pointer (180° position)
      // The bottom is at 180°, so we need to rotate the slice center to this position
      const finalAngle = 180 - sliceCenterAngle;

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
        if (!res.ok) {
          if (data.message === "You already picked a product.") {
            setError("📅 You already picked a schedule");
            setHasSchedule(true);
          } else {
            setError(data.message || "Failed to pick schedule");
          }
          setSpinning(false);
          return;
        }

        setChosenProduct(data.schedule.scheduleOrdered[0].product);
        setSpinning(false);
        setHasSchedule(true);
      }, 4000);
    } catch (err) {
      setError(err.message);
      setSpinning(false);
    }
  };

  const splitTextIntoTwoLines = (text, maxLength = 15) => {
    if (text.length <= maxLength) return text;
    const words = text.split(" ");
    let line1 = "";
    let line2 = "";
    for (const word of words) {
      if ((line1 + word).length <= maxLength) {
        line1 += (line1 ? " " : "") + word;
      } else {
        line2 += (line2 ? " " : "") + word;
      }
    }
    return line2 ? `${line1}\n${line2}` : text;
  };

  return (
    <Container className="my-4 text-center">
      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Wheel container */}
      <div className="relative mx-auto my-4" style={{ width: 320, height: 320 }}>
        <div style={{ position: "relative", width: "300px", height: "300px", margin: "0 auto" }}>

          {/* Pointer at BOTTOM center, pointing upward */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "15px solid transparent",
              borderRight: "15px solid transparent",
              borderBottom: "25px solid red",
              zIndex: 20,
            }}
          />

          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 3.5, ease: "easeOut" }}
            style={{ width: "300px", height: "300px", position: "relative" }}
          >
            <svg width="300" height="300" viewBox="0 0 300 300">
              {products.map((p, i) => {
                const angle = 360 / products.length;
                const startAngle = angle * i;
                const endAngle = startAngle + angle;
                const largeArcFlag = angle > 180 ? 1 : 0;

                const start = polarToCartesian(150, 150, 150, startAngle);
                const end = polarToCartesian(150, 150, 150, endAngle);

                const d = [
                  "M", start.x, start.y,
                  "A", 150, 150, 0, largeArcFlag, 1, end.x, end.y,
                  "L", 150, 150,
                  "Z",
                ].join(" ");

                const textAngle = startAngle + angle / 2;
                const textPos = polarToCartesian(150, 150, 100, textAngle);

                return (
                  <g key={i}>
                    <path d={d} fill={colors[i % colors.length]} stroke="#333" strokeWidth="2" />
                    <text
                      x={textPos.x}
                      y={textPos.y}
                      fill="white"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      transform={`rotate(${textAngle + 90}, ${textPos.x}, ${textPos.y})`}
                      style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
                    >
                      {p.name}
                    </text>
                  </g>
                );
              })}

              {/* Center circle */}
              <circle cx="150" cy="150" r="25" fill="white" stroke="#333" strokeWidth="3" />
              <text
                x="150"
                y="155"
                fill={user && !user.isActive ? "red" : "#333"}
                fontSize="20"
                fontWeight="bold"
                textAnchor="middle"
              >
                {user && !user.isActive ? "🚫" : "Spin"}
              </text>
            </svg>
          </motion.div>

          {/* Overlay message if user already has schedule */}
          {hasSchedule && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "rgba(0,0,0,0.8)",
                color: "white",
                padding: "12px 18px",
                borderRadius: "10px",
                fontWeight: "bold",
                fontSize: "16px",
                zIndex: 30,
              }}
            >
              📅 You already picked a schedule
            </div>
          )}
        </div>
      </div>

      {/* Spin button */}
      {!chosenProduct && !hasSchedule && user?.isActive && (
        <Button
          className="spin-wheel-btn"
          onClick={handlePickSchedule}
          disabled={spinning || products.length === 0}
        >
          {spinning ? "Spinning..." : "Spin the Wheel"}
        </Button>
      )}

      {chosenProduct && (
        <Alert variant="success" className="mt-3 p-3">
          <div style={{ fontSize: "20px", fontWeight: "bold", color: "black", lineHeight: "1.4" }}>
            🎉 You got{" "}
            <span style={{ display: "block", marginTop: "5px", color: "#006400", fontSize: "22px" }}>
              {splitTextIntoTwoLines(chosenProduct.name).split("\n").map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  {index === 0 && <br />}
                </React.Fragment>
              ))}
            </span>
            <div style={{ marginTop: "8px", fontSize: "18px", color: "#333" }}>
              (₱{chosenProduct.amount})
            </div>
          </div>
        </Alert>
      )}
    </Container>
  );
}
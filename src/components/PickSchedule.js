// PickSchedule.js
import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { Button, Container, Spinner, Alert } from "react-bootstrap";
import UserContext from "../context/UserContext";

// Helper function for SVG approach
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
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

  const colors = ["#f87171", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa", "#f472b6"];

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

      const randomSpins = Math.floor(Math.random() * 5) + 5;
      const randomIndex = Math.floor(Math.random() * products.length);
      const anglePerSlice = 360 / products.length;

      // Calculate final angle so the selected slice lands at the pointer (top position)
      const finalAngle = 360 - randomIndex * anglePerSlice - anglePerSlice / 2 + 90;

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

  // Function to split long text into two lines
  const splitTextIntoTwoLines = (text, maxLength = 15) => {
    if (text.length <= maxLength) return text;

    const words = text.split(' ');
    let line1 = '';
    let line2 = '';

    for (const word of words) {
      if ((line1 + word).length <= maxLength) {
        line1 += (line1 ? ' ' : '') + word;
      } else {
        line2 += (line2 ? ' ' : '') + word;
      }
    }

    return line2 ? `${line1}\n${line2}` : text;
  };

  return (
    <Container className="my-4 text-center">
      <h2 className="mb-4">Pick Your Schedule</h2>

      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Wheel container with pointer */}
      <div className="relative mx-auto my-4" style={{ width: 320, height: 320 }}>
        {/* Wheel with SVG */}
        <div style={{ position: 'relative', width: '300px', height: '300px', margin: '0 auto' }}>
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 3.5, ease: "easeOut" }}
            style={{
              width: "300px",
              height: "300px",
              position: "relative",
            }}
          >
            <svg
              width="300"
              height="300"
              viewBox="0 0 300 300"
              style={{ transform: "rotate(0deg)" }}
            >
              {/* Wheel slices */}
              {products.map((p, i) => {
                const angle = (360 / products.length);
                const startAngle = (360 / products.length) * i;
                const endAngle = startAngle + angle;
                const largeArcFlag = angle > 180 ? 1 : 0;

                const start = polarToCartesian(150, 150, 150, startAngle);
                const end = polarToCartesian(150, 150, 150, endAngle);

                const d = [
                  "M", start.x, start.y,
                  "A", 150, 150, 0, largeArcFlag, 1, end.x, end.y,
                  "L", 150, 150,
                  "Z"
                ].join(" ");

                // Calculate text position
                const textAngle = startAngle + angle / 2;
                const textPos = polarToCartesian(150, 150, 100, textAngle);

                return (
                  <g key={i}>
                    <path
                      d={d}
                      fill={colors[i % colors.length]}
                      stroke="#333"
                      strokeWidth="2"
                    />
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
              <text x="150" y="155" fill="#333" fontSize="10" fontWeight="bold" textAnchor="middle">
                Spin
              </text>
            </svg>
          </motion.div>

          {/* Pointer - Fixed at center top of the wheel */}
          <div
            style={{
              position: "absolute",
              top: "0",
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

          {/* Pointer indicator line for better visibility */}
          <div
            style={{
              position: "absolute",
              top: "0",
              left: "50%",
              transform: "translateX(-50%)",
              width: "2px",
              height: "15px",
              background: "red",
              zIndex: 15,
            }}
          />
        </div>
      </div>

      {!chosenProduct ? (
        <Button onClick={handlePickSchedule} disabled={spinning || products.length === 0}>
          {spinning ? "Spinning..." : "Spin the Wheel"}
        </Button>
      ) : (
        <Alert variant="success" className="mt-3 p-3">
          <div style={{
            fontSize: "20px",
            fontWeight: "bold",
            color: "black",
            lineHeight: "1.4"
          }}>
            🎉 You got{" "}
            <span style={{
              display: "block",
              marginTop: "5px",
              color: "#006400",
              fontSize: "22px"
            }}>
              {splitTextIntoTwoLines(chosenProduct.name).split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  {index === 0 && <br />}
                </React.Fragment>
              ))}
            </span>
            <div style={{
              marginTop: "8px",
              fontSize: "18px",
              color: "#333"
            }}>
              (₱{chosenProduct.amount})
            </div>
          </div>
        </Alert>
      )}
    </Container>
  );
}
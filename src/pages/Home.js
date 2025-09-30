import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true); // only for first load
  const [error, setError] = useState(null);
  const [animationIndex, setAnimationIndex] = useState(0);

  // List of animation files in /public/animation
  const animations = [
    "/animation/piggy1.gif",
    "/animation/piggy2.gif",
    "/animation/piggy3.gif",
    "/animation/piggy4.gif",
    "/animation/piggy5.gif",
    "/animation/piggy6.gif",
    "/animation/piggy7.gif",
  ];

  const fetchRandomQuote = async (isFirst = false) => {
    try {
      if (isFirst) setLoading(true); // only block UI first time
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/quotes/random`
      );
      setQuote(response.data); // assuming { text, author }
      setError(null);
    } catch (err) {
      console.error("Error fetching quote:", err);
      setError("Failed to load quote.");
    } finally {
      if (isFirst) setLoading(false);
    }
  };

  useEffect(() => {
    // Preload animations so they don’t flash
    animations.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    // Fetch first quote immediately
    fetchRandomQuote(true);

    // Quote interval (every 15s)
    const quoteInterval = setInterval(() => {
      fetchRandomQuote();
    }, 15000);

    // Animation interval (every 10s)
    const animationInterval = setInterval(() => {
      setAnimationIndex((prevIndex) => (prevIndex + 1) % animations.length);
    }, 10000);

    return () => {
      clearInterval(quoteInterval);
      clearInterval(animationInterval);
    };
  }, []);

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="home-title">💰 Paluwagan Buddy</h1>

        {/* Quote Section */}
        <blockquote className="home-quote">
          {loading && "Loading quote..."}
          {error && error}
          {!loading && !error && quote && (
            <>
              “{quote.text}” <br /> <span>– {quote.author}</span>
            </>
          )}
        </blockquote>

        {/* Animation Section */}
        <div className="home-gif">
          <img
            src={animations[animationIndex]}
            alt="Money animation"
            style={{ maxWidth: "300px", margin: "20px 0" }}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="home-links">
          <Link to="/products" className="home-btn">
            View Bundles
          </Link>
          <Link to="/schedule" className="home-btn">
            View Schedule
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;

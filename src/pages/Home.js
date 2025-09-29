import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";


const Home = () => {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRandomQuote = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/quotes/random`);
        setQuote(response.data); // assuming response.data contains { text, author }
      } catch (err) {
        console.error("Error fetching quote:", err);
        setError("Failed to load quote.");
      } finally {
        setLoading(false);
      }
    };

    fetchRandomQuote();
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

        {/* GIF Section */}
        <div className="home-gif">
          <img
            src="/Money.gif"
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

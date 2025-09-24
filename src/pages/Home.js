import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="home-title">💰 Paluwagan Buddy</h1>
        <p className="home-subtitle">
          Smart saving starts here. Build wealth, one step at a time.
        </p>

        {/* GIF Section */}
        <div className="home-gif">
          <img src="/Money.gif" alt="Money animation" style={{ maxWidth: '300px', margin: '20px 0' }} />
        </div>

        {/* Quote Section */}
        <blockquote className="home-quote">
          “Do not save what is left after spending, but spend what is left after
          saving.” <br /> <span>– Warren Buffett</span>
        </blockquote>

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

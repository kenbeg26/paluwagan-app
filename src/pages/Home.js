import React from "react";
import { Link } from "react-router-dom";
import PickSchedule from "../components/PickSchedule"; // import the component

const Home = () => {
  return (
    <div className="container mt-5">
      <h1 className="mb-4">Welcome to the Home Page</h1>

      {/* PickSchedule Section */}
      <PickSchedule />

      <div className="mt-5">
        <h3>Navigation</h3>
        <ul>
          <li><Link to="/products">View Products</Link></li>
          <li><Link to="/orders">View My Orders</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default Home;

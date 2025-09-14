import React from "react";
import { Link } from "react-router-dom";
import PickSchedule from "../components/PickSchedule"; // import the component

const Home = () => {
  return (
    <div className="container mt-5">
      <h1 className="mb-4">Paluwagan Wheel</h1>

      {/* PickSchedule Section */}
      <PickSchedule />
    </div>
  );
};

export default Home;

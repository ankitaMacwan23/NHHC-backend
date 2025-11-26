import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Header = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/admin/logout`, {
        withCredentials: true,
      });
      onLogout(); // Update authCheck in parent
      navigate("/", { replace: true }); // Redirect to login
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <header className="bg-blue-700 text-white px-6 py-4 shadow-md flex justify-between items-center">
      {/* Logo + Title */}
      <div className="flex items-center">
        <img
          src="../../src/assets/logo.png" // Adjust path if needed
          alt="Naysan Logo"
          className="h-10 w-10 mr-3"
        />
        <h1 className="text-xl font-semibold tracking-wide">Naysan Home Health Care</h1>
      </div>

      {/* Navigation */}
      <nav className="flex flex-wrap items-center space-x-4 text-sm font-medium">
        <Link to="/home" className="hover:text-gray-200 transition">Home</Link>
        <Link to="/patients" className="hover:text-gray-200 transition">Patients</Link>
        <Link to="/caregivers" className="hover:text-gray-200 transition">Care Givers</Link>
        <Link to="/services" className="hover:text-gray-200 transition">Services</Link>
        <Link to="/blogs" className="hover:text-gray-200 transition">Blogs</Link>
        <Link to="/testimonials" className="hover:text-gray-200 transition">Testimonials</Link>
        <Link to="/accounts" className="hover:text-gray-200 transition">Accounts</Link>
        
        <button
          onClick={handleLogout}
          className="ml-4 bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </nav>
    </header>
  );
};

export default Header;

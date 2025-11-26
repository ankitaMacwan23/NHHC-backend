import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const Login = ({ onLogin }) => {
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    console.log("API BASE URL:", import.meta.env.VITE_API_BASE_URL);  

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/admin/login`,
        {
          username: username.trim(),
          password: password.trim(),
        },
        {
          withCredentials: true, // ✅ this is correct!
        }
      );

      if (res.data.message === "Authorized") {
        onLogin(true); // 🔐 update auth state in parent
        const redirectTo = location.state?.from?.pathname || "/Home";
        navigate(redirectTo, { replace: true });
      } else {
        setError("Login failed");
      }
    } catch (err) {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-80"
      >
        <h2 className="text-2xl mb-4">Admin Login</h2>
        
        {error && (
          <div className="text-red-500 text-sm mb-3">{error}</div>
        )}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;

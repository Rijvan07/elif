import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Popup from "../components/Popup";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ message: "", type: "success" });
  const navigate = useNavigate();

  const validateEmail = (value) => /\S+@\S+\.\S+/.test(value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setPopup({ message: "Email is required.", type: "error" });
      return;
    }
    if (!validateEmail(email)) {
      setPopup({ message: "Please enter a valid email.", type: "error" });
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/login", { email });
      localStorage.setItem("elif_user", JSON.stringify(data.user));
      setPopup({ message: "Login successful.", type: "success" });
      setTimeout(() => navigate("/test"), 800);
    } catch (error) {
      const msg = error?.response?.data?.detail || "Email address not matched!";
      setPopup({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page auth-page">
      <section className="auth-card glass-card">
        <h2>Welcome Back</h2>
        <p>Login using your registered email.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="btn-primary" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="helper-text">
          New user? <Link to="/register">Register here</Link>
        </p>
      </section>

      <Popup
        type={popup.type}
        message={popup.message}
        onClose={() => setPopup({ message: "", type: "success" })}
      />
    </main>
  );
}

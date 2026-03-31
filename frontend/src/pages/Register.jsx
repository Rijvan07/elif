import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Popup from "../components/Popup";
import api from "../services/api";

export default function Register() {
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
      const { data } = await api.post("/register", { email });
      setPopup({ message: data.message || "Registration Successful!", type: "success" });
      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      const msg = error?.response?.data?.detail || "Registration failed.";
      setPopup({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page auth-page">
      <section className="auth-card glass-card">
        <h2>Create Account</h2>
        <p>Register your email to start EI assessment.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="btn-primary" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="auth-back">
          <button type="button" className="btn-secondary" onClick={() => navigate("/login")}>
            Back to Login
          </button>
        </div>
      </section>

      <Popup
        type={popup.type}
        message={popup.message}
        onClose={() => setPopup({ message: "", type: "success" })}
      />
    </main>
  );
}

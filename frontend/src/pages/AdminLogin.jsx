import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Popup from "../components/Popup";
import api from "../services/api";

export default function AdminLogin() {
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
      const { data } = await api.post("/admin/login", { email });
      localStorage.setItem("elif_admin", JSON.stringify({ email: data.email }));
      setPopup({ message: data.message || "Welcome.", type: "success" });
      setTimeout(() => navigate("/admin"), 600);
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        "Unable to sign in. Check that your email is listed in ADMIN_EMAILS on the server.";
      setPopup({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page auth-page admin-auth">
      <section className="auth-card glass-card">
        <p className="admin-badge">Admin</p>
        <h2>Analytics sign-in</h2>
        <p>Enter your authorized admin email. Only today&apos;s assessment data is shown.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
          <button className="btn-primary" disabled={loading}>
            {loading ? "Signing in..." : "Open dashboard"}
          </button>
        </form>

        <p className="helper-text admin-helper">
          Participant login: <Link to="/login">user sign-in</Link>
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

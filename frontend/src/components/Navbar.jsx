import { useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("elif_user") || "null");
    } catch {
      return null;
    }
  }, []);

  const showSubtitle = location.pathname === "/login" || location.pathname === "/register";

  const handleLogout = () => {
    localStorage.removeItem("elif_user");
    navigate("/login");
  };

  return (
    <header className="navbar glass-card">
      <div className="navbar-brand">
        <img src="/Elif-Logo.png" alt="Elif Healthcare logo" className="brand-logo" />
        <div>
          <h1>Elif Healthcare</h1>
          {showSubtitle && <p>Emotional Intelligence Assessment</p>}
        </div>
      </div>

      <div className="navbar-actions">
        {user ? (
          <button className="btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <button className="btn-secondary" onClick={() => navigate("/login")}>
            Login
          </button>
        )}
      </div>
    </header>
  );
}

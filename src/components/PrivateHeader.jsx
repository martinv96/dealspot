import { Link, useNavigate } from "react-router-dom";
import {
  FaPercent,
  FaHome,
  FaRegFileAlt,
  FaRegHeart,
  FaRegCommentDots,
  FaUser,
  FaSignOutAlt
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function PrivateHeader() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/connexion");
  }

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-icon">
          <FaPercent />
        </div>
        <span>DealSpot</span>
      </div>

      <nav className="nav nav-private">
        <Link to="/app" className="nav-link"><FaHome /> Accueil</Link>
        <a href="#" className="nav-link"><FaRegFileAlt /> Mes annonces</a>
        <a href="#" className="nav-link"><FaRegHeart /> Favoris</a>
        <a href="#" className="nav-link"><FaRegCommentDots /> Messages</a>
        <a href="#" className="nav-link"><FaUser /> Profil</a>
        <button onClick={handleLogout} className="nav-link nav-logout" type="button">
          <FaSignOutAlt /> Deconnexion
        </button>
      </nav>
    </header>
  );
}
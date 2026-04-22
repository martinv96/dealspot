import { Link, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaRegFileAlt,
  FaRegHeart,
  FaRegCommentDots,
  FaUser,
  FaSignOutAlt
} from "react-icons/fa";
import logo from "../assets/logo3.png";
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
      <Link to="/app" className="brand">
        <img src={logo} alt="logo Dealspot" className="brand-logo" />
        <span>DealSpot</span>
      </Link>

      <nav className="nav nav-private">
        <Link to="/app" className="nav-link"><FaHome /> Accueil</Link>
        <Link to="/mes-annonces" className="nav-link"><FaRegFileAlt /> Mes annonces</Link>
        <Link to="/creer-annonce" className="nav-link"><FaRegHeart /> Créer une annonce</Link>
        <button className="nav-link nav-logout" type="button"><FaRegHeart /> Favoris</button>
        <button className="nav-link nav-logout" type="button"><FaRegCommentDots /> Messages</button>
        <Link to="/profil" className="nav-link"><FaUser /> Profil</Link>
        <button onClick={handleLogout} className="nav-link nav-logout" type="button">
          <FaSignOutAlt /> Deconnexion
        </button>
      </nav>
    </header>
  );
}
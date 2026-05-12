import { Link, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaRegFileAlt,
  FaRegHeart,
  FaHeart,
  FaRegCommentDots,
  FaUser,
  FaSignOutAlt
} from "react-icons/fa";
import logo from "../assets/logo3.png";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../hooks/useFavorites";

export default function PrivateHeader() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { favorites } = useFavorites();

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
        <Link to="/creer-annonce" className="nav-link"><FaRegFileAlt /> Créer une annonce</Link>
        <Link to="/favoris" className="nav-link nav-favoris">
          {favorites.length > 0 ? <FaHeart className="nav-heart-active" /> : <FaRegHeart />}
          Favoris
          {favorites.length > 0 && <span className="nav-badge">{favorites.length}</span>}
        </Link>
        <button className="nav-link nav-logout" type="button"><FaRegCommentDots /> Messages</button>
        <Link to="/profil" className="nav-link"><FaUser /> Profil</Link>
        <button onClick={handleLogout} className="nav-link nav-logout" type="button">
          <FaSignOutAlt /> Deconnexion
        </button>
      </nav>
    </header>
  );
}
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import api from "../services/api";

export default function PrivateHeader() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { favorites } = useFavorites();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const isOnMessagesPage = location.pathname.startsWith("/messages");
  const visibleUnreadMessages = isOnMessagesPage ? 0 : unreadMessages;

  useEffect(() => {
    let cancelled = false;

    if (isOnMessagesPage) {
      return undefined;
    }

    async function loadUnreadCount() {
      try {
        const response = await api.get("/messages/conversations");
        const total = (response.data?.conversations || []).reduce(
          (sum, conv) => sum + Number(conv.unreadCount || 0),
          0
        );
        if (!cancelled) {
          setUnreadMessages(total);
        }
      } catch {
        if (!cancelled) {
          setUnreadMessages(0);
        }
      }
    }

    loadUnreadCount();
    const intervalId = setInterval(loadUnreadCount, 6000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [isOnMessagesPage]);

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
        </Link>
        <Link to="/messages" className="nav-link">
          <FaRegCommentDots /> Messages
          {visibleUnreadMessages > 0 && <span className="nav-badge">{visibleUnreadMessages}</span>}
        </Link>
        <Link to="/profil" className="nav-link"><FaUser /> Profil</Link>
        <button onClick={handleLogout} className="nav-link nav-logout" type="button">
          <FaSignOutAlt /> Deconnexion
        </button>
      </nav>
    </header>
  );
}
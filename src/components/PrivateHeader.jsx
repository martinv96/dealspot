import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaRegFileAlt,
  FaRegHeart,
  FaHeart,
  FaRegCommentDots,
  FaUser,
  FaUserShield,
  FaSignOutAlt,
  FaBars,
  FaTimes
} from "react-icons/fa";
import logo from "../assets/LogoDealspot.png";
import { useAuth } from "../context/useAuth";
import { useFavorites } from "../hooks/useFavorites";
import api from "../services/api";

export default function PrivateHeader() {
  const { logout, user } = useAuth();
  const canManageAnnonces = ["vendeur", "admin"].includes(user?.role);
  const navigate = useNavigate();
  const location = useLocation();
  const { favorites } = useFavorites();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [menuOpenPath, setMenuOpenPath] = useState("");
  const isOnMessagesPage = location.pathname.startsWith("/messages");
  const visibleUnreadMessages = isOnMessagesPage ? 0 : unreadMessages;
  const isMenuOpen = menuOpenPath === location.pathname;

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

  function toggleMenu() {
    setMenuOpenPath((currentPath) =>
      currentPath === location.pathname ? "" : location.pathname
    );
  }

  function closeMenu() {
    setMenuOpenPath("");
  }

  function handleLogout() {
    closeMenu();
    logout();
    navigate("/login");
  }

  return (
    <header className="topbar">
      <div className="topbar-main">
        <Link to="/" className="brand brand-private" aria-label="Accueil DealSpot">
          <span className="brand-logo-wrap-private">
            <img src={logo} alt="logo Dealspot" className="brand-logo brand-logo-private" />
          </span>
        </Link>

        <button
          type="button"
          className="topbar-menu-toggle"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <nav className={`nav nav-private${isMenuOpen ? " open" : ""}`}>
        <Link to="/" className="nav-link" onClick={closeMenu}><FaHome /> Accueil</Link>
        {canManageAnnonces ? (
          <>
            <Link to="/mes-annonces" className="nav-link" onClick={closeMenu}><FaRegFileAlt /> Mes annonces</Link>
            <Link to="/creer-annonce" className="nav-link" onClick={closeMenu}><FaRegFileAlt /> Créer une annonce</Link>
          </>
        ) : null}
        <Link to="/favoris" className="nav-link nav-favoris" onClick={closeMenu}>
          {favorites.length > 0 ? <FaHeart className="nav-heart-active" /> : <FaRegHeart />}
          Favoris
        </Link>
        <Link to="/messages" className="nav-link" onClick={closeMenu}>
          <FaRegCommentDots /> Messages
          {visibleUnreadMessages > 0 && <span className="nav-badge">{visibleUnreadMessages}</span>}
        </Link>
        <Link to="/profil" className="nav-link" onClick={closeMenu}><FaUser /> Profil</Link>
        {user?.role === "admin" ? (
          <Link to="/admin" className="nav-link" onClick={closeMenu}><FaUserShield /> Administrateur</Link>
        ) : null}
        <button onClick={handleLogout} className="nav-link nav-logout" type="button">
          <FaSignOutAlt /> Déconnexion
        </button>
      </nav>
    </header>
  );
}
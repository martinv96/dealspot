import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import logo from "../assets/LogoDealspot.png";

export default function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="topbar">
      <div className="topbar-main">
        <Link to="/" className="brand brand-public" aria-label="Accueil DealSpot">
          <span className="brand-logo-wrap-public">
            <img src={logo} alt="logo dealspot" className="brand-logo brand-logo-public"/>
          </span>
        </Link>

        <button
          type="button"
          className="topbar-menu-toggle"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <nav className={`nav nav-public${isMenuOpen ? " open" : ""}`}>
        <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
          Accueil
        </Link>
        <Link to="/connexion" className="btn btn-outline" onClick={() => setIsMenuOpen(false)}>
          Connexion
        </Link>
        <Link to="/inscription" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>
          Inscription
        </Link>
      </nav>
    </header>
  );
}
import { Link } from "react-router-dom";
import { FaPercent } from "react-icons/fa";

export default function PublicHeader() {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-icon">
          <FaPercent />
        </div>
        <span>DealSpot</span>
      </div>

      <nav className="nav">
        <Link to="/" className="nav-link">
          Accueil
        </Link>
        <Link to="/connexion" className="btn btn-outline">
          Connexion
        </Link>
        <Link to="/inscription" className="btn btn-primary">
          Inscription
        </Link>
      </nav>
    </header>
  );
}
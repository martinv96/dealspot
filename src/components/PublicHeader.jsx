import { Link } from "react-router-dom";
import logo from "../assets/logo3.png";

export default function PublicHeader() {
  return (
    <header className="topbar">
      <Link to="/" className="brand">
        <img src={logo} alt="logo dealspot" className="brand-logo"/>
        <span>DealSpot</span>
      </Link>

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
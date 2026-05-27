import { FaPercent } from "react-icons/fa";
import logo from "../assets/logo3.png";
import { Link } from "react-router-dom";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-cols">
        <div>
          <div className="brand footer-brand">
            <div className="brand-icon">
              <img src={logo} alt="logo dealspot" className="brand-logo"/>
            </div>
            <span>DealSpot</span>
          </div>
          <p className="footer-text">
            La plateforme de revente locale d'objets d'occasion.
            <br />
            Simple, rapide et sécurisée.
          </p>
        </div>

        <div>
          <h4>Liens rapide</h4>
          <ul>
            <Link to="/">Accueil</Link>
            <Link to="/apropos">A propos</Link>
            <Link to="/contact">Contactez-nous</Link>
            <li>Aide</li>
          </ul>
        </div>

        <div>
          <h4>Contact</h4>
          <ul>
            <li>Email : contact@email.fr</li>
            <li>Tel : 06 54 86 78 58</li>
          </ul>
        </div>
      </div>

      <p className="copyright">© 2026 DealSpot. Tous droits réservés.</p>
    </footer>
  );
}
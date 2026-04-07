import { FaPercent } from "react-icons/fa";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-cols">
        <div>
          <div className="brand footer-brand">
            <div className="brand-icon">
              <FaPercent />
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
            <li>Accueil</li>
            <li>A propos</li>
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
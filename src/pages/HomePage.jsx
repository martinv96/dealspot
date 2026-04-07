import { Link } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import SiteFooter from "../components/SiteFooter";

export default function HomePage() {
  return (
    <div className="page-shell">
      <PublicHeader />

      <section className="hero">
        <h1>Achetez et vendez vos produits, localement</h1>
        <p>
          DealSpot est la plateforme de revente d'objets d'occasion près de chez vous.
          Donnez une seconde vie à vos objets.
        </p>
        <div className="hero-actions">
          <Link to="/inscription" className="btn btn-white-hero">Créer un compte</Link>
          <Link to="/connexion" className="btn btn-white-hero">Se connecter</Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
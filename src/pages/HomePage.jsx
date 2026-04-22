import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import SiteFooter from "../components/SiteFooter";
import ProductGrid from "../components/ProductGrid";
import api from "../services/api";

function formatPrice(value) {
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) {
    return value;
  }
  return numberValue.toLocaleString("fr-FR");
}

function formatRelativeDate(rawDate) {
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) {
    return "Date inconnue";
  }

  const now = Date.now();
  const diffInDays = Math.max(0, Math.floor((now - date.getTime()) / (1000 * 60 * 60 * 24)));

  if (diffInDays <= 0) {
    return "Aujourd'hui";
  }
  if (diffInDays === 1) {
    return "Il y a 1 jour";
  }
  return "Il y a " + diffInDays + " jours";
}

function mapAnnonceToCard(annonce) {
  return {
    id: annonce.id,
    title: annonce.titre,
    price: formatPrice(annonce.prix),
    city: annonce.localisation || "Non précisée",
    date: formatRelativeDate(annonce.date_publication),
    images: Array.isArray(annonce.images) ? annonce.images : []
  };
}

export default function HomePage() {
  const [annonces, setAnnonces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPublishedAnnonces() {
      try {
        setIsLoading(true);
        setError("");
        const response = await api.get("/annonces", { params: { limit: 24 } });
        setAnnonces(response.data?.annonces || []);
      } catch (loadError) {
        setError(loadError?.response?.data?.message || "Impossible de charger les annonces.");
      } finally {
        setIsLoading(false);
      }
    }

    loadPublishedAnnonces();
  }, []);

  const cards = useMemo(() => annonces.map(mapAnnonceToCard), [annonces]);
  const recentCards = useMemo(() => cards.slice(0, 3), [cards]);

  return (
    <div className="page-shell">
      <PublicHeader />

      <main className="page-main">
        <section className="hero">
          <h1>Achetez et vendez vos produits, localement</h1>
          <p>
            DealSpot est la plateforme de revente d'objets d'occasion près de chez vous.
            Donnez une seconde vie à vos objets.
          </p>

          <div className="hero-actions">
            <Link to="/inscription" className="btn btn-white-hero">
              Créer un compte
            </Link>
            <Link to="/connexion" className="btn btn-white-hero">
              Se connecter
            </Link>
          </div>
        </section>

        <section className="section listings-section">
          <div className="section-head">
            <h2>Annonces récentes</h2>
            <Link to="/connexion" className="btn btn-outline">Voir tout</Link>
          </div>

          {isLoading ? <p className="center-loader">Chargement des annonces...</p> : null}
          {!isLoading && error ? <p className="form-error">{error}</p> : null}
          {!isLoading && !error ? <ProductGrid items={recentCards} /> : null}
        </section>

        <section className="section listings-section">
          <h2>Les meilleures annonces</h2>
          {isLoading ? null : !error ? <ProductGrid items={cards} /> : null}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
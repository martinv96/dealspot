import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PrivateHeader from "../components/PrivateHeader";
import SiteFooter from "../components/SiteFooter";
import ProductGrid from "../components/ProductGrid";
import { useAuth } from "../context/AuthContext";
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
  const badgeByStatus = {
    active: "Publiée",
    "expirée": "Vendue",
    brouillon: "Brouillon"
  };

  return {
    id: annonce.id,
    title: annonce.titre,
    price: formatPrice(annonce.prix),
    city: annonce.localisation || "Non précisée",
    date: formatRelativeDate(annonce.date_publication),
    images: Array.isArray(annonce.images) ? annonce.images : [],
    badge: badgeByStatus[annonce.statut] || "Annonce"
  };
}

export default function PrivateHomePage() {
  const { user } = useAuth();
  const [publishedAnnonces, setPublishedAnnonces] = useState([]);
  const [myAnnonces, setMyAnnonces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);
        setError("");

        const [publishedResponse, mineResponse] = await Promise.all([
          api.get("/annonces", { params: { limit: 24 } }),
          api.get("/annonces/me", { params: { limit: 24 } })
        ]);

        setPublishedAnnonces(publishedResponse.data?.annonces || []);
        setMyAnnonces(mineResponse.data?.annonces || []);
      } catch (loadError) {
        setError(loadError?.response?.data?.message || "Impossible de charger le tableau de bord.");
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const publishedCards = useMemo(
    () => publishedAnnonces.map(mapAnnonceToCard),
    [publishedAnnonces]
  );
  const myActiveCards = useMemo(
    () => myAnnonces.filter((annonce) => annonce.statut === "active").map(mapAnnonceToCard),
    [myAnnonces]
  );

  return (
    <div className="page-shell">
      <PrivateHeader />

      <main className="page-main">
        <section className="hero hero-private">
          <h1>Bonjour {user?.pseudo || "Martin"} !</h1>
          <p>Découvrez les meilleures affaires près de chez vous</p>
        </section>

        <section className="private-search-wrap">
          <div className="private-search">
            <input placeholder="Rechercher un objet..." />
            <select>
              <option>Catégorie</option>
            </select>
            <input placeholder="Prix max" />
            <input placeholder="Ville" />
            <button className="btn btn-primary">Rechercher</button>
          </div>
        </section>

        <section className="section listings-section">
          <div className="section-head">
            <h2>Mes annonces en 1 clic</h2>
            <Link to="/mes-annonces" className="btn btn-outline">Voir tout</Link>
          </div>

          {isLoading ? <p className="center-loader">Chargement des annonces...</p> : null}
          {!isLoading && error ? <p className="form-error">{error}</p> : null}
          {!isLoading && !error ? <ProductGrid items={myActiveCards} showBadge /> : null}
        </section>

        <section className="section listings-section">
          <h2>Les meilleures annonces</h2>
          {isLoading ? null : !error ? <ProductGrid items={publishedCards} /> : null}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
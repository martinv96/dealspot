import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PrivateHeader from "../components/PrivateHeader";
import ProductGrid from "../components/ProductGrid";
import SiteFooter from "../components/SiteFooter";
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

export default function MyAnnoncesPage() {
  const [annonces, setAnnonces] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMyAnnonces() {
      try {
        setIsLoading(true);
        setError("");
        const response = await api.get("/annonces/me", { params: { limit: 200 } });
        setAnnonces(response.data?.annonces || []);
      } catch (loadError) {
        setError(loadError?.response?.data?.message || "Impossible de charger vos annonces.");
      } finally {
        setIsLoading(false);
      }
    }

    loadMyAnnonces();
  }, []);

  const counts = useMemo(() => {
    return {
      active: annonces.filter((annonce) => annonce.statut === "active").length,
      vendues: annonces.filter((annonce) => annonce.statut === "expirée").length,
      brouillon: annonces.filter((annonce) => annonce.statut === "brouillon").length
    };
  }, [annonces]);

  const filteredCards = useMemo(() => {
    const statusMap = {
      active: "active",
      vendues: "expirée",
      brouillon: "brouillon"
    };

    const selectedStatus = statusMap[activeTab];
    return annonces
      .filter((annonce) => annonce.statut === selectedStatus)
      .map(mapAnnonceToCard);
  }, [activeTab, annonces]);

  return (
    <div className="page-shell">
      <PrivateHeader />

      <main className="page-main mes-annonces-page">
        <section className="mes-annonces-head">
          <div>
            <h1>Mes annonces</h1>
            <p>Gérer ici toutes vos annonces</p>
          </div>

          <Link to="/creer-annonce" className="btn btn-primary">
            Nouvelle annonce
          </Link>
        </section>

        <section className="mes-annonces-tabs" aria-label="Filtre statut annonces">
          <button
            type="button"
            className={"mes-tab" + (activeTab === "active" ? " active" : "")}
            onClick={() => setActiveTab("active")}
          >
            Actives ({counts.active})
          </button>
          <button
            type="button"
            className={"mes-tab" + (activeTab === "vendues" ? " active" : "")}
            onClick={() => setActiveTab("vendues")}
          >
            Vendues ({counts.vendues})
          </button>
          <button
            type="button"
            className={"mes-tab" + (activeTab === "brouillon" ? " active" : "")}
            onClick={() => setActiveTab("brouillon")}
          >
            Brouillons ({counts.brouillon})
          </button>
        </section>

        {isLoading ? <p className="center-loader">Chargement des annonces...</p> : null}
        {!isLoading && error ? <p className="form-error">{error}</p> : null}

        {!isLoading && !error ? (
          <section className="section listings-section mes-annonces-list">
            <ProductGrid items={filteredCards} showBadge />
          </section>
        ) : null}
      </main>

      <SiteFooter />
    </div>
  );
}
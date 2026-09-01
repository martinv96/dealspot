import { useCallback, useEffect, useMemo, useState } from "react";
import PrivateHeader from "../components/PrivateHeader";
import PublicHeader from "../components/PublicHeader";
import SiteFooter from "../components/SiteFooter";
import ProductGrid from "../components/ProductGrid";
import PaginationControls from "../components/PaginationControls";
import { useAuth } from "../context/useAuth";
import api from "../services/api";

const PAGE_SIZE = 10;
const EMPTY_FILTERS = {
  query: "",
  categorie: "",
  prixMax: "",
  ville: ""
};

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

export default function AllAnnoncesPage() {
  const { isAuthenticated } = useAuth();
  const [annonces, setAnnonces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategorie, setSearchCategorie] = useState("");
  const [searchPrixMax, setSearchPrixMax] = useState("");
  const [searchVille, setSearchVille] = useState("");

  const [filters, setFilters] = useState({
    ...EMPTY_FILTERS
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadAnnonces = useCallback(async (pageToLoad, currentFilters) => {
    const response = await api.get("/annonces", {
      params: {
        page: pageToLoad,
        limit: PAGE_SIZE,
        query: currentFilters.query || undefined,
        categorie: currentFilters.categorie || undefined,
        prixMax: currentFilters.prixMax || undefined,
        ville: currentFilters.ville || undefined
      }
    });

    setAnnonces(response.data?.annonces || []);
    setCurrentPage(response.data?.page || pageToLoad);
    setTotalPages(response.data?.pages || 1);
    setTotalItems(response.data?.total || 0);
  }, []);

  useEffect(() => {
    async function init() {
      try {
        setIsLoading(true);
        setError("");
        await loadAnnonces(1, EMPTY_FILTERS);
      } catch (loadError) {
        setError(loadError?.response?.data?.message || "Impossible de charger les annonces.");
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [loadAnnonces]);

  async function handleSearch() {
    const nextFilters = {
      query: searchQuery,
      categorie: searchCategorie,
      prixMax: searchPrixMax,
      ville: searchVille
    };

    try {
      setIsLoading(true);
      setError("");
      setFilters(nextFilters);
      await loadAnnonces(1, nextFilters);
    } catch (loadError) {
      setError(loadError?.response?.data?.message || "Impossible de filtrer les annonces.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReset() {
    const emptyFilters = { ...EMPTY_FILTERS };
    setSearchQuery("");
    setSearchCategorie("");
    setSearchPrixMax("");
    setSearchVille("");

    try {
      setIsLoading(true);
      setError("");
      setFilters(emptyFilters);
      await loadAnnonces(1, emptyFilters);
    } catch (loadError) {
      setError(loadError?.response?.data?.message || "Impossible de réinitialiser les filtres.");
    } finally {
      setIsLoading(false);
    }
  }

  async function goToPage(pageToLoad) {
    if (pageToLoad < 1 || pageToLoad > totalPages || pageToLoad === currentPage) {
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      await loadAnnonces(pageToLoad, filters);
    } catch (loadError) {
      setError(loadError?.response?.data?.message || "Impossible de changer de page.");
    } finally {
      setIsLoading(false);
    }
  }

  const cards = useMemo(() => annonces.map(mapAnnonceToCard), [annonces]);

  return (
    <div className="page-shell">
      {isAuthenticated ? <PrivateHeader /> : <PublicHeader />}

      <main className="page-main private-home-main all-annonces-page">
        <section className="section listings-section" style={{ marginTop: "1rem" }}>
          <div className="section-head">
            <h2>Toutes les annonces du site</h2>
            <p>{totalItems} résultat{totalItems > 1 ? "s" : ""}</p>
          </div>

          <div className="all-annonces-filters-wrap">
            <div className="all-annonces-filters-grid">
              <input
                placeholder="Rechercher un objet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select value={searchCategorie} onChange={(e) => setSearchCategorie(e.target.value)}>
                <option value="">Catégorie</option>
                <option value="meubles">Meubles</option>
                <option value="electronique">Électronique</option>
                <option value="mode">Mode</option>
                <option value="sport">Sport</option>
                <option value="jeux-loisirs">Jeux & Loisirs</option>
                <option value="autres">Autres</option>
              </select>
              <input
                placeholder="Prix max"
                type="number"
                min="0"
                value={searchPrixMax}
                onChange={(e) => setSearchPrixMax(e.target.value)}
              />
              <input
                placeholder="Ville"
                value={searchVille}
                onChange={(e) => setSearchVille(e.target.value)}
              />

              <div className="all-annonces-actions">
                <button className="btn btn-primary" type="button" onClick={handleSearch}>Rechercher</button>
                <button className="btn btn-outline" type="button" onClick={handleReset}>Effacer</button>
              </div>
            </div>
          </div>

          {isLoading ? <p className="center-loader">Chargement des annonces...</p> : null}
          {!isLoading && error ? <p className="form-error">{error}</p> : null}
          {!isLoading && !error ? <ProductGrid items={cards} /> : null}

          {!isLoading && !error ? (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevious={() => goToPage(currentPage - 1)}
              onNext={() => goToPage(currentPage + 1)}
            />
          ) : null}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

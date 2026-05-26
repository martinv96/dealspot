import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/useAuth";
import api from "../services/api";

function normalizeFavorite(item) {
  if (!item || !item.id) return null;
  return {
    id: item.id,
    titre: item.titre || "Annonce",
    prix: item.prix,
    localisation: item.localisation || "Non précisée",
    date_publication: item.date_publication,
    images: Array.isArray(item.images) ? item.images : [],
    categorie: item.categorie,
    statut: item.statut
  };
}

export function useFavorites() {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    let cancelled = false;

    async function fetchFavorites() {
      try {
        const { data } = await api.get("/favorites");
        const next = (data?.favorites || []).map(normalizeFavorite).filter(Boolean);
        if (!cancelled) {
          setFavorites(next);
        }
      } catch {
        if (!cancelled) {
          setFavorites([]);
        }
      }
    }

    fetchFavorites();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const visibleFavorites = useMemo(
    () => (isAuthenticated ? favorites : []),
    [isAuthenticated, favorites]
  );

  const isFavorite = useCallback(
    (id) => visibleFavorites.some((f) => f.id === id),
    [visibleFavorites]
  );

  const toggleFavorite = useCallback(
    async (annonce) => {
      if (!isAuthenticated || !annonce?.id) {
        return;
      }

      const fallbackItem = normalizeFavorite(annonce);
      const previous = visibleFavorites;
      const exists = previous.some((f) => f.id === annonce.id);

      if (exists) {
        setFavorites((prev) => prev.filter((f) => f.id !== annonce.id));
        try {
          await api.delete("/favorites/" + annonce.id);
        } catch {
          setFavorites(previous);
        }
        return;
      }

      if (fallbackItem) {
        setFavorites((prev) => [...prev, fallbackItem]);
      }

      try {
        const { data } = await api.post("/favorites", { annonceId: annonce.id });
        const serverItem = normalizeFavorite(data?.favorite);
        if (serverItem) {
          setFavorites((prev) => {
            const without = prev.filter((f) => f.id !== serverItem.id);
            return [...without, serverItem];
          });
        }
      } catch {
        setFavorites(previous);
      }
    },
    [visibleFavorites, isAuthenticated]
  );

  const removeFavorite = useCallback(
    async (id) => {
      if (!isAuthenticated || !id) {
        return;
      }

      const previous = visibleFavorites;
      setFavorites((prev) => prev.filter((f) => f.id !== id));

      try {
        await api.delete("/favorites/" + id);
      } catch {
        setFavorites(previous);
      }
    },
    [visibleFavorites, isAuthenticated]
  );

  return {
    favorites: visibleFavorites,
    isFavorite,
    toggleFavorite,
    removeFavorite
  };
}
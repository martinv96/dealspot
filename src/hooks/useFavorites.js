import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
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

  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      return;
    }

    const { data } = await api.get("/favorites");
    const next = (data?.favorites || []).map(normalizeFavorite).filter(Boolean);
    setFavorites(next);
  }, [isAuthenticated]);

  useEffect(() => {
    loadFavorites().catch(() => {
      setFavorites([]);
    });
  }, [loadFavorites]);

  const isFavorite = useCallback(
    (id) => favorites.some((f) => f.id === id),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (annonce) => {
      if (!isAuthenticated || !annonce?.id) {
        return;
      }

      const fallbackItem = normalizeFavorite(annonce);
      const previous = favorites;
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
    [favorites, isAuthenticated]
  );

  const removeFavorite = useCallback(
    async (id) => {
      if (!isAuthenticated || !id) {
        return;
      }

      const previous = favorites;
      setFavorites((prev) => prev.filter((f) => f.id !== id));

      try {
        await api.delete("/favorites/" + id);
      } catch {
        setFavorites(previous);
      }
    },
    [favorites, isAuthenticated]
  );

  return { favorites, isFavorite, toggleFavorite, removeFavorite };
}

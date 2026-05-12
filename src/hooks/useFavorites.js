import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "dealspot_favorites";

function readStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(readStorage);

  // Sync across tabs
  useEffect(() => {
    function onStorage(e) {
      if (e.key === STORAGE_KEY) setFavorites(readStorage());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isFavorite = useCallback(
    (id) => favorites.some((f) => f.id === id),
    [favorites]
  );

  const toggleFavorite = useCallback((annonce) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === annonce.id);
      const next = exists
        ? prev.filter((f) => f.id !== annonce.id)
        : [
            ...prev,
            {
              id: annonce.id,
              titre: annonce.titre,
              prix: annonce.prix,
              localisation: annonce.localisation,
              date_publication: annonce.date_publication,
              images: annonce.images || [],
              categorie: annonce.categorie
            }
          ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeFavorite = useCallback((id) => {
    setFavorites((prev) => {
      const next = prev.filter((f) => f.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { favorites, isFavorite, toggleFavorite, removeFavorite };
}

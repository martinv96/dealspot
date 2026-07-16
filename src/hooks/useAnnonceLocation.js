import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

function getSimplifiedLocationLabel(item) {
  const address = item?.address || {};
  const hasPostalAddress = Boolean(address.house_number || address.road);

  // Si l'utilisateur tape une adresse, on conserve le libellé complet proposé.
  if (hasPostalAddress && typeof item?.display_name === "string" && item.display_name.trim()) {
    return item.display_name.trim();
  }

  const city =
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.hamlet ||
    (typeof item?.display_name === "string"
      ? item.display_name.split(",")[0]?.trim()
      : "");

  const region =
    address.state ||
    address.region ||
    address.county ||
    address.state_district ||
    "";

  if (!city) {
    return "";
  }

  if (!region) {
    return city;
  }

  return city.toLowerCase() === region.toLowerCase()
    ? city
    : `${city}, ${region}`;
}

function getSuggestionCenter(item) {
  const lat = Number(item?.lat);
  const lon = Number(item?.lon);
  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return null;
  }
  return [lat, lon];
}

export function useAnnonceLocation({ isEditing, localisationValue }) {
  const [rawLocationSuggestions, setRawLocationSuggestions] = useState([]);
  const [geocodeResult, setGeocodeResult] = useState({
    center: null,
    status: "idle",
  });

  const displayedLocalisation = (localisationValue || "").trim();

  const selectedLocationSuggestion = useMemo(() => {
    const normalizedInput = displayedLocalisation.toLowerCase();
    return rawLocationSuggestions.find(
      (suggestion) => suggestion.label.toLowerCase() === normalizedInput,
    );
  }, [displayedLocalisation, rawLocationSuggestions]);

  const locationSuggestions = useMemo(() => {
    if (!isEditing || displayedLocalisation.length < 2) {
      return [];
    }
    return rawLocationSuggestions;
  }, [displayedLocalisation.length, isEditing, rawLocationSuggestions]);

  const mapCenter = useMemo(() => {
    if (!isEditing) return null;
    if (selectedLocationSuggestion?.center) return selectedLocationSuggestion.center;
    return geocodeResult.center;
  }, [geocodeResult.center, isEditing, selectedLocationSuggestion]);

  const mapStatus = useMemo(() => {
    if (!isEditing) return "idle";
    if (selectedLocationSuggestion?.center) return "ok";
    if (!displayedLocalisation) return "empty";
    if (displayedLocalisation.length < 3) return "idle";
    return geocodeResult.status;
  }, [displayedLocalisation, geocodeResult.status, isEditing, selectedLocationSuggestion]);

  useEffect(() => {
    // hors mode édition, la carte n'a pas besoin de geocodage.
    if (!isEditing || selectedLocationSuggestion?.center || !displayedLocalisation || displayedLocalisation.length < 3) {
      return;
    }

    // debounce + abort pour éviter les rafales d'appels et ignorer les réponses obsolètes.
    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        setGeocodeResult((current) => ({ ...current, status: "loading" }));
        const response = await api.get("/geocode/search", {
          signal: controller.signal,
          params: {
            q: displayedLocalisation,
            limit: 1,
            lang: "fr",
          },
        });

        const results = response.data?.results;
        if (!Array.isArray(results) || results.length === 0) {
          setGeocodeResult({ center: null, status: "not-found" });
          return;
        }

        const first = results[0];
        setGeocodeResult({ center: [Number(first.lat), Number(first.lon)], status: "ok" });
      } catch (geocodeError) {
        if (geocodeError?.name === "AbortError") {
          return;
        }
        setGeocodeResult({ center: null, status: "error" });
      }
    }, 350);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [displayedLocalisation, isEditing, selectedLocationSuggestion]);

  useEffect(() => {
    const query = displayedLocalisation;
    if (!isEditing || query.length < 2) {
      return;
    }

    // suggestions géographiques pendant la saisie, avec déduplication par libellé.
    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        const response = await api.get("/geocode/search", {
          signal: controller.signal,
          params: {
            q: query,
            limit: 6,
            lang: "fr",
          },
        });

        const results = response.data?.results;
        if (!Array.isArray(results)) {
          setRawLocationSuggestions([]);
          return;
        }

        const suggestionsMap = new Map();
        results.forEach((item) => {
          const label = getSimplifiedLocationLabel(item);
          const center = getSuggestionCenter(item);
          if (!label || !center || suggestionsMap.has(label)) {
            return;
          }
          suggestionsMap.set(label, { label, center });
        });

        setRawLocationSuggestions(Array.from(suggestionsMap.values()));
      } catch (suggestError) {
        if (suggestError?.name === "AbortError") {
          return;
        }
        setRawLocationSuggestions([]);
      }
    }, 250);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [displayedLocalisation, isEditing]);

  return {
    displayedLocalisation,
    locationSuggestions,
    mapCenter,
    mapStatus,
  };
}

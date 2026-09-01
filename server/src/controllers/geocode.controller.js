import https from "node:https";

// ce controller fait le proxy vers l'api adresse pour normaliser les suggestions géographiques
const BAN_BASE_URL = "https://api-adresse.data.gouv.fr/search/";
const CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const geocodeCache = new Map();

function requestJson(url, headers = {}) {
  // appel https bas niveau pour garder le contrôle du timeout et du parsing json
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (response) => {
      let rawData = "";
      response.setEncoding("utf8");

      response.on("data", (chunk) => {
        rawData += chunk;
      });

      response.on("end", () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          const error = new Error("Upstream HTTP " + response.statusCode);
          reject(error);
          return;
        }

        try {
          resolve(JSON.parse(rawData));
        } catch {
          reject(new Error("Invalid JSON response"));
        }
      });
    });

    req.setTimeout(8000, () => {
      req.destroy(new Error("Request timeout"));
    });

    req.on("error", (error) => {
      reject(error);
    });
  });
}

function parseLimit(rawValue, fallback) {
  // garde un nombre de suggestions raisonnable côté api
  const parsed = Number.parseInt(rawValue, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, 10);
}

function getCachedResults(cacheKey) {
  // cache mémoire simple pour limiter les appels externes pendant la session serveur
  const cached = geocodeCache.get(cacheKey);
  if (!cached) return null;
  if (cached.expiresAt <= Date.now()) {
    geocodeCache.delete(cacheKey);
    return null;
  }
  return cached.results;
}

function setCachedResults(cacheKey, results) {
  // évite de rappeler l'api externe pour les mêmes requêtes fréquentes (cache 6h)
  geocodeCache.set(cacheKey, {
    results,
    expiresAt: Date.now() + CACHE_TTL_MS
  });
}

function getRegionFromContext(context) {
  if (typeof context !== "string" || !context.trim()) return "";
  const parts = context
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (!parts.length) return "";
  return parts[parts.length - 1] || "";
}

function normalizeBanResults(payload) {
  // on normalise la réponse ban dans un format stable côté front
  const features = Array.isArray(payload?.features) ? payload.features : [];
  return features
    .map((feature) => {
      const properties = feature?.properties || {};
      const coordinates = Array.isArray(feature?.geometry?.coordinates)
        ? feature.geometry.coordinates
        : [];
      const lon = Number(coordinates[0]);
      const lat = Number(coordinates[1]);

      if (Number.isNaN(lat) || Number.isNaN(lon)) {
        return null;
      }

      const city =
        properties.city ||
        properties.name ||
        "";
      const region = getRegionFromContext(properties.context);
      const road = properties.street || properties.name || "";
      const houseNumber = properties.housenumber || "";
      const fullLabel = properties.label || properties.name || city;

      return {
        display_name: fullLabel,
        lat: String(lat),
        lon: String(lon),
        address: {
          city,
          town: city,
          village: city,
          state: region,
          postcode: properties.postcode || "",
          road,
          house_number: houseNumber
        }
      };
    })
    .filter(Boolean);
}

export async function searchLocation(req, res) {
  // but: fournir des suggestions de villes/adresses au front
  // 1) validation des paramètres
  // 2) tentative cache
  // 3) appel api adresse puis normalisation de la réponse
  const query = String(req.query.q || "").trim();
  if (!query) {
    return res.status(400).json({ message: "Parametre q requis." });
  }

  const limit = parseLimit(req.query.limit, 1);
  const language = String(req.query.lang || "fr").trim() || "fr";
  const cacheKey = `${language}|${limit}|${query.toLowerCase()}`;

  const cachedResults = getCachedResults(cacheKey);
  if (cachedResults) {
    return res.json({ results: cachedResults, source: "cache" });
  }

  const banParams = new URLSearchParams({
    q: query,
    limit: String(limit),
    autocomplete: "1"
  });

  try {
    const banResults = normalizeBanResults(
      await requestJson(`${BAN_BASE_URL}?${banParams.toString()}`)
    );
    setCachedResults(cacheKey, banResults);
    return res.json({ results: banResults, source: "ban" });
  } catch (error) {
    console.error("[geocode] BAN error:", error.message);
    return res.status(502).json({ message: "Impossible de joindre le service de geocodage." });
  }
}

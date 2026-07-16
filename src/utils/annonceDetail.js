const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><rect width='100%25' height='100%25' fill='%23f2f2f2'/><text x='50%25' y='50%25' font-family='Arial' font-size='36' fill='%23909090' text-anchor='middle' dominant-baseline='middle'>DealSpot</text></svg>";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:4000/api").replace(/\/api\/?$/, "");
const IS_NGROK_ORIGIN = /ngrok-free\.dev|ngrok\.io/i.test(API_ORIGIN);

function withNgrokBypass(url) {
  // Ajoute le paramètre anti-warning uniquement pour les URLs ngrok.
  if (!IS_NGROK_ORIGIN || typeof url !== "string" || url.startsWith("data:")) {
    return url;
  }

  const [base, hash = ""] = url.split("#");
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}ngrok-skip-browser-warning=true${hash ? `#${hash}` : ""}`;
}

export function formatPrice(value) {
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return value;
  return numberValue.toLocaleString("fr-FR");
}

export function formatDate(rawDate) {
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return "Date inconnue";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function cleanImages(rawImages) {
  // Toujours retourner au moins une image pour garder un rendu stable côté UI.
  if (!Array.isArray(rawImages) || rawImages.length === 0) {
    return [FALLBACK_IMAGE];
  }

  return rawImages
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .map((value) => {
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(value)) {
        const normalizedPath = value.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, "");
        return withNgrokBypass(API_ORIGIN + normalizedPath);
      }

      if (value.startsWith("http") || value.startsWith("data:")) {
        return withNgrokBypass(value);
      }

      return withNgrokBypass(API_ORIGIN + (value.startsWith("/") ? "" : "/") + value);
    });
}

export { FALLBACK_IMAGE };

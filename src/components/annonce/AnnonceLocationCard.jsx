import { useEffect } from "react";
import { CircleMarker, MapContainer, TileLayer, useMap } from "react-leaflet";

const DEFAULT_MAP_CENTER = [48.8566, 2.3522];

function RecenterMap({ center }) {
  const map = useMap();

  useEffect(() => {
    if (!center) return;
    map.setView(center, 12, { animate: false });
  }, [center, map]);

  return null;
}

export default function AnnonceLocationCard({
  displayedLocalisation,
  mapCenter,
  mapStatus,
}) {
  return (
    <div className="annonce-location-card">
      <h3>Localisation</h3>
      <div
        className="annonce-leaflet-wrap"
        aria-label="Carte de localisation de l'annonce"
      >
        <MapContainer
          center={mapCenter || DEFAULT_MAP_CENTER}
          zoom={12}
          scrollWheelZoom={false}
          className="annonce-leaflet-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {mapCenter ? (
            <CircleMarker
              center={mapCenter}
              radius={10}
              pathOptions={{
                color: "#2f6fd6",
                fillColor: "#2f6fd6",
                fillOpacity: 0.28,
                weight: 2,
              }}
            />
          ) : null}
          <RecenterMap center={mapCenter} />
        </MapContainer>
      </div>
      <div className="annonce-location-note">
        <strong>{displayedLocalisation || "Localisation non renseignée"}</strong>
        <p>
          {mapStatus === "loading" ? "Recherche de la zone..." : null}
          {mapStatus === "not-found" ? "Zone introuvable. Verifiez la saisie." : null}
          {mapStatus === "error" ? "Impossible de charger la carte pour le moment." : null}
          {mapStatus === "ok" || mapStatus === "idle" || mapStatus === "empty"
            ? "Remise en main propre (à convenir entre acheteur et vendeur)."
            : null}
        </p>
      </div>
    </div>
  );
}

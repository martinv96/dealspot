import { useMemo, useState } from "react";
import { FaHistory, FaEnvelope, FaBullhorn, FaFlag } from "react-icons/fa";

function formatHistoryDate(dateValue) {
  if (!dateValue) return "Date inconnue";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(dateValue));
}

function getHistoryBadgeClass(status) {
  const normalized = String(status || "").toLowerCase();

  if (normalized.includes("lu") || normalized.includes("verifi") || normalized.includes("vérifi") || normalized.includes("actif") || normalized.includes("succes") || normalized.includes("succès") || normalized.includes("active")) {
    return "profile-history-badge success";
  }

  if (normalized.includes("non lu") || normalized.includes("en_attente") || normalized.includes("brouillon")) {
    return "profile-history-badge warning";
  }

  if (normalized.includes("expir") || normalized.includes("rejet") || normalized.includes("bloqu")) {
    return "profile-history-badge danger";
  }

  return "profile-history-badge";
}

function getHistoryBadgeLabel(item) {
  const category = String(item?.category || "").toLowerCase();
  const status = String(item?.statusLabel || item?.status || "").toLowerCase();

  if (category === "compte") {
    if (status.includes("vérifi") || status.includes("verifi")) return "Compte vérifié";
    if (status.includes("actif") || status.includes("succès") || status.includes("succes")) return "Compte actif";
    return item.statusLabel || item.status || "Compte";
  }

  if (category === "annonces") {
    if (status.includes("active")) return "Annonce publiée";
    if (status.includes("brouillon")) return "Brouillon";
    if (status.includes("expir")) return "Annonce expirée";
    return item.statusLabel || item.status || "Annonce";
  }

  if (category === "messages") {
    if (status.includes("non lu")) return "Non lu";
    if (status.includes("lu")) return "Lu";
    if (status.includes("envoy")) return "Envoyé";
    return item.statusLabel || item.status || "Message";
  }

  if (category === "signalements") {
    if (status.includes("en_attente")) return "En attente";
    if (status.includes("trait")) return "Traité";
    if (status.includes("rejet")) return "Rejeté";
    return item.statusLabel || item.status || "Signalement";
  }

  return item.statusLabel || item.status || "Statut";
}

function formatHistoryDetails(details) {
  if (!details) return null;
  return typeof details === "string" ? details : JSON.stringify(details);
}

const HISTORY_SECTIONS = {
  compte: {
    label: "Compte",
    icon: FaHistory,
    empty: "Aucune activité de compte pour le moment."
  },
  annonces: {
    label: "Annonces",
    icon: FaBullhorn,
    empty: "Aucune annonce publiée pour le moment."
  },
  messages: {
    label: "Messages",
    icon: FaEnvelope,
    empty: "Aucun message récent."
  },
  signalements: {
    label: "Signalements",
    icon: FaFlag,
    empty: "Aucun signalement envoyé."
  }
};

export default function ProfileHistoryCard({
  history,
  historyPagination,
  historyLoading,
  historyError,
  onChangeHistoryPage
}) {
  const [activeHistorySection, setActiveHistorySection] = useState("compte");

  const activeHistoryConfig = useMemo(
    () => HISTORY_SECTIONS[activeHistorySection] || HISTORY_SECTIONS.compte,
    [activeHistorySection]
  );

  const ActiveHistoryIcon = activeHistoryConfig.icon;
  const activeHistoryItems = history?.[activeHistorySection] || [];
  const activeHistoryPaging = historyPagination?.[activeHistorySection] || { page: 1, pages: 1, total: 0 };

  return (
    <section className="profile-card profile-history-card">
      <div className="profile-card-head">
        <h3>Historique d'activité</h3>
        <p className="profile-history-note">Dernières actions avec dates et statuts</p>
      </div>

      {historyLoading ? <p className="center-loader">Chargement de l'historique...</p> : null}
      {historyError ? <p className="form-error">{historyError}</p> : null}

      {!historyLoading && !historyError ? (
        <div className="profile-history-sections">
          <div className="profile-tabs profile-history-tabs" role="tablist" aria-label="Filtres historique">
            {Object.entries(HISTORY_SECTIONS).map(([key, section]) => {
              const SectionIcon = section.icon;
              return (
                <button
                  key={key}
                  className={`profile-tab profile-history-tab ${activeHistorySection === key ? "active" : ""}`}
                  type="button"
                  role="tab"
                  aria-selected={activeHistorySection === key}
                  onClick={() => setActiveHistorySection(key)}
                >
                  <SectionIcon />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>

          <section className="profile-history-section">
            <div className="profile-history-section-head">
              <h4><ActiveHistoryIcon /> {activeHistoryConfig.label}</h4>
              <div className="profile-history-page-meta">
                <span>{activeHistoryPaging.total} éléments</span>
                {activeHistoryPaging.pages > 1 ? (
                  <div className="profile-history-pager">
                    <button type="button" onClick={() => onChangeHistoryPage(activeHistorySection, -1)} disabled={activeHistoryPaging.page <= 1}>
                      Précédent
                    </button>
                    <span>{activeHistoryPaging.page}/{activeHistoryPaging.pages}</span>
                    <button type="button" onClick={() => onChangeHistoryPage(activeHistorySection, 1)} disabled={activeHistoryPaging.page >= activeHistoryPaging.pages}>
                      Suivant
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            {activeHistoryItems.length === 0 ? (
              <p className="profile-history-empty">{activeHistoryConfig.empty}</p>
            ) : (
              <div className="profile-history-list">
                {activeHistoryItems.map((item) => {
                  const details = formatHistoryDetails(item.details);
                  return (
                    <article className="profile-history-item" key={item.id}>
                      <div className="profile-history-item-main">
                        <div>
                          <strong>{item.title}</strong>
                          <p>{item.subtitle}</p>
                          {details ? <span>{details}</span> : null}
                        </div>
                        <div className="profile-history-meta">
                          <time>{formatHistoryDate(item.date)}</time>
                          <span className={getHistoryBadgeClass(item.status)}>{getHistoryBadgeLabel(item)}</span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </section>
  );
}

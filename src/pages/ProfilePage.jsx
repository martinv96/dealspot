import { useEffect, useMemo, useState } from "react";
import { FaUserCircle, FaPen, FaClock, FaCheckCircle, FaHistory, FaEnvelope, FaBullhorn, FaFlag } from "react-icons/fa";
import PrivateHeader from "../components/PrivateHeader";
import SiteFooter from "../components/SiteFooter";
import { useAuth } from "../context/useAuth";
import api from "../services/api";

const HISTORY_LIMIT = 5;

function formatMemberSince(dateValue) {
  if (!dateValue) return "Membre depuis date inconnue";

  const formatter = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric"
  });

  return "Membre depuis " + formatter.format(new Date(dateValue));
}

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();

  const initialForm = useMemo(
    () => ({
      pseudo: user?.pseudo || "",
      email: user?.email || "",
      telephone: user?.telephone || "",
      localisation: user?.localisation || ""
    }),
    [user]
  );

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("infos");
  const [history, setHistory] = useState({ compte: [], annonces: [], messages: [], signalements: [] });
  const [historyPagination, setHistoryPagination] = useState({
    compte: { page: 1, pages: 1, total: 0 },
    annonces: { page: 1, pages: 1, total: 0 },
    messages: { page: 1, pages: 1, total: 0 },
    signalements: { page: 1, pages: 1, total: 0 }
  });
  const [historyPages, setHistoryPages] = useState({
    compte: 1,
    annonces: 1,
    messages: 1,
    signalements: 1
  });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  useEffect(() => {
    setForm({
      pseudo: user?.pseudo || "",
      email: user?.email || "",
      telephone: user?.telephone || "",
      localisation: user?.localisation || ""
    });
  }, [user]);

  useEffect(() => {
    async function loadHistory() {
      if (activeTab !== "historique") {
        return;
      }

      setHistoryLoading(true);
      setHistoryError("");

      try {
        const { data } = await api.get("/auth/me/history", {
          params: {
            limit: HISTORY_LIMIT,
            comptePage: historyPages.compte,
            annoncesPage: historyPages.annonces,
            messagesPage: historyPages.messages,
            signalementsPage: historyPages.signalements
          }
        });
        setHistory({
          compte: data.history?.compte || [],
          annonces: data.history?.annonces || [],
          messages: data.history?.messages || [],
          signalements: data.history?.signalements || []
        });
        setHistoryPagination({
          compte: data.pagination?.compte || { page: 1, pages: 1, total: 0 },
          annonces: data.pagination?.annonces || { page: 1, pages: 1, total: 0 },
          messages: data.pagination?.messages || { page: 1, pages: 1, total: 0 },
          signalements: data.pagination?.signalements || { page: 1, pages: 1, total: 0 }
        });
      } catch (error) {
        setHistoryError(error?.response?.data?.message || "Impossible de charger l'historique.");
      } finally {
        setHistoryLoading(false);
      }
    }

    loadHistory();
  }, [activeTab, historyPages]);

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

    if (normalized.includes("lu") || normalized.includes("vérifi") || normalized.includes("verifi") || normalized.includes("actif") || normalized.includes("succès") || normalized.includes("active")) {
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
      if (status.includes("actif") || status.includes("succès")) return "Compte actif";
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

  function changeHistoryPage(section, delta) {
    setHistoryPages((prev) => {
      const current = prev[section] || 1;
      const nextPage = Math.max(1, current + delta);
      const maxPages = historyPagination[section]?.pages || 1;
      return {
        ...prev,
        [section]: Math.min(nextPage, maxPages)
      };
    });
  }

  function handleEditToggle() {
    if (isEditing) {
      setForm(initialForm);
      setProfileError("");
      setProfileSuccess("");
    }
    setIsEditing((prev) => !prev);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handlePasswordChange(event) {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileLoading(true);

    try {
      const response = await updateProfile(form);
      setForm({
        pseudo: response.user.pseudo || "",
        email: response.user.email || "",
        telephone: response.user.telephone || "",
        localisation: response.user.localisation || ""
      });
      setProfileSuccess("Informations mises à jour.");
      setIsEditing(false);
    } catch (error) {
      setProfileError(
        error?.response?.data?.message || "Impossible de mettre à jour le profil."
      );
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    setPasswordLoading(true);

    try {
      const response = await changePassword(passwordForm);
      setPasswordSuccess(response.message || "Mot de passe modifié.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordSuccess("");
      }, 1000);
    } catch (error) {
      setPasswordError(
        error?.response?.data?.message || "Impossible de modifier le mot de passe."
      );
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="page-shell">
      <PrivateHeader />

      <main className="page-main profile-page">
        <section className="profile-heading">
          <h1>Mon profil</h1>
          <p>Gérer vos informations personnelles</p>
        </section>

        <section className="profile-layout">
          <aside className="profile-card profile-summary">
            <div className="profile-avatar">
              <FaUserCircle />
            </div>

            <h2>{user?.pseudo || "Jean Dupont"}</h2>
            <p className="profile-member-since">
              {formatMemberSince(user?.date_inscription)}
            </p>

            <ul className="profile-stats">
              <li>
                <span><FaPen /> Annonces actives</span>
                <strong>1</strong>
              </li>
              <li>
                <span><FaCheckCircle /> Annonces vendues</span>
                <strong>1</strong>
              </li>
              <li>
                <span><FaClock /> Annonces archivées</span>
                <strong>1</strong>
              </li>
            </ul>
          </aside>

          <section className="profile-content">
            <div className="profile-tabs">
              <button className={`profile-tab ${activeTab === "infos" ? "active" : ""}`} type="button" onClick={() => setActiveTab("infos")}>
                Informations
              </button>
              <button className={`profile-tab ${activeTab === "historique" ? "active" : ""}`} type="button" onClick={() => setActiveTab("historique")}>
                Historique
              </button>
            </div>

            {activeTab === "infos" ? (
              <form className="profile-card" onSubmit={handleProfileSubmit}>
                <div className="profile-card-head">
                  <h3>Informations personnelles</h3>

                  <button className="btn btn-outline" type="button" onClick={handleEditToggle}>
                    {isEditing ? "Annuler" : "Modifier"}
                  </button>
                </div>

                <div className="profile-form">
                  <div>
                    <label>Nom complet</label>
                    <input
                      type="text"
                      name="pseudo"
                      value={form.pseudo}
                      onChange={handleChange}
                      placeholder="Ex: Alain Dupont"
                      readOnly={!isEditing}
                    />
                  </div>

                  <div>
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Ex: alaindupont@mail.fr"
                      readOnly={!isEditing}
                    />
                  </div>

                  <div>
                    <label>Téléphone</label>
                    <input
                      type="text"
                      name="telephone"
                      value={form.telephone}
                      onChange={handleChange}
                      placeholder="Ex: 07 52 45 52 26"
                      readOnly={!isEditing}
                    />
                  </div>

                  <div>
                    <label>Localisation</label>
                    <input
                      type="text"
                      name="localisation"
                      value={form.localisation}
                      onChange={handleChange}
                      placeholder="Ex: Paris 12eme"
                      readOnly={!isEditing}
                    />
                  </div>
                </div>

                {profileError ? <p className="form-error">{profileError}</p> : null}
                {profileSuccess ? <p className="form-success">{profileSuccess}</p> : null}

                <div className="profile-actions">
                  {isEditing ? (
                    <button className="btn btn-primary" disabled={profileLoading} type="submit">
                      {profileLoading ? "Enregistrement..." : "Enregistrer"}
                    </button>
                  ) : null}

                  <button
                    className="btn btn-profile-password"
                    type="button"
                    onClick={() => setIsPasswordModalOpen(true)}
                  >
                    Changer le mot de passe
                  </button>
                </div>
              </form>
            ) : (
              <section className="profile-card profile-history-card">
                <div className="profile-card-head">
                  <h3>Historique d'activité</h3>
                  <p className="profile-history-note">Dernières actions avec dates et statuts</p>
                </div>

                {historyLoading ? <p className="center-loader">Chargement de l'historique...</p> : null}
                {historyError ? <p className="form-error">{historyError}</p> : null}

                {!historyLoading && !historyError ? (
                  <div className="profile-history-sections">
                    <section className="profile-history-section">
                      <div className="profile-history-section-head">
                        <h4><FaHistory /> Compte</h4>
                        <div className="profile-history-page-meta">
                          <span>{historyPagination.compte.total} éléments</span>
                          {historyPagination.compte.pages > 1 ? (
                            <div className="profile-history-pager">
                              <button type="button" onClick={() => changeHistoryPage("compte", -1)} disabled={historyPagination.compte.page <= 1}>
                                Précédent
                              </button>
                              <span>{historyPagination.compte.page}/{historyPagination.compte.pages}</span>
                              <button type="button" onClick={() => changeHistoryPage("compte", 1)} disabled={historyPagination.compte.page >= historyPagination.compte.pages}>
                                Suivant
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                      {history.compte.length === 0 ? (
                        <p className="profile-history-empty">Aucune activité de compte pour le moment.</p>
                      ) : (
                        <div className="profile-history-list">
                          {history.compte.map((item) => (
                            <article className="profile-history-item" key={item.id}>
                              <div className="profile-history-item-main">
                                <div>
                                  <strong>{item.title}</strong>
                                  <p>{item.subtitle}</p>
                                  {item.details ? <span>{typeof item.details === "string" ? item.details : JSON.stringify(item.details)}</span> : null}
                                </div>
                                <div className="profile-history-meta">
                                  <time>{formatHistoryDate(item.date)}</time>
                                  <span className={getHistoryBadgeClass(item.status)}>{getHistoryBadgeLabel(item)}</span>
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </section>

                    <section className="profile-history-section">
                      <div className="profile-history-section-head">
                        <h4><FaBullhorn /> Annonces</h4>
                        <div className="profile-history-page-meta">
                          <span>{historyPagination.annonces.total} éléments</span>
                          {historyPagination.annonces.pages > 1 ? (
                            <div className="profile-history-pager">
                              <button type="button" onClick={() => changeHistoryPage("annonces", -1)} disabled={historyPagination.annonces.page <= 1}>
                                Précédent
                              </button>
                              <span>{historyPagination.annonces.page}/{historyPagination.annonces.pages}</span>
                              <button type="button" onClick={() => changeHistoryPage("annonces", 1)} disabled={historyPagination.annonces.page >= historyPagination.annonces.pages}>
                                Suivant
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                      {history.annonces.length === 0 ? (
                        <p className="profile-history-empty">Aucune annonce publiée pour le moment.</p>
                      ) : (
                        <div className="profile-history-list">
                          {history.annonces.map((item) => (
                            <article className="profile-history-item" key={item.id}>
                              <div className="profile-history-item-main">
                                <div>
                                  <strong>{item.title}</strong>
                                  <p>{item.subtitle}</p>
                                  {item.details ? <span>{item.details}</span> : null}
                                </div>
                                <div className="profile-history-meta">
                                  <time>{formatHistoryDate(item.date)}</time>
                                  <span className={getHistoryBadgeClass(item.status)}>{getHistoryBadgeLabel(item)}</span>
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </section>

                    <section className="profile-history-section">
                      <div className="profile-history-section-head">
                        <h4><FaEnvelope /> Messages</h4>
                        <div className="profile-history-page-meta">
                          <span>{historyPagination.messages.total} éléments</span>
                          {historyPagination.messages.pages > 1 ? (
                            <div className="profile-history-pager">
                              <button type="button" onClick={() => changeHistoryPage("messages", -1)} disabled={historyPagination.messages.page <= 1}>
                                Précédent
                              </button>
                              <span>{historyPagination.messages.page}/{historyPagination.messages.pages}</span>
                              <button type="button" onClick={() => changeHistoryPage("messages", 1)} disabled={historyPagination.messages.page >= historyPagination.messages.pages}>
                                Suivant
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                      {history.messages.length === 0 ? (
                        <p className="profile-history-empty">Aucun message récent.</p>
                      ) : (
                        <div className="profile-history-list">
                          {history.messages.map((item) => (
                            <article className="profile-history-item" key={item.id}>
                              <div className="profile-history-item-main">
                                <div>
                                  <strong>{item.title}</strong>
                                  <p>{item.subtitle}</p>
                                  {item.details ? <span>{item.details}</span> : null}
                                </div>
                                <div className="profile-history-meta">
                                  <time>{formatHistoryDate(item.date)}</time>
                                  <span className={getHistoryBadgeClass(item.status)}>{getHistoryBadgeLabel(item)}</span>
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </section>

                    <section className="profile-history-section">
                      <div className="profile-history-section-head">
                        <h4><FaFlag /> Signalements</h4>
                        <div className="profile-history-page-meta">
                          <span>{historyPagination.signalements.total} éléments</span>
                          {historyPagination.signalements.pages > 1 ? (
                            <div className="profile-history-pager">
                              <button type="button" onClick={() => changeHistoryPage("signalements", -1)} disabled={historyPagination.signalements.page <= 1}>
                                Précédent
                              </button>
                              <span>{historyPagination.signalements.page}/{historyPagination.signalements.pages}</span>
                              <button type="button" onClick={() => changeHistoryPage("signalements", 1)} disabled={historyPagination.signalements.page >= historyPagination.signalements.pages}>
                                Suivant
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                      {history.signalements.length === 0 ? (
                        <p className="profile-history-empty">Aucun signalement envoyé.</p>
                      ) : (
                        <div className="profile-history-list">
                          {history.signalements.map((item) => (
                            <article className="profile-history-item" key={item.id}>
                              <div className="profile-history-item-main">
                                <div>
                                  <strong>{item.title}</strong>
                                  <p>{item.subtitle}</p>
                                  {item.details ? <span>{item.details}</span> : null}
                                </div>
                                <div className="profile-history-meta">
                                  <time>{formatHistoryDate(item.date)}</time>
                                  <span className={getHistoryBadgeClass(item.status)}>{getHistoryBadgeLabel(item)}</span>
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </section>
                  </div>
                ) : null}
              </section>
            )}
          </section>
        </section>
      </main>

      <SiteFooter />

      {isPasswordModalOpen ? (
        <div className="modal-backdrop" onClick={() => setIsPasswordModalOpen(false)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <h3>Changer le mot de passe</h3>
            <p>Saisissez votre mot de passe actuel puis le nouveau.</p>

            <form className="password-modal-form" onSubmit={handlePasswordSubmit}>
              <div>
                <label>Mot de passe actuel</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div>
                <label>Nouveau mot de passe</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div>
                <label>Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              {passwordError ? <p className="form-error">{passwordError}</p> : null}
              {passwordSuccess ? <p className="form-success">{passwordSuccess}</p> : null}

              <div className="modal-actions">
                <button
                  className="btn btn-outline"
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                >
                  Annuler
                </button>

                <button className="btn btn-primary" disabled={passwordLoading} type="submit">
                  {passwordLoading ? "Modification..." : "Valider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
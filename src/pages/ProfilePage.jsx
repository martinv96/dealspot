import { useEffect, useMemo, useState } from "react";
import PrivateHeader from "../components/PrivateHeader";
import SiteFooter from "../components/SiteFooter";
import ChangePasswordModal from "../components/profile/ChangePasswordModal";
import ProfileHistoryCard from "../components/profile/ProfileHistoryCard";
import ProfileInfoCard from "../components/profile/ProfileInfoCard";
import ProfileSummaryCard from "../components/profile/ProfileSummaryCard";
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
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryCounts, setSummaryCounts] = useState({
    active: 0,
    vendues: 0,
    brouillon: 0
  });
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
    async function loadSummaryCounts() {
      setSummaryLoading(true);

      try {
        const { data } = await api.get("/annonces/me", {
          params: { limit: 500 }
        });
        const annonces = Array.isArray(data?.annonces) ? data.annonces : [];

        setSummaryCounts({
          active: annonces.filter((annonce) => annonce?.statut === "active").length,
          vendues: annonces.filter((annonce) => annonce?.statut === "expirée" || annonce?.statut === "expiree").length,
          brouillon: annonces.filter((annonce) => annonce?.statut === "brouillon").length
        });
      } catch {
        setSummaryCounts({ active: 0, vendues: 0, brouillon: 0 });
      } finally {
        setSummaryLoading(false);
      }
    }

    loadSummaryCounts();
  }, [user?.id]);

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
          <ProfileSummaryCard
            user={user}
            formatMemberSince={formatMemberSince}
            summaryLoading={summaryLoading}
            summaryCounts={summaryCounts}
          />

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
              <ProfileInfoCard
                isEditing={isEditing}
                form={form}
                profileError={profileError}
                profileSuccess={profileSuccess}
                profileLoading={profileLoading}
                onEditToggle={handleEditToggle}
                onChange={handleChange}
                onSubmit={handleProfileSubmit}
                onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
              />
            ) : (
              <ProfileHistoryCard
                history={history}
                historyPagination={historyPagination}
                historyLoading={historyLoading}
                historyError={historyError}
                onChangeHistoryPage={changeHistoryPage}
              />
            )}
          </section>
        </section>
      </main>

      <SiteFooter />

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        passwordForm={passwordForm}
        passwordError={passwordError}
        passwordSuccess={passwordSuccess}
        passwordLoading={passwordLoading}
        onChange={handlePasswordChange}
        onSubmit={handlePasswordSubmit}
      />
    </div>
  );
}
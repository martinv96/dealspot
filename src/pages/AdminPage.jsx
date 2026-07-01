import { useEffect, useMemo, useState } from "react";
import AdminAnnoncesTab from "../components/admin/AdminAnnoncesTab";
import AdminStatsTab from "../components/admin/AdminStatsTab";
import AdminUsersTab from "../components/admin/AdminUsersTab";
import PrivateHeader from "../components/PrivateHeader";
import SiteFooter from "../components/SiteFooter";
import api from "../services/api";

const STATUS_OPTIONS = ["active", "brouillon", "expirée"];
const CATEGORY_OPTIONS = ["meubles", "electronique", "mode", "sport", "jeux-loisirs", "autres"];

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleDateString("fr-FR");
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("fr-FR");
}

function defaultAnnonceFilters() {
  return {
    query: "",
    statut: "",
    categorie: ""
  };
}

function defaultUserFilters() {
  return {
    query: "",
    role: "",
    blockedOnly: false
  };
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("stats");

  const [statsState, setStatsState] = useState({ loaded: false, loading: false, error: "", data: null });

  const [annonceFilters, setAnnonceFilters] = useState(defaultAnnonceFilters);
  const [annonceState, setAnnonceState] = useState({
    loaded: false,
    loading: false,
    error: "",
    page: 1,
    pages: 1,
    total: 0,
    annonces: []
  });

  const [userFilters, setUserFilters] = useState(defaultUserFilters);
  const [userState, setUserState] = useState({
    loaded: false,
    loading: false,
    error: "",
    page: 1,
    pages: 1,
    total: 0,
    users: []
  });

  const [editingAnnonceId, setEditingAnnonceId] = useState(null);
  const [editingAnnonceForm, setEditingAnnonceForm] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  async function loadStats({ force = false } = {}) {
    if (statsState.loaded && !force) {
      return;
    }

    setStatsState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const response = await api.get("/admin/stats");
      setStatsState({ loaded: true, loading: false, error: "", data: response.data });
    } catch (error) {
      setStatsState({
        loaded: true,
        loading: false,
        error: error?.response?.data?.message || "Impossible de charger les statistiques.",
        data: null
      });
    }
  }

  async function loadAnnonces({ page = 1, force = false } = {}) {
    if (annonceState.loading || (annonceState.loaded && !force && page === annonceState.page)) {
      return;
    }

    setAnnonceState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const response = await api.get("/admin/annonces", {
        params: {
          page,
          limit: 12,
          query: annonceFilters.query || undefined,
          statut: annonceFilters.statut || undefined,
          categorie: annonceFilters.categorie || undefined
        }
      });

      setAnnonceState({
        loaded: true,
        loading: false,
        error: "",
        page: response.data?.page || 1,
        pages: response.data?.pages || 1,
        total: response.data?.total || 0,
        annonces: response.data?.annonces || []
      });
    } catch (error) {
      setAnnonceState((current) => ({
        ...current,
        loaded: true,
        loading: false,
        error: error?.response?.data?.message || "Impossible de charger les annonces."
      }));
    }
  }

  async function loadUsers({ page = 1, force = false } = {}) {
    if (userState.loading || (userState.loaded && !force && page === userState.page)) {
      return;
    }

    setUserState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const response = await api.get("/admin/users", {
        params: {
          page,
          limit: 12,
          query: userFilters.query || undefined,
          role: userFilters.role || undefined,
          blockedOnly: userFilters.blockedOnly || undefined
        }
      });

      setUserState({
        loaded: true,
        loading: false,
        error: "",
        page: response.data?.page || 1,
        pages: response.data?.pages || 1,
        total: response.data?.total || 0,
        users: response.data?.users || []
      });
    } catch (error) {
      setUserState((current) => ({
        ...current,
        loaded: true,
        loading: false,
        error: error?.response?.data?.message || "Impossible de charger les utilisateurs."
      }));
    }
  }

  useEffect(() => {
    if (activeTab === "stats") {
      loadStats();
    }

    if (activeTab === "annonces") {
      loadAnnonces({ page: 1 });
    }

    if (activeTab === "users") {
      loadUsers({ page: 1 });
    }
  }, [activeTab]);

  const statsCards = useMemo(() => {
    const users = statsState.data?.users || {};
    const annonces = statsState.data?.annonces || {};

    return [
      { label: "Utilisateurs", value: formatNumber(users.total) },
      { label: "Utilisateurs bloqués", value: formatNumber(users.blocked) },
      { label: "Annonces totales", value: formatNumber(annonces.total) },
      { label: "Annonces actives", value: formatNumber(annonces.byStatus?.active || 0) }
    ];
  }, [statsState.data]);

  function clearFeedback() {
    setActionMessage("");
    setActionError("");
  }

  function openAnnonceEdit(annonce) {
    clearFeedback();
    setEditingAnnonceId(annonce.id);
    setEditingAnnonceForm({
      titre: annonce.titre || "",
      description: annonce.description || "",
      prix: annonce.prix || "",
      categorie: annonce.categorie || "",
      localisation: annonce.localisation || "",
      statut: annonce.statut || "active"
    });
  }

  function closeAnnonceEdit() {
    setEditingAnnonceId(null);
    setEditingAnnonceForm(null);
  }

  async function handleSaveAnnonce() {
    if (!editingAnnonceId || !editingAnnonceForm) {
      return;
    }

    clearFeedback();

    try {
      const response = await api.patch("/admin/annonces/" + editingAnnonceId, editingAnnonceForm);
      const updatedAnnonce = response.data?.annonce;

      setAnnonceState((current) => ({
        ...current,
        annonces: current.annonces.map((annonce) =>
          annonce.id === editingAnnonceId ? { ...annonce, ...updatedAnnonce } : annonce
        )
      }));

      setActionMessage("Annonce mise à jour.");
      closeAnnonceEdit();
    } catch (error) {
      setActionError(error?.response?.data?.message || "Impossible de modifier l'annonce.");
    }
  }

  async function handleDeleteAnnonce(annonceId) {
    const confirmed = window.confirm("Supprimer cette annonce ?");
    if (!confirmed) {
      return;
    }

    clearFeedback();

    try {
      await api.delete("/admin/annonces/" + annonceId);

      setAnnonceState((current) => ({
        ...current,
        total: Math.max(0, current.total - 1),
        annonces: current.annonces.filter((annonce) => annonce.id !== annonceId)
      }));

      if (editingAnnonceId === annonceId) {
        closeAnnonceEdit();
      }

      setActionMessage("Annonce supprimée.");
    } catch (error) {
      setActionError(error?.response?.data?.message || "Impossible de supprimer l'annonce.");
    }
  }

  async function handleToggleUserBlock(user) {
    const shouldBlock = !user.is_blocked;
    const reason = shouldBlock
      ? window.prompt("Raison du blocage (optionnel)", "Non-respect des règles") || ""
      : "";

    clearFeedback();

    try {
      const response = await api.patch("/admin/users/" + user.id + "/block", {
        blocked: shouldBlock,
        reason
      });

      const nextBlocked = response.data?.user?.is_blocked;
      const nextReason = response.data?.user?.blocked_reason || null;
      const nextDate = response.data?.user?.blocked_at || null;

      setUserState((current) => ({
        ...current,
        users: current.users.map((item) =>
          item.id === user.id
            ? {
                ...item,
                is_blocked: nextBlocked,
                blocked_reason: nextReason,
                blocked_at: nextDate
              }
            : item
        )
      }));

      setActionMessage(shouldBlock ? "Utilisateur bloqué." : "Utilisateur débloqué.");
      loadStats({ force: true });
    } catch (error) {
      setActionError(error?.response?.data?.message || "Impossible de mettre à jour cet utilisateur.");
    }
  }

  async function handleDeleteUser(userId) {
    const confirmed = window.confirm("Supprimer cet utilisateur et ses données associées ?");
    if (!confirmed) {
      return;
    }

    clearFeedback();

    try {
      await api.delete("/admin/users/" + userId);

      setUserState((current) => ({
        ...current,
        total: Math.max(0, current.total - 1),
        users: current.users.filter((user) => user.id !== userId)
      }));

      setActionMessage("Utilisateur supprimé.");
      loadStats({ force: true });
    } catch (error) {
      setActionError(error?.response?.data?.message || "Impossible de supprimer cet utilisateur.");
    }
  }

  return (
    <div className="page-shell">
      <PrivateHeader />

      <main className="page-main admin-page">
        <section className="admin-head">
          <h1>Administrateur</h1>
          <p>Gestion des annonces, des utilisateurs et statistiques globales.</p>
        </section>

        <section className="admin-tabs" aria-label="Navigation administrateur">
          <button
            type="button"
            className={"admin-tab" + (activeTab === "stats" ? " active" : "")}
            onClick={() => setActiveTab("stats")}
          >
            Statistiques
          </button>
          <button
            type="button"
            className={"admin-tab" + (activeTab === "annonces" ? " active" : "")}
            onClick={() => setActiveTab("annonces")}
          >
            Annonces
          </button>
          <button
            type="button"
            className={"admin-tab" + (activeTab === "users" ? " active" : "")}
            onClick={() => setActiveTab("users")}
          >
            Utilisateurs
          </button>
        </section>

        {actionMessage ? <p className="form-success">{actionMessage}</p> : null}
        {actionError ? <p className="form-error">{actionError}</p> : null}

        {activeTab === "stats" ? (
          <AdminStatsTab
            loading={statsState.loading}
            error={statsState.error}
            data={statsState.data}
            statsCards={statsCards}
            onRefresh={() => loadStats({ force: true })}
            formatNumber={formatNumber}
          />
        ) : null}

        {activeTab === "annonces" ? (
          <AdminAnnoncesTab
            filters={annonceFilters}
            setFilters={setAnnonceFilters}
            state={annonceState}
            editingAnnonceId={editingAnnonceId}
            editingAnnonceForm={editingAnnonceForm}
            setEditingAnnonceForm={setEditingAnnonceForm}
            onSubmitFilters={(event) => {
              event.preventDefault();
              loadAnnonces({ page: 1, force: true });
            }}
            onOpenEdit={openAnnonceEdit}
            onSaveEdit={handleSaveAnnonce}
            onCloseEdit={closeAnnonceEdit}
            onDeleteAnnonce={handleDeleteAnnonce}
            onPreviousPage={() => loadAnnonces({ page: annonceState.page - 1, force: true })}
            onNextPage={() => loadAnnonces({ page: annonceState.page + 1, force: true })}
            formatDate={formatDate}
            formatNumber={formatNumber}
            categoryOptions={CATEGORY_OPTIONS}
            statusOptions={STATUS_OPTIONS}
          />
        ) : null}

        {activeTab === "users" ? (
          <AdminUsersTab
            filters={userFilters}
            setFilters={setUserFilters}
            state={userState}
            onSubmitFilters={(event) => {
              event.preventDefault();
              loadUsers({ page: 1, force: true });
            }}
            onToggleUserBlock={handleToggleUserBlock}
            onDeleteUser={handleDeleteUser}
            onPreviousPage={() => loadUsers({ page: userState.page - 1, force: true })}
            onNextPage={() => loadUsers({ page: userState.page + 1, force: true })}
            formatDate={formatDate}
            formatNumber={formatNumber}
          />
        ) : null}
      </main>

      <SiteFooter />
    </div>
  );
}

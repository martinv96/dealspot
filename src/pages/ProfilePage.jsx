import { useEffect, useMemo, useState } from "react";
import { FaUserCircle, FaPen, FaClock, FaCheckCircle } from "react-icons/fa";
import PrivateHeader from "../components/PrivateHeader";
import SiteFooter from "../components/SiteFooter";
import { useAuth } from "../context/AuthContext";

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

  useEffect(() => {
    setForm({
      pseudo: user?.pseudo || "",
      email: user?.email || "",
      telephone: user?.telephone || "",
      localisation: user?.localisation || ""
    });
  }, [user]);

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
              <button className="profile-tab active" type="button">
                Informations
              </button>
              <button className="profile-tab" type="button">
                Historique
              </button>
            </div>

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
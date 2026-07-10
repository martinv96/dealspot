import { useState } from "react";
import { Link } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import SiteFooter from "../components/SiteFooter";
import { useAuth } from "../context/useAuth";
import { validateRegisterForm } from "../utils/validation";

export default function RegisterPage() {
  const { register } = useAuth();

  const [form, setForm] = useState({
    pseudo: "",
    email: "",
    localisation: "",
    role: "acheteur",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setInfoMessage("");

    const nextError = validateRegisterForm(form);
    setError(nextError);
    if (nextError) {
      return;
    }

    setLoading(true);
    try {
      const { data } = await register({
        pseudo: form.pseudo,
        email: form.email,
        localisation: form.localisation,
        role: form.role,
        password: form.password
      });
      setError("");
      setInfoMessage(
        data?.message ||
          "Inscription réussie. Vérifiez votre boîte mail et cliquez sur le lien de vérification avant de vous connecter."
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Inscription impossible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell auth-page">
      <PublicHeader />

      <main className="page-main auth-main">
        <h2 className="auth-title">Inscription</h2>
        <p className="auth-subtitle">Créer votre compte gratuitement</p>

        <form className="auth-card auth-card-wide" onSubmit={handleSubmit}>
          <h3>Créer un compte</h3>
          <p>Remplissez les informations ci-dessous pour vous inscrire</p>

          <div className="auth-grid">
            <div>
              <label>Nom complet</label>
              <input
                type="text"
                name="pseudo"
                value={form.pseudo}
                onChange={handleChange}
                placeholder="Ex: Martin Vallée"
                required
              />
            </div>

            <div>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Ex: martinv@email.fr"
                required
              />
            </div>

            <div>
              <label>Localisation</label>
              <input
                type="text"
                name="localisation"
                value={form.localisation}
                onChange={handleChange}
                placeholder="Ex: Paris 12ème"
              />
            </div>

            <div>
              <label>Je suis un</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                required
              >
                <option value="acheteur">Acheteur</option>
                <option value="vendeur">Vendeur</option>
              </select>
            </div>

            <div>
              <label>Mot de passe</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••••"
                required
              />
            </div>

            <div>
              <label>Confirmer le mot de passe</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••••"
                required
              />
            </div>
          </div>

          {infoMessage && <div className="form-success">{infoMessage}</div>}
          {error && <div className="form-error">{error}</div>}

          <button className="btn btn-auth" disabled={loading} type="submit">
            {loading ? "Création..." : "Créer mon compte"}
          </button>

          <p className="auth-bottom">
            Vous avez déjà un compte ? <Link to="/login">Se connecter</Link>
          </p>
        </form>
      </main>

      <SiteFooter />
    </div>
  );
}
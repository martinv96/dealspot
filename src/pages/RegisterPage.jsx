import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import SiteFooter from "../components/SiteFooter";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    pseudo: "",
    email: "",
    localisation: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      await register({
        pseudo: form.pseudo,
        email: form.email,
        localisation: form.localisation,
        password: form.password
      });
      navigate("/connexion");
    } catch (err) {
      setError(err?.response?.data?.message || "Inscription impossible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell auth-page">
      <PublicHeader />

      <main className="auth-main">
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
                placeholder="Ex: Alain Dupont"
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
                placeholder="Ex: alain.dupont@mail.fr"
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
                placeholder="Ex: Paris 12eme"
              />
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

          {error && <div className="form-error">{error}</div>}

          <button className="btn btn-auth" disabled={loading} type="submit">
            {loading ? "Creation..." : "Créer mon compte"}
          </button>

          <p className="auth-bottom">
            Vous avez déjà un compte ? <Link to="/connexion">Se connecter</Link>
          </p>
        </form>
      </main>

      <SiteFooter />
    </div>
  );
}
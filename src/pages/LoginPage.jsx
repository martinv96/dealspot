import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import SiteFooter from "../components/SiteFooter";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form);
      navigate("/app");
    } catch (err) {
      setError(err?.response?.data?.message || "Connexion impossible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell auth-page">
      <PublicHeader />

      <main className="auth-main">
        <h2 className="auth-title">Connexion</h2>
        <p className="auth-subtitle">Accéder à votre compte DealSpot</p>

        <form className="auth-card" onSubmit={handleSubmit}>
          <h3>Se connecter</h3>
          <p>Entrez vos identifiants pour continuer</p>

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Ex: elain.dupont@mail.fr"
            required
          />

          <label>Mot de passe</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••••"
            required
          />

          {error && <div className="form-error">{error}</div>}

          <button className="btn btn-auth" disabled={loading} type="submit">
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          <p className="auth-bottom">
            Vous n'avez pas de compte ? <Link to="/inscription">Créer un compte</Link>
          </p>
        </form>
      </main>

      <SiteFooter />
    </div>
  );
}
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import SiteFooter from "../components/SiteFooter";
import { useAuth } from "../context/useAuth";
import { validateLoginForm } from "../utils/validation";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const infoMessage = location.state?.info || "";
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nextError = validateLoginForm(form);
    setError(nextError);
    if (nextError) {
      return;
    }

    setLoading(true);

    try {
      await login(form);
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Connexion impossible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell auth-page">
      <PublicHeader />

      <main className="page-main auth-main">
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
            placeholder="Ex: martinv@email.fr"
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

          {infoMessage && <div className="form-success">{infoMessage}</div>}
          {error && <div className="form-error">{error}</div>}

          <button className="btn btn-auth" disabled={loading} type="submit">
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          <p className="auth-bottom">
            <Link to="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
          </p>

          <p className="auth-bottom">
            Vous n'avez pas de compte ? <Link to="/register">Créer un compte</Link>
          </p>
        </form>
      </main>

      <SiteFooter />
    </div>
  );
}
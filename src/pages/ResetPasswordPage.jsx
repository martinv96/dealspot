import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import SiteFooter from "../components/SiteFooter";
import api from "../services/api";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Le token de reinitialisation est manquant.");
      return;
    }

    if (!form.newPassword || !form.confirmPassword) {
      setError("Veuillez renseigner les deux champs mot de passe.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("La confirmation du mot de passe ne correspond pas.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/auth/reset-password", {
        token,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword
      });
      setSuccess(data?.message || "Mot de passe reinitialise avec succes.");
      setForm({ newPassword: "", confirmPassword: "" });
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Reinitialisation impossible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell auth-page">
      <PublicHeader />

      <main className="page-main auth-main">
        <form className="auth-card auth-card-wide" onSubmit={handleSubmit}>
          <h3>Reinitialiser le mot de passe</h3>
          <p>Choisissez votre nouveau mot de passe.</p>

          <label>Nouveau mot de passe</label>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            placeholder="••••••••••"
            required
          />

          <label>Confirmer le mot de passe</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••••"
            required
          />

          {error ? <p className="form-error">{error}</p> : null}
          {success ? <p className="form-success">{success}</p> : null}

          <button className="btn btn-auth" disabled={loading} type="submit">
            {loading ? "Reinitialisation..." : "Reinitialiser"}
          </button>

          <p className="auth-bottom">
            <Link to="/connexion">Retour a la connexion</Link>
          </p>
        </form>
      </main>

      <SiteFooter />
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import SiteFooter from "../components/SiteFooter";
import api from "../services/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Veuillez renseigner votre email.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/auth/forgot-password", { email: email.trim() });
      setSuccess(data?.message || "Si un compte existe, un email a ete envoye.");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Demande impossible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell auth-page">
      <PublicHeader />

      <main className="page-main auth-main">
        <form className="auth-card auth-card-wide" onSubmit={handleSubmit}>
          <h3>Mot de passe oublie</h3>
          <p>Entrez votre email pour recevoir un lien de reinitialisation.</p>

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ex: martinv@email.fr"
            required
          />

          {error ? <p className="form-error">{error}</p> : null}
          {success ? <p className="form-success">{success}</p> : null}

          <button className="btn btn-auth" disabled={loading} type="submit">
            {loading ? "Envoi..." : "Envoyer le lien"}
          </button>

          <p className="auth-bottom">
            <Link to="/login">Retour a la connexion</Link>
          </p>
        </form>
      </main>

      <SiteFooter />
    </div>
  );
}

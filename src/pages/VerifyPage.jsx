import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import SiteFooter from "../components/SiteFooter";
import api from "../services/api";

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const hasRequestedRef = useRef(false);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Vérification de votre email en cours...");

  useEffect(() => {
    if (hasRequestedRef.current) {
      return;
    }

    hasRequestedRef.current = true;

    async function verify() {
      const token = searchParams.get("token") || "";
      if (!token) {
        setStatus("error");
        setMessage("Le lien de vérification est invalide.");
        return;
      }

      try {
        const { data } = await api.get("/auth/verify", { params: { token } });
        setStatus("success");
        setMessage(data?.message || "Adresse email vérifiée avec succès.");
      } catch (error) {
        setStatus("error");
        setMessage(error?.response?.data?.message || "Le lien de vérification est invalide ou expiré.");
      }
    }

    verify();
  }, [searchParams]);

  return (
    <div className="page-shell auth-page">
      <PublicHeader />

      <main className="page-main auth-main">
        <div className="auth-card auth-card-wide">
          <h3>Vérification de l'email</h3>
          <p>{message}</p>

          {status === "loading" ? <p className="center-loader" style={{ minHeight: "auto" }}>Vérification...</p> : null}
          {status === "error" ? <p className="form-error">{message}</p> : null}
          {status === "success" ? <p className="form-success">{message}</p> : null}

          <p className="auth-bottom">
            <Link to="/connexion">Retour à la connexion</Link>
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

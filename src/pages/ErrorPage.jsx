import { Link, useLocation } from "react-router-dom";

const ERROR_PAGES = {
    403: {
        title: "Accès refusé",
        subtitle: "Vous n'avez pas les droits pour accéder à cette page.",
        message:
            "Il semble que vous n'ayez pas la permission nécessaire pour continuer. Si vous pensez que c'est une erreur, contactez-nous.",
        actionLabel: "Retour à l'accueil"
    },
    404: {
        title: "Page introuvable",
        subtitle: "La page que vous recherchez n'existe pas.",
        message: "L'URL que vous recherchez est introuvable ou a peut-être été déplacée.",
        actionLabel: "Retour à l'accueil"
    },
    429: {
        title: "Trop de requêtes",
        subtitle: "Vous avez atteint la limite de requêtes.",
        message: "Nous avons reçu trop de requêtes dans un court laps de temps. Par mesure de sécurité, l'accès est temporairement limité.",
        actionLabel:"Retour à l'accueil"
    },
    500: {
        title: "Erreur serveur",
        subtitle:"Un problème serveur est survenu.",
        message: "Une erreur inattendue est survenue dans le serveur. Veuillez réessayer dans quelques instants.",
        actionLabel: "Retour à l'accueil"
    },
    default: {
        title: "Oups... une erreur est survenue",
        subtitle:"Quelque chose ne s'est pas passé comme prévu.",
        message: "Nous avons rencontré un problème. Vous pouvez retourner à l'accueil ou nous contacter si nécessaire.",
        actionLabel: "Retour à l'accueil"
    }
};

function ErrorPage({ status = "404" }) {
    const location = useLocation();
    const errorInfo = ERROR_PAGES[status] || ERROR_PAGES.default;
    const currentPath = location.pathname;

    return (
        <div className="page-shell error-shell">
            <main className="page-main error-main">
                <div className="error-card">
                    <div className="error-code">{status}</div>
                    <h1 className="error-title">{errorInfo.title}</h1>
                    <p className="error-subtitle">{errorInfo.subtitle}</p>

                    <p className="error-text">
                        {status === "404" ? `La page "${currentPath}" est introuvable.` : errorInfo.message}
                    </p>

                    <div className="error-actions">
                        <Link to="/" className="btn btn-primary">
                            {errorInfo.actionLabel}
                        </Link>
                        <Link to="/contact" className="btn btn-outline">
                            Nous contacter
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

export function Error403Page() {
    return <ErrorPage status="403" />;
}

export function Error404Page() {
    return <ErrorPage status="404" />;
}

export function Error429Page() {
    return <ErrorPage status="429" />;
}

export function Error500Page() {
    return <ErrorPage status="500" />;
}

export function ErrorDefaultPage() {
    return <ErrorPage status="default" />;
}

export default ErrorPage;
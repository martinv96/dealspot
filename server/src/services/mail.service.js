import nodemailer from "nodemailer";

function parseMailerDsn(rawDsn) {
  const dsn = String(rawDsn || "").trim();
  if (!dsn) return null;

  try {
    const url = new URL(dsn);
    const protocol = (url.protocol || "").replace(":", "").toLowerCase();
    if (protocol !== "smtp" && protocol !== "smtps") {
      return null;
    }

    const host = url.hostname;
    const port = url.port ? Number(url.port) : protocol === "smtps" ? 465 : 587;
    const user = decodeURIComponent(url.username || "");
    const pass = decodeURIComponent(url.password || "");

    if (!host || !port || !user || !pass) {
      return null;
    }

    return {
      host,
      port,
      user,
      pass,
      secure: protocol === "smtps" || port === 465
    };
  } catch {
    return null;
  }
}

function getMailConfig() {
  const dsnConfig = parseMailerDsn(process.env.MAILER_DSN);
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const adminEmail = process.env.ADMIN_EMAIL;
  const from = process.env.MAILER_FROM || process.env.MAIL_FROM || dsnConfig?.user || user;

  if (dsnConfig) {
    return {
      host: dsnConfig.host,
      port: dsnConfig.port,
      user: dsnConfig.user,
      pass: dsnConfig.pass,
      secure: dsnConfig.secure,
      adminEmail,
      from
    };
  }

  return { host, port, user, pass, secure: port === 465, adminEmail, from };
}

function isMailConfigured(config) {
  return Boolean(config.host && config.port && config.user && config.pass && config.from);
}

function createTransporter(config) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: Boolean(config.secure),
    family: 4,
    auth: {
      user: config.user,
      pass: config.pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

function getFrontendUrl() {
  return process.env.FRONTEND_URL || "http://localhost:5173";
}

function generateReportEmailHTML({ report, annonce, reporter }) {
  const motifLabel = {
    arnaque: "🚨 Arnaque / Fraude",
    contenu_inapproprie: "⚠️ Contenu inapproprié",
    doublon: "🔄 Doublon",
    prix_abusif: "💰 Prix abusif",
    autre: "📋 Autre"
  };

  const reporterName = reporter?.pseudo || reporter?.email || `Utilisateur #${report.user_id}`;
  const annonceTitle = annonce?.titre || `Annonce #${report.annonce_id}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Inter', sans-serif;
          background: #f5f5f5;
          margin: 0;
          padding: 20px;
        }
        .mail-container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .mail-header {
          background: linear-gradient(100deg, #4db5ff, #2e6d99);
          color: #ffffff;
          padding: 30px 24px;
          text-align: center;
        }
        .mail-header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }
        .mail-header p {
          margin: 8px 0 0 0;
          font-size: 14px;
          opacity: 0.95;
        }
        .mail-body {
          padding: 28px 24px;
        }
        .section {
          margin-bottom: 24px;
        }
        .section-title {
          font-size: 13px;
          font-weight: 600;
          color: #2e6d99;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
          border-bottom: 2px solid #4db5ff;
          padding-bottom: 8px;
        }
        .info-row {
          display: flex;
          gap: 12px;
          margin-bottom: 10px;
          font-size: 14px;
        }
        .info-label {
          font-weight: 600;
          color: #333333;
          min-width: 120px;
        }
        .info-value {
          color: #555555;
          flex: 1;
          word-break: break-word;
        }
        .motif-badge {
          display: inline-block;
          background: #ffe4e6;
          color: #c41e3a;
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: 500;
          font-size: 13px;
          margin-top: 6px;
        }
        .annonce-card {
          background: #f9f9f9;
          border: 1px solid #e0e0e0;
          border-left: 4px solid #4db5ff;
          border-radius: 6px;
          padding: 14px;
          margin-top: 8px;
        }
        .annonce-title {
          font-weight: 600;
          color: #111111;
          margin: 0 0 6px 0;
          font-size: 15px;
        }
        .annonce-meta {
          color: #666666;
          font-size: 13px;
          margin: 4px 0;
        }
        .description-block {
          background: #fafafa;
          border-radius: 6px;
          padding: 12px;
          margin-top: 8px;
          border-left: 3px solid #3057ac;
          font-size: 13px;
          color: #444444;
          line-height: 1.5;
          max-height: 200px;
          overflow-y: auto;
        }
        .mail-footer {
          background: #f5f5f5;
          border-top: 1px solid #e0e0e0;
          padding: 20px 24px;
          text-align: center;
          font-size: 12px;
          color: #888888;
        }
        .mail-footer p {
          margin: 4px 0;
        }
      </style>
    </head>
    <body>
      <div class="mail-container">
        <div class="mail-header">
          <h1>DealSpot</h1>
          <p>Nouveau signalement détecté</p>
        </div>

        <div class="mail-body">
          <div class="section">
            <div class="section-title">📌 Informations du signalement</div>
            <div class="info-row">
              <span class="info-label">ID Signalement:</span>
              <span class="info-value">#${report.id}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Nom complet:</span>
              <span class="info-value">${reporterName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Motif:</span>
              <span class="info-value">
                <div class="motif-badge">${motifLabel[report.motif] || report.motif}</div>
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Date:</span>
              <span class="info-value">${new Date(report.createdAt || Date.now()).toLocaleString('fr-FR')}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">📦 Annonce concernée</div>
            <div class="annonce-card">
              <div class="annonce-title">${annonceTitle}</div>
              <div class="annonce-meta">ID: ${report.annonce_id}</div>
              <div class="annonce-meta">Prix: ${annonce?.prix ? annonce.prix.toLocaleString('fr-FR') + ' €' : 'Non renseigné'}</div>
              <div class="annonce-meta">Catégorie: ${annonce?.categorie || 'Non renseignée'}</div>
              <div class="annonce-meta">Localisation: ${annonce?.localisation || 'Non renseignée'}</div>
            </div>
          </div>

          ${report.description ? `
            <div class="section">
              <div class="section-title">📝 Description du signalement</div>
              <div class="description-block">${report.description.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            </div>
          ` : ''}

          <div class="section">
            <div class="section-title">👤 Auteur du signalement</div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value">${reporter?.email || 'Non renseigné'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Téléphone:</span>
              <span class="info-value">${reporter?.telephone || 'Non renseigné'}</span>
            </div>
          </div>
        </div>

        <div class="mail-footer">
          <p><strong>DealSpot Admin Panel</strong></p>
          <p>Cet email a été généré automatiquement. Veuillez revoir et modérer le signalement.</p>
          <p>© 2026 DealSpot - Tous droits réservés</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendAdminReportEmail({ report, annonce, reporter }) {
  const config = getMailConfig();

  if (!isMailConfigured(config) || !config.adminEmail) {
    console.warn("[MAIL] Configuration SMTP absente. E-mail signalement non envoyé.");
    return { sent: false };
  }

  const annonceTitle = annonce?.titre || `Annonce #${report.annonce_id}`;
  const subject = `[DealSpot] Nouveau signalement - ${annonceTitle}`;
  const html = generateReportEmailHTML({ report, annonce, reporter });

  const transporter = createTransporter(config);

  const info = await transporter.sendMail({
    from: config.from,
    to: config.adminEmail,
    subject,
    html
  });

  return { sent: true, messageId: info.messageId };
}

export async function sendVerificationEmail({ email, pseudo, token }) {
  const config = getMailConfig();
  if (!isMailConfigured(config)) {
    console.warn("[MAIL] Configuration SMTP absente. Email verification non envoye.");
    return { sent: false };
  }

  const verifyUrl = `${getFrontendUrl()}/verification-email?token=${encodeURIComponent(token)}`;

  const transporter = createTransporter(config);

  const info = await transporter.sendMail({
    from: config.from,
    to: email,
    subject: "[DealSpot] Verifiez votre adresse email",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:20px;border:1px solid #eee;border-radius:10px;">
        <h2 style="margin:0 0 12px;color:#2e6d99;">Bienvenue sur DealSpot</h2>
        <p>Bonjour ${pseudo || ""},</p>
        <p>Veuillez verifier votre adresse email pour activer votre compte.</p>
        <p style="margin:24px 0;">
          <a href="${verifyUrl}" style="background:#2f6fd6;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;display:inline-block;">Verifier mon email</a>
        </p>
        <p>Si le bouton ne fonctionne pas, copiez ce lien:</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
        <p style="color:#777;font-size:12px;">Ce lien expire dans 24 heures.</p>
      </div>
    `
  });

  return { sent: true, messageId: info.messageId };
}

export async function sendResetPasswordEmail({ email, pseudo, token }) {
  const config = getMailConfig();
  if (!isMailConfigured(config)) {
    console.warn("[MAIL] Configuration SMTP absente. Email reset password non envoye.");
    return { sent: false };
  }

  const resetUrl = `${getFrontendUrl()}/reinitialiser-mot-de-passe?token=${encodeURIComponent(token)}`;

  const transporter = createTransporter(config);

  const info = await transporter.sendMail({
    from: config.from,
    to: email,
    subject: "[DealSpot] Reinitialisation de votre mot de passe",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:20px;border:1px solid #eee;border-radius:10px;">
        <h2 style="margin:0 0 12px;color:#2e6d99;">Reinitialisation du mot de passe</h2>
        <p>Bonjour ${pseudo || ""},</p>
        <p>Vous avez demande la reinitialisation de votre mot de passe.</p>
        <p style="margin:24px 0;">
          <a href="${resetUrl}" style="background:#2f6fd6;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;display:inline-block;">Reinitialiser mon mot de passe</a>
        </p>
        <p>Si vous n'etes pas a l'origine de cette demande, ignorez cet email.</p>
        <p>Sinon, copiez ce lien:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p style="color:#777;font-size:12px;">Ce lien expire dans 1 heure.</p>
      </div>
    `
  });

  return { sent: true, messageId: info.messageId };
}

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// utilisation du package historique officiel (selon doc Brevo)
const SibApiV3Sdk = require('sib-api-v3-sdk');

// configuration du client d'API (selon doc Brevo)
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

// instanciation du client pour les emails
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

function getMailConfig() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const from = process.env.MAILER_FROM || process.env.MAIL_FROM;
  const key = process.env.BREVO_API_KEY;

  return { apiKey: key, adminEmail, from };
}

function isMailConfigured(config) {
  return Boolean(config.apiKey && config.from);
}

function getFrontendUrl() {
  const configuredUrl = (process.env.FRONTEND_URL || "http://localhost:5173").trim().replace(/\/+$/, "");

  if (!/^https?:\/\//i.test(configuredUrl)) {
    console.warn("[MAIL] FRONTEND_URL invalide, utilisation du fallback local.", { configuredUrl });
    return "http://localhost:5173";
  }

  const hostname = new URL(configuredUrl).hostname;
  if (hostname.includes("railway.app") || hostname.includes("render.com") || hostname.includes("fly.dev")) {
    console.warn("[MAIL] FRONTEND_URL pointe vers un backend, pas vers le frontend Vercel. Vérifiez la variable FRONTEND_URL.", {
      configuredUrl,
      hostname
    });
  }

  return configuredUrl;
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
        body { font-family: sans-serif; background: #f5f5f5; padding: 20px; }
        .mail-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
        .mail-header { background: linear-gradient(100deg, #4db5ff, #2e6d99); color: #ffffff; padding: 30px 24px; text-align: center; }
        .mail-header h1 { margin: 0; font-size: 28px; }
        .mail-body { padding: 28px 24px; }
        .section { margin-bottom: 24px; }
        .section-title { font-size: 13px; font-weight: 600; color: #2e6d99; text-transform: uppercase; border-bottom: 2px solid #4db5ff; padding-bottom: 8px; margin-bottom: 12px; }
        .info-row { display: flex; margin-bottom: 10px; font-size: 14px; }
        .info-label { font-weight: 600; min-width: 120px; }
        .motif-badge { display: inline-block; background: #ffe4e6; color: #c41e3a; padding: 6px 12px; border-radius: 6px; }
        .annonce-card { background: #f9f9f9; border-left: 4px solid #4db5ff; padding: 14px; }
        .description-block { background: #fafafa; border-left: 3px solid #3057ac; padding: 12px; font-size: 13px; }
        .mail-footer { background: #f5f5f5; border-top: 1px solid #e0e0e0; padding: 20px 24px; text-align: center; font-size: 12px; color: #888888; }
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
            <div class="info-row"><span class="info-label">ID :</span><span>#${report.id}</span></div>
            <div class="info-row"><span class="info-label">Par :</span><span>${reporterName}</span></div>
            <div class="info-row"><span class="info-label">Motif :</span><span class="motif-badge">${motifLabel[report.motif] || report.motif}</span></div>
          </div>
          <div class="section">
            <div class="section-title">📦 Annonce concernée</div>
            <div class="annonce-card">
              <strong>${annonceTitle}</strong><br>
              ID: ${report.annonce_id}<br>
              Prix: ${annonce?.prix ? annonce.prix.toLocaleString('fr-FR') + ' €' : 'Non renseigné'}<br>
              Catégorie: ${annonce?.categorie || 'Non renseignée'}
            </div>
          </div>
          ${report.description ? `
            <div class="section">
              <div class="section-title">📝 Description</div>
              <div class="description-block">${report.description.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            </div>
          ` : ''}
        </div>
        <div class="mail-footer">
          <p><strong>DealSpot Admin Panel</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendAdminReportEmail({ report, annonce, reporter }) {
  const config = getMailConfig();
  if (!isMailConfigured(config) || !config.adminEmail) return { sent: false };

  const annonceTitle = annonce?.titre || `Annonce #${report.annonce_id}`;
  
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = `[DealSpot] Nouveau signalement - ${annonceTitle}`;
  sendSmtpEmail.htmlContent = generateReportEmailHTML({ report, annonce, reporter });
  sendSmtpEmail.sender = { email: config.from, name: "DealSpot Modération" };
  sendSmtpEmail.to = [{ email: config.adminEmail }];

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return { sent: true, messageId: data.messageId };
  } catch (err) {
    const errorDetails = err?.response?.text || err?.message || err;
    console.error("[MAIL] Erreur Brevo admin report :", errorDetails);
    return { sent: false };
  }
}

export async function sendVerificationEmail({ email, pseudo, token }) {
  const config = getMailConfig();
  if (!isMailConfigured(config)) return { sent: false };

  const verifyUrl = `${getFrontendUrl()}/verification-email?token=${encodeURIComponent(token)}`;

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = "[DealSpot] Vérifiez votre adresse email";
  sendSmtpEmail.sender = { email: config.from, name: "DealSpot" };
  sendSmtpEmail.to = [{ email: email }];
  sendSmtpEmail.htmlContent = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:20px;border:1px solid #eee;border-radius:10px;">
      <h2 style="color:#2e6d99;">Bienvenue sur DealSpot</h2>
      <p>Bonjour ${pseudo || ""},</p>
      <p>Veuillez vérifier votre adresse email pour activer votre compte :</p>
      <p><a href="${verifyUrl}" style="background:#2f6fd6;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;display:inline-block;">Vérifier mon email</a></p>
    </div>
  `;

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return { sent: true, messageId: data.messageId };
  } catch (err) {
    const errorDetails = err?.response?.text || err?.message || err;
    console.error("[MAIL] Erreur Brevo verification :", errorDetails);
    return { sent: false };
  }
}

export async function sendResetPasswordEmail({ email, pseudo, token }) {
  const config = getMailConfig();
  if (!isMailConfigured(config)) return { sent: false };

  const resetUrl = `${getFrontendUrl()}/reinitialiser-mot-de-passe?token=${encodeURIComponent(token)}`;

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = "[DealSpot] Réinitialisation de votre mot de passe";
  sendSmtpEmail.sender = { email: config.from, name: "DealSpot" };
  sendSmtpEmail.to = [{ email: email }];
  sendSmtpEmail.htmlContent = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:20px;border:1px solid #eee;border-radius:10px;">
      <h2>Réinitialisation du mot de passe</h2>
      <p>Bonjour ${pseudo || ""},</p>
      <p>Cliquez ci-dessous pour réinitialiser votre mot de passe :</p>
      <p><a href="${resetUrl}" style="background:#2f6fd6;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;display:inline-block;">Réinitialiser mon mot de passe</a></p>
    </div>
  `;

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return { sent: true, messageId: data.messageId };
  } catch (err) {
    const errorDetails = err?.response?.text || err?.message || err;
    console.error("[MAIL] Erreur Brevo reset password :", errorDetails);
    return { sent: false };
  }
}
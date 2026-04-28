import { SUPPORT_TICKET_TYPES } from "@/lib/support-ticket";

function safe(value) {
  return String(value ?? "")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatDate(date, locale = "en") {
  return new Date(date).toLocaleString(locale === "fr" ? "fr-FR" : "en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTypeLabel(type, locale = "en") {
  if (!SUPPORT_TICKET_TYPES.includes(type)) return type;

  const labels = {
    en: {
      NON_RECEIPT_OF_PARCEL: "Non-receipt of parcel",
      DELAYED_DELIVERY: "Delayed delivery",
      LOST_PARCEL: "Lost parcel",
      BILLING_ERROR: "Billing error",
      MISSING_ITEM: "Missing item",
      DAMAGED_ITEM: "Damaged item",
      PARTIAL_DELIVERY: "Partial delivery",
      RETURN_REQUEST: "Return request",
      DELIVERY_TRACKING: "Delivery tracking",
      SITE_ACCESS: "Site access",
      ORDER_VERIFICATION: "Order verification",
      DOCUMENT_REQUEST: "Document request",
      ACCOUNT_CREATION: "Account creation",
      ACCOUNT_UPDATE: "Account update",
      STOCK_VERIFICATION: "Stock verification",
      IT_INCIDENT: "IT incident",
      ORDER_CANCELLATION: "Order cancellation",
      REPLENISHMENT_ISSUE: "Replenishment issue",
    },
    fr: {
      NON_RECEIPT_OF_PARCEL: "Non-reception de colis",
      DELAYED_DELIVERY: "Livraison retardee",
      LOST_PARCEL: "Colis perdu",
      BILLING_ERROR: "Erreur de facturation",
      MISSING_ITEM: "Article manquant",
      DAMAGED_ITEM: "Article endommage",
      PARTIAL_DELIVERY: "Livraison partielle",
      RETURN_REQUEST: "Demande de retour",
      DELIVERY_TRACKING: "Suivi de livraison",
      SITE_ACCESS: "Acces au site",
      ORDER_VERIFICATION: "Verification de commande",
      DOCUMENT_REQUEST: "Demande de document",
      ACCOUNT_CREATION: "Creation de compte",
      ACCOUNT_UPDATE: "Mise a jour du compte",
      STOCK_VERIFICATION: "Verification du stock",
      IT_INCIDENT: "Incident informatique",
      ORDER_CANCELLATION: "Annulation de commande",
      REPLENISHMENT_ISSUE: "Probleme de reapprovisionnement",
    },
  };

  return labels[locale]?.[type] ?? type;
}

export function supportTicketAdminEmail(ticket) {
  return {
    subject: `New support ticket #${ticket.id} - ${ticket.subject}`,
    html: `
      <h2>New support ticket #${safe(ticket.id)}</h2>
      <p>A new support ticket has been created.</p>
      <ul>
        <li><strong>Status:</strong> ${safe(ticket.status)}</li>
        <li><strong>Created at:</strong> ${safe(formatDate(ticket.createdAt, "en"))}</li>
        <li><strong>User ID:</strong> ${safe(ticket.userId || "-")}</li>
        <li><strong>Name:</strong> ${safe(ticket.name)}</li>
        <li><strong>Email:</strong> ${safe(ticket.email)}</li>
        <li><strong>Phone:</strong> ${safe(ticket.phone)}</li>
        <li><strong>Type:</strong> ${safe(getTypeLabel(ticket.type, "en"))}</li>
        <li><strong>Subject:</strong> ${safe(ticket.subject)}</li>
      </ul>
      <p><strong>Description:</strong></p>
      <p style="white-space: pre-wrap;">${safe(ticket.description)}</p>
    `,
    text: `New support ticket #${ticket.id}

A new support ticket has been created.

Status: ${ticket.status}
Created at: ${formatDate(ticket.createdAt, "en")}
User ID: ${ticket.userId || "-"}
Name: ${ticket.name}
Email: ${ticket.email}
Phone: ${ticket.phone}
Type: ${getTypeLabel(ticket.type, "en")}
Subject: ${ticket.subject}

Description:
${ticket.description}
`,
  };
}

export function supportTicketUserConfirmationEmail(ticket, locale = "en") {
  const isFrench = locale === "fr";
  const typeLabel = getTypeLabel(ticket.type, locale);

  return {
    subject: isFrench
      ? `Votre ticket support #${ticket.id} a bien ete recu`
      : `Your support ticket #${ticket.id} has been received`,
    html: isFrench
      ? `
        <h2>Nous avons bien recu votre demande</h2>
        <p>Votre ticket #${safe(ticket.id)} est en cours de traitement.</p>
        <ul>
          <li><strong>Sujet :</strong> ${safe(ticket.subject)}</li>
          <li><strong>Type :</strong> ${safe(typeLabel)}</li>
          <li><strong>Date :</strong> ${safe(formatDate(ticket.createdAt, "fr"))}</li>
          <li><strong>Statut :</strong> ${safe(ticket.status)}</li>
        </ul>
        <p>Notre equipe support reviendra vers vous des que possible.</p>
      `
      : `
        <h2>We have received your request</h2>
        <p>Your ticket #${safe(ticket.id)} is now being processed.</p>
        <ul>
          <li><strong>Subject:</strong> ${safe(ticket.subject)}</li>
          <li><strong>Type:</strong> ${safe(typeLabel)}</li>
          <li><strong>Date:</strong> ${safe(formatDate(ticket.createdAt, "en"))}</li>
          <li><strong>Status:</strong> ${safe(ticket.status)}</li>
        </ul>
        <p>Our support team will get back to you as soon as possible.</p>
      `,
    text: isFrench
      ? `Nous avons bien recu votre demande.

Ticket: #${ticket.id}
Sujet: ${ticket.subject}
Type: ${typeLabel}
Date: ${formatDate(ticket.createdAt, "fr")}
Statut: ${ticket.status}

Notre equipe support reviendra vers vous des que possible.`
      : `We have received your request.

Ticket: #${ticket.id}
Subject: ${ticket.subject}
Type: ${typeLabel}
Date: ${formatDate(ticket.createdAt, "en")}
Status: ${ticket.status}

Our support team will get back to you as soon as possible.`,
  };
}

export const SUPPORT_TICKET_STATUSES = [
  "open",
  "in_progress",
  "resolved",
  "closed",
];

export const SUPPORT_TICKET_TYPES = [
  "NON_RECEIPT_OF_PARCEL",
  "DELAYED_DELIVERY",
  "LOST_PARCEL",
  "BILLING_ERROR",
  "MISSING_ITEM",
  "DAMAGED_ITEM",
  "PARTIAL_DELIVERY",
  "RETURN_REQUEST",
  "DELIVERY_TRACKING",
  "SITE_ACCESS",
  "ORDER_VERIFICATION",
  "DOCUMENT_REQUEST",
  "ACCOUNT_CREATION",
  "ACCOUNT_UPDATE",
  "STOCK_VERIFICATION",
  "IT_INCIDENT",
  "ORDER_CANCELLATION",
  "REPLENISHMENT_ISSUE",
];

export function isValidSupportTicketStatus(value) {
  return SUPPORT_TICKET_STATUSES.includes(value);
}

export function isValidSupportTicketType(value) {
  return SUPPORT_TICKET_TYPES.includes(value);
}

const SHIPPING_BRACKETS = [
  { maxTickets: 500, parcels: 1, price: 17.1 },
  { maxTickets: 1000, parcels: 1, price: 17.8 },
  { maxTickets: 2000, parcels: 1, price: 18.5 },
  { maxTickets: 3000, parcels: 1, price: 19.5 },
  { maxTickets: 4000, parcels: 1, price: 19.5 },
  { maxTickets: 5000, parcels: 1, price: 20.7 },
  { maxTickets: 6000, parcels: 1, price: 22.4 },
  { maxTickets: 8000, parcels: 1, price: 23.5 },
  { maxTickets: 10000, parcels: 2, price: 41.8 },
  { maxTickets: 12000, parcels: 2, price: 44.8 },
  { maxTickets: 16000, parcels: 2, price: 46.9 },
  { maxTickets: 20000, parcels: 3, price: 66.3 },
  { maxTickets: 30000, parcels: 4, price: 92.6 },
  { maxTickets: 40000, parcels: 5, price: 117.1 },
  { maxTickets: 50000, parcels: 7, price: 139.5 },
];

const MAX_STANDARD_DPD_TICKETS = 50000;

const STANDARD_SHIPMENT_SNAPSHOTS = {
  2000: {
    shippingMode: "STANDARD",
    parcelCount: 1,
    parcelWeightKg: 6.6,
    parcelLengthCm: 24,
    parcelWidthCm: 24,
    parcelHeightCm: 24,
  },
  4000: {
    shippingMode: "STANDARD",
    parcelCount: 1,
    parcelWeightKg: 13.1,
    parcelLengthCm: 40,
    parcelWidthCm: 26,
    parcelHeightCm: 25,
  },
  6000: {
    shippingMode: "STANDARD",
    parcelCount: 1,
    parcelWeightKg: 19.6,
    parcelLengthCm: 58,
    parcelWidthCm: 26,
    parcelHeightCm: 25,
  },
  8000: {
    shippingMode: "STANDARD",
    parcelCount: 1,
    parcelWeightKg: 26.2,
    parcelLengthCm: 51,
    parcelWidthCm: 19,
    parcelHeightCm: 49,
  },
};

export function getShipmentSnapshotByTicketCount(totalTickets) {
  const normalizedTickets = Number(totalTickets || 0);

  if (normalizedTickets <= 0) {
    return {
      ticketCount: 0,
      shippingMode: null,
      parcelCount: 0,
      parcelWeightKg: null,
      parcelLengthCm: null,
      parcelWidthCm: null,
      parcelHeightCm: null,
      isSpecialShipping: false,
    };
  }

  if (normalizedTickets > MAX_STANDARD_DPD_TICKETS) {
    return {
      ticketCount: normalizedTickets,
      shippingMode: "SPECIAL",
      parcelCount: null,
      parcelWeightKg: null,
      parcelLengthCm: null,
      parcelWidthCm: null,
      parcelHeightCm: null,
      isSpecialShipping: true,
    };
  }

  const standardSnapshot = STANDARD_SHIPMENT_SNAPSHOTS[normalizedTickets];
  if (standardSnapshot) {
    return {
      ticketCount: normalizedTickets,
      ...standardSnapshot,
      isSpecialShipping: false,
    };
  }

  const bracket = SHIPPING_BRACKETS.find(
    (entry) => normalizedTickets <= entry.maxTickets,
  );

  return {
    ticketCount: normalizedTickets,
    shippingMode: "STANDARD",
    parcelCount: bracket?.parcels ?? 1,
    parcelWeightKg: null,
    parcelLengthCm: null,
    parcelWidthCm: null,
    parcelHeightCm: null,
    isSpecialShipping: false,
  };
}

export function getShippingByTicketCount(totalTickets) {
  const normalizedTickets = Number(totalTickets || 0);

  if (normalizedTickets <= 0) {
    return {
      totalTickets: 0,
      parcels: 0,
      price: 0,
      isQuoteRequired: false,
      isSpecialShipping: false,
      label: "No shipping",
    };
  }

  const bracket = SHIPPING_BRACKETS.find(
    (entry) => normalizedTickets <= entry.maxTickets,
  );

  if (!bracket) {
    return {
      totalTickets: normalizedTickets,
      parcels: 1,
      price: null,
      isQuoteRequired: true,
      isSpecialShipping: true,
      label: "Special shipping",
    };
  }

  const isSpecialShipping = normalizedTickets > MAX_STANDARD_DPD_TICKETS;

  return {
    totalTickets: normalizedTickets,
    parcels: bracket.parcels,
    price: bracket.price,
    isQuoteRequired: false,
    isSpecialShipping,
    label: isSpecialShipping ? "Special shipping" : null,
  };
}

export function getOrderShipmentSnapshot(order) {
  if (order?.shippingMode) {
    return {
      ticketCount: Number(order.ticketCount || 0),
      shippingMode: order.shippingMode,
      parcelCount: order.parcelCount ?? null,
      parcelWeightKg: order.parcelWeightKg ?? null,
      parcelLengthCm: order.parcelLengthCm ?? null,
      parcelWidthCm: order.parcelWidthCm ?? null,
      parcelHeightCm: order.parcelHeightCm ?? null,
      isSpecialShipping: order.shippingMode === "SPECIAL",
    };
  }

  const totalTickets = Array.isArray(order?.items)
    ? order.items.reduce(
        (sum, item) =>
          sum +
          Number(item.quantityPerPack || 0) * Number(item.numberOfPacks || 0),
        0,
      )
    : Number(order?.ticketCount || 0);

  return getShipmentSnapshotByTicketCount(totalTickets);
}

export function getOrderPricingSummary(items = []) {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.totalPrice || 0),
    0,
  );
  const totalTickets = items.reduce(
    (sum, item) =>
      sum + Number(item.quantityPerPack || 0) * Number(item.numberOfPacks || 0),
    0,
  );
  const totalPacks = items.reduce(
    (sum, item) => sum + Number(item.numberOfPacks || 0),
    0,
  );
  const shipping = getShippingByTicketCount(totalTickets);
  const shippingCost = shipping.price ?? 0;
  const grandTotal = subtotal + shippingCost;

  return {
    subtotal,
    totalTickets,
    totalPacks,
    shipping,
    shipmentSnapshot: getShipmentSnapshotByTicketCount(totalTickets),
    shippingCost,
    grandTotal,
  };
}

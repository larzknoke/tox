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

export function getShippingByTicketCount(totalTickets) {
  const normalizedTickets = Number(totalTickets || 0);

  if (normalizedTickets <= 0) {
    return {
      totalTickets: 0,
      parcels: 0,
      price: 0,
      isQuoteRequired: false,
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
      label: "Upon request",
    };
  }

  return {
    totalTickets: normalizedTickets,
    parcels: bracket.parcels,
    price: bracket.price,
    isQuoteRequired: false,
    label: null,
  };
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
    shippingCost,
    grandTotal,
  };
}

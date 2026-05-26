import * as soapLib from "soap";
import { randomUUID } from "crypto";
import prisma from "@/lib/prisma";
import { getOrderShipmentSnapshot } from "@/lib/shipping";

const soap = soapLib.default ?? soapLib;

const LOGIN_WSDL_URL =
  "https://public-ws-stage.dpd.com/services/LoginService/V2_0/?wsdl";
const SHIPMENT_WSDL_URL =
  "https://public-ws-stage.dpd.com/services/ShipmentService/V4_5/?wsdl";
const AUTH_NAMESPACE = "http://dpd.com/common/service/types/Authentication/2.0";
const DEFAULT_MESSAGE_LANGUAGE = "de_DE";
const DPD_TOKEN_CACHE_PREFIX = "dpd-auth-token";

const globalForDpd = globalThis;
if (!globalForDpd.__dpdTokenCache) {
  globalForDpd.__dpdTokenCache = {
    token: null,
    expiresAt: null,
    inFlightLogin: null,
  };
}

function getDpdCacheKey(delisId) {
  return `${DPD_TOKEN_CACHE_PREFIX}:${delisId}`;
}

function getMemoryCache() {
  return globalForDpd.__dpdTokenCache;
}

function isTokenStillValid(expiresAt) {
  if (!expiresAt) {
    return false;
  }

  return new Date(expiresAt).getTime() > Date.now();
}

function getTokenExpiryDate() {
  // DPD tokens usually reset around 03:00 CET/CEST. Keep a conservative TTL below 24h.
  return new Date(Date.now() + 23 * 60 * 60 * 1000);
}

function setMemoryToken(authToken, expiresAt) {
  const cache = getMemoryCache();
  cache.token = authToken;
  cache.expiresAt = expiresAt;
}

async function getPersistedToken(delisId) {
  const cacheKey = getDpdCacheKey(delisId);
  const entry = await prisma.verification.findFirst({
    where: { identifier: cacheKey },
    orderBy: { expiresAt: "desc" },
  });

  if (!entry || !isTokenStillValid(entry.expiresAt)) {
    return null;
  }

  return {
    authToken: entry.value,
    expiresAt: entry.expiresAt,
  };
}

async function persistToken(delisId, authToken, expiresAt) {
  const cacheKey = getDpdCacheKey(delisId);

  await prisma.$transaction([
    prisma.verification.deleteMany({ where: { identifier: cacheKey } }),
    prisma.verification.create({
      data: {
        id: randomUUID(),
        identifier: cacheKey,
        value: authToken,
        expiresAt,
      },
    }),
  ]);
}

async function clearPersistedToken(delisId) {
  const cacheKey = getDpdCacheKey(delisId);
  await prisma.verification.deleteMany({ where: { identifier: cacheKey } });
}

function isAuthTokenFault(error) {
  const body = error?.response?.body ?? "";
  const message = String(error?.message ?? "");
  return (
    body.includes("LOGIN_5") ||
    body.includes("LOGIN_6") ||
    message.includes("LOGIN_5") ||
    message.includes("LOGIN_6")
  );
}

function getEnvValue(name, fallback) {
  const value = process.env[name]?.trim();

  if (value) {
    return value;
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error(`${name} is not configured`);
}

function normalizeCountryCode(value, fallback = "DE") {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim();
  if (!normalized) {
    return fallback;
  }

  if (normalized.length === 2) {
    return normalized.toUpperCase();
  }

  const countryMap = {
    germany: "DE",
    deutschland: "DE",
    france: "FR",
    frankreich: "FR",
    belgium: "BE",
    belgique: "BE",
    belgien: "BE",
    netherlands: "NL",
    niederlande: "NL",
    "pays-bas": "NL",
    luxembourg: "LU",
    luxemburg: "LU",
    austria: "AT",
    oesterreich: "AT",
    österreich: "AT",
    switzerland: "CH",
    schweiz: "CH",
    suisse: "CH",
  };

  return countryMap[normalized.toLowerCase()] ?? fallback;
}

function getSenderConfig() {
  return {
    sendingDepot: getEnvValue("DPD_SENDING_DEPOT", "0163"),
    product: getEnvValue("DPD_PRODUCT", "CL"),
    parcelWeight: Number(getEnvValue("DPD_DEFAULT_WEIGHT", "100")),
    sender: {
      name1: getEnvValue("DPD_SENDER_NAME1", "Absender Name"),
      name2: process.env.DPD_SENDER_NAME2?.trim() || undefined,
      street: getEnvValue("DPD_SENDER_STREET", "Strasse 1"),
      country: normalizeCountryCode(process.env.DPD_SENDER_COUNTRY, "DE"),
      zipCode: getEnvValue("DPD_SENDER_ZIP_CODE", "11111"),
      city: getEnvValue("DPD_SENDER_CITY", "Ort"),
      customerNumber: getEnvValue("DPD_SENDER_CUSTOMER_NUMBER", "12345679"),
      phone: process.env.DPD_SENDER_PHONE?.trim() || undefined,
      email: process.env.DPD_SENDER_EMAIL?.trim() || undefined,
    },
  };
}

function buildRecipientName(address) {
  const fullName = [address.firstName, address.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (address.company?.trim()) {
    return {
      name1: address.company.trim(),
      name2: fullName || undefined,
    };
  }

  return {
    name1: fullName || "Recipient",
    name2: undefined,
  };
}

function buildParcelLabelNumber(orderId) {
  const orderPart = String(orderId)
    .replace(/\D/g, "")
    .slice(-4)
    .padStart(4, "0");
  const timePart = Date.now().toString().slice(-4);

  // DPD requires parcelLabelNumber minLength 11.
  return `ORD${orderPart}${timePart}`;
}

export function buildTestShipmentPayload(overrides = {}) {
  const senderConfig = getSenderConfig();
  const uniqueSuffix = Date.now().toString().slice(-8);

  return {
    printOptions: {
      printOption: [
        {
          outputFormat: "PDF",
          paperFormat: "A4",
        },
      ],
    },
    order: [
      {
        generalShipmentData: {
          identificationNumber:
            overrides.identificationNumber ?? `TEST-${uniqueSuffix}`,
          sendingDepot: overrides.sendingDepot ?? senderConfig.sendingDepot,
          product: overrides.product ?? senderConfig.product,
          mpsCompleteDelivery: overrides.mpsCompleteDelivery ?? false,
          sender: {
            ...senderConfig.sender,
            ...overrides.sender,
            country: normalizeCountryCode(
              overrides.sender?.country ?? senderConfig.sender.country,
              senderConfig.sender.country,
            ),
          },
          recipient: {
            name1: overrides.recipient?.name1 ?? "Empfaenger Name",
            name2: overrides.recipient?.name2,
            street: overrides.recipient?.street ?? "Test-Strasse",
            state: overrides.recipient?.state ?? "BY",
            country: normalizeCountryCode(overrides.recipient?.country, "DE"),
            zipCode: overrides.recipient?.zipCode ?? "63741",
            city: overrides.recipient?.city ?? "Aschaffenburg",
            phone: overrides.recipient?.phone,
            email: overrides.recipient?.email,
          },
        },
        parcels: [
          {
            parcelLabelNumber:
              overrides.parcels?.[0]?.parcelLabelNumber ??
              `TEST${uniqueSuffix}`,
            weight: overrides.parcels?.[0]?.weight ?? senderConfig.parcelWeight,
          },
        ],
        productAndServiceData: {
          orderType: overrides.orderType ?? "consignment",
        },
      },
    ],
  };
}

export function buildOrderShipmentPayload(order) {
  if (!order?.deliveryAddress) {
    throw new Error("Order has no delivery address");
  }

  const senderConfig = getSenderConfig();
  const recipientName = buildRecipientName(order.deliveryAddress);
  const shipmentSnapshot = getOrderShipmentSnapshot(order);

  if (shipmentSnapshot.shippingMode === "SPECIAL") {
    throw new Error(
      "Special shipping orders require manual handling and cannot use the DPD label flow",
    );
  }

  if ((shipmentSnapshot.parcelCount ?? 1) !== 1) {
    throw new Error(
      "DPD label generation currently supports only single-parcel orders",
    );
  }

  return {
    printOptions: {
      printOption: [
        {
          outputFormat: "PDF",
          paperFormat: "A4",
        },
      ],
    },
    order: [
      {
        generalShipmentData: {
          identificationNumber: `ORDER-${order.id}`,
          sendingDepot: senderConfig.sendingDepot,
          product: senderConfig.product,
          mpsCompleteDelivery: false,
          sender: senderConfig.sender,
          recipient: {
            ...recipientName,
            street: order.deliveryAddress.address1,
            country: normalizeCountryCode(order.deliveryAddress.country, "DE"),
            zipCode: order.deliveryAddress.postalCode,
            city: order.deliveryAddress.city,
            phone: order.deliveryAddress.phone || undefined,
          },
        },
        parcels: [
          {
            parcelLabelNumber: buildParcelLabelNumber(order.id),
            weight:
              shipmentSnapshot.parcelWeightKg ?? senderConfig.parcelWeight,
          },
        ],
        productAndServiceData: {
          orderType: "consignment",
        },
      },
    ],
  };
}

export function extractLabel(orderResult) {
  const shipmentResponse = orderResult?.shipmentResponses?.[0];
  const parcelInformation = shipmentResponse?.parcelInformation?.[0];
  const parcelOutput = parcelInformation?.output?.[0];
  const orderOutput = orderResult?.output;

  return {
    parcelLabelNumber: parcelInformation?.parcelLabelNumber ?? null,
    dpdReference: parcelInformation?.dpdReference ?? null,
    format: parcelOutput?.format ?? orderOutput?.format ?? null,
    content: parcelOutput?.content ?? orderOutput?.content ?? null,
    faults: shipmentResponse?.faults ?? [],
  };
}

export async function getDpdAuthToken(
  messageLanguage = DEFAULT_MESSAGE_LANGUAGE,
  options = {},
) {
  const forceRefresh = Boolean(options.forceRefresh);
  const client = await soap.createClientAsync(LOGIN_WSDL_URL);
  const delisId = getEnvValue("DELIID");
  const cache = getMemoryCache();

  if (!forceRefresh && cache.token && isTokenStillValid(cache.expiresAt)) {
    return {
      authToken: cache.token,
      result: null,
    };
  }

  if (!forceRefresh) {
    const persisted = await getPersistedToken(delisId);
    if (persisted) {
      setMemoryToken(persisted.authToken, persisted.expiresAt);
      return {
        authToken: persisted.authToken,
        result: null,
      };
    }
  }

  if (!forceRefresh && cache.inFlightLogin) {
    return cache.inFlightLogin;
  }

  cache.inFlightLogin = (async () => {
    const loginClient = client;
    const password = getEnvValue("DELIPW");
    const [result] = await loginClient.getAuthAsync({
      delisId,
      password,
      messageLanguage,
    });

    const authToken = result?.authToken ?? result?.return?.authToken ?? null;

    if (!authToken) {
      throw new Error("DPD login succeeded without auth token");
    }

    const expiresAt = getTokenExpiryDate();
    setMemoryToken(authToken, expiresAt);
    await persistToken(delisId, authToken, expiresAt);

    return {
      authToken,
      result,
    };
  })();

  try {
    return await cache.inFlightLogin;
  } finally {
    cache.inFlightLogin = null;
  }
}

export async function createDpdLabel({
  shipment,
  messageLanguage = DEFAULT_MESSAGE_LANGUAGE,
}) {
  const delisId = getEnvValue("DELIID");
  const doStoreOrder = async (authToken) => {
    const client = await soap.createClientAsync(SHIPMENT_WSDL_URL);

    client.addSoapHeader(
      {
        authentication: {
          delisId,
          authToken,
          messageLanguage,
        },
      },
      "",
      "ns",
      AUTH_NAMESPACE,
    );

    const [result] = await client.storeOrdersAsync(shipment);
    return result;
  };

  const firstAuth = await getDpdAuthToken(messageLanguage);

  try {
    const result = await doStoreOrder(firstAuth.authToken);
    return {
      authToken: firstAuth.authToken,
      loginResult: firstAuth.result,
      result,
      label: extractLabel(result?.orderResult),
    };
  } catch (error) {
    if (!isAuthTokenFault(error)) {
      throw error;
    }

    // Token invalid/expired (LOGIN_5 / LOGIN_6): refresh and retry once.
    const cache = getMemoryCache();
    cache.token = null;
    cache.expiresAt = null;
    await clearPersistedToken(delisId);

    const refreshedAuth = await getDpdAuthToken(messageLanguage, {
      forceRefresh: true,
    });
    const retryResult = await doStoreOrder(refreshedAuth.authToken);

    return {
      authToken: refreshedAuth.authToken,
      loginResult: refreshedAuth.result,
      result: retryResult,
      label: extractLabel(retryResult?.orderResult),
    };
  }
}

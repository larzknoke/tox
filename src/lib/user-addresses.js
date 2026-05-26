export const USER_ADDRESS_TYPES = {
  billing: "BILLING",
  delivery: "DELIVERY",
};

export const EMPTY_ADDRESS_FORM = {
  label: "",
  firstName: "",
  lastName: "",
  company: "",
  vat: "",
  address1: "",
  address2: "",
  postalCode: "",
  city: "",
  country: "",
  phone: "",
};

export function toUserAddressType(type) {
  const normalizedType = String(type || "").toLowerCase();
  const resolvedType = USER_ADDRESS_TYPES[normalizedType];

  if (!resolvedType) {
    throw new Error(`Invalid address type: ${type}`);
  }

  return resolvedType;
}

export function fromUserAddressType(type) {
  if (type === USER_ADDRESS_TYPES.billing) {
    return "billing";
  }

  if (type === USER_ADDRESS_TYPES.delivery) {
    return "delivery";
  }

  throw new Error(`Invalid user address type: ${type}`);
}

export function getUserAddressCollectionKey(type) {
  return type === USER_ADDRESS_TYPES.billing
    ? "billingAddresses"
    : "deliveryAddresses";
}

export function getUserDefaultField(type) {
  return type === USER_ADDRESS_TYPES.billing
    ? "defaultBillingAddressId"
    : "defaultDeliveryAddressId";
}

export function mapAddressToForm(address) {
  if (!address) {
    return { ...EMPTY_ADDRESS_FORM };
  }

  return {
    id: address.id,
    label: address.label || "",
    firstName: address.firstName || "",
    lastName: address.lastName || "",
    company: address.company || "",
    vat: address.vat || "",
    address1: address.address1 || "",
    address2: address.address2 || "",
    postalCode: address.postalCode || "",
    city: address.city || "",
    country: address.country || "",
    phone: address.phone || "",
  };
}

export function serializeUserAddress(address) {
  return {
    id: address.id,
    userId: address.userId,
    type: fromUserAddressType(address.type),
    label: address.label,
    firstName: address.firstName,
    lastName: address.lastName,
    company: address.company,
    vat: address.vat,
    address1: address.address1,
    address2: address.address2,
    postalCode: address.postalCode,
    city: address.city,
    country: address.country,
    phone: address.phone,
    createdAt: address.createdAt.toISOString(),
    updatedAt: address.updatedAt.toISOString(),
  };
}

export function getAddressFields(type, addressData) {
  return {
    label: addressData.label?.trim() || "",
    firstName: addressData.firstName?.trim() || "",
    lastName: addressData.lastName?.trim() || "",
    company: addressData.company?.trim() || "",
    vat:
      type === USER_ADDRESS_TYPES.billing
        ? addressData.vat?.trim() || null
        : null,
    address1: addressData.address1?.trim() || "",
    address2: addressData.address2?.trim() || null,
    postalCode: addressData.postalCode?.trim() || "",
    city: addressData.city?.trim() || "",
    country: addressData.country?.trim() || "",
    phone: addressData.phone?.trim() || "",
  };
}

export function isAddressComplete(address) {
  const requiredFields = [
    "label",
    "firstName",
    "lastName",
    "company",
    "address1",
    "postalCode",
    "city",
    "country",
    "phone",
  ];

  return requiredFields.every((field) => address?.[field]?.trim());
}

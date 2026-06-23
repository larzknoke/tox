import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { getOrderShipmentSnapshot } from "@/lib/shipping";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "bold",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: 140,
    fontWeight: "bold",
  },
  value: {
    flex: 1,
  },
  table: {
    marginTop: 10,
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    padding: 8,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    padding: 8,
  },
  tableCellWide: {
    flex: 2,
  },
  tableCellSmall: {
    flex: 0.5,
    textAlign: "right",
  },
  tableCellMedium: {
    flex: 1,
    textAlign: "right",
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginVertical: 10,
  },
  addressBlock: {
    marginBottom: 10,
  },
  addressTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  columnsRow: {
    flexDirection: "row",
    gap: 20,
  },
  column: {
    flex: 1,
  },
});

function getDeliveryNoteMessages(messages = {}) {
  return {
    title: messages.title ?? "Delivery Note",
    date: messages.date ?? "Date",
    orderName: messages.orderName ?? "Order Name",
    orderDate: messages.orderDate ?? "Order Date",
    shippedDate: messages.shippedDate ?? "Shipped Date",
    status: messages.status ?? "Status",
    customer: messages.customer ?? "Customer",
    name: messages.name ?? "Name",
    email: messages.email ?? "E-Mail",
    billingAddress: messages.billingAddress ?? "Billing Address",
    deliveryAddress: messages.deliveryAddress ?? "Delivery Address",
    taxId: messages.taxId ?? "Tax identification number",
    tel: messages.tel ?? "Tel",
    items: messages.items ?? "Items",
    product: messages.product ?? "Product",
    qty: messages.qty ?? "Qty",
    packs: messages.packs ?? "Packs",
    tickets: messages.tickets ?? "Tickets",
    ticketsPerPack: messages.ticketsPerPack ?? "tickets/pack",
    ticketsTotal: messages.ticketsTotal ?? "tickets total",
    totalPacks: messages.totalPacks ?? "Total Packs",
    totalTickets: messages.totalTickets ?? "Total Tickets",
    shippingMode: messages.shippingMode ?? "Shipping Mode",
    parcelCount: messages.parcelCount ?? "Parcels",
    specialShipping: messages.specialShipping ?? "Special shipping",
    serialNumber: messages.serialNumber ?? "Serial Number",
    parcelOne: messages.parcelOne ?? "parcel",
    parcelOther: messages.parcelOther ?? "parcels",
    na: messages.na ?? "—",
    statusLabels: messages.statusLabels ?? {},
  };
}

const DeliveryNotePDF = ({ order, locale = "en", messages = {} }) => {
  const m = getDeliveryNoteMessages(messages);
  const shipment = getOrderShipmentSnapshot(order);
  const totalPacks = order.items.reduce(
    (sum, item) => sum + (item.numberOfPacks ?? 0),
    0,
  );
  const totalTickets = order.items.reduce(
    (sum, item) =>
      sum + (item.quantityPerPack ?? 0) * (item.numberOfPacks ?? 0),
    0,
  );

  const statusLabel = m.statusLabels?.[order.status] ?? order.status;

  const formatAddress = (address) => {
    if (!address) return null;
    return (
      <View>
        <Text>
          {address.firstName} {address.lastName}
        </Text>
        {address.company ? <Text>{address.company}</Text> : null}
        {address.vat ? (
          <Text>
            {m.taxId}: {address.vat}
          </Text>
        ) : null}
        <Text>{address.address1}</Text>
        {address.address2 ? <Text>{address.address2}</Text> : null}
        <Text>
          {address.postalCode} {address.city}
        </Text>
        <Text>{address.country}</Text>
        {address.phone ? (
          <Text>
            {m.tel}: {address.phone}
          </Text>
        ) : null}
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {m.title} #{order.id}
          </Text>
          <Text>
            {m.date}: {new Date().toLocaleDateString(locale)}
          </Text>
          <Text>
            {m.orderName}: {order.name}
          </Text>
          <Text>
            {m.orderDate}:{" "}
            {new Date(order.createdAt).toLocaleDateString(locale)}
          </Text>
          <Text>
            {m.shippedDate}:{" "}
            {order.shippedDate
              ? new Date(order.shippedDate).toLocaleDateString(locale)
              : m.na}
          </Text>
          <Text>
            {m.status}: {statusLabel}
          </Text>
          {order.serialNumber ? (
            <Text>
              {m.serialNumber}: {order.serialNumber}
            </Text>
          ) : null}
        </View>

        <View style={styles.separator} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{m.customer}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>{m.name}:</Text>
            <Text style={styles.value}>{order.user?.name ?? m.na}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>{m.email}:</Text>
            <Text style={styles.value}>{order.user?.email ?? m.na}</Text>
          </View>
        </View>

        <View style={[styles.section, styles.columnsRow]}>
          <View style={styles.column}>
            <View style={styles.addressBlock}>
              <Text style={styles.addressTitle}>{m.billingAddress}</Text>
              {order.billingAddress ? (
                formatAddress(order.billingAddress)
              ) : (
                <Text>{m.na}</Text>
              )}
            </View>
          </View>
          <View style={styles.column}>
            <View style={styles.addressBlock}>
              <Text style={styles.addressTitle}>{m.deliveryAddress}</Text>
              {order.deliveryAddress ? (
                formatAddress(order.deliveryAddress)
              ) : (
                <Text>{m.na}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{m.items}</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCellWide}>{m.product}</Text>
              <Text style={styles.tableCellSmall}>{m.packs}</Text>
              <Text style={styles.tableCellMedium}>{m.tickets}</Text>
            </View>
            {order.items.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <View style={styles.tableCellWide}>
                  <Text>{item.designation}</Text>
                  <Text style={{ fontSize: 9, color: "#666" }}>
                    {item.reference} · {item.quantityPerPack} {m.ticketsPerPack}
                  </Text>
                </View>
                <Text style={styles.tableCellSmall}>{item.numberOfPacks}</Text>
                <Text style={styles.tableCellMedium}>
                  {(item.quantityPerPack * item.numberOfPacks).toLocaleString(
                    locale,
                  )}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>{m.totalPacks}:</Text>
            <Text style={styles.value}>{totalPacks}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>{m.totalTickets}:</Text>
            <Text style={styles.value}>
              {totalTickets.toLocaleString(locale)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>{m.shippingMode}:</Text>
            <Text style={styles.value}>
              {shipment.isSpecialShipping
                ? m.specialShipping
                : `${shipment.parcelCount} ${shipment.parcelCount === 1 ? m.parcelOne : m.parcelOther}`}
            </Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{m.status}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>{m.status}:</Text>
            <Text style={styles.value}>{statusLabel}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>{m.shippedDate}:</Text>
            <Text style={styles.value}>
              {order.shippedDate
                ? new Date(order.shippedDate).toLocaleDateString(locale)
                : m.na}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default DeliveryNotePDF;

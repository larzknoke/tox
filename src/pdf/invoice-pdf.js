import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { formatCurrency } from "@/lib/utils";
import { getOrderPricingSummary } from "@/lib/shipping";

function getInvoiceMessages(messages = {}) {
  return {
    title: messages.title ?? "Invoice",
    date: messages.date ?? "Date",
    orderName: messages.orderName ?? "Order Name",
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
    unitPrice: messages.unitPrice ?? "Unit Price",
    total: messages.total ?? "Total",
    ticketsPerPack: messages.ticketsPerPack ?? "tickets/pack",
    ticketsTotal: messages.ticketsTotal ?? "tickets total",
    totalPacks: messages.totalPacks ?? "Total Packs",
    totalTickets: messages.totalTickets ?? "Total Tickets",
    subtotalExclVat: messages.subtotalExclVat ?? "Subtotal (excl. VAT)",
    shipping: messages.shipping ?? "Shipping",
    parcelOne: messages.parcelOne ?? "parcel",
    parcelOther: messages.parcelOther ?? "parcels",
    uponRequest: messages.uponRequest ?? "Upon request",
    totalInclShippingExclVat:
      messages.totalInclShippingExclVat ?? "Total incl. shipping (excl. VAT)",
    invoiceDetails: messages.invoiceDetails ?? "Invoice Details",
    invoiceNo: messages.invoiceNo ?? "Invoice No.",
    invoiceDate: messages.invoiceDate ?? "Invoice Date",
    amount: messages.amount ?? "Amount",
    statusLabels: messages.statusLabels ?? {},
  };
}

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
    width: 120,
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
  tableCell: {
    flex: 1,
  },
  tableCellRight: {
    flex: 1,
    textAlign: "right",
  },
  tableCellWide: {
    flex: 2,
  },
  tableCellSmall: {
    flex: 0.5,
  },
  total: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "bold",
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

const InvoicePDF = ({ order, locale = "en", messages = {} }) => {
  const pricing = getOrderPricingSummary(order.items);
  const m = getInvoiceMessages(messages);
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {m.title} #{order.id}
          </Text>
          <Text>
            {m.date}: {new Date(order.createdAt).toLocaleDateString(locale)}
          </Text>
          <Text>
            {m.orderName}: {order.name}
          </Text>
          <Text>
            {m.status}: {statusLabel}
          </Text>
        </View>

        <View style={styles.separator} />

        {/* Customer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{m.customer}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>{m.name}:</Text>
            <Text style={styles.value}>{order.user?.name ?? "—"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>{m.email}:</Text>
            <Text style={styles.value}>{order.user?.email ?? "—"}</Text>
          </View>
        </View>

        {/* Addresses */}
        <View style={[styles.section, styles.columnsRow]}>
          <View style={styles.column}>
            <View style={styles.addressBlock}>
              <Text style={styles.addressTitle}>{m.billingAddress}</Text>
              {order.billingAddress ? (
                formatAddress(order.billingAddress)
              ) : (
                <Text>—</Text>
              )}
            </View>
          </View>
          <View style={styles.column}>
            <View style={styles.addressBlock}>
              <Text style={styles.addressTitle}>{m.deliveryAddress}</Text>
              {order.deliveryAddress ? (
                formatAddress(order.deliveryAddress)
              ) : (
                <Text>—</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.separator} />

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{m.items}</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCellWide}>{m.product}</Text>
              <Text style={styles.tableCellSmall}>{m.qty}</Text>
              <Text style={styles.tableCellRight}>{m.unitPrice}</Text>
              <Text style={styles.tableCellRight}>{m.total}</Text>
            </View>
            {order.items.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <View style={styles.tableCellWide}>
                  <Text>{item.designation}</Text>
                  <Text style={{ fontSize: 9, color: "#666" }}>
                    {item.reference} · {item.quantityPerPack} {m.ticketsPerPack}{" "}
                    ·{" "}
                    {(item.quantityPerPack * item.numberOfPacks).toLocaleString(
                      locale,
                    )}{" "}
                    {m.ticketsTotal}
                  </Text>
                </View>
                <Text style={styles.tableCellSmall}>{item.numberOfPacks}</Text>
                <Text style={styles.tableCellRight}>
                  {formatCurrency(Number(item.pricePerPack))}
                </Text>
                <Text style={styles.tableCellRight}>
                  {formatCurrency(Number(item.totalPrice))}
                </Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>{m.totalPacks}:</Text>
            <Text style={styles.value}>{pricing.totalPacks}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>{m.totalTickets}:</Text>
            <Text style={styles.value}>
              {pricing.totalTickets.toLocaleString(locale)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>{m.subtotalExclVat}:</Text>
            <Text style={styles.value}>{formatCurrency(pricing.subtotal)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>{m.shipping}:</Text>
            <Text style={styles.value}>
              {pricing.shipping.isQuoteRequired
                ? m.uponRequest
                : `${formatCurrency(pricing.shippingCost)} (${pricing.shipping.parcels} ${pricing.shipping.parcels === 1 ? m.parcelOne : m.parcelOther})`}
            </Text>
          </View>
          <Text style={styles.total}>
            {m.totalInclShippingExclVat}:{" "}
            {pricing.shipping.isQuoteRequired
              ? m.uponRequest
              : formatCurrency(pricing.grandTotal)}
          </Text>
        </View>

        {/* Invoice info */}
        {order.invoice && (
          <>
            <View style={styles.separator} />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{m.invoiceDetails}</Text>
              <View style={styles.infoRow}>
                <Text style={styles.label}>{m.invoiceNo}:</Text>
                <Text style={styles.value}>{order.invoice.invoiceNumber}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>{m.invoiceDate}:</Text>
                <Text style={styles.value}>
                  {new Date(order.invoice.invoiceDate).toLocaleDateString(
                    locale,
                  )}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>{m.amount}:</Text>
                <Text style={styles.value}>
                  {pricing.shipping.isQuoteRequired
                    ? m.uponRequest
                    : formatCurrency(pricing.grandTotal)}{" "}
                  {order.invoice.currency}
                </Text>
              </View>
            </View>
          </>
        )}
      </Page>
    </Document>
  );
};

export default InvoicePDF;

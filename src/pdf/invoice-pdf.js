import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { formatCurrency } from "@/lib/utils";

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

const InvoicePDF = ({ order }) => {
  const totalPrice = order.items.reduce(
    (sum, i) => sum + Number(i.totalPrice),
    0,
  );
  const totalTickets = order.items.reduce(
    (sum, i) => sum + i.quantityPerPack * i.numberOfPacks,
    0,
  );

  const formatAddress = (address) => {
    if (!address) return null;
    return (
      <View>
        <Text>
          {address.firstName} {address.lastName}
        </Text>
        {address.company ? <Text>{address.company}</Text> : null}
        {address.vat ? (
          <Text>Tax identification number: {address.vat}</Text>
        ) : null}
        <Text>{address.address1}</Text>
        {address.address2 ? <Text>{address.address2}</Text> : null}
        <Text>
          {address.postalCode} {address.city}
        </Text>
        <Text>{address.country}</Text>
        {address.phone ? <Text>Tel: {address.phone}</Text> : null}
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Invoice #{order.id}</Text>
          <Text>
            Date: {new Date(order.createdAt).toLocaleDateString("de-DE")}
          </Text>
          <Text>Order Name: {order.name}</Text>
          <Text>Status: {order.status}</Text>
        </View>

        <View style={styles.separator} />

        {/* Customer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{order.user?.name ?? "—"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>E-Mail:</Text>
            <Text style={styles.value}>{order.user?.email ?? "—"}</Text>
          </View>
        </View>

        {/* Addresses */}
        <View style={[styles.section, styles.columnsRow]}>
          <View style={styles.column}>
            <View style={styles.addressBlock}>
              <Text style={styles.addressTitle}>Billing Address</Text>
              {order.billingAddress ? (
                formatAddress(order.billingAddress)
              ) : (
                <Text>—</Text>
              )}
            </View>
          </View>
          <View style={styles.column}>
            <View style={styles.addressBlock}>
              <Text style={styles.addressTitle}>Delivery Address</Text>
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
          <Text style={styles.sectionTitle}>Items</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCellWide}>Product</Text>
              <Text style={styles.tableCellSmall}>Qty</Text>
              <Text style={styles.tableCellRight}>Unit Price</Text>
              <Text style={styles.tableCellRight}>Total</Text>
            </View>
            {order.items.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <View style={styles.tableCellWide}>
                  <Text>{item.designation}</Text>
                  <Text style={{ fontSize: 9, color: "#666" }}>
                    {item.reference} · {item.quantityPerPack} tickets/pack ·{" "}
                    {(
                      item.quantityPerPack * item.numberOfPacks
                    ).toLocaleString()}{" "}
                    tickets total
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
            <Text style={styles.label}>Total Packs:</Text>
            <Text style={styles.value}>
              {order.items.reduce((s, i) => s + i.numberOfPacks, 0)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Total Tickets:</Text>
            <Text style={styles.value}>{totalTickets.toLocaleString()}</Text>
          </View>
          <Text style={styles.total}>
            Total (excl. VAT): {formatCurrency(totalPrice)}
          </Text>
        </View>

        {/* Invoice info */}
        {order.invoice && (
          <>
            <View style={styles.separator} />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Invoice Details</Text>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Invoice No.:</Text>
                <Text style={styles.value}>{order.invoice.invoiceNumber}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Invoice Date:</Text>
                <Text style={styles.value}>
                  {new Date(order.invoice.invoiceDate).toLocaleDateString(
                    "de-DE",
                  )}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Amount:</Text>
                <Text style={styles.value}>
                  {formatCurrency(Number(order.invoice.totalAmount))}{" "}
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

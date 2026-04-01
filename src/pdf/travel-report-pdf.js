import React from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
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
  tableCellSmall: {
    flex: 0.75,
    textAlign: "right",
  },
  tableCellRight: {
    flex: 1,
    textAlign: "right",
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
});

const getStatusLabel = (status) => {
  switch (status) {
    case "paid":
      return "Bezahlt";
    case "unpaid":
      return "Nicht bezahlt";
    default:
      return status;
  }
};

const TravelReportPDF = ({ travelReport }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Fahrtkosten-Abrechnung #{travelReport.id}
          </Text>
          <Text>Erstellt am: {new Date().toLocaleDateString("de-DE")}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Abrechnungsinformationen</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Benutzer:</Text>
            <Text style={styles.value}>{travelReport.user?.name || "-"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Mannschaft:</Text>
            <Text style={styles.value}>{travelReport.team?.name || "-"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Ziel:</Text>
            <Text style={styles.value}>{travelReport.destination || "-"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Grund:</Text>
            <Text style={styles.value}>{travelReport.reason || "-"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Fahrtdatum:</Text>
            <Text style={styles.value}>
              {new Date(travelReport.travelDate).toLocaleDateString("de-DE")}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>
              {getStatusLabel(travelReport.status)}
            </Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Fahrzeuge ({travelReport.vehicles?.length || 0})
          </Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCell}>Fahrer</Text>
              <Text style={styles.tableCellSmall}>Distanz (km)</Text>
              <Text style={styles.tableCellRight}>Keine Kosten</Text>
              <Text style={styles.tableCellRight}>Kosten</Text>
            </View>
            {travelReport.vehicles?.map((vehicle) => (
              <View key={vehicle.id} style={styles.tableRow}>
                <Text style={styles.tableCell}>{vehicle.driver || "-"}</Text>
                <Text style={styles.tableCellSmall}>
                  {vehicle.distance.toFixed(1)}
                </Text>
                <Text style={styles.tableCellRight}>
                  {vehicle.noCharge ? "Ja" : "Nein"}
                </Text>
                <Text style={styles.tableCellRight}>
                  {formatCurrency(vehicle.cost)}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.total}>
            Gesamtdistanz: {travelReport.distance.toFixed(1)} km
          </Text>
          <Text style={styles.total}>
            Gesamtkosten: {formatCurrency(travelReport.totalCost)}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default TravelReportPDF;

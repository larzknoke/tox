import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { formatCurrency, formatQuarter } from "@/lib/utils";

// Create styles
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
  statusBadge: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
    fontSize: 10,
    display: "inline-block",
  },
});

// Create Document Component
const BillPDF = ({ bill, groupedEvents }) => {
  const getTrainerLicenseLabel = (licenseType) => {
    const labels = {
      c_lizenz: "C-Lizenz",
      b_lizenz: "B-Lizenz",
      a_lizenz: "A-Lizenz",
      ohne_lizenz: "Ohne Lizenz",
    };
    return labels[licenseType] || licenseType;
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "unpaid":
        return "Nicht bezahlt";
      case "paid":
        return "Bezahlt";
      default:
        return status;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Abrechnung #{bill.id}</Text>
          <Text>Erstellt am: {new Date().toLocaleDateString("de-DE")}</Text>
        </View>

        {/* Bill Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Abrechnungsinformationen</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Trainer:</Text>
            <Text style={styles.value}>{bill.trainer.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Stammverein:</Text>
            <Text style={styles.value}>{bill.trainer.stammverein || "-"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Lizenz:</Text>
            <Text style={styles.value}>
              {bill.trainer.licenseType
                ? getTrainerLicenseLabel(bill.trainer.licenseType)
                : "-"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Mannschaft:</Text>
            <Text style={styles.value}>{bill.team.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Zeitraum:</Text>
            <Text style={styles.value}>
              {formatQuarter(bill.quarter, bill.year)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>IBAN:</Text>
            <Text style={styles.value}>{bill.iban || "-"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Stundensatz:</Text>
            <Text style={styles.value}>
              {bill.hourlyRate ? formatCurrency(bill.hourlyRate) : "-"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{getStatusLabel(bill.status)}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        {/* Training Sessions Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trainingszeiten Übersicht</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCell}>Ort</Text>
              <Text style={styles.tableCellSmall}>Anzahl</Text>
              <Text style={styles.tableCellSmall}>Stunden</Text>
              <Text style={styles.tableCellRight}>Kosten</Text>
            </View>
            {Object.entries(groupedEvents).map(([location, group], index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{location}</Text>
                <Text style={styles.tableCellSmall}>{group.count}</Text>
                <Text style={styles.tableCellSmall}>
                  {group.totalHours.toFixed(2)}
                </Text>
                <Text style={styles.tableCellRight}>
                  {formatCurrency(group.totalCost)}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.total}>
            Gesamtkosten: {formatCurrency(bill.totalCost)}
          </Text>
        </View>

        <View style={styles.separator} />

        {/* Event Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Einzelne Termine ({bill.events.length})
          </Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCell}>Datum</Text>
              <Text style={styles.tableCell}>Zeit</Text>
              <Text style={styles.tableCell}>Ort</Text>
              <Text style={styles.tableCellSmall}>Stunden</Text>
              <Text style={styles.tableCellRight}>Kosten</Text>
            </View>
            {bill.events.map((event) => (
              <View key={event.id} style={styles.tableRow}>
                <Text style={styles.tableCell}>
                  {new Date(event.startDate).toLocaleDateString("de-DE")}
                </Text>
                <Text style={styles.tableCell}>
                  {new Date(event.startDate).toLocaleTimeString("de-DE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {new Date(event.endDate).toLocaleTimeString("de-DE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
                <Text style={styles.tableCell}>{event.location}</Text>
                <Text style={styles.tableCellSmall}>{event.durationHours}</Text>
                <Text style={styles.tableCellRight}>
                  {formatCurrency(event.cost)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default BillPDF;

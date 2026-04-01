import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { formatDate, getGenderLabel } from "@/lib/utils";

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
  tableCellWide: {
    flex: 2,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginVertical: 10,
  },
  footer: {
    marginTop: 20,
    fontSize: 10,
    textAlign: "center",
    color: "#666",
  },
  groupTitle: {
    marginTop: 6,
    marginBottom: 4,
    fontWeight: "bold",
  },
});

// Create Document Component
const TeamPDF = ({ team, showLicense = false }) => {
  const groupedPlayers = team.playerTeams.reduce((acc, playerTeam) => {
    const year = new Date(playerTeam.player.birthday).getFullYear();
    const key = year.toString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(playerTeam);
    return acc;
  }, {});

  const sortedPlayerYears = Object.keys(groupedPlayers).sort(
    (a, b) => parseInt(a) - parseInt(b),
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Team: {team.name}</Text>
          <Text>Erstellt am: {new Date().toLocaleDateString("de-DE")}</Text>
        </View>

        {/* Team Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team-Informationen</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Team Name:</Text>
            <Text style={styles.value}>{team.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Erstellt am:</Text>
            <Text style={styles.value}>{formatDate(team.createdAt)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Anzahl Trainer:</Text>
            <Text style={styles.value}>{team.trainerTeams.length}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Anzahl Spieler:</Text>
            <Text style={styles.value}>{team.playerTeams.length}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        {/* Trainers List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Trainer ({team.trainerTeams.length})
          </Text>
          {team.trainerTeams.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableCellWide}>Name</Text>
                <Text style={styles.tableCell}>Stammverein</Text>
                {showLicense && <Text style={styles.tableCell}>Lizenz</Text>}
              </View>
              {team.trainerTeams.map((trainerTeam) => (
                <View key={trainerTeam.id} style={styles.tableRow}>
                  <Text style={styles.tableCellWide}>
                    {trainerTeam.trainer.name}
                  </Text>
                  <Text style={styles.tableCell}>
                    {trainerTeam.trainer.stammverein || "-"}
                  </Text>
                  {showLicense && (
                    <Text style={styles.tableCell}>
                      {trainerTeam.trainer.licenseType || "-"}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <Text>Keine Trainer zugeordnet</Text>
          )}
        </View>

        <View style={styles.separator} />

        {/* Players List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Spieler ({team.playerTeams.length})
          </Text>
          {team.playerTeams.length > 0 ? (
            <View>
              {sortedPlayerYears.map((year) => (
                <View key={year} style={styles.table}>
                  <Text style={styles.groupTitle}>Jahrgang {year}</Text>
                  <View style={styles.tableHeader}>
                    <Text style={styles.tableCellWide}>Name</Text>
                    <Text style={styles.tableCell}>Geburtsdatum</Text>
                    <Text style={styles.tableCell}>Geschlecht</Text>
                  </View>
                  {[...groupedPlayers[year]]
                    .sort((a, b) =>
                      a.player.name.localeCompare(b.player.name, "de"),
                    )
                    .map((playerTeam) => (
                      <View key={playerTeam.id} style={styles.tableRow}>
                        <Text style={styles.tableCellWide}>
                          {playerTeam.player.name}
                        </Text>
                        <Text style={styles.tableCell}>
                          {formatDate(playerTeam.player.birthday)}
                        </Text>
                        <Text style={styles.tableCell}>
                          {getGenderLabel(playerTeam.player.gender)}
                        </Text>
                      </View>
                    ))}
                </View>
              ))}
            </View>
          ) : (
            <Text>Keine Spieler zugeordnet</Text>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Generiert am {new Date().toLocaleDateString("de-DE")} um{" "}
            {new Date().toLocaleTimeString("de-DE")}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default TeamPDF;

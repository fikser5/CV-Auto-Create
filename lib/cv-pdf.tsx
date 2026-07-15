import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { GeneratedCvContent } from "@/lib/cv-schema";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#111111" },
  headline: { fontSize: 20, fontWeight: 700, marginBottom: 6 },
  summary: { fontSize: 10, color: "#333333", lineHeight: 1.4, marginBottom: 16 },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    color: "#666666",
    marginBottom: 6,
    marginTop: 14,
  },
  entryRow: { flexDirection: "row", justifyContent: "space-between" },
  entryTitle: { fontWeight: 700 },
  entryPeriod: { color: "#666666" },
  bullet: { marginTop: 2, marginLeft: 10 },
  skills: { color: "#333333" },
});

function CvDocument({ cv }: { cv: GeneratedCvContent }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.headline}>{cv.headline}</Text>
        <Text style={styles.summary}>{cv.summary}</Text>

        {cv.experience.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Doświadczenie zawodowe</Text>
            {cv.experience.map((item, i) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <View style={styles.entryRow}>
                  <Text style={styles.entryTitle}>
                    {item.position} — {item.company}
                  </Text>
                  <Text style={styles.entryPeriod}>{item.period}</Text>
                </View>
                {item.highlights.map((h, j) => (
                  <Text key={j} style={styles.bullet}>
                    • {h}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {cv.education.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Wykształcenie</Text>
            {cv.education.map((item, i) => (
              <View key={i} style={styles.entryRow}>
                <Text style={styles.entryTitle}>
                  {item.school} — {item.degree}
                </Text>
                <Text style={styles.entryPeriod}>{item.period}</Text>
              </View>
            ))}
          </View>
        )}

        {cv.skills.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Umiejętności</Text>
            <Text style={styles.skills}>{cv.skills.join(" · ")}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

export async function renderCvToPdfBuffer(cv: GeneratedCvContent): Promise<Buffer> {
  return renderToBuffer(<CvDocument cv={cv} />);
}

import path from "node:path";
import { Document, Page, Text, View, StyleSheet, Font, renderToBuffer } from "@react-pdf/renderer";
import type { GeneratedCvContent } from "@/lib/cv-schema";

// Helvetica (PDF standard font) has no Polish diacritics (ą ć ę ł ń ó ś ź ż) —
// Open Sans is embedded explicitly so exported CVs render Polish text correctly.
Font.register({
  family: "Open Sans",
  fonts: [
    { src: path.join(process.cwd(), "assets/fonts/OpenSans-Regular.ttf"), fontWeight: 400 },
    { src: path.join(process.cwd(), "assets/fonts/OpenSans-Bold.ttf"), fontWeight: 700 },
  ],
});

const PRIMARY = "#4f46e5";

const styles = StyleSheet.create({
  accentBar: { height: 6, backgroundColor: PRIMARY },
  page: { padding: 40, paddingTop: 34, fontSize: 10, fontFamily: "Open Sans", color: "#111111" },
  headline: { fontSize: 20, fontWeight: 700, marginBottom: 6, color: "#111111" },
  summary: { fontSize: 10, color: "#333333", lineHeight: 1.4, marginBottom: 16 },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: PRIMARY,
    marginBottom: 6,
    marginTop: 14,
  },
  entryRow: { flexDirection: "row", justifyContent: "space-between" },
  entryTitle: { fontWeight: 700 },
  entryPeriod: { color: "#666666" },
  bullet: { marginTop: 2, marginLeft: 10 },
  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  skillChip: {
    backgroundColor: "#eef2ff",
    color: "#4338ca",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 9,
  },
});

function CvDocument({ cv }: { cv: GeneratedCvContent }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={[styles.accentBar, { marginHorizontal: -40, marginTop: -34, marginBottom: 20 }]} />
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
            <View style={styles.skillsRow}>
              {cv.skills.map((skill, i) => (
                <Text key={i} style={styles.skillChip}>
                  {skill}
                </Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}

export async function renderCvToPdfBuffer(cv: GeneratedCvContent): Promise<Buffer> {
  return renderToBuffer(<CvDocument cv={cv} />);
}

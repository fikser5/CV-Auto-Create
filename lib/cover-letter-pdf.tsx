import path from "node:path";
import { Document, Page, Text, View, StyleSheet, Font, renderToBuffer } from "@react-pdf/renderer";
import type { GeneratedCoverLetterContent } from "@/lib/cover-letter-schema";

// Same font as lib/cv-pdf.tsx (Font.register is safe to call again with the
// same family — react-pdf keeps a global registry keyed by family name).
Font.register({
  family: "Open Sans",
  fonts: [
    { src: path.join(process.cwd(), "assets/fonts/OpenSans-Regular.ttf"), fontWeight: 400 },
    { src: path.join(process.cwd(), "assets/fonts/OpenSans-Bold.ttf"), fontWeight: 700 },
  ],
});

const HEADING = "#2c4f61";
const MUTED = "#5b6670";

export type CoverLetterRenderData = GeneratedCoverLetterContent & {
  fullName: string;
  email: string;
  phone: string | null;
  location: string | null;
};

const styles = StyleSheet.create({
  page: { fontFamily: "Open Sans", fontSize: 10.5, color: "#242424", lineHeight: 1.5, padding: 56 },
  senderName: { fontSize: 12, fontWeight: 700, color: HEADING },
  senderLine: { fontSize: 9.5, color: MUTED, marginTop: 2 },
  dateLine: { marginTop: 28, fontSize: 9.5, color: MUTED, textAlign: "right" },
  subject: { marginTop: 24, fontSize: 10.5, fontWeight: 700, color: HEADING },
  recipient: { marginTop: 18, fontSize: 10.5 },
  paragraph: { marginTop: 14 },
  closing: { marginTop: 14 },
  signatureBlock: { marginTop: 32 },
  signatureName: { marginTop: 26, fontWeight: 700 },
});

function CoverLetterDocument({ letter }: { letter: CoverLetterRenderData }) {
  const dateLabel = new Date().toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.senderName}>{letter.fullName}</Text>
          {letter.location && <Text style={styles.senderLine}>{letter.location}</Text>}
          <Text style={styles.senderLine}>{letter.email}</Text>
          {letter.phone && <Text style={styles.senderLine}>{letter.phone}</Text>}
        </View>

        <Text style={styles.dateLine}>{dateLabel}</Text>

        <Text style={styles.subject}>{letter.subject}</Text>

        <Text style={styles.recipient}>{letter.recipientLine}</Text>

        {letter.paragraphs.map((paragraph, i) => (
          <Text key={i} style={styles.paragraph}>
            {paragraph}
          </Text>
        ))}

        <Text style={styles.closing}>{letter.closing}</Text>

        <View style={styles.signatureBlock}>
          <Text>Z poważaniem,</Text>
          <Text style={styles.signatureName}>{letter.fullName}</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function renderCoverLetterToPdfBuffer(letter: CoverLetterRenderData): Promise<Buffer> {
  return renderToBuffer(<CoverLetterDocument letter={letter} />);
}

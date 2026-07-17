import path from "node:path";
import { Document, Page, Text, View, Image, StyleSheet, Font, renderToBuffer } from "@react-pdf/renderer";
import type { GeneratedCvContent } from "@/lib/cv-schema";
import { LanguageLevelLabels, LanguageLevelBars, type LanguageLevels } from "@/lib/definitions";
import { PdfPinIcon, PdfPhoneIcon, PdfMailIcon, PdfGlobeIcon } from "@/lib/pdf-icons";

// Helvetica (PDF standard font) has no Polish diacritics (ą ć ę ł ń ó ś ź ż) —
// Open Sans is embedded explicitly so exported CVs render Polish text correctly.
Font.register({
  family: "Open Sans",
  fonts: [
    { src: path.join(process.cwd(), "assets/fonts/OpenSans-Regular.ttf"), fontWeight: 400 },
    { src: path.join(process.cwd(), "assets/fonts/OpenSans-Bold.ttf"), fontWeight: 700 },
  ],
});

type LanguageLevel = (typeof LanguageLevels)[number];

export type CvRenderData = GeneratedCvContent & {
  fullName: string;
  email: string;
  phone: string | null;
  location: string | null;
  linkedinUrl: string | null;
  photoUrl: string | null;
  languages: { name: string; level: LanguageLevel }[];
};

const CONSENT_TEXT =
  "Wyrażam zgodę na przetwarzanie moich danych osobowych w celu prowadzenia rekrutacji na aplikowane przeze mnie stanowisko.";

const COLORS = {
  banner: "#2c4f61",
  bannerAccent: "#3f7188",
  bannerRoleText: "#cfe1e8",
  sidebarBg: "#e9eef1",
  heading: "#2c4f61",
  text: "#242424",
  muted: "#5b6670",
  accent: "#3f7188",
  barEmpty: "#c9d3d8",
};

const SIDEBAR_W = "35%";
const CONTENT_W = "65%";
const HEADER_H = 118;

// Default hyphenation breaks long words (e.g. e-mail addresses) mid-word with a
// hyphen, which looks wrong in a resume's narrow sidebar column.
Font.registerHyphenationCallback((word) => [word]);

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const styles = StyleSheet.create({
  page: { fontFamily: "Open Sans", fontSize: 9.3, color: COLORS.text, lineHeight: 1.35 },
  sidebarBgFixed: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_W,
    backgroundColor: COLORS.sidebarBg,
  },
  row: { flexDirection: "row" },
  sidebarCol: { width: SIDEBAR_W },
  contentCol: { width: CONTENT_W },

  photo: { width: "100%", height: HEADER_H, objectFit: "cover" },
  photoPlaceholder: {
    width: "100%",
    height: HEADER_H,
    backgroundColor: COLORS.banner,
    alignItems: "center",
    justifyContent: "center",
  },
  photoInitials: { color: "#ffffff", fontSize: 32, fontWeight: 700 },

  sidebarBody: { padding: 18, paddingTop: 20 },
  sidebarHeading: {
    fontSize: 9.5,
    fontWeight: 700,
    color: COLORS.heading,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 9,
    marginTop: 18,
  },
  contactRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  contactIcon: { marginRight: 6, marginTop: 1 },
  contactText: { flex: 1, color: COLORS.text, fontSize: 8.6, lineHeight: 1.35 },

  skillRow: { flexDirection: "row", marginBottom: 4.5 },
  skillDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: COLORS.accent, marginRight: 6, marginTop: 4 },
  skillText: { flex: 1, fontSize: 8.6 },

  languageBlock: { marginBottom: 11 },
  languageTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  languageName: { fontSize: 8.9, fontWeight: 700 },
  languageCode: { fontSize: 8, color: COLORS.muted, fontWeight: 700 },
  languageBar: { flexDirection: "row", marginTop: 5, marginBottom: 3 },
  barSegment: { width: 15, height: 4, borderRadius: 2, marginRight: 3 },
  languageLevelLabel: { fontSize: 8, color: COLORS.muted },

  banner: { height: HEADER_H, backgroundColor: COLORS.banner, paddingHorizontal: 26, justifyContent: "center" },
  name: { fontSize: 23, fontWeight: 700, color: "#ffffff" },
  role: {
    fontSize: 10.5,
    color: COLORS.bannerRoleText,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 10,
  },
  bannerAccentBar: { height: 5, backgroundColor: COLORS.bannerAccent },

  contentBody: { padding: 26 },
  contentHeading: {
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.heading,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 17,
  },
  contentHeadingFirst: { marginTop: 0 },
  summaryText: { fontSize: 9.3, color: COLORS.text, lineHeight: 1.55 },

  entryBlock: { marginBottom: 11 },
  entryPosition: { fontSize: 9.6, fontWeight: 700, color: COLORS.text },
  entryPeriodInline: { fontWeight: 700, color: COLORS.muted },
  entryCompany: { fontSize: 9.2, fontWeight: 700, color: COLORS.accent, marginTop: 1, marginBottom: 3 },
  entryBullet: { fontSize: 8.7, lineHeight: 1.45, marginTop: 2 },

  consent: { marginTop: 22, fontSize: 7.2, color: COLORS.muted, lineHeight: 1.4 },
});

function SidebarContactRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <View style={styles.contactRow}>
      <View style={styles.contactIcon}>{icon}</View>
      <Text style={styles.contactText}>{children}</Text>
    </View>
  );
}

function LanguageBars({ filled }: { filled: number }) {
  return (
    <View style={styles.languageBar}>
      {Array.from({ length: 5 }).map((_, i) => (
        <View
          key={i}
          style={[styles.barSegment, { backgroundColor: i < filled ? COLORS.accent : COLORS.barEmpty }]}
        />
      ))}
    </View>
  );
}

function CvDocument({ cv }: { cv: CvRenderData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View fixed style={styles.sidebarBgFixed} />

        <View style={styles.row}>
          {/* Sidebar */}
          <View style={styles.sidebarCol}>
            {cv.photoUrl ? (
              <Image src={cv.photoUrl} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoInitials}>{initials(cv.fullName)}</Text>
              </View>
            )}

            <View style={styles.sidebarBody}>
              <Text style={[styles.sidebarHeading, { marginTop: 0 }]}>Profil osobisty</Text>
              {cv.location && <SidebarContactRow icon={<PdfPinIcon color={COLORS.accent} />}>{cv.location}</SidebarContactRow>}
              {cv.phone && <SidebarContactRow icon={<PdfPhoneIcon color={COLORS.accent} />}>{cv.phone}</SidebarContactRow>}
              <SidebarContactRow icon={<PdfMailIcon color={COLORS.accent} />}>{cv.email}</SidebarContactRow>
              {cv.linkedinUrl && (
                <SidebarContactRow icon={<PdfGlobeIcon color={COLORS.accent} />}>{cv.linkedinUrl}</SidebarContactRow>
              )}

              {cv.skills.length > 0 && (
                <View>
                  <Text style={styles.sidebarHeading}>Umiejętności</Text>
                  {cv.skills.map((skill, i) => (
                    <View key={i} style={styles.skillRow}>
                      <View style={styles.skillDot} />
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              )}

              {cv.languages.length > 0 && (
                <View>
                  <Text style={styles.sidebarHeading}>Języki</Text>
                  {cv.languages.map((lang, i) => (
                    <View key={i} style={styles.languageBlock}>
                      <View style={styles.languageTopRow}>
                        <Text style={styles.languageName}>{lang.name}:</Text>
                        {lang.level !== "native" && <Text style={styles.languageCode}>{lang.level}</Text>}
                      </View>
                      {lang.level === "native" ? (
                        <Text style={styles.languageLevelLabel}>Język ojczysty</Text>
                      ) : (
                        <>
                          <LanguageBars filled={LanguageLevelBars[lang.level]} />
                          <Text style={styles.languageLevelLabel}>{LanguageLevelLabels[lang.level]}</Text>
                        </>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Content */}
          <View style={styles.contentCol}>
            <View style={styles.banner}>
              <Text style={styles.name}>{cv.fullName}</Text>
              {cv.headline && <Text style={styles.role}>{cv.headline}</Text>}
            </View>
            <View style={styles.bannerAccentBar} />

            <View style={styles.contentBody}>
              {cv.summary && (
                <View>
                  <Text style={[styles.contentHeading, styles.contentHeadingFirst]}>Podsumowanie</Text>
                  <Text style={styles.summaryText}>{cv.summary}</Text>
                </View>
              )}

              {cv.experience.length > 0 && (
                <View>
                  <Text style={styles.contentHeading}>Doświadczenie</Text>
                  {cv.experience.map((item, i) => (
                    <View key={i} style={styles.entryBlock} wrap={false}>
                      <Text style={styles.entryPosition}>
                        {item.position.toUpperCase()}, <Text style={styles.entryPeriodInline}>{item.period}</Text>
                      </Text>
                      <Text style={styles.entryCompany}>{item.company}</Text>
                      {item.highlights.map((h, j) => (
                        <Text key={j} style={styles.entryBullet}>
                          • {h}
                        </Text>
                      ))}
                    </View>
                  ))}
                </View>
              )}

              {cv.education.length > 0 && (
                <View>
                  <Text style={styles.contentHeading}>Wykształcenie</Text>
                  {cv.education.map((item, i) => (
                    <View key={i} style={styles.entryBlock} wrap={false}>
                      <Text style={styles.entryPosition}>
                        {item.degree}, <Text style={styles.entryPeriodInline}>{item.period}</Text>
                      </Text>
                      <Text style={styles.entryCompany}>{item.school}</Text>
                    </View>
                  ))}
                </View>
              )}

              <Text style={styles.consent}>{CONSENT_TEXT}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function renderCvToPdfBuffer(cv: CvRenderData): Promise<Buffer> {
  return renderToBuffer(<CvDocument cv={cv} />);
}

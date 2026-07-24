import path from "node:path";
import { Document, Page, Text, View, Image, StyleSheet, Font, renderToBuffer } from "@react-pdf/renderer";
import type { GeneratedCvContent } from "@/lib/cv-schema";
import { LanguageLevelLabels, LanguageLevelBars, type LanguageLevels } from "@/lib/definitions";
import { PdfPinIcon, PdfPhoneIcon, PdfMailIcon, PdfGlobeIcon } from "@/lib/pdf-icons";
import { getCvTemplate, type CvThemeColors, type CvLayout } from "@/lib/cv-templates";

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

function LanguageBars({ filled, color, empty }: { filled: number; color: string; empty: string }) {
  return (
    <View style={{ flexDirection: "row", marginTop: 5, marginBottom: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <View
          key={i}
          style={{ width: 15, height: 4, borderRadius: 2, marginRight: 3, backgroundColor: i < filled ? color : empty }}
        />
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Layout: sidebar-photo — photo banner, light sidebar column, colored header.
// ---------------------------------------------------------------------------

function sidebarPhotoStyles(c: CvThemeColors) {
  return StyleSheet.create({
    page: { fontFamily: "Open Sans", fontSize: 9.3, color: c.text, lineHeight: 1.35 },
    sidebarBgFixed: { position: "absolute", top: 0, left: 0, bottom: 0, width: SIDEBAR_W, backgroundColor: c.sidebarBg },
    row: { flexDirection: "row" },
    sidebarCol: { width: SIDEBAR_W },
    contentCol: { width: CONTENT_W },
    photo: { width: "100%", height: HEADER_H, objectFit: "cover" },
    photoPlaceholder: { width: "100%", height: HEADER_H, backgroundColor: c.banner, alignItems: "center", justifyContent: "center" },
    photoInitials: { color: "#ffffff", fontSize: 32, fontWeight: 700 },
    sidebarBody: { padding: 18, paddingTop: 20 },
    sidebarHeading: { fontSize: 9.5, fontWeight: 700, color: c.heading, textTransform: "uppercase", letterSpacing: 1, marginBottom: 9, marginTop: 18 },
    contactRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
    contactIcon: { marginRight: 6, marginTop: 1 },
    contactText: { flex: 1, color: c.text, fontSize: 8.6, lineHeight: 1.35 },
    skillRow: { flexDirection: "row", marginBottom: 4.5 },
    skillDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: c.accent, marginRight: 6, marginTop: 4 },
    skillText: { flex: 1, fontSize: 8.6 },
    softSkillsWrap: { flexDirection: "row", flexWrap: "wrap" },
    softSkillChip: { fontSize: 8, color: c.heading, backgroundColor: "#ffffff", borderWidth: 1, borderColor: c.accent, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2.5, marginRight: 4, marginBottom: 4 },
    languageBlock: { marginBottom: 11 },
    languageTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
    languageName: { fontSize: 8.9, fontWeight: 700 },
    languageCode: { fontSize: 8, color: c.muted, fontWeight: 700 },
    languageLevelLabel: { fontSize: 8, color: c.muted },
    banner: { height: HEADER_H, backgroundColor: c.banner, paddingHorizontal: 26, justifyContent: "center" },
    name: { fontSize: 23, fontWeight: 700, color: "#ffffff" },
    role: { fontSize: 10.5, color: c.bannerRoleText, letterSpacing: 2, textTransform: "uppercase", marginTop: 10 },
    bannerAccentBar: { height: 5, backgroundColor: c.bannerAccent },
    contentBody: { padding: 26 },
    contentHeading: { fontSize: 11, fontWeight: 700, color: c.heading, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginTop: 17 },
    contentHeadingFirst: { marginTop: 0 },
    summaryText: { fontSize: 9.3, color: c.text, lineHeight: 1.55 },
    entryBlock: { marginBottom: 11 },
    entryPosition: { fontSize: 9.6, fontWeight: 700, color: c.text },
    entryPeriodInline: { fontWeight: 700, color: c.muted },
    entryCompany: { fontSize: 9.2, fontWeight: 700, color: c.accent, marginTop: 1, marginBottom: 3 },
    entryBullet: { fontSize: 8.7, lineHeight: 1.45, marginTop: 2 },
    consent: { marginTop: 22, fontSize: 7.2, color: c.muted, lineHeight: 1.4 },
  });
}

function SidebarPhotoDocument({ cv, c }: { cv: CvRenderData; c: CvThemeColors }) {
  const s = sidebarPhotoStyles(c);
  return (
    <Page size="A4" style={s.page} wrap>
      <View fixed style={s.sidebarBgFixed} />
      <View style={s.row}>
        <View style={s.sidebarCol}>
          {cv.photoUrl ? (
            <Image src={cv.photoUrl} style={s.photo} />
          ) : (
            <View style={s.photoPlaceholder}>
              <Text style={s.photoInitials}>{initials(cv.fullName)}</Text>
            </View>
          )}
          <View style={s.sidebarBody}>
            <Text style={[s.sidebarHeading, { marginTop: 0 }]}>Profil osobisty</Text>
            {cv.location && (
              <View style={s.contactRow}>
                <View style={s.contactIcon}><PdfPinIcon color={c.accent} /></View>
                <Text style={s.contactText}>{cv.location}</Text>
              </View>
            )}
            {cv.phone && (
              <View style={s.contactRow}>
                <View style={s.contactIcon}><PdfPhoneIcon color={c.accent} /></View>
                <Text style={s.contactText}>{cv.phone}</Text>
              </View>
            )}
            <View style={s.contactRow}>
              <View style={s.contactIcon}><PdfMailIcon color={c.accent} /></View>
              <Text style={s.contactText}>{cv.email}</Text>
            </View>
            {cv.linkedinUrl && (
              <View style={s.contactRow}>
                <View style={s.contactIcon}><PdfGlobeIcon color={c.accent} /></View>
                <Text style={s.contactText}>{cv.linkedinUrl}</Text>
              </View>
            )}
            {cv.skills.length > 0 && (
              <View>
                <Text style={s.sidebarHeading}>Umiejętności</Text>
                {cv.skills.map((skill, i) => (
                  <View key={i} style={s.skillRow}>
                    <View style={s.skillDot} />
                    <Text style={s.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            )}
            {cv.softSkills.length > 0 && (
              <View>
                <Text style={s.sidebarHeading}>Umiejętności miękkie</Text>
                <View style={s.softSkillsWrap}>
                  {cv.softSkills.map((skill, i) => (
                    <Text key={i} style={s.softSkillChip}>{skill}</Text>
                  ))}
                </View>
              </View>
            )}
            {cv.languages.length > 0 && (
              <View>
                <Text style={s.sidebarHeading}>Języki</Text>
                {cv.languages.map((lang, i) => (
                  <View key={i} style={s.languageBlock}>
                    <View style={s.languageTopRow}>
                      <Text style={s.languageName}>{lang.name}:</Text>
                      {lang.level !== "native" && <Text style={s.languageCode}>{lang.level}</Text>}
                    </View>
                    {lang.level === "native" ? (
                      <Text style={s.languageLevelLabel}>Język ojczysty</Text>
                    ) : (
                      <>
                        <LanguageBars filled={LanguageLevelBars[lang.level]} color={c.accent} empty={c.barEmpty} />
                        <Text style={s.languageLevelLabel}>{LanguageLevelLabels[lang.level]}</Text>
                      </>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={s.contentCol}>
          <View style={s.banner}>
            <Text style={s.name}>{cv.fullName}</Text>
            {cv.headline && <Text style={s.role}>{cv.headline}</Text>}
          </View>
          <View style={s.bannerAccentBar} />
          <View style={s.contentBody}>
            {cv.summary && (
              <View>
                <Text style={[s.contentHeading, s.contentHeadingFirst]}>Podsumowanie</Text>
                <Text style={s.summaryText}>{cv.summary}</Text>
              </View>
            )}
            {cv.experience.length > 0 && (
              <View>
                <Text style={s.contentHeading}>Doświadczenie</Text>
                {cv.experience.map((item, i) => (
                  <View key={i} style={s.entryBlock} wrap={false}>
                    <Text style={s.entryPosition}>
                      {item.position.toUpperCase()}, <Text style={s.entryPeriodInline}>{item.period}</Text>
                    </Text>
                    <Text style={s.entryCompany}>{item.company}</Text>
                    {item.highlights.map((h, j) => (
                      <Text key={j} style={s.entryBullet}>• {h}</Text>
                    ))}
                  </View>
                ))}
              </View>
            )}
            {cv.education.length > 0 && (
              <View>
                <Text style={s.contentHeading}>Wykształcenie</Text>
                {cv.education.map((item, i) => (
                  <View key={i} style={s.entryBlock} wrap={false}>
                    <Text style={s.entryPosition}>
                      {item.degree}, <Text style={s.entryPeriodInline}>{item.period}</Text>
                    </Text>
                    <Text style={s.entryCompany}>{item.school}</Text>
                  </View>
                ))}
              </View>
            )}
            <Text style={s.consent}>{CONSENT_TEXT}</Text>
          </View>
        </View>
      </View>
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Layout: minimal — single column, no sidebar, generous whitespace.
// ---------------------------------------------------------------------------

function minimalStyles(c: CvThemeColors) {
  return StyleSheet.create({
    page: { fontFamily: "Open Sans", fontSize: 9.3, color: c.text, lineHeight: 1.35, padding: 36 },
    name: { fontSize: 24, fontWeight: 700, color: c.heading },
    role: { fontSize: 10.5, color: c.accent, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 6 },
    rule: { height: 1.5, backgroundColor: c.accent, marginTop: 14, marginBottom: 12, width: 46 },
    contactRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 18 },
    contactItem: { flexDirection: "row", alignItems: "center", marginRight: 16, marginBottom: 4 },
    contactIcon: { marginRight: 5 },
    contactText: { fontSize: 8.6, color: c.muted },
    sectionHeading: { fontSize: 10.5, fontWeight: 700, color: c.heading, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8, marginTop: 16 },
    sectionHeadingFirst: { marginTop: 0 },
    summaryText: { fontSize: 9.3, color: c.text, lineHeight: 1.6 },
    entryBlock: { marginBottom: 12 },
    entryTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
    entryPosition: { fontSize: 9.8, fontWeight: 700, color: c.text },
    entryPeriod: { fontSize: 8.4, color: c.muted },
    entryCompany: { fontSize: 9, fontWeight: 700, color: c.accent, marginTop: 1, marginBottom: 3 },
    entryBullet: { fontSize: 8.7, lineHeight: 1.45, marginTop: 2 },
    tagsWrap: { flexDirection: "row", flexWrap: "wrap" },
    tag: { fontSize: 8.3, color: c.text, backgroundColor: c.sidebarBg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginRight: 5, marginBottom: 5 },
    langRow: { flexDirection: "row", flexWrap: "wrap" },
    langItem: { fontSize: 8.6, marginRight: 18, marginBottom: 6 },
    langName: { fontWeight: 700 },
    langLevel: { color: c.muted },
    consent: { marginTop: 20, fontSize: 7.2, color: c.muted, lineHeight: 1.4 },
  });
}

function MinimalDocument({ cv, c }: { cv: CvRenderData; c: CvThemeColors }) {
  const s = minimalStyles(c);
  return (
    <Page size="A4" style={s.page} wrap>
      <Text style={s.name}>{cv.fullName}</Text>
      {cv.headline && <Text style={s.role}>{cv.headline}</Text>}
      <View style={s.rule} />
      <View style={s.contactRow}>
        {cv.location && (
          <View style={s.contactItem}><View style={s.contactIcon}><PdfPinIcon color={c.accent} /></View><Text style={s.contactText}>{cv.location}</Text></View>
        )}
        {cv.phone && (
          <View style={s.contactItem}><View style={s.contactIcon}><PdfPhoneIcon color={c.accent} /></View><Text style={s.contactText}>{cv.phone}</Text></View>
        )}
        <View style={s.contactItem}><View style={s.contactIcon}><PdfMailIcon color={c.accent} /></View><Text style={s.contactText}>{cv.email}</Text></View>
        {cv.linkedinUrl && (
          <View style={s.contactItem}><View style={s.contactIcon}><PdfGlobeIcon color={c.accent} /></View><Text style={s.contactText}>{cv.linkedinUrl}</Text></View>
        )}
      </View>

      {cv.summary && (
        <View>
          <Text style={[s.sectionHeading, s.sectionHeadingFirst]}>Podsumowanie</Text>
          <Text style={s.summaryText}>{cv.summary}</Text>
        </View>
      )}

      {cv.experience.length > 0 && (
        <View>
          <Text style={s.sectionHeading}>Doświadczenie</Text>
          {cv.experience.map((item, i) => (
            <View key={i} style={s.entryBlock} wrap={false}>
              <View style={s.entryTopRow}>
                <Text style={s.entryPosition}>{item.position}</Text>
                <Text style={s.entryPeriod}>{item.period}</Text>
              </View>
              <Text style={s.entryCompany}>{item.company}</Text>
              {item.highlights.map((h, j) => (
                <Text key={j} style={s.entryBullet}>• {h}</Text>
              ))}
            </View>
          ))}
        </View>
      )}

      {cv.education.length > 0 && (
        <View>
          <Text style={s.sectionHeading}>Wykształcenie</Text>
          {cv.education.map((item, i) => (
            <View key={i} style={s.entryBlock} wrap={false}>
              <View style={s.entryTopRow}>
                <Text style={s.entryPosition}>{item.degree}</Text>
                <Text style={s.entryPeriod}>{item.period}</Text>
              </View>
              <Text style={s.entryCompany}>{item.school}</Text>
            </View>
          ))}
        </View>
      )}

      {cv.skills.length > 0 && (
        <View>
          <Text style={s.sectionHeading}>Umiejętności</Text>
          <View style={s.tagsWrap}>
            {cv.skills.map((skill, i) => <Text key={i} style={s.tag}>{skill}</Text>)}
          </View>
        </View>
      )}

      {cv.softSkills.length > 0 && (
        <View>
          <Text style={s.sectionHeading}>Umiejętności miękkie</Text>
          <View style={s.tagsWrap}>
            {cv.softSkills.map((skill, i) => <Text key={i} style={s.tag}>{skill}</Text>)}
          </View>
        </View>
      )}

      {cv.languages.length > 0 && (
        <View>
          <Text style={s.sectionHeading}>Języki</Text>
          <View style={s.langRow}>
            {cv.languages.map((lang, i) => (
              <Text key={i} style={s.langItem}>
                <Text style={s.langName}>{lang.name}</Text>{" "}
                <Text style={s.langLevel}>
                  {lang.level === "native" ? "— język ojczysty" : `— ${LanguageLevelLabels[lang.level]}`}
                </Text>
              </Text>
            ))}
          </View>
        </View>
      )}

      <Text style={s.consent}>{CONSENT_TEXT}</Text>
    </Page>
  );
}

// ---------------------------------------------------------------------------
// Layout: timeline-dark — full-height dark sidebar, accent-bordered timeline.
// ---------------------------------------------------------------------------

function timelineStyles(c: CvThemeColors) {
  return StyleSheet.create({
    page: { fontFamily: "Open Sans", fontSize: 9.3, color: c.text, lineHeight: 1.35 },
    sidebarBgFixed: { position: "absolute", top: 0, left: 0, bottom: 0, width: SIDEBAR_W, backgroundColor: c.sidebarBg },
    row: { flexDirection: "row" },
    sidebarCol: { width: SIDEBAR_W, padding: 22, paddingTop: 30 },
    contentCol: { width: CONTENT_W, padding: 26 },
    photo: { width: 74, height: 74, borderRadius: 37, objectFit: "cover", marginBottom: 14 },
    photoPlaceholder: { width: 74, height: 74, borderRadius: 37, backgroundColor: c.bannerAccent, alignItems: "center", justifyContent: "center", marginBottom: 14 },
    photoInitials: { color: "#ffffff", fontSize: 22, fontWeight: 700 },
    name: { fontSize: 18, fontWeight: 700, color: "#ffffff" },
    role: { fontSize: 9, color: c.bannerRoleText, letterSpacing: 1.2, textTransform: "uppercase", marginTop: 6, marginBottom: 16 },
    sidebarHeading: { fontSize: 9, fontWeight: 700, color: "#ffffff", textTransform: "uppercase", letterSpacing: 1, marginBottom: 9, marginTop: 16 },
    contactRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 7 },
    contactIcon: { marginRight: 6, marginTop: 1 },
    contactText: { flex: 1, color: c.bannerRoleText, fontSize: 8.4, lineHeight: 1.35 },
    skillRow: { flexDirection: "row", marginBottom: 4.5 },
    skillDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: c.bannerAccent, marginRight: 6, marginTop: 4 },
    skillText: { flex: 1, fontSize: 8.4, color: c.bannerRoleText },
    softSkillsWrap: { flexDirection: "row", flexWrap: "wrap" },
    softSkillChip: { fontSize: 7.6, color: c.bannerRoleText, borderWidth: 1, borderColor: c.bannerAccent, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2.5, marginRight: 4, marginBottom: 4 },
    languageBlock: { marginBottom: 10 },
    languageTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
    languageName: { fontSize: 8.6, fontWeight: 700, color: "#ffffff" },
    languageCode: { fontSize: 7.8, color: c.bannerRoleText, fontWeight: 700 },
    languageLevelLabel: { fontSize: 7.8, color: c.bannerRoleText },
    contentHeading: { fontSize: 11, fontWeight: 700, color: c.heading, textTransform: "uppercase", letterSpacing: 1, marginBottom: 9, marginTop: 18 },
    contentHeadingFirst: { marginTop: 0 },
    summaryText: { fontSize: 9.3, color: c.text, lineHeight: 1.55 },
    entryBlock: { marginBottom: 12, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: c.accent },
    entryDot: { position: "absolute", left: -4.5, top: 2, width: 7, height: 7, borderRadius: 3.5, backgroundColor: c.accent },
    entryPosition: { fontSize: 9.6, fontWeight: 700, color: c.text },
    entryPeriodInline: { fontWeight: 700, color: c.muted },
    entryCompany: { fontSize: 9.2, fontWeight: 700, color: c.heading, marginTop: 1, marginBottom: 3 },
    entryBullet: { fontSize: 8.7, lineHeight: 1.45, marginTop: 2 },
    consent: { marginTop: 20, fontSize: 7.2, color: c.muted, lineHeight: 1.4 },
  });
}

function TimelineDocument({ cv, c }: { cv: CvRenderData; c: CvThemeColors }) {
  const s = timelineStyles(c);
  return (
    <Page size="A4" style={s.page} wrap>
      <View fixed style={s.sidebarBgFixed} />
      <View style={s.row}>
        <View style={s.sidebarCol}>
          {cv.photoUrl ? (
            <Image src={cv.photoUrl} style={s.photo} />
          ) : (
            <View style={s.photoPlaceholder}>
              <Text style={s.photoInitials}>{initials(cv.fullName)}</Text>
            </View>
          )}
          <Text style={s.name}>{cv.fullName}</Text>
          {cv.headline && <Text style={s.role}>{cv.headline}</Text>}

          {cv.location && (
            <View style={s.contactRow}>
              <View style={s.contactIcon}><PdfPinIcon color={c.bannerAccent} /></View>
              <Text style={s.contactText}>{cv.location}</Text>
            </View>
          )}
          {cv.phone && (
            <View style={s.contactRow}>
              <View style={s.contactIcon}><PdfPhoneIcon color={c.bannerAccent} /></View>
              <Text style={s.contactText}>{cv.phone}</Text>
            </View>
          )}
          <View style={s.contactRow}>
            <View style={s.contactIcon}><PdfMailIcon color={c.bannerAccent} /></View>
            <Text style={s.contactText}>{cv.email}</Text>
          </View>
          {cv.linkedinUrl && (
            <View style={s.contactRow}>
              <View style={s.contactIcon}><PdfGlobeIcon color={c.bannerAccent} /></View>
              <Text style={s.contactText}>{cv.linkedinUrl}</Text>
            </View>
          )}

          {cv.skills.length > 0 && (
            <View>
              <Text style={s.sidebarHeading}>Umiejętności</Text>
              {cv.skills.map((skill, i) => (
                <View key={i} style={s.skillRow}>
                  <View style={s.skillDot} />
                  <Text style={s.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          )}

          {cv.softSkills.length > 0 && (
            <View>
              <Text style={s.sidebarHeading}>Umiejętności miękkie</Text>
              <View style={s.softSkillsWrap}>
                {cv.softSkills.map((skill, i) => (
                  <Text key={i} style={s.softSkillChip}>{skill}</Text>
                ))}
              </View>
            </View>
          )}

          {cv.languages.length > 0 && (
            <View>
              <Text style={s.sidebarHeading}>Języki</Text>
              {cv.languages.map((lang, i) => (
                <View key={i} style={s.languageBlock}>
                  <View style={s.languageTopRow}>
                    <Text style={s.languageName}>{lang.name}:</Text>
                    {lang.level !== "native" && <Text style={s.languageCode}>{lang.level}</Text>}
                  </View>
                  {lang.level === "native" ? (
                    <Text style={s.languageLevelLabel}>Język ojczysty</Text>
                  ) : (
                    <>
                      <LanguageBars filled={LanguageLevelBars[lang.level]} color={c.bannerAccent} empty={c.barEmpty} />
                      <Text style={s.languageLevelLabel}>{LanguageLevelLabels[lang.level]}</Text>
                    </>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={s.contentCol}>
          {cv.summary && (
            <View>
              <Text style={[s.contentHeading, s.contentHeadingFirst]}>Podsumowanie</Text>
              <Text style={s.summaryText}>{cv.summary}</Text>
            </View>
          )}
          {cv.experience.length > 0 && (
            <View>
              <Text style={s.contentHeading}>Doświadczenie</Text>
              {cv.experience.map((item, i) => (
                <View key={i} style={s.entryBlock} wrap={false}>
                  <View style={s.entryDot} />
                  <Text style={s.entryPosition}>
                    {item.position.toUpperCase()}, <Text style={s.entryPeriodInline}>{item.period}</Text>
                  </Text>
                  <Text style={s.entryCompany}>{item.company}</Text>
                  {item.highlights.map((h, j) => (
                    <Text key={j} style={s.entryBullet}>• {h}</Text>
                  ))}
                </View>
              ))}
            </View>
          )}
          {cv.education.length > 0 && (
            <View>
              <Text style={s.contentHeading}>Wykształcenie</Text>
              {cv.education.map((item, i) => (
                <View key={i} style={s.entryBlock} wrap={false}>
                  <View style={s.entryDot} />
                  <Text style={s.entryPosition}>
                    {item.degree}, <Text style={s.entryPeriodInline}>{item.period}</Text>
                  </Text>
                  <Text style={s.entryCompany}>{item.school}</Text>
                </View>
              ))}
            </View>
          )}
          <Text style={s.consent}>{CONSENT_TEXT}</Text>
        </View>
      </View>
    </Page>
  );
}

function layoutDocument(layout: CvLayout, cv: CvRenderData, c: CvThemeColors) {
  switch (layout) {
    case "minimal":
      return <MinimalDocument cv={cv} c={c} />;
    case "timeline-dark":
      return <TimelineDocument cv={cv} c={c} />;
    case "sidebar-photo":
    default:
      return <SidebarPhotoDocument cv={cv} c={c} />;
  }
}

export async function renderCvToPdfBuffer(cv: CvRenderData, templateId: string = "classic-teal"): Promise<Buffer> {
  const template = getCvTemplate(templateId);
  return renderToBuffer(<Document>{layoutDocument(template.layout, cv, template.colors)}</Document>);
}

import type { GeneratedCvContent } from "@/lib/cv-schema";
import { LanguageLevelLabels, LanguageLevelBars, type LanguageLevels } from "@/lib/definitions";
import { normalizeExternalUrl, type CvThemeColors } from "@/lib/cv-templates";
import { MapPinIcon, PhoneIcon, MailIcon, GlobeIcon } from "@/app/components/icons";

// HTML/Tailwind mirror of lib/cv-pdf.tsx's three layouts — same CvThemeColors
// values drive both, but the JSX is necessarily separate per render target.
// Keep structure changes here mirrored there and vice versa.

type LanguageLevel = (typeof LanguageLevels)[number];

export type CvPreviewData = GeneratedCvContent & {
  fullName: string;
  email: string;
  phone: string | null;
  location: string | null;
  linkedinUrl: string | null;
  photoUrl: string | null;
  languages: { id: string; name: string; level: LanguageLevel }[];
};

const CONSENT_TEXT =
  "Wyrażam zgodę na przetwarzanie moich danych osobowych w celu prowadzenia rekrutacji na aplikowane przeze mnie stanowisko.";

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
    <div className="mt-1.5 mb-1 flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="h-1 w-4 rounded-full" style={{ backgroundColor: i < filled ? color : empty }} />
      ))}
    </div>
  );
}

export function CvTemplatePreview({ cv, colors, layout }: { cv: CvPreviewData; colors: CvThemeColors; layout: "sidebar-photo" | "minimal" | "timeline-dark" }) {
  if (layout === "minimal") return <MinimalPreview cv={cv} c={colors} />;
  if (layout === "timeline-dark") return <TimelinePreview cv={cv} c={colors} />;
  return <SidebarPhotoPreview cv={cv} c={colors} />;
}

// ---------------------------------------------------------------------------
// Layout: sidebar-photo
// ---------------------------------------------------------------------------

function SidebarPhotoPreview({ cv, c }: { cv: CvPreviewData; c: CvThemeColors }) {
  return (
    <div className="flex flex-col sm:flex-row" style={{ color: c.text }}>
      <div className="shrink-0 sm:w-[35%]" style={{ backgroundColor: c.sidebarBg }}>
        {cv.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cv.photoUrl} alt={cv.fullName} className="h-40 w-full object-cover sm:h-44" />
        ) : (
          <div className="flex h-40 w-full items-center justify-center sm:h-44" style={{ backgroundColor: c.banner }}>
            <span className="text-4xl font-bold text-white">{initials(cv.fullName)}</span>
          </div>
        )}
        <div className="flex flex-col gap-6 p-5">
          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: c.heading }}>Profil osobisty</h2>
            <div className="flex flex-col gap-2.5 text-sm">
              {cv.location && <div className="flex items-start gap-2"><MapPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: c.accent }} /><span>{cv.location}</span></div>}
              {cv.phone && <div className="flex items-start gap-2"><PhoneIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: c.accent }} /><span>{cv.phone}</span></div>}
              <div className="flex items-start gap-2"><MailIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: c.accent }} /><span className="break-all">{cv.email}</span></div>
              {cv.linkedinUrl && (
                <div className="flex items-start gap-2">
                  <GlobeIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: c.accent }} />
                  <a href={normalizeExternalUrl(cv.linkedinUrl)} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: c.accent }}>
                    LinkedIn
                  </a>
                </div>
              )}
            </div>
          </div>

          {cv.skills.length > 0 && (
            <div>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: c.heading }}>Umiejętności</h2>
              <ul className="flex flex-col gap-1.5 text-sm">
                {cv.skills.map((skill, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: c.accent }} />
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {cv.softSkills.length > 0 && (
            <div>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: c.heading }}>Umiejętności miękkie</h2>
              <div className="flex flex-wrap gap-1.5">
                {cv.softSkills.map((skill, i) => (
                  <span key={i} className="rounded-full border bg-white px-2 py-1 text-xs" style={{ borderColor: c.accent, color: c.heading }}>{skill}</span>
                ))}
              </div>
            </div>
          )}

          {cv.languages.length > 0 && (
            <div>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: c.heading }}>Języki</h2>
              <div className="flex flex-col gap-3">
                {cv.languages.map((lang) => (
                  <div key={lang.id} className="text-sm">
                    <div className="flex items-baseline justify-between">
                      <span className="font-semibold">{lang.name}:</span>
                      {lang.level !== "native" && <span className="text-xs font-semibold" style={{ color: c.muted }}>{lang.level}</span>}
                    </div>
                    {lang.level === "native" ? (
                      <span className="text-xs" style={{ color: c.muted }}>Język ojczysty</span>
                    ) : (
                      <>
                        <LanguageBars filled={LanguageLevelBars[lang.level]} color={c.accent} empty={c.barEmpty} />
                        <span className="text-xs" style={{ color: c.muted }}>{LanguageLevelLabels[lang.level]}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 bg-white">
        <div className="px-7 py-8" style={{ backgroundColor: c.banner }}>
          <h1 className="text-3xl font-bold text-white">{cv.fullName}</h1>
          {cv.headline && <p className="mt-2.5 text-sm uppercase tracking-[0.2em]" style={{ color: c.bannerRoleText }}>{cv.headline}</p>}
        </div>
        <div className="h-1.5" style={{ backgroundColor: c.bannerAccent }} />
        <div className="flex flex-col gap-6 px-7 py-7">
          {cv.summary && (
            <section>
              <h2 className="mb-2.5 text-sm font-bold uppercase tracking-widest" style={{ color: c.heading }}>Podsumowanie</h2>
              <p className="text-sm leading-relaxed">{cv.summary}</p>
            </section>
          )}
          {cv.experience.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-widest" style={{ color: c.heading }}>Doświadczenie</h2>
              <div className="flex flex-col gap-4">
                {cv.experience.map((item, i) => (
                  <div key={i}>
                    <p className="text-sm font-bold"><span className="uppercase">{item.position}</span>, <span style={{ color: c.muted }}>{item.period}</span></p>
                    <p className="mb-1.5 text-sm font-bold" style={{ color: c.accent }}>{item.company}</p>
                    {item.highlights.length > 0 && (
                      <ul className="flex flex-col gap-1 text-sm leading-relaxed">
                        {item.highlights.map((h, j) => <li key={j}>• {h}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
          {cv.education.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-widest" style={{ color: c.heading }}>Wykształcenie</h2>
              <div className="flex flex-col gap-3">
                {cv.education.map((item, i) => (
                  <div key={i}>
                    <p className="text-sm font-bold">{item.degree}, <span style={{ color: c.muted }}>{item.period}</span></p>
                    <p className="text-sm font-bold" style={{ color: c.accent }}>{item.school}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
          <p className="text-xs leading-relaxed" style={{ color: c.muted }}>{CONSENT_TEXT}</p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Layout: minimal
// ---------------------------------------------------------------------------

function MinimalPreview({ cv, c }: { cv: CvPreviewData; c: CvThemeColors }) {
  return (
    <div className="bg-white px-9 py-9" style={{ color: c.text }}>
      <h1 className="text-3xl font-bold" style={{ color: c.heading }}>{cv.fullName}</h1>
      {cv.headline && <p className="mt-1.5 text-sm uppercase tracking-[0.15em]" style={{ color: c.accent }}>{cv.headline}</p>}
      <div className="mt-3.5 mb-4 h-[3px] w-12" style={{ backgroundColor: c.accent }} />

      <div className="mb-6 flex flex-wrap gap-x-5 gap-y-1.5 text-sm" style={{ color: c.muted }}>
        {cv.location && <span className="flex items-center gap-1.5"><MapPinIcon className="h-3.5 w-3.5" style={{ color: c.accent }} />{cv.location}</span>}
        {cv.phone && <span className="flex items-center gap-1.5"><PhoneIcon className="h-3.5 w-3.5" style={{ color: c.accent }} />{cv.phone}</span>}
        <span className="flex items-center gap-1.5"><MailIcon className="h-3.5 w-3.5" style={{ color: c.accent }} />{cv.email}</span>
        {cv.linkedinUrl && (
          <span className="flex items-center gap-1.5">
            <GlobeIcon className="h-3.5 w-3.5" style={{ color: c.accent }} />
            <a href={normalizeExternalUrl(cv.linkedinUrl)} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: c.accent }}>
              LinkedIn
            </a>
          </span>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {cv.summary && (
          <section>
            <h2 className="mb-2.5 text-sm font-bold uppercase tracking-widest" style={{ color: c.heading }}>Podsumowanie</h2>
            <p className="text-sm leading-relaxed">{cv.summary}</p>
          </section>
        )}
        {cv.experience.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest" style={{ color: c.heading }}>Doświadczenie</h2>
            <div className="flex flex-col gap-4">
              {cv.experience.map((item, i) => (
                <div key={i}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-bold">{item.position}</p>
                    <p className="shrink-0 text-xs" style={{ color: c.muted }}>{item.period}</p>
                  </div>
                  <p className="mb-1.5 text-sm font-bold" style={{ color: c.accent }}>{item.company}</p>
                  {item.highlights.length > 0 && (
                    <ul className="flex flex-col gap-1 text-sm leading-relaxed">
                      {item.highlights.map((h, j) => <li key={j}>• {h}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
        {cv.education.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest" style={{ color: c.heading }}>Wykształcenie</h2>
            <div className="flex flex-col gap-3">
              {cv.education.map((item, i) => (
                <div key={i} className="flex items-baseline justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">{item.degree}</p>
                    <p className="text-sm font-bold" style={{ color: c.accent }}>{item.school}</p>
                  </div>
                  <p className="shrink-0 text-xs" style={{ color: c.muted }}>{item.period}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        {cv.skills.length > 0 && (
          <section>
            <h2 className="mb-2.5 text-sm font-bold uppercase tracking-widest" style={{ color: c.heading }}>Umiejętności</h2>
            <div className="flex flex-wrap gap-1.5">
              {cv.skills.map((skill, i) => (
                <span key={i} className="rounded-full px-2.5 py-1 text-xs" style={{ backgroundColor: c.sidebarBg, color: c.text }}>{skill}</span>
              ))}
            </div>
          </section>
        )}
        {cv.softSkills.length > 0 && (
          <section>
            <h2 className="mb-2.5 text-sm font-bold uppercase tracking-widest" style={{ color: c.heading }}>Umiejętności miękkie</h2>
            <div className="flex flex-wrap gap-1.5">
              {cv.softSkills.map((skill, i) => (
                <span key={i} className="rounded-full px-2.5 py-1 text-xs" style={{ backgroundColor: c.sidebarBg, color: c.text }}>{skill}</span>
              ))}
            </div>
          </section>
        )}
        {cv.languages.length > 0 && (
          <section>
            <h2 className="mb-2.5 text-sm font-bold uppercase tracking-widest" style={{ color: c.heading }}>Języki</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
              {cv.languages.map((lang) => (
                <span key={lang.id}>
                  <span className="font-semibold">{lang.name}</span>{" "}
                  <span style={{ color: c.muted }}>{lang.level === "native" ? "— język ojczysty" : `— ${LanguageLevelLabels[lang.level]}`}</span>
                </span>
              ))}
            </div>
          </section>
        )}
        <p className="text-xs leading-relaxed" style={{ color: c.muted }}>{CONSENT_TEXT}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Layout: timeline-dark
// ---------------------------------------------------------------------------

function TimelinePreview({ cv, c }: { cv: CvPreviewData; c: CvThemeColors }) {
  return (
    <div className="flex flex-col sm:flex-row">
      <div className="shrink-0 p-6 sm:w-[35%]" style={{ backgroundColor: c.sidebarBg }}>
        {cv.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cv.photoUrl} alt={cv.fullName} className="mb-4 h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: c.bannerAccent }}>
            <span className="text-xl font-bold text-white">{initials(cv.fullName)}</span>
          </div>
        )}
        <h1 className="text-xl font-bold text-white">{cv.fullName}</h1>
        {cv.headline && <p className="mb-5 mt-1.5 text-xs uppercase tracking-widest" style={{ color: c.bannerRoleText }}>{cv.headline}</p>}

        <div className="flex flex-col gap-2 text-sm" style={{ color: c.bannerRoleText }}>
          {cv.location && <div className="flex items-start gap-2"><MapPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: c.bannerAccent }} /><span>{cv.location}</span></div>}
          {cv.phone && <div className="flex items-start gap-2"><PhoneIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: c.bannerAccent }} /><span>{cv.phone}</span></div>}
          <div className="flex items-start gap-2"><MailIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: c.bannerAccent }} /><span className="break-all">{cv.email}</span></div>
          {cv.linkedinUrl && (
            <div className="flex items-start gap-2">
              <GlobeIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: c.bannerAccent }} />
              <a href={normalizeExternalUrl(cv.linkedinUrl)} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: c.bannerAccent }}>
                LinkedIn
              </a>
            </div>
          )}
        </div>

        {cv.skills.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-white">Umiejętności</h2>
            <ul className="flex flex-col gap-1.5 text-sm" style={{ color: c.bannerRoleText }}>
              {cv.skills.map((skill, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: c.bannerAccent }} />
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        )}

        {cv.softSkills.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-white">Umiejętności miękkie</h2>
            <div className="flex flex-wrap gap-1.5">
              {cv.softSkills.map((skill, i) => (
                <span key={i} className="rounded-full border px-2 py-1 text-xs" style={{ borderColor: c.bannerAccent, color: c.bannerRoleText }}>{skill}</span>
              ))}
            </div>
          </div>
        )}

        {cv.languages.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-white">Języki</h2>
            <div className="flex flex-col gap-3">
              {cv.languages.map((lang) => (
                <div key={lang.id} className="text-sm">
                  <div className="flex items-baseline justify-between">
                    <span className="font-semibold text-white">{lang.name}:</span>
                    {lang.level !== "native" && <span className="text-xs font-semibold" style={{ color: c.bannerRoleText }}>{lang.level}</span>}
                  </div>
                  {lang.level === "native" ? (
                    <span className="text-xs" style={{ color: c.bannerRoleText }}>Język ojczysty</span>
                  ) : (
                    <>
                      <LanguageBars filled={LanguageLevelBars[lang.level]} color={c.bannerAccent} empty={c.barEmpty} />
                      <span className="text-xs" style={{ color: c.bannerRoleText }}>{LanguageLevelLabels[lang.level]}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 bg-white px-7 py-8" style={{ color: c.text }}>
        {cv.summary && (
          <section className="mb-6">
            <h2 className="mb-2.5 text-sm font-bold uppercase tracking-widest" style={{ color: c.heading }}>Podsumowanie</h2>
            <p className="text-sm leading-relaxed">{cv.summary}</p>
          </section>
        )}
        {cv.experience.length > 0 && (
          <section className="mb-6">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest" style={{ color: c.heading }}>Doświadczenie</h2>
            <div className="flex flex-col gap-5">
              {cv.experience.map((item, i) => (
                <div key={i} className="border-l-2 pl-4" style={{ borderColor: c.accent }}>
                  <p className="text-sm font-bold"><span className="uppercase">{item.position}</span>, <span style={{ color: c.muted }}>{item.period}</span></p>
                  <p className="mb-1.5 text-sm font-bold" style={{ color: c.heading }}>{item.company}</p>
                  {item.highlights.length > 0 && (
                    <ul className="flex flex-col gap-1 text-sm leading-relaxed">
                      {item.highlights.map((h, j) => <li key={j}>• {h}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
        {cv.education.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest" style={{ color: c.heading }}>Wykształcenie</h2>
            <div className="flex flex-col gap-3">
              {cv.education.map((item, i) => (
                <div key={i} className="border-l-2 pl-4" style={{ borderColor: c.accent }}>
                  <p className="text-sm font-bold">{item.degree}, <span style={{ color: c.muted }}>{item.period}</span></p>
                  <p className="text-sm font-bold" style={{ color: c.heading }}>{item.school}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        <p className="mt-6 text-xs leading-relaxed" style={{ color: c.muted }}>{CONSENT_TEXT}</p>
      </div>
    </div>
  );
}

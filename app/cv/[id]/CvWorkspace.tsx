"use client";

import { useState } from "react";
import Link from "next/link";
import type { GeneratedCvContent } from "@/lib/cv-schema";
import { CV_TEMPLATES, getCvTemplate, isPremiumTemplate } from "@/lib/cv-templates";
import { CvTemplatePreview, type CvPreviewData } from "@/app/cv/[id]/templates";
import { buttonPrimary, buttonSecondary, buttonGhost, input, label as labelClass, errorText } from "@/lib/ui";
import { LockIcon, CheckCircleIcon } from "@/app/components/icons";

type StaticCvData = {
  fullName: string;
  email: string;
  phone: string | null;
  location: string | null;
  linkedinUrl: string | null;
  photoUrl: string | null;
  languages: { id: string; name: string; level: CvPreviewData["languages"][number]["level"] }[];
};

export function CvWorkspace({
  generatedCvId,
  initialTemplateId,
  initialContent,
  premiumActive,
  staticData,
}: {
  generatedCvId: string;
  initialTemplateId: string;
  initialContent: GeneratedCvContent;
  premiumActive: boolean;
  staticData: StaticCvData;
}) {
  const [templateId, setTemplateId] = useState(initialTemplateId);
  const [content, setContent] = useState(initialContent);
  const [draft, setDraft] = useState<GeneratedCvContent>(initialContent);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [savingContent, setSavingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const template = getCvTemplate(templateId);
  const previewData: CvPreviewData = { ...content, ...staticData };

  async function selectTemplate(id: string) {
    if (id === templateId || savingTemplate) return;
    if (isPremiumTemplate(id) && !premiumActive) return;
    setSavingTemplate(true);
    setError(null);
    try {
      const res = await fetch(`/api/cv/${generatedCvId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Nie udało się zmienić szablonu.");
      }
      setTemplateId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się zmienić szablonu.");
    } finally {
      setSavingTemplate(false);
    }
  }

  function startEdit() {
    setDraft(content);
    setMode("edit");
  }

  async function saveContent() {
    setSavingContent(true);
    setError(null);
    // Textareas produce blank trailing lines while typing — strip them only at
    // save time so the user can still freely edit without fields snapping shut.
    const sanitized: GeneratedCvContent = {
      ...draft,
      skills: draft.skills.map((s) => s.trim()).filter(Boolean),
      softSkills: draft.softSkills.map((s) => s.trim()).filter(Boolean),
      experience: draft.experience
        .filter((e) => e.position.trim() || e.company.trim())
        .map((e) => ({ ...e, highlights: e.highlights.map((h) => h.trim()).filter(Boolean) })),
      education: draft.education.filter((e) => e.degree.trim() || e.school.trim()),
    };
    try {
      const res = await fetch(`/api/cv/${generatedCvId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentJson: sanitized }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Nie udało się zapisać zmian.");
      }
      const data = await res.json();
      setContent(data.generatedCv.contentJson as GeneratedCvContent);
      setMode("view");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się zapisać zmian.");
    } finally {
      setSavingContent(false);
    }
  }

  function cancelEdit() {
    setDraft(content);
    setMode("view");
    setError(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-card p-5 print:hidden">
        <div>
          <p className="text-sm font-semibold">Wygląd i treść CV</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Szablon: <span className="font-medium text-foreground">{template.name}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={buttonSecondary} onClick={() => setPickerOpen((v) => !v)}>
            {pickerOpen ? "Ukryj szablony" : "Zmień szablon"}
          </button>
          {mode === "view" ? (
            <button type="button" className={buttonSecondary} onClick={startEdit}>
              Edytuj treść
            </button>
          ) : (
            <>
              <button type="button" className={buttonGhost} onClick={cancelEdit} disabled={savingContent}>
                Anuluj
              </button>
              <button type="button" className={buttonPrimary} onClick={saveContent} disabled={savingContent}>
                {savingContent ? "Zapisywanie…" : "Zapisz zmiany"}
              </button>
            </>
          )}
        </div>
      </div>

      {error && <p className={errorText}>{error}</p>}

      {pickerOpen && (
        <div className="rounded-card border border-border bg-card p-5 print:hidden">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {CV_TEMPLATES.map((t) => {
              const locked = isPremiumTemplate(t.id) && !premiumActive;
              const active = t.id === templateId;
              return (
                <button
                  key={t.id}
                  type="button"
                  disabled={savingTemplate}
                  onClick={() => (locked ? undefined : selectTemplate(t.id))}
                  className={`relative flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-colors ${
                    active ? "border-primary ring-2 ring-primary/20" : "border-border hover:bg-accent-soft"
                  } ${locked ? "cursor-default opacity-70" : "cursor-pointer"}`}
                >
                  <span
                    className="flex h-10 w-full overflow-hidden rounded"
                    style={{ backgroundColor: t.colors.sidebarBg }}
                  >
                    <span className="h-full w-2/5" style={{ backgroundColor: t.colors.banner }} />
                    <span className="h-full flex-1" style={{ backgroundColor: t.colors.bannerAccent }} />
                  </span>
                  <span className="text-xs font-medium">{t.name}</span>
                  {active && <CheckCircleIcon className="absolute right-1.5 top-1.5 h-3.5 w-3.5 text-primary" />}
                  {locked && (
                    <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/70">
                      <LockIcon className="h-4 w-4 text-muted-foreground" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {!premiumActive && (
            <p className="mt-3 text-sm text-muted-foreground">
              Dodatkowe szablony są dostępne w planie{" "}
              <Link href="/dashboard#plan" className="font-medium text-primary hover:underline">
                Premium
              </Link>
              .
            </p>
          )}
        </div>
      )}

      {mode === "edit" ? (
        <CvContentEditor draft={draft} onChange={setDraft} />
      ) : (
        <article
          className="glow-primary overflow-hidden rounded-card border border-border shadow-sm print:border-none print:shadow-none"
        >
          <CvTemplatePreview cv={previewData} colors={template.colors} layout={template.layout} />
        </article>
      )}
    </div>
  );
}

function CvContentEditor({
  draft,
  onChange,
}: {
  draft: GeneratedCvContent;
  onChange: (next: GeneratedCvContent) => void;
}) {
  function set<K extends keyof GeneratedCvContent>(key: K, value: GeneratedCvContent[K]) {
    onChange({ ...draft, [key]: value });
  }

  function updateExperience(i: number, patch: Partial<GeneratedCvContent["experience"][number]>) {
    const next = draft.experience.slice();
    next[i] = { ...next[i], ...patch };
    set("experience", next);
  }

  function updateEducation(i: number, patch: Partial<GeneratedCvContent["education"][number]>) {
    const next = draft.education.slice();
    next[i] = { ...next[i], ...patch };
    set("education", next);
  }

  return (
    <div className="flex flex-col gap-6 rounded-card border border-border bg-card p-6 print:hidden">
      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Nagłówek zawodowy</label>
        <input aria-label="Nagłówek zawodowy" className={input} value={draft.headline} onChange={(e) => set("headline", e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Podsumowanie</label>
        <textarea aria-label="Podsumowanie" className={input} rows={3} value={draft.summary} onChange={(e) => set("summary", e.target.value)} />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className={labelClass}>Doświadczenie</label>
          <button
            type="button"
            className={buttonGhost}
            onClick={() => set("experience", [...draft.experience, { company: "", position: "", period: "", highlights: [] }])}
          >
            + Dodaj pozycję
          </button>
        </div>
        {draft.experience.map((item, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-lg border border-border p-4">
            <div className="flex flex-wrap gap-2">
              <input className={input} placeholder="Stanowisko" value={item.position} onChange={(e) => updateExperience(i, { position: e.target.value })} />
              <input className={input} placeholder="Firma" value={item.company} onChange={(e) => updateExperience(i, { company: e.target.value })} />
              <input className={`${input} sm:max-w-40`} placeholder="Okres" value={item.period} onChange={(e) => updateExperience(i, { period: e.target.value })} />
            </div>
            <textarea
              className={input}
              rows={3}
              placeholder="Punkty (jeden na linię)"
              value={item.highlights.join("\n")}
              onChange={(e) => updateExperience(i, { highlights: e.target.value.split("\n") })}
            />
            <button
              type="button"
              className={`${buttonGhost} self-start text-danger`}
              onClick={() => set("experience", draft.experience.filter((_, j) => j !== i))}
            >
              Usuń pozycję
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className={labelClass}>Wykształcenie</label>
          <button
            type="button"
            className={buttonGhost}
            onClick={() => set("education", [...draft.education, { school: "", degree: "", period: "" }])}
          >
            + Dodaj pozycję
          </button>
        </div>
        {draft.education.map((item, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-lg border border-border p-4">
            <div className="flex flex-wrap gap-2">
              <input className={input} placeholder="Kierunek/stopień" value={item.degree} onChange={(e) => updateEducation(i, { degree: e.target.value })} />
              <input className={input} placeholder="Szkoła" value={item.school} onChange={(e) => updateEducation(i, { school: e.target.value })} />
              <input className={`${input} sm:max-w-40`} placeholder="Okres" value={item.period} onChange={(e) => updateEducation(i, { period: e.target.value })} />
            </div>
            <button
              type="button"
              className={`${buttonGhost} self-start text-danger`}
              onClick={() => set("education", draft.education.filter((_, j) => j !== i))}
            >
              Usuń pozycję
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Umiejętności (jedna na linię)</label>
        <textarea className={input} rows={4} value={draft.skills.join("\n")} onChange={(e) => set("skills", e.target.value.split("\n"))} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Umiejętności miękkie (jedna na linię)</label>
        <textarea className={input} rows={3} value={draft.softSkills.join("\n")} onChange={(e) => set("softSkills", e.target.value.split("\n"))} />
      </div>
    </div>
  );
}

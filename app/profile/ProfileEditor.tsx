"use client";

import { useState } from "react";
import type { SkillLevels, LanguageLevels } from "@/lib/definitions";
import { LanguageLevelLabels, LanguageLevelBars } from "@/lib/definitions";
import { input, buttonPrimary, buttonSecondary, errorText, card, tag } from "@/lib/ui";
import { DateSelect } from "@/app/profile/DateSelect";
import {
  UserIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  TargetIcon,
  HeartIcon,
  GlobeIcon,
  CameraIcon,
  CheckCircleIcon,
} from "@/app/components/icons";

type SkillLevel = (typeof SkillLevels)[number];
type LanguageLevel = (typeof LanguageLevels)[number];

type Experience = {
  id: string;
  companyName: string;
  position: string;
  description: string;
  startDate: string;
  endDate: string;
};

type Education = {
  id: string;
  schoolName: string;
  degree: string;
  startDate: string;
  endDate: string;
};

type Skill = {
  id: string;
  name: string;
  level: SkillLevel | null;
  category: string;
};

type Interest = { id: string; name: string };

type Language = { id: string; name: string; level: LanguageLevel };

type InitialData = {
  headline: string;
  summary: string;
  location: string;
  phone: string;
  linkedinUrl: string;
  photoUrl: string | null;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  interests: Interest[];
  languages: Language[];
};

const SKILL_LEVEL_OPTIONS: SkillLevel[] = ["podstawowy", "sredni", "zaawansowany", "ekspert"];
const LANGUAGE_LEVEL_OPTIONS: LanguageLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2", "native"];
const MAX_PHOTO_BYTES = 3 * 1024 * 1024;

const subFormClass = "flex flex-col gap-3 rounded-lg border border-dashed border-border p-4";
const listItemClass = "rounded-lg border border-border p-4";
const deleteButtonClass =
  "shrink-0 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger";

function SectionTitle({ icon: Icon, children }: { icon: typeof UserIcon; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2.5 text-lg font-semibold">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent-soft-foreground">
        <Icon className="h-4 w-4" />
      </span>
      {children}
    </h2>
  );
}

function formatDateDisplay(value: string): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("pl-PL");
}

const PHOTO_MAX_DIMENSION = 1200;
const PHOTO_JPEG_QUALITY = 0.85;

async function decodeImageFile(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // Some browsers' createImageBitmap can't decode certain source formats —
      // fall back to a plain <img>, which uses the OS/engine's native image
      // decoder (e.g. Safari can display HEIC in an <img> even where
      // createImageBitmap rejects it).
    }
  }
  const objectUrl = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Nie udało się odczytać zdjęcia. Wybierz inny plik."));
      img.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

// Decodes and re-encodes any picked photo as a downsized JPEG, rather than
// trusting the original file's MIME type/size — phones commonly hand over
// HEIC photos (or report an unexpected MIME type depending on how the native
// picker was invoked), which react-pdf cannot render.
async function photoFileToJpegDataUrl(file: File): Promise<string> {
  const image = await decodeImageFile(file);
  const width = "naturalWidth" in image ? image.naturalWidth : image.width;
  const height = "naturalHeight" in image ? image.naturalHeight : image.height;
  if (!width || !height) {
    throw new Error("Nie udało się odczytać zdjęcia. Wybierz inny plik.");
  }

  const scale = Math.min(1, PHOTO_MAX_DIMENSION / Math.max(width, height));
  const targetWidth = Math.round(width * scale);
  const targetHeight = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Ta przeglądarka nie obsługuje przetwarzania zdjęć.");
  }
  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
  if ("close" in image) image.close();

  const dataUrl = canvas.toDataURL("image/jpeg", PHOTO_JPEG_QUALITY);
  if (dataUrl.length > MAX_PHOTO_BYTES * 1.4) {
    throw new Error("Zdjęcie jest za duże, nawet po kompresji. Spróbuj inne.");
  }
  return dataUrl;
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

async function apiRequest(url: string, method: string, body?: unknown) {
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.errors ? JSON.stringify(data.errors) : data?.error || "Wystąpił błąd.");
  }
  if (response.status === 204) return null;
  return response.json();
}

export function ProfileEditor({ initialData }: { initialData: InitialData }) {
  const [general, setGeneral] = useState({
    headline: initialData.headline,
    summary: initialData.summary,
    location: initialData.location,
    phone: initialData.phone,
    linkedinUrl: initialData.linkedinUrl,
  });
  const [generalStatus, setGeneralStatus] = useState<string | null>(null);
  const [generalPending, setGeneralPending] = useState(false);

  const [photoUrl, setPhotoUrl] = useState<string | null>(initialData.photoUrl);
  const [photoPending, setPhotoPending] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoStatus, setPhotoStatus] = useState<string | null>(null);

  const [experiences, setExperiences] = useState<Experience[]>(initialData.experiences);
  const [newExperience, setNewExperience] = useState({
    companyName: "",
    position: "",
    description: "",
    startDate: "",
    endDate: "",
  });
  const [experiencePending, setExperiencePending] = useState(false);
  const [experienceError, setExperienceError] = useState<string | null>(null);

  const [education, setEducation] = useState<Education[]>(initialData.education);
  const [newEducation, setNewEducation] = useState({
    schoolName: "",
    degree: "",
    startDate: "",
    endDate: "",
  });
  const [educationPending, setEducationPending] = useState(false);
  const [educationError, setEducationError] = useState<string | null>(null);

  const [skills, setSkills] = useState<Skill[]>(initialData.skills);
  const [newSkill, setNewSkill] = useState({ name: "", level: "" as SkillLevel | "", category: "" });
  const [skillPending, setSkillPending] = useState(false);
  const [skillError, setSkillError] = useState<string | null>(null);

  const [interests, setInterests] = useState<Interest[]>(initialData.interests);
  const [newInterest, setNewInterest] = useState("");
  const [interestPending, setInterestPending] = useState(false);

  const [languages, setLanguages] = useState<Language[]>(initialData.languages);
  const [newLanguage, setNewLanguage] = useState<{ name: string; level: LanguageLevel | "" }>({
    name: "",
    level: "",
  });
  const [languagePending, setLanguagePending] = useState(false);
  const [languageError, setLanguageError] = useState<string | null>(null);

  async function handlePhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setPhotoError(null);
    setPhotoStatus(null);
    setPhotoPending(true);
    try {
      // Decode + re-encode as JPEG client-side rather than trusting file.type/size
      // directly: phones commonly hand over HEIC photos (or an empty/odd MIME
      // type depending on how the picker was invoked) which react-pdf can't
      // render, and this also downsizes huge camera photos before upload.
      // Wrapped in a timeout so a stalled decode/upload always ends in a visible
      // error rather than leaving the button stuck on "Wgrywanie…" forever.
      const dataUrl = await withTimeout(
        photoFileToJpegDataUrl(file),
        20000,
        "Przetwarzanie zdjęcia trwa zbyt długo. Spróbuj ponownie lub wybierz inne zdjęcie.",
      );
      const { photoUrl: saved } = await withTimeout(
        apiRequest("/api/profile/photo", "POST", { photo: dataUrl }),
        20000,
        "Wgrywanie zdjęcia trwa zbyt długo. Sprawdź połączenie i spróbuj ponownie.",
      );
      setPhotoUrl(saved);
      setPhotoStatus("Zdjęcie zapisane.");
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : "Błąd wgrywania zdjęcia.");
    } finally {
      setPhotoPending(false);
    }
  }

  async function removePhoto() {
    setPhotoPending(true);
    setPhotoError(null);
    setPhotoStatus(null);
    try {
      await apiRequest("/api/profile/photo", "DELETE");
      setPhotoUrl(null);
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : "Błąd usuwania zdjęcia.");
    } finally {
      setPhotoPending(false);
    }
  }

  async function addLanguage(e: React.FormEvent) {
    e.preventDefault();
    if (!newLanguage.level) return;
    setLanguagePending(true);
    setLanguageError(null);
    try {
      const { language } = await apiRequest("/api/profile/languages", "POST", {
        name: newLanguage.name,
        level: newLanguage.level,
      });
      setLanguages((prev) => [...prev, language]);
      setNewLanguage({ name: "", level: "" });
    } catch (error) {
      setLanguageError(error instanceof Error ? error.message : "Błąd zapisu.");
    } finally {
      setLanguagePending(false);
    }
  }

  async function deleteLanguage(id: string) {
    await apiRequest(`/api/profile/languages/${id}`, "DELETE");
    setLanguages((prev) => prev.filter((item) => item.id !== id));
  }

  async function saveGeneral(e: React.FormEvent) {
    e.preventDefault();
    setGeneralPending(true);
    setGeneralStatus(null);
    try {
      await apiRequest("/api/profile", "PUT", general);
      setGeneralStatus("Zapisano.");
    } catch (error) {
      setGeneralStatus(error instanceof Error ? error.message : "Błąd zapisu.");
    } finally {
      setGeneralPending(false);
    }
  }

  async function addExperience(e: React.FormEvent) {
    e.preventDefault();
    setExperiencePending(true);
    setExperienceError(null);
    try {
      const { experience } = await apiRequest("/api/profile/experience", "POST", newExperience);
      setExperiences((prev) => [...prev, experience]);
      setNewExperience({ companyName: "", position: "", description: "", startDate: "", endDate: "" });
    } catch (error) {
      setExperienceError(error instanceof Error ? error.message : "Błąd zapisu.");
    } finally {
      setExperiencePending(false);
    }
  }

  async function deleteExperience(id: string) {
    await apiRequest(`/api/profile/experience/${id}`, "DELETE");
    setExperiences((prev) => prev.filter((item) => item.id !== id));
  }

  async function addEducation(e: React.FormEvent) {
    e.preventDefault();
    setEducationPending(true);
    setEducationError(null);
    try {
      const { education: created } = await apiRequest("/api/profile/education", "POST", newEducation);
      setEducation((prev) => [...prev, created]);
      setNewEducation({ schoolName: "", degree: "", startDate: "", endDate: "" });
    } catch (error) {
      setEducationError(error instanceof Error ? error.message : "Błąd zapisu.");
    } finally {
      setEducationPending(false);
    }
  }

  async function deleteEducation(id: string) {
    await apiRequest(`/api/profile/education/${id}`, "DELETE");
    setEducation((prev) => prev.filter((item) => item.id !== id));
  }

  async function addSkill(e: React.FormEvent) {
    e.preventDefault();
    setSkillPending(true);
    setSkillError(null);
    try {
      const { skill } = await apiRequest("/api/profile/skills", "POST", {
        name: newSkill.name,
        level: newSkill.level || undefined,
        category: newSkill.category,
      });
      setSkills((prev) => [...prev, skill]);
      setNewSkill({ name: "", level: "", category: "" });
    } catch (error) {
      setSkillError(error instanceof Error ? error.message : "Błąd zapisu.");
    } finally {
      setSkillPending(false);
    }
  }

  async function deleteSkill(id: string) {
    await apiRequest(`/api/profile/skills/${id}`, "DELETE");
    setSkills((prev) => prev.filter((item) => item.id !== id));
  }

  async function addInterest(e: React.FormEvent) {
    e.preventDefault();
    if (!newInterest.trim()) return;
    setInterestPending(true);
    try {
      const { interest } = await apiRequest("/api/profile/interests", "POST", { name: newInterest });
      setInterests((prev) => [...prev, interest]);
      setNewInterest("");
    } finally {
      setInterestPending(false);
    }
  }

  async function deleteInterest(id: string) {
    await apiRequest(`/api/profile/interests/${id}`, "DELETE");
    setInterests((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Dane ogólne */}
      <section className={`${card} flex flex-col gap-4`}>
        <SectionTitle icon={UserIcon}>Dane ogólne</SectionTitle>

        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-background">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="Zdjęcie profilowe" className="h-full w-full object-cover" />
            ) : (
              <CameraIcon className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              {/* A real, tappable <input type="file"> laid directly over the visible
                  button — not display:none triggered via ref.click(), which is
                  unreliable on mobile Safari (the tap must land on the real input
                  for the OS file picker to open reliably). */}
              <div className="relative">
                <span aria-hidden className={`${buttonSecondary} ${photoPending ? "opacity-50" : ""}`}>
                  {photoPending ? "Wgrywanie…" : photoUrl ? "Zmień zdjęcie" : "Wgraj zdjęcie"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={photoPending}
                  onChange={handlePhotoSelected}
                  aria-label="Wgraj zdjęcie profilowe"
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                />
              </div>
              {photoUrl && (
                <button type="button" disabled={photoPending} onClick={removePhoto} className={deleteButtonClass}>
                  Usuń
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Dowolne zdjęcie z telefonu lub komputera — zostanie automatycznie dopasowane. Użyte w podglądzie i PDF
              CV.
            </p>
            {photoPending && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <span className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Przetwarzanie zdjęcia…
              </p>
            )}
            {!photoPending && photoStatus && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircleIcon className="h-3.5 w-3.5 shrink-0" />
                {photoStatus}
              </p>
            )}
            {photoError && <p className={errorText}>{photoError}</p>}
          </div>
        </div>

        <form onSubmit={saveGeneral} className="flex flex-col gap-3">
          <input
            className={input}
            placeholder="Nagłówek zawodowy, np. Frontend Developer"
            value={general.headline}
            onChange={(e) => setGeneral({ ...general, headline: e.target.value })}
          />
          <textarea
            className={input}
            placeholder="Podsumowanie zawodowe / o mnie"
            rows={4}
            value={general.summary}
            onChange={(e) => setGeneral({ ...general, summary: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              className={input}
              placeholder="Lokalizacja"
              value={general.location}
              onChange={(e) => setGeneral({ ...general, location: e.target.value })}
            />
            <input
              className={input}
              placeholder="Telefon"
              value={general.phone}
              onChange={(e) => setGeneral({ ...general, phone: e.target.value })}
            />
          </div>
          <input
            className={input}
            placeholder="Link do LinkedIn"
            value={general.linkedinUrl}
            onChange={(e) => setGeneral({ ...general, linkedinUrl: e.target.value })}
          />
          <div className="flex items-center gap-3">
            <button type="submit" disabled={generalPending} className={buttonPrimary}>
              {generalPending ? "Zapisywanie…" : "Zapisz"}
            </button>
            {generalStatus && <span className="text-sm text-muted-foreground">{generalStatus}</span>}
          </div>
        </form>
      </section>

      {/* Doświadczenie */}
      <section className={`${card} flex flex-col gap-4`}>
        <SectionTitle icon={BriefcaseIcon}>Doświadczenie zawodowe</SectionTitle>
        {experiences.length > 0 && (
          <ul className="flex flex-col gap-3">
            {experiences.map((item) => (
              <li key={item.id} className={listItemClass}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {item.position} — {item.companyName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateDisplay(item.startDate)} –{" "}
                      {item.endDate ? formatDateDisplay(item.endDate) : "obecnie"}
                    </p>
                    {item.description && <p className="mt-1 text-sm">{item.description}</p>}
                  </div>
                  <button onClick={() => deleteExperience(item.id)} className={deleteButtonClass}>
                    Usuń
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={addExperience} className={subFormClass}>
          <div className="grid grid-cols-2 gap-3">
            <input
              className={input}
              placeholder="Nazwa firmy"
              required
              value={newExperience.companyName}
              onChange={(e) => setNewExperience({ ...newExperience, companyName: e.target.value })}
            />
            <input
              className={input}
              placeholder="Stanowisko"
              required
              value={newExperience.position}
              onChange={(e) => setNewExperience({ ...newExperience, position: e.target.value })}
            />
          </div>
          <textarea
            className={input}
            placeholder="Opis obowiązków/osiągnięć"
            rows={3}
            value={newExperience.description}
            onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm text-muted-foreground">
              Data rozpoczęcia
              <DateSelect
                value={newExperience.startDate}
                onChange={(value) => setNewExperience({ ...newExperience, startDate: value })}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-muted-foreground">
              Data zakończenia (puste = obecna praca)
              <DateSelect
                value={newExperience.endDate}
                onChange={(value) => setNewExperience({ ...newExperience, endDate: value })}
              />
            </label>
          </div>
          {experienceError && <p className={errorText}>{experienceError}</p>}
          <button type="submit" disabled={experiencePending} className={`${buttonSecondary} self-start`}>
            {experiencePending ? "Dodawanie…" : "+ Dodaj doświadczenie"}
          </button>
        </form>
      </section>

      {/* Edukacja */}
      <section className={`${card} flex flex-col gap-4`}>
        <SectionTitle icon={GraduationCapIcon}>Wykształcenie</SectionTitle>
        {education.length > 0 && (
          <ul className="flex flex-col gap-3">
            {education.map((item) => (
              <li key={item.id} className={listItemClass}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {item.schoolName}
                      {item.degree ? ` — ${item.degree}` : ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateDisplay(item.startDate)} –{" "}
                      {item.endDate ? formatDateDisplay(item.endDate) : "obecnie"}
                    </p>
                  </div>
                  <button onClick={() => deleteEducation(item.id)} className={deleteButtonClass}>
                    Usuń
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={addEducation} className={subFormClass}>
          <div className="grid grid-cols-2 gap-3">
            <input
              className={input}
              placeholder="Nazwa szkoły/uczelni"
              required
              value={newEducation.schoolName}
              onChange={(e) => setNewEducation({ ...newEducation, schoolName: e.target.value })}
            />
            <input
              className={input}
              placeholder="Kierunek / stopień"
              value={newEducation.degree}
              onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm text-muted-foreground">
              Data rozpoczęcia
              <DateSelect
                value={newEducation.startDate}
                onChange={(value) => setNewEducation({ ...newEducation, startDate: value })}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-muted-foreground">
              Data zakończenia
              <DateSelect
                value={newEducation.endDate}
                onChange={(value) => setNewEducation({ ...newEducation, endDate: value })}
              />
            </label>
          </div>
          {educationError && <p className={errorText}>{educationError}</p>}
          <button type="submit" disabled={educationPending} className={`${buttonSecondary} self-start`}>
            {educationPending ? "Dodawanie…" : "+ Dodaj wykształcenie"}
          </button>
        </form>
      </section>

      {/* Umiejętności */}
      <section className={`${card} flex flex-col gap-4`}>
        <SectionTitle icon={TargetIcon}>Umiejętności</SectionTitle>
        {skills.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {skills.map((item) => (
              <li key={item.id} className={tag}>
                <span>
                  {item.name}
                  {item.level ? ` · ${item.level}` : ""}
                </span>
                <button
                  onClick={() => deleteSkill(item.id)}
                  aria-label={`Usuń ${item.name}`}
                  className="text-muted-foreground hover:text-danger"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={addSkill} className="flex flex-wrap items-end gap-3">
          <input
            className={input + " w-48"}
            placeholder="Umiejętność"
            required
            value={newSkill.name}
            onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
          />
          <select
            className={input + " w-40"}
            value={newSkill.level}
            onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value as SkillLevel | "" })}
          >
            <option value="">Poziom (opcjonalnie)</option>
            {SKILL_LEVEL_OPTIONS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <input
            className={input + " w-40"}
            placeholder="Kategoria"
            value={newSkill.category}
            onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
          />
          <button type="submit" disabled={skillPending} className={buttonSecondary}>
            {skillPending ? "Dodawanie…" : "+ Dodaj"}
          </button>
        </form>
        {skillError && <p className={errorText}>{skillError}</p>}
      </section>

      {/* Języki */}
      <section className={`${card} flex flex-col gap-4`}>
        <SectionTitle icon={GlobeIcon}>Języki</SectionTitle>
        {languages.length > 0 && (
          <ul className="flex flex-col gap-2">
            {languages.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-2 rounded-lg border border-border p-3">
                <span className="text-sm">
                  <span className="font-medium">{item.name}</span> ·{" "}
                  <span className="text-muted-foreground">{LanguageLevelLabels[item.level]}</span>
                  {item.level !== "native" && (
                    <span className="ml-2 inline-flex gap-0.5 align-middle">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`h-1.5 w-3 rounded-full ${
                            i < LanguageLevelBars[item.level] ? "bg-primary" : "bg-border"
                          }`}
                        />
                      ))}
                    </span>
                  )}
                </span>
                <button
                  onClick={() => deleteLanguage(item.id)}
                  aria-label={`Usuń ${item.name}`}
                  className={deleteButtonClass}
                >
                  Usuń
                </button>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={addLanguage} className="flex flex-wrap items-end gap-3">
          <input
            className={input + " w-48"}
            placeholder="Język, np. Angielski"
            required
            value={newLanguage.name}
            onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
          />
          <select
            className={input + " w-56"}
            required
            value={newLanguage.level}
            onChange={(e) => setNewLanguage({ ...newLanguage, level: e.target.value as LanguageLevel | "" })}
          >
            <option value="">Poziom</option>
            {LANGUAGE_LEVEL_OPTIONS.map((level) => (
              <option key={level} value={level}>
                {level === "native" ? "Język ojczysty" : `${level} — ${LanguageLevelLabels[level]}`}
              </option>
            ))}
          </select>
          <button type="submit" disabled={languagePending} className={buttonSecondary}>
            {languagePending ? "Dodawanie…" : "+ Dodaj"}
          </button>
        </form>
        {languageError && <p className={errorText}>{languageError}</p>}
      </section>

      {/* Zainteresowania */}
      <section className={`${card} flex flex-col gap-4`}>
        <SectionTitle icon={HeartIcon}>Zainteresowania</SectionTitle>
        {interests.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {interests.map((item) => (
              <li key={item.id} className={tag}>
                <span>{item.name}</span>
                <button
                  onClick={() => deleteInterest(item.id)}
                  aria-label={`Usuń ${item.name}`}
                  className="text-muted-foreground hover:text-danger"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={addInterest} className="flex items-end gap-3">
          <input
            className={input + " w-64"}
            placeholder="Nowe zainteresowanie"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
          />
          <button type="submit" disabled={interestPending} className={buttonSecondary}>
            {interestPending ? "Dodawanie…" : "+ Dodaj"}
          </button>
        </form>
      </section>
    </div>
  );
}

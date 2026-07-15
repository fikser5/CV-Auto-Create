"use client";

import { useState } from "react";
import type { SkillLevels } from "@/lib/definitions";

type SkillLevel = (typeof SkillLevels)[number];

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

type InitialData = {
  headline: string;
  summary: string;
  location: string;
  linkedinUrl: string;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  interests: Interest[];
};

const SKILL_LEVEL_OPTIONS: SkillLevel[] = ["podstawowy", "sredni", "zaawansowany", "ekspert"];

const inputClass =
  "w-full rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent";
const buttonClass =
  "rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black";
const secondaryButtonClass =
  "rounded-md border border-black/10 px-3 py-1.5 text-sm dark:border-white/20";

function formatDateDisplay(value: string): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("pl-PL");
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
    linkedinUrl: initialData.linkedinUrl,
  });
  const [generalStatus, setGeneralStatus] = useState<string | null>(null);
  const [generalPending, setGeneralPending] = useState(false);

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
    <div className="flex flex-col gap-12">
      {/* Dane ogólne */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Dane ogólne</h2>
        <form onSubmit={saveGeneral} className="flex flex-col gap-3">
          <input
            className={inputClass}
            placeholder="Nagłówek zawodowy, np. Frontend Developer"
            value={general.headline}
            onChange={(e) => setGeneral({ ...general, headline: e.target.value })}
          />
          <textarea
            className={inputClass}
            placeholder="Podsumowanie zawodowe / o mnie"
            rows={4}
            value={general.summary}
            onChange={(e) => setGeneral({ ...general, summary: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="Lokalizacja"
            value={general.location}
            onChange={(e) => setGeneral({ ...general, location: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="Link do LinkedIn"
            value={general.linkedinUrl}
            onChange={(e) => setGeneral({ ...general, linkedinUrl: e.target.value })}
          />
          <div className="flex items-center gap-3">
            <button type="submit" disabled={generalPending} className={buttonClass}>
              {generalPending ? "Zapisywanie…" : "Zapisz"}
            </button>
            {generalStatus && <span className="text-sm text-black/60 dark:text-white/60">{generalStatus}</span>}
          </div>
        </form>
      </section>

      {/* Doświadczenie */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Doświadczenie zawodowe</h2>
        <ul className="flex flex-col gap-3">
          {experiences.map((item) => (
            <li key={item.id} className="rounded-md border border-black/10 p-3 dark:border-white/20">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">
                    {item.position} — {item.companyName}
                  </p>
                  <p className="text-sm text-black/60 dark:text-white/60">
                    {formatDateDisplay(item.startDate)} – {item.endDate ? formatDateDisplay(item.endDate) : "obecnie"}
                  </p>
                  {item.description && <p className="mt-1 text-sm">{item.description}</p>}
                </div>
                <button onClick={() => deleteExperience(item.id)} className={secondaryButtonClass}>
                  Usuń
                </button>
              </div>
            </li>
          ))}
        </ul>
        <form onSubmit={addExperience} className="flex flex-col gap-3 rounded-md border border-dashed border-black/20 p-3 dark:border-white/20">
          <div className="grid grid-cols-2 gap-3">
            <input
              className={inputClass}
              placeholder="Nazwa firmy"
              required
              value={newExperience.companyName}
              onChange={(e) => setNewExperience({ ...newExperience, companyName: e.target.value })}
            />
            <input
              className={inputClass}
              placeholder="Stanowisko"
              required
              value={newExperience.position}
              onChange={(e) => setNewExperience({ ...newExperience, position: e.target.value })}
            />
          </div>
          <textarea
            className={inputClass}
            placeholder="Opis obowiązków/osiągnięć"
            rows={3}
            value={newExperience.description}
            onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm">
              Data rozpoczęcia
              <input
                type="date"
                className={inputClass}
                required
                value={newExperience.startDate}
                onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Data zakończenia (puste = obecna praca)
              <input
                type="date"
                className={inputClass}
                value={newExperience.endDate}
                onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })}
              />
            </label>
          </div>
          {experienceError && <p className="text-sm text-red-600">{experienceError}</p>}
          <button type="submit" disabled={experiencePending} className={buttonClass}>
            {experiencePending ? "Dodawanie…" : "Dodaj doświadczenie"}
          </button>
        </form>
      </section>

      {/* Edukacja */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Wykształcenie</h2>
        <ul className="flex flex-col gap-3">
          {education.map((item) => (
            <li key={item.id} className="rounded-md border border-black/10 p-3 dark:border-white/20">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">
                    {item.schoolName}
                    {item.degree ? ` — ${item.degree}` : ""}
                  </p>
                  <p className="text-sm text-black/60 dark:text-white/60">
                    {formatDateDisplay(item.startDate)} – {item.endDate ? formatDateDisplay(item.endDate) : "obecnie"}
                  </p>
                </div>
                <button onClick={() => deleteEducation(item.id)} className={secondaryButtonClass}>
                  Usuń
                </button>
              </div>
            </li>
          ))}
        </ul>
        <form onSubmit={addEducation} className="flex flex-col gap-3 rounded-md border border-dashed border-black/20 p-3 dark:border-white/20">
          <div className="grid grid-cols-2 gap-3">
            <input
              className={inputClass}
              placeholder="Nazwa szkoły/uczelni"
              required
              value={newEducation.schoolName}
              onChange={(e) => setNewEducation({ ...newEducation, schoolName: e.target.value })}
            />
            <input
              className={inputClass}
              placeholder="Kierunek / stopień"
              value={newEducation.degree}
              onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm">
              Data rozpoczęcia
              <input
                type="date"
                className={inputClass}
                required
                value={newEducation.startDate}
                onChange={(e) => setNewEducation({ ...newEducation, startDate: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Data zakończenia
              <input
                type="date"
                className={inputClass}
                value={newEducation.endDate}
                onChange={(e) => setNewEducation({ ...newEducation, endDate: e.target.value })}
              />
            </label>
          </div>
          {educationError && <p className="text-sm text-red-600">{educationError}</p>}
          <button type="submit" disabled={educationPending} className={buttonClass}>
            {educationPending ? "Dodawanie…" : "Dodaj wykształcenie"}
          </button>
        </form>
      </section>

      {/* Umiejętności */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Umiejętności</h2>
        <ul className="flex flex-wrap gap-2">
          {skills.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-2 rounded-full border border-black/10 px-3 py-1 text-sm dark:border-white/20"
            >
              <span>
                {item.name}
                {item.level ? ` (${item.level})` : ""}
              </span>
              <button onClick={() => deleteSkill(item.id)} aria-label={`Usuń ${item.name}`} className="text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white">
                ×
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={addSkill} className="flex flex-wrap items-end gap-3">
          <input
            className={inputClass + " w-48"}
            placeholder="Umiejętność"
            required
            value={newSkill.name}
            onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
          />
          <select
            className={inputClass + " w-40"}
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
            className={inputClass + " w-40"}
            placeholder="Kategoria"
            value={newSkill.category}
            onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
          />
          <button type="submit" disabled={skillPending} className={buttonClass}>
            {skillPending ? "Dodawanie…" : "Dodaj"}
          </button>
        </form>
        {skillError && <p className="text-sm text-red-600">{skillError}</p>}
      </section>

      {/* Zainteresowania */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Zainteresowania</h2>
        <ul className="flex flex-wrap gap-2">
          {interests.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-2 rounded-full border border-black/10 px-3 py-1 text-sm dark:border-white/20"
            >
              <span>{item.name}</span>
              <button onClick={() => deleteInterest(item.id)} aria-label={`Usuń ${item.name}`} className="text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white">
                ×
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={addInterest} className="flex items-end gap-3">
          <input
            className={inputClass + " w-64"}
            placeholder="Nowe zainteresowanie"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
          />
          <button type="submit" disabled={interestPending} className={buttonClass}>
            {interestPending ? "Dodawanie…" : "Dodaj"}
          </button>
        </form>
      </section>
    </div>
  );
}

import * as z from "zod/v4";

export const GeneratedCvContentSchema = z.object({
  // Used only to auto-fill JobPosting.jobTitle/companyName for the CV history
  // list (app/cv/page.tsx) — never rendered on the CV/PDF itself. Kept
  // separate from `headline` (which is the AI's tailored professional title
  // for the candidate, not necessarily the literal job ad title).
  detectedJobTitle: z
    .string()
    .describe(
      "Dokładna nazwa stanowiska tak, jak podana w treści oferty pracy (nie przeformułowana). Puste, jeśli oferta nie podaje jednoznacznej nazwy stanowiska.",
    )
    .default(""),
  detectedCompanyName: z
    .string()
    .describe("Nazwa firmy rekrutującej, tak jak podana w treści oferty. Puste, jeśli oferta jej nie podaje.")
    .default(""),
  headline: z.string().describe("Krótki nagłówek zawodowy dopasowany do oferty, np. 'Senior Frontend Developer'"),
  summary: z.string().describe("Podsumowanie zawodowe (2-4 zdania) podkreślające dopasowanie do oferty"),
  experience: z.array(
    z.object({
      company: z.string(),
      position: z.string(),
      period: z.string().describe("np. '2020 - obecnie' albo '2018 - 2020'"),
      highlights: z
        .array(z.string())
        .describe("Punkty opisujące obowiązki/osiągnięcia, przeformułowane pod język i słowa kluczowe z oferty"),
    }),
  ),
  education: z.array(
    z.object({
      school: z.string(),
      degree: z.string(),
      period: z.string(),
    }),
  ),
  skills: z
    .array(z.string())
    .describe("Umiejętności twarde z profilu, posortowane od najbardziej istotnych dla tej oferty"),
  softSkills: z
    .array(z.string())
    .describe(
      "Umiejętności miękkie (np. przywództwo, komunikacja, praca zespołowa) — TYLKO takie, które wprost wynikają z opisów doświadczenia/podsumowania w profilu (np. 'zarządzanie zespołem' w opisie stanowiska uzasadnia 'przywództwo'). Nigdy nie wymyślaj cech, których nic w profilu nie potwierdza. Posortowane od najbardziej istotnych dla tej oferty, maksymalnie 6.",
    )
    // .default([]) keeps this optional to parse for CVs generated before this
    // field existed — see lib/claude.ts comment for why it's still effectively
    // required from the model going forward.
    .default([]),
  matchScore: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "Szczera ocena 0-100, jak dobrze prawdziwy profil kandydata pokrywa wymagania oferty. Nie zawyżaj — jeśli profilowi brakuje istotnych wymagań, odzwierciedl to w niższej ocenie.",
    )
    .default(0),
  matchSummary: z
    .string()
    .describe(
      "Jedno zwięzłe, szczere zdanie po polsku wyjaśniające ocenę dopasowania — co pasuje najlepiej i, jeśli to istotne, jakich wymagań oferty profil nie pokrywa.",
    )
    .default(""),
});

export type GeneratedCvContent = z.infer<typeof GeneratedCvContentSchema>;

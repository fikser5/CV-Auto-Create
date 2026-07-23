import * as z from "zod/v4";
import { LanguageLevels } from "@/lib/definitions";

export const ImportedProfileSchema = z.object({
  headline: z.string().describe("Nagłówek zawodowy / stanowisko z góry CV, np. 'Frontend Developer'.").default(""),
  summary: z.string().describe("Podsumowanie zawodowe / sekcja 'o mnie', jeśli jest w dokumencie.").default(""),
  location: z.string().default(""),
  phone: z.string().default(""),
  linkedinUrl: z.string().default(""),
  experiences: z
    .array(
      z.object({
        companyName: z.string(),
        position: z.string(),
        description: z.string().default(""),
        startDate: z.iso
          .date()
          .describe("YYYY-MM-DD. Jeśli CV podaje tylko miesiąc/rok albo sam rok, ustaw brakującą część na 01."),
        endDate: z.iso.date().nullable().describe("null jeśli stanowisko trwa nadal (np. 'obecnie', 'present')."),
      }),
    )
    .default([]),
  education: z
    .array(
      z.object({
        schoolName: z.string(),
        degree: z.string().default(""),
        startDate: z.iso.date(),
        endDate: z.iso.date().nullable(),
      }),
    )
    .default([]),
  skills: z.array(z.object({ name: z.string(), category: z.string().default("") })).default([]),
  interests: z.array(z.string()).default([]),
  languages: z.array(z.object({ name: z.string(), level: z.enum(LanguageLevels) })).default([]),
});

export type ImportedProfile = z.infer<typeof ImportedProfileSchema>;

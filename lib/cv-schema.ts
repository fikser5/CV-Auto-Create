import * as z from "zod/v4";

export const GeneratedCvContentSchema = z.object({
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
    .describe("Umiejętności z profilu, posortowane od najbardziej istotnych dla tej oferty"),
});

export type GeneratedCvContent = z.infer<typeof GeneratedCvContentSchema>;

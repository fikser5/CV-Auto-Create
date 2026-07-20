import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { GeneratedCvContentSchema, type GeneratedCvContent } from "@/lib/cv-schema";
import { GeneratedCoverLetterContentSchema, type GeneratedCoverLetterContent } from "@/lib/cover-letter-schema";

const client = new Anthropic();

type ProfileForPrompt = {
  headline: string | null;
  summary: string | null;
  location: string | null;
  experiences: {
    companyName: string;
    position: string;
    description: string | null;
    startDate: string;
    endDate: string | null;
  }[];
  education: {
    schoolName: string;
    degree: string | null;
    startDate: string;
    endDate: string | null;
  }[];
  skills: { name: string; level: string | null; category: string | null }[];
  interests: { name: string }[];
};

const SYSTEM_PROMPT = `Jesteś asystentem tworzącym CV dopasowane do konkretnej oferty pracy.

Zasady:
- Nie wolno Ci wymyślać doświadczenia, umiejętności ani wykształcenia, których nie ma w danych profilu użytkownika. Możesz wyłącznie przeformułowywać i priorytetyzować prawdziwe dane.
- Priorytetyzuj te doświadczenia i umiejętności użytkownika, które są najbardziej zbieżne z wymaganiami oferty.
- Przeformułuj opisy tak, by używały języka i słów kluczowych z ogłoszenia, bez zmiany faktów.
- Odpowiedz wyłącznie w języku polskim, niezależnie od języka oferty.

Umiejętności miękkie (softSkills):
- Wyciągaj je wyłącznie z konkretnych dowodów w opisach doświadczenia/podsumowaniu — np. opis "koordynowałem pracę zespołu 5 osób" uzasadnia "przywództwo" albo "zarządzanie zespołem", opis "kontakt z klientami" uzasadnia "komunikacja". Jeśli profil nie zawiera żadnego dowodu na daną cechę, nie wpisuj jej — pusta lista jest lepsza niż zmyślona.
- Wybieraj i sortuj te, które najlepiej odpowiadają oczekiwaniom z oferty.

Ocena dopasowania (matchScore, matchSummary):
- Oceniaj szczerze, porównując realne wymagania z oferty z tym, co faktycznie jest w profilu. To pole widzi tylko sam użytkownik (nie trafia na CV wysyłane do pracodawcy), więc nie ma powodu zawyżać — celem jest pomóc mu zrozumieć, na ile pasuje i czego ewentualnie brakuje.`;

export async function generateCvContent(
  profile: ProfileForPrompt,
  jobPostingText: string,
): Promise<GeneratedCvContent> {
  const userPrompt = `Dane profilu kandydata (JSON):
${JSON.stringify(profile, null, 2)}

Treść oferty pracy:
"""
${jobPostingText}
"""

Wygeneruj CV dopasowane do tej oferty, korzystając wyłącznie z powyższych danych profilu.`;

  const message = await client.messages.parse({
    model: "claude-opus-4-8",
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "high",
      format: zodOutputFormat(GeneratedCvContentSchema),
    },
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  if (!message.parsed_output) {
    throw new Error("Model nie zwrócił poprawnie ustrukturyzowanej odpowiedzi.");
  }

  return message.parsed_output;
}

const COVER_LETTER_SYSTEM_PROMPT = `Jesteś asystentem piszącym list motywacyjny dopasowany do konkretnej oferty pracy.

Zasady:
- Nie wolno Ci wymyślać doświadczenia, umiejętności, osiągnięć ani wykształcenia, których nie ma w danych profilu użytkownika. Opierasz się wyłącznie na prawdziwych danych.
- Pisz w formalnym, ale naturalnym tonie — unikaj sztampowych fraz i pustych ogólników. List ma brzmieć jak napisany przez konkretną osobę, nie szablon.
- Nie powtarzaj CV punkt po punkcie — opowiedz spójną historię, dlaczego dane doświadczenie i umiejętności czynią kandydata dobrym wyborem na TO stanowisko, używając języka i słów kluczowych z ogłoszenia.
- Odpowiedz wyłącznie w języku polskim, niezależnie od języka oferty.
- Nie dodawaj powitania (np. "Szanowni Państwo") ani pożegnania (np. "Z poważaniem") do treści akapitów ani do pola "closing" — powitanie renderowane jest osobno z pola recipientLine, a formuła pożegnalna i podpis są dodawane automatycznie przez aplikację.`;

export async function generateCoverLetterContent(
  profile: ProfileForPrompt,
  jobPostingText: string,
  jobMeta: { companyName: string | null; jobTitle: string | null },
): Promise<GeneratedCoverLetterContent> {
  const userPrompt = `Dane profilu kandydata (JSON):
${JSON.stringify(profile, null, 2)}

Treść oferty pracy:
"""
${jobPostingText}
"""

Nazwa firmy (jeśli znana): ${jobMeta.companyName ?? "nieznana — użyj ogólnego zwrotu grzecznościowego"}
Stanowisko (jeśli znane): ${jobMeta.jobTitle ?? "nieznane"}

Napisz list motywacyjny dopasowany do tej oferty, korzystając wyłącznie z powyższych danych profilu.`;

  const message = await client.messages.parse({
    model: "claude-opus-4-8",
    max_tokens: 4000,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "high",
      format: zodOutputFormat(GeneratedCoverLetterContentSchema),
    },
    system: COVER_LETTER_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  if (!message.parsed_output) {
    throw new Error("Model nie zwrócił poprawnie ustrukturyzowanej odpowiedzi.");
  }

  return message.parsed_output;
}

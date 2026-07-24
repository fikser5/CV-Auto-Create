import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { prisma } from "@/lib/prisma";
import { GeneratedCvContentSchema, type GeneratedCvContent } from "@/lib/cv-schema";
import { GeneratedCoverLetterContentSchema, type GeneratedCoverLetterContent } from "@/lib/cover-letter-schema";
import { ImportedProfileSchema, type ImportedProfile } from "@/lib/cv-import-schema";

const client = new Anthropic();

// Fire-and-forget on purpose — a logging failure must never fail the actual
// generation the user is waiting on. Feeds the admin panel's usage/cost chart.
function logApiUsage(userId: string, kind: string, usage: { input_tokens: number; output_tokens: number }) {
  prisma.apiUsageLog
    .create({ data: { userId, kind, inputTokens: usage.input_tokens, outputTokens: usage.output_tokens } })
    .catch((error) => console.error("Nie udało się zapisać logu zużycia API:", error));
}

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
- Nie wolno Ci wymyślać doświadczenia, umiejętności ani wykształcenia, których nie ma w danych profilu użytkownika. Możesz wyłącznie przeformułowywać, rozbudowywać i priorytetyzować prawdziwe dane — nigdy dodawać nowych faktów.
- Nie musisz umieszczać w CV wszystkich pozycji z profilu. Wybierz te doświadczenia, umiejętności i osiągnięcia, które są NAJISTOTNIEJSZE dla tej konkretnej oferty, a pomiń to, co jest w oczywisty sposób nietrafne (np. zupełnie inna branża, mało znacząca umiejętność). Wybrane, najtrafniejsze pozycje opisuj SZERZEJ i BARDZIEJ SZCZEGÓŁOWO niż w surowym profilu (nadal wyłącznie na bazie faktów, które tam są), mocno dopasowując język i słowa kluczowe do ogłoszenia — CV ma być maksymalnie "dograne" pod tę rolę, nie mechaniczną kopią całego profilu.
- Wyjątek od powyższego: nie usuwaj całych stanowisk z historii zatrudnienia bez wyraźnego powodu — CV nie powinno wyglądać na dziurawe/niekompletne w przebiegu kariery. Pomijanie całych doświadczeń ma sens głównie wtedy, gdy jest ich dużo i wyraźnie zbędne (np. krótka praca dorywcza sprzed lat w zupełnie innej branży, a profil ma wystarczająco dużo świeższych, trafniejszych doświadczeń) — w pozostałych przypadkach ogranicz się do skracania/pomijania szczegółów, nie całych pozycji.
- Przeformułuj opisy tak, by używały języka i słów kluczowych z ogłoszenia, bez zmiany faktów.
- Odpowiedz wyłącznie w języku polskim, niezależnie od języka oferty.

Umiejętności miękkie (softSkills):
- Wyciągaj je wyłącznie z konkretnych dowodów w opisach doświadczenia/podsumowaniu — np. opis "koordynowałem pracę zespołu 5 osób" uzasadnia "przywództwo" albo "zarządzanie zespołem", opis "kontakt z klientami" uzasadnia "komunikacja". Jeśli profil nie zawiera żadnego dowodu na daną cechę, nie wpisuj jej — pusta lista jest lepsza niż zmyślona.
- Wybieraj i sortuj te, które najlepiej odpowiadają oczekiwaniom z oferty.

Ocena dopasowania (matchScore, matchSummary):
- Oceniaj szczerze, porównując realne wymagania z oferty z tym, co faktycznie jest w profilu. To pole widzi tylko sam użytkownik (nie trafia na CV wysyłane do pracodawcy), więc nie ma powodu zawyżać — celem jest pomóc mu zrozumieć, na ile pasuje i czego ewentualnie brakuje.

Wykryte stanowisko/firma (detectedJobTitle, detectedCompanyName):
- Przepisz je dokładnie tak, jak podane w treści oferty — to nie jest pole kreatywne, nie przeformułowuj. Jeśli treść oferty nie podaje jednoznacznie nazwy stanowiska albo firmy, zostaw odpowiednie pole puste zamiast zgadywać.`;

export async function generateCvContent(
  userId: string,
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

  logApiUsage(userId, "cv", message.usage);

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
  userId: string,
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

  logApiUsage(userId, "cover_letter", message.usage);

  if (!message.parsed_output) {
    throw new Error("Model nie zwrócił poprawnie ustrukturyzowanej odpowiedzi.");
  }

  return message.parsed_output;
}

const CV_IMPORT_SYSTEM_PROMPT = `Wyciągasz dane z prawdziwego CV użytkownika (plik PDF), żeby uzupełnić jego profil w aplikacji.

Zasady:
- Przepisuj WYŁĄCZNIE informacje, które faktycznie znajdują się w dokumencie. Nigdy niczego nie wymyślaj, nie zgaduj i nie uzupełniaj brakujących danych własną wiedzą.
- Daty zamieniaj na format YYYY-MM-DD. Jeśli CV podaje tylko miesiąc i rok, ustaw dzień na 01. Jeśli podany jest sam rok, ustaw miesiąc i dzień na 01. Jeśli stanowisko/edukacja trwa nadal ("obecnie", "do teraz", "present", "current"), zostaw endDate jako null.
- Jeśli jakiejś informacji brak w dokumencie (np. brak numeru telefonu, brak podsumowania zawodowego), zostaw odpowiednie pole puste zamiast czegoś dopisywać.
- Zachowaj chronologię doświadczenia i edukacji taką, jak w dokumencie.
- Pole "description" dla doświadczenia to zwięzłe przepisanie realnych obowiązków/osiągnięć podanych przy danym stanowisku — nie parafrazuj kreatywnie, trzymaj się treści dokumentu.

Unikanie duplikatów:
- Dostajesz też listę doświadczeń i wykształcenia, które użytkownik ma JUŻ zapisane w profilu (z indeksami). Dla każdego wpisu z CV sprawdź, czy to nie jest ta sama praca/szkoła co coś już zapisane (ta sama firma+stanowisko, albo ta sama szkoła+kierunek — nawet jeśli zapisane nieco inaczej, np. "CloudTech" vs "CloudTech Sp. z o.o.") — jeśli tak, podaj indeks tego wpisu w "matchesExistingIndex", żeby aplikacja go wzbogaciła zamiast duplikować. Jeśli to coś nowego, czego w profilu jeszcze nie ma, zostaw null.`;

export async function extractProfileFromCv(
  userId: string,
  pdfBase64: string,
  existingProfile: {
    experiences: { companyName: string; position: string }[];
    education: { schoolName: string; degree: string | null }[];
  },
): Promise<ImportedProfile> {
  const existingExperiencesList =
    existingProfile.experiences.length > 0
      ? existingProfile.experiences.map((e, i) => `${i}. ${e.position} — ${e.companyName}`).join("\n")
      : "(profil nie ma jeszcze żadnego doświadczenia)";
  const existingEducationList =
    existingProfile.education.length > 0
      ? existingProfile.education.map((e, i) => `${i}. ${e.schoolName}${e.degree ? ` — ${e.degree}` : ""}`).join("\n")
      : "(profil nie ma jeszcze żadnego wykształcenia)";

  const message = await client.messages.parse({
    model: "claude-opus-4-8",
    max_tokens: 6000,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "high",
      format: zodOutputFormat(ImportedProfileSchema),
    },
    system: CV_IMPORT_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdfBase64 } },
          {
            type: "text",
            text: `Obecne doświadczenia w profilu:\n${existingExperiencesList}\n\nObecne wykształcenie w profilu:\n${existingEducationList}\n\nWyciągnij dane profilu z tego CV.`,
          },
        ],
      },
    ],
  });

  logApiUsage(userId, "cv_import", message.usage);

  if (!message.parsed_output) {
    throw new Error("Model nie zwrócił poprawnie ustrukturyzowanej odpowiedzi.");
  }

  return message.parsed_output;
}

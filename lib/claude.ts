import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { GeneratedCvContentSchema, type GeneratedCvContent } from "@/lib/cv-schema";

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
- Odpowiedz wyłącznie w języku polskim, niezależnie od języka oferty.`;

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

import * as z from "zod/v4";

export const GeneratedCoverLetterContentSchema = z.object({
  recipientLine: z
    .string()
    .describe(
      "Linia adresata na początku listu, np. nazwa firmy z oferty ('Dział Rekrutacji, Acme Sp. z o.o.'), a jeśli oferta nie podaje nazwy firmy — ogólne 'Szanowni Państwo,'.",
    ),
  subject: z
    .string()
    .describe("Krótki temat/nagłówek listu, np. 'Aplikacja na stanowisko Senior Frontend Developer'"),
  paragraphs: z
    .array(z.string())
    .describe(
      "3-5 akapitów treści listu motywacyjnego (bez powitania i pożegnania — te są osobno). Oparte wyłącznie na prawdziwych danych z profilu kandydata, przeformułowane pod język i wymagania oferty. Nie wolno wymyślać doświadczenia ani umiejętności, których nie ma w profilu.",
    ),
  closing: z
    .string()
    .describe("Zdanie zamykające przed formułą pożegnalną, np. podziękowanie za rozważenie kandydatury."),
});

export type GeneratedCoverLetterContent = z.infer<typeof GeneratedCoverLetterContentSchema>;

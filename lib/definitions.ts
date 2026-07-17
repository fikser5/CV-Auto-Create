import * as z from "zod";

export const RegisterFormSchema = z.object({
  fullName: z.string().min(2, { error: "Imię i nazwisko musi mieć co najmniej 2 znaki." }).trim(),
  email: z.email({ error: "Podaj poprawny adres e-mail." }).trim(),
  password: z
    .string()
    .min(8, { error: "Hasło musi mieć co najmniej 8 znaków." })
    .regex(/[a-zA-Z]/, { error: "Hasło musi zawierać co najmniej jedną literę." })
    .regex(/[0-9]/, { error: "Hasło musi zawierać co najmniej jedną cyfrę." }),
});

export type RegisterFormState =
  | {
      errors?: {
        fullName?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export const ProfileSchema = z.object({
  headline: z.string().trim().max(200).optional().or(z.literal("")),
  summary: z.string().trim().max(4000).optional().or(z.literal("")),
  location: z.string().trim().max(200).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  linkedinUrl: z.union([z.url(), z.literal("")]).optional(),
});

export const ExperienceSchema = z.object({
  companyName: z.string().trim().min(1, { error: "Nazwa firmy jest wymagana." }).max(200),
  position: z.string().trim().min(1, { error: "Stanowisko jest wymagane." }).max(200),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  startDate: z.iso.date({ error: "Podaj poprawną datę rozpoczęcia." }),
  endDate: z.union([z.iso.date(), z.literal("")]).optional(),
});

export const EducationSchema = z.object({
  schoolName: z.string().trim().min(1, { error: "Nazwa szkoły jest wymagana." }).max(200),
  degree: z.string().trim().max(200).optional().or(z.literal("")),
  startDate: z.iso.date({ error: "Podaj poprawną datę rozpoczęcia." }),
  endDate: z.union([z.iso.date(), z.literal("")]).optional(),
});

export const SkillLevels = ["podstawowy", "sredni", "zaawansowany", "ekspert"] as const;

export const SkillSchema = z.object({
  name: z.string().trim().min(1, { error: "Nazwa umiejętności jest wymagana." }).max(100),
  level: z.enum(SkillLevels).optional(),
  category: z.string().trim().max(100).optional().or(z.literal("")),
});

export const InterestSchema = z.object({
  name: z.string().trim().min(1, { error: "Nazwa zainteresowania jest wymagana." }).max(100),
});

export const LanguageLevels = ["A1", "A2", "B1", "B2", "C1", "C2", "native"] as const;

export const LanguageLevelLabels: Record<(typeof LanguageLevels)[number], string> = {
  A1: "Początkujący",
  A2: "Podstawowy",
  B1: "Średnio zaawansowany",
  B2: "Wyższy średnio zaawansowany",
  C1: "Zaawansowany",
  C2: "Biegły",
  native: "Język ojczysty",
};

// Liczba wypełnionych segmentów paska poziomu (na 5) — "native" nie pokazuje paska.
export const LanguageLevelBars: Record<(typeof LanguageLevels)[number], number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 5,
  native: 5,
};

export const LanguageSchema = z.object({
  name: z.string().trim().min(1, { error: "Nazwa języka jest wymagana." }).max(100),
  level: z.enum(LanguageLevels, { error: "Wybierz poziom znajomości języka." }),
});

const MAX_PHOTO_BYTES = 3 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png"] as const;

export const PhotoUploadSchema = z.object({
  photo: z
    .string()
    .refine((value) => /^data:image\/(jpeg|png);base64,/.test(value), {
      error: "Zdjęcie musi być w formacie JPG lub PNG.",
    })
    .refine(
      (value) => {
        const type = value.slice(5, value.indexOf(";"));
        return (ALLOWED_PHOTO_TYPES as readonly string[]).includes(type);
      },
      { error: "Zdjęcie musi być w formacie JPG lub PNG." },
    )
    .refine(
      (value) => {
        const base64 = value.slice(value.indexOf(",") + 1);
        const approxBytes = (base64.length * 3) / 4;
        return approxBytes <= MAX_PHOTO_BYTES;
      },
      { error: "Zdjęcie jest za duże (maks. 3 MB)." },
    ),
});

export const JobPostingSchema = z.object({
  rawContent: z
    .string()
    .trim()
    .min(50, { error: "Wklej pełną treść ogłoszenia (co najmniej 50 znaków)." })
    .max(20000),
  sourceUrl: z.union([z.url(), z.literal("")]).optional(),
  companyName: z.string().trim().max(200).optional().or(z.literal("")),
  jobTitle: z.string().trim().max(200).optional().or(z.literal("")),
});

# CV-Auto-Create 🎯

> AI-powered web app that generates a tailored CV for a specific job posting.

CV-Auto-Create to aplikacja webowa, która pozwala użytkownikowi jednorazowo uzupełnić profil zawodowy (doświadczenie, umiejętności, edukację), a następnie automatycznie generować CV **dopasowane do konkretnej oferty pracy** przy użyciu sztucznej inteligencji.

Zamiast ręcznie dostosowywać CV do każdej aplikacji o pracę, użytkownik wkleja treść ogłoszenia — a system priorytetyzuje i przeformułowuje jego prawdziwe doświadczenie tak, by najlepiej odpowiadało wymaganiom danej oferty.

🚧 **Status projektu:** w trakcie budowy (aktywny rozwój, MVP).

---

## ✨ Funkcje (MVP)

- 🔐 Rejestracja i logowanie użytkownika
- 👤 Budowa profilu zawodowego (doświadczenie, edukacja, umiejętności, zainteresowania)
- 📋 Wklejenie treści oferty pracy
- 🤖 Generowanie CV dopasowanego do oferty (AI — Claude API)
- 📄 Eksport gotowego CV do PDF

### Planowane (kolejne fazy)
- Historia wygenerowanych wersji CV
- Generator listu motywacyjnego dopasowanego do oferty
- Wiele szablonów wizualnych
- Integracja z legalnymi API agregatorów ofert pracy
- System subskrypcji (Stripe)

---

## 🛠️ Stack technologiczny

| Warstwa | Technologia |
|---|---|
| Frontend | Next.js (React) + TypeScript |
| Stylowanie | Tailwind CSS |
| Backend | Next.js API Routes |
| Baza danych | PostgreSQL |
| ORM | Prisma |
| Autentykacja | NextAuth.js (Auth.js) |
| AI | Anthropic Claude API |
| Generowanie PDF | react-pdf / Puppeteer |
| Hosting | Vercel + Supabase/Neon |

---

## 🚀 Uruchomienie lokalne

```bash
# Klonowanie repozytorium
git clone git@github.com:fikser5/CV-Auto-Create.git
cd CV-Auto-Create

# Instalacja zależności
npm install

# Konfiguracja zmiennych środowiskowych
cp .env.example .env.local
# uzupełnij DATABASE_URL, ANTHROPIC_API_KEY, NEXTAUTH_SECRET itd.

# Migracja bazy danych
npx prisma migrate dev

# Uruchomienie serwera deweloperskiego
npm run dev
```

Aplikacja będzie dostępna pod adresem `http://localhost:3000`.

---

## 📂 Struktura projektu (docelowa)

```
CV-Auto-Create/
├── src/
│   ├── app/              # strony i routing (Next.js App Router)
│   ├── components/       # komponenty React
│   ├── lib/              # logika biznesowa, integracja z AI
│   └── types/            # typy TypeScript
├── prisma/
│   └── schema.prisma     # schemat bazy danych
├── public/               # zasoby statyczne
└── README.md
```

---

## 📝 Licencja

Projekt prywatny / w fazie rozwoju.

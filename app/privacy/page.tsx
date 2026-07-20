import Link from "next/link";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { card, eyebrow } from "@/lib/ui";

const h2 = "mt-8 text-lg font-semibold";
const p = "mt-2 text-sm leading-relaxed text-muted-foreground";
const ul = "mt-2 flex flex-col gap-1.5 text-sm leading-relaxed text-muted-foreground list-disc pl-5";

export default function PrivacyPage() {
  return (
    <main className="relative flex flex-1 justify-center px-6 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(ellipse_50%_45%_at_50%_-5%,var(--accent-soft),transparent)]"
      />
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand text-sm font-bold text-primary-foreground">
              C
            </span>
            <span className="font-semibold">CVAutomat</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className={card}>
          <span className={eyebrow}>Dokument prawny</span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Polityka Prywatności</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ostatnia aktualizacja: 20 lipca 2026</p>

          <div className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200">
            <strong>Wersja robocza.</strong> Pola w nawiasach kwadratowych (np. [NAZWA PODMIOTU]) to
            miejsca na docelowe dane rejestrowe administratora danych — muszą zostać uzupełnione, a
            cały dokument zweryfikowany przez prawnika, zanim serwis zacznie realnie pobierać
            płatności.
          </div>

          <h2 className={h2}>1. Administrator danych osobowych</h2>
          <p className={p}>
            Administratorem danych osobowych przetwarzanych w związku z korzystaniem z serwisu
            CVAutomat jest [NAZWA PODMIOTU / IMIĘ I NAZWISKO PRZEDSIĘBIORCY], NIP: [NIP], z
            siedzibą pod adresem [ADRES SIEDZIBY] (dalej: „Administrator”). Kontakt w sprawach
            ochrony danych osobowych: [ADRES E-MAIL KONTAKTOWY].
          </p>

          <h2 className={h2}>2. Jakie dane przetwarzamy</h2>
          <ul className={ul}>
            <li>dane rejestracyjne: imię i nazwisko, adres e-mail, zahaszowane hasło,</li>
            <li>
              dane profilu zawodowego wprowadzone dobrowolnie przez Użytkownika: doświadczenie
              zawodowe, wykształcenie, umiejętności, zainteresowania, zdjęcie profilowe, dane
              kontaktowe (telefon, LinkedIn),
            </li>
            <li>treść wklejonych przez Użytkownika ogłoszeń o pracę,</li>
            <li>treść dokumentów (CV, listów motywacyjnych) wygenerowanych na podstawie powyższych danych,</li>
            <li>dane techniczne: adres IP, identyfikator sesji logowania (plik cookie).</li>
          </ul>

          <h2 className={h2}>3. Cele i podstawy prawne przetwarzania</h2>
          <p className={p}>Dane przetwarzane są na podstawie art. 6 ust. 1 RODO w celu:</p>
          <ul className={ul}>
            <li>
              wykonania umowy o świadczenie usług drogą elektroniczną, tj. założenia konta i
              wygenerowania dokumentów aplikacyjnych (art. 6 ust. 1 lit. b RODO),
            </li>
            <li>
              rozliczenia płatności za plany Premium/Pakiet, gdy funkcja płatności zostanie
              aktywowana (art. 6 ust. 1 lit. b i c RODO),
            </li>
            <li>
              zapewnienia bezpieczeństwa Serwisu i przeciwdziałania nadużyciom, w tym ograniczania
              limitu darmowych generowań do zweryfikowanych adresów e-mail (art. 6 ust. 1 lit. f
              RODO — prawnie uzasadniony interes Administratora),
            </li>
            <li>obsługi zgłoszeń i reklamacji (art. 6 ust. 1 lit. f RODO).</li>
          </ul>

          <h2 className={h2}>4. Odbiorcy danych</h2>
          <p className={p}>
            W celu świadczenia usługi korzystamy z zaufanych podmiotów przetwarzających dane w
            naszym imieniu, na podstawie zawartych z nimi umów powierzenia przetwarzania danych:
          </p>
          <ul className={ul}>
            <li>
              <strong>Anthropic</strong> (dostawca modelu AI Claude) — treść profilu zawodowego
              oraz wklejonej oferty pracy przekazywana jest do przetworzenia w celu wygenerowania
              dopasowanego dokumentu. Dane przekazywane są poza Europejski Obszar Gospodarczy
              (Stany Zjednoczone) w oparciu o odpowiednie mechanizmy zgodności z RODO
              (standardowe klauzule umowne),
            </li>
            <li>
              <strong>Supabase</strong> (hosting bazy danych PostgreSQL) — przechowywanie danych
              konta i profilu,
            </li>
            <li>
              <strong>Resend</strong> — wysyłka wiadomości e-mail (powitanie, potwierdzenie
              adresu, reset hasła),
            </li>
            <li>
              <strong>Przelewy24 (PayPro S.A.)</strong> — docelowa obsługa płatności za plany
              Premium/Pakiet (funkcja jeszcze nieaktywna, patrz Regulamin).
            </li>
          </ul>
          <p className={p}>Dane nie są sprzedawane ani udostępniane w celach marketingowych podmiotom trzecim.</p>

          <h2 className={h2}>5. Okres przechowywania danych</h2>
          <p className={p}>
            Dane przechowywane są przez czas istnienia konta w Serwisie. Po usunięciu konta dane
            są trwale usuwane, z wyjątkiem informacji, których przechowywanie przez dłuższy okres
            wymagane jest przepisami prawa (np. dokumentacja rozliczeniowa dotycząca dokonanych
            płatności).
          </p>

          <h2 className={h2}>6. Prawa Użytkownika</h2>
          <p className={p}>W związku z przetwarzaniem danych osobowych Użytkownikowi przysługuje prawo do:</p>
          <ul className={ul}>
            <li>dostępu do swoich danych oraz otrzymania ich kopii,</li>
            <li>sprostowania (poprawiania) danych,</li>
            <li>usunięcia danych („prawo do bycia zapomnianym”),</li>
            <li>ograniczenia przetwarzania,</li>
            <li>przenoszenia danych,</li>
            <li>wniesienia sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie,</li>
            <li>
              wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (UODO), jeśli
              Użytkownik uzna, że przetwarzanie danych narusza przepisy RODO.
            </li>
          </ul>
          <p className={p}>
            Powyższe uprawnienia można zrealizować w panelu Użytkownika (edycja/usunięcie profilu)
            lub kontaktując się z Administratorem pod adresem [ADRES E-MAIL KONTAKTOWY].
          </p>

          <h2 className={h2}>7. Pliki cookies</h2>
          <p className={p}>
            Serwis wykorzystuje wyłącznie niezbędny plik cookie służący do utrzymania sesji
            zalogowanego Użytkownika (uwierzytelnianie) oraz zapamiętania wybranego motywu
            kolorystycznego. Serwis nie wykorzystuje cookies analitycznych ani reklamowych osób
            trzecich.
          </p>

          <h2 className={h2}>8. Bezpieczeństwo danych</h2>
          <p className={p}>
            Hasła Użytkowników przechowywane są wyłącznie w postaci zahaszowanej. Linki
            weryfikacyjne (potwierdzenie adresu e-mail, reset hasła) są jednorazowe, ograniczone
            czasowo i przechowywane w bazie danych wyłącznie w postaci zahaszowanej — sam link
            nigdy nie jest zapisywany w formie jawnej.
          </p>

          <h2 className={h2}>9. Kontakt</h2>
          <p className={p}>
            Pytania dotyczące niniejszej Polityki Prywatności prosimy kierować na adres [ADRES
            E-MAIL KONTAKTOWY]. Zasady korzystania z Serwisu opisane są odrębnie w{" "}
            <Link href="/terms" className="text-primary hover:text-primary-hover">
              Regulaminie
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}

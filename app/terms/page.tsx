import Link from "next/link";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { card, eyebrow } from "@/lib/ui";

const h2 = "mt-8 text-lg font-semibold";
const p = "mt-2 text-sm leading-relaxed text-muted-foreground";
const ul = "mt-2 flex flex-col gap-1.5 text-sm leading-relaxed text-muted-foreground list-disc pl-5";

export default function TermsPage() {
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
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Regulamin serwisu CVAutomat</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ostatnia aktualizacja: 20 lipca 2026</p>

          <div className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200">
            <strong>Wersja robocza.</strong> Pola w nawiasach kwadratowych (np. [NAZWA PODMIOTU]) to
            miejsca na docelowe dane rejestrowe operatora — muszą zostać uzupełnione, a cały dokument
            zweryfikowany przez prawnika, zanim serwis zacznie realnie pobierać płatności.
          </div>

          <h2 className={h2}>1. Postanowienia ogólne</h2>
          <p className={p}>
            Niniejszy regulamin określa zasady korzystania z serwisu internetowego CVAutomat,
            dostępnego pod adresem [ADRES DOMENY] (dalej: „Serwis”), umożliwiającego generowanie
            dokumentów aplikacyjnych (CV oraz listów motywacyjnych) dopasowanych do treści
            wybranej oferty pracy przy użyciu sztucznej inteligencji.
          </p>
          <p className={p}>
            Operatorem Serwisu jest [NAZWA PODMIOTU / IMIĘ I NAZWISKO PRZEDSIĘBIORCY], NIP: [NIP],
            REGON: [REGON], z siedzibą pod adresem [ADRES SIEDZIBY] (dalej: „Operator”). Kontakt z
            Operatorem możliwy jest pod adresem e-mail [ADRES E-MAIL KONTAKTOWY].
          </p>

          <h2 className={h2}>2. Zakres usług</h2>
          <p className={p}>Serwis udostępnia w szczególności:</p>
          <ul className={ul}>
            <li>założenie konta i przechowywanie profilu zawodowego Użytkownika,</li>
            <li>generowanie CV dopasowanego do treści wskazanej oferty pracy,</li>
            <li>generowanie listu motywacyjnego dopasowanego do treści wskazanej oferty pracy,</li>
            <li>eksport wygenerowanych dokumentów do formatu PDF oraz dostęp do historii wygenerowanych dokumentów.</li>
          </ul>
          <p className={p}>
            Serwis działa w modelu freemium: Plan darmowy obejmuje jedno wygenerowanie CV. Plan
            Premium (płatność cykliczna) oraz Pakiet (płatność jednorazowa) rozszerzają limit
            generowań oraz dostęp do dodatkowych funkcji zgodnie z opisem widocznym w Serwisie.
            Aktualny cennik prezentowany jest na stronie głównej Serwisu oraz w panelu Użytkownika.
          </p>

          <h2 className={h2}>3. Rola sztucznej inteligencji</h2>
          <p className={p}>
            Dokumenty generowane są przez model sztucznej inteligencji wyłącznie na podstawie
            danych faktycznie wprowadzonych przez Użytkownika do jego profilu (m.in. doświadczenie
            zawodowe, wykształcenie, umiejętności) oraz treści wskazanej oferty pracy. Model ma
            zakaz dodawania doświadczenia, umiejętności ani osiągnięć, których Użytkownik nie
            podał — może wyłącznie przeformułować i uszeregować pod kątem trafności względem
            oferty dane już wprowadzone przez Użytkownika.
          </p>
          <p className={p}>
            Użytkownik ponosi wyłączną odpowiedzialność za prawdziwość i rzetelność danych
            wprowadzonych do profilu oraz za treść dokumentów finalnie przesyłanych potencjalnym
            pracodawcom. Operator nie gwarantuje uzyskania zatrudnienia ani odpowiedzi od
            pracodawcy w wyniku korzystania z Serwisu.
          </p>

          <h2 className={h2}>4. Konto Użytkownika</h2>
          <p className={p}>
            Korzystanie z pełnej funkcjonalności Serwisu wymaga założenia konta i podania
            prawdziwego, aktywnego adresu e-mail. Adres e-mail musi zostać potwierdzony poprzez
            kliknięcie linku weryfikacyjnego — do czasu potwierdzenia generowanie dokumentów w
            planie darmowym jest zablokowane. Zabronione jest zakładanie wielu kont w celu
            wielokrotnego korzystania z limitów planu darmowego.
          </p>
          <p className={p}>
            Użytkownik zobowiązany jest do zachowania poufności danych logowania oraz do
            niezwłocznego poinformowania Operatora o podejrzeniu nieautoryzowanego dostępu do
            konta.
          </p>

          <h2 className={h2}>5. Płatności</h2>
          <p className={p}>
            Płatności za plany Premium i Pakiet obsługiwane są przez zewnętrznego dostawcę usług
            płatniczych — Przelewy24 (PayPro S.A. z siedzibą w Poznaniu). Operator nie przechowuje
            danych kart płatniczych Użytkownika — dane te przetwarzane są bezpośrednio przez
            dostawcę płatności zgodnie z jego regulaminem i politykami bezpieczeństwa.
          </p>
          <p className={p}>
            <strong>Status wdrożenia: płatności nie są jeszcze aktywne w Serwisie.</strong> Zakup
            planów Premium/Pakiet zostanie udostępniony w kolejnym etapie rozwoju Serwisu — do
            tego czasu widoczne w Serwisie ceny mają charakter informacyjny.
          </p>

          <h2 className={h2}>6. Prawo odstąpienia od umowy</h2>
          <p className={p}>
            Zgodnie z ustawą o prawach konsumenta, Użytkownikowi będącemu konsumentem przysługuje
            prawo odstąpienia od umowy w terminie 14 dni bez podania przyczyny. W przypadku usług
            polegających na dostarczaniu treści cyfrowych niezapisanych na nośniku materialnym
            (np. natychmiastowe wygenerowanie dokumentu), prawo to wygasa z chwilą rozpoczęcia
            świadczenia usługi za wyraźną zgodą Użytkownika, wyrażoną przed rozpoczęciem
            generowania dokumentu.
          </p>

          <h2 className={h2}>7. Reklamacje</h2>
          <p className={p}>
            Reklamacje dotyczące funkcjonowania Serwisu lub rozliczeń można zgłaszać na adres
            e-mail [ADRES E-MAIL KONTAKTOWY]. Operator rozpatruje reklamacje w terminie 14 dni od
            ich otrzymania.
          </p>

          <h2 className={h2}>8. Postanowienia końcowe</h2>
          <p className={p}>
            Operator zastrzega sobie prawo do zmiany niniejszego regulaminu. O zmianach Użytkownicy
            zostaną poinformowani za pośrednictwem Serwisu lub wiadomości e-mail z odpowiednim
            wyprzedzeniem. W sprawach nieuregulowanych niniejszym regulaminem zastosowanie mają
            przepisy prawa polskiego. Zasady przetwarzania danych osobowych opisane są odrębnie w{" "}
            <Link href="/privacy" className="text-primary hover:text-primary-hover">
              Polityce Prywatności
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}

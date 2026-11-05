import {
  FREE_AGENT_MIN,
  FREE_RECORDINGS,
  LIGHT,
  LIGHT_AGENT_MIN,
  PRO,
  PRO_AGENT_MIN,
  PRO_VOICEOVER_MIN,
} from "../message-values";
import type { Messages } from "../messages";

const messages: Messages = {
  meta: {
    home: {
      title: "CaptureFlow - nagrywanie ekranu z linkiem do udostępnienia",
      description:
        "Nagraj ekran i wyślij link zespołowi lub klientom. Program open source do nagrywania ekranu: transkrypcje AI, zrzuty z adnotacjami, self-hosting na Cloudflare.",
    },
    features: {
      title: "Funkcje programu do nagrywania ekranu",
      description:
        "Nagraj kartę, okno lub cały ekran z kamerą i mikrofonem, rób zrzuty ekranu z adnotacjami i udostępniaj je jako linki, które zespół może komentować.",
    },
    pricing: {
      title: "Cennik: zacznij za darmo, jedna cena za członka",
      description: `Zacznij za darmo z ${FREE_RECORDINGS} nagraniami. ${LIGHT} i ${PRO} to jedna cena za członka, nagrania bez limitu i AI. Możesz też hostować CaptureFlow samodzielnie za darmo.`,
    },
    faq: {
      title: "FAQ: udostępnianie, przechowywanie i self-hosting",
      description:
        "Częste pytania o CaptureFlow: jak działają linki do udostępnienia, na czym polega self-hosting na Cloudflare, limity miejsca i prywatność nagrań.",
    },
    download: {
      title: "Pobierz program do nagrywania ekranu dla Chrome",
      description:
        "Zainstaluj rozszerzenie CaptureFlow do Chrome, aby nagrywać ekran i udostępniać nagrania linkiem.",
    },
    enterprise: {
      title: "Enterprise",
      description:
        "Zarządzany CaptureFlow dla większych firm: stanowiska dla wszystkich, indywidualne warunki i jedna faktura. Napisz, czego potrzebujesz.",
    },
    selfHostSetup: {
      title: "Wdrożenie self-hostingu",
      description:
        "Zleć wdrożenie CaptureFlow na koncie Cloudflare twojej firmy: własna domena, logowanie tylko dla firmy i prywatne rozszerzenie Chrome dla zespołu.",
    },
  },
  nav: {
    features: "Funkcje",
    discover: "Odkrywaj",
    pricing: "Cennik",
    faq: "FAQ",
    changelog: "Lista zmian",
    login: "Zaloguj się",
    download: "Pobierz",
    language: "Język",
    openMenu: "Otwórz menu",
    menu: "Menu",
    main: "Główne",
    docs: "Dokumentacja",
    resources: "Zasoby",
    faqDescription: "Odpowiedzi na częste pytania",
    blog: "Blog",
    blogDescription: "Poradniki i nowości",
    selfHosting: "Self-hosting",
    selfHostingDescription: "Uruchom na własnym Cloudflare",
    community: "Społeczność",
    communityDescription: "Pomoc i rozmowy na Discordzie",
    star: "Daj gwiazdkę na GitHubie",
    starCount: "Daj gwiazdkę na GitHubie ({stars})",
    themeToLight: "Przełącz na jasny motyw",
    themeToDark: "Przełącz na ciemny motyw",
  },
  banner: {
    label: "Beta",
    aria: "CaptureFlow jest w publicznej becie",
    title: "Jesteś wśród pierwszych 🎉",
    strip:
      "CaptureFlow jest wciąż w wersji beta, więc często się zmienia i zanim się ustabilizuje, możesz trafić na drobne niedoróbki.",
    body: "CaptureFlow jest w publicznej becie. Prawie co tydzień pojawia się coś nowego, a w pierwszej kolejności powstaje to, o co proszą użytkownicy.",
    cta: "Napisz mi, co zbudować dalej",
    close: "Zamknij",
  },
  announcement: {
    badge: "Nowość",
    lead: "Twój agent AI może teraz nagrywać za ciebie.",
    rest: "Połącz go raz, poproś o wideo i odbierz link.",
    cta: "Połącz",
  },
  hero: {
    title: "Nagrywanie ekranu\ndla ciebie i twoich agentów AI",
    subtitle:
      "Nagrywaj dema, poradniki, omówienia i prezentacje samodzielnie albo zleć to swojemu AI. Każde nagranie udostępnisz jako link, który może obejrzeć każdy.",
    ctaLabel: "Wypróbuj CaptureFlow za darmo",
    installChrome: "Zainstaluj rozszerzenie Chrome",
    installMac: "Pobierz na macOS",
    installSoon: "Wkrótce",
    connectMcp: "Połącz z MCP",
    macSoon: "Aplikacja na macOS już wkrótce",
    installOr: "lub",
    mcpCopy: "Kopiuj",
    mcpCopied: "Skopiowano",
    mcpAddToCursor: "Dodaj do Cursora",
    badge: "Open source, do uruchomienia za darmo: {github}",
    noCreditCard: "Bez karty kredytowej",
    teaser: {
      title: "Self-hosting",
      body: "Uruchom na własnym koncie Cloudflare.",
      cta: "Wypróbuj CaptureFlow",
    },
    demo: {
      prevAria: "Poprzednie demo",
      nextAria: "Następne demo",
      dotAria: "Pokaż demo {n} z {total}",
    },
  },
  highlights: {
    heading: "Wszystkie funkcje",
    subtitle: "Nagrywaj, edytuj i udostępniaj. Wszystko w jednym miejscu.",
    items: {
      recording: { title: "Ekran i kamera", body: "Nagrywaj jednocześnie" },
      transcripts: { title: "Transkrypcje", body: "W 99 językach", tag: "AI" },
      editing: {
        title: "Edycja przez transkrypcję",
        body: "Usuń tekst, a wytniesz wideo",
        tag: "AI",
      },
      camera: {
        title: "Efekty kamery",
        body: "Tła i filtry",
      },
      canvas: {
        title: "Nieskończone płótno",
        body: "Szkicuj podczas nagrywania",
      },
      screenshots: {
        title: "Zrzuty ekranu z adnotacjami",
        body: "Strzałki, tekst i rozmycie",
      },
      feedback: {
        title: "Komentarze i reakcje",
        body: "Opinie wprost na wideo",
      },
      summary: {
        title: "Podsumowania i rozdziały",
        body: "Z tytułem dla każdego wideo",
        tag: "AI",
      },
      filler: {
        title: "Automatyczne usuwanie wypełniaczy",
        body: "Wycina „yyy” i „eee”",
        tag: "AI",
      },
    },
    cta: "Zobacz wszystkie funkcje",
    previews: {
      app: "Plan premiery",
      columns: ["Zadania", "W toku", "Gotowe"],
      lines: [
        "Oto nowy proces.",
        "Najpierw wybierz przestrzeń.",
        "Potem udostępnij link.",
      ],
      retake: "Yyy, zacznę jeszcze raz.",
      filler: [
        "[Yyy,] oto nowy proces.",
        "Najpierw, [eee,] wybierz przestrzeń.",
        "Potem, [yyy,] udostępnij link.",
      ],
      step: "Krok 1",
      note: "Przenieś to",
      comment: "Świetny proces",
      summaryTitle: "Jak zaprosić zespół",
      summaryBody: "Wybierz przestrzeń, potem udostępnij link.",
      chapters: ["Wstęp", "Wybór przestrzeni"],
    },
  },
  mcpFeatures: {
    heading: "Funkcje MCP",
    subtitle:
      "Co potrafi twój agent AI po połączeniu. Nagrywa na twoim komputerze, z Claude Code, Codex, Cursor lub dowolnym klientem MCP.",
    cta: "Przeczytaj poradnik",
    items: {
      webApp: { title: "Nagraj aplikację webową", body: "Także na localhost" },
      screen: { title: "Nagraj ekran", body: "Cały monitor" },
      window: {
        title: "Nagraj jedno okno",
        body: "Terminal, VS Code lub Figma",
      },
      slides: { title: "Dodaj slajdy", body: "Tytuły, kroki i zakończenia" },
      voiceover: { title: "Dodaj lektora", body: "Działa na twoim komputerze" },
      report: { title: "Napisz raport", body: "Co zrobił i co się nie udało" },
      search: { title: "Przeszukuj nagrania", body: "Wideo i transkrypcje" },
      save: { title: "Zapisuj pliki MP4", body: "Bez wysyłania i logowania" },
    },
  },
  useCases: {
    heading: "Jak korzystają z niego zespoły",
    subtitle:
      "Przykłady tego, co nagrywają zespoły. Każde wideo to link, który odtworzysz w dowolnej przeglądarce.",
    cta: "Zobacz, jak to działa",
    cards: {
      engineering: {
        title: "Inżynieria",
        body: "Nagraj omówienie PR-a albo odtworzenie błędu.",
      },
      design: {
        title: "Projektowanie",
        body: "Nagraj omówienie makiety i zbierz komentarze.",
      },
      support: {
        title: "Obsługa klienta",
        body: "Odpowiedz na zgłoszenie krótkim omówieniem krok po kroku.",
      },
      updates: {
        title: "Podsumowania dla zespołu",
        body: "Nagraj podsumowanie tygodnia i udostępnij link.",
      },
    },
    engineeringFile: "checkout.ts",
    engineeringPr: "PR #482",
    designApp: "trip-app",
    designBadge: "Checkout v3",
    designCardTitle: "Zaplanuj podróż",
    designColors: "Kolory",
    designComment: "Większe CTA?",
    supportQuestion: "Jak zaprosić zespół do przestrzeni roboczej?",
    supportReply: "Oto krótkie omówienie:",
    supportLink: "captureflow.dev/r/8kx2pnq4",
    updatesTitle: "Podsumowanie tygodnia",
    updatesRange: "6–10 paź",
    updatesSignups: "Rejestracje",
    updatesShipped: "Wdrożono",
    updatesFeatures: "funkcji",
  },
  agents: {
    heading: "Albo poproś agenta AI, żeby nagrał twoje dema i poradniki",
    worksWith: "Działa z {claude}, {openai} i {cursor}.",
    cta: "Przeczytaj poradnik",
    subtitle:
      "Poproś zwykłymi słowami. Agent nagra przeglądarkę, ekran lub aplikację na twoim komputerze, doda slajdy i lektora, jeśli chcesz, i przekaże ci link.",
    steps: [
      {
        title: "Połącz swojego agenta",
        body: "Dodaj CaptureFlow do Claude Code, Codex lub Cursor jedną linijką. Potrzebujesz Node.js 20 lub nowszego, a agent loguje się raz. W Claude lub ChatGPT dodaj go przez URL.",
      },
      {
        title: "Poproś o wideo",
        body: "Demo funkcji, poradnik, zgłoszenie błędu albo prezentacja z lektorem.",
      },
      {
        title: "Agent nagrywa za ciebie",
        body: "Na twoim komputerze, nawet aplikację na localhost.",
      },
      {
        title: "Dodaje slajdy i głos",
        body: "Slajdy tytułowe i lektor, jeśli chcesz.",
      },
      {
        title: "Daje ci link do udostępnienia",
        body: "Dołącz go do pull requesta, wklej na Slacku albo wyślij klientowi.",
      },
    ],
    scenes: {
      ask: {
        name: "terminal",
        badge: "agent",
        prompt: "Nagraj demo płatności",
        steps: [
          "Otwieram aplikację",
          "Klikam po kolei",
          "Twój link jest gotowy",
        ],
      },
      record: {
        url: "localhost:3000",
        badge: "demo",
        title: "Płatność",
        fields: ["Imię i nazwisko", "Numer karty"],
        pay: "Zapłać",
        paid: "Zapłacono",
      },
      voice: {
        title: "Demo płatności",
        subtitle: "Jak zapłacić w trzech krokach",
      },
      share: {
        title: "Demo płatności",
        link: "captureflow.dev/r/checkout",
        places: ["PR", "Slack", "E-mail"],
      },
    },
    chats: {
      claude:
        "W Claude otwórz Customize, potem Connectors i wybierz Add custom connector. Nazwij go CaptureFlow, wklej ten URL i zaloguj się.",
      chatgpt:
        "W ChatGPT w przeglądarce otwórz Plugins, naciśnij + i wybierz Add custom MCP server. Nazwij go CaptureFlow, wklej ten URL, wybierz OAuth, a potem zainstaluj wtyczkę i zaloguj się. Wymaga planu Business, Enterprise lub Edu.",
      limits:
        "Czaty nagrywają strony internetowe w przeglądarce w chmurze, a nie twój komputer, i zużywają minuty agenta w chmurze z twojego planu.",
    },
  },
  modes: {
    cta: "Zacznij nagrywać",
    heading: "Nagrywaj ekran rozszerzeniem Chrome",
    subtitle:
      "Zainstaluj je i naciśnij przycisk nagrywania. Gdy skończysz, dostaniesz link, który może obejrzeć każdy, z tytułem, podsumowaniem, rozdziałami i transkrypcją.",
    scene: {
      timer: "0:42",
      heading: "Jak działa zwrot pieniędzy",
      steps: ["Wniosek", "Akceptacja", "Wypłata"],
      captions: [
        "Krótkie omówienie tego, jak działa zwrot pieniędzy.",
        "Najpierw klient wysyła wniosek.",
        "Dział wsparcia akceptuje go tego samego dnia.",
        "Potem pieniądze są wypłacane automatycznie.",
      ],
    },
  },
  pageHeroes: {
    home: "Strona główna",
    features: {
      label: "Funkcje",
      word: "FUNKCJE",
      title: "Nagrywaj, edytuj i udostępniaj swój ekran",
      subtitle:
        "Nagrywaj ekran i kamerę. Każde nagranie udostępnisz jako link, który twój zespół może komentować.",
    },
    pricing: {
      label: "Cennik",
      word: "CENNIK",
      title: "Zacznij za darmo. Płać jedną cenę za członka.",
      subtitle:
        "Plan Darmowy obejmuje pierwsze 25 nagrań. Light i Pro znoszą limit. Możesz też hostować CaptureFlow samodzielnie za darmo.",
    },
    faq: {
      label: "FAQ",
      word: "FAQ",
      title: "Najczęściej zadawane pytania",
      subtitle:
        "Odpowiedzi na pytania o nagrywanie, ceny, przechowywanie i self-hosting. Resztę znajdziesz w dokumentacji.",
    },
  },
  collaboration: {
    heading: "Co możesz zrobić po nagraniu",
    cta: "Wypróbuj za darmo",
    subtitle:
      "Edytuj nagranie, a potem je udostępnij lub osadź. Zaproś zespół do oglądania i komentowania wideo innych osób oraz reagowania na nie.",
    categories: {
      share: {
        feature: {
          tag: "nowość",
          title: "Edytuj swoje wideo",
          cta: "Zainstaluj rozszerzenie",
          body: "Usuń słowa z transkrypcji, aby wyciąć je z wideo, albo przytnij klipy na osi czasu. Zmień tło, przesuń, przeskaluj lub ukryj kamerę i wycisz mikrofon albo dźwięk systemowy.",
        },
        scene: {
          app: "Plan premiery",
          nav: ["Przegląd", "Roadmapa", "Zadania", "Dokumenty"],
          columns: [
            {
              name: "Do zrobienia",
              tasks: ["Teksty na stronę cennika", "E-mail powitalny"],
            },
            {
              name: "W toku",
              tasks: ["Nowy wygląd płatności", "Zaproszenia do zespołu"],
            },
            { name: "Gotowe", tasks: ["Formularz zapisu do bety"] },
          ],
          background: "Tło",
          camera: "Kamera",
          shapes: ["Koło", "Kwadrat"],
          fillers: "Wypełniacze",
          remove: "Usuń",
          transcript: {
            before: "Kliknij tutaj, aby",
            fillers: ["yyy,", "czekaj,", "przepraszam,"],
            after: "udostępnić link.",
          },
          saved: "Zapisano · ten sam link",
        },
      },
      embed: {
        feature: {
          title: "Udostępnij lub osadź swoje wideo",
          cta: "Zainstaluj rozszerzenie",
          body: "Wklej link na Slacku, GitHubie, w Notion lub w e-mailu, a pojawi się podgląd. Możesz też osadzić odtwarzacz w swojej dokumentacji lub na stronie. Z zainstalowanym rozszerzeniem wideo odtwarza się bezpośrednio w zgłoszeniach i pull requestach na GitHubie.",
        },
        scene: {
          question: "Pokażesz mi, jak zaprosić zespół do przestrzeni roboczej?",
          reply: "Jasne! Oto krótkie omówienie kolejnych kroków:",
          url: "captureflow.dev/r/8kx2pnq4",
          app: "Ustawienia",
          nav: ["Ogólne", "Członkowie", "Płatności"],
          members: "Członkowie",
          invite: "Zaproś",
          people: [
            { initials: "AR", name: "Alex Rivera", role: "Właściciel" },
            { initials: "CK", name: "Chris Kim", role: "Członek" },
            { initials: "JB", name: "Jordan Bell", role: "Członek" },
          ],
          duration: "0:48",
        },
      },
      feedback: {
        feature: {
          title: "Współpracuj nad swoimi wideo",
          cta: "Zaloguj się",
          body: "Pracujcie razem bez spotkań, w różnych strefach czasowych. Zespół może reagować emoji, komentować dowolny moment wideo i śledzić treść dzięki transkrypcjom i napisom.",
        },
        scene: {
          title: "Omówienie planu premiery",
          author: "Alex",
          age: "przed chwilą",
          duration: "1:12",
          activity: "Aktywność",
          events: [
            { initials: "CK", name: "Chris", at: "0:09", emoji: "👍" },
            { initials: "JB", name: "Jordan", at: "0:17", emoji: "🔥" },
            {
              initials: "MC",
              name: "Maya",
              at: "0:27",
              text: "Świetny nowy widok tablicy",
            },
            { initials: "SL", name: "Sam", at: "0:37", emoji: "❤️" },
            {
              initials: "JB",
              name: "Jordan",
              at: "0:48",
              text: "Możemy to wdrożyć w piątek?",
            },
            {
              initials: "AR",
              name: "Alex",
              at: "0:56",
              text: "Tak, zaraz po QA ✅",
            },
            { initials: "MC", name: "Maya", at: "1:05", emoji: "👏" },
          ],
        },
      },
      workspaces: {
        feature: {
          title: "Zaproś zespół do przestrzeni roboczej",
          cta: "Utwórz przestrzeń roboczą",
          body: "Nagrania wszystkich osób trafiają do jednej przestrzeni roboczej. Każde wideo może być publiczne, widoczne dla przestrzeni roboczej albo prywatne.",
        },
        scene: {
          team: "Zespół CaptureFlow",
          members: ["1 członek", "2 członków", "3 członków"],
          memberInitials: ["AR", "CK", "JB"],
          invitePlaceholder: "Zaproś przez e-mail",
          inviteEmail: "chris@acme.co, jordan@acme.co",
          invite: "Zaproś",
          invited: "Wysłano",
          joined: "Chris i Jordan dołączyli 🎉",
          whoCanWatch: "Kto może oglądać:",
          visibility: [
            { label: "Publiczne", detail: "Każdy, kto ma link" },
            { label: "Przestrzeń robocza", detail: "Tylko twój zespół" },
            { label: "Prywatne", detail: "Tylko ty" },
          ],
        },
      },
    },
  },
  setupService: {
    title: "Wdrożymy wszystko",
    titleHighlight: "za ciebie",
    subtitle:
      "Opowiedz nam o swojej firmie. Skonfigurujemy aplikację, rozszerzenie Chrome, aplikację na macOS i całą infrastrukturę, tak aby zespół mógł od razu z nich korzystać.",
    includedHeading: "Wszystko, co konfigurujemy",
    included: {
      infra: {
        title: "Aplikacja na twojej infrastrukturze",
        body: "Wdrożona na twoim koncie Cloudflare i dostępna pod twoją domeną. Wszystko należy do ciebie.",
      },
      storage: {
        title: "Przechowywanie i baza danych",
        body: "Nagrania we własnym zasobniku R2; przestrzenie robocze i komentarze we własnej bazie danych.",
      },
      signin: {
        title: "Logowanie tylko dla firmy",
        body: "Logowanie przez Google Workspace lub GitHub, ograniczone do domeny e-mail twojej firmy.",
      },
      apps: {
        title: "Rozszerzenie Chrome i aplikacja na Maca",
        body: "Obie zbudowane dla twojej instancji, a rozszerzenie opublikowane prywatnie dla twojego zespołu.",
      },
      ready: {
        title: "Gotowe do nagrywania",
        body: "Przestrzenie robocze są utworzone, a zespół zaproszony, więc można od razu zacząć udostępniać.",
      },
      handover: {
        title: "Przekazanie",
        body: "Pokazujemy osobie, która będzie się tym opiekować, jak to uruchamiać i aktualizować.",
      },
    },
    nextHeading: "Skontaktuj się z nami",
    nextSubheading: "Napisz, czego potrzebujesz, a odezwiemy się.",
    form: {
      company: "Firma",
      companyPlaceholder: "Acme Inc.",
      name: "Imię i nazwisko",
      namePlaceholder: "Jane Doe",
      email: "Służbowy e-mail",
      emailPlaceholder: "jane@acme.com",
      topic: "W czym możemy pomóc?",
      topics: ["Wdrożenie self-hostingu", "Ponad 1 TB", "Coś innego"],
      teamSize: "Wielkość zespołu",
      teamSizes: ["1–10", "11–50", "51–200", "200+"],
      cloudflare: "Masz konto Cloudflare?",
      cloudflareOptions: ["Tak", "Nie", "Nie wiem"],
      notes: "Czy powinniśmy wiedzieć coś jeszcze?",
      notesPlaceholder: "Wielkość zespołu, domena, terminy…",
      submit: "Wyślij wiadomość",
      error:
        "Nie udało się wysłać zgłoszenia. Spróbuj ponownie albo napisz do nas na {email}.",
      sentTitle: "Wiadomość wysłana",
      sentBody: "Dziękujemy. Odpiszemy na adres {email}.",
      back: "Wróć na stronę główną",
    },
  },
  enterprise: {
    title: "CaptureFlow dla",
    titleHighlight: "twojej firmy",
    subtitle:
      "Zarządzany plan dla firm, które chcą stanowisk dla wszystkich na raz uzgodnionych warunkach i z jedną fakturą.",
    includedHeading: "Co dodaje Enterprise",
    included: {
      storage: {
        title: "Miejsce dopasowane do ciebie",
        body: "Pula dopasowana do tego, ile nagrywa twoja firma, a nie limit na stanowisko.",
      },
      seats: {
        title: "Stanowiska dla wszystkich",
        body: "Jedna umowa obejmuje całą firmę, niezależnie od tego, ile osób nagrywa.",
      },
      roadmap: {
        title: "Twoje prośby w pierwszej kolejności",
        body: "Funkcje, o które prosi twój zespół, trafiają na początek naszej listy.",
      },
      managed: {
        title: "W pełni zarządzany",
        body: "Hostujemy go i wdrażamy aktualizacje, więc niczego nie musisz utrzymywać.",
      },
      billing: {
        title: "Rozliczenie roczne",
        body: "Płacisz raz w roku, po cenie uzgodnionej dla twojej firmy.",
      },
      support: {
        title: "Bezpośredni kontakt z nami",
        body: "Pytania trafiają prosto do ludzi, którzy tworzą CaptureFlow.",
      },
    },
    everythingHeading: "Wszystko, co dostaje twój zespół",
    comingSoon: "Wkrótce",
    everything: {
      extension: {
        title: "Rozszerzenie Chrome",
        body: "Nagrywaj dowolną kartę lub ekran, a link jest gotowy po zakończeniu.",
      },
      mac: {
        title: "Aplikacja na Maca",
        body: "Natywny program do nagrywania na macOS, z tymi samymi natychmiastowymi linkami do udostępnienia.",
      },
      workspaces: {
        title: "Przestrzenie robocze zespołu",
        body: "Nagrania wszystkich w jednym miejscu, udostępnione lub prywatne.",
      },
      feedback: {
        title: "Komentarze i reakcje",
        body: "Widzowie odpowiadają wprost na osi czasu, dokładnie w tym momencie, o który im chodzi.",
      },
      edit: {
        title: "Edycja po udostępnieniu",
        body: "Zmień tło, kamerę lub dźwięk, a link pozostaje ten sam.",
      },
      screenshots: {
        title: "Zrzuty ekranu z adnotacjami",
        body: "Dodaj do zrzutu ekranu strzałki, tekst i rozmycie i udostępnij go jako link.",
      },
    },
    formHeading: "Skontaktuj się z nami",
    formSubheading: "Opowiedz nam o swoim zespole, a odpowiemy e-mailem.",
    form: {
      company: "Firma",
      companyPlaceholder: "Acme Inc.",
      name: "Imię i nazwisko",
      namePlaceholder: "Jane Doe",
      email: "Służbowy e-mail",
      emailPlaceholder: "jane@acme.com",
      need: "Czego potrzebujesz?",
      needs: [
        "Stanowiska dla dużego zespołu",
        "Indywidualne warunki lub jedna faktura",
        "Coś innego",
      ],
      teamSize: "Wielkość zespołu",
      teamSizes: ["1–10", "11–50", "51–200", "200+"],
      storage: "Ile miejsca potrzebujesz?",
      storageOptions: ["1–5 TB", "5–20 TB", "20 TB+", "Nie wiem"],
      notes: "Czy powinniśmy wiedzieć coś jeszcze?",
      notesPlaceholder:
        "Ile nagrywa twój zespół, terminy, wymagania dotyczące rozliczeń…",
      submit: "Wyślij wiadomość",
      error:
        "Nie udało się wysłać wiadomości. Spróbuj ponownie albo napisz do nas na {email}.",
      sentTitle: "Wiadomość wysłana",
      sentBody: "Dziękujemy. Odpiszemy na adres {email}.",
      back: "Wróć na stronę główną",
    },
  },
  pricing: {
    heading: "Cennik",
    cta: "Porównaj wszystkie plany",
    subheading:
      "Plan Darmowy obejmuje pierwsze nagrania. Płatne plany to jedna cena za członka.",
    controls: {
      teamSize: "Wielkość zespołu",
      members: "członków",
      title: "Rozliczenie",
      note: "Jedna cena za członka.",
      billing: "Płatność",
      monthly: "Miesięcznie",
      annually: "Rocznie",
      save: "Oszczędź {percent}%",
    },
    compare: {
      loomRow: "Loom {plan}",
      loomDetail: "{seats} osób × {perSeat} za osobę",
      caption: "Ceny miesięczne.",
      captureflowRow: "CaptureFlow {ourPlan}",
      captureflowDetail: "{seats} członków × {ourPerSeat} za członka",
      saveLabel: "Twój zespół oszczędza",
      saveValue: "{savings} rocznie",
    },
    plans: {
      member: "członka",
      members: "członków",
      included: "W planie",
      notIncluded: "Poza planem",
      free: {
        name: "Darmowy",
        description: "Nagrania ekranu, które udostępniasz jako link.",
        cta: "Zarejestruj się",
      },
      light: {
        name: LIGHT,
        featuresHeading: "Wszystko z planu Darmowego oraz",
        features: [
          "Nagrania bez limitu",
          "Nieograniczony czas nagrywania",
          `${LIGHT_AGENT_MIN} min miesięcznie na nagrania agenta w chmurze, do 10 min każde`,
        ],
        description: "Nagrania bez limitu w trybie oszczędzania danych.",
        period: "/mies.",
        noteMonthly: "Za członka, rozliczane miesięcznie",
        noteAnnual:
          "Za członka, rozliczane rocznie. ${yearly} rocznie za {seats} {members}",
        cta: "Wypróbuj za darmo",
      },
      pro: {
        badge: "Polecany",
        name: PRO,
        featuresHeading: `Wszystko z planu ${LIGHT} oraz`,
        features: [
          "Pełna jakość, do 1080p",
          "Rozdziały i tytuły AI oraz usuwanie wypełniaczy",
          "Własny branding",
          `${PRO_AGENT_MIN} min miesięcznie na nagrania agenta w chmurze, w tym ${PRO_VOICEOVER_MIN} min lektora AI`,
          "Statystyki oglądalności (wkrótce)",
          "Integracje ze Slackiem, Notion i Zapierem (wkrótce)",
        ],
        description: "Pełna jakość, porządkowanie przez AI i własny branding.",
        period: "/mies.",
        noteMonthly: "Za członka, rozliczane miesięcznie",
        noteAnnual:
          "Za członka, rozliczane rocznie. ${yearly} rocznie za {seats} {members}",
        cta: "Wypróbuj za darmo",
      },
      rows: {
        recordings: {
          label: "Nagrania na osobę",
          free: "Do {recordings}",
          light: "Bez limitu",
          pro: "Bez limitu",
        },
        length: {
          label: "Długość nagrania",
          free: "{minutes} min na wideo",
          light: "Bez limitu",
          pro: "Bez limitu",
        },
        quality: {
          label: "Jakość wideo",
          free: "Oszczędzanie danych",
          light: "Oszczędzanie danych",
          pro: "Do 1080p",
        },
        transcripts: {
          label: "Transkrypcje i napisy",
          free: true,
          light: true,
          pro: true,
        },
        editing: {
          label: "Edycja z poziomu transkrypcji",
          free: true,
          light: true,
          pro: true,
        },
        chapters: {
          label: "Rozdziały i tytuły AI",
          free: false,
          light: false,
          pro: true,
        },
        filler: {
          label: "Usuwanie wypełniaczy",
          free: false,
          light: false,
          pro: true,
        },
        feedback: {
          label: "Komentarze i reakcje",
          free: true,
          light: true,
          pro: true,
        },
        agents: {
          label: "Lokalne nagrania agenta",
          free: true,
          light: true,
          pro: true,
        },
        cloudAgents: {
          label: "Nagrania agenta w chmurze",
          free: `${FREE_AGENT_MIN} min miesięcznie`,
          light: `${LIGHT_AGENT_MIN} min miesięcznie`,
          pro: `${PRO_AGENT_MIN} min miesięcznie`,
        },
        voiceover: {
          label: "Lokalny lektor AI",
          free: true,
          light: true,
          pro: true,
        },
        cloudVoiceover: {
          label: "Lektor AI w chmurze",
          free: false,
          light: false,
          pro: `${PRO_VOICEOVER_MIN} min miesięcznie`,
        },
        branding: {
          label: "Własny branding",
          free: false,
          light: false,
          pro: true,
        },
      },
    },
    table: {
      heading: "Wszystkie funkcje, plan po planie",
      subtitle: "Darmowy, Light i Pro obok siebie.",
      groups: [
        {
          title: "Nagrywanie",
          rows: [
            {
              label: "Członkowie",
              free: "Bez limitu",
              light: "Bez limitu",
              pro: "Bez limitu",
            },
            {
              label: "Nagrania na osobę",
              free: "Do {recordings}",
              light: "Bez limitu",
              pro: "Bez limitu",
            },
            {
              label: "Długość nagrania",
              free: "{minutes} min na wideo",
              light: "Bez limitu",
              pro: "Bez limitu",
            },
            {
              label: "Jakość wideo",
              free: "Oszczędzanie danych",
              light: "Oszczędzanie danych",
              pro: "Do 1080p",
            },
            {
              label: "Zrzuty ekranu",
              free: "Bez limitu",
              light: "Bez limitu",
              pro: "Bez limitu",
            },
            {
              label: "Przechowywanie nagrań",
              free: "30 dni bez wyświetlenia",
              light: "Dopóki ich nie usuniesz",
              pro: "Dopóki ich nie usuniesz",
            },
            {
              label: "Nagrywanie całego ekranu, okna lub karty",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Okienko kamery i efekty kamery",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Mikrofon i dźwięk systemowy",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Płynny kursor",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Rozszerzenie Chrome i aplikacja na Maca",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "AI",
          rows: [
            {
              label: "Transkrypcje",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Napisy",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Rozdziały z podsumowaniem",
              free: false,
              light: false,
              pro: true,
            },
            {
              label: "Automatyczne propozycje tytułów",
              free: false,
              light: false,
              pro: true,
            },
            {
              label: "Edycja wideo z poziomu transkrypcji",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Usuwanie wypełniaczy",
              free: false,
              light: false,
              pro: true,
            },
          ],
        },
        {
          title: "Agenci",
          rows: [
            {
              label: "Nagrania agenta na twoim komputerze",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Nagrania agenta w przeglądarce w chmurze",
              free: `${FREE_AGENT_MIN} min miesięcznie na osobę`,
              light: `${LIGHT_AGENT_MIN} min miesięcznie na członka`,
              pro: `${PRO_AGENT_MIN} min miesięcznie na członka`,
            },
            {
              label: "Slajdy w nagraniach agenta",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Lektor AI na twoim komputerze",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Lektor AI w przeglądarce w chmurze",
              free: false,
              light: false,
              pro: `${PRO_VOICEOVER_MIN} min miesięcznie na członka`,
            },
          ],
        },
        {
          title: "Edycja",
          rows: [
            {
              label: "Edycja po udostępnieniu, ten sam link",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Tła",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Przesuwanie i skalowanie okienka kamery",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Wycinanie fragmentów wideo",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Zrzuty ekranu z adnotacjami: strzałki, tekst i rozmycie",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Nieskończone płótno",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "Udostępnianie i opinie",
          rows: [
            {
              label: "Link do udostępnienia gotowy po zakończeniu nagrywania",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Linki publiczne, dla przestrzeni roboczej lub prywatne",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Prośba o dostęp do linków z ograniczeniami",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Podgląd linków w czacie i e-mailu",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Osadzanie odtwarzacza w dowolnym miejscu",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Odtwarzanie w zgłoszeniach i pull requestach na GitHubie",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Komentarze na osi czasu",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Reakcje emoji",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Liczba wyświetleń",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Pobieranie oryginalnego pliku",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "Przestrzeń robocza i administracja",
          rows: [
            {
              label: "Przestrzeń robocza zespołu",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Role właściciela, członka i widza",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Domyślna widoczność i uprawnienia do przesyłania",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Wyszukiwanie w nagraniach i zrzutach ekranu",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Własny branding",
              free: false,
              light: false,
              pro: true,
            },
          ],
        },
        {
          title: "Hosting i wsparcie",
          rows: [
            {
              label: "Open source na licencji AGPL",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Self-hosting na własnym koncie Cloudflare",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Zarządzany hosting i aktualizacje",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
      ],
    },
    includes: {
      heading: "Każdy plan zawiera",
      items: [
        "Własna przestrzeń robocza, zaproś dowolną osobę",
        "Efekty kamery",
        "Transkrypcje i napisy AI",
        "Edycja wideo z poziomu transkrypcji",
        "Linki do udostępnienia: publiczne, dla przestrzeni roboczej lub prywatne",
        "Komentarze i reakcje emoji",
        "Zrzuty ekranu z adnotacjami",
        "Nieskończone płótno",
      ],
    },
    annual: {
      badgePro: "Zarządzany",
      badgeCycle: "Rocznie",
      title: "Zarządzany hosting",
      subtitle: "W pełni hostowany, rozliczany rocznie.",
      period: "/miesiąc",
      note: "Rozliczane {amount}/rok. Anuluj w dowolnym momencie.",
      cta: "Zacznij",
    },
  },
  activity: {
    heading: "Najnowsze zmiany na GitHubie",
    subtitle:
      "Każda zmiana jest publiczna. To najnowsze pull requesty i otwarte zgłoszenia na GitHubie.",
    cta: "Zobacz na GitHubie",
    shippedHeading: "Ostatnio scalone",
    openHeading: "Otwarte zgłoszenia i pull requesty",
    emptyOpen: "W tej chwili nic nie jest otwarte.",
    newIssue: "Zgłoś błąd lub zaproponuj funkcję",
    viewAll: "Zobacz wszystko na GitHubie",
  },
  faq: {
    heading: "Najczęściej zadawane pytania",
    subtitle:
      "Odpowiedzi na pytania o nagrywanie, ceny, przechowywanie i self-hosting. Resztę znajdziesz w dokumentacji.",
    cta: "Przeczytaj dokumentację",
    waitlistLink: "Dołącz do listy oczekujących",
    items: [
      {
        question: "Jak zrobić nagranie?",
        answer:
          "Są dwa sposoby, a różnią się tym, kto nagrywa.\n\nZ rozszerzeniem Chrome nagrywasz samodzielnie. Klikasz po swoim ekranie i możesz to komentować własnym głosem i kamerą. Używaj go do szybkich aktualizacji, opinii i wszystkiego, w czym musisz wystąpić osobiście.\n\nZ agentem AI opisujesz wideo, a agent sam klika i nagrywa je za ciebie, więc możesz pracować dalej. Może dodać slajdy i lektora AI. Używaj go do dem produktu, poradników i zgłoszeń błędów.\n\nAby nagrać samodzielnie:\n1. Zainstaluj rozszerzenie CaptureFlow z Chrome Web Store.\n2. Kliknij jego ikonę na pasku narzędzi przeglądarki i zaloguj się.\n3. Kliknij ikonę ponownie. Wybierz This tab, Window lub Full screen i włącz kamerę oraz mikrofon, jeśli chcesz.\n4. Naciśnij Start Recording. Pasek na stronie pozwala wstrzymać lub zatrzymać nagrywanie.\n5. Naciśnij stop. Otworzy się strona nagrania z linkiem, który możesz udostępnić każdemu.\n\nAby nagranie zrobił agent:\n1. Połącz CaptureFlow z aplikacją AI, której używasz. W sekcji o agentach na stronie głównej znajdziesz kroki dla Claude, ChatGPT, Claude Code, Codex i Cursor.\n2. Zaloguj się, gdy otworzy się karta przeglądarki. Robisz to tylko raz.\n3. Poproś o wideo zwykłymi słowami, na przykład: Nagraj demo pokazujące, jak zarejestrować się na naszej stronie, z lektorem.\n4. Agent nagra wideo i da ci link, który możesz udostępnić każdemu.",
      },
      {
        question: "Czy mogę hostować CaptureFlow samodzielnie?",
        answer:
          "Tak. CaptureFlow jest open source na licencji AGPL, a cały backend działa na Cloudflare: Workers dla aplikacji i API, R2 dla nagrań i D1 dla całej reszty. Utwórz bazę danych D1 i zasobnik R2, zastosuj migracje, ustaw jeden sekret i wdróż. Jest też przycisk Deploy to Cloudflare. Poradnik znajdziesz na docs.captureflow.dev.",
      },
      {
        question: "Czy mój agent AI może nagrywać wideo za mnie?",
        answer:
          "Tak. Dodaj CaptureFlow do Claude Code, Codex lub Cursor jedną linijką albo dodaj go w Claude lub ChatGPT, a potem poproś o wideo zwykłymi słowami. Agent nagra przeglądarkę, ekran lub aplikację na twoim komputerze, doda slajdy i lektora, jeśli chcesz, i da ci link do udostępnienia.\n\nLokalne nagrania agenta są dostępne w każdym planie. Nagrania agenta w chmurze mają miesięczny limit zależny od planu.",
      },
      {
        question: "Jak działają ceny płatnych planów?",
        answer: `${LIGHT} i ${PRO} to jedna cena za członka miesięcznie, niższa przy rozliczeniu rocznym. Członek to osoba, która nagrywa, więc płacisz tylko za osoby tworzące nagrania.\n\nGdy ktoś dołącza lub odchodzi, liczba stanowisk zmienia się na następnej fakturze.`,
      },
      {
        question: "Jak długo przechowywane są moje nagrania?",
        answer:
          "W płatnych planach do momentu, gdy je usuniesz. W planie darmowym nagranie jest usuwane po 30 dniach bez wyświetlenia, żeby nieaktywne konta nie zajmowały miejsca. Jeśli hostujesz samodzielnie, zasady ustalasz ty.",
      },
      {
        question: "Co zawiera plan darmowy?",
        answer: `Dostajesz 25 nagrań na osobę, do 5 minut każde, w trybie oszczędzania danych, z transkrypcjami i napisami. Nagrania są usuwane po 30 dniach bez wyświetlenia. Zarejestruj się, zainstaluj rozszerzenie Chrome i zacznij nagrywać.\n\n${LIGHT} znosi limity w jednej cenie za członka i przechowuje nagrania, dopóki ich nie usuniesz.`,
      },
    ],
  },
  cta: {
    headline: "Zacznij nagrywać",
    subtitle:
      "Pobierz za darmo. Bez karty kredytowej. Powiedz to w krótkiej wiadomości wideo zamiast na kolejnym spotkaniu.",
    button: "Wypróbuj CaptureFlow za darmo",
  },
  footer: {
    tagline:
      "Nagrywanie ekranu open source z natychmiastowymi linkami do udostępnienia.",
    lights: "Światło",
    lightsOn: "Włączone · pociągnij za sznurek",
    lightsOff: "Wyłączone · pociągnij za sznurek",
    product: {
      title: "Produkt",
      features: "Funkcje",
      pricing: "Cennik",
      compare: "Porównanie",
      download: "Pobierz",
      suggest: "Zaproponuj funkcję",
    },
    resources: {
      title: "Zasoby",
      docs: "Dokumentacja",
      selfHosting: "Self-hosting",
      blog: "Blog",
      releases: "Wydania",
      faq: "FAQ",
      security: "Bezpieczeństwo",
    },
    community: {
      title: "Społeczność",
    },
    legal: {
      title: "Informacje prawne",
      privacy: "Polityka prywatności",
      terms: "Regulamin",
      refund: "Polityka zwrotów",
      license: "Licencja (AGPL-3.0)",
    },
    rights: "© {year} CaptureFlow. Wszelkie prawa zastrzeżone.",
    openSource: "Open source na licencji AGPL-3.0",
  },
  pageShell: {
    logoAlt: "CaptureFlow",
    backToHome: "Wróć na stronę główną",
  },
  waitlist: {
    errors: {
      joinFailed:
        "Nie udało się dołączyć do listy oczekujących. Spróbuj ponownie.",
      network: "Błąd sieci. Spróbuj ponownie.",
    },
    success:
      "Jesteś na liście. Napiszę do ciebie, gdy CaptureFlow będzie gotowy.",
    emailPlaceholder: "you@example.com",
    buttonLoading: "Dołączanie…",
    buttonDefault: "Dołącz do listy oczekujących",
    earlyAccessPrompt: "Chcesz wcześniejszy dostęp?",
    earlyAccessLink: "Zostań beta-testerem",
  },
  download: {
    heading: "Pobierz CaptureFlow",
    subtitle:
      "Dostępny dla Chrome, a aplikacja na macOS pojawi się wkrótce. Każde nagranie dostaje link, który możesz udostępnić.",
    button: "Pobierz na macOS",
    requires: "Wymaga {version} lub nowszego na Apple Silicon.",
    requirements: "Wymaga macOS 14 lub nowszego na Apple Silicon.",
    versionLabel: "Wersja {version}",
    sizeLabel: "DMG, {size} MB",
    notarized: "Podpisana i poświadczona przez Apple",
  },
  downloadPage: {
    otherWays: "Inne sposoby pobrania",
    buildTitle: "Zbuduj ze źródeł",
    buildBody:
      "Sklonuj repozytorium i uruchom program do nagrywania lokalnie za pomocą pnpm.",
    releasesTitle: "Wszystkie wydania",
    releasesBody:
      "Przeglądaj wszystkie opublikowane wersje i listę zmian na GitHubie.",
    cloud: "Wolisz chmurę? {link} i oglądaj nagrania w przeglądarce.",
    cloudLink: "Załóż konto",
  },
  blog: {
    title: "Blog",
    subtitle: "Wskazówki, poradniki i nowości o nagrywaniu ekranu.",
    readArticle: "Czytaj artykuł",
    empty: "Nie ma jeszcze wpisów. Zajrzyj wkrótce.",
  },
};

export default messages;

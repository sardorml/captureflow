import type { AppMessages } from "../messages";

const messages: AppMessages = {
  common: {
    cancel: "Anuluj",
    save: "Zapisz",
    saving: "Zapisywanie…",
    delete: "Usuń",
    deleting: "Usuwanie…",
    remove: "Usuń",
    close: "Zamknij",
    back: "Wstecz",
    continue: "Kontynuuj",
    confirm: "Potwierdź",
    done: "Gotowe",
    edit: "Edytuj",
    copy: "Kopiuj",
    copied: "Skopiowano",
    search: "Szukaj",
    loading: "Ładowanie…",
    retry: "Spróbuj ponownie",
    learnMore: "Dowiedz się więcej",
    language: "Język",
    themeToLight: "Przełącz na jasny motyw",
    themeToDark: "Przełącz na ciemny motyw",
    somethingWrong: "Coś poszło nie tak. Spróbuj ponownie.",
    pageFailed: "Nie udało się wczytać tej strony.",
    partFailed: "Nie udało się wczytać tej części.",
    failedBody: "Coś poszło nie tak. Spróbuj ponownie lub odśwież stronę.",
    reload: "Odśwież stronę",
  },
  auth: {
    signedInAs: "Zalogowano jako {email}.",
    errors: {
      generic: "Coś poszło nie tak. Spróbuj ponownie.",
      network: "Błąd sieci. Spróbuj ponownie.",
    },
    login: {
      metaTitle: "Zaloguj się",
      signInTitle: "Witaj ponownie",
      signInDescription: "Zaloguj się przez Google, GitHub lub e-mail",
      signUpTitle: "Utwórz konto",
      signUpDescription: "Zarejestruj się przez Google, GitHub lub e-mail",
      inviteTitle: "Dołącz do {workspace}",
      inviteDescription:
        "{inviter} zaprasza cię. Zaloguj się lub utwórz konto z adresem {email}, aby przyjąć zaproszenie.",
      continueWith: "Kontynuuj przez {provider}",
      or: "Lub",
      emailLabel: "E-mail",
      emailPlaceholder: "you@example.com",
      emailInvalid: "Podaj prawidłowy adres e-mail.",
      continueWithEmail: "Kontynuuj przez e-mail",
      askForInvite: "Potrzebujesz konta? Poproś administratora o zaproszenie.",
      haveAccount: "Masz już konto? {action}",
      haveAccountAction: "Zaloguj się",
      noAccount: "Nie masz konta? {action}",
      noAccountAction: "Zarejestruj się",
      changeEmail: "Zmień",
      nameLabel: "Imię i nazwisko",
      namePlaceholder: "Twoje imię i nazwisko",
      passwordLabel: "Hasło",
      newPasswordPlaceholder: "Co najmniej 12 znaków",
      passwordTooShort: "Użyj co najmniej 12 znaków.",
      passwordMissing: "Podaj hasło.",
      signInSubmit: "Zaloguj się",
      signUpSubmit: "Utwórz konto",
      terms: "Kontynuując, akceptujesz nasz {terms} i {privacy}.",
      termsLink: "Regulamin",
      privacyLink: "Politykę prywatności",
    },
    verify: {
      title: "Sprawdź pocztę",
      description:
        "Wysłaliśmy link na adres {email}. Otwórz go, aby dokończyć zakładanie konta.",
      resend: "Wyślij ponownie",
      resent: "Wysłano ponownie",
      resendFailed: "Nie udało się wysłać e-maila. Spróbuj ponownie.",
      wrongAddress: "Zły adres? {action}",
      wrongAddressAction: "Użyj innego adresu e-mail",
    },
    oauthErrors: {
      unfinished: "Logowanie nie zostało dokończone. Spróbuj ponownie.",
      inviteOnly:
        "Ta instancja CaptureFlow jest dostępna tylko na zaproszenie. Poproś o nie administratora.",
      allowedDomains:
        "Zarejestruj się adresem w domenie {domains} albo poproś administratora o zaproszenie.",
      providerDomains:
        "Zarejestruj się kontem Google lub GitHub w domenie {domains}.",
      domainChoice: "{first} lub {second}",
    },
    inviteFallbacks: {
      workspace: "przestrzeni roboczej CaptureFlow",
      inviter: "Ktoś z zespołu",
    },
    setPassword: {
      title: "Ustaw hasło",
      description:
        "Wybierz hasło dla konta {email}. Potem od razu cię zalogujemy.",
      passwordLabel: "Nowe hasło",
      passwordPlaceholder: "Co najmniej 12 znaków",
      submit: "Zapisz hasło",
      expiredTitle: "Ten link już nie działa",
      expiredDescription:
        "Został już użyty albo wygasł. Poproś administratora o nowy.",
      goToSignIn: "Przejdź do logowania",
    },
    invite: {
      title: "Masz zaproszenie",
      asViewer:
        "Zaproszono cię do {workspace} w CaptureFlow jako widza: możesz oglądać i komentować wszystko, co jest tam udostępniane.",
      asMember:
        "Zaproszono cię do {workspace} w CaptureFlow jako członka: możesz tam nagrywać i udostępniać nagrania zespołowi.",
      accept: "Przyjmij zaproszenie",
      databaseUnavailable: "Baza danych jest niedostępna",
      invalidTitle: "Zaproszenie jest już nieważne",
      invalidBody:
        "Ten link wygasł albo został już użyty. Poproś właściciela przestrzeni roboczej o nowe zaproszenie.",
      wrongAccountTitle: "Niewłaściwe konto",
      wrongAccountBody:
        "To zaproszenie wysłano na adres {invited}, a zalogowano cię jako {current}. Wyloguj się i zaloguj adresem z zaproszenia, aby je przyjąć.",
      goToDashboard: "Przejdź do panelu",
      signOut: "Wyloguj się",
    },
    handoff: {
      signingIn: "Logowanie…",
      returning: "Powrót do CaptureFlow…",
      open: "Otwórz CaptureFlow",
      hint: "Jeśli nic się nie dzieje, kliknij przycisk powyżej. Gdy aplikacja na komputer otworzy się ponownie, możesz zamknąć tę kartę.",
      extensionDone: "Zalogowano jako {email}. Możesz zamknąć tę kartę.",
      extensionUnreachable:
        "Nie udało się połączyć z rozszerzeniem CaptureFlow. Upewnij się, że jest zainstalowane, a potem kliknij jego ikonę, aby spróbować ponownie.",
      extensionUnverified:
        "Nie udało się zweryfikować rozszerzenia. Zainstaluj je ponownie i spróbuj jeszcze raz.",
    },
  },
  shell: {
    record: {
      newRecording: "Nowe nagranie",
    },
    nav: {
      toggleSidebar: "Pokaż lub ukryj pasek boczny",
      dashboard: "Panel",
      recordings: "Nagrania",
      screenshots: "Zrzuty ekranu",
      canvas: "Płótno",
      workspaceGroup: "Przestrzeń robocza",
      members: "Członkowie",
      settings: "Ustawienia",
      personal: "Osobiste",
      workspace: "Przestrzeń robocza",
      billing: "Płatności",
      admin: "Administracja",
    },
    upgradeCard: {
      title: "Ulepsz swoją przestrzeń roboczą",
      description:
        "Plan Darmowy obejmuje do {recordings} nagrań na osobę w trybie oszczędzania danych. Płatne plany znoszą limity, od {price} za członka.",
      viewPlans: "Zobacz plany",
    },
    topBar: {
      upgrade: "Ulepsz plan",
    },
    workspaceSwitcher: {
      switchWorkspace: "Przełącz przestrzeń roboczą",
      summary:
        "one:Domyślna · {n} członek|few:Domyślna · {n} członków|many:Domyślna · {n} członków|other:Domyślna · {n} członka",
      workspaces: "Przestrzenie robocze",
      owned: "Należy do ciebie",
      joined: "Należysz do niej",
      newWorkspace: "Nowa przestrzeń robocza",
      inviteMembers: "Zaproś członków",
    },
    drawer: {
      open: "Otwórz menu przestrzeni roboczej",
      title: "Menu przestrzeni roboczej",
    },
    search: {
      prompt: "Szukaj w swoich nagraniach i zrzutach ekranu",
      clear: "Wyczyść wyszukiwanie",
      results: "Wyniki wyszukiwania",
      hint: "Szukaj swoich nagrań i zrzutów ekranu po tytule.",
      noMatches: "Brak wyników",
      kind: {
        recording: "nagranie",
        screenshot: "zrzut ekranu",
      },
    },
    account: {
      menu: "Menu konta",
      nav: {
        billing: "Płatności",
        devices: "Połączone urządzenia",
        settings: "Ustawienia",
        support: "Skontaktuj się ze wsparciem",
      },
      freePlan: "Darmowy",
      signOut: "Wyloguj się",
      signingOut: "Wylogowywanie…",
    },
    theme: {
      label: "Motyw",
      light: "Jasny",
      dark: "Ciemny",
      system: "Systemowy",
    },
    notifications: {
      title: "Powiadomienia",
      subtitle: "Zaproszenia i zmiany w twoich przestrzeniach roboczych.",
      bellUnread:
        "one:Powiadomienia, {n} nieprzeczytane|few:Powiadomienia, {n} nieprzeczytane|many:Powiadomienia, {n} nieprzeczytanych|other:Powiadomienia, {n} nieprzeczytanego",
      viewAll: "Zobacz wszystkie",
      menuEmpty:
        "Jesteś na bieżąco. Zaproszenia, nowe osoby w zespole i zmiany ról pojawią się tutaj.",
      pageEmpty:
        "Jesteś na bieżąco. Gdy ktoś cię zaprosi, dołączy do twojej przestrzeni roboczej albo zmieni twoją rolę, zobaczysz to tutaj.",
      accept: "Przyjmij",
      decline: "Odrzuć",
      unread: "Nieprzeczytane",
      someone: "Ktoś",
      message: {
        invited: {
          member: "{actor} zaprasza cię do {workspace} jako członka",
          viewer: "{actor} zaprasza cię do {workspace} jako widza",
        },
        joined: {
          member: "{actor} dołącza do {workspace} jako członek",
          viewer: "{actor} dołącza do {workspace} jako widz",
        },
        seatRequested: "{actor} prosi o płatne stanowisko w {workspace}",
        seatDenied: "{actor} odrzuca twoją prośbę o stanowisko w {workspace}",
        roleChanged: {
          member: "{actor} nadaje ci rolę członka w {workspace}",
          viewer: "{actor} nadaje ci rolę widza w {workspace}",
        },
        downgraded: "{actor} zmienia twoją rolę w {workspace} na widza",
        keepRecordingUntil: "Możesz nagrywać do {date}.",
        removed: "{actor} usuwa cię z {workspace}",
      },
      acceptErrors: {
        failed: "Nie udało się przyjąć zaproszenia",
        signedOut: "Zaloguj się, aby przyjąć zaproszenie",
        invalid: "To zaproszenie wygasło lub zostało wycofane",
        emailMismatch: "To zaproszenie jest dla innego adresu e-mail",
        alreadyMember: "Jesteś już w tej przestrzeni roboczej",
      },
    },
    mobileNav: {
      open: "Otwórz menu",
      close: "Zamknij menu",
      docs: "Dokumentacja",
      star: "Daj gwiazdkę na GitHubie",
      signIn: "Zaloguj się",
      getStarted: "Zacznij",
    },
    skeletons: {
      avatar: "Awatar",
      workspaceName: "Nazwa przestrzeni roboczej",
      workspaceLogo: "Logo przestrzeni roboczej",
    },
  },
  library: {
    dashboard: {
      welcome: "Witaj ponownie",
      welcomeName: "Witaj ponownie, {name}",
      openCanvas: "Otwórz płótno",
      newRecording: "Nowe nagranie",
      stats: {
        recordings: "Nagrania",
        plusScreenshots:
          "one:Oraz {count} zrzut ekranu|few:Oraz {count} zrzuty ekranu|many:Oraz {count} zrzutów ekranu|other:Oraz {count} zrzutu ekranu",
        noScreenshots: "Nie ma jeszcze zrzutów ekranu",
        views: "Wyświetlenia",
        viewsAverage: "Średnio {count} na nagranie",
        noViews: "Nie ma jeszcze wyświetleń",
        recorded: "Nagrano",
        recordedAverage: "Średnio {duration} na nagranie",
        nothingRecorded: "Nic jeszcze nie nagrano",
        recordingsLeft: "Pozostałe nagrania",
        leftOfAllowance: "{left} z {allowance}",
        freePlanLimit: "Plan Darmowy, do {minutes} min każde",
      },
      recordedTime: {
        minutes: "{minutes} min",
        hours: "{hours} godz.",
        hoursMinutes: "{hours} godz. {minutes} min",
      },
      recent: {
        title: "Ostatnie nagrania",
        all: "Wszystkie nagrania",
        empty: "W tej przestrzeni roboczej nic jeszcze nie udostępniono.",
        views:
          "one:{n} wyświetlenie|few:{n} wyświetlenia|many:{n} wyświetleń|other:{n} wyświetlenia",
        comments:
          "one:{n} komentarz|few:{n} komentarze|many:{n} komentarzy|other:{n} komentarza",
        reactions:
          "one:{n} reakcja|few:{n} reakcje|many:{n} reakcji|other:{n} reakcji",
      },
      start: {
        title: "Zacznij nagrywać z {product}",
        surfacesLabel: "Gdzie nagrywać",
        surfaces: {
          extension: "Rozszerzenie",
          desktop: "Aplikacja na komputer",
          canvas: "Płótno",
        },
        extension: {
          description:
            "Nagrywaj dowolną kartę, okno lub cały ekran z paska narzędzi i otrzymaj link, który możesz udostępnić każdemu.",
          record: "Nagraj teraz",
          addToChrome: "Dodaj do Chrome",
        },
        desktop: {
          description:
            "Natywna aplikacja na Maca, która nagrywa ekran i kamerę z dźwiękiem systemowym, jest już w drodze. Do tego czasu rozszerzenie nagrywa dowolną kartę, okno lub cały ekran.",
          download: "Pobierz na Maca",
          comingSoon: "Wkrótce",
        },
        canvas: {
          description:
            "Pusta tablica z pisakami, kształtami i tekstem, po której rysujesz podczas nagrywania, gdy nie masz strony do pokazania.",
        },
      },
    },
    recording: {
      pageTitle: "Nagrania",
      count:
        "one:{n} nagranie|few:{n} nagrania|many:{n} nagrań|other:{n} nagrania",
      untitled: "Nagranie bez tytułu",
      aiGenerated: "Wygenerowane przez AI",
      processing: "Przetwarzanie",
      noMatches: "Żadne nagranie nie pasuje do tych filtrów.",
      empty:
        "Nie masz jeszcze żadnych linków do nagrań. Nagraj coś w aplikacji CaptureFlow na komputer, a twoje nagrania pojawią się tutaj.",
      selectAll: "Zaznacz wszystkie nagrania",
      selected:
        "one:Zaznaczono {n} nagranie|few:Zaznaczono {n} nagrania|many:Zaznaczono {n} nagrań|other:Zaznaczono {n} nagrania",
      open: "Otwórz nagranie",
      edit: "Edytuj nagranie",
      share: "Udostępnij nagranie",
      delete: "Usuń nagranie",
      deleteTitle: "Usunąć to nagranie?",
      deleteDescription:
        "Wideo i jego link natychmiast przestaną działać. Tej operacji nie można cofnąć.",
      deleteSelectedTitle:
        "one:Usunąć {n} nagranie?|few:Usunąć {n} nagrania?|many:Usunąć {n} nagrań?|other:Usunąć {n} nagrania?",
    },
    screenshot: {
      pageTitle: "Zrzuty ekranu",
      count:
        "one:{n} zrzut ekranu|few:{n} zrzuty ekranu|many:{n} zrzutów ekranu|other:{n} zrzutu ekranu",
      untitled: "Zrzut ekranu bez tytułu",
      numbered: "Zrzut ekranu {id}",
      noMatches: "Żaden zrzut ekranu nie pasuje do tych filtrów.",
      empty:
        "Nie ma jeszcze zrzutów ekranu. Otwórz CaptureFlow → kartę Screenshot → wybierz Display, Window lub Area, aby zrobić zrzut. Zrzut ekranu pojawi się tutaj automatycznie.",
      selectAll: "Zaznacz wszystkie zrzuty ekranu",
      selected:
        "one:Zaznaczono {n} zrzut ekranu|few:Zaznaczono {n} zrzuty ekranu|many:Zaznaczono {n} zrzutów ekranu|other:Zaznaczono {n} zrzutu ekranu",
      open: "Otwórz zrzut ekranu",
      edit: "Edytuj zrzut ekranu",
      share: "Udostępnij zrzut ekranu",
      delete: "Usuń zrzut ekranu",
      deleteTitle: "Usunąć ten zrzut ekranu?",
      deleteDescription:
        "Obraz i jego link natychmiast przestaną działać. Tej operacji nie można cofnąć.",
      deleteSelectedTitle:
        "one:Usunąć {n} zrzut ekranu?|few:Usunąć {n} zrzuty ekranu?|many:Usunąć {n} zrzutów ekranu?|other:Usunąć {n} zrzutu ekranu?",
    },
    filters: {
      access: "Dostęp",
      sort: "Sortowanie",
      current: "{label}: {value}",
      accessOptions: {
        all: "Dowolny dostęp",
        public: "Publiczne",
        workspace: "Przestrzeń robocza",
        private: "Prywatne",
      },
      sortOptions: {
        newest: "Od najnowszych",
        oldest: "Od najstarszych",
        views: "Najczęściej oglądane",
      },
    },
    card: {
      select: "Zaznacz: {title}",
      moreActions: "Więcej działań",
      rename: "Zmień tytuł",
      unknownAuthor: "Nieznany",
    },
    selection: {
      deleteDescription: "Ich linki natychmiast przestaną działać.",
      deleteFailed:
        "Nie udało się usunąć {failed} z {count}. Pozostałe usunięto.",
      clear: "Wyczyść",
    },
    pager: {
      label: "Strony",
      previous: "Poprzednia strona",
      next: "Następna strona",
    },
    visibility: {
      label: "Widoczność",
      labels: {
        public: "Publiczne",
        workspace: "Przestrzeń robocza",
        private: "Prywatne",
      },
      descriptions: {
        public: "Oglądać może każdy, kto ma link",
        workspace:
          "Oglądać mogą tylko zalogowani członkowie przestrzeni roboczej",
        private: "Oglądać możesz tylko ty",
      },
      workspaceNamed: "Przestrzeń robocza · {name}",
    },
    share: {
      title: "Udostępnij",
      embed: "Osadź",
      embedPublic: "Odtwarza się wszędzie, gdzie wkleisz kod.",
      embedRestricted:
        "Odtwarza się tylko u osób, które już mogą otworzyć link.",
      copyCode: "Kopiuj kod",
      generalAccess: "Dostęp ogólny",
      generalAccessCurrent: "Dostęp ogólny: {access}",
      copyLink: "Kopiuj link",
      linkCopied: "Skopiowano link",
      shareAt: "Udostępnij od {time}",
    },
    editableTitle: {
      label: "Tytuł nagrania",
      rename: "Zmień tytuł nagrania",
    },
  },
  members: {
    title: "Członkowie",
    databaseUnavailable: "Baza danych jest niedostępna.",
    role: "Rola",
    status: "Status",
    roles: {
      owner: "Administrator",
      member: "Członek",
      viewer: "Widz",
    },
    roleHints: {
      member: {
        does: "Nagrywa w tej przestrzeni roboczej.",
        costs: "Płatne stanowisko w planach Light i Pro.",
      },
      viewer: {
        does: "Ogląda i komentuje.",
        costs: "Zawsze za darmo.",
      },
    },
    statuses: {
      active: "Aktywny",
      invited: "Zaproszony",
    },
    seatSummary: {
      members:
        "one:{n} członek|few:{n} członków|many:{n} członków|other:{n} członka",
      viewers: "one:{n} widz|few:{n} widzów|many:{n} widzów|other:{n} widza",
      paidSeats:
        "one:{n} płatne stanowisko|few:{n} płatne stanowiska|many:{n} płatnych stanowisk|other:{n} płatnego stanowiska",
      membersAndViewers: "{members} i {viewers}",
      onPaidSeats:
        "{people} · {seats}. Każdy członek to jedno stanowisko; za widzów nie płacisz.",
      membersFree: "{people}. W tym planie za członków nie płacisz.",
      freePlan:
        "{people}. Plan Darmowy: każdy członek ma do {recordings} nagrań, każde do {minutes} minut; widzowie oglądają i komentują.",
      planTitle: "Plan {plan}",
      paidPlanTitle: "Plan płatny",
      freePlanTitle: "Plan Darmowy",
      upgrade: "Ulepsz przestrzeń roboczą",
    },
    table: {
      intro: "Członkowie tutaj nagrywają; widzowie oglądają i komentują.",
      ownerIntro:
        "Jako właściciel możesz zapraszać i usuwać osoby oraz zmieniać role.",
      searchPlaceholder: "Imię i nazwisko lub adres e-mail",
      searchLabel: "Szukaj członków",
      allRoles: "Wszystkie role",
      everyone: "Wszyscy",
      columns: {
        name: "Imię i nazwisko",
        dateAdded: "Data dodania",
        email: "Adres e-mail",
        actions: "Działania",
      },
      empty: "Nikt nie pasuje do tych filtrów.",
      downgradeNote: "Widz od {date} · {keep}",
      keepAsMember: "Zostaw jako członka",
      revoke: "Wycofaj",
    },
    seatRequests: {
      title: "Prośby o stanowisko",
      description:
        "Ci widzowie chcą nagrywać. Po zatwierdzeniu prośby widz staje się członkiem.",
      descriptionPaid:
        "Ci widzowie chcą nagrywać. Po zatwierdzeniu prośby widz staje się członkiem, co dodaje płatne stanowisko.",
      asked: "{email} · prośba z {date}",
      deny: "Odrzuć",
      approve: "Zatwierdź",
    },
    seatConfirm: {
      addTitle: "Przyznać osobie {name} płatne stanowisko?",
      addBody:
        "Członkowie nagrywają, więc każdy z nich to płatne stanowisko. Liczba stanowisk w twoim planie {plan} zmieni się z {seats} na {nextSeats}, a opłata z {before} na {after} miesięcznie.",
      addBodyYearly:
        "Członkowie nagrywają, więc każdy z nich to płatne stanowisko. Liczba stanowisk w twoim planie {plan} zmieni się z {seats} na {nextSeats}, a opłata z {before} na {after} miesięcznie, przy rozliczeniu rocznym.",
      addInvoice:
        "Opłata za resztę tego okresu rozliczeniowego zostanie doliczona do następnej faktury.",
      addConfirm: "Dodaj płatne stanowisko",
      removeTitle: "Zmienić rolę osoby {name} na widza?",
      removeBody:
        "{name} może nagrywać do {date}, czyli do końca opłaconego okresu. Potem zostanie widzem, który może oglądać i komentować, ale nie nagrywać.",
      removePlan:
        "Od tego momentu liczba stanowisk w twoim planie {plan} zmieni się z {seats} na {nextSeats}, a opłata z {before} na {after} miesięcznie.",
      removePlanYearly:
        "Od tego momentu liczba stanowisk w twoim planie {plan} zmieni się z {seats} na {nextSeats}, a opłata z {before} na {after} miesięcznie, przy rozliczeniu rocznym.",
      removeConfirm: "Zmień na widza",
    },
    remove: {
      label: "Usuń {name} z przestrzeni roboczej",
      title: "Usunąć {name} z {workspace}?",
      body: "Ta osoba od razu straci dostęp. Jej nagrania i zrzuty ekranu zostaną w przestrzeni roboczej.",
      freesSeat:
        "To zwolni jej płatne stanowisko: liczba stanowisk w twoim planie zmieni się z {seats} na {nextSeats}.",
    },
    leave: {
      button: "Opuść",
      title: "Opuścić {workspace}?",
      body: "Stracisz dostęp do jej nagrań i zrzutów ekranu. Twoje nagrania zostaną w tej przestrzeni roboczej.",
      comeBack: "Aby wrócić, ktoś musi zaprosić cię ponownie.",
      confirm: "Opuść przestrzeń roboczą",
    },
    invite: {
      trigger: "Zaproś członków",
      title: "Zaproś członków do {workspace}",
      titleOwnWorkspace: "Zaproś członków do swojej przestrzeni roboczej",
      description:
        "Dostaną e-mail z linkiem, który wygasa po 7 dniach. Upewnij się, że logują się tym samym adresem.",
      removeEmail: "Usuń {email}",
      addEmails: "Dodaj adresy e-mail",
      separatorHint: "Oddziel adresy spacją, przecinkiem lub klawiszem Enter.",
      paidSeatNote:
        "Każdy członek, który przyjmie zaproszenie, dodaje płatne stanowisko do twojego planu {plan}, {price} miesięcznie za każde. Opłata za resztę tego okresu trafi na następną fakturę.",
      noEmails: "Dodaj co najmniej jeden adres e-mail",
      invalidEmails: "Nieprawidłowy adres e-mail: {emails}",
      failed: "Nie udało się",
      sent: "one:Wysłano {n} zaproszenie.|few:Wysłano {n} zaproszenia.|many:Wysłano {n} zaproszeń.|other:Wysłano {n} zaproszenia.",
      sending: "Wysyłanie…",
      submit: "Wyślij zaproszenia",
    },
    actions: {
      emailRequired: "Podaj adres e-mail",
      emailInvalid: "To nie wygląda na prawidłowy adres e-mail",
      ownWorkspace: "Jesteś już w swojej przestrzeni roboczej",
      alreadyMember: "Ta osoba jest już członkiem tej przestrzeni roboczej",
      emailNotSent:
        "Zaproszenie utworzono, ale nie udało się wysłać e-maila. Skopiuj link z listy oczekujących.",
      invitationSent: "Wysłano zaproszenie na adres {email}",
      alreadyRecording: "Możesz już tutaj nagrywać",
    },
  },
  settings: {
    saved: "Zapisano",
    errors: {
      ownerOnly: "Tylko właściciel przestrzeni roboczej może to zmienić",
      databaseUnavailable: "Baza danych jest niedostępna",
      saveFailed: "Nie udało się zapisać – spróbuj ponownie",
    },
    upload: {
      uploading: "Przesyłanie…",
      missing: "Wybierz plik obrazu",
      failed: "Przesyłanie nie powiodło się",
      failedReason: "Przesyłanie nie powiodło się: {reason}",
    },
    personal: {
      title: "Ustawienia osobiste",
      account: {
        title: "Konto",
        description:
          "Jak widzą cię współpracownicy i osoby, które oglądają twoje nagrania.",
      },
      preferences: {
        title: "Preferencje",
        description: "Jak CaptureFlow wygląda i w jakim języku się wyświetla.",
      },
      languageDescription: "Język, w którym wyświetla się CaptureFlow.",
    },
    avatar: {
      label: "Awatar",
      change: "Zmień awatar",
      removing: "Usuwanie…",
      hint: "JPG, PNG, WebP lub GIF. Maks. 2 MB.",
      tooLarge: "Awatar może mieć najwyżej 2 MB",
      badType: "Awatar musi być w formacie PNG, JPEG, WebP lub GIF",
    },
    account: {
      name: {
        label: "Imię i nazwisko",
        placeholder: "Twoje imię i nazwisko",
        description:
          "Widoczne przy nagraniach, zrzutach ekranu i wpisach aktywności.",
        required: "Imię i nazwisko jest wymagane.",
        updateFailed: "Nie udało się zaktualizować imienia i nazwiska.",
      },
      email: {
        label: "Adres e-mail",
        description:
          "Służy do logowania. Aby go zmienić, skontaktuj się ze wsparciem.",
      },
      userId: {
        label: "ID użytkownika",
        copy: "Kopiuj ID użytkownika",
        description: "Podaj je, kontaktując się ze wsparciem.",
      },
      saveChanges: "Zapisz zmiany",
    },
    workspace: {
      title: "Ustawienia przestrzeni roboczej",
      tabs: {
        label: "Sekcje ustawień",
        general: "Ogólne",
        security: "Bezpieczeństwo",
      },
      general: {
        title: "Ogólne",
        description:
          "Nazwa i logo, po których rozpoznasz tę przestrzeń roboczą w przełączniku, na stronie członków i w podglądach udostępnianych linków.",
      },
      name: {
        title: "Nazwa przestrzeni roboczej",
        description: "Nazwa, pod którą widoczna jest twoja przestrzeń robocza.",
        empty: "Nazwa przestrzeni roboczej nie może być pusta",
        tooLong:
          "Nazwa przestrzeni roboczej jest za długa (maks. {max} znaków)",
      },
      logo: {
        title: "Logo przestrzeni roboczej",
        description:
          "Widoczne obok nazwy przestrzeni roboczej. PNG, JPEG, WebP, GIF lub SVG, maks. 2 MB.",
        upload: "Prześlij logo",
        replace: "Zmień logo",
        tooLarge: "Logo może mieć najwyżej 2 MB",
        badType: "Logo musi być w formacie PNG, JPEG, WebP, GIF lub SVG",
      },
      permissions: {
        title: "Domyślne uprawnienia",
        description:
          "Ustawienia stosowane do każdego nowego nagrania i zrzutu ekranu w przestrzeni roboczej.",
      },
      recordingAccess: {
        title: "Dostęp do nagrywania",
        description:
          "Zdecyduj, czy współpracownicy mogą dodawać nagrania i zrzuty ekranu do tej przestrzeni roboczej.",
        allow: {
          title: "Pozwól współpracownikom dodawać tutaj",
          body: "Członkowie mogą nagrywać w tej przestrzeni roboczej.",
        },
        ownerOnly: {
          title: "Tylko właściciel przestrzeni roboczej",
          body: "Materiały współpracowników trafiają do ich osobistych przestrzeni roboczych.",
        },
      },
    },
    devices: {
      title: "Połączone urządzenia",
      count:
        "one:{n} zalogowane urządzenie|few:{n} zalogowane urządzenia|many:{n} zalogowanych urządzeń|other:{n} zalogowanego urządzenia",
      empty:
        "Brak połączonych urządzeń. Otwórz aplikację CaptureFlow na komputer i kliknij Sign in na pasku nagrywania, aby połączyć to konto.",
      unlabelled: "Urządzenie bez nazwy",
      added: "Dodano {date}",
      addedLastUsed: "Dodano {date} · ostatnio używane {lastUsed}",
      neverUsed: "Nigdy nieużywane",
      revoke: {
        action: "Cofnij dostęp",
        title: "Wylogować to urządzenie?",
        description:
          "Aby zarządzać nagraniami, trzeba będzie zalogować się na nim ponownie.",
      },
    },
  },
  billing: {
    chargedInUsd: "Płatność w dolarach amerykańskich.",
    shownIn:
      "Ceny są wyświetlane w {currency}. Płatność jest pobierana w dolarach amerykańskich.",
    page: {
      title: "Płatności",
      subtitle: "Twój plan i to, ile z niego wykorzystujesz.",
      workspaceLabel: "Przestrzeń robocza · {name}",
      manageSubscription: "Zarządzaj subskrypcją",
      upgradeWorkspace: "Ulepsz przestrzeń roboczą",
      storage: "Miejsce w przestrzeni roboczej",
      usedOfLimit: "{used} z {limit}",
      usedNoLimit: "{used} – bez limitu",
    },
    loading: {
      plan: "Plan",
      usage: "Wykorzystanie",
    },
    counts: {
      members:
        "one:{n} członek|few:{n} członków|many:{n} członków|other:{n} członka",
      paidSeats:
        "one:{n} płatne stanowisko|few:{n} płatne stanowiska|many:{n} płatnych stanowisk|other:{n} płatnego stanowiska",
      freeViewers:
        "one:{n} bezpłatny widz|few:{n} bezpłatnych widzów|many:{n} bezpłatnych widzów|other:{n} bezpłatnego widza",
    },
    plan: {
      free: "Darmowy",
      paid: "Płatny",
      billedMonthly: "Rozliczenie miesięczne",
      billedYearly: "Rozliczenie roczne",
      freeSummary:
        "{members} · do {recordings} nagrań na osobę, do {minutes} minut każde, w trybie oszczędzania danych",
    },
    status: {
      onTrial: "Okres próbny",
      active: "Aktywny",
      paused: "Wstrzymany",
      pastDue: "Płatność nieudana",
      unpaid: "Nieopłacony",
      cancelled: "Anulowany",
      expired: "Wygasł",
    },
    details: {
      youPay: "Płacisz",
      amountPerMonth: "{amount} miesięcznie",
      amountPerYear: "{amount} rocznie",
      seatsMonthly:
        "one:{n} stanowisko × {price} miesięcznie|few:{n} stanowiska × {price} miesięcznie|many:{n} stanowisk × {price} miesięcznie|other:{n} stanowiska × {price} miesięcznie",
      seatsYearly:
        "one:{n} stanowisko × {price} miesięcznie, {total} miesięcznie przy rozliczeniu rocznym|few:{n} stanowiska × {price} miesięcznie, {total} miesięcznie przy rozliczeniu rocznym|many:{n} stanowisk × {price} miesięcznie, {total} miesięcznie przy rozliczeniu rocznym|other:{n} stanowiska × {price} miesięcznie, {total} miesięcznie przy rozliczeniu rocznym",
      nextPayment: "Następna płatność",
      ends: "Koniec",
      endOfPeriod: "Z końcem tego okresu",
      amountOnDate: "{amount} dnia {date}",
      firstPaymentPending: "Po zaksięgowaniu pierwszej płatności",
      estimate: "{base} · {change}, szacunkowo",
      baseForSeats:
        "one:{amount} za {n} stanowisko|few:{amount} za {n} stanowiska|many:{amount} za {n} stanowisk|other:{amount} za {n} stanowiska",
      seatsAdded:
        "one:{amount} za {n} stanowisko dodane w tym okresie|few:{amount} za {n} stanowiska dodane w tym okresie|many:{amount} za {n} stanowisk dodanych w tym okresie|other:{amount} za {n} stanowiska dodanego w tym okresie",
      seatsRemoved:
        "one:{amount} korekty za {n} stanowisko usunięte w tym okresie|few:{amount} korekty za {n} stanowiska usunięte w tym okresie|many:{amount} korekty za {n} stanowisk usuniętych w tym okresie|other:{amount} korekty za {n} stanowiska usuniętego w tym okresie",
      seatChanges: "{amount} za zmiany stanowisk w tym okresie",
      seats: "Stanowiska",
      seatsAndViewers: "{seats}, {viewers}",
      billedTo: "Płatnik",
      paymentMethod: "Metoda płatności",
      cardEnding: "{brand} z końcówką {last4}",
      card: "Karta",
      updateCard: "Zmień",
    },
    switchPlan: {
      switchTo: "Przejdź na {plan}",
      title: "Przejść na {plan}?",
      priceMonthly:
        "one:Opłata za twoje {n} stanowisko zmieni się z {before} na {after} miesięcznie.|few:Opłata za twoje {n} stanowiska zmieni się z {before} na {after} miesięcznie.|many:Opłata za twoich {n} stanowisk zmieni się z {before} na {after} miesięcznie.|other:Opłata za twoje {n} stanowiska zmieni się z {before} na {after} miesięcznie.",
      priceYearly:
        "one:Opłata za twoje {n} stanowisko zmieni się z {before} na {after} miesięcznie, przy rozliczeniu rocznym.|few:Opłata za twoje {n} stanowiska zmieni się z {before} na {after} miesięcznie, przy rozliczeniu rocznym.|many:Opłata za twoich {n} stanowisk zmieni się z {before} na {after} miesięcznie, przy rozliczeniu rocznym.|other:Opłata za twoje {n} stanowiska zmieni się z {before} na {after} miesięcznie, przy rozliczeniu rocznym.",
      benefits:
        "{plan} nagrywa w każdej jakości do 60 kl./s i dodaje edycję AI.",
      timing:
        "Zmiana działa od razu. Różnica za resztę tego okresu rozliczeniowego zostanie doliczona do następnej faktury.",
      errors: {
        failed: "Nie udało się zmienić planu",
        unknownPlan: "Nieznany plan",
        billingUnavailable: "Płatności są niedostępne",
        noSubscription: "Ta przestrzeń robocza nie ma aktywnej subskrypcji",
        cancelled: "Wznów subskrypcję, zanim zmienisz jej plan",
        unavailable: "Zmiana planu nie jest teraz dostępna",
        rejected: "System płatności nie przyjął zmiany. Spróbuj ponownie.",
      },
    },
    upgrade: {
      title: "Ulepsz przestrzeń {name}",
      billingCycle: "Cykl rozliczeniowy",
      cycles: {
        monthly: "Miesięcznie",
        annual: "Rocznie",
      },
      annualSaving: "oszczędź {percent}%",
      seatPicker: {
        title: "Kto dostaje płatne stanowisko",
        selected: "{seats} z {total}",
        description:
          "Zaznaczone osoby nagrywają i to za nie płacisz. Pozostali to bezpłatni widzowie, którzy mogą oglądać, komentować i reagować, ale nie mogą nagrywać. Role zmienią się po ulepszeniu planu.",
        selectAll: "Zaznacz wszystkich",
        clear: "Wyczyść",
        you: "(ty)",
        paidSeat: "Płatne stanowisko",
        viewer: "Widz",
      },
      perMonth: "miesięcznie",
      seatsPrice:
        "one:{n} stanowisko × {price}|few:{n} stanowiska × {price}|many:{n} stanowisk × {price}|other:{n} stanowiska × {price}",
      viewersFree:
        "one:{n} widz bezpłatnie|few:{n} widzów bezpłatnie|many:{n} widzów bezpłatnie|other:{n} widza bezpłatnie",
      priceWithViewers: "{seats}, {viewers}",
      priceYearly: "{seats}, rozliczane rocznie",
      priceWithViewersYearly: "{seats}, {viewers}, rozliczane rocznie",
      upgradeTo: "Ulepsz do {plan}",
      checkoutUnavailable: "Płatności nie są skonfigurowane",
    },
    requestSeat: {
      request: "Poproś o nagrywanie",
      requested: "Poproszono o stanowisko",
      hint: "Jesteś tu widzem. Poproś właściciela o płatne stanowisko, aby móc nagrywać.",
      requestedHint:
        "Prośba trafiła do właściciela. Nagrywać możesz, gdy tylko ją zatwierdzi.",
      failed: "Nie udało się wysłać prośby",
    },
  },
  actions: {
    missingSlug: "Brak sluga",
    recordingNotFound: "Nie znaleziono nagrania",
    invalidVisibility: "Nieprawidłowa widoczność",
    deleteVideoFailed: "Nie udało się usunąć pliku wideo: {reason}",
    transcriptNotFound: "Nie znaleziono transkrypcji",
    transcriptEmpty:
      "Transkrypcja nie może być pusta. Zamiast tego ją zresetuj.",
    missingTokenId: "Brak identyfikatora tokena",
    tokenNotFound: "Nie znaleziono tokena",
    missingScreenshotId: "Brak identyfikatora zrzutu ekranu",
    screenshotNotFound: "Nie znaleziono zrzutu ekranu",
    missingImageBytes: "Brak danych obrazu",
    screenshotTooLarge:
      "Edytowany zrzut ekranu przekracza limit rozmiaru jednego zrzutu.",
    saveScreenshotFailed: "Nie udało się zapisać zrzutu ekranu: {reason}",
    saveFailed: "Zapis nie powiódł się: {reason}",
    invalidCanvasDimensions:
      "Zapis nie powiódł się: nieprawidłowe wymiary płótna",
  },
  viewer: {
    meta: {
      defaultTitle: "Nagranie {product}",
      defaultDescription: "Nagranie ekranu udostępnione z {product}.",
      preparingTitle: "Przygotowywanie nagrania… – {product}",
      notFoundTitle: "Nie znaleziono",
      description:
        "Nagranie ekranu udostępnione z {product}. Obejrzyj je w przeglądarce, bez rejestracji.",
      descriptionTimed:
        "Nagranie ekranu ({duration}) udostępnione z {product}. Obejrzyj je w przeglądarce, bez rejestracji.",
    },
    loading: "Ładowanie nagrania…",
    nav: {
      download: "Pobierz",
    },
    authPrompt: {
      pricing: "Cennik",
      logIn: "Zaloguj się",
      getStarted: "Zacznij",
      getFree: "Wypróbuj {product} za darmo",
    },
    postedBy: {
      label: "Autor",
      someone: "Ktoś",
    },
    views: {
      count:
        "one:{count} wyświetlenie|few:{count} wyświetlenia|many:{count} wyświetleń|other:{count} wyświetlenia",
      showWhoWatched: "{views}, pokaż, kto oglądał",
      viewers: "Widzowie",
      emptyTitle: "Nie ma jeszcze wyświetleń",
      emptyDescription:
        "Udostępnij link, a osoby, które obejrzą nagranie, pojawią się tutaj.",
      signedInViewer: "Zalogowany widz",
      anonymous: "Anonim",
    },
    actions: {
      share: "Udostępnij",
      visibilityFailed: "Nie udało się zmienić widoczności",
      deleteFailed: "Nie udało się usunąć nagrania",
    },
    requestAccess: {
      title: "Poproś o dostęp, aby obejrzeć to wideo",
      notSharedBy: "{name} nie udostępnia ci jeszcze tego nagrania.",
      notSharedByOwner: "Właściciel nie udostępnia ci jeszcze tego nagrania.",
      signInHint:
        "Zaloguj się służbowym adresem e-mail – jeśli należysz już do zespołu właściciela, od razu uzyskasz dostęp.",
      signIn: "Zaloguj się, aby kontynuować",
      sentTitle: "Wysłano prośbę",
      sentDescription:
        "Powiadomiliśmy właściciela. Dostaniesz e-mail, jeśli przyzna ci dostęp.",
      askingAs: "Prosisz jako {email}",
      noteLabel: "Dodaj notatkę {optional}",
      noteOptional: "(opcjonalnie)",
      notePlaceholder:
        "Cześć, chcę obejrzeć to nagranie z wczorajszego przeglądu.",
      sending: "Wysyłanie…",
      submit: "Poproś o dostęp",
      failed: "Coś poszło nie tak. Spróbuj ponownie za chwilę.",
    },
    pending: {
      preparingTitle: "Przygotowywanie twojego nagrania…",
      preparingDescription:
        "Przesyłanie jeszcze się kończy. Ta strona odświeży się sama, gdy nagranie będzie gotowe.",
      generatingTitle: "Generowanie filmu…",
      generatingDescription:
        "Może to potrwać minutę lub dwie. Strona odświeży się sama, gdy film będzie gotowy.",
      failedTitle: "Przesyłanie tego nagrania nie zostało dokończone",
      failedDescription:
        "Link został utworzony, ale wideo nigdy nie dotarło. Spróbuj otworzyć link ponownie za minutę albo nagraj nowe.",
      comment: "Skomentuj",
    },
    upgradeBanner: {
      message:
        "{usage} w planie Darmowym. Ulepsz plan, aby nagrywać bez limitu w pełnej jakości.",
      usage:
        "one:Wykorzystano {used} z {n} nagrania|few:Wykorzystano {used} z {n} nagrań|many:Wykorzystano {used} z {n} nagrań|other:Wykorzystano {used} z {n} nagrania",
    },
    editPanel: {
      editTitle: "Edytuj wideo",
      editDescription:
        "Przytnij, wytnij, zmień wygląd i popraw transkrypcję w edytorze.",
      downloadTitle: "Pobierz wideo",
      downloadDescription: "Całe nagranie jako MP4.",
      copyEmbed: "Kopiuj kod osadzania",
      embedCopied: "Skopiowano kod osadzania",
      embedDescription: "Wklej odtwarzacz na dowolną stronę internetową.",
    },
    notFound: {
      title: "Nie znaleziono nagrania",
      description:
        "Ten link wygasł albo nigdy nie istniał. Nagrania na darmowych kontach są przechowywane przez 30 dni od ostatniego wyświetlenia.",
      madeWith: "Utworzono w {product}",
    },
  },
  activity: {
    sidebar: {
      label: "Panel boczny nagrania",
      activityTab: "Aktywność",
      transcriptTab: "Transkrypcja",
      toolsTab: "Narzędzia",
    },
    you: "Ty",
    anonymous: "Anonim",
    jumpToMoment: "Przejdź do tego momentu",
    empty: {
      title: "Nie ma jeszcze aktywności",
      description: "Reakcje i komentarze widzów pojawią się tutaj na bieżąco.",
      firstTitle: "Dodaj pierwszy komentarz",
      firstTitleNamed: "Dodaj pierwszy komentarz, {name}",
      hint: "Naciśnij {key}, aby odpowiedzieć, albo zostaw komentarz na dole tego panelu.",
      focusComposer: "Przejdź do pola komentarza",
    },
    composer: {
      signIn: "Zaloguj się, aby reagować i komentować",
      placeholder: "Zostaw komentarz…",
      mention: "Wspomnij o kimś",
      noOneToMention: "Nikt jeszcze nie zareagował ani nie skomentował",
      insertEmoji: "Wstaw emoji",
      searchEmoji: "Szukaj emoji",
      posting: "Publikowanie…",
      submitAt: "Skomentuj w {time}",
      postFailed: "Nie udało się opublikować komentarza",
    },
    comment: {
      delete: "Usuń komentarz",
      deleteFailed: "Nie udało się usunąć komentarza",
    },
    reaction: {
      count:
        "one:{n} reakcja|few:{n} reakcje|many:{n} reakcji|other:{n} reakcji",
      delete: "Usuń reakcję",
      deleteMany:
        "one:Usuń {n} reakcję|few:Usuń {n} reakcje|many:Usuń {n} reakcji|other:Usuń {n} reakcji",
      deleteFailed: "Nie udało się usunąć reakcji",
    },
    transcript: {
      pendingTitle: "Transkrybowanie…",
      pendingDescription:
        "Transkrypcja pojawi się tutaj, gdy tylko będzie gotowa.",
      failedTitle: "Transkrypcja nie została dokończona",
      failedDescription:
        "Coś poszło nie tak podczas transkrybowania tego nagrania.",
      noneTitle: "Brak transkrypcji",
      noneOwnerDescription:
        "Nagrywaj z włączonym mikrofonem, a transkrypcja powstanie automatycznie.",
      noneViewerDescription: "To nagranie powstało bez mikrofonu.",
      searchLabel: "Szukaj w transkrypcji",
      noMatches: "Brak wyników.",
    },
    saveFailed: "Nie udało się zapisać. Spróbuj ponownie.",
    summary: {
      title: "Podsumowanie",
      add: "Dodaj",
      placeholder: "Co się dzieje w tym nagraniu?",
      empty: "Nie ma jeszcze podsumowania.",
      emptyAction: "Dodaj podsumowanie",
    },
    chapters: {
      title: "Rozdziały",
      count:
        "one:{n} rozdział|few:{n} rozdziały|many:{n} rozdziałów|other:{n} rozdziału",
      addAtPlayhead: "Dodaj przy wskaźniku",
      defaultTitle: "Rozdział {n}",
      editHint: "Jeden rozdział w wierszu, w formacie {short} lub {long}.",
      editHintShort: "M:SS Tytuł",
      editHintLong: "H:MM:SS Tytuł",
      editPlaceholder: "0:00 Wstęp\n0:30 Demo\n1:20 Podsumowanie",
      playing: "Odtwarzanie",
      remove: "Usuń rozdział",
      empty: "Nie ma jeszcze rozdziałów.",
      emptyAction: "Dodaj rozdział przy wskaźniku odtwarzania",
    },
  },
  player: {
    overlay: {
      watchAgain: "Obejrzyj ponownie",
    },
    captions: {
      track: "Napisy",
      size: "Rozmiar",
      position: "Położenie",
      sizes: {
        small: "Małe",
        medium: "Średnie",
        large: "Duże",
      },
      positions: {
        top: "U góry",
        bottom: "Na dole",
      },
    },
    reactionBar: {
      comment: "Skomentuj",
      leaveComment: "Zostaw komentarz",
    },
    reactions: {
      heart: "Serce",
      thumbsUp: "Kciuk w górę",
      fire: "Ogień",
      clap: "Brawa",
      raisedHands: "Uniesione ręce",
      eyes: "Oczy",
    },
    embed: {
      title: "Nagranie {product}",
    },
    controls: {
      buttons: {
        play: "Odtwórz",
        pause: "Wstrzymaj",
        replay: "Odtwórz ponownie",
        mute: "Wycisz",
        unmute: "Wyłącz wyciszenie",
      },
      seek: {
        forward: "Przewiń do przodu o {seconds} sekund",
        backward: "Przewiń do tyłu o {seconds} sekund",
      },
      fullscreen: {
        enter: "Włącz pełny ekran",
        exit: "Zamknij pełny ekran",
      },
      captions: {
        enable: "Włącz napisy",
        disable: "Wyłącz napisy",
      },
      pip: {
        enter: "Włącz obraz w obrazie",
        exit: "Wyłącz obraz w obrazie",
      },
      cast: {
        start: "Rozpocznij przesyłanie",
        stop: "Zatrzymaj przesyłanie",
        connecting: "Łączenie",
      },
      airplay: {
        start: "Włącz AirPlay",
        stop: "Wyłącz AirPlay",
      },
      slider: {
        seek: "Przewijanie",
      },
      time: {
        current: "Bieżący czas",
        duration: "Czas trwania",
        position: "{current} z {duration}",
        unknown: "Multimedia nie są wczytane, czas nieznany.",
      },
      playback: {
        rate: "Szybkość odtwarzania {rate}",
      },
      volume: {
        mutedValue: "{percent}, wyciszono",
        muted: "Wyciszono",
        label: "Głośność",
        value: "Głośność {value}",
      },
      status: {
        captionsOn: "Napisy włączone",
        captionsOff: "Napisy wyłączone",
        paused: "Wstrzymano",
        playing: "Odtwarzanie",
        fullscreen: "Pełny ekran",
        pip: "Obraz w obrazie",
        exitPip: "Wyłącz obraz w obrazie",
        seekedTo: "Przewinięto do {time}",
      },
      container: {
        label: "Odtwarzacz multimediów",
      },
      errors: {
        aborted: "Odtwarzanie multimediów zatrzymano, zanim się skończyło.",
        network:
          "Nie udało się wczytać tych multimediów z powodu problemu z siecią lub serwerem.",
        decode:
          "Nie udało się odtworzyć tych multimediów. Mogą być uszkodzone albo twoja przeglądarka nie obsługuje ich formatu.",
        source:
          "Nie udało się wczytać tych multimediów. Mogą być niedostępne albo twoja przeglądarka nie obsługuje ich formatu.",
        encrypted:
          "Nie udało się odtworzyć tych multimediów, ponieważ nie można było ich odszyfrować.",
        unplayable: "Odtwarzacz nie obsługuje tych multimediów.",
        title: "Coś poszło nie tak.",
        unexpected: "Wystąpił nieoczekiwany błąd.",
      },
      common: {
        ok: "OK",
      },
      menu: {
        settings: "Ustawienia",
        quality: "Jakość",
        audio: "Dźwięk",
        speed: "Szybkość",
        captions: "Napisy",
        playbackRate: "Szybkość odtwarzania",
        off: "Wyłączone",
        auto: "Automatycznie",
        autoWithLabel: "Automatycznie ({label})",
      },
    },
  },
  screenshotView: {
    page: {
      defaultTitle: "Zrzut ekranu {product}",
      description: "Zrzut ekranu udostępniony z {product}.",
      madeWith: "Utworzono w {product}",
      loading: "Ładowanie zrzutu ekranu…",
    },
    authPrompt: {
      pricing: "Cennik",
      logIn: "Zaloguj się",
      getStarted: "Zacznij",
      getFree: "Wypróbuj {product} za darmo",
    },
    actions: {
      edit: "Edytuj zrzut ekranu",
      share: "Udostępnij",
      shareTitle: "Udostępnij zrzut ekranu",
      copyLink: "Kopiuj link",
      linkCopied: "Skopiowano link",
      more: "Więcej działań",
      delete: "Usuń zrzut ekranu",
      deleteTitle: "Usunąć ten zrzut ekranu?",
      deleteDescription:
        "Obraz i jego link natychmiast przestaną działać. Tej operacji nie można cofnąć.",
      visibilityFailed: "Nie udało się zmienić widoczności",
      deleteFailed: "Nie udało się usunąć zrzutu ekranu",
    },
    zoom: {
      expand: "Powiększ obraz",
      minimize: "Pomniejsz obraz",
    },
    requestAccess: {
      title: "Poproś o dostęp, aby zobaczyć ten zrzut ekranu",
      notSharedBy: "{name} nie udostępnia ci jeszcze tego zrzutu ekranu.",
      notSharedByOwner:
        "Właściciel nie udostępnia ci jeszcze tego zrzutu ekranu.",
      signInHint:
        "Zaloguj się służbowym adresem e-mail – jeśli należysz już do zespołu właściciela, od razu uzyskasz dostęp.",
      signIn: "Zaloguj się, aby kontynuować",
      sentTitle: "Wysłano prośbę",
      sentDescription:
        "Powiadomiliśmy właściciela. Dostaniesz e-mail, jeśli przyzna ci dostęp.",
      askingAs: "Prosisz jako {email}",
      noteLabel: "Dodaj notatkę {optional}",
      noteOptional: "(opcjonalnie)",
      notePlaceholder:
        "Cześć, potrzebuję kopii tego zrzutu ekranu z przeglądu projektu.",
      sending: "Wysyłanie…",
      submit: "Poproś o dostęp",
      failed: "Coś poszło nie tak. Spróbuj ponownie za chwilę.",
    },
    notFound: {
      title: "Nie znaleziono zrzutu ekranu",
      description:
        "Ten link wygasł albo nigdy nie istniał. Zrzuty ekranu na darmowych kontach są przechowywane przez 30 dni od ostatniego wyświetlenia.",
    },
  },
  recordingEditor: {
    skeleton: {
      label: "Otwieranie edytora",
      status: "Otwieranie edytora…",
    },
    preparing: {
      title: "Przygotowywanie nagrania…",
      description:
        "Nagranie wciąż się przesyła. Ta strona odświeży się automatycznie, gdy będzie gotowe.",
    },
    failed: {
      title: "Przesyłanie nagrania nie powiodło się.",
      description: "Spróbuj nagrać ponownie w aplikacji na komputer.",
    },
    saveFailed: "Nie udało się zapisać",
    topBar: {
      back: "Wróć do nagrania",
      status: {
        idle: "Zmiany zapisują się automatycznie",
        saved: "Zapisano",
        error: "Nie udało się zapisać",
      },
      versionHistory: "Historia wersji (wkrótce)",
      undo: "Cofnij",
      undoShortcut: "Cofnij ({key})",
      redo: "Ponów",
      redoShortcut: "Ponów ({key})",
      finish: "Zakończ",
    },
    panels: {
      label: "Panele edytora",
      tabs: {
        transcript: "Transkrypcja",
        design: "Wygląd",
        details: "Szczegóły",
      },
      hide: {
        transcript: "Ukryj transkrypcję",
        design: "Ukryj wygląd",
        details: "Ukryj szczegóły",
      },
      show: {
        transcript: "Pokaż transkrypcję",
        design: "Pokaż wygląd",
        details: "Pokaż szczegóły",
      },
    },
    toggleOn: "Włączone",
    background: {
      title: "Tło",
      gradients: "Gradienty",
      none: "Brak",
      noBackground: "Bez tła",
      solid: "Jednolite",
      solidColor: "Jednolity kolor {color}",
      customColor: "Wybierz własny kolor",
      showLess: "Pokaż mniej",
      seeMore: "Pokaż więcej",
      presets: {
        violet: "Fiolet",
        sunset: "Zachód",
        orchid: "Orchidea",
        forest: "Las",
        flamingo: "Flaming",
        citrus: "Cytrus",
        arctic: "Arktyka",
        ocean: "Ocean",
        deep: "Głębia",
        ember: "Żar",
        mint: "Mięta",
        dusk: "Zmierzch",
        peach: "Brzoskwinia",
        midnight: "Północ",
        slate: "Łupek",
      },
    },
    camera: {
      title: "Kamera",
      show: "Pokaż kamerę",
      hidden: "Ukryta",
      position: "Położenie",
      positionHint: "Przeciągnij kropkę albo dotknij rogu",
      positionHintHidden: "Pokaż kamerę, aby ją ustawić.",
      corners: {
        topLeft: "Lewy górny",
        topRight: "Prawy górny",
        bottomLeft: "Lewy dolny",
        bottomRight: "Prawy dolny",
      },
      size: "Rozmiar",
      sizes: {
        small: "Mały",
        medium: "Średni",
        large: "Duży",
      },
    },
    audio: {
      title: "Dźwięk",
      systemSound: "Dźwięk systemowy",
      sound: "Dźwięk",
      microphone: "Mikrofon",
      muted: "Wyciszony",
      sharedTrack:
        "W tym nagraniu mikrofon i dźwięk systemowy są na jednej ścieżce.",
    },
    details: {
      title: "Nagranie",
      link: "Link",
      size: "Rozmiar",
      duration: "Czas trwania",
      views: "Wyświetlenia",
      created: "Utworzono",
    },
    transcript: {
      transcribing: "Transkrybowanie…",
      unavailable: "Transkrypcja niedostępna",
      pendingHint: "Odśwież tę stronę za minutę, aby ją edytować.",
      failedHint: "Transkrypcja tego nagrania nie została dokończona.",
      missingHint:
        "Nagrywaj z włączonym mikrofonem, a transkrypcja powstanie automatycznie.",
      deleteWord: "Usuń słowo",
      deleteWords:
        "one:Usuń {n} słowo|few:Usuń {n} słowa|many:Usuń {n} słów|other:Usuń {n} słowa",
      clearSelection: "Wyczyść zaznaczenie",
      hint: "Kliknij słowo albo przeciągnij po słowach, aby je zaznaczyć; kliknij dwukrotnie, aby poprawić tekst.",
      resetEdits: "Resetuj zmiany",
      editLine: "Edytuj wiersz transkrypcji",
      selectLine: "Zaznacz wiersz w {time}",
      restore: "Przywróć",
      saveFailed: "Nie udało się zapisać",
      resetFailed: "Nie udało się zresetować",
    },
    timeline: {
      hideWaveform: "Ukryj falę dźwiękową",
      showWaveform: "Pokaż falę dźwiękową",
      loadingAudio: "Ładowanie dźwięku…",
      deleteSelection: "Usuń zaznaczenie",
      deleteSelectionHint:
        "Zaznacz słowa w transkrypcji albo podziel oś czasu i wybierz fragment",
      splitAt: "Podziel w {time}",
      splitHint: "Najpierw odtwórz lub przewiń do wybranego momentu",
      comingSoon: "Wkrótce",
      fit: "Dopasuj",
      zoomOut: "Pomniejsz",
      zoom: "Powiększenie osi czasu",
      zoomIn: "Powiększ",
      seek: "Przewijanie",
      trimStart: "Przytnij początek klipu",
      trimEnd: "Przytnij koniec klipu",
      removeSplit: "Usuń podział w {time}",
    },
  },
  screenshotEditor: {
    loading: "Ładowanie edytora…",
    imageError: {
      decode: "Nie udało się zdekodować obrazu zrzutu ekranu.",
      fetch:
        "Nie udało się wczytać obrazu zrzutu ekranu. Zasobnik mógł utracić dostęp CORS.",
    },
    header: {
      back: "Wróć do zrzutu ekranu",
      reset: "Resetuj zmiany",
      undo: "Cofnij",
      undoTooltip: "Cofnij ({key})",
      redo: "Ponów",
      redoTooltip: "Ponów ({key})",
      finish: "Zakończ",
    },
    saveError: {
      notMounted: "Edytor nie jest zamontowany",
      noCanvas: "Nie udało się uzyskać płótna eksportu",
      workerCrashed: "Worker kodujący PNG uległ awarii",
    },
    tools: {
      text: "Tekst",
      rect: "Prostokąt",
      arrow: "Strzałka",
      background: "Tło",
    },
    background: {
      title: "Dodaj tło",
      close: "Zamknij wybór tła",
      none: "Brak",
      gradients: {
        violet: "Fiolet",
        sunset: "Zachód",
        orchid: "Orchidea",
        forest: "Las",
        flamingo: "Flaming",
        citrus: "Cytrus",
        arctic: "Arktyka",
        ocean: "Ocean",
        deep: "Głębia",
      },
      solid: "Jednolity kolor {color}",
      custom: "Wybierz własny kolor",
    },
    inspector: {
      color: "Kolor {color}",
      size: "{n}px",
      duplicate: "Duplikuj",
    },
    textPrompt: "Tekst",
  },
  canvas: {
    meta: {
      title: "Płótno",
      description: "Pusta tablica, po której rysujesz podczas nagrywania.",
    },
    loading: "Ładowanie płótna…",
    tools: {
      select: "Zaznacz",
      hand: "Rączka",
      pen: "Pisak",
      highlighter: "Zakreślacz",
      rect: "Prostokąt",
      ellipse: "Elipsa",
      arrow: "Strzałka",
      line: "Linia",
      text: "Tekst",
      eraser: "Gumka",
    },
    shortcut: "{label} · {key}",
    colour: "Kolor {colour}",
    stroke: "Grubość {width}",
    hint: "Przewijaj, aby przesuwać · {mod} + przewijanie, aby powiększać · przytrzymaj {space}, aby przeciągać",
    textPlaceholder: "Pisz…",
    history: {
      undo: "Cofnij",
      redo: "Ponów",
      clear: "Wyczyść tablicę",
    },
    zoom: {
      out: "Pomniejsz",
      reset: "Resetuj powiększenie",
      in: "Powiększ",
    },
    extensionPrompt: {
      title: "Nagraj to płótno",
      description:
        "Dodaj rozszerzenie CaptureFlow, aby nagrywać ekran i kamerę podczas rysowania, a potem udostępnić link.",
      dismiss: "Nie teraz",
      install: "Dodaj do Chrome",
    },
  },
};

export default messages;

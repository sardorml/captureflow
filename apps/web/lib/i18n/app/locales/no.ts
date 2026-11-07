import type { AppMessages } from "../messages";

const messages: AppMessages = {
  common: {
    cancel: "Avbryt",
    save: "Lagre",
    saving: "Lagrer…",
    delete: "Slett",
    deleting: "Sletter…",
    remove: "Fjern",
    close: "Lukk",
    back: "Tilbake",
    continue: "Fortsett",
    confirm: "Bekreft",
    done: "Ferdig",
    edit: "Rediger",
    copy: "Kopier",
    copied: "Kopiert",
    search: "Søk",
    loading: "Laster inn…",
    retry: "Prøv igjen",
    learnMore: "Les mer",
    language: "Språk",
    themeToLight: "Bytt til lyst tema",
    themeToDark: "Bytt til mørkt tema",
    somethingWrong: "Noe gikk galt. Prøv igjen.",
    pageFailed: "Denne siden kunne ikke lastes.",
    partFailed: "Denne delen kunne ikke lastes.",
    failedBody: "Noe gikk galt. Prøv igjen, eller last inn siden på nytt.",
    reload: "Last inn siden på nytt",
  },
  auth: {
    signedInAs: "Logget inn som {email}.",
    errors: {
      generic: "Noe gikk galt. Prøv igjen.",
      network: "Nettverksfeil. Prøv igjen.",
    },
    login: {
      metaTitle: "Logg inn",
      signInTitle: "Velkommen tilbake",
      signInDescription: "Logg inn med Google, GitHub eller e-post",
      signUpTitle: "Opprett kontoen din",
      signUpDescription: "Registrer deg med Google, GitHub eller e-post",
      inviteTitle: "Bli med i {workspace}",
      inviteDescription:
        "{inviter} har invitert deg. Logg inn eller opprett en konto med {email} for å godta.",
      continueWith: "Fortsett med {provider}",
      or: "Eller",
      emailLabel: "E-post",
      emailPlaceholder: "you@example.com",
      emailInvalid: "Skriv inn en gyldig e-postadresse.",
      continueWithEmail: "Fortsett med e-post",
      askForInvite:
        "Trenger du en konto? Be en administrator om en invitasjon.",
      haveAccount: "Har du allerede en konto? {action}",
      haveAccountAction: "Logg inn",
      noAccount: "Har du ikke en konto? {action}",
      noAccountAction: "Registrer deg",
      changeEmail: "Endre",
      nameLabel: "Navn",
      namePlaceholder: "Navnet ditt",
      passwordLabel: "Passord",
      newPasswordPlaceholder: "Minst 12 tegn",
      passwordTooShort: "Bruk minst 12 tegn.",
      passwordMissing: "Skriv inn passordet ditt.",
      signInSubmit: "Logg inn",
      signUpSubmit: "Opprett konto",
      terms: "Ved å fortsette godtar du {terms} og {privacy} våre.",
      termsLink: "vilkårene",
      privacyLink: "personvernerklæringen",
    },
    verify: {
      title: "Sjekk e-posten din",
      description:
        "Vi har sendt en lenke til {email}. Åpne den for å fullføre oppsettet av kontoen.",
      resend: "Send e-posten på nytt",
      resent: "Sendt på nytt",
      resendFailed: "Kunne ikke sende e-posten. Prøv igjen.",
      wrongAddress: "Feil adresse? {action}",
      wrongAddressAction: "Bruk en annen e-postadresse",
    },
    oauthErrors: {
      unfinished: "Innloggingen ble ikke fullført. Prøv igjen.",
      inviteOnly:
        "Denne CaptureFlow-instansen er bare for inviterte. Be en administrator om en invitasjon.",
      allowedDomains:
        "Registrer deg med en adresse på {domains}, eller be en administrator om en invitasjon.",
      providerDomains:
        "Registrer deg med en Google- eller GitHub-konto på {domains}.",
      domainChoice: "{first} eller {second}",
    },
    inviteFallbacks: {
      workspace: "et CaptureFlow-arbeidsområde",
      inviter: "En kollega",
    },
    setPassword: {
      title: "Velg passordet ditt",
      description: "Velg et passord for {email}. Du blir logget inn etterpå.",
      passwordLabel: "Nytt passord",
      passwordPlaceholder: "Minst 12 tegn",
      submit: "Lagre passordet",
      expiredTitle: "Denne lenken fungerer ikke lenger",
      expiredDescription:
        "Den er allerede brukt eller har utløpt. Be en administrator om en ny.",
      goToSignIn: "Gå til innlogging",
    },
    invite: {
      title: "Du er invitert",
      asViewer:
        "Du er invitert til å bli med i {workspace} på CaptureFlow som seer: du kan se og kommentere alt som deles der.",
      asMember:
        "Du er invitert til å bli med i {workspace} på CaptureFlow som medlem: du kan ta opp i arbeidsområdet og dele med teamet.",
      accept: "Godta invitasjonen",
      databaseUnavailable: "Databasen er utilgjengelig",
      invalidTitle: "Invitasjonen er ikke lenger gyldig",
      invalidBody:
        "Denne lenken har utløpt eller er allerede brukt. Be eieren av arbeidsområdet om å sende en ny invitasjon.",
      wrongAccountTitle: "Feil konto",
      wrongAccountBody:
        "Denne invitasjonen ble sendt til {invited}, men du er logget inn som {current}. Logg ut og logg inn med den inviterte adressen for å godta.",
      goToDashboard: "Gå til oversikten",
      signOut: "Logg ut",
    },
    handoff: {
      signingIn: "Logger deg inn…",
      returning: "Går tilbake til CaptureFlow…",
      open: "Åpne CaptureFlow",
      hint: "Hvis ingenting skjer, klikker du på knappen over. Du kan lukke denne fanen når skrivebordsappen åpnes igjen.",
      extensionDone: "Logget inn som {email}. Du kan lukke denne fanen.",
      extensionUnreachable:
        "Fikk ikke kontakt med CaptureFlow-utvidelsen. Sjekk at den er installert, og klikk på ikonet for å prøve igjen.",
      extensionUnverified:
        "Kunne ikke verifisere utvidelsen. Installer den på nytt, og prøv igjen.",
    },
  },
  shell: {
    record: {
      newRecording: "Nytt opptak",
    },
    nav: {
      toggleSidebar: "Vis eller skjul sidepanelet",
      dashboard: "Oversikt",
      recordings: "Opptak",
      screenshots: "Skjermbilder",
      canvas: "Lerret",
      workspaceGroup: "Arbeidsområde",
      members: "Medlemmer",
      settings: "Innstillinger",
      personal: "Personlig",
      workspace: "Arbeidsområde",
      billing: "Fakturering",
      admin: "Administrasjon",
    },
    upgradeCard: {
      title: "Oppgrader arbeidsområdet",
      description:
        "Gratis gir {recordings} opptak per person i datasparende kvalitet. Betalte abonnementer fjerner grensene, fra {price} per medlem.",
      viewPlans: "Se abonnementer",
    },
    topBar: {
      upgrade: "Oppgrader",
    },
    workspaceSwitcher: {
      switchWorkspace: "Bytt arbeidsområde",
      summary: "one:Standard · {n} medlem|other:Standard · {n} medlemmer",
      workspaces: "Arbeidsområder",
      owned: "Du eier dette",
      joined: "Du ble med",
      newWorkspace: "Nytt arbeidsområde",
      inviteMembers: "Inviter medlemmer",
    },
    drawer: {
      open: "Åpne arbeidsområdemenyen",
      title: "Arbeidsområdemeny",
    },
    search: {
      prompt: "Søk i opptakene og skjermbildene dine",
      clear: "Tøm søket",
      results: "Søkeresultater",
      hint: "Søk i opptakene og skjermbildene dine etter tittel.",
      noMatches: "Ingen treff",
      kind: {
        recording: "opptak",
        screenshot: "skjermbilde",
      },
    },
    account: {
      menu: "Kontomeny",
      nav: {
        billing: "Fakturering",
        devices: "Tilkoblede enheter",
        settings: "Innstillinger",
        support: "Kontakt kundestøtte",
      },
      freePlan: "Gratis",
      signOut: "Logg ut",
      signingOut: "Logger ut…",
    },
    theme: {
      label: "Tema",
      light: "Lyst",
      dark: "Mørkt",
      system: "System",
    },
    notifications: {
      title: "Varsler",
      subtitle: "Invitasjoner og endringer i arbeidsområdene dine.",
      bellUnread: "one:Varsler, {n} ulest|other:Varsler, {n} uleste",
      viewAll: "Vis alle",
      menuEmpty:
        "Du er à jour. Invitasjoner, nye kolleger og rolleendringer vises her.",
      pageEmpty:
        "Du er à jour. Når noen inviterer deg, blir med i arbeidsområdet ditt eller endrer rollen din, ser du det her.",
      accept: "Godta",
      decline: "Avslå",
      unread: "Ulest",
      someone: "Noen",
      message: {
        invited: {
          member:
            "{actor} inviterte deg til å bli med i {workspace} som medlem",
          viewer: "{actor} inviterte deg til å bli med i {workspace} som seer",
        },
        joined: {
          member: "{actor} ble med i {workspace} som medlem",
          viewer: "{actor} ble med i {workspace} som seer",
        },
        seatRequested: "{actor} ba om en betalt lisens i {workspace}",
        seatDenied: "{actor} avslo forespørselen din om lisens i {workspace}",
        roleChanged: {
          member: "{actor} gjorde deg til medlem i {workspace}",
          viewer: "{actor} gjorde deg til seer i {workspace}",
        },
        downgraded: "{actor} endret rollen din til seer i {workspace}",
        keepRecordingUntil: "Du kan fortsette å ta opp frem til {date}.",
        removed: "{actor} fjernet deg fra {workspace}",
      },
      acceptErrors: {
        failed: "Kunne ikke godta invitasjonen",
        signedOut: "Logg inn for å godta",
        invalid: "Denne invitasjonen har utløpt eller er trukket tilbake",
        emailMismatch: "Denne invitasjonen gjelder en annen e-postadresse",
        alreadyMember: "Du er allerede med i dette arbeidsområdet",
      },
    },
    mobileNav: {
      open: "Åpne menyen",
      close: "Lukk menyen",
      docs: "Dokumentasjon",
      star: "Gi stjerne på GitHub",
      signIn: "Logg inn",
      getStarted: "Kom i gang",
    },
    skeletons: {
      avatar: "Profilbilde",
      workspaceName: "Navn på arbeidsområdet",
      workspaceLogo: "Logo for arbeidsområdet",
    },
  },
  library: {
    dashboard: {
      welcome: "Velkommen tilbake",
      welcomeName: "Velkommen tilbake, {name}",
      openCanvas: "Åpne lerretet",
      newRecording: "Nytt opptak",
      stats: {
        recordings: "Opptak",
        plusScreenshots:
          "one:Pluss {count} skjermbilde|other:Pluss {count} skjermbilder",
        noScreenshots: "Ingen skjermbilder ennå",
        views: "Visninger",
        viewsAverage: "{count} per opptak i snitt",
        noViews: "Ingen visninger ennå",
        recorded: "Tatt opp",
        recordedAverage: "{duration} per opptak i snitt",
        nothingRecorded: "Ingenting tatt opp ennå",
        recordingsLeft: "Opptak igjen",
        leftOfAllowance: "{left} av {allowance}",
        freePlanLimit: "Gratisabonnement, opptil {minutes} min per opptak",
      },
      recordedTime: {
        minutes: "{minutes} min",
        hours: "{hours} t",
        hoursMinutes: "{hours} t {minutes} min",
      },
      recent: {
        title: "Siste opptak",
        all: "Alle opptak",
        empty: "Ingenting er delt i dette arbeidsområdet ennå.",
        views: "one:{n} visning|other:{n} visninger",
        comments: "one:{n} kommentar|other:{n} kommentarer",
        reactions: "one:{n} reaksjon|other:{n} reaksjoner",
      },
      start: {
        title: "Start opptak med {product}",
        surfacesLabel: "Hvor du vil ta opp",
        surfaces: {
          extension: "Utvidelse",
          desktop: "Skrivebordsapp",
          canvas: "Lerret",
        },
        extension: {
          description:
            "Ta opp en fane, et vindu eller hele skjermen fra verktøylinjen, og få en lenke du kan dele med hvem som helst.",
          record: "Ta opp nå",
          addToChrome: "Legg til i Chrome",
        },
        desktop: {
          description:
            "En egen Mac-app som tar opp skjermen og kameraet med systemlyd, er på vei. Inntil da tar utvidelsen opp en fane, et vindu eller hele skjermen.",
          download: "Last ned for Mac",
          comingSoon: "Kommer snart",
        },
        canvas: {
          description:
            "En tom tavle med penner, former og tekst du kan tegne på mens du tar opp, når du ikke har noen side å vise.",
        },
      },
    },
    recording: {
      pageTitle: "Opptak",
      count: "one:{n} opptak|other:{n} opptak",
      untitled: "Opptak uten tittel",
      aiGenerated: "AI-generert",
      processing: "Behandles",
      noMatches: "Ingen opptak samsvarer med disse filtrene.",
      empty:
        "Du har ikke laget noen opptakslenker ennå. Ta opp i CaptureFlow-skrivebordsappen, så vises opptakene dine her.",
      selectAll: "Velg alle opptak",
      selected: "one:{n} opptak valgt|other:{n} opptak valgt",
      open: "Åpne opptaket",
      edit: "Rediger opptaket",
      share: "Del opptaket",
      delete: "Slett opptaket",
      deleteTitle: "Vil du slette dette opptaket?",
      deleteDescription:
        "Videoen og lenken slutter å fungere umiddelbart. Dette kan ikke angres.",
      deleteSelectedTitle:
        "one:Vil du slette {n} opptak?|other:Vil du slette {n} opptak?",
    },
    screenshot: {
      pageTitle: "Skjermbilder",
      count: "one:{n} skjermbilde|other:{n} skjermbilder",
      untitled: "Skjermbilde uten tittel",
      numbered: "Skjermbilde {id}",
      noMatches: "Ingen skjermbilder samsvarer med disse filtrene.",
      empty:
        "Ingen skjermbilder ennå. Åpne CaptureFlow → fanen Screenshot → velg Display, Window eller Area for å ta bildet. Skjermbildet vises her automatisk.",
      selectAll: "Velg alle skjermbilder",
      selected: "one:{n} skjermbilde valgt|other:{n} skjermbilder valgt",
      open: "Åpne skjermbildet",
      edit: "Rediger skjermbildet",
      share: "Del skjermbildet",
      delete: "Slett skjermbildet",
      deleteTitle: "Vil du slette dette skjermbildet?",
      deleteDescription:
        "Bildet og lenken slutter å fungere umiddelbart. Dette kan ikke angres.",
      deleteSelectedTitle:
        "one:Vil du slette {n} skjermbilde?|other:Vil du slette {n} skjermbilder?",
    },
    filters: {
      access: "Tilgang",
      sort: "Sortering",
      current: "{label}: {value}",
      accessOptions: {
        all: "All tilgang",
        public: "Offentlig",
        workspace: "Arbeidsområde",
        private: "Privat",
      },
      sortOptions: {
        newest: "Nyeste først",
        oldest: "Eldste først",
        views: "Mest sett",
      },
    },
    card: {
      select: "Velg {title}",
      moreActions: "Flere handlinger",
      rename: "Gi nytt navn",
      unknownAuthor: "Ukjent",
    },
    selection: {
      deleteDescription: "Lenkene slutter å fungere umiddelbart.",
      deleteFailed:
        "{failed} av {count} kunne ikke slettes. Resten er slettet.",
      clear: "Fjern valg",
    },
    pager: {
      label: "Sider",
      previous: "Forrige side",
      next: "Neste side",
    },
    visibility: {
      label: "Synlighet",
      labels: {
        public: "Offentlig",
        workspace: "Arbeidsområde",
        private: "Privat",
      },
      descriptions: {
        public: "Alle med lenken kan se",
        workspace: "Bare innloggede medlemmer av arbeidsområdet kan se",
        private: "Bare du kan se",
      },
      workspaceNamed: "Arbeidsområde · {name}",
    },
    share: {
      title: "Del",
      embed: "Bygg inn",
      embedPublic: "Spilles av overalt der koden limes inn.",
      embedRestricted: "Spilles bare av for dem som allerede kan åpne lenken.",
      copyCode: "Kopier koden",
      generalAccess: "Generell tilgang",
      generalAccessCurrent: "Generell tilgang: {access}",
      copyLink: "Kopier lenken",
      linkCopied: "Lenken er kopiert",
      shareAt: "Del fra {time}",
      socialHeading: "Del på",
      socialText: "Se «{title}»",
      email: "E-post",
    },
    editableTitle: {
      label: "Tittel på opptaket",
      rename: "Gi opptaket nytt navn",
    },
  },
  members: {
    title: "Medlemmer",
    databaseUnavailable: "Databasen er utilgjengelig.",
    role: "Rolle",
    status: "Status",
    roles: {
      owner: "Administrator",
      member: "Medlem",
      viewer: "Seer",
    },
    roleHints: {
      member: {
        does: "Tar opp i dette arbeidsområdet.",
        costs: "En betalt lisens på Light og Pro.",
      },
      viewer: {
        does: "Ser og kommenterer.",
        costs: "Alltid gratis.",
      },
    },
    statuses: {
      active: "Aktiv",
      invited: "Invitert",
    },
    seatSummary: {
      members: "one:{n} medlem|other:{n} medlemmer",
      viewers: "one:{n} seer|other:{n} seere",
      paidSeats: "one:{n} betalt lisens|other:{n} betalte lisenser",
      membersAndViewers: "{members} og {viewers}",
      onPaidSeats:
        "{people} på {seats}. Hvert medlem er én lisens; seere er gratis.",
      membersFree: "{people}. Medlemmer er gratis på dette abonnementet.",
      freePlan:
        "{people}. Gratisabonnement: hvert medlem får {recordings} opptak på opptil {minutes} minutter; seere ser og kommenterer.",
      planTitle: "{plan}-abonnement",
      paidPlanTitle: "Betalt abonnement",
      freePlanTitle: "Gratisabonnement",
      upgrade: "Oppgrader arbeidsområdet",
    },
    table: {
      intro: "Medlemmer tar opp her; seere ser og kommenterer.",
      ownerIntro: "Som eier kan du invitere, fjerne og endre roller.",
      searchPlaceholder: "Navn eller e-postadresse",
      searchLabel: "Søk etter medlemmer",
      allRoles: "Alle roller",
      everyone: "Alle",
      columns: {
        name: "Navn",
        dateAdded: "Lagt til",
        email: "E-postadresse",
        actions: "Handlinger",
      },
      empty: "Ingen samsvarer med disse filtrene.",
      downgradeNote: "Seer fra {date} · {keep}",
      keepAsMember: "Behold som medlem",
      revoke: "Trekk tilbake",
    },
    seatRequests: {
      title: "Lisensforespørsler",
      description:
        "Disse seerne har bedt om å få ta opp. Når du godkjenner, blir de medlemmer.",
      descriptionPaid:
        "Disse seerne har bedt om å få ta opp. Når du godkjenner, blir de medlemmer, og det legger til en betalt lisens.",
      asked: "{email} · spurte {date}",
      deny: "Avslå",
      approve: "Godkjenn",
    },
    seatConfirm: {
      addTitle: "Vil du gi {name} en betalt lisens?",
      addBody:
        "Medlemmer tar opp, så hvert medlem er en betalt lisens. {plan}-abonnementet ditt går fra {seats} til {nextSeats} lisenser, {before} til {after} per måned.",
      addBodyYearly:
        "Medlemmer tar opp, så hvert medlem er en betalt lisens. {plan}-abonnementet ditt går fra {seats} til {nextSeats} lisenser, {before} til {after} per måned, faktureres årlig.",
      addInvoice:
        "Resten av denne faktureringsperioden legges til på neste faktura.",
      addConfirm: "Legg til betalt lisens",
      removeTitle: "Vil du endre {name} til seer?",
      removeBody:
        "{name} fortsetter å ta opp frem til {date}, slutten av perioden du har betalt for, og blir deretter seer. Seere kan se og kommentere, men ikke ta opp.",
      removePlan:
        "Fra da går {plan}-abonnementet ditt fra {seats} til {nextSeats} lisenser, {before} til {after} per måned.",
      removePlanYearly:
        "Fra da går {plan}-abonnementet ditt fra {seats} til {nextSeats} lisenser, {before} til {after} per måned, faktureres årlig.",
      removeConfirm: "Endre til seer",
    },
    remove: {
      label: "Fjern {name} fra arbeidsområdet",
      title: "Vil du fjerne {name} fra {workspace}?",
      body: "Personen mister tilgangen med en gang. Opptakene og skjermbildene blir liggende i arbeidsområdet.",
      freesSeat:
        "Det frigjør den betalte lisensen: abonnementet ditt går fra {seats} til {nextSeats} lisenser.",
    },
    leave: {
      button: "Forlat",
      title: "Vil du forlate {workspace}?",
      body: "Du mister tilgangen til opptakene og skjermbildene der. Alt du har tatt opp der, blir liggende i arbeidsområdet.",
      comeBack: "For å komme tilbake må noen invitere deg på nytt.",
      confirm: "Forlat arbeidsområdet",
    },
    invite: {
      trigger: "Inviter medlemmer",
      title: "Inviter medlemmer til {workspace}",
      titleOwnWorkspace: "Inviter medlemmer til arbeidsområdet ditt",
      description:
        "De får en e-post med en lenke som utløper om 7 dager. Sørg for at de logger inn med samme adresse.",
      removeEmail: "Fjern {email}",
      addEmails: "Legg til e-postadresser",
      separatorHint: "Skill e-postadressene med mellomrom, komma eller Enter.",
      paidSeatNote:
        "Hvert medlem som godtar, legger til en betalt lisens i {plan}-abonnementet ditt, {price} per måned for hver. Resten av denne perioden kommer på neste faktura.",
      noEmails: "Legg til minst én e-postadresse",
      invalidEmails: "Ugyldig e-postadresse: {emails}",
      failed: "Mislyktes",
      sent: "one:{n} invitasjon sendt.|other:{n} invitasjoner sendt.",
      sending: "Sender…",
      submit: "Send invitasjoner",
    },
    actions: {
      emailRequired: "Skriv inn en e-postadresse",
      emailInvalid: "Det ser ikke ut som en gyldig e-postadresse",
      ownWorkspace: "Du er allerede med i ditt eget arbeidsområde",
      alreadyMember:
        "Denne personen er allerede medlem av dette arbeidsområdet",
      emailNotSent:
        "Invitasjonen ble opprettet, men e-posten kunne ikke leveres. Kopier lenken fra listen over ventende invitasjoner.",
      invitationSent: "Invitasjon sendt til {email}",
      alreadyRecording: "Du kan allerede ta opp her",
    },
  },
  settings: {
    saved: "Lagret",
    errors: {
      ownerOnly: "Bare eieren av arbeidsområdet kan endre dette",
      databaseUnavailable: "Databasen er utilgjengelig",
      saveFailed: "Kunne ikke lagre – prøv igjen",
    },
    upload: {
      uploading: "Laster opp…",
      missing: "Velg en bildefil",
      failed: "Opplastingen mislyktes",
      failedReason: "Opplastingen mislyktes: {reason}",
    },
    personal: {
      title: "Personlige innstillinger",
      account: {
        title: "Konto",
        description:
          "Slik vises du for kolleger og for dem som ser opptakene dine.",
      },
      preferences: {
        title: "Preferanser",
        description:
          "Slik ser CaptureFlow ut for deg, og hvilket språk det vises på.",
      },
      languageDescription: "Språket CaptureFlow vises på.",
    },
    avatar: {
      label: "Profilbilde",
      change: "Bytt profilbilde",
      removing: "Fjerner…",
      hint: "JPG, PNG, WebP eller GIF. Maks 2 MB.",
      tooLarge: "Profilbildet kan ikke være større enn 2 MB",
      badType: "Profilbildet må være PNG, JPEG, WebP eller GIF",
    },
    account: {
      name: {
        label: "Fullt navn",
        placeholder: "Navnet ditt",
        description: "Vises på opptak, skjermbilder og i aktivitetslister.",
        required: "Navn er påkrevd.",
        updateFailed: "Kunne ikke oppdatere navnet.",
      },
      email: {
        label: "E-postadresse",
        description:
          "Brukes til å logge inn. Kontakt kundestøtte for å endre den.",
      },
      userId: {
        label: "Bruker-ID",
        copy: "Kopier bruker-ID",
        description: "Oppgi denne når du kontakter kundestøtte.",
      },
      saveChanges: "Lagre endringer",
    },
    workspace: {
      title: "Innstillinger for arbeidsområdet",
      tabs: {
        label: "Innstillingsseksjoner",
        general: "Generelt",
        security: "Sikkerhet",
      },
      general: {
        title: "Generelt",
        description:
          "Navnet og logoen som identifiserer dette arbeidsområdet i velgeren, på medlemssiden og i forhåndsvisninger ved deling.",
      },
      name: {
        title: "Navn på arbeidsområdet",
        description: "Navnet som vises for arbeidsområdet ditt.",
        empty: "Navnet på arbeidsområdet kan ikke være tomt",
        tooLong: "Navnet på arbeidsområdet er for langt (maks {max} tegn)",
      },
      logo: {
        title: "Logo for arbeidsområdet",
        description:
          "Vises ved siden av navnet på arbeidsområdet. PNG, JPEG, WebP, GIF eller SVG, maks 2 MB.",
        upload: "Last opp logo",
        replace: "Bytt logo",
        tooLarge: "Logoen kan ikke være større enn 2 MB",
        badType: "Logoen må være PNG, JPEG, WebP, GIF eller SVG",
      },
      permissions: {
        title: "Standardtillatelser",
        description:
          "Innstillinger som gjelder for alle nye opptak og skjermbilder i arbeidsområdet.",
      },
      recordingAccess: {
        title: "Opptakstilgang",
        description:
          "Bestem om kolleger kan legge opptak og skjermbilder i dette arbeidsområdet.",
        allow: {
          title: "La kolleger legge ut her",
          body: "Medlemmer kan ta opp i dette arbeidsområdet.",
        },
        ownerOnly: {
          title: "Bare eieren av arbeidsområdet",
          body: "Det kolleger laster opp, havner i deres personlige arbeidsområde.",
        },
      },
    },
    devices: {
      title: "Tilkoblede enheter",
      count: "one:{n} enhet logget inn|other:{n} enheter logget inn",
      empty:
        "Ingen tilkoblede enheter. Åpne CaptureFlow-skrivebordsappen og klikk på Sign in på opptakslinjen for å koble til denne kontoen.",
      unlabelled: "Enhet uten navn",
      added: "Lagt til {date}",
      addedLastUsed: "Lagt til {date} · sist brukt {lastUsed}",
      neverUsed: "Aldri brukt",
      revoke: {
        action: "Fjern tilgang",
        title: "Vil du logge ut denne enheten?",
        description: "Den må logge inn på nytt for å administrere opptak.",
      },
    },
  },
  billing: {
    chargedInUsd: "Belastes i amerikanske dollar.",
    shownIn: "Prisene vises i {currency}. Du belastes i amerikanske dollar.",
    page: {
      title: "Fakturering",
      subtitle: "Abonnementet ditt, og hvor mye av det du har brukt.",
      workspaceLabel: "Arbeidsområde · {name}",
      manageSubscription: "Administrer abonnementet",
      upgradeWorkspace: "Oppgrader arbeidsområdet",
      storage: "Lagring i arbeidsområdet",
      usedOfLimit: "{used} av {limit}",
      usedNoLimit: "{used} – ingen grense",
    },
    loading: {
      plan: "Abonnement",
      usage: "Bruk",
    },
    counts: {
      members: "one:{n} medlem|other:{n} medlemmer",
      paidSeats: "one:{n} betalt lisens|other:{n} betalte lisenser",
      freeViewers: "one:{n} gratis seer|other:{n} gratis seere",
    },
    plan: {
      free: "Gratis",
      paid: "Betalt",
      billedMonthly: "Faktureres månedlig",
      billedYearly: "Faktureres årlig",
      freeSummary:
        "{members} · opptil {recordings} opptak per person, {minutes} minutter per opptak, datasparende kvalitet",
    },
    status: {
      onTrial: "Prøveperiode",
      active: "Aktivt",
      paused: "Satt på pause",
      pastDue: "Betalingen mislyktes",
      unpaid: "Ubetalt",
      cancelled: "Sagt opp",
      expired: "Utløpt",
    },
    details: {
      youPay: "Du betaler",
      amountPerMonth: "{amount} per måned",
      amountPerYear: "{amount} per år",
      seatsMonthly:
        "one:{n} lisens × {price} per måned|other:{n} lisenser × {price} per måned",
      seatsYearly:
        "one:{n} lisens × {price} per måned, {total} per måned ved årlig fakturering|other:{n} lisenser × {price} per måned, {total} per måned ved årlig fakturering",
      nextPayment: "Neste betaling",
      ends: "Avsluttes",
      endOfPeriod: "Ved slutten av denne perioden",
      amountOnDate: "{amount} den {date}",
      firstPaymentPending: "Når den første betalingen er gjennomført",
      estimate: "{base} · {change}, anslått",
      baseForSeats:
        "one:{amount} for {n} lisens|other:{amount} for {n} lisenser",
      seatsAdded:
        "one:{amount} for {n} lisens lagt til i denne perioden|other:{amount} for {n} lisenser lagt til i denne perioden",
      seatsRemoved:
        "one:{amount} kreditert for {n} lisens fjernet i denne perioden|other:{amount} kreditert for {n} lisenser fjernet i denne perioden",
      seatChanges: "{amount} for lisensendringer i denne perioden",
      seats: "Lisenser",
      seatsAndViewers: "{seats}, {viewers}",
      billedTo: "Faktureres til",
      paymentMethod: "Betalingsmåte",
      cardEnding: "{brand} som slutter på {last4}",
      card: "Kort",
      updateCard: "Oppdater",
    },
    switchPlan: {
      switchTo: "Bytt til {plan}",
      title: "Vil du bytte til {plan}?",
      priceMonthly:
        "one:Din {n} lisens går fra {before} til {after} per måned.|other:Dine {n} lisenser går fra {before} til {after} per måned.",
      priceYearly:
        "one:Din {n} lisens går fra {before} til {after} per måned, faktureres årlig.|other:Dine {n} lisenser går fra {before} til {after} per måned, faktureres årlig.",
      benefits:
        "{plan} tar opp i alle kvaliteter opptil 60 fps og legger til AI-redigering.",
      timing:
        "Det starter nå. Differansen for resten av denne faktureringsperioden legges til på neste faktura.",
      errors: {
        failed: "Kunne ikke endre abonnementet",
        unknownPlan: "Ukjent abonnement",
        billingUnavailable: "Fakturering er utilgjengelig",
        noSubscription: "Dette arbeidsområdet har ikke noe aktivt abonnement",
        cancelled: "Gjenoppta abonnementet før du endrer det",
        unavailable: "Abonnementet kan ikke endres akkurat nå",
        rejected: "Faktureringen godtok ikke endringen. Prøv igjen.",
      },
    },
    upgrade: {
      title: "Oppgrader {name}",
      billingCycle: "Faktureringsintervall",
      cycles: {
        monthly: "Månedlig",
        annual: "Årlig",
      },
      annualSaving: "spar {percent} %",
      seatPicker: {
        title: "Hvem får betalt lisens",
        selected: "{seats} av {total}",
        description:
          "De som er krysset av, tar opp og faktureres. Alle andre er gratis seere som kan se, kommentere og reagere, men ikke ta opp. Rollene endres når du oppgraderer.",
        selectAll: "Velg alle",
        clear: "Fjern valg",
        you: "(deg)",
        paidSeat: "Betalt lisens",
        viewer: "Seer",
      },
      perMonth: "per måned",
      seatsPrice: "one:{n} lisens × {price}|other:{n} lisenser × {price}",
      viewersFree: "one:{n} seer gratis|other:{n} seere gratis",
      priceWithViewers: "{seats}, {viewers}",
      priceYearly: "{seats}, faktureres årlig",
      priceWithViewersYearly: "{seats}, {viewers}, faktureres årlig",
      upgradeTo: "Oppgrader til {plan}",
      checkoutUnavailable: "Betaling er ikke konfigurert",
    },
    requestSeat: {
      request: "Be om å få ta opp",
      requested: "Bedt om lisens",
      hint: "Du er seer her. Be eieren om en betalt lisens, så du kan ta opp.",
      requestedHint:
        "Eieren har fått forespørselen. Du kan ta opp så snart den er godkjent.",
      failed: "Kunne ikke sende forespørselen",
    },
  },
  actions: {
    missingSlug: "Mangler slug",
    recordingNotFound: "Fant ikke opptaket",
    backgroundMissing: "Velg et bilde å laste opp",
    backgroundTooLarge: "Bilder kan være opptil 5 MB",
    backgroundBadType: "Bruk et PNG-, JPEG- eller WebP-bilde",
    backgroundFailed: "Bildet kunne ikke lastes opp. Prøv igjen.",
    invalidVisibility: "Ugyldig synlighet",
    deleteVideoFailed: "Kunne ikke slette videofilen: {reason}",
    transcriptNotFound: "Fant ikke transkripsjonen",
    transcriptEmpty:
      "Transkripsjonen kan ikke være tom. Tilbakestill den i stedet.",
    missingTokenId: "Mangler token-ID",
    tokenNotFound: "Fant ikke tokenet",
    missingScreenshotId: "Mangler skjermbilde-ID",
    screenshotNotFound: "Fant ikke skjermbildet",
    missingImageBytes: "Mangler bildedata",
    screenshotTooLarge:
      "Det redigerte skjermbildet overskrider størrelsesgrensen per skjermbilde.",
    saveScreenshotFailed: "Kunne ikke lagre skjermbildet: {reason}",
    saveFailed: "Lagringen mislyktes: {reason}",
    invalidCanvasDimensions: "Lagringen mislyktes: ugyldige lerretsdimensjoner",
  },
  viewer: {
    meta: {
      defaultTitle: "{product}-opptak",
      defaultDescription: "Et skjermopptak delt fra {product}.",
      preparingTitle: "Klargjør opptaket… – {product}",
      notFoundTitle: "Ikke funnet",
      description:
        "Et skjermopptak delt fra {product}. Se det i nettleseren, uten å registrere deg.",
      descriptionTimed:
        "Et skjermopptak på {duration} delt fra {product}. Se det i nettleseren, uten å registrere deg.",
    },
    loading: "Laster inn opptaket…",
    nav: {
      download: "Last ned",
    },
    authPrompt: {
      pricing: "Priser",
      logIn: "Logg inn",
      getStarted: "Kom i gang",
      getFree: "Få {product} gratis",
    },
    postedBy: {
      label: "Lagt ut av",
      someone: "Noen",
    },
    views: {
      count: "one:{count} visning|other:{count} visninger",
      showWhoWatched: "{views}, vis hvem som har sett",
      viewers: "Seere",
      emptyTitle: "Ingen visninger ennå",
      emptyDescription: "Del lenken, så vises de som ser opptaket, her.",
      signedInViewer: "Innlogget seer",
      anonymous: "Anonym",
    },
    actions: {
      share: "Del",
      visibilityFailed: "Kunne ikke oppdatere synligheten",
      deleteFailed: "Kunne ikke slette opptaket",
    },
    requestAccess: {
      title: "Be om tilgang til å se denne videoen",
      notSharedBy: "{name} har ikke delt dette opptaket med deg ennå.",
      notSharedByOwner: "Eieren har ikke delt dette opptaket med deg ennå.",
      signInHint:
        "Logg inn med jobb-e-posten din – hvis du allerede er med i eierens team, slipper du rett inn.",
      signIn: "Logg inn for å fortsette",
      sentTitle: "Forespørselen er sendt",
      sentDescription:
        "Vi har gitt eieren beskjed. Du får en e-post hvis du får tilgang.",
      askingAs: "Spør som {email}",
      noteLabel: "Legg til en melding {optional}",
      noteOptional: "(valgfritt)",
      notePlaceholder:
        "Hei, jeg vil gjerne se dette opptaket fra gjennomgangen i går.",
      sending: "Sender…",
      submit: "Be om tilgang",
      failed: "Noe gikk galt. Prøv igjen om litt.",
    },
    pending: {
      preparingTitle: "Klargjør opptaket ditt…",
      preparingDescription:
        "Opplastingen er ikke helt ferdig. Siden oppdateres av seg selv når opptaket er klart.",
      generatingTitle: "Videoen din lages…",
      generatingDescription:
        "Dette kan ta noen minutter, så ta deg en kaffe eller en matbit ☕️🍪 Siden oppdateres av seg selv når den er klar.",
      failedTitle: "Dette opptaket ble ikke ferdig opplastet",
      failedDescription:
        "Lenken ble opprettet, men videoen kom aldri frem. Prøv lenken igjen om et minutt, eller lag et nytt opptak.",
      comment: "Kommenter",
    },
    upgradeBanner: {
      message:
        "{usage} på gratisabonnementet. Oppgrader for ubegrenset med opptak i full kvalitet.",
      usage: "one:{used} av {n} opptak brukt|other:{used} av {n} opptak brukt",
    },
    editPanel: {
      editTitle: "Rediger video",
      editDescription:
        "Trim, klipp, endre utseendet og rett opp transkripsjonen i redigeringsverktøyet.",
      downloadTitle: "Last ned videoen",
      downloadDescription: "Hele opptaket som MP4.",
      copyEmbed: "Kopier innbyggingskoden",
      embedCopied: "Innbyggingskoden er kopiert",
      embedDescription: "Lim inn spilleren på en hvilken som helst nettside.",
    },
    notFound: {
      title: "Fant ikke opptaket",
      description:
        "Denne lenken har utløpt eller har aldri eksistert. Opptak på gratiskontoer beholdes i 30 dager fra sist de ble sett.",
      madeWith: "Laget med {product}",
    },
  },
  activity: {
    sidebar: {
      label: "Sidepanel for opptaket",
      activityTab: "Aktivitet",
      transcriptTab: "Transkripsjon",
      toolsTab: "Verktøy",
    },
    you: "Du",
    anonymous: "Anonym",
    jumpToMoment: "Hopp til dette tidspunktet",
    empty: {
      title: "Ingen aktivitet ennå",
      description:
        "Reaksjoner og kommentarer fra seere vises her etter hvert som de kommer.",
      firstTitle: "Bli den første til å kommentere",
      firstTitleNamed: "Bli den første til å kommentere, {name}",
      hint: "Trykk på {key} for å svare, eller legg igjen en kommentar nederst i dette panelet.",
      focusComposer: "Sett fokus på kommentarfeltet",
    },
    composer: {
      signIn: "Logg inn for å reagere og kommentere",
      placeholder: "Legg igjen en kommentar…",
      mention: "Nevn noen",
      noOneToMention: "Ingen har reagert eller kommentert ennå",
      insertEmoji: "Sett inn emoji",
      searchEmoji: "Søk etter emoji",
      posting: "Publiserer…",
      submitAt: "Kommenter ved {time}",
      postFailed: "Kunne ikke publisere kommentaren",
    },
    comment: {
      delete: "Slett kommentaren",
      deleteTitle: "Vil du slette denne kommentaren?",
      deleteDescription: "Den fjernes for alle. Dette kan ikke angres.",
      deleteFailed: "Kunne ikke slette kommentaren",
    },
    reaction: {
      count: "one:{n} reaksjon|other:{n} reaksjoner",
      delete: "Slett reaksjonen",
      deleteMany: "one:Slett {n} reaksjon|other:Slett {n} reaksjoner",
      deleteFailed: "Kunne ikke slette reaksjonen",
    },
    transcript: {
      pendingTitle: "Transkriberer…",
      pendingDescription: "Transkripsjonen vises her så snart den er klar.",
      failedTitle: "Transkriberingen ble ikke fullført",
      failedDescription:
        "Noe gikk galt under transkriberingen av dette opptaket.",
      noneTitle: "Ingen transkripsjon",
      noneOwnerDescription:
        "Ta opp med mikrofonen på, så blir en skrevet for deg.",
      noneViewerDescription: "Dette opptaket ble gjort uten mikrofon.",
      searchLabel: "Søk i transkripsjonen",
      noMatches: "Ingen treff.",
    },
    saveFailed: "Kunne ikke lagre. Prøv igjen.",
    summary: {
      title: "Sammendrag",
      add: "Legg til",
      placeholder: "Hva skjer i dette opptaket?",
      empty: "Ikke noe sammendrag ennå.",
      emptyAction: "Legg til et sammendrag",
    },
    chapters: {
      title: "Kapitler",
      count: "one:{n} kapittel|other:{n} kapitler",
      addAtPlayhead: "Legg til ved spillehodet",
      defaultTitle: "Kapittel {n}",
      editHint: "Ett kapittel per linje, som {short} eller {long}.",
      editHintShort: "M:SS Tittel",
      editHintLong: "H:MM:SS Tittel",
      editPlaceholder: "0:00 Innledning\n0:30 Demo\n1:20 Oppsummering",
      playing: "Spilles av",
      remove: "Fjern kapittelet",
      empty: "Ingen kapitler ennå.",
      emptyAction: "Legg til et ved spillehodet",
    },
  },
  player: {
    overlay: {
      watchAgain: "Se på nytt",
    },
    captions: {
      track: "Undertekster",
      size: "Størrelse",
      position: "Plassering",
      sizes: {
        small: "Liten",
        medium: "Middels",
        large: "Stor",
      },
      positions: {
        top: "Øverst",
        bottom: "Nederst",
      },
    },
    reactionBar: {
      comment: "Kommenter",
      leaveComment: "Legg igjen en kommentar",
    },
    reactions: {
      heart: "Hjerte",
      thumbsUp: "Tommel opp",
      fire: "Ild",
      clap: "Applaus",
      raisedHands: "Løftede hender",
      eyes: "Øyne",
    },
    embed: {
      title: "{product}-opptak",
    },
    controls: {
      buttons: {
        play: "Spill av",
        pause: "Sett på pause",
        replay: "Spill av på nytt",
        mute: "Slå av lyden",
        unmute: "Slå på lyden",
      },
      seek: {
        forward: "Spol {seconds} sekunder frem",
        backward: "Spol {seconds} sekunder tilbake",
      },
      fullscreen: {
        enter: "Åpne fullskjerm",
        exit: "Avslutt fullskjerm",
      },
      captions: {
        enable: "Slå på undertekster",
        disable: "Slå av undertekster",
      },
      pip: {
        enter: "Åpne bilde-i-bilde",
        exit: "Avslutt bilde-i-bilde",
      },
      cast: {
        start: "Start castingen",
        stop: "Stopp castingen",
        connecting: "Kobler til",
      },
      airplay: {
        start: "Start AirPlay",
        stop: "Stopp AirPlay",
      },
      slider: {
        seek: "Spol",
      },
      time: {
        current: "Gjeldende tid",
        duration: "Varighet",
        position: "{current} av {duration}",
        unknown: "Mediet er ikke lastet inn, ukjent tid.",
      },
      playback: {
        rate: "Avspillingshastighet {rate}",
      },
      volume: {
        mutedValue: "{percent}, lyd av",
        muted: "Lyd av",
        label: "Volum",
        value: "Volum {value}",
      },
      status: {
        captionsOn: "Undertekster på",
        captionsOff: "Undertekster av",
        paused: "Satt på pause",
        playing: "Spilles av",
        fullscreen: "Fullskjerm",
        pip: "Bilde-i-bilde",
        exitPip: "Avslutt bilde-i-bilde",
        seekedTo: "Spolte til {time}",
      },
      container: {
        label: "Mediespiller",
      },
      errors: {
        aborted: "Du stoppet avspillingen før den var ferdig.",
        network:
          "Mediet kunne ikke lastes inn på grunn av en nettverks- eller serverfeil.",
        decode:
          "Mediet kunne ikke spilles av. Det kan være skadet, eller nettleseren din støtter kanskje ikke formatet.",
        source:
          "Mediet kunne ikke lastes inn. Det kan være utilgjengelig, eller nettleseren din støtter kanskje ikke formatet.",
        encrypted:
          "Mediet kunne ikke spilles av fordi det ikke kunne dekrypteres.",
        unplayable: "Spilleren støtter ikke dette mediet.",
        title: "Noe gikk galt.",
        unexpected: "Det oppstod en uventet feil.",
      },
      common: {
        ok: "OK",
      },
      menu: {
        settings: "Innstillinger",
        quality: "Kvalitet",
        audio: "Lyd",
        speed: "Hastighet",
        captions: "Undertekster",
        playbackRate: "Avspillingshastighet",
        off: "Av",
        auto: "Auto",
        autoWithLabel: "Auto ({label})",
      },
    },
  },
  screenshotView: {
    page: {
      defaultTitle: "{product}-skjermbilde",
      description: "Et skjermbilde delt fra {product}.",
      madeWith: "Laget med {product}",
      loading: "Laster inn skjermbildet…",
    },
    authPrompt: {
      pricing: "Priser",
      logIn: "Logg inn",
      getStarted: "Kom i gang",
      getFree: "Få {product} gratis",
    },
    actions: {
      edit: "Rediger skjermbildet",
      share: "Del",
      shareTitle: "Del skjermbildet",
      copyLink: "Kopier lenken",
      linkCopied: "Lenken er kopiert",
      more: "Flere handlinger",
      delete: "Slett skjermbildet",
      deleteTitle: "Vil du slette dette skjermbildet?",
      deleteDescription:
        "Bildet og lenken slutter å fungere umiddelbart. Dette kan ikke angres.",
      visibilityFailed: "Kunne ikke oppdatere synligheten",
      deleteFailed: "Kunne ikke slette skjermbildet",
    },
    zoom: {
      expand: "Forstørr bildet",
      minimize: "Forminsk bildet",
    },
    requestAccess: {
      title: "Be om tilgang til å se dette skjermbildet",
      notSharedBy: "{name} har ikke delt dette skjermbildet med deg ennå.",
      notSharedByOwner: "Eieren har ikke delt dette skjermbildet med deg ennå.",
      signInHint:
        "Logg inn med jobb-e-posten din – hvis du allerede er med i eierens team, slipper du rett inn.",
      signIn: "Logg inn for å fortsette",
      sentTitle: "Forespørselen er sendt",
      sentDescription:
        "Vi har gitt eieren beskjed. Du får en e-post hvis du får tilgang.",
      askingAs: "Spør som {email}",
      noteLabel: "Legg til en melding {optional}",
      noteOptional: "(valgfritt)",
      notePlaceholder:
        "Hei, jeg vil gjerne ha en kopi av dette skjermbildet fra designgjennomgangen.",
      sending: "Sender…",
      submit: "Be om tilgang",
      failed: "Noe gikk galt. Prøv igjen om litt.",
    },
    notFound: {
      title: "Fant ikke skjermbildet",
      description:
        "Denne lenken har utløpt eller har aldri eksistert. Skjermbilder på gratiskontoer beholdes i 30 dager fra sist de ble sett.",
    },
  },
  recordingEditor: {
    skeleton: {
      label: "Åpner redigeringsverktøyet",
      status: "Åpner redigeringsverktøyet…",
    },
    preparing: {
      title: "Klargjør opptaket…",
      description:
        "Opptaket lastes fortsatt opp. Siden oppdateres automatisk når det er klart.",
    },
    failed: {
      title: "Opplastingen av opptaket mislyktes.",
      description: "Prøv å ta opp på nytt fra skrivebordsappen.",
    },
    saveFailed: "Kunne ikke lagre",
    topBar: {
      back: "Tilbake til opptaket",
      status: {
        idle: "Endringer lagres automatisk",
        saved: "Lagret",
        error: "Kunne ikke lagre",
      },
      versionHistory: "Versjonslogg (kommer snart)",
      undo: "Angre",
      undoShortcut: "Angre ({key})",
      redo: "Gjør om",
      redoShortcut: "Gjør om ({key})",
      finish: "Fullfør",
    },
    panels: {
      label: "Redigeringspaneler",
      tabs: {
        transcript: "Transkripsjon",
        design: "Utforming",
        camera: "Kamera",
        audio: "Lyd",
        details: "Detaljer",
      },
      hide: {
        transcript: "Skjul transkripsjonen",
        design: "Skjul utformingen",
        camera: "Skjul kameraet",
        audio: "Skjul lyden",
        details: "Skjul detaljene",
      },
      show: {
        transcript: "Vis transkripsjonen",
        design: "Vis utformingen",
        camera: "Vis kameraet",
        audio: "Vis lyden",
        details: "Vis detaljene",
      },
    },
    toggleOn: "På",
    background: {
      title: "Bakgrunn",
      gradients: "Gradienter",
      none: "Ingen",
      noBackground: "Ingen bakgrunn",
      upload: "Last opp bilde",
      uploading: "Laster opp…",
      uploadedImage: "Ditt bilde",
      solid: "Ensfarget",
      solidColor: "Ensfarget {color}",
      customColor: "Velg en egen farge",
      colors: "Farger",
      wallpaper: "{group}: bakgrunnsbilde {n}",
      wallpaperGroups: {
        general: "Generelt",
        cities: "Byer",
        blue: "Blå",
        purple: "Lilla",
        orange: "Oransje",
        dark: "Mørk",
      },
      presets: {
        violet: "Fiolett",
        sunset: "Solnedgang",
        orchid: "Orkidé",
        forest: "Skog",
        flamingo: "Flamingo",
        citrus: "Sitrus",
        arctic: "Arktis",
        ocean: "Hav",
        deep: "Dyp",
        ember: "Glød",
        mint: "Mynte",
        dusk: "Skumring",
        peach: "Fersken",
        midnight: "Midnatt",
        slate: "Skifer",
      },
    },
    frame: {
      title: "Ramme",
      padding: "Luft",
      corners: "Hjørner",
      shadow: "Skygge",
    },
    camera: {
      title: "Kamera",
      show: "Vis kameraet",
      hidden: "Skjult",
      position: "Plassering",
      positionHint: "Dra prikken eller trykk på et hjørne",
      positionHintHidden: "Vis kameraet for å plassere det.",
      corners: {
        topLeft: "Øverst til venstre",
        topRight: "Øverst til høyre",
        bottomLeft: "Nederst til venstre",
        bottomRight: "Nederst til høyre",
      },
      size: "Størrelse",
      sizes: {
        small: "Liten",
        medium: "Middels",
        large: "Stor",
      },
    },
    audio: {
      title: "Lyd",
      systemSound: "Systemlyd",
      sound: "Lyd",
      microphone: "Mikrofon",
      muted: "Lyd av",
      sharedTrack: "Mikrofonen og systemlyden deler ett spor i dette opptaket.",
    },
    details: {
      title: "Opptak",
      link: "Lenke",
      size: "Størrelse",
      duration: "Varighet",
      views: "Visninger",
      created: "Opprettet",
    },
    transcript: {
      transcribing: "Transkriberer…",
      unavailable: "Ingen transkripsjon tilgjengelig",
      pendingHint: "Last inn siden på nytt om et minutt for å redigere den.",
      failedHint: "Transkriberingen ble ikke fullført for dette opptaket.",
      missingHint: "Ta opp med mikrofonen på, så blir en skrevet for deg.",
      deleteWord: "Slett ordet",
      deleteWords: "one:Slett {n} ord|other:Slett {n} ord",
      clearSelection: "Fjern valg",
      hint: "Klikk på et ord eller dra over flere ord for å velge, dobbeltklikk for å rette teksten.",
      resetEdits: "Tilbakestill endringer",
      editLine: "Rediger transkripsjonslinjen",
      selectLine: "Velg linjen ved {time}",
      restore: "Gjenopprett",
      saveFailed: "Kunne ikke lagre",
      resetFailed: "Kunne ikke tilbakestille",
    },
    timeline: {
      hideWaveform: "Skjul bølgeformen",
      showWaveform: "Vis bølgeformen",
      loadingAudio: "Laster inn lyd…",
      deleteSelection: "Slett utvalget",
      deleteSelectionHint:
        "Velg ord i transkripsjonen, eller del tidslinjen og velg et segment",
      splitAt: "Del ved {time}",
      splitHint: "Spill av eller spol til et tidspunkt først",
      comingSoon: "Kommer snart",
      fit: "Tilpass",
      zoomOut: "Zoom ut",
      zoom: "Zoom på tidslinjen",
      zoomIn: "Zoom inn",
      seek: "Spol",
      trimStart: "Trim starten av klippet",
      trimEnd: "Trim slutten av klippet",
      removeSplit: "Fjern delingen ved {time}",
    },
  },
  screenshotEditor: {
    loading: "Laster inn redigeringsverktøyet…",
    imageError: {
      decode: "Kunne ikke dekode skjermbildet.",
      fetch:
        "Kunne ikke laste inn skjermbildet. Lagringsbøtten kan ha mistet CORS-tilgangen.",
    },
    header: {
      back: "Tilbake til skjermbildet",
      reset: "Tilbakestill endringer",
      undo: "Angre",
      undoTooltip: "Angre ({key})",
      redo: "Gjør om",
      redoTooltip: "Gjør om ({key})",
      finish: "Fullfør",
    },
    saveError: {
      notMounted: "Redigeringsverktøyet er ikke montert",
      noCanvas: "Fikk ikke tak i eksportlerretet",
      workerCrashed: "Arbeidertråden for PNG-koding krasjet",
    },
    tools: {
      text: "Tekst",
      rect: "Rektangel",
      arrow: "Pil",
      background: "Bakgrunn",
    },
    background: {
      title: "Legg til en bakgrunn",
      close: "Lukk bakgrunnsvelgeren",
      none: "Ingen",
      gradients: {
        violet: "Fiolett",
        sunset: "Solnedgang",
        orchid: "Orkidé",
        forest: "Skog",
        flamingo: "Flamingo",
        citrus: "Sitrus",
        arctic: "Arktis",
        ocean: "Hav",
        deep: "Dyp",
      },
      solid: "Ensfarget {color}",
      custom: "Velg en egen farge",
    },
    inspector: {
      color: "Farge {color}",
      size: "{n}px",
      duplicate: "Dupliser",
    },
    textPrompt: "Tekst",
  },
  canvas: {
    meta: {
      title: "Lerret",
      description: "En tom tavle du kan tegne på mens du tar opp.",
    },
    loading: "Laster inn lerretet…",
    tools: {
      select: "Velg",
      hand: "Hånd",
      pen: "Penn",
      highlighter: "Merkepenn",
      rect: "Rektangel",
      ellipse: "Ellipse",
      arrow: "Pil",
      line: "Linje",
      text: "Tekst",
      eraser: "Viskelær",
    },
    shortcut: "{label} · {key}",
    colour: "Farge {colour}",
    stroke: "Strek {width}",
    hint: "Rull for å panorere · {mod} + rull for å zoome · hold {space} for å dra",
    textPlaceholder: "Skriv…",
    history: {
      undo: "Angre",
      redo: "Gjør om",
      clear: "Tøm tavlen",
    },
    zoom: {
      out: "Zoom ut",
      reset: "Tilbakestill zoom",
      in: "Zoom inn",
    },
    extensionPrompt: {
      title: "Ta opp dette lerretet",
      description:
        "Legg til CaptureFlow-utvidelsen for å ta opp skjermen og kameraet mens du tegner, og del deretter en lenke.",
      dismiss: "Ikke nå",
      install: "Legg til i Chrome",
    },
  },
};

export default messages;

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
      title: "CaptureFlow - Skjermopptaker med delbare lenker",
      description:
        "Ta opp skjermen og del en lenke med team og kunder. Skjermopptaker med åpen kildekode, AI-transkripsjoner og skjermbilder med merknader. Selvhost på Cloudflare.",
    },
    features: {
      title: "Funksjoner i skjermopptakeren",
      description:
        "Ta opp en fane, et vindu eller hele skjermen med kamera og mikrofon, ta skjermbilder med merknader, og del alt som en lenke teamet kan kommentere.",
    },
    pricing: {
      title: "Priser: gratis å starte, én pris per medlem",
      description: `Start gratis med ${FREE_RECORDINGS} opptak. ${LIGHT} og ${PRO} har én pris per medlem, med ubegrenset antall opptak og AI. Eller selvhost CaptureFlow gratis.`,
    },
    faq: {
      title: "Spørsmål og svar: deling, lagring og selvhosting",
      description:
        "Vanlige spørsmål om CaptureFlow: hvordan delingslenker fungerer, hva selvhosting på Cloudflare innebærer, lagringsgrenser og hvordan opptak holdes private.",
    },
    download: {
      title: "Last ned skjermopptakeren for Chrome",
      description:
        "Installer Chrome-utvidelsen fra CaptureFlow for å ta opp skjermen og dele opptaket med en lenke.",
    },
    enterprise: {
      title: "Enterprise",
      description:
        "Driftet CaptureFlow for større bedrifter: lisenser til alle, egne vilkår og én samlet faktura. Fortell oss hva du trenger.",
    },
    selfHostSetup: {
      title: "Oppsett av selvhosting",
      description:
        "Få CaptureFlow satt opp på bedriftens egen Cloudflare-konto: ditt domene, innlogging bare for bedriften og en privat Chrome-utvidelse for teamet.",
    },
    swarmDemo: {
      title:
        "Svermdemo: agenter bygger opp igjen et hvilket som helst nettsted på video",
      description:
        "Skriv inn en nettadresse og se en sverm av agentmarkører bygge nettstedet opp igjen element for element, til musikk. Du får en video med en lenke å dele.",
    },
    chromeExtension: {
      title: "Chrome-utvidelse: ta opp skjermen og del en lenke",
      description:
        "Ta opp skjermen, en fane eller kameraet i Chrome. Når du er ferdig, får du en lenke alle kan se, med transkripsjon, sammendrag og kapitler.",
    },
    agentRecorder: {
      title: "MCP-server: KI-agenten din tar opp videoer",
      description:
        "Koble Claude Code, Codex, Cursor eller ChatGPT til CaptureFlow via MCP. Agenten tar opp en nettapp, skjermen din eller ett vindu og gir deg en lenke du kan dele.",
    },
  },
  nav: {
    features: "Funksjoner",
    discover: "Utforsk",
    pricing: "Priser",
    faq: "FAQ",
    changelog: "Endringslogg",
    login: "Logg inn",
    library: "Mine opptak",
    download: "Last ned",
    language: "Språk",
    openMenu: "Åpne menyen",
    menu: "Meny",
    main: "Hovedmeny",
    docs: "Dokumentasjon",
    resources: "Ressurser",
    faqDescription: "Svar på vanlige spørsmål",
    blog: "Blogg",
    blogDescription: "Veiledninger og nyheter",
    selfHosting: "Selvhosting",
    selfHostingDescription: "Kjør det på din egen Cloudflare",
    community: "Fellesskap",
    communityDescription: "Få hjelp og prat på Discord",
    products: "Produkter",
    exploreProducts: "Utforsk CaptureFlow",
    plans: "Abonnementer",
    exploreResources: "Utforsk ressurser",
    enterprise: "Bedrift",
    swarmDemo: "Svermdemo",
    swarmDemoDescription: "Agenter bygger opp igjen ethvert nettsted på video",
    extension: "Chrome-utvidelse",
    extensionDescription: "Ta opp skjermen og del en lenke",
    agentRecorder: "Opptaker for agenter",
    agentRecorderDescription: "Videoer KI-agenten din lager over MCP",
    star: "Gi stjerne på GitHub",
    starCount: "Gi stjerne på GitHub ({stars})",
    themeToLight: "Bytt til lyst tema",
    themeToDark: "Bytt til mørkt tema",
  },
  banner: {
    label: "Beta",
    aria: "CaptureFlow er i offentlig beta",
    title: "Du er tidlig ute 🎉",
    strip:
      "CaptureFlow er fortsatt i beta, så det endrer seg ofte, og du kan støte på enkelte småfeil mens ting faller på plass.",
    body: "CaptureFlow er i offentlig beta. Det kommer noe nytt de fleste uker, og det folk ber om, er det som bygges først.",
    cta: "Fortell meg hva jeg skal bygge nå",
    close: "Lukk",
  },
  announcement: {
    badge: "Nytt",
    lead: "AI-agenten din kan nå ta opp for deg.",
    rest: "Koble den til én gang, be om en video, og få en lenke tilbake.",
    cta: "Koble til",
  },
  hero: {
    title: "Skjermopptaker {bubble}\nfor deg og AI-agentene dine",
    subtitle:
      "Ta opp demoer, veiledninger og gjennomganger selv med {chrome}-utvidelsen, eller la {claude}, {chatgpt} eller {cursor} ta dem opp for deg. Del hvert opptak som en lenke alle kan se.",
    ctaLabel: "Prøv CaptureFlow gratis",
    installChrome: "Installer Chrome-utvidelsen",
    installMac: "Last ned for macOS",
    installSoon: "Snart",
    connectMcp: "Koble til MCP",
    macSoon: "macOS-app kommer snart",
    installOr: "eller",
    mcpCopy: "Kopier",
    mcpCopied: "Kopiert",
    mcpAddToCursor: "Legg til i Cursor",
    noCreditCard: "Krever ikke betalingskort",
    teaser: {
      title: "Kan selvhostes",
      body: "Kjør det på din egen Cloudflare-konto.",
      cta: "Prøv CaptureFlow",
    },
    demo: {
      prevAria: "Forrige demo",
      nextAria: "Neste demo",
      dotAria: "Vis demo {n} av {total}",
    },
  },
  highlights: {
    heading: "Alle funksjoner",
    subtitle: "Ta opp, rediger og del. Alt er samlet på ett sted.",
    items: {
      recording: { title: "Skjerm og kamera", body: "Ta opp begge samtidig" },
      transcripts: { title: "Transkripsjoner", body: "På 99 språk", tag: "AI" },
      editing: {
        title: "Rediger via transkripsjonen",
        body: "Slett tekst for å klippe videoen",
        tag: "AI",
      },
      camera: {
        title: "Kameraeffekter",
        body: "Bakgrunner og filtre",
      },
      canvas: { title: "Uendelig lerret", body: "Tegn mens du tar opp" },
      screenshots: {
        title: "Skjermbilder med merknader",
        body: "Piler, tekst og sladd",
      },
      feedback: {
        title: "Kommentarer og reaksjoner",
        body: "Tilbakemeldinger i videoen",
      },
      summary: {
        title: "Sammendrag og kapitler",
        body: "Med tittel til hver video",
        tag: "AI",
      },
      filler: {
        title: "Fjerner fyllord automatisk",
        body: "Klipper bort «eh» og «øh»",
        tag: "AI",
      },
    },
    cta: "Se alle funksjoner",
    previews: {
      app: "Lanseringsplan",
      columns: ["Å gjøre", "Pågår", "Ferdig"],
      lines: [
        "Her er den nye flyten.",
        "Først velger du et arbeidsområde.",
        "Så deler du lenken.",
      ],
      retake: "Eh, la meg ta det på nytt.",
      filler: [
        "[Eh,] her er den nye flyten.",
        "Først, [øh,] velger du et arbeidsområde.",
        "Så, [eh,] deler du lenken.",
      ],
      step: "Trinn 1",
      note: "Flytt denne",
      comment: "Liker denne flyten",
      summaryTitle: "Slik inviterer du teamet",
      summaryBody: "Velg et arbeidsområde, og del lenken.",
      chapters: ["Intro", "Velg arbeidsområde"],
    },
  },
  mcpFeatures: {
    heading: "MCP-funksjoner",
    subtitle:
      "Dette kan AI-agenten din gjøre når den er koblet til. Den tar opp på din egen datamaskin, med Claude Code, Codex, Cursor eller en annen MCP-klient.",
    cta: "Les veiledningen",
    items: {
      webApp: { title: "Ta opp en nettapp", body: "Også på localhost" },
      screen: { title: "Ta opp skjermen", body: "En hel skjerm" },
      window: {
        title: "Ta opp ett vindu",
        body: "Terminal, VS Code eller Figma",
      },
      slides: {
        title: "Legg til lysbilder",
        body: "Titler, trinn og avslutninger",
      },
      voiceover: {
        title: "Legg til fortellerstemme",
        body: "Kjører på datamaskinen din",
      },
      report: {
        title: "Skriv en rapport",
        body: "Hva den gjorde, og hva som feilet",
      },
      search: { title: "Søk i opptak", body: "Videoer og transkripsjoner" },
      save: {
        title: "Lagre MP4-filer",
        body: "Uten opplasting eller innlogging",
      },
    },
  },
  useCases: {
    heading: "Slik bruker team det",
    subtitle:
      "Eksempler på hva team tar opp. Hver video er en lenke som spilles av i alle nettlesere.",
    cta: "Se hvordan det fungerer",
    cards: {
      engineering: {
        title: "Utvikling",
        body: "Ta opp en gjennomgang av en PR eller vis hvordan en feil gjenskapes.",
      },
      design: {
        title: "Design",
        body: "Ta opp en gjennomgang av en skisse og samle inn kommentarer.",
      },
      support: {
        title: "Kundestøtte",
        body: "Svar på en sak med en kort gjennomgang.",
      },
      updates: {
        title: "Teamoppdateringer",
        body: "Ta opp ukens oppdatering og del lenken.",
      },
    },
    engineeringFile: "checkout.ts",
    engineeringPr: "PR #482",
    designApp: "trip-app",
    designBadge: "Kasse v3",
    designCardTitle: "Planlegg reisen",
    designColors: "Farger",
    designComment: "Større CTA?",
    supportQuestion: "Hvordan inviterer jeg teamet til arbeidsområdet?",
    supportReply: "Her er en rask gjennomgang:",
    supportLink: "captureflow.dev/r/8kx2pnq4",
    updatesTitle: "Ukentlig oppdatering",
    updatesRange: "6.–10. okt.",
    updatesSignups: "Registreringer",
    updatesShipped: "Lansert",
    updatesFeatures: "funksjoner",
  },
  agents: {
    heading: "Eller be AI-agenten din ta opp demoer og veiledninger",
    worksWith: "Fungerer med {claude}, {openai} og {cursor}.",
    cta: "Les veiledningen",
    subtitle:
      "Spør med vanlige ord. Den tar opp en nettleser, skjermen din eller en app på din egen datamaskin, legger til lysbilder og fortellerstemme hvis du vil, og gir deg en lenke.",
    steps: [
      {
        title: "Koble til agenten din",
        body: "Legg til CaptureFlow i Claude Code, Codex eller Cursor med én linje. Du trenger Node.js 20 eller nyere, og agenten logger inn én gang. I Claude eller ChatGPT legger du det til med en URL.",
      },
      {
        title: "Be om en video",
        body: "En funksjonsdemo, en veiledning, en feilrapport eller en presentasjon med fortellerstemme.",
      },
      {
        title: "Den tar opp for deg",
        body: "På datamaskinen din, også en app på localhost.",
      },
      {
        title: "Legger til lysbilder og stemme",
        body: "Tittellysbilder og fortellerstemme, hvis du vil ha det.",
      },
      {
        title: "Gir deg en lenke du kan dele",
        body: "Legg den ved en pull request, del den i Slack eller send den til en kunde.",
      },
    ],
    scenes: {
      ask: {
        name: "terminal",
        badge: "agent",
        prompt: "Ta opp en demo av kassen",
        steps: ["Åpner appen", "Klikker gjennom", "Lenken din er klar"],
      },
      record: {
        url: "localhost:3000",
        badge: "demo",
        title: "Kasse",
        fields: ["Navnet ditt", "Kortnummer"],
        pay: "Betal nå",
        paid: "Betalt",
      },
      voice: {
        title: "Demo av kassen",
        subtitle: "Slik betaler du i tre trinn",
      },
      share: {
        title: "Demo av kassen",
        link: "captureflow.dev/r/checkout",
        places: ["PR", "Slack", "E-post"],
      },
    },
    chats: {
      claude:
        "I Claude åpner du Customize, deretter Connectors, og velger Add custom connector. Gi den navnet CaptureFlow, lim inn denne URL-en, og logg inn.",
      chatgpt:
        "I ChatGPT på nettet åpner du Plugins, trykker på + og velger Add custom MCP server. Gi den navnet CaptureFlow, lim inn denne URL-en, velg OAuth, og installer deretter pluginen og logg inn. Krever et Business-, Enterprise- eller Edu-abonnement.",
      limits:
        "Chatter lager presentasjons- og veiledningsvideoer av lysbilder på serverne våre, ikke opptak av datamaskinen din, og bruker planens agentminutter i skyen.",
    },
  },
  modes: {
    cta: "Start opptak",
    heading: "Ta opp skjermen med Chrome-utvidelsen",
    subtitle:
      "Installer den og trykk på ta opp. Når du er ferdig, får du en lenke alle kan se, med tittel, sammendrag, kapitler og transkripsjon.",
    scene: {
      timer: "0:42",
      heading: "Slik fungerer en refusjon",
      steps: ["Forespørsel", "Godkjenning", "Utbetaling"],
      captions: [
        "En rask gjennomgang av hvordan en refusjon fungerer.",
        "Først sender kunden inn en forespørsel.",
        "Kundestøtte godkjenner den samme dag.",
        "Så utbetales pengene automatisk.",
      ],
    },
  },
  pageHeroes: {
    home: "Hjem",
    features: {
      label: "Funksjoner",
      word: "FUNKSJONER",
      title: "Ta opp, rediger og del skjermen din",
      subtitle:
        "Ta opp skjermen og kameraet. Del hvert opptak som en lenke teamet kan kommentere.",
    },
    pricing: {
      label: "Priser",
      word: "PRISER",
      title: "Start gratis. Betal én pris per medlem.",
      subtitle:
        "Gratis dekker de første 25 opptakene dine. Light og Pro fjerner grensen. Du kan også selvhoste CaptureFlow gratis.",
    },
    faq: {
      label: "FAQ",
      word: "FAQ",
      title: "Ofte stilte spørsmål",
      subtitle:
        "Svar om opptak, priser, lagring og selvhosting. Les dokumentasjonen for alt annet.",
    },
    chromeExtension: {
      label: "Chrome-utvidelse",
      word: "CHROME",
      title: "Ta opp skjermen i Chrome",
      subtitle:
        "Ta opp skjermen, en fane eller kameraet. Når du er ferdig, får du en lenke alle kan se, med transkripsjon, sammendrag og kapitler.",
    },
    agentRecorder: {
      label: "Opptaker for agenter",
      word: "MCP",
      title: "La KI-agenten din ta opp videoene dine",
      subtitle:
        "Koble den til via MCP og spør med vanlige ord. Den tar opp en nettapp, skjermen din eller ett vindu, legger til lysbilder og stemme om du vil, og gir deg en lenke.",
    },
  },
  collaboration: {
    heading: "Dette kan du gjøre etter opptaket",
    cta: "Prøv gratis",
    subtitle:
      "Rediger det, og del eller bygg det inn. Inviter teamet til å se, reagere og kommentere hverandres videoer.",
    categories: {
      share: {
        feature: {
          tag: "nytt",
          title: "Rediger videoen",
          cta: "Installer utvidelsen",
          body: "Slett ord i transkripsjonen for å klippe dem ut av videoen, eller trim klipp på tidslinjen. Bytt bakgrunn, flytt, endre størrelse på eller skjul kameraet, og demp mikrofonen eller systemlyden.",
        },
        scene: {
          app: "Lanseringsplan",
          nav: ["Oversikt", "Veikart", "Oppgaver", "Dokumenter"],
          columns: [
            {
              name: "Å gjøre",
              tasks: ["Tekst til prissiden", "Velkomst-e-post"],
            },
            {
              name: "Pågår",
              tasks: ["Ny kasse", "Teaminvitasjoner"],
            },
            { name: "Ferdig", tasks: ["Påmelding til beta"] },
          ],
          background: "Bakgrunn",
          camera: "Kamera",
          shapes: ["Sirkel", "Kvadrat"],
          fillers: "Fyllord",
          remove: "Fjern",
          transcript: {
            before: "Klikk her for å",
            fillers: ["eh,", "vent,", "unnskyld,"],
            after: "dele lenken.",
          },
          saved: "Lagret · samme lenke",
        },
      },
      embed: {
        feature: {
          title: "Del eller bygg inn videoen",
          cta: "Installer utvidelsen",
          body: "Lim inn lenken i Slack, GitHub, Notion eller en e-post, så vises en forhåndsvisning. Du kan også bygge inn spilleren i dokumentasjonen eller på nettstedet ditt. Med utvidelsen installert spilles den av direkte i GitHub-issues og pull requests.",
        },
        scene: {
          question:
            "Kan du vise meg hvordan jeg inviterer teamet til arbeidsområdet?",
          reply: "Selvfølgelig! Her er en kort gjennomgang av trinnene:",
          url: "captureflow.dev/r/8kx2pnq4",
          app: "Innstillinger",
          nav: ["Generelt", "Medlemmer", "Fakturering"],
          members: "Medlemmer",
          invite: "Inviter",
          people: [
            { initials: "AR", name: "Alex Rivera", role: "Eier" },
            { initials: "CK", name: "Chris Kim", role: "Medlem" },
            { initials: "JB", name: "Jordan Bell", role: "Medlem" },
          ],
          duration: "0:48",
        },
      },
      feedback: {
        feature: {
          title: "Samarbeid om videoene",
          cta: "Logg inn",
          body: "Jobb sammen uten møter, på tvers av tidssoner. Teamet kan reagere med emojier, kommentere på et hvilket som helst tidspunkt i videoen og følge med ved hjelp av transkripsjoner og undertekster.",
        },
        scene: {
          title: "Gjennomgang av lanseringsplanen",
          author: "Alex",
          age: "akkurat nå",
          duration: "1:12",
          activity: "Aktivitet",
          events: [
            { initials: "CK", name: "Chris", at: "0:09", emoji: "👍" },
            { initials: "JB", name: "Jordan", at: "0:17", emoji: "🔥" },
            {
              initials: "MC",
              name: "Maya",
              at: "0:27",
              text: "Liker den nye tavlevisningen",
            },
            { initials: "SL", name: "Sam", at: "0:37", emoji: "❤️" },
            {
              initials: "JB",
              name: "Jordan",
              at: "0:48",
              text: "Kan vi lansere dette på fredag?",
            },
            {
              initials: "AR",
              name: "Alex",
              at: "0:56",
              text: "Ja, rett etter QA ✅",
            },
            { initials: "MC", name: "Maya", at: "1:05", emoji: "👏" },
          ],
        },
      },
      workspaces: {
        feature: {
          title: "Inviter teamet til et arbeidsområde",
          cta: "Opprett et arbeidsområde",
          body: "Alles opptak ligger i ett arbeidsområde. Hver video kan være offentlig, synlig for arbeidsområdet eller privat.",
        },
        scene: {
          team: "CaptureFlow-teamet",
          members: ["1 medlem", "2 medlemmer", "3 medlemmer"],
          memberInitials: ["AR", "CK", "JB"],
          invitePlaceholder: "Inviter via e-post",
          inviteEmail: "chris@acme.co, jordan@acme.co",
          invite: "Inviter",
          invited: "Sendt",
          joined: "Chris og Jordan ble med 🎉",
          whoCanWatch: "Hvem kan se:",
          visibility: [
            { label: "Offentlig", detail: "Alle med lenken" },
            { label: "Arbeidsområde", detail: "Bare teamet ditt" },
            { label: "Privat", detail: "Bare du" },
          ],
        },
      },
    },
  },
  setupService: {
    title: "Vi setter det opp",
    titleHighlight: "for deg",
    subtitle:
      "Fortell oss om bedriften din. Vi setter opp appen, Chrome-utvidelsen, macOS-appen og all infrastrukturen bak, klart til bruk for teamet ditt.",
    includedHeading: "Alt vi setter opp",
    included: {
      infra: {
        title: "Appen, på din infrastruktur",
        body: "Rullet ut på din egen Cloudflare-konto og levert fra ditt domene. Du eier alt sammen.",
      },
      storage: {
        title: "Lagring og database",
        body: "Opptak i din egen R2-bøtte; arbeidsområder og kommentarer i din egen database.",
      },
      signin: {
        title: "Innlogging bare for bedriften",
        body: "Innlogging med Google Workspace eller GitHub, begrenset til bedriftens e-postdomene.",
      },
      apps: {
        title: "Chrome-utvidelse og Mac-app",
        body: "Begge bygget for din instans, med utvidelsen publisert privat for teamet ditt.",
      },
      ready: {
        title: "Klart til opptak",
        body: "Arbeidsområder er opprettet og teamet invitert, så folk kan begynne å dele med en gang.",
      },
      handover: {
        title: "Overlevering",
        body: "Vi viser den som skal vedlikeholde det, hvordan det driftes og oppdateres.",
      },
    },
    nextHeading: "Kontakt oss",
    nextSubheading: "Fortell oss hva du trenger, så tar vi kontakt.",
    form: {
      company: "Bedrift",
      companyPlaceholder: "Acme AS",
      name: "Navnet ditt",
      namePlaceholder: "Jane Doe",
      email: "Jobb-e-post",
      emailPlaceholder: "jane@acme.com",
      topic: "Hva kan vi hjelpe med?",
      topics: ["Oppsett av selvhosting", "Mer enn 1 TB", "Noe annet"],
      teamSize: "Teamstørrelse",
      teamSizes: ["1–10", "11–50", "51–200", "200+"],
      cloudflare: "Har du en Cloudflare-konto?",
      cloudflareOptions: ["Ja", "Nei", "Usikker"],
      notes: "Er det noe mer vi bør vite?",
      notesPlaceholder: "Teamstørrelse, domene, tidsplan…",
      submit: "Send melding",
      error:
        "Forespørselen kunne ikke sendes. Prøv igjen, eller send oss en e-post på {email}.",
      sentTitle: "Melding sendt",
      sentBody: "Takk. Vi svarer deg på {email}.",
      back: "Tilbake til forsiden",
    },
  },
  swarmDemo: {
    title: "Se en sverm av agenter bygge opp igjen",
    titleHighlight: "ethvert nettsted",
    subtitle:
      "Skriv inn en nettadresse. En sverm av agentmarkører tegner nettstedet opp igjen element for element, til musikk, og du får en videolenke å dele.",
    url: "Nettadresse",
    urlPlaceholder: "https://example.com",
    generate: "Lag demo",
    generating: "Starter en nettleser i skyen…",
    check: "Sjekk nettstedet",
    checking: "Sjekker nettstedet…",
    previewNote:
      "Dette er siden agentene bygger opp igjen. Lag demoen når den ser riktig ut.",
    change: "Endre adresse",
    note: "Logg inn for å lage en demo gratis. Hver demo havner i biblioteket ditt.",
    noteSignedIn: "Lag gratis. Hver demo havner i biblioteket ditt.",
    howHeading: "Slik fungerer det",
    how: {
      type: {
        title: "Skriv inn en adresse",
        body: "Et hvilket som helst offentlig nettsted. Siden lastes i en nettleser i skyen, og hver overskrift, hvert bilde, hver knapp og hvert kort blir funnet.",
      },
      build: {
        title: "Agentene bygger det opp igjen",
        body: "Forespørselen skrives inn i en chatboks, og så plasserer en sverm av markører hvert element mens musikken går raskere.",
      },
      share: {
        title: "Få en lenke",
        body: "Videoen åpnes i biblioteket ditt så snart den er ferdig. Del lenken, last ned filen eller publiser den.",
      },
    },
    errors: {
      invalidUrl: "Skriv inn en nettadresse som example.com.",
      unreachable: "Nettstedet kunne ikke nås. Sjekk adressen og prøv igjen.",
      unavailable: "Demoer er ikke tilgjengelige på denne serveren.",
      running:
        "Et av opptakene dine kjører fortsatt. Vent til det er ferdig, og prøv igjen.",
      limit:
        "Dette arbeidsområdet har brukt opp agentminuttene i skyen for denne måneden. De tilbakestilles den 1.",
      recordings:
        "Du har nådd opptaksgrensen for gratisplanen. Slett et opptak eller oppgrader, og prøv igjen.",
      busy: "Alle nettleserne i skyen er opptatt akkurat nå. Prøv igjen om noen minutter.",
      failed: "Demoen kunne ikke startes. Prøv igjen.",
    },
  },
  enterprise: {
    title: "CaptureFlow for",
    titleHighlight: "bedriften din",
    subtitle: "Fortell oss om teamet ditt, så finner vi en plan som passer.",
    everythingHeading: "Alt teamet ditt får",
    comingSoon: "Kommer snart",
    everything: {
      extension: {
        title: "Chrome-utvidelse",
        body: "Ta opp en fane eller hele skjermen, med en lenke klar når du stopper.",
      },
      agents: {
        title: "Opptak med agenter",
        body: "Claude, ChatGPT eller Cursor tar opp demoer og feil for deg.",
      },
      mac: {
        title: "Mac-app",
        body: "En opptaker bygget for macOS, med de samme delingslenkene med én gang.",
      },
      workspaces: {
        title: "Arbeidsområder for team",
        body: "Alles opptak på ett sted, delt eller holdt privat.",
      },
      feedback: {
        title: "Kommentarer og reaksjoner",
        body: "Seerne svarer rett på tidslinjen, akkurat der de mener.",
      },
      edit: {
        title: "Rediger etter deling",
        body: "Bytt bakgrunn, kamera eller lyd, og lenken forblir den samme.",
      },
      screenshots: {
        title: "Skjermbilder med merknader",
        body: "Marker et skjermbilde med piler, tekst og sladd, og del det som en lenke.",
      },
      transcripts: {
        title: "Transkripsjoner",
        body: "Hvert opptak blir transkribert, så det er lett å skumlese og søke i.",
      },
    },
    formHeading: "Kontakt oss",
    formSubheading: "Fortell oss om teamet ditt, så svarer vi på e-post.",
    form: {
      company: "Bedrift",
      companyPlaceholder: "Acme AS",
      name: "Navnet ditt",
      namePlaceholder: "Jane Doe",
      email: "Jobb-e-post",
      emailPlaceholder: "jane@acme.com",
      need: "Hva trenger du?",
      needs: [
        "Lisenser til et stort team",
        "Egne vilkår eller én samlet faktura",
        "Noe annet",
      ],
      teamSize: "Teamstørrelse",
      teamSizes: ["1–10", "11–50", "51–200", "200+"],
      storage: "Hvor mye lagring?",
      storageOptions: ["1–5 TB", "5–20 TB", "20 TB+", "Usikker"],
      notes: "Er det noe mer vi bør vite?",
      notesPlaceholder: "Hvor mye teamet tar opp, tidsplan, faktureringsbehov…",
      submit: "Send melding",
      error:
        "Meldingen kunne ikke sendes. Prøv igjen, eller send oss en e-post på {email}.",
      sentTitle: "Melding sendt",
      sentBody: "Takk. Vi svarer deg på {email}.",
      back: "Tilbake til forsiden",
    },
  },
  pricing: {
    heading: "Priser",
    cta: "Sammenlign alle abonnementer",
    subheading:
      "Gratis dekker de første opptakene dine. Betalte abonnementer har én pris per medlem.",
    controls: {
      shownIn: "Prisene vises i {currency}. Du belastes i amerikanske dollar.",
      teamSize: "Teamstørrelse",
      members: "medlemmer",
      title: "Fakturering",
      note: "Én pris per medlem.",
      billing: "Fakturer meg",
      monthly: "Månedlig",
      annually: "Årlig",
      save: "Spar {percent} %",
    },
    compare: {
      loomRow: "Loom {plan}",
      loomDetail: "{seats} personer × {perSeat} per person",
      caption: "Månedspriser.",
      captureflowRow: "CaptureFlow {ourPlan}",
      captureflowDetail: "{seats} medlemmer × {ourPerSeat} per medlem",
      saveLabel: "Teamet ditt sparer",
      saveValue: "{savings} i året",
    },
    plans: {
      chargedInUsd: "Belastes i amerikanske dollar.",
      member: "medlem",
      members: "medlemmer",
      included: "Inkludert",
      notIncluded: "Ikke inkludert",
      free: {
        name: "Gratis",
        description: "Skjermopptak du deler som en lenke.",
        cta: "Registrer deg",
      },
      light: {
        name: LIGHT,
        featuresHeading: "Alt i Gratis, pluss",
        features: [
          "Ubegrenset antall opptak",
          "Ubegrenset opptakstid",
          `${LIGHT_AGENT_MIN} min agentopptak i skyen per måned, opptil 10 min per opptak`,
        ],
        description: "Ubegrenset antall opptak i datasparende kvalitet.",
        period: "/mnd",
        noteMonthly: "Per medlem, faktureres månedlig",
        noteAnnual:
          "Per medlem, faktureres årlig. {yearly} i året for {seats} {members}",
        cta: "Prøv gratis",
      },
      pro: {
        badge: "Anbefalt",
        name: PRO,
        featuresHeading: `Alt i ${LIGHT}, pluss`,
        features: [
          "Full kvalitet, opptil 1080p",
          "AI-kapitler, titler og fjerning av fyllord",
          "Egen merkevare",
          `${PRO_AGENT_MIN} min agentopptak i skyen per måned, med ${PRO_VOICEOVER_MIN} min AI-fortellerstemme`,
          "Seerinnsikt (kommer snart)",
          "Integrasjoner med Slack, Notion og Zapier (kommer snart)",
        ],
        description: "Full kvalitet, AI-opprydding og din egen merkevare.",
        period: "/mnd",
        noteMonthly: "Per medlem, faktureres månedlig",
        noteAnnual:
          "Per medlem, faktureres årlig. {yearly} i året for {seats} {members}",
        cta: "Prøv gratis",
      },
      rows: {
        recordings: {
          label: "Opptak per person",
          free: "Opptil {recordings}",
          light: "Ubegrenset",
          pro: "Ubegrenset",
        },
        length: {
          label: "Opptakslengde",
          free: "{minutes} min per video",
          light: "Ubegrenset",
          pro: "Ubegrenset",
        },
        quality: {
          label: "Videokvalitet",
          free: "Datasparing",
          light: "Datasparing",
          pro: "Opptil 1080p",
        },
        transcripts: {
          label: "Transkripsjoner og undertekster",
          free: true,
          light: true,
          pro: true,
        },
        editing: {
          label: "Rediger via transkripsjonen",
          free: true,
          light: true,
          pro: true,
        },
        chapters: {
          label: "AI-kapitler og -titler",
          free: false,
          light: false,
          pro: true,
        },
        filler: {
          label: "Fjerning av fyllord",
          free: false,
          light: false,
          pro: true,
        },
        feedback: {
          label: "Kommentarer og reaksjoner",
          free: true,
          light: true,
          pro: true,
        },
        agents: {
          label: "Lokale agentopptak",
          free: true,
          light: true,
          pro: true,
        },
        cloudAgents: {
          label: "Agentopptak i skyen",
          free: `${FREE_AGENT_MIN} min per måned`,
          light: `${LIGHT_AGENT_MIN} min per måned`,
          pro: `${PRO_AGENT_MIN} min per måned`,
        },
        voiceover: {
          label: "Lokal AI-fortellerstemme",
          free: true,
          light: true,
          pro: true,
        },
        cloudVoiceover: {
          label: "AI-fortellerstemme i skyen",
          free: false,
          light: false,
          pro: `${PRO_VOICEOVER_MIN} min per måned`,
        },
        branding: {
          label: "Egen merkevare",
          free: false,
          light: false,
          pro: true,
        },
      },
    },
    table: {
      heading: "Alle funksjoner, abonnement for abonnement",
      subtitle: "Gratis, Light og Pro, side om side.",
      groups: [
        {
          title: "Opptak",
          rows: [
            {
              label: "Medlemmer",
              free: "Ubegrenset",
              light: "Ubegrenset",
              pro: "Ubegrenset",
            },
            {
              label: "Opptak per person",
              free: "Opptil {recordings}",
              light: "Ubegrenset",
              pro: "Ubegrenset",
            },
            {
              label: "Opptakslengde",
              free: "{minutes} min per video",
              light: "Ubegrenset",
              pro: "Ubegrenset",
            },
            {
              label: "Videokvalitet",
              free: "Datasparing",
              light: "Datasparing",
              pro: "Opptil 1080p",
            },
            {
              label: "Skjermbilder",
              free: "Ubegrenset",
              light: "Ubegrenset",
              pro: "Ubegrenset",
            },
            {
              label: "Opptak beholdes",
              free: "30 dager uten visning",
              light: "Til du sletter dem",
              pro: "Til du sletter dem",
            },
            {
              label: "Opptak av hele skjermen, et vindu eller en fane",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Kameraboble og kameraeffekter",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Mikrofon og systemlyd",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Jevn markør",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Chrome-utvidelse og Mac-app",
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
              label: "Transkripsjoner",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Undertekster",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Kapitler med sammendrag",
              free: false,
              light: false,
              pro: true,
            },
            {
              label: "Automatiske tittelforslag",
              free: false,
              light: false,
              pro: true,
            },
            {
              label: "Rediger videoen via transkripsjonen",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Fjerning av fyllord",
              free: false,
              light: false,
              pro: true,
            },
          ],
        },
        {
          title: "Agenter",
          rows: [
            {
              label: "Agentopptak på datamaskinen din",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Agentpresentasjoner laget i skyen",
              free: `${FREE_AGENT_MIN} min per måned per person`,
              light: `${LIGHT_AGENT_MIN} min per måned per medlem`,
              pro: `${PRO_AGENT_MIN} min per måned per medlem`,
            },
            {
              label: "Lysbilder i agentopptak",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "AI-fortellerstemme på datamaskinen din",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "KI-fortellerstemme i skypresentasjoner",
              free: false,
              light: false,
              pro: `${PRO_VOICEOVER_MIN} min per måned per medlem`,
            },
          ],
        },
        {
          title: "Redigering",
          rows: [
            {
              label: "Rediger etter deling, samme lenke",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Bakgrunner",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Flytt eller endre størrelse på kameraboblen",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Klipp bort deler av videoen",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Skjermbilder med merknader: piler, tekst og sladd",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Uendelig lerret",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "Deling og tilbakemeldinger",
          rows: [
            {
              label: "Delingslenke klar når du stopper",
              free: true,
              light: true,
              pro: true,
            },
            {
              label:
                "Lenker som er offentlige, for arbeidsområdet eller private",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Be om tilgang på begrensede lenker",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Forhåndsvisning av lenker i chat og e-post",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Bygg inn spilleren hvor som helst",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Spilles av i GitHub-issues og pull requests",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Kommentarer på tidslinjen",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Emoji-reaksjoner",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Antall visninger",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Last ned originalfilen",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "Arbeidsområde og administrasjon",
          rows: [
            {
              label: "Arbeidsområde for teamet",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Rollene eier, medlem og seer",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Standard synlighet og opplastingstillatelser",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Søk i opptak og skjermbilder",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Egen merkevare",
              free: false,
              light: false,
              pro: true,
            },
          ],
        },
        {
          title: "Hosting og support",
          rows: [
            {
              label: "Åpen kildekode under AGPL",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Selvhosting på din egen Cloudflare-konto",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Driftet hosting og oppdateringer",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
      ],
    },
    includes: {
      heading: "Alle abonnementer inkluderer",
      items: [
        "Ditt eget arbeidsområde, inviter hvem du vil",
        "Kameraeffekter",
        "AI-transkripsjoner og undertekster",
        "Rediger videoen via transkripsjonen",
        "Delingslenker: offentlige, for arbeidsområdet eller private",
        "Kommentarer og emoji-reaksjoner",
        "Skjermbilder med merknader",
        "Uendelig lerret",
      ],
    },
    annual: {
      badgePro: "Driftet",
      badgeCycle: "Årlig",
      title: "Driftet hosting",
      subtitle: "Full drift, faktureres årlig.",
      period: "/måned",
      note: "Faktureres {amount}/år. Si opp når som helst.",
      cta: "Kom i gang",
    },
  },
  activity: {
    heading: "Siste endringer på GitHub",
    subtitle:
      "Alle endringer er offentlige. Dette er de nyeste pull requestene og åpne issuene på GitHub.",
    cta: "Se på GitHub",
    shippedHeading: "Nylig flettet inn",
    openHeading: "Åpne issues og pull requests",
    emptyOpen: "Ingenting åpent akkurat nå.",
    newIssue: "Meld en feil eller foreslå en funksjon",
    viewAll: "Se alt på GitHub",
  },
  faq: {
    heading: "Ofte stilte spørsmål",
    subtitle:
      "Svar om opptak, priser, lagring og selvhosting. Les dokumentasjonen for alt annet.",
    cta: "Les dokumentasjonen",
    waitlistLink: "Sett deg på ventelisten",
    items: [
      {
        question: "Hvordan lager jeg et opptak?",
        answer:
          "Det finnes to måter, og forskjellen er hvem som tar opp.\n\nMed Chrome-utvidelsen tar du opp selv. Du klikker deg gjennom skjermen og kan snakke over med din egen stemme og ditt eget kamera. Bruk den til raske oppdateringer, tilbakemeldinger eller alt annet der du selv må være med.\n\nMed en AI-agent beskriver du videoen, og agenten klikker seg gjennom og tar den opp for deg, så du kan jobbe videre. Den kan legge til lysbilder og en AI-fortellerstemme. Bruk den til produktdemoer, veiledninger og feilrapporter.\n\nSlik tar du opp selv:\n1. Installer CaptureFlow-utvidelsen fra Chrome Web Store.\n2. Klikk på ikonet i nettleserens verktøylinje, og logg inn.\n3. Klikk på ikonet igjen. Velg This tab, Window eller Full screen, og slå på kamera og mikrofon hvis du vil ha dem med.\n4. Trykk på Start Recording. En linje på siden lar deg sette opptaket på pause eller stoppe det.\n5. Trykk på stopp. Siden til opptaket åpnes, med en lenke du kan dele med hvem som helst.\n\nSlik lar du en agent ta opp:\n1. Koble CaptureFlow til AI-appen du bruker. Agent-delen på forsiden har trinnene for Claude, ChatGPT, Claude Code, Codex og Cursor.\n2. Logg inn når en nettleserfane åpnes. Dette gjør du bare én gang.\n3. Be om videoen med vanlige ord, for eksempel: Ta opp en demo av hvordan man registrerer seg på nettstedet vårt, med fortellerstemme.\n4. Agenten tar den opp og gir deg en lenke du kan dele med hvem som helst.",
      },
      {
        question: "Kan jeg selvhoste CaptureFlow?",
        answer:
          "Ja. CaptureFlow har åpen kildekode under AGPL, og hele backend kjører på Cloudflare: Workers for appen og API-et, R2 for opptak og D1 for alt annet. Opprett en D1-database og en R2-bøtte, kjør migreringene, sett én hemmelighet og rull ut. Det finnes også en Deploy to Cloudflare-knapp. Veiledningen finner du på docs.captureflow.dev.",
      },
      {
        question: "Kan AI-agenten min ta opp videoer for meg?",
        answer:
          "Ja. Legg til CaptureFlow i Claude Code, Codex eller Cursor med én linje, eller legg det til i Claude eller ChatGPT, og be om en video med vanlige ord. Den tar opp en nettleser, skjermen din eller en app på din egen datamaskin, legger til lysbilder og fortellerstemme hvis du vil, og gir deg en lenke du kan dele.\n\nLokale agentopptak er inkludert i alle abonnementer. Agentopptak i skyen har en månedlig kvote som avhenger av abonnementet ditt.",
      },
      {
        question: "Hvordan fungerer prisene på betalte abonnementer?",
        answer: `${LIGHT} og ${PRO} har én pris per medlem per måned, og lavere pris ved årlig fakturering. Et medlem er en som tar opp, så du betaler bare for dem som lager opptak.\n\nNår noen blir med eller slutter, justeres antall lisenser på neste faktura.`,
      },
      {
        question: "Hvor lenge beholdes opptakene mine?",
        answer:
          "På betalte abonnementer beholdes de til du sletter dem. På gratisabonnementet fjernes et opptak etter 30 dager uten visning, så inaktive kontoer ikke opptar plass. Hvis du selvhoster, bestemmer du reglene selv.",
      },
      {
        question: "Hva inngår i gratisabonnementet?",
        answer: `Du får 25 opptak per person, opptil 5 minutter per opptak, i datasparende kvalitet, med transkripsjoner og undertekster. Opptak fjernes etter 30 dager uten visning. Registrer deg, installer Chrome-utvidelsen og begynn å ta opp.\n\n${LIGHT} fjerner grensene for én pris per medlem og beholder opptakene til du sletter dem.`,
      },
    ],
  },
  cta: {
    headline: "Start opptak",
    subtitle:
      "Gratis nedlasting. Ingen betalingskort. Si det i en kort videomelding i stedet for enda et møte.",
    button: "Prøv CaptureFlow gratis",
  },
  footer: {
    tagline: "Skjermopptak med åpen kildekode og delingslenker med én gang.",
    lights: "Lys",
    lightsOn: "På · dra i snoren",
    lightsOff: "Av · dra i snoren",
    product: {
      title: "Produkt",
      features: "Funksjoner",
      pricing: "Priser",
      compare: "Sammenlign",
      download: "Last ned",
      suggest: "Foreslå en funksjon",
    },
    resources: {
      title: "Ressurser",
      docs: "Dokumentasjon",
      selfHosting: "Selvhosting",
      blog: "Blogg",
      releases: "Utgivelser",
      faq: "FAQ",
      security: "Sikkerhet",
    },
    community: {
      title: "Fellesskap",
    },
    legal: {
      title: "Juridisk",
      privacy: "Personvernerklæring",
      terms: "Vilkår for bruk",
      refund: "Refusjonsvilkår",
      license: "Lisens (AGPL-3.0)",
    },
    rights: "© {year} CaptureFlow. Alle rettigheter forbeholdt.",
    openSource: "Åpen kildekode under AGPL-3.0",
  },
  waitlist: {
    errors: {
      joinFailed: "Kunne ikke sette deg på ventelisten. Prøv igjen.",
      network: "Nettverksfeil. Prøv igjen.",
    },
    success:
      "Du står på listen. Jeg sender deg en e-post når CaptureFlow er klart.",
    emailPlaceholder: "you@example.com",
    buttonLoading: "Melder deg på…",
    buttonDefault: "Bli med på ventelisten",
    earlyAccessPrompt: "Vil du ha tidlig tilgang?",
    earlyAccessLink: "Bli betatester",
  },
  download: {
    heading: "Last ned CaptureFlow",
    subtitle:
      "Tilgjengelig for Chrome, og en macOS-app kommer snart. Hvert opptak får en lenke du kan dele.",
    button: "Last ned for macOS",
    requires: "Krever {version} eller nyere på Apple Silicon.",
    requirements: "Krever macOS 14 eller nyere på Apple Silicon.",
    versionLabel: "Versjon {version}",
    sizeLabel: "{size} MB DMG",
    notarized: "Signert og notarisert av Apple",
  },
  downloadPage: {
    otherWays: "Andre måter å få det på",
    buildTitle: "Bygg fra kildekoden",
    buildBody: "Klon repoet og kjør opptakeren lokalt med pnpm.",
    releasesTitle: "Alle utgivelser",
    releasesBody: "Se alle publiserte bygg og endringslogger på GitHub.",
    cloud: "Foretrekker du skyen? {link} og se opptakene i nettleseren.",
    cloudLink: "Opprett en konto",
  },
  blog: {
    title: "Blogg",
    subtitle: "Tips, veiledninger og nyheter om skjermopptak.",
    readArticle: "Les artikkelen",
    empty: "Ingen innlegg ennå. Kom tilbake snart.",
  },
};

export default messages;

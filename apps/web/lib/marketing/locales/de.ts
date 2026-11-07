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
      title: "CaptureFlow - Screen Recorder mit teilbaren Links",
      description:
        "Bildschirm aufnehmen und per Link mit Team oder Kunden teilen. Open-Source-Screen-Recorder mit KI-Transkripten und annotierten Screenshots, selbst hostbar auf Cloudflare.",
    },
    features: {
      title: "Funktionen des Screen Recorders",
      description:
        "Nimm Tab, Fenster oder ganzen Bildschirm mit Kamera und Mikrofon auf, erstelle annotierte Screenshots und teile alles als Link, den dein Team kommentieren kann.",
    },
    pricing: {
      title: "Preise: kostenlos starten, ein Preis pro Mitglied",
      description: `Starte kostenlos mit ${FREE_RECORDINGS} Aufnahmen. ${LIGHT} und ${PRO} kosten einen Preis pro Mitglied, mit unbegrenzten Aufnahmen und KI. Oder hoste CaptureFlow kostenlos selbst.`,
    },
    faq: {
      title: "FAQ: Teilen, Speicher und Self-Hosting",
      description:
        "Häufige Fragen zu CaptureFlow: wie Freigabelinks funktionieren, was Self-Hosting auf Cloudflare bedeutet, Speicherlimits und wie Aufnahmen privat bleiben.",
    },
    download: {
      title: "Screen Recorder für Chrome herunterladen",
      description:
        "Installiere die Chrome-Erweiterung von CaptureFlow, um deinen Bildschirm aufzunehmen und per Link zu teilen.",
    },
    enterprise: {
      title: "Enterprise",
      description:
        "Gehostetes CaptureFlow für größere Unternehmen: Plätze für alle, individuelle Konditionen und eine einzige Rechnung. Sag uns, was du brauchst.",
    },
    selfHostSetup: {
      title: "Einrichtung für Self-Hosting",
      description:
        "Lass CaptureFlow im Cloudflare-Konto deines Unternehmens einrichten: eigene Domain, firmeninterne Anmeldung und eine private Chrome-Erweiterung für dein Team.",
    },
    swarmDemo: {
      title: "Schwarm-Demo: Agenten bauen jede Website auf Video nach",
      description:
        "Gib eine Website-Adresse ein und sieh zu, wie ein Schwarm aus Agenten-Cursorn sie Element für Element nachbaut, mit Musik. Du bekommst ein Video mit Link zum Teilen.",
    },
    chromeExtension: {
      title: "Chrome-Erweiterung: Bildschirm aufnehmen und Link teilen",
      description:
        "Nimm deinen Bildschirm, einen Tab oder deine Kamera in Chrome auf. Danach bekommst du einen Link, den jeder ansehen kann, mit Transkript, Zusammenfassung und Kapiteln.",
    },
    agentRecorder: {
      title: "MCP-Server: Dein KI-Agent nimmt Videos auf",
      description:
        "Verbinde Claude Code, Codex, Cursor oder ChatGPT über MCP mit CaptureFlow. Dein Agent nimmt eine Web-App, deinen Bildschirm oder ein Fenster auf und gibt dir einen Link zum Teilen.",
    },
  },
  nav: {
    features: "Funktionen",
    discover: "Entdecken",
    pricing: "Preise",
    faq: "FAQ",
    changelog: "Changelog",
    login: "Anmelden",
    library: "Meine Aufnahmen",
    download: "Download",
    language: "Sprache",
    openMenu: "Menü öffnen",
    menu: "Menü",
    main: "Hauptmenü",
    docs: "Doku",
    resources: "Ressourcen",
    faqDescription: "Antworten auf häufige Fragen",
    blog: "Blog",
    blogDescription: "Anleitungen und Neuigkeiten",
    selfHosting: "Self-Hosting",
    selfHostingDescription: "Betreibe es in deinem Cloudflare-Konto",
    community: "Community",
    communityDescription: "Hilfe und Austausch auf Discord",
    products: "Produkte",
    swarmDemo: "Schwarm-Demo",
    swarmDemoDescription: "Agenten bauen jede Website auf Video nach",
    extension: "Chrome-Erweiterung",
    extensionDescription: "Bildschirm aufnehmen und Link teilen",
    agentRecorder: "Recorder für Agenten",
    agentRecorderDescription: "Videos, die dein KI-Agent über MCP erstellt",
    star: "Stern auf GitHub vergeben",
    starCount: "Stern auf GitHub vergeben ({stars})",
    themeToLight: "Zum hellen Design wechseln",
    themeToDark: "Zum dunklen Design wechseln",
  },
  banner: {
    label: "Beta",
    aria: "CaptureFlow ist in der öffentlichen Beta",
    title: "Du bist früh dran 🎉",
    strip:
      "CaptureFlow ist noch in der Beta, ändert sich also oft, und hier und da kann es noch haken, bis sich alles eingespielt hat.",
    body: "CaptureFlow ist in der öffentlichen Beta. Fast jede Woche kommt etwas Neues dazu, und was sich Nutzer wünschen, wird zuerst gebaut.",
    cta: "Sag mir, was ich als Nächstes bauen soll",
    close: "Schließen",
  },
  announcement: {
    badge: "Neu",
    lead: "Dein KI-Agent kann jetzt für dich aufnehmen.",
    rest: "Einmal verbinden, ein Video anfordern und einen Link zurückbekommen.",
    cta: "Verbinden",
  },
  hero: {
    title: "Screen Recorder für\ndich und deine KI-Agenten",
    subtitle:
      "Nimm Demos, Anleitungen, Walkthroughs und Präsentationen selbst auf oder lass sie von deiner KI aufnehmen. Teile jede Aufnahme als Link, den jeder ansehen kann.",
    ctaLabel: "CaptureFlow kostenlos testen",
    installChrome: "Chrome-Erweiterung installieren",
    installMac: "Für macOS herunterladen",
    installSoon: "Bald",
    connectMcp: "Mit MCP verbinden",
    macSoon: "macOS-App kommt bald",
    installOr: "oder",
    mcpCopy: "Kopieren",
    mcpCopied: "Kopiert",
    mcpAddToCursor: "Zu Cursor hinzufügen",
    badge: "Open Source und kostenlos zu betreiben, auf {github}",
    noCreditCard: "Keine Kreditkarte erforderlich",
    teaser: {
      title: "Selbst hostbar",
      body: "Betreibe es in deinem eigenen Cloudflare-Konto.",
      cta: "CaptureFlow testen",
    },
    demo: {
      prevAria: "Vorherige Demo",
      nextAria: "Nächste Demo",
      dotAria: "Demo {n} von {total} anzeigen",
    },
  },
  highlights: {
    heading: "Alle Funktionen",
    subtitle: "Aufnehmen, bearbeiten und teilen. Alles an einem Ort.",
    items: {
      recording: {
        title: "Bildschirm und Kamera",
        body: "Beides gleichzeitig aufnehmen",
      },
      transcripts: { title: "Transkripte", body: "In 99 Sprachen", tag: "KI" },
      editing: {
        title: "Bearbeiten per Transkript",
        body: "Text löschen, Video schneiden",
        tag: "KI",
      },
      camera: {
        title: "Kameraeffekte",
        body: "Hintergründe und Filter",
      },
      canvas: {
        title: "Unendliche Leinwand",
        body: "Beim Aufnehmen skizzieren",
      },
      screenshots: {
        title: "Annotierte Screenshots",
        body: "Pfeile, Text und Unschärfe",
      },
      feedback: {
        title: "Kommentare und Reaktionen",
        body: "Feedback direkt am Video",
      },
      summary: {
        title: "Zusammenfassungen und Kapitel",
        body: "Mit einem Titel für jedes Video",
        tag: "KI",
      },
      filler: {
        title: "Füllwörter automatisch entfernen",
        body: "Schneidet Ähs und Ähms heraus",
        tag: "KI",
      },
    },
    cta: "Alle Funktionen ansehen",
    previews: {
      app: "Launch-Plan",
      columns: ["Offen", "In Arbeit", "Fertig"],
      lines: [
        "Hier ist der neue Ablauf.",
        "Wähle zuerst einen Workspace.",
        "Teile dann den Link.",
      ],
      retake: "Äh, ich fange noch mal an.",
      filler: [
        "[Äh,] hier ist der neue Ablauf.",
        "Wähle zuerst, [ähm,] einen Workspace.",
        "Teile dann, [äh,] den Link.",
      ],
      step: "Schritt 1",
      note: "Das verschieben",
      comment: "Toller Ablauf",
      summaryTitle: "So lädst du dein Team ein",
      summaryBody: "Workspace wählen, dann den Link teilen.",
      chapters: ["Einstieg", "Workspace wählen"],
    },
  },
  mcpFeatures: {
    heading: "MCP-Funktionen",
    subtitle:
      "Das kann dein KI-Agent, sobald er verbunden ist. Er nimmt auf deinem eigenen Computer auf, mit Claude Code, Codex, Cursor oder jedem anderen MCP-Client.",
    cta: "Anleitung lesen",
    items: {
      webApp: { title: "Web-App aufnehmen", body: "Auch auf localhost" },
      screen: { title: "Bildschirm aufnehmen", body: "Ein ganzer Monitor" },
      window: {
        title: "Ein Fenster aufnehmen",
        body: "Terminal, VS Code oder Figma",
      },
      slides: {
        title: "Folien hinzufügen",
        body: "Titel, Schritte und Schlusssätze",
      },
      voiceover: {
        title: "Voiceover hinzufügen",
        body: "Läuft auf deinem Computer",
      },
      report: {
        title: "Bericht schreiben",
        body: "Was er getan hat und was fehlschlug",
      },
      search: {
        title: "Aufnahmen durchsuchen",
        body: "Videos und Transkripte",
      },
      save: {
        title: "MP4-Dateien speichern",
        body: "Ohne Upload oder Anmeldung",
      },
    },
  },
  useCases: {
    heading: "So nutzen es Teams",
    subtitle:
      "Beispiele dafür, was Teams aufnehmen. Jedes Video ist ein Link, der in jedem Browser abgespielt wird.",
    cta: "So funktioniert es",
    cards: {
      engineering: {
        title: "Entwicklung",
        body: "Nimm auf, wie du einen PR durchgehst oder einen Bug reproduzierst.",
      },
      design: {
        title: "Design",
        body: "Nimm auf, wie du ein Mockup durchgehst, und sammle Kommentare.",
      },
      support: {
        title: "Kundensupport",
        body: "Beantworte ein Ticket mit einem kurzen Erklärvideo.",
      },
      updates: {
        title: "Team-Updates",
        body: "Nimm das Wochenupdate auf und teile den Link.",
      },
    },
    engineeringFile: "checkout.ts",
    engineeringPr: "PR #482",
    designApp: "trip-app",
    designBadge: "Checkout v3",
    designCardTitle: "Plane deine Reise",
    designColors: "Farben",
    designComment: "Größerer CTA?",
    supportQuestion: "Wie lade ich mein Team in den Workspace ein?",
    supportReply: "Hier ist ein kurzes Erklärvideo:",
    supportLink: "captureflow.dev/r/8kx2pnq4",
    updatesTitle: "Wochenupdate",
    updatesRange: "6.–10. Okt.",
    updatesSignups: "Registrierungen",
    updatesShipped: "Veröffentlicht",
    updatesFeatures: "Funktionen",
  },
  agents: {
    heading:
      "Oder lass deinen KI-Agenten deine Demos und Anleitungen aufnehmen",
    worksWith: "Funktioniert mit {claude}, {openai} und {cursor}.",
    cta: "Anleitung lesen",
    subtitle:
      "Beschreib es in einfachen Worten. Er nimmt einen Browser, deinen Bildschirm oder eine App auf deinem eigenen Computer auf, fügt auf Wunsch Folien und ein Voiceover hinzu und gibt dir einen Link.",
    steps: [
      {
        title: "Agenten verbinden",
        body: "Füge CaptureFlow mit einer Zeile zu Claude Code, Codex oder Cursor hinzu. Du brauchst Node.js 20 oder neuer, und dein Agent meldet sich einmal an. In Claude oder ChatGPT fügst du es per URL hinzu.",
      },
      {
        title: "Video anfordern",
        body: "Eine Feature-Demo, eine Anleitung, ein Bug-Report oder eine vertonte Präsentation.",
      },
      {
        title: "Er nimmt für dich auf",
        body: "Auf deinem Computer, auch eine App auf localhost.",
      },
      {
        title: "Fügt Folien und eine Stimme hinzu",
        body: "Titelfolien und ein Voiceover, wenn du möchtest.",
      },
      {
        title: "Gibt dir einen Link zum Teilen",
        body: "Häng ihn an einen Pull Request, poste ihn in Slack oder schick ihn an einen Kunden.",
      },
    ],
    scenes: {
      ask: {
        name: "Terminal",
        badge: "Agent",
        prompt: "Nimm eine Checkout-Demo auf",
        steps: [
          "App wird geöffnet",
          "Klickt sich durch",
          "Dein Link ist fertig",
        ],
      },
      record: {
        url: "localhost:3000",
        badge: "Demo",
        title: "Checkout",
        fields: ["Dein Name", "Kartennummer"],
        pay: "Jetzt bezahlen",
        paid: "Bezahlt",
      },
      voice: {
        title: "Checkout-Demo",
        subtitle: "So bezahlst du in drei Schritten",
      },
      share: {
        title: "Checkout-Demo",
        link: "captureflow.dev/r/checkout",
        places: ["PR", "Slack", "E-Mail"],
      },
    },
    chats: {
      claude:
        "Öffne in Claude „Customize“, dann „Connectors“, und wähle „Add custom connector“. Nenne ihn CaptureFlow, füge diese URL ein und melde dich an.",
      chatgpt:
        "Öffne in ChatGPT im Web „Plugins“, drücke + und wähle „Add custom MCP server“. Nenne ihn CaptureFlow, füge diese URL ein, wähle OAuth, installiere dann das Plugin und melde dich an. Erfordert einen Business-, Enterprise- oder Edu-Tarif.",
      limits:
        "Chats erstellen Präsentations- und Anleitungsvideos aus Folien auf unseren Servern, keine Aufnahmen deines Computers, und verbrauchen die Cloud-Agentenminuten deines Tarifs.",
    },
  },
  modes: {
    cta: "Aufnahme starten",
    heading: "Nimm deinen Bildschirm mit der Chrome-Erweiterung auf",
    subtitle:
      "Installiere sie und drücke auf Aufnehmen. Wenn du fertig bist, bekommst du einen Link, den jeder ansehen kann, mit Titel, Zusammenfassung, Kapiteln und Transkript.",
    scene: {
      timer: "0:42",
      heading: "So läuft eine Rückerstattung ab",
      steps: ["Anfragen", "Genehmigen", "Auszahlen"],
      captions: [
        "Kurz erklärt, wie eine Rückerstattung abläuft.",
        "Zuerst stellt der Kunde eine Anfrage.",
        "Der Support genehmigt sie noch am selben Tag.",
        "Dann wird das Geld automatisch ausgezahlt.",
      ],
    },
  },
  pageHeroes: {
    home: "Startseite",
    features: {
      label: "Funktionen",
      word: "FUNKTIONEN",
      title: "Bildschirm aufnehmen, bearbeiten und teilen",
      subtitle:
        "Nimm Bildschirm und Kamera auf. Teile jede Aufnahme als Link, den dein Team kommentieren kann.",
    },
    pricing: {
      label: "Preise",
      word: "PREISE",
      title: "Kostenlos starten. Ein Preis pro Mitglied.",
      subtitle:
        "Der kostenlose Tarif deckt deine ersten 25 Aufnahmen ab. Light und Pro heben das Limit auf. Du kannst CaptureFlow auch kostenlos selbst hosten.",
    },
    faq: {
      label: "FAQ",
      word: "FAQ",
      title: "Häufig gestellte Fragen",
      subtitle:
        "Antworten zu Aufnahme, Preisen, Speicher und Self-Hosting. Alles Weitere steht in der Dokumentation.",
    },
    chromeExtension: {
      label: "Chrome-Erweiterung",
      word: "CHROME",
      title: "Bildschirm aufnehmen in Chrome",
      subtitle:
        "Nimm deinen Bildschirm, einen Tab oder deine Kamera auf. Danach bekommst du einen Link, den jeder ansehen kann, mit Transkript, Zusammenfassung und Kapiteln.",
    },
    agentRecorder: {
      label: "Recorder für Agenten",
      word: "MCP",
      title: "Lass deinen KI-Agenten deine Videos aufnehmen",
      subtitle:
        "Verbinde ihn über MCP und bitte ihn in einfachen Worten. Er nimmt eine Web-App, deinen Bildschirm oder ein Fenster auf, fügt auf Wunsch Folien und eine Stimme hinzu und gibt dir einen Link.",
    },
  },
  collaboration: {
    heading: "Was du nach der Aufnahme tun kannst",
    cta: "Kostenlos testen",
    subtitle:
      "Bearbeite die Aufnahme, dann teile sie oder bette sie ein. Lade dein Team ein, die Videos der anderen anzusehen, darauf zu reagieren und sie zu kommentieren.",
    categories: {
      share: {
        feature: {
          tag: "neu",
          title: "Video bearbeiten",
          cta: "Erweiterung installieren",
          body: "Lösche Wörter aus dem Transkript, um sie aus dem Video zu schneiden, oder kürze Clips auf der Timeline. Ändere den Hintergrund, verschiebe, skaliere oder verberge deine Kamera und schalte Mikrofon oder Systemton stumm.",
        },
        scene: {
          app: "Launch-Plan",
          nav: ["Übersicht", "Roadmap", "Aufgaben", "Doku"],
          columns: [
            {
              name: "Offen",
              tasks: ["Texte für Preisseite", "Onboarding-E-Mail"],
            },
            {
              name: "In Arbeit",
              tasks: ["Checkout-Redesign", "Team-Einladungen"],
            },
            { name: "Fertig", tasks: ["Beta-Anmeldeformular"] },
          ],
          background: "Hintergrund",
          camera: "Kamera",
          shapes: ["Kreis", "Quadrat"],
          fillers: "Füllwörter",
          remove: "Entfernen",
          transcript: {
            before: "Klick hier, um",
            fillers: ["äh,", "warte,", "sorry,"],
            after: "den Link zu teilen.",
          },
          saved: "Gespeichert · gleicher Link",
        },
      },
      embed: {
        feature: {
          title: "Video teilen oder einbetten",
          cta: "Erweiterung installieren",
          body: "Füge den Link in Slack, GitHub, Notion oder eine E-Mail ein, und es erscheint eine Vorschau. Du kannst den Player auch in deine Dokumentation oder Website einbetten. Mit installierter Erweiterung wird das Video direkt in GitHub-Issues und Pull Requests abgespielt.",
        },
        scene: {
          question:
            "Kannst du mir zeigen, wie ich mein Team in den Workspace einlade?",
          reply: "Klar! Hier ist ein kurzes Video mit den Schritten:",
          url: "captureflow.dev/r/8kx2pnq4",
          app: "Einstellungen",
          nav: ["Allgemein", "Mitglieder", "Abrechnung"],
          members: "Mitglieder",
          invite: "Einladen",
          people: [
            { initials: "AR", name: "Alex Rivera", role: "Inhaber" },
            { initials: "CK", name: "Chris Kim", role: "Mitglied" },
            { initials: "JB", name: "Jordan Bell", role: "Mitglied" },
          ],
          duration: "0:48",
        },
      },
      feedback: {
        feature: {
          title: "Gemeinsam an Videos arbeiten",
          cta: "Anmelden",
          body: "Arbeite mit deinem Team zusammen, ohne Meeting und über Zeitzonen hinweg. Dein Team kann mit Emojis reagieren, an jeder Stelle im Video kommentieren und mit Transkripten und Untertiteln folgen.",
        },
        scene: {
          title: "Launch-Plan kurz erklärt",
          author: "Alex",
          age: "gerade eben",
          duration: "1:12",
          activity: "Aktivität",
          events: [
            { initials: "CK", name: "Chris", at: "0:09", emoji: "👍" },
            { initials: "JB", name: "Jordan", at: "0:17", emoji: "🔥" },
            {
              initials: "MC",
              name: "Maya",
              at: "0:27",
              text: "Die neue Board-Ansicht ist super",
            },
            { initials: "SL", name: "Sam", at: "0:37", emoji: "❤️" },
            {
              initials: "JB",
              name: "Jordan",
              at: "0:48",
              text: "Können wir das am Freitag ausliefern?",
            },
            {
              initials: "AR",
              name: "Alex",
              at: "0:56",
              text: "Ja, direkt nach der QA ✅",
            },
            { initials: "MC", name: "Maya", at: "1:05", emoji: "👏" },
          ],
        },
      },
      workspaces: {
        feature: {
          title: "Lade dein Team in einen Workspace ein",
          cta: "Workspace erstellen",
          body: "Die Aufnahmen aller liegen in einem Workspace. Jedes Video kann öffentlich, für den Workspace sichtbar oder privat sein.",
        },
        scene: {
          team: "CaptureFlow-Team",
          members: ["1 Mitglied", "2 Mitglieder", "3 Mitglieder"],
          memberInitials: ["AR", "CK", "JB"],
          invitePlaceholder: "Per E-Mail einladen",
          inviteEmail: "chris@acme.co, jordan@acme.co",
          invite: "Einladen",
          invited: "Gesendet",
          joined: "Chris und Jordan sind dabei 🎉",
          whoCanWatch: "Wer darf ansehen:",
          visibility: [
            { label: "Öffentlich", detail: "Jeder mit dem Link" },
            { label: "Workspace", detail: "Nur dein Team" },
            { label: "Privat", detail: "Nur du" },
          ],
        },
      },
    },
  },
  setupService: {
    title: "Wir übernehmen die Einrichtung",
    titleHighlight: "für dich",
    subtitle:
      "Erzähl uns von deinem Unternehmen. Wir richten die App, die Chrome-Erweiterung, die macOS-App und die gesamte Infrastruktur dahinter ein, sodass dein Team direkt loslegen kann.",
    includedHeading: "Alles, was wir einrichten",
    included: {
      infra: {
        title: "Die App auf deiner Infrastruktur",
        body: "Bereitgestellt in deinem eigenen Cloudflare-Konto und erreichbar unter deiner Domain. Alles gehört dir.",
      },
      storage: {
        title: "Speicher und Datenbank",
        body: "Aufnahmen in deinem eigenen R2-Bucket; Workspaces und Kommentare in deiner eigenen Datenbank.",
      },
      signin: {
        title: "Anmeldung nur für dein Unternehmen",
        body: "Anmeldung mit Google Workspace oder GitHub, beschränkt auf die E-Mail-Domain deines Unternehmens.",
      },
      apps: {
        title: "Chrome-Erweiterung und Mac-App",
        body: "Beide werden für deine Instanz gebaut, die Erweiterung wird privat für dein Team veröffentlicht.",
      },
      ready: {
        title: "Bereit zum Aufnehmen",
        body: "Workspaces sind angelegt und dein Team ist eingeladen, sodass alle sofort teilen können.",
      },
      handover: {
        title: "Übergabe",
        body: "Wir zeigen der Person, die es betreut, wie Betrieb und Updates funktionieren.",
      },
    },
    nextHeading: "Schreib uns",
    nextSubheading: "Sag uns, was du brauchst, und wir melden uns bei dir.",
    form: {
      company: "Unternehmen",
      companyPlaceholder: "Acme GmbH",
      name: "Dein Name",
      namePlaceholder: "Jane Doe",
      email: "Geschäftliche E-Mail",
      emailPlaceholder: "jane@acme.com",
      topic: "Wobei können wir helfen?",
      topics: [
        "Einrichtung für Self-Hosting",
        "Mehr als 1 TB",
        "Etwas anderes",
      ],
      teamSize: "Teamgröße",
      teamSizes: ["1–10", "11–50", "51–200", "200+"],
      cloudflare: "Hast du ein Cloudflare-Konto?",
      cloudflareOptions: ["Ja", "Nein", "Nicht sicher"],
      notes: "Sollten wir sonst noch etwas wissen?",
      notesPlaceholder: "Deine Teamgröße, deine Domain, dein Zeitplan …",
      submit: "Nachricht senden",
      error:
        "Deine Anfrage konnte nicht gesendet werden. Bitte versuch es noch einmal oder schreib uns an {email}.",
      sentTitle: "Nachricht gesendet",
      sentBody: "Danke. Wir melden uns unter {email} bei dir.",
      back: "Zur Startseite",
    },
  },
  swarmDemo: {
    title: "Sieh zu, wie ein Schwarm von Agenten",
    titleHighlight: "jede Website nachbauen",
    subtitle:
      "Gib eine Website-Adresse ein. Ein Schwarm aus Agenten-Cursorn zeichnet sie Element für Element nach, mit Musik, und du bekommst einen Videolink zum Teilen.",
    url: "Website-Adresse",
    urlPlaceholder: "https://example.com",
    generate: "Demo erstellen",
    generating: "Cloud-Browser wird gestartet…",
    check: "Website prüfen",
    checking: "Website wird geprüft…",
    previewNote:
      "Diese Seite bauen die Agenten nach. Erstelle die Demo, wenn sie passt.",
    change: "Adresse ändern",
    note: "Melde dich an, um kostenlos eine Demo zu erstellen. Jede Demo landet in deiner Bibliothek.",
    noteSignedIn: "Kostenlos erstellen. Jede Demo landet in deiner Bibliothek.",
    howHeading: "So funktioniert es",
    how: {
      type: {
        title: "Adresse eingeben",
        body: "Jede öffentliche Website. Die Seite wird in einem Cloud-Browser geladen, und jede Überschrift, jedes Bild, jeder Button und jede Karte wird erkannt.",
      },
      build: {
        title: "Agenten bauen sie nach",
        body: "Die Anfrage wird in ein Chatfeld getippt, dann setzt ein Schwarm aus Cursorn jedes Element an seinen Platz, während die Musik schneller wird.",
      },
      share: {
        title: "Link erhalten",
        body: "Das Video erscheint in deiner Bibliothek, sobald es fertig ist. Teile den Link, lade die Datei herunter oder poste sie.",
      },
    },
    errors: {
      invalidUrl: "Gib eine Website-Adresse wie example.com ein.",
      unreachable:
        "Diese Website ist nicht erreichbar. Prüfe die Adresse und versuch es erneut.",
      unavailable: "Auf diesem Server sind keine Demos verfügbar.",
      running:
        "Eine deiner Aufnahmen läuft noch. Warte, bis sie fertig ist, und versuch es dann erneut.",
      limit:
        "Dieser Workspace hat seine Cloud-Agentenminuten für diesen Monat aufgebraucht. Sie werden am 1. zurückgesetzt.",
      recordings:
        "Du hast das Aufnahmelimit des Free-Plans erreicht. Lösche eine Aufnahme oder führe ein Upgrade durch und versuche es dann erneut.",
      busy: "Alle Cloud-Browser sind gerade belegt. Versuch es in ein paar Minuten erneut.",
      failed:
        "Die Demo konnte nicht gestartet werden. Bitte versuch es erneut.",
    },
  },
  enterprise: {
    title: "CaptureFlow für",
    titleHighlight: "dein Unternehmen",
    subtitle:
      "Der gehostete Tarif für Unternehmen, die Plätze für alle möchten, zu einmal vereinbarten Konditionen und mit einer einzigen Rechnung.",
    includedHeading: "Das bietet Enterprise zusätzlich",
    included: {
      storage: {
        title: "Speicher nach deinem Bedarf",
        body: "Ein Kontingent, das sich danach richtet, wie viel dein Unternehmen aufnimmt, nicht nach einem Volumen pro Platz.",
      },
      seats: {
        title: "Plätze für alle",
        body: "Eine Vereinbarung gilt für das ganze Unternehmen, egal wie viele Personen aufnehmen.",
      },
      roadmap: {
        title: "Deine Wünsche zuerst",
        body: "Funktionen, die sich dein Team wünscht, rücken an die Spitze unserer Liste.",
      },
      managed: {
        title: "Vollständig von uns betrieben",
        body: "Wir hosten es und liefern Updates aus, du musst also nichts selbst betreiben.",
      },
      billing: {
        title: "Jährliche Abrechnung",
        body: "Zahle einmal im Jahr, zu einem für dein Unternehmen vereinbarten Preis.",
      },
      support: {
        title: "Ein direkter Draht zu uns",
        body: "Fragen gehen direkt an die Menschen, die CaptureFlow entwickeln.",
      },
    },
    everythingHeading: "Alles, was dein Team bekommt",
    comingSoon: "Demnächst",
    everything: {
      extension: {
        title: "Chrome-Erweiterung",
        body: "Nimm einen beliebigen Tab oder Bildschirm auf, der Link ist fertig, sobald du stoppst.",
      },
      mac: {
        title: "Mac-App",
        body: "Ein nativer Recorder für macOS, mit denselben sofort verfügbaren Freigabelinks.",
      },
      workspaces: {
        title: "Team-Workspaces",
        body: "Die Aufnahmen aller an einem Ort, geteilt oder privat.",
      },
      feedback: {
        title: "Kommentare und Reaktionen",
        body: "Zuschauer antworten direkt auf der Timeline, genau an der Stelle, die sie meinen.",
      },
      edit: {
        title: "Nach dem Teilen bearbeiten",
        body: "Ändere Hintergrund, Kamera oder Ton, und der Link bleibt derselbe.",
      },
      screenshots: {
        title: "Annotierte Screenshots",
        body: "Markiere einen Screenshot mit Pfeilen, Text und Unschärfe und teile ihn als Link.",
      },
    },
    formHeading: "Schreib uns",
    formSubheading: "Erzähl uns von deinem Team, und wir antworten per E-Mail.",
    form: {
      company: "Unternehmen",
      companyPlaceholder: "Acme GmbH",
      name: "Dein Name",
      namePlaceholder: "Jane Doe",
      email: "Geschäftliche E-Mail",
      emailPlaceholder: "jane@acme.com",
      need: "Was brauchst du?",
      needs: [
        "Plätze für ein großes Team",
        "Individuelle Konditionen oder eine einzige Rechnung",
        "Etwas anderes",
      ],
      teamSize: "Teamgröße",
      teamSizes: ["1–10", "11–50", "51–200", "200+"],
      storage: "Wie viel Speicher?",
      storageOptions: ["1–5 TB", "5–20 TB", "20 TB+", "Nicht sicher"],
      notes: "Sollten wir sonst noch etwas wissen?",
      notesPlaceholder:
        "Wie viel dein Team aufnimmt, dein Zeitplan, Anforderungen an die Abrechnung …",
      submit: "Nachricht senden",
      error:
        "Deine Nachricht konnte nicht gesendet werden. Bitte versuch es noch einmal oder schreib uns an {email}.",
      sentTitle: "Nachricht gesendet",
      sentBody: "Danke. Wir melden uns unter {email} bei dir.",
      back: "Zur Startseite",
    },
  },
  pricing: {
    heading: "Preise",
    cta: "Alle Tarife vergleichen",
    subheading:
      "Der kostenlose Tarif deckt deine ersten Aufnahmen ab. Bezahlte Tarife kosten einen Preis pro Mitglied.",
    controls: {
      shownIn:
        "Preise werden in {currency} angezeigt. Abgerechnet wird in US-Dollar.",
      teamSize: "Teamgröße",
      members: "Mitglieder",
      title: "Abrechnung",
      note: "Ein Preis pro Mitglied.",
      billing: "Zahlweise",
      monthly: "Monatlich",
      annually: "Jährlich",
      save: "{percent} % sparen",
    },
    compare: {
      loomRow: "Loom {plan}",
      loomDetail: "{seats} Personen × je {perSeat}",
      caption: "Monatspreise.",
      captureflowRow: "CaptureFlow {ourPlan}",
      captureflowDetail: "{seats} Mitglieder × je {ourPerSeat}",
      saveLabel: "Dein Team spart",
      saveValue: "{savings} pro Jahr",
    },
    plans: {
      chargedInUsd: "Abgerechnet in US-Dollar.",
      member: "Mitglied",
      members: "Mitglieder",
      included: "Enthalten",
      notIncluded: "Nicht enthalten",
      free: {
        name: "Kostenlos",
        description: "Bildschirmaufnahmen, die du als Link teilst.",
        cta: "Registrieren",
      },
      light: {
        name: LIGHT,
        featuresHeading: "Alles aus Kostenlos, plus",
        features: [
          "Unbegrenzte Aufnahmen",
          "Unbegrenzte Aufnahmedauer",
          `${LIGHT_AGENT_MIN} Min. pro Monat für Cloud-Agentenaufnahmen, je bis zu 10 Min.`,
        ],
        description: "Unbegrenzte Aufnahmen im Datensparmodus.",
        period: "/Monat",
        noteMonthly: "Pro Mitglied, monatliche Abrechnung",
        noteAnnual:
          "Pro Mitglied, jährliche Abrechnung. {yearly} pro Jahr für {seats} {members}",
        cta: "Kostenlos testen",
      },
      pro: {
        badge: "Empfohlen",
        name: PRO,
        featuresHeading: `Alles aus ${LIGHT}, plus`,
        features: [
          "Volle Qualität, bis zu 1080p",
          "KI-Kapitel, KI-Titel und Entfernen von Füllwörtern",
          "Eigenes Branding",
          `${PRO_AGENT_MIN} Min. pro Monat für Cloud-Agentenaufnahmen, mit ${PRO_VOICEOVER_MIN} Min. KI-Voiceover`,
          "Zuschauer-Statistiken (demnächst)",
          "Integrationen für Slack, Notion und Zapier (demnächst)",
        ],
        description:
          "Volle Qualität, KI-Bereinigung und dein eigenes Branding.",
        period: "/Monat",
        noteMonthly: "Pro Mitglied, monatliche Abrechnung",
        noteAnnual:
          "Pro Mitglied, jährliche Abrechnung. {yearly} pro Jahr für {seats} {members}",
        cta: "Kostenlos testen",
      },
      rows: {
        recordings: {
          label: "Aufnahmen pro Person",
          free: "Bis zu {recordings}",
          light: "Unbegrenzt",
          pro: "Unbegrenzt",
        },
        length: {
          label: "Aufnahmedauer",
          free: "{minutes} Min. pro Video",
          light: "Unbegrenzt",
          pro: "Unbegrenzt",
        },
        quality: {
          label: "Videoqualität",
          free: "Datensparmodus",
          light: "Datensparmodus",
          pro: "Bis zu 1080p",
        },
        transcripts: {
          label: "Transkripte und Untertitel",
          free: true,
          light: true,
          pro: true,
        },
        editing: {
          label: "Bearbeiten per Transkript",
          free: true,
          light: true,
          pro: true,
        },
        chapters: {
          label: "KI-Kapitel und KI-Titel",
          free: false,
          light: false,
          pro: true,
        },
        filler: {
          label: "Füllwörter entfernen",
          free: false,
          light: false,
          pro: true,
        },
        feedback: {
          label: "Kommentare und Reaktionen",
          free: true,
          light: true,
          pro: true,
        },
        agents: {
          label: "Lokale Agentenaufnahmen",
          free: true,
          light: true,
          pro: true,
        },
        cloudAgents: {
          label: "Cloud-Agentenaufnahmen",
          free: `${FREE_AGENT_MIN} Min. pro Monat`,
          light: `${LIGHT_AGENT_MIN} Min. pro Monat`,
          pro: `${PRO_AGENT_MIN} Min. pro Monat`,
        },
        voiceover: {
          label: "Lokales KI-Voiceover",
          free: true,
          light: true,
          pro: true,
        },
        cloudVoiceover: {
          label: "KI-Voiceover in der Cloud",
          free: false,
          light: false,
          pro: `${PRO_VOICEOVER_MIN} Min. pro Monat`,
        },
        branding: {
          label: "Eigenes Branding",
          free: false,
          light: false,
          pro: true,
        },
      },
    },
    table: {
      heading: "Alle Funktionen, Tarif für Tarif",
      subtitle: "Kostenlos, Light und Pro im direkten Vergleich.",
      groups: [
        {
          title: "Aufnahme",
          rows: [
            {
              label: "Mitglieder",
              free: "Unbegrenzt",
              light: "Unbegrenzt",
              pro: "Unbegrenzt",
            },
            {
              label: "Aufnahmen pro Person",
              free: "Bis zu {recordings}",
              light: "Unbegrenzt",
              pro: "Unbegrenzt",
            },
            {
              label: "Aufnahmedauer",
              free: "{minutes} Min. pro Video",
              light: "Unbegrenzt",
              pro: "Unbegrenzt",
            },
            {
              label: "Videoqualität",
              free: "Datensparmodus",
              light: "Datensparmodus",
              pro: "Bis zu 1080p",
            },
            {
              label: "Screenshots",
              free: "Unbegrenzt",
              light: "Unbegrenzt",
              pro: "Unbegrenzt",
            },
            {
              label: "Aufbewahrung der Aufnahmen",
              free: "30 Tage ohne Aufruf",
              light: "Bis du sie löschst",
              pro: "Bis du sie löschst",
            },
            {
              label: "Ganzer Bildschirm, Fenster oder Tab",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Kamerablase und Kameraeffekte",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Mikrofon und Systemaudio",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Geglätteter Mauszeiger",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Chrome-Erweiterung und Mac-App",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "KI",
          rows: [
            {
              label: "Transkripte",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Untertitel",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Kapitel mit Zusammenfassung",
              free: false,
              light: false,
              pro: true,
            },
            {
              label: "Automatische Titelvorschläge",
              free: false,
              light: false,
              pro: true,
            },
            {
              label: "Video per Transkript bearbeiten",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Füllwörter entfernen",
              free: false,
              light: false,
              pro: true,
            },
          ],
        },
        {
          title: "Agenten",
          rows: [
            {
              label: "Agentenaufnahmen auf deinem Computer",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Agentenpräsentationen aus der Cloud",
              free: `${FREE_AGENT_MIN} Min. pro Monat und Person`,
              light: `${LIGHT_AGENT_MIN} Min. pro Monat und Mitglied`,
              pro: `${PRO_AGENT_MIN} Min. pro Monat und Mitglied`,
            },
            {
              label: "Folien in Agentenaufnahmen",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "KI-Voiceover auf deinem Computer",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "KI-Voiceover in Cloud-Präsentationen",
              free: false,
              light: false,
              pro: `${PRO_VOICEOVER_MIN} Min. pro Monat und Mitglied`,
            },
          ],
        },
        {
          title: "Bearbeitung",
          rows: [
            {
              label: "Nach dem Teilen bearbeiten, gleicher Link",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Hintergründe",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Kamerablase verschieben oder skalieren",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Teile des Videos herausschneiden",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Annotierte Screenshots mit Pfeilen, Text und Unschärfe",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Unendliche Leinwand",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "Teilen und Feedback",
          rows: [
            {
              label: "Freigabelink fertig, sobald du stoppst",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Öffentliche, Workspace- oder private Links",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Zugriff auf eingeschränkte Links anfragen",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Linkvorschau in Chat und E-Mail",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Player überall einbetten",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Wiedergabe in GitHub-Issues und Pull Requests",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Kommentare auf der Timeline",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Emoji-Reaktionen",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Aufrufzahlen",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Originaldatei herunterladen",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "Workspace und Verwaltung",
          rows: [
            {
              label: "Team-Workspace",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Rollen: Inhaber, Mitglied und Betrachter",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Standard-Sichtbarkeit und Upload-Rechte",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Suche in Aufnahmen und Screenshots",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Eigenes Branding",
              free: false,
              light: false,
              pro: true,
            },
          ],
        },
        {
          title: "Hosting und Support",
          rows: [
            {
              label: "Open Source unter der AGPL",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Self-Hosting in deinem eigenen Cloudflare-Konto",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Hosting und Updates durch uns",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
      ],
    },
    includes: {
      heading: "In jedem Tarif enthalten",
      items: [
        "Eigener Workspace, in den du jeden einladen kannst",
        "Kameraeffekte",
        "KI-Transkripte & Untertitel",
        "Video per Transkript bearbeiten",
        "Öffentliche, Workspace- oder private Freigabelinks",
        "Kommentare & Emoji-Reaktionen",
        "Annotierte Screenshots",
        "Unendliche Leinwand",
      ],
    },
    annual: {
      badgePro: "Gehostet",
      badgeCycle: "Jährlich",
      title: "Von uns gehostet",
      subtitle: "Vollständig gehostet, jährliche Abrechnung.",
      period: "/Monat",
      note: "Abrechnung: {amount}/Jahr. Jederzeit kündbar.",
      cta: "Loslegen",
    },
  },
  activity: {
    heading: "Neueste Änderungen auf GitHub",
    subtitle:
      "Jede Änderung ist öffentlich. Das sind die neuesten Pull Requests und offenen Issues auf GitHub.",
    cta: "Auf GitHub ansehen",
    shippedHeading: "Kürzlich gemergt",
    openHeading: "Offene Issues und Pull Requests",
    emptyOpen: "Gerade ist nichts offen.",
    newIssue: "Bug melden oder Funktion vorschlagen",
    viewAll: "Alles auf GitHub ansehen",
  },
  faq: {
    heading: "Häufig gestellte Fragen",
    subtitle:
      "Antworten zu Aufnahme, Preisen, Speicher und Self-Hosting. Alles Weitere steht in der Dokumentation.",
    cta: "Zur Dokumentation",
    waitlistLink: "Auf die Warteliste setzen",
    items: [
      {
        question: "Wie erstelle ich eine Aufnahme?",
        answer:
          "Es gibt zwei Wege, und der Unterschied ist, wer aufnimmt.\n\nMit der Chrome-Erweiterung nimmst du selbst auf. Du klickst dich durch deinen Bildschirm und kannst mit deiner eigenen Stimme und Kamera dazu sprechen. Nutze sie für kurze Updates, Feedback oder alles, bei dem du selbst dabei sein musst.\n\nMit einem KI-Agenten beschreibst du das Video, und der Agent klickt sich durch und nimmt es für dich auf, sodass du weiterarbeiten kannst. Er kann Folien und ein KI-Voiceover hinzufügen. Nutze ihn für Produktdemos, Anleitungen und Bug-Reports.\n\nSo nimmst du selbst auf:\n1. Installiere die CaptureFlow-Erweiterung aus dem Chrome Web Store.\n2. Klick auf ihr Symbol in der Symbolleiste deines Browsers und melde dich an.\n3. Klick noch einmal auf das Symbol. Wähle „This tab“, „Window“ oder „Full screen“ und schalte Kamera und Mikrofon ein, wenn du sie möchtest.\n4. Drücke „Start Recording“. Über eine Leiste auf der Seite kannst du pausieren oder stoppen.\n5. Drücke auf Stopp. Die Seite deiner Aufnahme öffnet sich, mit einem Link, den du mit jedem teilen kannst.\n\nSo lässt du einen Agenten aufnehmen:\n1. Verbinde CaptureFlow mit der KI-App, die du nutzt. Im Abschnitt „Agenten“ auf der Startseite stehen die Schritte für Claude, ChatGPT, Claude Code, Codex und Cursor.\n2. Melde dich an, wenn sich ein Browser-Tab öffnet. Das machst du nur einmal.\n3. Beschreib das Video in einfachen Worten, zum Beispiel: Nimm eine Demo auf, die zeigt, wie man sich auf unserer Website registriert, mit Voiceover.\n4. Der Agent nimmt es auf und gibt dir einen Link, den du mit jedem teilen kannst.",
      },
      {
        question: "Kann ich CaptureFlow selbst hosten?",
        answer:
          "Ja. CaptureFlow ist Open Source unter der AGPL, und das gesamte Backend läuft auf Cloudflare: Workers für App und API, R2 für Aufnahmen und D1 für alles andere. Lege eine D1-Datenbank und einen R2-Bucket an, wende die Migrationen an, setze ein Secret und deploye. Es gibt auch einen „Deploy to Cloudflare“-Button. Die Anleitung steht unter docs.captureflow.dev.",
      },
      {
        question: "Kann mein KI-Agent Videos für mich aufnehmen?",
        answer:
          "Ja. Füge CaptureFlow mit einer Zeile zu Claude Code, Codex oder Cursor hinzu, oder füge es in Claude oder ChatGPT hinzu, und beschreib dann das Video in einfachen Worten. Er nimmt einen Browser, deinen Bildschirm oder eine App auf deinem eigenen Computer auf, fügt auf Wunsch Folien und ein Voiceover hinzu und gibt dir einen Link zum Teilen.\n\nLokale Agentenaufnahmen sind in jedem Tarif enthalten. Für Cloud-Agentenaufnahmen gibt es ein monatliches Kontingent, das von deinem Tarif abhängt.",
      },
      {
        question: "Wie funktionieren die Preise der bezahlten Tarife?",
        answer: `${LIGHT} und ${PRO} kosten einen Preis pro Mitglied und Monat, bei jährlicher Abrechnung weniger. Ein Mitglied ist jemand, der aufnimmt, du zahlst also nur für die Personen, die Aufnahmen machen.\n\nWenn jemand dazukommt oder geht, wird die Zahl der Plätze mit der nächsten Rechnung angepasst.`,
      },
      {
        question: "Wie lange werden meine Aufnahmen aufbewahrt?",
        answer:
          "In bezahlten Tarifen, bis du sie löschst. Im kostenlosen Tarif wird eine Aufnahme nach 30 Tagen ohne Aufruf entfernt, damit inaktive Konten keinen Speicher belegen. Wenn du selbst hostest, legst du die Regeln fest.",
      },
      {
        question: "Was enthält der kostenlose Tarif?",
        answer: `Du bekommst 25 Aufnahmen pro Person, je bis zu 5 Minuten, im Datensparmodus, mit Transkripten und Untertiteln. Aufnahmen werden nach 30 Tagen ohne Aufruf entfernt. Registriere dich, installiere die Chrome-Erweiterung und nimm auf.\n\n${LIGHT} hebt die Limits zu einem Preis pro Mitglied auf und behält Aufnahmen, bis du sie löschst.`,
      },
    ],
  },
  cta: {
    headline: "Aufnahme starten",
    subtitle:
      "Kostenloser Download. Keine Kreditkarte. Sag es in einer kurzen Videonachricht statt in einem weiteren Meeting.",
    button: "CaptureFlow kostenlos testen",
  },
  footer: {
    tagline:
      "Open-Source-Bildschirmaufnahme mit sofort verfügbaren Freigabelinks.",
    lights: "Licht",
    lightsOn: "An · zieh an der Schnur",
    lightsOff: "Aus · zieh an der Schnur",
    product: {
      title: "Produkt",
      features: "Funktionen",
      pricing: "Preise",
      compare: "Vergleich",
      download: "Download",
      suggest: "Funktion vorschlagen",
    },
    resources: {
      title: "Ressourcen",
      docs: "Doku",
      selfHosting: "Self-Hosting",
      blog: "Blog",
      releases: "Releases",
      faq: "FAQ",
      security: "Sicherheit",
    },
    community: {
      title: "Community",
    },
    legal: {
      title: "Rechtliches",
      privacy: "Datenschutzerklärung",
      terms: "Nutzungsbedingungen",
      refund: "Erstattungsrichtlinie",
      license: "Lizenz (AGPL-3.0)",
    },
    rights: "© {year} CaptureFlow. Alle Rechte vorbehalten.",
    openSource: "Open Source unter AGPL-3.0",
  },
  pageShell: {
    logoAlt: "CaptureFlow",
    backToHome: "Zur Startseite",
  },
  waitlist: {
    errors: {
      joinFailed:
        "Der Eintrag in die Warteliste hat nicht geklappt. Bitte versuch es noch einmal.",
      network: "Netzwerkfehler. Bitte versuch es noch einmal.",
    },
    success:
      "Du stehst auf der Liste. Ich schreibe dir per E-Mail, sobald CaptureFlow bereit ist.",
    emailPlaceholder: "you@example.com",
    buttonLoading: "Wird eingetragen…",
    buttonDefault: "Auf die Warteliste",
    earlyAccessPrompt: "Du möchtest früher Zugang?",
    earlyAccessLink: "Beta-Tester werden",
  },
  download: {
    heading: "CaptureFlow herunterladen",
    subtitle:
      "Verfügbar für Chrome, eine macOS-App kommt bald. Jede Aufnahme bekommt einen Link, den du teilen kannst.",
    button: "Für macOS herunterladen",
    requires: "Erfordert {version} oder neuer auf Apple Silicon.",
    requirements: "Erfordert macOS 14 oder neuer auf Apple Silicon.",
    versionLabel: "Version {version}",
    sizeLabel: "DMG, {size} MB",
    notarized: "Signiert und von Apple notarisiert",
  },
  downloadPage: {
    otherWays: "Weitere Möglichkeiten",
    buildTitle: "Aus dem Quellcode bauen",
    buildBody: "Klone das Repository und starte den Recorder lokal mit pnpm.",
    releasesTitle: "Alle Releases",
    releasesBody:
      "Sieh dir alle veröffentlichten Builds und das Changelog auf GitHub an.",
    cloud: "Lieber in der Cloud? {link} und sieh dir Aufnahmen im Browser an.",
    cloudLink: "Erstelle ein Konto",
  },
  blog: {
    title: "Blog",
    subtitle: "Tipps, Anleitungen und Neuigkeiten rund um Bildschirmaufnahmen.",
    readArticle: "Artikel lesen",
    empty: "Noch keine Beiträge. Schau bald wieder vorbei.",
  },
};

export default messages;

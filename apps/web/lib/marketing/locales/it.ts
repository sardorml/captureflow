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
      title: "CaptureFlow - Registratore schermo con link condivisibili",
      description:
        "Registra lo schermo e condividi un link con team e clienti. Registratore open source con trascrizioni AI e screenshot annotati, in self-hosting su Cloudflare.",
    },
    features: {
      title: "Funzionalità del registratore dello schermo",
      description:
        "Registra una scheda, una finestra o lo schermo intero con videocamera e microfono, crea screenshot annotati e condividili con un link commentabile dal team.",
    },
    pricing: {
      title: "Prezzi: inizi gratis, un prezzo per membro",
      description: `Inizia gratis con ${FREE_RECORDINGS} registrazioni. ${LIGHT} e ${PRO} hanno un prezzo per membro, con registrazioni illimitate e AI. Oppure usa CaptureFlow in self-hosting, gratis.`,
    },
    faq: {
      title: "FAQ: condivisione, archiviazione e self-hosting",
      description:
        "Domande frequenti su CaptureFlow: come funzionano i link di condivisione, cosa comporta il self-hosting su Cloudflare, i limiti di archiviazione e la privacy.",
    },
    download: {
      title: "Scarica il registratore dello schermo per Chrome",
      description:
        "Installa l'estensione CaptureFlow per Chrome per registrare lo schermo e condividerlo con un link.",
    },
    enterprise: {
      title: "Enterprise",
      description:
        "CaptureFlow gestito per le aziende più grandi: licenze per tutti, condizioni personalizzate e un'unica fattura. Dicci di cosa hai bisogno.",
    },
    selfHostSetup: {
      title: "Configurazione del self-hosting",
      description:
        "Fai configurare CaptureFlow sull'account Cloudflare della tua azienda: il tuo dominio, accesso solo aziendale e un'estensione Chrome privata per il team.",
    },
  },
  nav: {
    features: "Funzionalità",
    discover: "Scopri",
    pricing: "Prezzi",
    faq: "FAQ",
    changelog: "Novità",
    login: "Accedi",
    download: "Scarica",
    language: "Lingua",
    openMenu: "Apri il menu",
    menu: "Menu",
    main: "Principale",
    docs: "Documentazione",
    resources: "Risorse",
    faqDescription: "Risposte alle domande più comuni",
    blog: "Blog",
    blogDescription: "Guide e aggiornamenti",
    selfHosting: "Self-hosting",
    selfHostingDescription: "Eseguilo sul tuo account Cloudflare",
    community: "Community",
    communityDescription: "Chiedi aiuto e chatta su Discord",
    star: "Metti una stella su GitHub",
    starCount: "Metti una stella su GitHub ({stars})",
    themeToLight: "Passa al tema chiaro",
    themeToDark: "Passa al tema scuro",
  },
  banner: {
    label: "Beta",
    aria: "CaptureFlow è in beta pubblica",
    title: "Sei tra i primi 🎉",
    strip:
      "CaptureFlow è ancora in beta, quindi cambia spesso e potresti trovare qualche imperfezione mentre si assesta.",
    body: "CaptureFlow è in beta pubblica. Quasi ogni settimana arriva qualcosa di nuovo, e le cose che le persone chiedono sono le prime a essere realizzate.",
    cta: "Dimmi cosa realizzare adesso",
    close: "Chiudi",
  },
  announcement: {
    badge: "Novità",
    lead: "Ora il tuo agente AI può registrare al posto tuo.",
    rest: "Collegalo una volta, chiedi un video e ricevi un link.",
    cta: "Collega",
  },
  hero: {
    title: "Registratore dello schermo per\nte e i tuoi agenti AI",
    subtitle:
      "Registra demo, tutorial, guide passo passo e presentazioni in prima persona, oppure falli registrare alla tua AI. Condividi ogni registrazione con un link che chiunque può guardare.",
    ctaLabel: "Prova CaptureFlow gratis",
    installChrome: "Installa l'estensione Chrome",
    installMac: "Scarica per macOS",
    installSoon: "In arrivo",
    connectMcp: "Collega a MCP",
    macSoon: "App macOS in arrivo",
    installOr: "oppure",
    mcpCopy: "Copia",
    mcpCopied: "Copiato",
    mcpAddToCursor: "Aggiungi a Cursor",
    badge: "Open source e gratuito, su {github}",
    noCreditCard: "Nessuna carta di credito richiesta",
    teaser: {
      title: "Disponibile in self-hosting",
      body: "Eseguilo sul tuo account Cloudflare.",
      cta: "Prova CaptureFlow",
    },
    demo: {
      prevAria: "Demo precedente",
      nextAria: "Demo successiva",
      dotAria: "Mostra la demo {n} di {total}",
    },
  },
  highlights: {
    heading: "Tutte le funzionalità",
    subtitle: "Registra, modifica e condividi. Tutto in un unico posto.",
    items: {
      recording: {
        title: "Schermo e videocamera",
        body: "Registrali insieme",
      },
      transcripts: { title: "Trascrizioni", body: "In 99 lingue", tag: "AI" },
      editing: {
        title: "Modifica dalla trascrizione",
        body: "Elimina il testo per tagliare il video",
        tag: "AI",
      },
      camera: {
        title: "Effetti videocamera",
        body: "Sfondi e filtri",
      },
      canvas: { title: "Canvas infinito", body: "Disegna mentre registri" },
      screenshots: {
        title: "Screenshot annotati",
        body: "Frecce, testo e sfocatura",
      },
      feedback: {
        title: "Commenti e reazioni",
        body: "Feedback sul video",
      },
      summary: {
        title: "Riepiloghi e capitoli",
        body: "Con un titolo per ogni video",
        tag: "AI",
      },
      filler: {
        title: "Rimozione automatica intercalari",
        body: "Taglia gli ehm e gli uhm",
        tag: "AI",
      },
    },
    cta: "Vedi tutte le funzionalità",
    previews: {
      app: "Piano di lancio",
      columns: ["Da fare", "In corso", "Fatto"],
      lines: [
        "Ecco il nuovo flusso.",
        "Prima scegli un workspace.",
        "Poi condividi il link.",
      ],
      retake: "Ehm, ricomincio da capo.",
      filler: [
        "[Ehm,] ecco il nuovo flusso.",
        "Prima, [eh,] scegli un workspace.",
        "Poi, [ehm,] condividi il link.",
      ],
      step: "Passo 1",
      note: "Sposta questo",
      comment: "Bello questo flusso",
      summaryTitle: "Come invitare il tuo team",
      summaryBody: "Scegli un workspace, poi condividi il link.",
      chapters: ["Introduzione", "Scegli un workspace"],
    },
  },
  mcpFeatures: {
    heading: "Funzionalità MCP",
    subtitle:
      "Cosa può fare il tuo agente AI una volta collegato. Registra sul tuo computer, con Claude Code, Codex, Cursor o qualsiasi client MCP.",
    cta: "Leggi la guida",
    items: {
      webApp: { title: "Registra un'app web", body: "Anche su localhost" },
      screen: { title: "Registra lo schermo", body: "Un intero monitor" },
      window: {
        title: "Registra una sola finestra",
        body: "Terminale, VS Code o Figma",
      },
      slides: {
        title: "Aggiunge slide",
        body: "Titoli, passaggi e frasi di chiusura",
      },
      voiceover: {
        title: "Aggiunge una voce narrante",
        body: "Funziona sul tuo computer",
      },
      report: {
        title: "Scrive un report",
        body: "Cosa ha fatto e cosa non è riuscito",
      },
      search: {
        title: "Cerca nelle registrazioni",
        body: "Video e trascrizioni",
      },
      save: { title: "Salva file MP4", body: "Senza caricamento né accesso" },
    },
  },
  useCases: {
    heading: "Come lo usano i team",
    subtitle:
      "Esempi di ciò che i team registrano. Ogni video è un link che si riproduce in qualsiasi browser.",
    cta: "Scopri come funziona",
    cards: {
      engineering: {
        title: "Sviluppo",
        body: "Registra la panoramica di una PR o la riproduzione di un bug.",
      },
      design: {
        title: "Design",
        body: "Registra la panoramica di un mockup e raccogli i commenti.",
      },
      support: {
        title: "Assistenza clienti",
        body: "Rispondi a un ticket con una breve guida video.",
      },
      updates: {
        title: "Aggiornamenti del team",
        body: "Registra l'aggiornamento settimanale e condividi il link.",
      },
    },
    engineeringFile: "checkout.ts",
    engineeringPr: "PR #482",
    designApp: "trip-app",
    designBadge: "Checkout v3",
    designCardTitle: "Organizza il tuo viaggio",
    designColors: "Colori",
    designComment: "CTA più grande?",
    supportQuestion: "Come invito il mio team nel workspace?",
    supportReply: "Ecco una breve guida video:",
    supportLink: "captureflow.dev/r/8kx2pnq4",
    updatesTitle: "Aggiornamento settimanale",
    updatesRange: "6–10 ott",
    updatesSignups: "Iscrizioni",
    updatesShipped: "Rilasciate",
    updatesFeatures: "funzionalità",
  },
  agents: {
    heading:
      "Oppure chiedi al tuo agente AI di registrare le tue demo e i tuoi tutorial",
    worksWith: "Funziona con {claude}, {openai} e {cursor}.",
    cta: "Leggi la guida",
    subtitle:
      "Chiedilo con parole semplici. Registra un browser, il tuo schermo o un'app sul tuo computer, aggiunge slide e una voce narrante se vuoi, e ti consegna un link.",
    steps: [
      {
        title: "Collega il tuo agente",
        body: "Aggiungi CaptureFlow a Claude Code, Codex o Cursor con una riga. Serve Node.js 20 o successivo, e il tuo agente accede una volta sola. In Claude o ChatGPT, aggiungilo tramite URL.",
      },
      {
        title: "Chiedi un video",
        body: "La demo di una funzionalità, un tutorial, la segnalazione di un bug o una presentazione con voce narrante.",
      },
      {
        title: "Registra al posto tuo",
        body: "Sul tuo computer, anche un'app su localhost.",
      },
      {
        title: "Aggiunge slide e voce",
        body: "Slide con i titoli e una voce narrante, se le vuoi.",
      },
      {
        title: "Ti dà un link da condividere",
        body: "Allegalo a una pull request, pubblicalo su Slack o invialo a un cliente.",
      },
    ],
    scenes: {
      ask: {
        name: "terminale",
        badge: "agente",
        prompt: "Registra una demo del checkout",
        steps: ["Apro l'app", "Percorro il flusso", "Il tuo link è pronto"],
      },
      record: {
        url: "localhost:3000",
        badge: "demo",
        title: "Pagamento",
        fields: ["Il tuo nome", "Numero della carta"],
        pay: "Paga ora",
        paid: "Pagato",
      },
      voice: {
        title: "Demo del checkout",
        subtitle: "Come pagare in tre passaggi",
      },
      share: {
        title: "Demo del checkout",
        link: "captureflow.dev/r/checkout",
        places: ["PR", "Slack", "Email"],
      },
    },
    chats: {
      claude:
        "In Claude, apri «Customize», poi «Connectors», e scegli «Add custom connector». Chiamalo CaptureFlow, incolla questo URL e accedi.",
      chatgpt:
        "In ChatGPT sul web, apri «Plugins», premi + e scegli «Add custom MCP server». Chiamalo CaptureFlow, incolla questo URL, scegli OAuth, poi installa il plugin e accedi. Richiede un piano Business, Enterprise o Edu.",
      limits:
        "Le chat registrano siti web in un browser cloud, non il tuo computer, e usano i minuti di agente cloud del tuo piano.",
    },
  },
  modes: {
    cta: "Inizia a registrare",
    heading: "Registra lo schermo con l'estensione Chrome",
    subtitle:
      "Installala e premi registra. Quando hai finito, ottieni un link che chiunque può guardare, con titolo, riepilogo, capitoli e trascrizione.",
    scene: {
      timer: "0:42",
      heading: "Come funziona un rimborso",
      steps: ["Richiesta", "Approvazione", "Pagamento"],
      captions: [
        "Breve panoramica di come funziona un rimborso.",
        "Per prima cosa, il cliente invia una richiesta.",
        "L'assistenza la approva in giornata.",
        "Poi il denaro parte in automatico.",
      ],
    },
  },
  pageHeroes: {
    home: "Home",
    features: {
      label: "Funzionalità",
      word: "FUNZIONI",
      title: "Registra, modifica e condividi il tuo schermo",
      subtitle:
        "Registra lo schermo e la videocamera. Condividi ogni registrazione con un link che il tuo team può commentare.",
    },
    pricing: {
      label: "Prezzi",
      word: "PREZZI",
      title: "Inizia gratis. Paga un prezzo per membro.",
      subtitle:
        "Il piano Gratuito copre le tue prime 25 registrazioni. Light e Pro eliminano il limite. Puoi anche usare CaptureFlow in self-hosting, gratis.",
    },
    faq: {
      label: "FAQ",
      word: "FAQ",
      title: "Domande frequenti",
      subtitle:
        "Risposte su registrazione, prezzi, archiviazione e self-hosting. Per tutto il resto, leggi la documentazione.",
    },
  },
  collaboration: {
    heading: "Cosa puoi fare dopo la registrazione",
    cta: "Provalo gratis",
    subtitle:
      "Modificala, poi condividila o incorporala. Invita il tuo team a guardare i video degli altri, a reagire e a commentare.",
    categories: {
      share: {
        feature: {
          tag: "novità",
          title: "Modifica il tuo video",
          cta: "Installa l'estensione",
          body: "Elimina le parole dalla trascrizione per tagliarle dal video, oppure accorcia le clip sulla timeline. Cambia lo sfondo, sposta, ridimensiona o nascondi la videocamera e disattiva il microfono o l'audio di sistema.",
        },
        scene: {
          app: "Piano di lancio",
          nav: ["Panoramica", "Roadmap", "Attività", "Documenti"],
          columns: [
            {
              name: "Da fare",
              tasks: ["Testi pagina prezzi", "Email di onboarding"],
            },
            {
              name: "In corso",
              tasks: ["Redesign del checkout", "Inviti al team"],
            },
            { name: "Fatto", tasks: ["Modulo iscrizione beta"] },
          ],
          background: "Sfondo",
          camera: "Videocamera",
          shapes: ["Cerchio", "Quadrato"],
          fillers: "Intercalari",
          remove: "Rimuovi",
          transcript: {
            before: "Clicca qui per",
            fillers: ["ehm,", "aspetta,", "scusa,"],
            after: "condividere il link.",
          },
          saved: "Salvato · stesso link",
        },
      },
      embed: {
        feature: {
          title: "Condividi o incorpora il tuo video",
          cta: "Installa l'estensione",
          body: "Incolla il link in Slack, GitHub, Notion o in un'email e compare un'anteprima. Puoi anche incorporare il player nella tua documentazione o nel tuo sito. Con l'estensione installata, il video si riproduce dentro le issue e le pull request di GitHub.",
        },
        scene: {
          question: "Mi mostri come invitare il mio team nel workspace?",
          reply: "Certo! Ecco una breve guida video con i passaggi:",
          url: "captureflow.dev/r/8kx2pnq4",
          app: "Impostazioni",
          nav: ["Generali", "Membri", "Fatturazione"],
          members: "Membri",
          invite: "Invita",
          people: [
            { initials: "AR", name: "Alex Rivera", role: "Proprietario" },
            { initials: "CK", name: "Chris Kim", role: "Membro" },
            { initials: "JB", name: "Jordan Bell", role: "Membro" },
          ],
          duration: "0:48",
        },
      },
      feedback: {
        feature: {
          title: "Collabora sui tuoi video",
          cta: "Accedi",
          body: "Lavorate insieme senza riunioni, anche da fusi orari diversi. Il tuo team può reagire con le emoji, commentare in qualsiasi momento del video e seguire con trascrizioni e sottotitoli.",
        },
        scene: {
          title: "Panoramica del piano di lancio",
          author: "Alex",
          age: "adesso",
          duration: "1:12",
          activity: "Attività",
          events: [
            { initials: "CK", name: "Chris", at: "0:09", emoji: "👍" },
            { initials: "JB", name: "Jordan", at: "0:17", emoji: "🔥" },
            {
              initials: "MC",
              name: "Maya",
              at: "0:27",
              text: "Bella la nuova vista a bacheca",
            },
            { initials: "SL", name: "Sam", at: "0:37", emoji: "❤️" },
            {
              initials: "JB",
              name: "Jordan",
              at: "0:48",
              text: "Possiamo rilasciarlo venerdì?",
            },
            {
              initials: "AR",
              name: "Alex",
              at: "0:56",
              text: "Sì, subito dopo il QA ✅",
            },
            { initials: "MC", name: "Maya", at: "1:05", emoji: "👏" },
          ],
        },
      },
      workspaces: {
        feature: {
          title: "Invita il tuo team in un workspace",
          cta: "Crea un workspace",
          body: "Le registrazioni di tutti stanno in un unico workspace. Ogni video può essere pubblico, visibile al workspace o privato.",
        },
        scene: {
          team: "Team CaptureFlow",
          members: ["1 membro", "2 membri", "3 membri"],
          memberInitials: ["AR", "CK", "JB"],
          invitePlaceholder: "Invita via email",
          inviteEmail: "chris@acme.co, jordan@acme.co",
          invite: "Invita",
          invited: "Inviato",
          joined: "Chris e Jordan sono entrati 🎉",
          whoCanWatch: "Chi può guardare:",
          visibility: [
            { label: "Pubblico", detail: "Chiunque abbia il link" },
            { label: "Workspace", detail: "Solo il tuo team" },
            { label: "Privato", detail: "Solo tu" },
          ],
        },
      },
    },
  },
  setupService: {
    title: "Lo configuriamo noi",
    titleHighlight: "per te",
    subtitle:
      "Parlaci della tua azienda. Configuriamo l'app, l'estensione Chrome, l'app macOS e tutta l'infrastruttura che c'è dietro, pronte all'uso per il tuo team.",
    includedHeading: "Tutto quello che configuriamo",
    included: {
      infra: {
        title: "L'app, sulla tua infrastruttura",
        body: "Distribuita sul tuo account Cloudflare e servita dal tuo dominio. È tutto tuo.",
      },
      storage: {
        title: "Archiviazione e database",
        body: "Le registrazioni nel tuo bucket R2; workspace e commenti nel tuo database.",
      },
      signin: {
        title: "Accesso riservato all'azienda",
        body: "Accesso con Google Workspace o GitHub, limitato al dominio email della tua azienda.",
      },
      apps: {
        title: "Estensione Chrome e app per Mac",
        body: "Entrambe compilate per la tua istanza, con l'estensione pubblicata in privato per il tuo team.",
      },
      ready: {
        title: "Pronto per registrare",
        body: "Workspace creati e team invitato, così tutti possono iniziare subito a condividere.",
      },
      handover: {
        title: "Passaggio di consegne",
        body: "Spieghiamo a chi lo gestirà come farlo funzionare e come aggiornarlo.",
      },
    },
    nextHeading: "Contattaci",
    nextSubheading: "Dicci di cosa hai bisogno e ti risponderemo.",
    form: {
      company: "Azienda",
      companyPlaceholder: "Acme Inc.",
      name: "Il tuo nome",
      namePlaceholder: "Jane Doe",
      email: "Email di lavoro",
      emailPlaceholder: "jane@acme.com",
      topic: "Come possiamo aiutarti?",
      topics: ["Configurazione del self-hosting", "Più di 1 TB", "Altro"],
      teamSize: "Dimensione del team",
      teamSizes: ["1–10", "11–50", "51–200", "200+"],
      cloudflare: "Hai un account Cloudflare?",
      cloudflareOptions: ["Sì", "No", "Non so"],
      notes: "C'è altro che dovremmo sapere?",
      notesPlaceholder: "Dimensione del team, dominio, tempistiche…",
      submit: "Invia messaggio",
      error:
        "Non è stato possibile inviare la richiesta. Riprova oppure scrivici a {email}.",
      sentTitle: "Messaggio inviato",
      sentBody: "Grazie. Ti risponderemo a {email}.",
      back: "Torna alla home",
    },
  },
  enterprise: {
    title: "CaptureFlow per",
    titleHighlight: "la tua azienda",
    subtitle:
      "Il piano gestito per le aziende che vogliono licenze per tutti a condizioni concordate una volta sola, con un'unica fattura.",
    includedHeading: "Cosa aggiunge Enterprise",
    included: {
      storage: {
        title: "Archiviazione su misura",
        body: "Uno spazio dimensionato su quanto registra la tua azienda, non una quota per licenza.",
      },
      seats: {
        title: "Licenze per tutti",
        body: "Un solo accordo copre tutta l'azienda, a prescindere da quante persone registrano.",
      },
      roadmap: {
        title: "Le tue richieste per prime",
        body: "Le funzionalità richieste dal tuo team passano in cima alla nostra lista.",
      },
      managed: {
        title: "Completamente gestito",
        body: "Lo ospitiamo noi e rilasciamo gli aggiornamenti, così non devi gestire nulla.",
      },
      billing: {
        title: "Fatturazione annuale",
        body: "Paghi una volta all'anno, a un prezzo concordato per la tua azienda.",
      },
      support: {
        title: "Una linea diretta con noi",
        body: "Le domande arrivano direttamente a chi sviluppa CaptureFlow.",
      },
    },
    everythingHeading: "Tutto ciò che riceve il tuo team",
    comingSoon: "In arrivo",
    everything: {
      extension: {
        title: "Estensione Chrome",
        body: "Registra qualsiasi scheda o schermo, con un link pronto quando ti fermi.",
      },
      mac: {
        title: "App per Mac",
        body: "Un registratore nativo per macOS, con gli stessi link di condivisione immediati.",
      },
      workspaces: {
        title: "Workspace per i team",
        body: "Le registrazioni di tutti in un unico posto, condivise o private.",
      },
      feedback: {
        title: "Commenti e reazioni",
        body: "Chi guarda risponde direttamente sulla timeline, nel momento esatto a cui si riferisce.",
      },
      edit: {
        title: "Modifica dopo la condivisione",
        body: "Cambia lo sfondo, la videocamera o l'audio, e il link resta lo stesso.",
      },
      screenshots: {
        title: "Screenshot annotati",
        body: "Annota uno screenshot con frecce, testo e sfocatura e condividilo con un link.",
      },
    },
    formHeading: "Contattaci",
    formSubheading: "Parlaci del tuo team e ti risponderemo via email.",
    form: {
      company: "Azienda",
      companyPlaceholder: "Acme Inc.",
      name: "Il tuo nome",
      namePlaceholder: "Jane Doe",
      email: "Email di lavoro",
      emailPlaceholder: "jane@acme.com",
      need: "Di cosa hai bisogno?",
      needs: [
        "Licenze per un team numeroso",
        "Condizioni personalizzate o un'unica fattura",
        "Altro",
      ],
      teamSize: "Dimensione del team",
      teamSizes: ["1–10", "11–50", "51–200", "200+"],
      storage: "Quanto spazio di archiviazione?",
      storageOptions: ["1–5 TB", "5–20 TB", "20 TB+", "Non so"],
      notes: "C'è altro che dovremmo sapere?",
      notesPlaceholder:
        "Quanto registra il tuo team, tempistiche, esigenze di fatturazione…",
      submit: "Invia messaggio",
      error:
        "Non è stato possibile inviare il messaggio. Riprova oppure scrivici a {email}.",
      sentTitle: "Messaggio inviato",
      sentBody: "Grazie. Ti risponderemo a {email}.",
      back: "Torna alla home",
    },
  },
  pricing: {
    heading: "Prezzi",
    cta: "Confronta tutti i piani",
    subheading:
      "Il piano Gratuito copre le tue prime registrazioni. I piani a pagamento hanno un prezzo per membro.",
    controls: {
      shownIn:
        "I prezzi sono mostrati in {currency}. L'addebito è in dollari statunitensi.",
      teamSize: "Dimensione del team",
      members: "membri",
      title: "Fatturazione",
      note: "Un prezzo per membro.",
      billing: "Pagamento",
      monthly: "Mensile",
      annually: "Annuale",
      save: "Risparmia il {percent}%",
    },
    compare: {
      loomRow: "Loom {plan}",
      loomDetail: "{seats} persone × {perSeat} ciascuna",
      caption: "Prezzi mensili.",
      captureflowRow: "CaptureFlow {ourPlan}",
      captureflowDetail: "{seats} membri × {ourPerSeat} ciascuno",
      saveLabel: "Il tuo team risparmia",
      saveValue: "{savings} all'anno",
    },
    plans: {
      chargedInUsd: "Addebitato in dollari statunitensi.",
      member: "membro",
      members: "membri",
      included: "Incluso",
      notIncluded: "Non incluso",
      free: {
        name: "Gratuito",
        description: "Registrazioni dello schermo da condividere con un link.",
        cta: "Iscriviti",
      },
      light: {
        name: LIGHT,
        featuresHeading: "Tutto del piano Gratuito, più",
        features: [
          "Registrazioni illimitate",
          "Durata di registrazione illimitata",
          `${LIGHT_AGENT_MIN} min al mese di registrazioni con agente cloud, fino a 10 min ciascuna`,
        ],
        description: "Registrazioni illimitate in qualità risparmio dati.",
        period: "/mese",
        noteMonthly: "Per membro, con fatturazione mensile",
        noteAnnual:
          "Per membro, con fatturazione annuale. {yearly} all'anno per {seats} {members}",
        cta: "Prova gratis",
      },
      pro: {
        badge: "Consigliato",
        name: PRO,
        featuresHeading: `Tutto del piano ${LIGHT}, più`,
        features: [
          "Qualità piena, fino a 1080p",
          "Capitoli, titoli e rimozione degli intercalari con AI",
          "Branding personalizzato",
          `${PRO_AGENT_MIN} min al mese di registrazioni con agente cloud, con ${PRO_VOICEOVER_MIN} min di voce narrante AI`,
          "Statistiche sugli spettatori (in arrivo)",
          "Integrazioni con Slack, Notion e Zapier (in arrivo)",
        ],
        description: "Qualità piena, pulizia con AI e il tuo branding.",
        period: "/mese",
        noteMonthly: "Per membro, con fatturazione mensile",
        noteAnnual:
          "Per membro, con fatturazione annuale. {yearly} all'anno per {seats} {members}",
        cta: "Prova gratis",
      },
      rows: {
        recordings: {
          label: "Registrazioni per persona",
          free: "Fino a {recordings}",
          light: "Illimitate",
          pro: "Illimitate",
        },
        length: {
          label: "Durata della registrazione",
          free: "{minutes} min per video",
          light: "Illimitata",
          pro: "Illimitata",
        },
        quality: {
          label: "Qualità video",
          free: "Risparmio dati",
          light: "Risparmio dati",
          pro: "Fino a 1080p",
        },
        transcripts: {
          label: "Trascrizioni e sottotitoli",
          free: true,
          light: true,
          pro: true,
        },
        editing: {
          label: "Modifica dalla trascrizione",
          free: true,
          light: true,
          pro: true,
        },
        chapters: {
          label: "Capitoli e titoli con AI",
          free: false,
          light: false,
          pro: true,
        },
        filler: {
          label: "Rimozione degli intercalari",
          free: false,
          light: false,
          pro: true,
        },
        feedback: {
          label: "Commenti e reazioni",
          free: true,
          light: true,
          pro: true,
        },
        agents: {
          label: "Registrazioni con agente in locale",
          free: true,
          light: true,
          pro: true,
        },
        cloudAgents: {
          label: "Registrazioni con agente cloud",
          free: `${FREE_AGENT_MIN} min al mese`,
          light: `${LIGHT_AGENT_MIN} min al mese`,
          pro: `${PRO_AGENT_MIN} min al mese`,
        },
        voiceover: {
          label: "Voce narrante AI in locale",
          free: true,
          light: true,
          pro: true,
        },
        cloudVoiceover: {
          label: "Voce narrante AI nel cloud",
          free: false,
          light: false,
          pro: `${PRO_VOICEOVER_MIN} min al mese`,
        },
        branding: {
          label: "Branding personalizzato",
          free: false,
          light: false,
          pro: true,
        },
      },
    },
    table: {
      heading: "Tutte le funzionalità, piano per piano",
      subtitle: "Gratuito, Light e Pro a confronto.",
      groups: [
        {
          title: "Registrazione",
          rows: [
            {
              label: "Membri",
              free: "Illimitati",
              light: "Illimitati",
              pro: "Illimitati",
            },
            {
              label: "Registrazioni per persona",
              free: "Fino a {recordings}",
              light: "Illimitate",
              pro: "Illimitate",
            },
            {
              label: "Durata della registrazione",
              free: "{minutes} min per video",
              light: "Illimitata",
              pro: "Illimitata",
            },
            {
              label: "Qualità video",
              free: "Risparmio dati",
              light: "Risparmio dati",
              pro: "Fino a 1080p",
            },
            {
              label: "Screenshot",
              free: "Illimitati",
              light: "Illimitati",
              pro: "Illimitati",
            },
            {
              label: "Conservazione delle registrazioni",
              free: "30 giorni senza visualizzazioni",
              light: "Finché non le elimini",
              pro: "Finché non le elimini",
            },
            {
              label: "Registrazione di schermo intero, finestra o scheda",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Bolla della videocamera ed effetti videocamera",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Microfono e audio di sistema",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Cursore fluido",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Estensione Chrome e app per Mac",
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
              label: "Trascrizioni",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Sottotitoli",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Capitoli di riepilogo",
              free: false,
              light: false,
              pro: true,
            },
            {
              label: "Titoli suggeriti in automatico",
              free: false,
              light: false,
              pro: true,
            },
            {
              label: "Modifica il video dalla trascrizione",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Rimozione degli intercalari",
              free: false,
              light: false,
              pro: true,
            },
          ],
        },
        {
          title: "Agenti",
          rows: [
            {
              label: "Registrazioni con agente sul tuo computer",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Registrazioni con agente in un browser cloud",
              free: `${FREE_AGENT_MIN} min al mese per persona`,
              light: `${LIGHT_AGENT_MIN} min al mese per membro`,
              pro: `${PRO_AGENT_MIN} min al mese per membro`,
            },
            {
              label: "Slide nelle registrazioni con agente",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Voce narrante AI sul tuo computer",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Voce narrante AI in un browser cloud",
              free: false,
              light: false,
              pro: `${PRO_VOICEOVER_MIN} min al mese per membro`,
            },
          ],
        },
        {
          title: "Modifica",
          rows: [
            {
              label: "Modifica dopo la condivisione, stesso link",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Sfondi",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Sposta o ridimensiona la bolla della videocamera",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Taglia parti del video",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Screenshot annotati con frecce, testo e sfocatura",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Canvas infinito",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "Condivisione e feedback",
          rows: [
            {
              label: "Link di condivisione pronto quando ti fermi",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Link pubblici, per il workspace o privati",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Richiesta di accesso sui link con restrizioni",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Anteprime dei link in chat ed email",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Incorpora il player ovunque",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Riproduzione dentro issue e pull request di GitHub",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Commenti sulla timeline",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Reazioni con emoji",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Numero di visualizzazioni",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Download del file originale",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "Workspace e amministrazione",
          rows: [
            {
              label: "Workspace del team",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Ruoli di proprietario, membro e spettatore",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Visibilità predefinita e permessi di caricamento",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Ricerca tra registrazioni e screenshot",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Branding personalizzato",
              free: false,
              light: false,
              pro: true,
            },
          ],
        },
        {
          title: "Hosting e assistenza",
          rows: [
            {
              label: "Open source con licenza AGPL",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Self-hosting sul tuo account Cloudflare",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Hosting gestito e aggiornamenti",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
      ],
    },
    includes: {
      heading: "Ogni piano include",
      items: [
        "Il tuo workspace, invita chi vuoi",
        "Effetti videocamera",
        "Trascrizioni e sottotitoli AI",
        "Modifica il video dalla trascrizione",
        "Link di condivisione pubblici, per il workspace o privati",
        "Commenti e reazioni con emoji",
        "Screenshot annotati",
        "Canvas infinito",
      ],
    },
    annual: {
      badgePro: "Gestito",
      badgeCycle: "Annuale",
      title: "Hosting gestito",
      subtitle: "Completamente ospitato, con fatturazione annuale.",
      period: "/mese",
      note: "Fatturazione di {amount}/anno. Disdici quando vuoi.",
      cta: "Inizia",
    },
  },
  activity: {
    heading: "Ultime modifiche su GitHub",
    subtitle:
      "Ogni modifica è pubblica. Queste sono le ultime pull request e le issue aperte su GitHub.",
    cta: "Vedi su GitHub",
    shippedHeading: "Unite di recente",
    openHeading: "Issue e pull request aperte",
    emptyOpen: "Al momento non c'è nulla di aperto.",
    newIssue: "Segnala un bug o richiedi una funzionalità",
    viewAll: "Vedi tutto su GitHub",
  },
  faq: {
    heading: "Domande frequenti",
    subtitle:
      "Risposte su registrazione, prezzi, archiviazione e self-hosting. Per tutto il resto, leggi la documentazione.",
    cta: "Leggi la documentazione",
    waitlistLink: "Iscriviti alla lista d'attesa",
    items: [
      {
        question: "Come faccio una registrazione?",
        answer:
          "Ci sono due modi, e la differenza sta in chi registra.\n\nCon l'estensione Chrome registri tu. Ti muovi sullo schermo e puoi commentare con la tua voce e la tua videocamera. Usala per aggiornamenti rapidi, feedback o qualsiasi cosa richieda la tua presenza.\n\nCon un agente AI descrivi il video e l'agente fa i clic e lo registra al posto tuo, così puoi continuare a lavorare. Può aggiungere slide e una voce narrante AI. Usalo per demo di prodotto, tutorial e segnalazioni di bug.\n\nPer registrare tu:\n1. Installa l'estensione CaptureFlow dal Chrome Web Store.\n2. Clicca sulla sua icona nella barra degli strumenti del browser e accedi.\n3. Clicca di nuovo sull'icona. Scegli «This tab», «Window» o «Full screen» e attiva videocamera e microfono se vuoi usarli.\n4. Premi «Start Recording». Una barra sulla pagina ti permette di mettere in pausa o fermare.\n5. Premi stop. Si apre la pagina della registrazione, con un link che puoi condividere con chiunque.\n\nPer far registrare un agente:\n1. Collega CaptureFlow all'app AI che usi. La sezione Agenti della home page contiene i passaggi per Claude, ChatGPT, Claude Code, Codex e Cursor.\n2. Accedi quando si apre una scheda del browser. Lo fai una volta sola.\n3. Chiedi il video con parole semplici, ad esempio: Registra una demo di come iscriversi al nostro sito, con una voce narrante.\n4. L'agente lo registra e ti dà un link che puoi condividere con chiunque.",
      },
      {
        question: "Posso usare CaptureFlow in self-hosting?",
        answer:
          "Sì. CaptureFlow è open source con licenza AGPL e l'intero backend gira su Cloudflare: Workers per l'app e l'API, R2 per le registrazioni e D1 per tutto il resto. Crea un database D1 e un bucket R2, applica le migrazioni, imposta un secret ed esegui il deploy. C'è anche un pulsante Deploy to Cloudflare. La guida è su docs.captureflow.dev.",
      },
      {
        question: "Il mio agente AI può registrare video al posto mio?",
        answer:
          "Sì. Aggiungi CaptureFlow a Claude Code, Codex o Cursor con una riga, oppure aggiungilo in Claude o ChatGPT, poi chiedi un video con parole semplici. Registra un browser, il tuo schermo o un'app sul tuo computer, aggiunge slide e una voce narrante se vuoi, e ti dà un link da condividere.\n\nLe registrazioni con agente in locale sono incluse in tutti i piani. Le registrazioni con agente cloud hanno una quota mensile che dipende dal tuo piano.",
      },
      {
        question: "Come funzionano i prezzi dei piani a pagamento?",
        answer: `${LIGHT} e ${PRO} hanno un prezzo per membro al mese, più basso con la fatturazione annuale. Un membro è una persona che registra, quindi paghi solo per chi crea registrazioni.\n\nQuando qualcuno entra o esce, il numero di licenze si aggiorna nella fattura successiva.`,
      },
      {
        question: "Per quanto tempo vengono conservate le mie registrazioni?",
        answer:
          "Nei piani a pagamento, finché non le elimini. Nel piano gratuito, una registrazione viene rimossa dopo 30 giorni senza visualizzazioni, così gli account inattivi non occupano spazio. Se usi il self-hosting, le regole le decidi tu.",
      },
      {
        question: "Cosa include il piano gratuito?",
        answer: `Hai 25 registrazioni per persona, fino a 5 minuti ciascuna, in qualità risparmio dati, con trascrizioni e sottotitoli. Le registrazioni vengono rimosse dopo 30 giorni senza visualizzazioni. Iscriviti, installa l'estensione Chrome e inizia a registrare.\n\n${LIGHT} elimina i limiti a un prezzo per membro e conserva le registrazioni finché non le elimini.`,
      },
    ],
  },
  cta: {
    headline: "Inizia a registrare",
    subtitle:
      "Download gratuito. Nessuna carta di credito. Dillo con un breve videomessaggio invece di un'altra riunione.",
    button: "Prova CaptureFlow gratis",
  },
  footer: {
    tagline:
      "Registrazione dello schermo open source con link di condivisione immediati.",
    lights: "Luci",
    lightsOn: "Accese · tira il cordino",
    lightsOff: "Spente · tira il cordino",
    product: {
      title: "Prodotto",
      features: "Funzionalità",
      pricing: "Prezzi",
      compare: "Confronto",
      download: "Scarica",
      suggest: "Suggerisci una funzionalità",
    },
    resources: {
      title: "Risorse",
      docs: "Documentazione",
      selfHosting: "Self-hosting",
      blog: "Blog",
      releases: "Versioni",
      faq: "FAQ",
      security: "Sicurezza",
    },
    community: {
      title: "Community",
    },
    legal: {
      title: "Note legali",
      privacy: "Informativa sulla privacy",
      terms: "Termini di servizio",
      refund: "Politica di rimborso",
      license: "Licenza (AGPL-3.0)",
    },
    rights: "© {year} CaptureFlow. Tutti i diritti riservati.",
    openSource: "Open source con licenza AGPL-3.0",
  },
  pageShell: {
    logoAlt: "CaptureFlow",
    backToHome: "Torna alla home",
  },
  waitlist: {
    errors: {
      joinFailed: "Iscrizione alla lista d'attesa non riuscita. Riprova.",
      network: "Errore di rete. Riprova.",
    },
    success: "Sei in lista. Ti scriverò quando CaptureFlow sarà pronto.",
    emailPlaceholder: "you@example.com",
    buttonLoading: "Iscrizione…",
    buttonDefault: "Iscriviti alla lista d'attesa",
    earlyAccessPrompt: "Vuoi l'accesso anticipato?",
    earlyAccessLink: "Diventa beta tester",
  },
  download: {
    heading: "Scarica CaptureFlow",
    subtitle:
      "Disponibile per Chrome, con un'app macOS in arrivo. Ogni registrazione ha un link che puoi condividere.",
    button: "Scarica per macOS",
    requires: "Richiede {version} o successivo su Apple Silicon.",
    requirements: "Richiede macOS 14 o successivo su Apple Silicon.",
    versionLabel: "Versione {version}",
    sizeLabel: "DMG da {size} MB",
    notarized: "Firmato e autenticato da Apple",
  },
  downloadPage: {
    otherWays: "Altri modi per ottenerlo",
    buildTitle: "Compila dal sorgente",
    buildBody:
      "Clona il repository ed esegui il registratore in locale con pnpm.",
    releasesTitle: "Tutte le versioni",
    releasesBody: "Sfoglia tutte le build pubblicate e il changelog su GitHub.",
    cloud: "Preferisci il cloud? {link} e guarda le registrazioni nel browser.",
    cloudLink: "Crea un account",
  },
  blog: {
    title: "Blog",
    subtitle:
      "Consigli, guide e aggiornamenti sulla registrazione dello schermo.",
    readArticle: "Leggi l'articolo",
    empty: "Ancora nessun articolo. Torna presto.",
  },
};

export default messages;

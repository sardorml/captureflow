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
      title: "CaptureFlow - Skärminspelare med delbara länkar",
      description:
        "Spela in skärmen och dela en länk med teamet eller kunder. Skärminspelare med öppen källkod, AI-transkription och skärmdumpar med markeringar. Självhosta på Cloudflare.",
    },
    features: {
      title: "Funktioner i skärminspelaren",
      description:
        "Spela in en flik, ett fönster eller hela skärmen med kamera och mikrofon, ta skärmdumpar med markeringar och dela allt som en länk som teamet kan kommentera.",
    },
    pricing: {
      title: "Priser: börja gratis, ett pris per medlem",
      description: `Börja gratis med ${FREE_RECORDINGS} inspelningar. ${LIGHT} och ${PRO} har ett pris per medlem med obegränsade inspelningar och AI. Eller självhosta CaptureFlow gratis.`,
    },
    faq: {
      title: "Vanliga frågor: delning, lagring och självhosting",
      description:
        "Vanliga frågor om CaptureFlow: hur delningslänkar fungerar, vad självhosting på Cloudflare innebär, lagringsgränser och hur inspelningar hålls privata.",
    },
    download: {
      title: "Ladda ner skärminspelaren för Chrome",
      description:
        "Installera CaptureFlows Chrome-tillägg för att spela in skärmen och dela inspelningen med en länk.",
    },
    enterprise: {
      title: "Enterprise",
      description:
        "Hanterat CaptureFlow för större företag: licenser för alla, egna villkor och en enda faktura. Berätta vad du behöver.",
    },
    selfHostSetup: {
      title: "Installation av självhosting",
      description:
        "Få CaptureFlow installerat på ditt företags eget Cloudflare-konto: din domän, inloggning bara för företaget och ett privat Chrome-tillägg för ditt team.",
    },
    swarmDemo: {
      title: "Svärmdemo: agenter bygger om vilken webbplats som helst på video",
      description:
        "Skriv in en webbadress och se en svärm av agentmarkörer bygga om den element för element, till musik. Du får en video med en länk att dela.",
    },
    chromeExtension: {
      title: "Chrome-tillägg: spela in skärmen och dela en länk",
      description:
        "Spela in skärmen, en flik eller kameran i Chrome. När du är klar får du en länk som alla kan titta på, med transkription, sammanfattning och kapitel.",
    },
    agentRecorder: {
      title: "MCP-server: din AI-agent spelar in videor",
      description:
        "Anslut Claude Code, Codex, Cursor eller ChatGPT till CaptureFlow via MCP. Din agent spelar in en webbapp, din skärm eller ett fönster och ger dig en länk att dela.",
    },
  },
  nav: {
    features: "Funktioner",
    discover: "Upptäck",
    pricing: "Priser",
    faq: "Vanliga frågor",
    changelog: "Ändringslogg",
    login: "Logga in",
    library: "Mina inspelningar",
    download: "Ladda ner",
    language: "Språk",
    openMenu: "Öppna menyn",
    menu: "Meny",
    main: "Huvudmeny",
    docs: "Dokumentation",
    resources: "Resurser",
    faqDescription: "Svar på vanliga frågor",
    blog: "Blogg",
    blogDescription: "Guider och nyheter",
    selfHosting: "Självhosting",
    selfHostingDescription: "Kör det på ditt eget Cloudflare-konto",
    community: "Community",
    communityDescription: "Få hjälp och chatta på Discord",
    products: "Produkter",
    swarmDemo: "Svärmdemo",
    swarmDemoDescription:
      "Agenter bygger om vilken webbplats som helst på video",
    extension: "Chrome-tillägg",
    extensionDescription: "Spela in skärmen och dela en länk",
    agentRecorder: "Inspelare för agenter",
    agentRecorderDescription: "Videor som din AI-agent gör via MCP",
    star: "Stjärnmärk på GitHub",
    starCount: "Stjärnmärk på GitHub ({stars})",
    themeToLight: "Byt till ljust tema",
    themeToDark: "Byt till mörkt tema",
  },
  banner: {
    label: "Beta",
    aria: "CaptureFlow är i öppen beta",
    title: "Du är tidigt ute 🎉",
    strip:
      "CaptureFlow är fortfarande i beta, så det ändras ofta och du kan stöta på en och annan skavank medan det sätter sig.",
    body: "CaptureFlow är i öppen beta. Något nytt släpps de flesta veckor, och det som folk ber om är det som byggs först.",
    cta: "Berätta vad jag ska bygga härnäst",
    close: "Stäng",
  },
  announcement: {
    badge: "Nytt",
    lead: "Din AI-agent kan nu spela in åt dig.",
    rest: "Anslut den en gång, be om en video och få tillbaka en länk.",
    cta: "Anslut",
  },
  hero: {
    title: "Skärminspelare {bubble}\nför dig och dina AI-agenter",
    subtitle:
      "Spela in demor, guider och genomgångar själv med {chrome}-tillägget, eller låt {claude}, {chatgpt} eller {cursor} spela in dem åt dig. Dela var och en som en länk som vem som helst kan titta på.",
    ctaLabel: "Prova CaptureFlow gratis",
    installChrome: "Installera Chrome-tillägget",
    installMac: "Ladda ner för macOS",
    installSoon: "Snart",
    connectMcp: "Anslut till MCP",
    macSoon: "macOS-app kommer snart",
    installOr: "eller",
    mcpCopy: "Kopiera",
    mcpCopied: "Kopierat",
    mcpAddToCursor: "Lägg till i Cursor",
    badge: "Öppen källkod, gratis att köra på {github}",
    noCreditCard: "Inget kreditkort krävs",
    teaser: {
      title: "Kan självhostas",
      body: "Kör det på ditt eget Cloudflare-konto.",
      cta: "Prova CaptureFlow",
    },
    demo: {
      prevAria: "Föregående demo",
      nextAria: "Nästa demo",
      dotAria: "Visa demo {n} av {total}",
    },
  },
  highlights: {
    heading: "Alla funktioner",
    subtitle: "Spela in, redigera och dela. Allt finns på ett ställe.",
    items: {
      recording: {
        title: "Skärm och kamera",
        body: "Spela in båda samtidigt",
      },
      transcripts: { title: "Transkriptioner", body: "På 99 språk", tag: "AI" },
      editing: {
        title: "Redigera i transkriptionen",
        body: "Radera text för att klippa videon",
        tag: "AI",
      },
      camera: {
        title: "Kameraeffekter",
        body: "Bakgrunder och filter",
      },
      canvas: { title: "Oändlig rityta", body: "Skissa medan du spelar in" },
      screenshots: {
        title: "Skärmdumpar med markeringar",
        body: "Pilar, text och oskärpa",
      },
      feedback: {
        title: "Kommentarer och reaktioner",
        body: "Feedback på videon",
      },
      summary: {
        title: "Sammanfattningar och kapitel",
        body: "Med en titel för varje video",
        tag: "AI",
      },
      filler: {
        title: "Tar bort utfyllnadsord",
        body: "Klipper bort eh och öh automatiskt",
        tag: "AI",
      },
    },
    cta: "Se alla funktioner",
    previews: {
      app: "Lanseringsplan",
      columns: ["Att göra", "Pågår", "Klart"],
      lines: [
        "Här är det nya flödet.",
        "Först väljer du en arbetsyta.",
        "Sedan delar du länken.",
      ],
      retake: "Eh, jag börjar om.",
      filler: [
        "[Eh,] här är det nya flödet.",
        "Först [öh,] väljer du en arbetsyta.",
        "Sedan [eh,] delar du länken.",
      ],
      step: "Steg 1",
      note: "Flytta den här",
      comment: "Gillar flödet",
      summaryTitle: "Så bjuder du in ditt team",
      summaryBody: "Välj en arbetsyta och dela sedan länken.",
      chapters: ["Intro", "Välj en arbetsyta"],
    },
  },
  mcpFeatures: {
    heading: "MCP-funktioner",
    subtitle:
      "Det här kan din AI-agent göra när den är ansluten. Den spelar in på din egen dator, med Claude Code, Codex, Cursor eller valfri MCP-klient.",
    cta: "Läs guiden",
    items: {
      webApp: { title: "Spela in en webbapp", body: "Även på localhost" },
      screen: { title: "Spela in skärmen", body: "En hel bildskärm" },
      window: {
        title: "Spela in ett fönster",
        body: "Terminal, VS Code eller Figma",
      },
      slides: {
        title: "Lägg till slides",
        body: "Titlar, steg och avslutning",
      },
      voiceover: {
        title: "Lägg till berättarröst",
        body: "Körs på din dator",
      },
      report: {
        title: "Skriv en rapport",
        body: "Vad den gjorde och vad som gick fel",
      },
      search: {
        title: "Sök bland inspelningar",
        body: "Videor och transkriptioner",
      },
      save: {
        title: "Spara MP4-filer",
        body: "Ingen uppladdning eller inloggning",
      },
    },
  },
  useCases: {
    heading: "Så använder team det",
    subtitle:
      "Exempel på vad team spelar in. Varje video är en länk som spelas upp i vilken webbläsare som helst.",
    cta: "Se hur det fungerar",
    cards: {
      engineering: {
        title: "Utveckling",
        body: "Spela in en genomgång av en PR eller hur en bugg återskapas.",
      },
      design: {
        title: "Design",
        body: "Spela in en genomgång av en skiss och samla in kommentarer.",
      },
      support: {
        title: "Kundsupport",
        body: "Svara på ett ärende med en kort genomgång.",
      },
      updates: {
        title: "Teamuppdateringar",
        body: "Spela in veckouppdateringen och dela länken.",
      },
    },
    engineeringFile: "checkout.ts",
    engineeringPr: "PR #482",
    designApp: "trip-app",
    designBadge: "Kassa v3",
    designCardTitle: "Planera din resa",
    designColors: "Färger",
    designComment: "Större knapp?",
    supportQuestion: "Hur bjuder jag in mitt team till arbetsytan?",
    supportReply: "Här är en snabb genomgång:",
    supportLink: "captureflow.dev/r/8kx2pnq4",
    updatesTitle: "Veckouppdatering",
    updatesRange: "6–10 okt",
    updatesSignups: "Registreringar",
    updatesShipped: "Släppt",
    updatesFeatures: "funktioner",
  },
  agents: {
    heading: "Eller be din AI-agent spela in dina demor och guider",
    worksWith: "Fungerar med {claude}, {openai} och {cursor}.",
    cta: "Läs guiden",
    subtitle:
      "Be om det med vanliga ord. Den spelar in en webbläsare, din skärm eller en app på din egen dator, lägger till slides och berättarröst om du vill, och ger dig en länk.",
    steps: [
      {
        title: "Anslut din agent",
        body: "Lägg till CaptureFlow i Claude Code, Codex eller Cursor med en rad. Du behöver Node.js 20 eller senare, och din agent loggar in en gång. I Claude eller ChatGPT lägger du till det via URL.",
      },
      {
        title: "Be om en video",
        body: "En funktionsdemo, en guide, en buggrapport eller en presentation med berättarröst.",
      },
      {
        title: "Den spelar in åt dig",
        body: "På din dator, även en app på localhost.",
      },
      {
        title: "Lägger till slides och röst",
        body: "Titelslides och berättarröst, om du vill ha det.",
      },
      {
        title: "Ger dig en länk att dela",
        body: "Bifoga den i en pull request, lägg upp den i Slack eller skicka den till en kund.",
      },
    ],
    scenes: {
      ask: {
        name: "terminal",
        badge: "agent",
        prompt: "Spela in en demo av kassan",
        steps: ["Öppnar appen", "Klickar igenom", "Din länk är klar"],
      },
      record: {
        url: "localhost:3000",
        badge: "demo",
        title: "Kassa",
        fields: ["Ditt namn", "Kortnummer"],
        pay: "Betala nu",
        paid: "Betalt",
      },
      voice: {
        title: "Demo av kassan",
        subtitle: "Så betalar du i tre steg",
      },
      share: {
        title: "Demo av kassan",
        link: "captureflow.dev/r/checkout",
        places: ["PR", "Slack", "E-post"],
      },
    },
    chats: {
      claude:
        "I Claude öppnar du Customize, sedan Connectors, och väljer Add custom connector. Ge den namnet CaptureFlow, klistra in den här URL:en och logga sedan in.",
      chatgpt:
        "I ChatGPT på webben öppnar du Plugins, trycker på + och väljer Add custom MCP server. Ge den namnet CaptureFlow, klistra in den här URL:en, välj OAuth, installera sedan pluginet och logga in. Kräver en Business-, Enterprise- eller Edu-plan.",
      limits:
        "Chattar bygger presentations- och instruktionsvideor av bilder på våra servrar, inte inspelningar av din dator, och använder din plans agentminuter i molnet.",
    },
  },
  modes: {
    cta: "Börja spela in",
    heading: "Spela in skärmen med Chrome-tillägget",
    subtitle:
      "Installera det och tryck på spela in. När du är klar får du en länk som vem som helst kan titta på, med titel, sammanfattning, kapitel och transkription.",
    scene: {
      timer: "0:42",
      heading: "Så fungerar en återbetalning",
      steps: ["Begär", "Godkänn", "Betala ut"],
      captions: [
        "Snabb genomgång av hur en återbetalning fungerar.",
        "Först skickar kunden in en begäran.",
        "Supporten godkänner den samma dag.",
        "Sedan betalas pengarna ut automatiskt.",
      ],
    },
  },
  pageHeroes: {
    home: "Hem",
    features: {
      label: "Funktioner",
      word: "FUNKTIONER",
      title: "Spela in, redigera och dela din skärm",
      subtitle:
        "Spela in skärmen och kameran. Dela varje inspelning som en länk som teamet kan kommentera.",
    },
    pricing: {
      label: "Priser",
      word: "PRISER",
      title: "Börja gratis. Betala ett pris per medlem.",
      subtitle:
        "Gratis täcker dina första 25 inspelningar. Light och Pro tar bort gränsen. Du kan också självhosta CaptureFlow gratis.",
    },
    faq: {
      label: "Vanliga frågor",
      word: "FRÅGOR",
      title: "Vanliga frågor",
      subtitle:
        "Svar om inspelning, priser, lagring och självhosting. Läs dokumentationen för allt annat.",
    },
    chromeExtension: {
      label: "Chrome-tillägg",
      word: "CHROME",
      title: "Spela in skärmen i Chrome",
      subtitle:
        "Spela in skärmen, en flik eller kameran. När du är klar får du en länk som alla kan titta på, med transkription, sammanfattning och kapitel.",
    },
    agentRecorder: {
      label: "Inspelare för agenter",
      word: "MCP",
      title: "Låt din AI-agent spela in dina videor",
      subtitle:
        "Anslut den via MCP och be med vanliga ord. Den spelar in en webbapp, din skärm eller ett fönster, lägger till bilder och röst om du vill och ger dig en länk.",
    },
  },
  collaboration: {
    heading: "Det här kan du göra efter inspelningen",
    cta: "Prova gratis",
    subtitle:
      "Redigera den och dela eller bädda sedan in den. Bjud in ditt team för att titta, reagera och kommentera varandras videor.",
    categories: {
      share: {
        feature: {
          tag: "nytt",
          title: "Redigera din video",
          cta: "Installera tillägget",
          body: "Radera ord i transkriptionen för att klippa bort dem ur videon, eller trimma klipp på tidslinjen. Byt bakgrund, flytta, ändra storlek på eller dölj kameran, och stäng av mikrofonen eller systemljudet.",
        },
        scene: {
          app: "Lanseringsplan",
          nav: ["Översikt", "Färdplan", "Uppgifter", "Dokument"],
          columns: [
            {
              name: "Att göra",
              tasks: ["Text till prissidan", "Onboardingmejl"],
            },
            {
              name: "Pågår",
              tasks: ["Ny design av kassan", "Teaminbjudningar"],
            },
            { name: "Klart", tasks: ["Formulär för betaanmälan"] },
          ],
          background: "Bakgrund",
          camera: "Kamera",
          shapes: ["Cirkel", "Kvadrat"],
          fillers: "Utfyllnadsord",
          remove: "Ta bort",
          transcript: {
            before: "Klicka här för att",
            fillers: ["eh,", "vänta,", "förlåt,"],
            after: "dela länken.",
          },
          saved: "Sparat · samma länk",
        },
      },
      embed: {
        feature: {
          title: "Dela eller bädda in din video",
          cta: "Installera tillägget",
          body: "Klistra in länken i Slack, GitHub, Notion eller ett mejl så visas en förhandsvisning. Du kan också bädda in spelaren i din dokumentation eller på din webbplats. Med tillägget installerat spelas den upp direkt i issues och pull requests på GitHub.",
        },
        scene: {
          question: "Kan du visa hur jag bjuder in mitt team till arbetsytan?",
          reply: "Självklart! Här är en kort genomgång av stegen:",
          url: "captureflow.dev/r/8kx2pnq4",
          app: "Inställningar",
          nav: ["Allmänt", "Medlemmar", "Fakturering"],
          members: "Medlemmar",
          invite: "Bjud in",
          people: [
            { initials: "AR", name: "Alex Rivera", role: "Ägare" },
            { initials: "CK", name: "Chris Kim", role: "Medlem" },
            { initials: "JB", name: "Jordan Bell", role: "Medlem" },
          ],
          duration: "0:48",
        },
      },
      feedback: {
        feature: {
          title: "Samarbeta kring dina videor",
          cta: "Logga in",
          body: "Arbeta tillsammans utan möten, över tidszoner. Ditt team kan reagera med emojier, kommentera när som helst i videon och följa med via transkriptioner och undertexter.",
        },
        scene: {
          title: "Genomgång av lanseringsplanen",
          author: "Alex",
          age: "just nu",
          duration: "1:12",
          activity: "Aktivitet",
          events: [
            { initials: "CK", name: "Chris", at: "0:09", emoji: "👍" },
            { initials: "JB", name: "Jordan", at: "0:17", emoji: "🔥" },
            {
              initials: "MC",
              name: "Maya",
              at: "0:27",
              text: "Gillar den nya tavelvyn",
            },
            { initials: "SL", name: "Sam", at: "0:37", emoji: "❤️" },
            {
              initials: "JB",
              name: "Jordan",
              at: "0:48",
              text: "Kan vi släppa det på fredag?",
            },
            {
              initials: "AR",
              name: "Alex",
              at: "0:56",
              text: "Ja, direkt efter QA ✅",
            },
            { initials: "MC", name: "Maya", at: "1:05", emoji: "👏" },
          ],
        },
      },
      workspaces: {
        feature: {
          title: "Bjud in ditt team till en arbetsyta",
          cta: "Skapa en arbetsyta",
          body: "Allas inspelningar samlas i en arbetsyta. Varje video kan vara offentlig, synlig för arbetsytan eller privat.",
        },
        scene: {
          team: "CaptureFlow-teamet",
          members: ["1 medlem", "2 medlemmar", "3 medlemmar"],
          memberInitials: ["AR", "CK", "JB"],
          invitePlaceholder: "Bjud in via e-post",
          inviteEmail: "chris@acme.co, jordan@acme.co",
          invite: "Bjud in",
          invited: "Skickat",
          joined: "Chris och Jordan har gått med 🎉",
          whoCanWatch: "Vem kan titta:",
          visibility: [
            { label: "Offentlig", detail: "Alla med länken" },
            { label: "Arbetsyta", detail: "Bara ditt team" },
            { label: "Privat", detail: "Bara du" },
          ],
        },
      },
    },
  },
  setupService: {
    title: "Vi sätter upp det",
    titleHighlight: "åt dig",
    subtitle:
      "Berätta om ditt företag. Vi sätter upp appen, Chrome-tillägget, macOS-appen och all infrastruktur bakom, redo för ditt team att använda.",
    includedHeading: "Allt vi sätter upp",
    included: {
      infra: {
        title: "Appen, på din infrastruktur",
        body: "Driftsatt på ditt eget Cloudflare-konto och tillgänglig på din domän. Du äger alltihop.",
      },
      storage: {
        title: "Lagring och databas",
        body: "Inspelningar i din egen R2-bucket; arbetsytor och kommentarer i din egen databas.",
      },
      signin: {
        title: "Inloggning bara för företaget",
        body: "Inloggning med Google Workspace eller GitHub, begränsad till ditt företags e-postdomän.",
      },
      apps: {
        title: "Chrome-tillägg och Mac-app",
        body: "Båda byggs för din instans, och tillägget publiceras privat för ditt team.",
      },
      ready: {
        title: "Redo att spela in",
        body: "Arbetsytor skapade och ditt team inbjudet, så att alla kan börja dela direkt.",
      },
      handover: {
        title: "Överlämning",
        body: "Vi går igenom drift och uppdateringar med den som ska förvalta det.",
      },
    },
    nextHeading: "Kontakta oss",
    nextSubheading: "Berätta vad du behöver så återkommer vi.",
    form: {
      company: "Företag",
      companyPlaceholder: "Acme AB",
      name: "Ditt namn",
      namePlaceholder: "Jane Doe",
      email: "Jobbmejl",
      emailPlaceholder: "jane@acme.com",
      topic: "Vad kan vi hjälpa till med?",
      topics: ["Installation av självhosting", "Mer än 1 TB", "Något annat"],
      teamSize: "Teamstorlek",
      teamSizes: ["1–10", "11–50", "51–200", "200+"],
      cloudflare: "Har du ett Cloudflare-konto?",
      cloudflareOptions: ["Ja", "Nej", "Vet inte"],
      notes: "Något mer vi bör veta?",
      notesPlaceholder: "Teamets storlek, din domän, din tidsplan…",
      submit: "Skicka meddelande",
      error:
        "Din förfrågan kunde inte skickas. Försök igen eller mejla oss på {email}.",
      sentTitle: "Meddelandet är skickat",
      sentBody: "Tack. Vi återkommer till dig på {email}.",
      back: "Tillbaka till startsidan",
    },
  },
  swarmDemo: {
    title: "Se en svärm av agenter bygga om",
    titleHighlight: "vilken webbplats som helst",
    subtitle:
      "Skriv in en webbadress. En svärm av agentmarkörer ritar upp den igen element för element, till musik, och du får en videolänk att dela.",
    url: "Webbadress",
    urlPlaceholder: "https://example.com",
    generate: "Skapa demo",
    generating: "Startar en webbläsare i molnet…",
    check: "Kontrollera webbplatsen",
    checking: "Kontrollerar webbplatsen…",
    previewNote:
      "Det här är sidan som agenterna bygger upp igen. Skapa demon när den ser rätt ut.",
    change: "Ändra adress",
    note: "Logga in för att skapa gratis. Varje demo hamnar i ditt bibliotek.",
    noteSignedIn: "Skapa gratis. Varje demo hamnar i ditt bibliotek.",
    howHeading: "Så fungerar det",
    how: {
      type: {
        title: "Skriv in en adress",
        body: "Vilken offentlig webbplats som helst. Sidan laddas i en webbläsare i molnet och varje rubrik, bild, knapp och kort hittas.",
      },
      build: {
        title: "Agenterna bygger upp den igen",
        body: "Förfrågan skrivs in i en chattruta, sedan placerar en svärm av markörer varje element medan musiken går allt snabbare.",
      },
      share: {
        title: "Få en länk",
        body: "Videon öppnas i ditt bibliotek så snart den är klar. Dela länken, ladda ner filen eller lägg upp den.",
      },
    },
    errors: {
      invalidUrl: "Ange en webbadress som example.com.",
      unreachable:
        "Webbplatsen gick inte att nå. Kontrollera adressen och försök igen.",
      unavailable: "Demor är inte tillgängliga på den här servern.",
      running:
        "En av dina inspelningar pågår fortfarande. Vänta tills den är klar och försök igen.",
      limit:
        "Den här arbetsytan har använt sina agentminuter i molnet för den här månaden. De återställs den 1:a.",
      recordings:
        "Du har nått gratisplanens gräns för inspelningar. Ta bort en inspelning eller uppgradera och försök igen.",
      busy: "Alla webbläsare i molnet är upptagna just nu. Försök igen om några minuter.",
      failed: "Demon kunde inte startas. Försök igen.",
    },
  },
  enterprise: {
    title: "CaptureFlow för",
    titleHighlight: "ditt företag",
    subtitle:
      "Den hanterade planen för företag som vill ha licenser för alla på villkor som avtalas en gång, med en enda faktura.",
    includedHeading: "Det här tillför Enterprise",
    included: {
      storage: {
        title: "Lagring anpassad efter dig",
        body: "En pool som är dimensionerad efter hur mycket ditt företag spelar in, inte en tilldelning per licens.",
      },
      seats: {
        title: "Licenser för alla",
        body: "Ett avtal täcker hela företaget, oavsett hur många som spelar in.",
      },
      roadmap: {
        title: "Dina önskemål först",
        body: "Funktioner som ditt team ber om hamnar högst upp på vår lista.",
      },
      managed: {
        title: "Fullt hanterat",
        body: "Vi står för driften och släpper uppdateringar, så du har inget att sköta själv.",
      },
      billing: {
        title: "Årsfakturering",
        body: "Betala en gång om året, till ett pris som avtalats för ditt företag.",
      },
      support: {
        title: "En direktlinje till oss",
        body: "Frågor går direkt till dem som bygger CaptureFlow.",
      },
    },
    everythingHeading: "Allt ditt team får",
    comingSoon: "Kommer snart",
    everything: {
      extension: {
        title: "Chrome-tillägg",
        body: "Spela in valfri flik eller skärm, med en länk klar när du stoppar.",
      },
      mac: {
        title: "Mac-app",
        body: "En inspelare byggd för macOS, med samma direkta delningslänkar.",
      },
      workspaces: {
        title: "Arbetsytor för team",
        body: "Allas inspelningar på ett ställe, delade eller privata.",
      },
      feedback: {
        title: "Kommentarer och reaktioner",
        body: "Tittare svarar direkt på tidslinjen, vid exakt det ögonblick de menar.",
      },
      edit: {
        title: "Redigera efter delning",
        body: "Byt bakgrund, kamera eller ljud, och länken förblir densamma.",
      },
      screenshots: {
        title: "Skärmdumpar med markeringar",
        body: "Markera i en skärmdump med pilar, text och oskärpa och dela den som en länk.",
      },
    },
    formHeading: "Kontakta oss",
    formSubheading: "Berätta om ditt team så svarar vi via e-post.",
    form: {
      company: "Företag",
      companyPlaceholder: "Acme AB",
      name: "Ditt namn",
      namePlaceholder: "Jane Doe",
      email: "Jobbmejl",
      emailPlaceholder: "jane@acme.com",
      need: "Vad behöver du?",
      needs: [
        "Licenser för ett stort team",
        "Egna villkor eller en enda faktura",
        "Något annat",
      ],
      teamSize: "Teamstorlek",
      teamSizes: ["1–10", "11–50", "51–200", "200+"],
      storage: "Hur mycket lagring?",
      storageOptions: ["1–5 TB", "5–20 TB", "20 TB+", "Vet inte"],
      notes: "Något mer vi bör veta?",
      notesPlaceholder:
        "Hur mycket ditt team spelar in, din tidsplan, faktureringsbehov…",
      submit: "Skicka meddelande",
      error:
        "Ditt meddelande kunde inte skickas. Försök igen eller mejla oss på {email}.",
      sentTitle: "Meddelandet är skickat",
      sentBody: "Tack. Vi återkommer till dig på {email}.",
      back: "Tillbaka till startsidan",
    },
  },
  pricing: {
    heading: "Priser",
    cta: "Jämför alla planer",
    subheading:
      "Gratis täcker dina första inspelningar. Betalda planer har ett pris per medlem.",
    controls: {
      shownIn:
        "Priserna visas i {currency}. Du debiteras i amerikanska dollar.",
      teamSize: "Teamstorlek",
      members: "medlemmar",
      title: "Fakturering",
      note: "Ett pris per medlem.",
      billing: "Fakturera mig",
      monthly: "Månadsvis",
      annually: "Årsvis",
      save: "Spara {percent} %",
    },
    compare: {
      loomRow: "Loom {plan}",
      loomDetail: "{seats} personer × {perSeat} per person",
      caption: "Priser per månad.",
      captureflowRow: "CaptureFlow {ourPlan}",
      captureflowDetail: "{seats} medlemmar × {ourPerSeat} per medlem",
      saveLabel: "Ditt team sparar",
      saveValue: "{savings} per år",
    },
    plans: {
      chargedInUsd: "Debiteras i amerikanska dollar.",
      member: "medlem",
      members: "medlemmar",
      included: "Ingår",
      notIncluded: "Ingår inte",
      free: {
        name: "Gratis",
        description: "Skärminspelningar som du delar som en länk.",
        cta: "Registrera dig",
      },
      light: {
        name: LIGHT,
        featuresHeading: "Allt i Gratis, plus",
        features: [
          "Obegränsat antal inspelningar",
          "Obegränsad inspelningstid",
          `${LIGHT_AGENT_MIN} min per månad med agentinspelningar i molnet, upp till 10 min styck`,
        ],
        description: "Obegränsat antal inspelningar i datasparläge.",
        period: "/mån",
        noteMonthly: "Per medlem, faktureras månadsvis",
        noteAnnual:
          "Per medlem, faktureras årsvis. {yearly} per år för {seats} {members}",
        cta: "Prova gratis",
      },
      pro: {
        badge: "Rekommenderas",
        name: PRO,
        featuresHeading: `Allt i ${LIGHT}, plus`,
        features: [
          "Full kvalitet, upp till 1080p",
          "AI-kapitel, titlar och borttagning av utfyllnadsord",
          "Eget varumärke",
          `${PRO_AGENT_MIN} min per månad med agentinspelningar i molnet, med ${PRO_VOICEOVER_MIN} min AI-berättarröst`,
          "Tittarinsikter (kommer snart)",
          "Integrationer med Slack, Notion och Zapier (kommer snart)",
        ],
        description: "Full kvalitet, AI-rensning och ditt eget varumärke.",
        period: "/mån",
        noteMonthly: "Per medlem, faktureras månadsvis",
        noteAnnual:
          "Per medlem, faktureras årsvis. {yearly} per år för {seats} {members}",
        cta: "Prova gratis",
      },
      rows: {
        recordings: {
          label: "Inspelningar per person",
          free: "Upp till {recordings}",
          light: "Obegränsat",
          pro: "Obegränsat",
        },
        length: {
          label: "Inspelningslängd",
          free: "{minutes} min per video",
          light: "Obegränsat",
          pro: "Obegränsat",
        },
        quality: {
          label: "Videokvalitet",
          free: "Datasparläge",
          light: "Datasparläge",
          pro: "Upp till 1080p",
        },
        transcripts: {
          label: "Transkriptioner och undertexter",
          free: true,
          light: true,
          pro: true,
        },
        editing: {
          label: "Redigera via transkriptionen",
          free: true,
          light: true,
          pro: true,
        },
        chapters: {
          label: "AI-kapitel och titlar",
          free: false,
          light: false,
          pro: true,
        },
        filler: {
          label: "Borttagning av utfyllnadsord",
          free: false,
          light: false,
          pro: true,
        },
        feedback: {
          label: "Kommentarer och reaktioner",
          free: true,
          light: true,
          pro: true,
        },
        agents: {
          label: "Lokala agentinspelningar",
          free: true,
          light: true,
          pro: true,
        },
        cloudAgents: {
          label: "Agentinspelningar i molnet",
          free: `${FREE_AGENT_MIN} min per månad`,
          light: `${LIGHT_AGENT_MIN} min per månad`,
          pro: `${PRO_AGENT_MIN} min per månad`,
        },
        voiceover: {
          label: "Lokal AI-berättarröst",
          free: true,
          light: true,
          pro: true,
        },
        cloudVoiceover: {
          label: "AI-berättarröst i molnet",
          free: false,
          light: false,
          pro: `${PRO_VOICEOVER_MIN} min per månad`,
        },
        branding: {
          label: "Eget varumärke",
          free: false,
          light: false,
          pro: true,
        },
      },
    },
    table: {
      heading: "Alla funktioner, plan för plan",
      subtitle: "Gratis, Light och Pro sida vid sida.",
      groups: [
        {
          title: "Inspelning",
          rows: [
            {
              label: "Medlemmar",
              free: "Obegränsat",
              light: "Obegränsat",
              pro: "Obegränsat",
            },
            {
              label: "Inspelningar per person",
              free: "Upp till {recordings}",
              light: "Obegränsat",
              pro: "Obegränsat",
            },
            {
              label: "Inspelningslängd",
              free: "{minutes} min per video",
              light: "Obegränsat",
              pro: "Obegränsat",
            },
            {
              label: "Videokvalitet",
              free: "Datasparläge",
              light: "Datasparläge",
              pro: "Upp till 1080p",
            },
            {
              label: "Skärmdumpar",
              free: "Obegränsat",
              light: "Obegränsat",
              pro: "Obegränsat",
            },
            {
              label: "Inspelningar sparas",
              free: "30 dagar utan visning",
              light: "Tills du raderar dem",
              pro: "Tills du raderar dem",
            },
            {
              label: "Inspelning av hela skärmen, ett fönster eller en flik",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Kamerabubbla och kameraeffekter",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Mikrofon och systemljud",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Mjuk muspekare",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Chrome-tillägg och Mac-app",
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
              label: "Transkriptioner",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Undertexter",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Kapitel med sammanfattning",
              free: false,
              light: false,
              pro: true,
            },
            {
              label: "Automatiskt föreslagna titlar",
              free: false,
              light: false,
              pro: true,
            },
            {
              label: "Redigera videon via transkriptionen",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Borttagning av utfyllnadsord",
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
              label: "Agentinspelningar på din dator",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Agentpresentationer gjorda i molnet",
              free: `${FREE_AGENT_MIN} min per månad per person`,
              light: `${LIGHT_AGENT_MIN} min per månad per medlem`,
              pro: `${PRO_AGENT_MIN} min per månad per medlem`,
            },
            {
              label: "Slides i agentinspelningar",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "AI-berättarröst på din dator",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "AI-berättarröst i molnpresentationer",
              free: false,
              light: false,
              pro: `${PRO_VOICEOVER_MIN} min per månad per medlem`,
            },
          ],
        },
        {
          title: "Redigering",
          rows: [
            {
              label: "Redigera efter delning, samma länk",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Bakgrunder",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Flytta kamerabubblan eller ändra dess storlek",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Klipp bort delar av videon",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Skärmdumpar med pilar, text och oskärpa",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Oändlig rityta",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "Delning och feedback",
          rows: [
            {
              label: "Delningslänk klar när du stoppar",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Länkar som är offentliga, för arbetsytan eller privata",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Begär åtkomst via begränsade länkar",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Förhandsvisning av länkar i chatt och e-post",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Bädda in spelaren var som helst",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Spelas upp i issues och pull requests på GitHub",
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
              label: "Emojireaktioner",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Antal visningar",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Ladda ner originalfilen",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "Arbetsyta och administration",
          rows: [
            {
              label: "Arbetsyta för teamet",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Roller: ägare, medlem och tittare",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Standardsynlighet och uppladdningsbehörigheter",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Sök bland inspelningar och skärmdumpar",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Eget varumärke",
              free: false,
              light: false,
              pro: true,
            },
          ],
        },
        {
          title: "Hosting och support",
          rows: [
            {
              label: "Öppen källkod under AGPL",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Självhosta på ditt eget Cloudflare-konto",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Hanterad hosting och uppdateringar",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
      ],
    },
    includes: {
      heading: "Alla planer innehåller",
      items: [
        "Din egen arbetsyta, bjud in vem du vill",
        "Kameraeffekter",
        "AI-transkriptioner och undertexter",
        "Redigera videon via transkriptionen",
        "Delningslänkar som är offentliga, för arbetsytan eller privata",
        "Kommentarer och emojireaktioner",
        "Skärmdumpar med markeringar",
        "Oändlig rityta",
      ],
    },
    annual: {
      badgePro: "Hanterad",
      badgeCycle: "Årsvis",
      title: "Hanterad hosting",
      subtitle: "Helt hostat, faktureras årsvis.",
      period: "/månad",
      note: "Faktureras {amount}/år. Avsluta när du vill.",
      cta: "Kom igång",
    },
  },
  activity: {
    heading: "Senaste ändringarna på GitHub",
    subtitle:
      "Alla ändringar är offentliga. Här är de senaste pull requests och öppna issues på GitHub.",
    cta: "Visa på GitHub",
    shippedHeading: "Nyligen mergat",
    openHeading: "Öppna issues och pull requests",
    emptyOpen: "Inget öppet just nu.",
    newIssue: "Rapportera en bugg eller önska en funktion",
    viewAll: "Se allt på GitHub",
  },
  faq: {
    heading: "Vanliga frågor",
    subtitle:
      "Svar om inspelning, priser, lagring och självhosting. Läs dokumentationen för allt annat.",
    cta: "Läs dokumentationen",
    waitlistLink: "Ställ dig på väntelistan",
    items: [
      {
        question: "Hur gör jag en inspelning?",
        answer:
          "Det finns två sätt, och skillnaden är vem som spelar in.\n\nMed Chrome-tillägget spelar du in själv. Du klickar dig igenom skärmen och kan berätta med din egen röst och kamera. Använd det för snabba uppdateringar, feedback eller allt där du själv behöver vara med.\n\nMed en AI-agent beskriver du videon, och agenten klickar sig igenom och spelar in åt dig så att du kan jobba vidare. Den kan lägga till slides och en AI-berättarröst. Använd det för produktdemor, guider och buggrapporter.\n\nSå spelar du in själv:\n1. Installera CaptureFlow-tillägget från Chrome Web Store.\n2. Klicka på dess ikon i webbläsarens verktygsfält och logga in.\n3. Klicka på ikonen igen. Välj This tab, Window eller Full screen, och slå på kameran och mikrofonen om du vill använda dem.\n4. Tryck på Start Recording. Med ett fält på sidan kan du pausa eller stoppa.\n5. Tryck på stopp. Sidan för din inspelning öppnas, med en länk som du kan dela med vem som helst.\n\nSå låter du en agent spela in:\n1. Anslut CaptureFlow till den AI-app du använder. Avsnittet om agenter på startsidan har stegen för Claude, ChatGPT, Claude Code, Codex och Cursor.\n2. Logga in när en webbläsarflik öppnas. Det gör du bara en gång.\n3. Be om videon med vanliga ord, till exempel: Spela in en demo av hur man registrerar sig på vår webbplats, med berättarröst.\n4. Agenten spelar in och ger dig en länk som du kan dela med vem som helst.",
      },
      {
        question: "Kan jag självhosta CaptureFlow?",
        answer:
          "Ja. CaptureFlow har öppen källkod under AGPL, och hela backenden körs på Cloudflare: Workers för appen och API:et, R2 för inspelningar och D1 för allt annat. Skapa en D1-databas och en R2-bucket, kör migreringarna, ange en hemlighet och driftsätt. Det finns också en Deploy to Cloudflare-knapp. Guiden finns på docs.captureflow.dev.",
      },
      {
        question: "Kan min AI-agent spela in videor åt mig?",
        answer:
          "Ja. Lägg till CaptureFlow i Claude Code, Codex eller Cursor med en rad, eller lägg till det i Claude eller ChatGPT, och be sedan om en video med vanliga ord. Den spelar in en webbläsare, din skärm eller en app på din egen dator, lägger till slides och berättarröst om du vill, och ger dig en länk att dela.\n\nLokala agentinspelningar ingår i alla planer. Agentinspelningar i molnet har en månadskvot som beror på din plan.",
      },
      {
        question: "Hur fungerar priserna för betalda planer?",
        answer: `${LIGHT} och ${PRO} har ett pris per medlem och månad, lägre vid årsfakturering. En medlem är någon som spelar in, så du betalar bara för dem som gör inspelningar.\n\nNär någon går med eller lämnar följer antalet licenser med på nästa faktura.`,
      },
      {
        question: "Hur länge sparas mina inspelningar?",
        answer:
          "På betalda planer sparas de tills du raderar dem. På gratisplanen tas en inspelning bort efter 30 dagar utan visning, så att inaktiva konton inte tar upp utrymme. Om du självhostar bestämmer du reglerna.",
      },
      {
        question: "Vad ingår i gratisplanen?",
        answer: `Du får 25 inspelningar per person, upp till 5 minuter vardera, i datasparläge, med transkriptioner och undertexter. Inspelningar tas bort efter 30 dagar utan visning. Registrera dig, installera Chrome-tillägget och börja spela in.\n\n${LIGHT} tar bort gränserna för ett pris per medlem och sparar inspelningarna tills du raderar dem.`,
      },
    ],
  },
  cta: {
    headline: "Börja spela in",
    subtitle:
      "Gratis nedladdning. Inget kreditkort. Säg det i ett kort videomeddelande i stället för ännu ett möte.",
    button: "Prova CaptureFlow gratis",
  },
  footer: {
    tagline: "Skärminspelning med öppen källkod och delningslänkar direkt.",
    lights: "Belysning",
    lightsOn: "På · dra i snöret",
    lightsOff: "Av · dra i snöret",
    product: {
      title: "Produkt",
      features: "Funktioner",
      pricing: "Priser",
      compare: "Jämför",
      download: "Ladda ner",
      suggest: "Föreslå en funktion",
    },
    resources: {
      title: "Resurser",
      docs: "Dokumentation",
      selfHosting: "Självhosting",
      blog: "Blogg",
      releases: "Versioner",
      faq: "Vanliga frågor",
      security: "Säkerhet",
    },
    community: {
      title: "Community",
    },
    legal: {
      title: "Juridiskt",
      privacy: "Integritetspolicy",
      terms: "Användarvillkor",
      refund: "Återbetalningspolicy",
      license: "Licens (AGPL-3.0)",
    },
    rights: "© {year} CaptureFlow. Alla rättigheter förbehållna.",
    openSource: "Öppen källkod under AGPL-3.0",
  },
  pageShell: {
    logoAlt: "CaptureFlow",
    backToHome: "Tillbaka till startsidan",
  },
  waitlist: {
    errors: {
      joinFailed: "Det gick inte att gå med i väntelistan. Försök igen.",
      network: "Nätverksfel. Försök igen.",
    },
    success: "Du står på listan. Jag mejlar dig när CaptureFlow är klart.",
    emailPlaceholder: "you@example.com",
    buttonLoading: "Går med…",
    buttonDefault: "Gå med i väntelistan",
    earlyAccessPrompt: "Vill du ha tidig åtkomst?",
    earlyAccessLink: "Bli betatestare",
  },
  download: {
    heading: "Ladda ner CaptureFlow",
    subtitle:
      "Finns för Chrome, och en macOS-app kommer snart. Varje inspelning får en länk som du kan dela.",
    button: "Ladda ner för macOS",
    requires: "Kräver {version} eller senare på Apple Silicon.",
    requirements: "Kräver macOS 14 eller senare på Apple Silicon.",
    versionLabel: "Version {version}",
    sizeLabel: "{size} MB DMG",
    notarized: "Signerad och notariserad av Apple",
  },
  downloadPage: {
    otherWays: "Andra sätt att skaffa det",
    buildTitle: "Bygg från källkod",
    buildBody: "Klona repot och kör inspelaren lokalt med pnpm.",
    releasesTitle: "Alla versioner",
    releasesBody:
      "Bläddra bland alla publicerade byggen och ändringsloggar på GitHub.",
    cloud:
      "Föredrar du molnet? {link} och titta på inspelningar i webbläsaren.",
    cloudLink: "Skapa ett konto",
  },
  blog: {
    title: "Blogg",
    subtitle: "Tips, guider och nyheter om skärminspelning.",
    readArticle: "Läs artikeln",
    empty: "Inga inlägg än. Titta in igen snart.",
  },
};

export default messages;

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
      title: "CaptureFlow - Näytön tallennusohjelma ja jaettavat linkit",
      description:
        "Tallenna näyttösi ja jaa linkki tiimille tai asiakkaille. Avoimen lähdekoodin näytön tallennusohjelma: tekoälylitteroinnit, kuvakaappaukset ja oma ylläpito Cloudflaressa.",
    },
    features: {
      title: "Näytön tallennusohjelman ominaisuudet",
      description:
        "Tallenna välilehti, ikkuna tai koko näyttö kameran ja mikrofonin kanssa, lisää kuvakaappauksiin merkintöjä ja jaa kaikki linkkinä, jota tiimisi voi kommentoida.",
    },
    pricing: {
      title: "Hinnat: aloita ilmaiseksi, yksi hinta jäsentä kohden",
      description: `Aloita ilmaiseksi: ${FREE_RECORDINGS} tallennetta. ${LIGHT} ja ${PRO} maksavat yhden hinnan jäsentä kohden, ja tallenteita ja tekoälyä saa rajattomasti. Tai ylläpidä CaptureFlow'ta itse ilmaiseksi.`,
    },
    faq: {
      title: "UKK: jakaminen, tallennustila ja oma ylläpito",
      description:
        "Usein kysyttyä CaptureFlow'sta: miten jakolinkit toimivat, mitä oma ylläpito Cloudflaressa vaatii, tallennustilan rajat ja miten tallenteet pysyvät yksityisinä.",
    },
    download: {
      title: "Lataa näytön tallennusohjelma Chromeen",
      description:
        "Asenna CaptureFlow'n Chrome-laajennus, tallenna näyttösi ja jaa tallenne linkillä.",
    },
    enterprise: {
      title: "Enterprise",
      description:
        "Ylläpidetty CaptureFlow suuremmille yrityksille: käyttäjäpaikat kaikille, räätälöidyt ehdot ja yksi lasku. Kerro, mitä tarvitset.",
    },
    selfHostSetup: {
      title: "Oman ylläpidon käyttöönotto",
      description:
        "Tilaa CaptureFlow'n asennus yrityksesi omalle Cloudflare-tilille: oma verkkotunnus, kirjautuminen vain yrityksen tunnuksilla ja yksityinen Chrome-laajennus tiimillesi.",
    },
    swarmDemo: {
      title:
        "Parvidemo: agentit rakentavat minkä tahansa sivuston uudelleen videolla",
      description:
        "Kirjoita sivuston osoite ja katso, kuinka parvi agenttikursoreita rakentaa sen uudelleen elementti kerrallaan musiikin tahdissa. Saat videon ja jaettavan linkin.",
    },
    chromeExtension: {
      title: "Chrome-laajennus: tallenna näyttösi ja jaa linkki",
      description:
        "Tallenna näyttösi, välilehti tai kamerasi Chromessa. Lopuksi saat linkin, jota kuka tahansa voi katsoa, tekstityksen, yhteenvedon ja lukujen kanssa.",
    },
    agentRecorder: {
      title: "MCP-palvelin: tekoälyagenttisi tallentaa videoita",
      description:
        "Yhdistä Claude Code, Codex, Cursor tai ChatGPT CaptureFlow'hun MCP:n kautta. Agenttisi tallentaa verkkosovelluksen, näyttösi tai yhden ikkunan ja antaa sinulle jaettavan linkin.",
    },
  },
  nav: {
    features: "Ominaisuudet",
    discover: "Tutustu",
    pricing: "Hinnat",
    faq: "UKK",
    changelog: "Muutosloki",
    login: "Kirjaudu",
    library: "Omat tallenteet",
    download: "Lataa",
    language: "Kieli",
    openMenu: "Avaa valikko",
    menu: "Valikko",
    main: "Päävalikko",
    docs: "Dokumentaatio",
    resources: "Resurssit",
    faqDescription: "Vastaukset yleisiin kysymyksiin",
    blog: "Blogi",
    blogDescription: "Oppaat ja uutiset",
    selfHosting: "Oma ylläpito",
    selfHostingDescription: "Käytä omalla Cloudflare-tililläsi",
    community: "Yhteisö",
    communityDescription: "Kysy apua ja keskustele Discordissa",
    products: "Tuotteet",
    swarmDemo: "Parvidemo",
    swarmDemoDescription:
      "Agentit rakentavat minkä tahansa sivuston uudelleen videolla",
    extension: "Chrome-laajennus",
    extensionDescription: "Tallenna näyttösi ja jaa linkki",
    agentRecorder: "Tallennin agenteille",
    agentRecorderDescription:
      "Videot, jotka tekoälyagenttisi tekee MCP:n kautta",
    star: "Anna tähti GitHubissa",
    starCount: "Anna tähti GitHubissa ({stars})",
    themeToLight: "Vaihda vaaleaan teemaan",
    themeToDark: "Vaihda tummaan teemaan",
  },
  banner: {
    label: "Beta",
    aria: "CaptureFlow on julkisessa betavaiheessa",
    title: "Olet mukana ajoissa 🎉",
    strip:
      "CaptureFlow on vielä betavaiheessa, joten se muuttuu usein ja vastaan voi tulla keskeneräisiä kohtia, kunnes kaikki asettuu.",
    body: "CaptureFlow on julkisessa betavaiheessa. Uutta tulee lähes joka viikko, ja ensimmäisenä rakennetaan se, mitä käyttäjät pyytävät.",
    cta: "Kerro, mitä rakennan seuraavaksi",
    close: "Sulje",
  },
  announcement: {
    badge: "Uutta",
    lead: "Tekoälyagenttisi voi nyt tallentaa puolestasi.",
    rest: "Yhdistä se kerran, pyydä videota ja saat linkin.",
    cta: "Yhdistä",
  },
  hero: {
    title: "Näytön tallennus sinulle\nja tekoälyagenteillesi",
    subtitle:
      "Tallenna demot, ohjeet, läpikäynnit ja esitykset itse tai anna tekoälyn tallentaa ne puolestasi. Jaa jokainen linkkinä, jonka kuka tahansa voi katsoa.",
    ctaLabel: "Kokeile CaptureFlow'ta ilmaiseksi",
    installChrome: "Asenna Chrome-laajennus",
    installMac: "Lataa macOS:lle",
    installSoon: "Tulossa",
    connectMcp: "Yhdistä MCP:hen",
    macSoon: "macOS-sovellus tulossa pian",
    installOr: "tai",
    mcpCopy: "Kopioi",
    mcpCopied: "Kopioitu",
    mcpAddToCursor: "Lisää Cursoriin",
    badge: "Avointa lähdekoodia ja ilmainen käyttää: {github}",
    noCreditCard: "Luottokorttia ei tarvita",
    teaser: {
      title: "Itse ylläpidettävä",
      body: "Käytä sitä omalla Cloudflare-tililläsi.",
      cta: "Kokeile CaptureFlow'ta",
    },
    demo: {
      prevAria: "Edellinen demo",
      nextAria: "Seuraava demo",
      dotAria: "Näytä demo {n}/{total}",
    },
  },
  highlights: {
    heading: "Kaikki ominaisuudet",
    subtitle: "Tallenna, muokkaa ja jaa. Kaikki on yhdessä paikassa.",
    items: {
      recording: {
        title: "Näyttö ja kamera",
        body: "Tallenna molemmat yhtä aikaa",
      },
      transcripts: {
        title: "Litteroinnit",
        body: "99 kielellä",
        tag: "Tekoäly",
      },
      editing: {
        title: "Litteroinnin muokkaus",
        body: "Leikkaa videota poistamalla tekstiä",
        tag: "Tekoäly",
      },
      camera: {
        title: "Kameratehosteet",
        body: "Taustat ja suodattimet",
      },
      canvas: {
        title: "Rajaton piirtoalusta",
        body: "Piirrä tallennuksen aikana",
      },
      screenshots: {
        title: "Kuvakaappaukset merkinnöillä",
        body: "Nuolet, teksti ja sumennus",
      },
      feedback: {
        title: "Kommentit ja reaktiot",
        body: "Palaute suoraan videoon",
      },
      summary: {
        title: "Yhteenvedot ja luvut",
        body: "Sekä otsikko jokaiselle videolle",
        tag: "Tekoäly",
      },
      filler: {
        title: "Täytesanojen automaattipoisto",
        body: "Leikkaa pois öö:t ja niinkut",
        tag: "Tekoäly",
      },
    },
    cta: "Katso kaikki ominaisuudet",
    previews: {
      app: "Lanseeraus",
      columns: ["Tehtävät", "Työn alla", "Valmis"],
      lines: [
        "Tässä on uusi työnkulku.",
        "Valitse ensin työtila.",
        "Jaa sitten linkki.",
      ],
      retake: "Öö, aloitan alusta.",
      filler: [
        "[Öö,] tässä on uusi työnkulku.",
        "Valitse ensin, [tota,] työtila.",
        "Jaa sitten, [öö,] linkki.",
      ],
      step: "Vaihe 1",
      note: "Siirrä tämä",
      comment: "Hieno työnkulku",
      summaryTitle: "Näin kutsut tiimisi",
      summaryBody: "Valitse työtila ja jaa linkki.",
      chapters: ["Johdanto", "Valitse työtila"],
    },
  },
  mcpFeatures: {
    heading: "MCP-ominaisuudet",
    subtitle:
      "Mitä tekoälyagenttisi voi tehdä, kun se on yhdistetty. Se tallentaa omalla tietokoneellasi Claude Coden, Codexin, Cursorin tai minkä tahansa MCP-asiakkaan kanssa.",
    cta: "Lue opas",
    items: {
      webApp: { title: "Tallenna verkkosovellus", body: "Myös localhostissa" },
      screen: { title: "Tallenna näyttösi", body: "Koko näyttö" },
      window: {
        title: "Tallenna yksi ikkuna",
        body: "Pääte, VS Code tai Figma",
      },
      slides: { title: "Lisää dioja", body: "Otsikot, vaiheet ja loppusanat" },
      voiceover: { title: "Lisää selostus", body: "Toimii omalla koneellasi" },
      report: {
        title: "Kirjoita raportti",
        body: "Mitä se teki ja mikä epäonnistui",
      },
      search: { title: "Hae tallenteista", body: "Videot ja litteroinnit" },
      save: {
        title: "Tallenna MP4-tiedostoiksi",
        body: "Ei pilveen lähetystä eikä kirjautumista",
      },
    },
  },
  useCases: {
    heading: "Näin tiimit käyttävät sitä",
    subtitle:
      "Esimerkkejä siitä, mitä tiimit tallentavat. Jokainen video on linkki, joka toimii missä tahansa selaimessa.",
    cta: "Katso, miten se toimii",
    cards: {
      engineering: {
        title: "Ohjelmistokehitys",
        body: "Tallenna läpikäynti PR:stä tai bugin toistamisesta.",
      },
      design: {
        title: "Suunnittelu",
        body: "Tallenna läpikäynti luonnoksesta ja kerää kommentit.",
      },
      support: {
        title: "Asiakastuki",
        body: "Vastaa tukipyyntöön lyhyellä läpikäynnillä.",
      },
      updates: {
        title: "Tiimin kuulumiset",
        body: "Tallenna viikkokatsaus ja jaa linkki.",
      },
    },
    engineeringFile: "checkout.ts",
    engineeringPr: "PR #482",
    designApp: "trip-app",
    designBadge: "Kassa v3",
    designCardTitle: "Suunnittele matkasi",
    designColors: "Värit",
    designComment: "Isompi painike?",
    supportQuestion: "Miten kutsun tiimini työtilaan?",
    supportReply: "Tässä lyhyt läpikäynti:",
    supportLink: "captureflow.dev/r/8kx2pnq4",
    updatesTitle: "Viikkokatsaus",
    updatesRange: "6.–10. lokak.",
    updatesSignups: "Rekisteröitymiset",
    updatesShipped: "Julkaistu",
    updatesFeatures: "ominaisuutta",
  },
  agents: {
    heading: "Tai pyydä tekoälyagenttiasi tallentamaan demot ja ohjeet",
    worksWith: "Toimii näiden kanssa: {claude}, {openai} ja {cursor}.",
    cta: "Lue opas",
    subtitle:
      "Pyydä omin sanoin. Se tallentaa selaimen, näyttösi tai sovelluksen omalla tietokoneellasi, lisää halutessasi diat ja selostuksen ja antaa sinulle linkin.",
    steps: [
      {
        title: "Yhdistä agenttisi",
        body: "Lisää CaptureFlow Claude Codeen, Codexiin tai Cursoriin yhdellä rivillä. Tarvitset Node.js 20:n tai uudemman, ja agenttisi kirjautuu sisään kerran. Claudessa tai ChatGPT:ssä lisää se URL-osoitteella.",
      },
      {
        title: "Pyydä videota",
        body: "Ominaisuusdemo, ohje, bugiraportti tai selostettu diaesitys.",
      },
      {
        title: "Se tallentaa puolestasi",
        body: "Omalla tietokoneellasi, myös localhostissa toimivan sovelluksen.",
      },
      {
        title: "Lisää diat ja äänen",
        body: "Otsikkodiat ja selostus, jos haluat ne.",
      },
      {
        title: "Antaa sinulle jaettavan linkin",
        body: "Liitä se pull requestiin, julkaise Slackissa tai lähetä asiakkaalle.",
      },
    ],
    scenes: {
      ask: {
        name: "pääte",
        badge: "agentti",
        prompt: "Tallenna demo kassasta",
        steps: ["Avataan sovellus", "Klikataan läpi", "Linkkisi on valmis"],
      },
      record: {
        url: "localhost:3000",
        badge: "demo",
        title: "Kassa",
        fields: ["Nimesi", "Kortin numero"],
        pay: "Maksa nyt",
        paid: "Maksettu",
      },
      voice: {
        title: "Kassademo",
        subtitle: "Näin maksat kolmessa vaiheessa",
      },
      share: {
        title: "Kassademo",
        link: "captureflow.dev/r/checkout",
        places: ["PR", "Slack", "Sähköposti"],
      },
    },
    chats: {
      claude:
        "Avaa Claudessa Customize, sitten Connectors ja valitse Add custom connector. Anna nimeksi CaptureFlow, liitä tämä URL-osoite ja kirjaudu sisään.",
      chatgpt:
        "Avaa ChatGPT:n verkkoversiossa Plugins, paina + ja valitse Add custom MCP server. Anna nimeksi CaptureFlow, liitä tämä URL-osoite, valitse OAuth, asenna sitten liitännäinen ja kirjaudu sisään. Vaatii Business-, Enterprise- tai Edu-tilauksen.",
      limits:
        "Chatit kokoavat esitys- ja ohjevideot dioista palvelimillamme, eivät tallenna tietokonettasi, ja käyttävät tilauksesi pilviagenttiminuutteja.",
    },
  },
  modes: {
    cta: "Aloita tallennus",
    heading: "Tallenna näyttösi Chrome-laajennuksella",
    subtitle:
      "Asenna se ja aloita tallennus. Kun lopetat, saat linkin, jonka kuka tahansa voi katsoa ja jossa on otsikko, yhteenveto, luvut ja litterointi.",
    scene: {
      timer: "0:42",
      heading: "Näin hyvitys toimii",
      steps: ["Pyyntö", "Hyväksyntä", "Maksu"],
      captions: [
        "Lyhyt läpikäynti siitä, miten hyvitys toimii.",
        "Ensin asiakas lähettää pyynnön.",
        "Tuki hyväksyy sen samana päivänä.",
        "Sitten rahat lähtevät automaattisesti.",
      ],
    },
  },
  pageHeroes: {
    home: "Etusivu",
    features: {
      label: "Ominaisuudet",
      word: "OMINAISUUDET",
      title: "Tallenna, muokkaa ja jaa näyttösi",
      subtitle:
        "Tallenna näyttösi ja kamerasi. Jaa jokainen tallenne linkkinä, jota tiimisi voi kommentoida.",
    },
    pricing: {
      label: "Hinnat",
      word: "HINNAT",
      title: "Aloita ilmaiseksi. Maksa yksi hinta jäsentä kohden.",
      subtitle:
        "Ilmainen tilaus kattaa ensimmäiset 25 tallennettasi. Light ja Pro poistavat rajan. Voit myös ylläpitää CaptureFlow'ta itse ilmaiseksi.",
    },
    faq: {
      label: "UKK",
      word: "UKK",
      title: "Usein kysytyt kysymykset",
      subtitle:
        "Vastauksia tallentamisesta, hinnoista, tallennustilasta ja omasta ylläpidosta. Kaikki muu löytyy dokumentaatiosta.",
    },
    chromeExtension: {
      label: "Chrome-laajennus",
      word: "CHROME",
      title: "Tallenna näyttösi Chromessa",
      subtitle:
        "Tallenna näyttösi, välilehti tai kamerasi. Lopuksi saat linkin, jota kuka tahansa voi katsoa, tekstityksen, yhteenvedon ja lukujen kanssa.",
    },
    agentRecorder: {
      label: "Tallennin agenteille",
      word: "MCP",
      title: "Anna tekoälyagenttisi tallentaa videosi",
      subtitle:
        "Yhdistä se MCP:n kautta ja pyydä tavallisin sanoin. Se tallentaa verkkosovelluksen, näyttösi tai yhden ikkunan, lisää halutessasi diat ja äänen ja antaa sinulle linkin.",
    },
  },
  collaboration: {
    heading: "Mitä voit tehdä tallennuksen jälkeen",
    cta: "Kokeile ilmaiseksi",
    subtitle:
      "Muokkaa videota ja jaa tai upota se. Kutsu tiimisi katsomaan toistensa videoita, reagoimaan niihin ja kommentoimaan niitä.",
    categories: {
      share: {
        feature: {
          tag: "uusi",
          title: "Muokkaa videotasi",
          cta: "Asenna laajennus",
          body: "Poista sanoja litteroinnista, niin ne leikataan videosta, tai rajaa leikkeitä aikajanalla. Vaihda tausta, siirrä kameraa, muuta sen kokoa tai piilota se ja mykistä mikrofoni tai järjestelmän ääni.",
        },
        scene: {
          app: "Lanseeraus",
          nav: ["Yleiskuva", "Tiekartta", "Tehtävät", "Dokumentit"],
          columns: [
            {
              name: "Tehtävät",
              tasks: ["Hinnoittelusivun tekstit", "Tervetulosähköposti"],
            },
            {
              name: "Työn alla",
              tasks: ["Kassan uudistus", "Tiimikutsut"],
            },
            { name: "Valmis", tasks: ["Betan ilmoittautumislomake"] },
          ],
          background: "Tausta",
          camera: "Kamera",
          shapes: ["Ympyrä", "Neliö"],
          fillers: "Täytesanat",
          remove: "Poista",
          transcript: {
            before: "Klikkaa tästä ja",
            fillers: ["öö,", "hetkinen,", "sori,"],
            after: "jaa linkki.",
          },
          saved: "Tallennettu · sama linkki",
        },
      },
      embed: {
        feature: {
          title: "Jaa tai upota videosi",
          cta: "Asenna laajennus",
          body: "Liitä linkki Slackiin, GitHubiin, Notioniin tai sähköpostiin, niin siitä näkyy esikatselu. Voit myös upottaa soittimen dokumentaatioosi tai sivustollesi. Kun laajennus on asennettu, video toistuu suoraan GitHubin issueissa ja pull requesteissa.",
        },
        scene: {
          question: "Voitko näyttää, miten kutsun tiimini työtilaan?",
          reply: "Totta kai! Tässä lyhyt läpikäynti vaiheista:",
          url: "captureflow.dev/r/8kx2pnq4",
          app: "Asetukset",
          nav: ["Yleiset", "Jäsenet", "Laskutus"],
          members: "Jäsenet",
          invite: "Kutsu",
          people: [
            { initials: "AR", name: "Alex Rivera", role: "Omistaja" },
            { initials: "CK", name: "Chris Kim", role: "Jäsen" },
            { initials: "JB", name: "Jordan Bell", role: "Jäsen" },
          ],
          duration: "0:48",
        },
      },
      feedback: {
        feature: {
          title: "Tee yhteistyötä videoiden äärellä",
          cta: "Kirjaudu sisään",
          body: "Tehkää yhteistyötä ilman kokousta, aikavyöhykkeistä riippumatta. Tiimisi voi reagoida emojeilla, kommentoida mitä tahansa videon kohtaa ja seurata mukana litterointien ja tekstitysten avulla.",
        },
        scene: {
          title: "Lanseerauksen läpikäynti",
          author: "Alex",
          age: "juuri nyt",
          duration: "1:12",
          activity: "Toiminta",
          events: [
            { initials: "CK", name: "Chris", at: "0:09", emoji: "👍" },
            { initials: "JB", name: "Jordan", at: "0:17", emoji: "🔥" },
            {
              initials: "MC",
              name: "Maya",
              at: "0:27",
              text: "Uusi taulunäkymä on hieno",
            },
            { initials: "SL", name: "Sam", at: "0:37", emoji: "❤️" },
            {
              initials: "JB",
              name: "Jordan",
              at: "0:48",
              text: "Voidaanko julkaista perjantaina?",
            },
            {
              initials: "AR",
              name: "Alex",
              at: "0:56",
              text: "Kyllä, heti QA:n jälkeen ✅",
            },
            { initials: "MC", name: "Maya", at: "1:05", emoji: "👏" },
          ],
        },
      },
      workspaces: {
        feature: {
          title: "Kutsu tiimisi työtilaan",
          cta: "Luo työtila",
          body: "Kaikkien tallenteet säilyvät yhdessä työtilassa. Jokainen video voi olla julkinen, työtilan nähtävissä tai yksityinen.",
        },
        scene: {
          team: "CaptureFlow-tiimi",
          members: ["1 jäsen", "2 jäsentä", "3 jäsentä"],
          memberInitials: ["AR", "CK", "JB"],
          invitePlaceholder: "Kutsu sähköpostilla",
          inviteEmail: "chris@acme.co, jordan@acme.co",
          invite: "Kutsu",
          invited: "Lähetetty",
          joined: "Chris ja Jordan liittyivät 🎉",
          whoCanWatch: "Kuka voi katsoa:",
          visibility: [
            { label: "Julkinen", detail: "Kaikki, joilla on linkki" },
            { label: "Työtila", detail: "Vain tiimisi" },
            { label: "Yksityinen", detail: "Vain sinä" },
          ],
        },
      },
    },
  },
  setupService: {
    title: "Me asennamme sen",
    titleHighlight: "puolestasi",
    subtitle:
      "Kerro meille yrityksestäsi. Asennamme sovelluksen, Chrome-laajennuksen, macOS-sovelluksen ja kaiken niiden taustalla olevan infrastruktuurin valmiiksi tiimisi käyttöön.",
    includedHeading: "Kaikki, mitä asennamme",
    included: {
      infra: {
        title: "Sovellus omassa infrastruktuurissasi",
        body: "Otetaan käyttöön omalla Cloudflare-tililläsi ja omassa verkkotunnuksessasi. Omistat kaiken.",
      },
      storage: {
        title: "Tallennustila ja tietokanta",
        body: "Tallenteet omassa R2-säiliössäsi; työtilat ja kommentit omassa tietokannassasi.",
      },
      signin: {
        title: "Kirjautuminen vain yrityksen tunnuksilla",
        body: "Kirjautuminen Google Workspacella tai GitHubilla, rajattuna yrityksesi sähköpostin verkkotunnukseen.",
      },
      apps: {
        title: "Chrome-laajennus ja Mac-sovellus",
        body: "Molemmat rakennetaan omaa asennustasi varten, ja laajennus julkaistaan yksityisesti tiimillesi.",
      },
      ready: {
        title: "Valmis tallentamaan",
        body: "Työtilat on luotu ja tiimisi kutsuttu, joten jakamisen voi aloittaa heti.",
      },
      handover: {
        title: "Luovutus",
        body: "Käymme ylläpitäjän kanssa läpi, miten palvelua käytetään ja päivitetään.",
      },
    },
    nextHeading: "Ota yhteyttä",
    nextSubheading: "Kerro, mitä tarvitset, niin palaamme asiaan.",
    form: {
      company: "Yritys",
      companyPlaceholder: "Acme Oy",
      name: "Nimesi",
      namePlaceholder: "Jane Doe",
      email: "Työsähköposti",
      emailPlaceholder: "jane@acme.com",
      topic: "Missä voimme auttaa?",
      topics: ["Oman ylläpidon käyttöönotto", "Yli 1 Tt", "Jokin muu"],
      teamSize: "Tiimin koko",
      teamSizes: ["1–10", "11–50", "51–200", "200+"],
      cloudflare: "Onko sinulla Cloudflare-tili?",
      cloudflareOptions: ["Kyllä", "Ei", "En ole varma"],
      notes: "Onko jotain muuta, mitä meidän pitäisi tietää?",
      notesPlaceholder: "Tiimisi koko, verkkotunnuksesi, aikataulusi…",
      submit: "Lähetä viesti",
      error:
        "Pyyntöäsi ei voitu lähettää. Yritä uudelleen tai lähetä meille sähköpostia osoitteeseen {email}.",
      sentTitle: "Viesti lähetetty",
      sentBody: "Kiitos. Vastaamme sinulle osoitteeseen {email}.",
      back: "Takaisin etusivulle",
    },
  },
  swarmDemo: {
    title: "Katso, kuinka agenttiparvi rakentaa uudelleen",
    titleHighlight: "minkä tahansa sivuston",
    subtitle:
      "Kirjoita sivuston osoite. Parvi agenttikursoreita piirtää sen takaisin elementti kerrallaan musiikin tahdissa, ja saat jaettavan videolinkin.",
    url: "Sivuston osoite",
    urlPlaceholder: "https://example.com",
    generate: "Luo demo",
    generating: "Käynnistetään pilviselainta…",
    check: "Tarkista sivusto",
    checking: "Tarkistetaan sivustoa…",
    previewNote:
      "Tämän sivun agentit rakentavat uudelleen. Luo demo, kun se näyttää oikealta.",
    change: "Vaihda osoite",
    note: "Kirjaudu sisään luodaksesi demon ilmaiseksi. Jokainen demo ilmestyy kirjastoosi.",
    noteSignedIn: "Luo ilmaiseksi. Jokainen demo ilmestyy kirjastoosi.",
    howHeading: "Näin se toimii",
    how: {
      type: {
        title: "Kirjoita osoite",
        body: "Mikä tahansa julkinen sivusto. Sivu ladataan pilviselaimessa, ja jokainen otsikko, kuva, painike ja kortti tunnistetaan.",
      },
      build: {
        title: "Agentit rakentavat sen takaisin",
        body: "Pyyntö kirjoitetaan keskustelukenttään, minkä jälkeen parvi kursoreita asettaa jokaisen elementin paikalleen musiikin kiihtyessä.",
      },
      share: {
        title: "Saat linkin",
        body: "Video avautuu kirjastossasi heti, kun se on valmis. Jaa linkki, lataa tiedosto tai julkaise se.",
      },
    },
    errors: {
      invalidUrl: "Kirjoita sivuston osoite, esimerkiksi example.com.",
      unreachable:
        "Sivustoon ei saatu yhteyttä. Tarkista osoite ja yritä uudelleen.",
      unavailable: "Demot eivät ole käytettävissä tällä palvelimella.",
      running:
        "Yksi tallenteistasi on vielä käynnissä. Odota, että se valmistuu, ja yritä sitten uudelleen.",
      limit:
        "Tämä työtila on käyttänyt tämän kuun pilviagenttiminuuttinsa. Ne nollautuvat kuun 1. päivänä.",
      recordings:
        "Ilmaisen paketin tallennusraja on täynnä. Poista tallenne tai päivitä paketti ja yritä uudelleen.",
      busy: "Kaikki pilviselaimet ovat juuri nyt varattuja. Yritä uudelleen muutaman minuutin kuluttua.",
      failed: "Demoa ei voitu käynnistää. Yritä uudelleen.",
    },
  },
  enterprise: {
    title: "CaptureFlow",
    titleHighlight: "yrityksellesi",
    subtitle:
      "Ylläpidetty tilaus yrityksille, jotka haluavat käyttäjäpaikat kaikille kerralla sovituin ehdoin ja yhdellä laskulla.",
    includedHeading: "Mitä Enterprise tuo lisää",
    included: {
      storage: {
        title: "Sinulle mitoitettu tallennustila",
        body: "Yhteinen tallennustila, joka mitoitetaan sen mukaan, kuinka paljon yrityksesi tallentaa, ei käyttäjäpaikkakohtainen kiintiö.",
      },
      seats: {
        title: "Käyttäjäpaikat kaikille",
        body: "Yksi sopimus kattaa koko yrityksen, tallentajien määrästä riippumatta.",
      },
      roadmap: {
        title: "Sinun toiveesi ensin",
        body: "Tiimisi pyytämät ominaisuudet nousevat listamme kärkeen.",
      },
      managed: {
        title: "Täysin ylläpidetty",
        body: "Me ylläpidämme palvelua ja julkaisemme päivitykset, joten sinun ei tarvitse ylläpitää mitään.",
      },
      billing: {
        title: "Vuosilaskutus",
        body: "Maksa kerran vuodessa yrityksellesi sovittuun hintaan.",
      },
      support: {
        title: "Suora yhteys meihin",
        body: "Kysymykset menevät suoraan CaptureFlow'n tekijöille.",
      },
    },
    everythingHeading: "Kaikki, mitä tiimisi saa",
    comingSoon: "Tulossa pian",
    everything: {
      extension: {
        title: "Chrome-laajennus",
        body: "Tallenna mikä tahansa välilehti tai näyttö, ja linkki on valmis, kun lopetat.",
      },
      mac: {
        title: "Mac-sovellus",
        body: "Natiivi tallennin macOS:lle, samat heti valmiit jakolinkit.",
      },
      workspaces: {
        title: "Tiimin työtilat",
        body: "Kaikkien tallenteet yhdessä paikassa, jaettuina tai yksityisinä.",
      },
      feedback: {
        title: "Kommentit ja reaktiot",
        body: "Katsojat vastaavat suoraan aikajanalla, juuri siinä kohdassa, jota he tarkoittavat.",
      },
      edit: {
        title: "Muokkaa jakamisen jälkeen",
        body: "Vaihda tausta, kamera tai ääni, ja linkki pysyy samana.",
      },
      screenshots: {
        title: "Kuvakaappaukset merkinnöillä",
        body: "Lisää kuvakaappaukseen nuolia, tekstiä ja sumennusta ja jaa se linkkinä.",
      },
    },
    formHeading: "Ota yhteyttä",
    formSubheading: "Kerro tiimistäsi, niin vastaamme sähköpostilla.",
    form: {
      company: "Yritys",
      companyPlaceholder: "Acme Oy",
      name: "Nimesi",
      namePlaceholder: "Jane Doe",
      email: "Työsähköposti",
      emailPlaceholder: "jane@acme.com",
      need: "Mitä tarvitset?",
      needs: [
        "Käyttäjäpaikat suurelle tiimille",
        "Räätälöidyt ehdot tai yksi lasku",
        "Jokin muu",
      ],
      teamSize: "Tiimin koko",
      teamSizes: ["1–10", "11–50", "51–200", "200+"],
      storage: "Kuinka paljon tallennustilaa?",
      storageOptions: ["1–5 Tt", "5–20 Tt", "Yli 20 Tt", "En ole varma"],
      notes: "Onko jotain muuta, mitä meidän pitäisi tietää?",
      notesPlaceholder:
        "Kuinka paljon tiimisi tallentaa, aikataulusi, laskutustarpeet…",
      submit: "Lähetä viesti",
      error:
        "Viestiäsi ei voitu lähettää. Yritä uudelleen tai lähetä meille sähköpostia osoitteeseen {email}.",
      sentTitle: "Viesti lähetetty",
      sentBody: "Kiitos. Vastaamme sinulle osoitteeseen {email}.",
      back: "Takaisin etusivulle",
    },
  },
  pricing: {
    heading: "Hinnat",
    cta: "Vertaa kaikkia tilauksia",
    subheading:
      "Ilmainen tilaus kattaa ensimmäiset tallenteesi. Maksullisissa tilauksissa on yksi hinta jäsentä kohden.",
    controls: {
      shownIn:
        "Hinnat näytetään valuutassa {currency}. Veloitus tapahtuu Yhdysvaltain dollareina.",
      teamSize: "Tiimin koko",
      members: "jäsentä",
      title: "Laskutus",
      note: "Yksi hinta jäsentä kohden.",
      billing: "Laskutusväli",
      monthly: "Kuukausittain",
      annually: "Vuosittain",
      save: "Säästä {percent} %",
    },
    compare: {
      loomRow: "Loom {plan}",
      loomDetail: "{seats} henkilöä × {perSeat} / hlö",
      caption: "Kuukausihinnat.",
      captureflowRow: "CaptureFlow {ourPlan}",
      captureflowDetail: "{seats} jäsentä × {ourPerSeat} / jäsen",
      saveLabel: "Tiimisi säästää",
      saveValue: "{savings} vuodessa",
    },
    plans: {
      chargedInUsd: "Veloitetaan Yhdysvaltain dollareina.",
      member: "jäsen",
      members: "jäsentä",
      included: "Sisältyy",
      notIncluded: "Ei sisälly",
      free: {
        name: "Ilmainen",
        description: "Näytön tallenteita, jotka jaat linkkinä.",
        cta: "Rekisteröidy",
      },
      light: {
        name: LIGHT,
        featuresHeading: "Kaikki Ilmainen-tilauksen ominaisuudet ja lisäksi",
        features: [
          "Rajattomasti tallenteita",
          "Rajaton tallennusaika",
          `${LIGHT_AGENT_MIN} min kuukaudessa pilviagenttitallenteita, enintään 10 min kerrallaan`,
        ],
        description: "Rajattomasti tallenteita datansäästölaadulla.",
        period: "/kk",
        noteMonthly: "Jäsentä kohden, laskutus kuukausittain",
        noteAnnual:
          "Jäsentä kohden, laskutus vuosittain. {yearly} vuodessa, {seats} {members}",
        cta: "Kokeile ilmaiseksi",
      },
      pro: {
        badge: "Suositeltu",
        name: PRO,
        featuresHeading: `Kaikki ${LIGHT}-tilauksen ominaisuudet ja lisäksi`,
        features: [
          "Täysi laatu, enintään 1080p",
          "Tekoälyn luvut, otsikot ja täytesanojen poisto",
          "Oma brändäys",
          `${PRO_AGENT_MIN} min kuukaudessa pilviagenttitallenteita ja ${PRO_VOICEOVER_MIN} min tekoälyselostusta`,
          "Katselutilastot (tulossa pian)",
          "Slack-, Notion- ja Zapier-integraatiot (tulossa pian)",
        ],
        description: "Täysi laatu, tekoälysiistintä ja oma brändäys.",
        period: "/kk",
        noteMonthly: "Jäsentä kohden, laskutus kuukausittain",
        noteAnnual:
          "Jäsentä kohden, laskutus vuosittain. {yearly} vuodessa, {seats} {members}",
        cta: "Kokeile ilmaiseksi",
      },
      rows: {
        recordings: {
          label: "Tallenteita henkilöä kohden",
          free: "Enintään {recordings}",
          light: "Rajattomasti",
          pro: "Rajattomasti",
        },
        length: {
          label: "Tallenteen pituus",
          free: "{minutes} min/video",
          light: "Rajaton",
          pro: "Rajaton",
        },
        quality: {
          label: "Videon laatu",
          free: "Datansäästö",
          light: "Datansäästö",
          pro: "Enintään 1080p",
        },
        transcripts: {
          label: "Litteroinnit ja tekstitykset",
          free: true,
          light: true,
          pro: true,
        },
        editing: {
          label: "Muokkaus litteroinnin kautta",
          free: true,
          light: true,
          pro: true,
        },
        chapters: {
          label: "Tekoälyn luvut ja otsikot",
          free: false,
          light: false,
          pro: true,
        },
        filler: {
          label: "Täytesanojen poisto",
          free: false,
          light: false,
          pro: true,
        },
        feedback: {
          label: "Kommentit ja reaktiot",
          free: true,
          light: true,
          pro: true,
        },
        agents: {
          label: "Paikalliset agenttitallenteet",
          free: true,
          light: true,
          pro: true,
        },
        cloudAgents: {
          label: "Pilviagenttitallenteet",
          free: `${FREE_AGENT_MIN} min kuukaudessa`,
          light: `${LIGHT_AGENT_MIN} min kuukaudessa`,
          pro: `${PRO_AGENT_MIN} min kuukaudessa`,
        },
        voiceover: {
          label: "Paikallinen tekoälyselostus",
          free: true,
          light: true,
          pro: true,
        },
        cloudVoiceover: {
          label: "Tekoälyselostus pilvessä",
          free: false,
          light: false,
          pro: `${PRO_VOICEOVER_MIN} min kuukaudessa`,
        },
        branding: {
          label: "Oma brändäys",
          free: false,
          light: false,
          pro: true,
        },
      },
    },
    table: {
      heading: "Kaikki ominaisuudet tilauksittain",
      subtitle: "Ilmainen, Light ja Pro rinnakkain.",
      groups: [
        {
          title: "Tallennus",
          rows: [
            {
              label: "Jäsenet",
              free: "Rajattomasti",
              light: "Rajattomasti",
              pro: "Rajattomasti",
            },
            {
              label: "Tallenteita henkilöä kohden",
              free: "Enintään {recordings}",
              light: "Rajattomasti",
              pro: "Rajattomasti",
            },
            {
              label: "Tallenteen pituus",
              free: "{minutes} min/video",
              light: "Rajaton",
              pro: "Rajaton",
            },
            {
              label: "Videon laatu",
              free: "Datansäästö",
              light: "Datansäästö",
              pro: "Enintään 1080p",
            },
            {
              label: "Kuvakaappaukset",
              free: "Rajattomasti",
              light: "Rajattomasti",
              pro: "Rajattomasti",
            },
            {
              label: "Tallenteiden säilytys",
              free: "30 päivää ilman katselua",
              light: "Kunnes poistat ne",
              pro: "Kunnes poistat ne",
            },
            {
              label: "Koko näytön, ikkunan tai välilehden tallennus",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Kamerakupla ja kameratehosteet",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Mikrofoni ja järjestelmän ääni",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Sulava kursori",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Chrome-laajennus ja Mac-sovellus",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "Tekoäly",
          rows: [
            {
              label: "Litteroinnit",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Tekstitykset",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Yhteenvetoluvut",
              free: false,
              light: false,
              pro: true,
            },
            {
              label: "Automaattiset otsikkoehdotukset",
              free: false,
              light: false,
              pro: true,
            },
            {
              label: "Videon muokkaus litteroinnin kautta",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Täytesanojen poisto",
              free: false,
              light: false,
              pro: true,
            },
          ],
        },
        {
          title: "Agentit",
          rows: [
            {
              label: "Agenttitallenteet omalla tietokoneellasi",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Agentin esitykset pilvessä",
              free: `${FREE_AGENT_MIN} min kuukaudessa henkilöä kohden`,
              light: `${LIGHT_AGENT_MIN} min kuukaudessa jäsentä kohden`,
              pro: `${PRO_AGENT_MIN} min kuukaudessa jäsentä kohden`,
            },
            {
              label: "Diat agenttitallenteissa",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Tekoälyselostus omalla tietokoneellasi",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Tekoälyselostus pilviesityksissä",
              free: false,
              light: false,
              pro: `${PRO_VOICEOVER_MIN} min kuukaudessa jäsentä kohden`,
            },
          ],
        },
        {
          title: "Muokkaus",
          rows: [
            {
              label: "Muokkaus jakamisen jälkeen, sama linkki",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Taustat",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Kamerakuplan siirto ja koon muutos",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Videon osien leikkaus",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Kuvakaappausten merkinnät: nuolet, teksti ja sumennus",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Rajaton piirtoalusta",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "Jakaminen ja palaute",
          rows: [
            {
              label: "Jakolinkki valmiina, kun lopetat",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Julkiset, työtilan tai yksityiset linkit",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Käyttöoikeuden pyytäminen rajoitettuihin linkkeihin",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Linkkien esikatselut pikaviestimissä ja sähköpostissa",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Soittimen upotus minne tahansa",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Toistuu GitHubin issueissa ja pull requesteissa",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Kommentit aikajanalla",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Emojireaktiot",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Katselukerrat",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Alkuperäisen tiedoston lataus",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "Työtila ja hallinta",
          rows: [
            {
              label: "Tiimin työtila",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Omistajan, jäsenen ja katsojan roolit",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Oletusnäkyvyys ja lähetysoikeudet",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Haku tallenteista ja kuvakaappauksista",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Oma brändäys",
              free: false,
              light: false,
              pro: true,
            },
          ],
        },
        {
          title: "Ylläpito ja tuki",
          rows: [
            {
              label: "Avointa lähdekoodia AGPL-lisenssillä",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Oma ylläpito omalla Cloudflare-tililläsi",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Ylläpidetty palvelu ja päivitykset",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
      ],
    },
    includes: {
      heading: "Jokaiseen tilaukseen sisältyy",
      items: [
        "Oma työtila, kutsu kenet tahansa",
        "Kameratehosteet",
        "Tekoälylitteroinnit ja tekstitykset",
        "Videon muokkaus litteroinnin kautta",
        "Julkiset, työtilan tai yksityiset jakolinkit",
        "Kommentit ja emojireaktiot",
        "Kuvakaappaukset merkinnöillä",
        "Rajaton piirtoalusta",
      ],
    },
    annual: {
      badgePro: "Ylläpidetty",
      badgeCycle: "Vuosittain",
      title: "Ylläpidetty palvelu",
      subtitle: "Täysin ylläpidetty, laskutus vuosittain.",
      period: "/kk",
      note: "Laskutus {amount}/vuosi. Peru milloin tahansa.",
      cta: "Aloita",
    },
  },
  activity: {
    heading: "Uusimmat muutokset GitHubissa",
    subtitle:
      "Jokainen muutos on julkinen. Tässä ovat uusimmat pull requestit ja avoimet issuet GitHubissa.",
    cta: "Näytä GitHubissa",
    shippedHeading: "Äskettäin yhdistetyt",
    openHeading: "Avoimet issuet ja pull requestit",
    emptyOpen: "Ei avoimia juuri nyt.",
    newIssue: "Ilmoita bugista tai ehdota ominaisuutta",
    viewAll: "Katso kaikki GitHubissa",
  },
  faq: {
    heading: "Usein kysytyt kysymykset",
    subtitle:
      "Vastauksia tallentamisesta, hinnoista, tallennustilasta ja omasta ylläpidosta. Kaikki muu löytyy dokumentaatiosta.",
    cta: "Lue dokumentaatio",
    waitlistLink: "Liity jonotuslistalle",
    items: [
      {
        question: "Miten teen tallenteen?",
        answer:
          "Tapoja on kaksi, ja ero on siinä, kuka tallentaa.\n\nChrome-laajennuksella tallennat itse. Klikkailet näytölläsi ja voit puhua päälle omalla äänelläsi ja kamerallasi. Käytä sitä nopeisiin kuulumisiin, palautteeseen tai mihin tahansa, missä sinun pitää olla itse mukana.\n\nTekoälyagentin kanssa kuvailet videon, ja agentti klikkailee ja tallentaa sen puolestasi, joten voit jatkaa töitäsi. Se voi lisätä dioja ja tekoälyselostuksen. Käytä sitä tuote-esittelyihin, ohjeisiin ja bugiraportteihin.\n\nNäin tallennat itse:\n1. Asenna CaptureFlow-laajennus Chrome Web Storesta.\n2. Klikkaa sen kuvaketta selaimen työkalupalkissa ja kirjaudu sisään.\n3. Klikkaa kuvaketta uudelleen. Valitse This tab, Window tai Full screen ja kytke kamera ja mikrofoni päälle, jos haluat ne mukaan.\n4. Paina Start Recording. Sivulla olevasta palkista voit keskeyttää tai lopettaa tallennuksen.\n5. Lopeta tallennus. Tallenteesi sivu avautuu, ja saat linkin, jonka voit jakaa kenelle tahansa.\n\nNäin annat agentin tallentaa:\n1. Yhdistä CaptureFlow käyttämääsi tekoälysovellukseen. Etusivun Agentit-osiossa on ohjeet Claudelle, ChatGPT:lle, Claude Codelle, Codexille ja Cursorille.\n2. Kirjaudu sisään, kun selaimen välilehti avautuu. Tämä tehdään vain kerran.\n3. Pyydä videota omin sanoin, esimerkiksi: Tallenna demo siitä, miten sivustollemme rekisteröidytään, ja lisää selostus.\n4. Agentti tallentaa videon ja antaa sinulle linkin, jonka voit jakaa kenelle tahansa.",
      },
      {
        question: "Voinko ylläpitää CaptureFlow'ta itse?",
        answer:
          "Kyllä. CaptureFlow on avointa lähdekoodia AGPL-lisenssillä, ja koko taustajärjestelmä toimii Cloudflaressa: Workers sovellukselle ja API:lle, R2 tallenteille ja D1 kaikelle muulle. Luo D1-tietokanta ja R2-säiliö, aja migraatiot, aseta yksi salaisuus ja ota palvelu käyttöön. Tarjolla on myös Deploy to Cloudflare -painike. Opas on osoitteessa docs.captureflow.dev.",
      },
      {
        question: "Voiko tekoälyagenttini tallentaa videoita puolestani?",
        answer:
          "Kyllä. Lisää CaptureFlow Claude Codeen, Codexiin tai Cursoriin yhdellä rivillä tai lisää se Claudessa tai ChatGPT:ssä, ja pyydä sitten videota omin sanoin. Se tallentaa selaimen, näyttösi tai sovelluksen omalla tietokoneellasi, lisää halutessasi diat ja selostuksen ja antaa sinulle jaettavan linkin.\n\nPaikalliset agenttitallenteet sisältyvät jokaiseen tilaukseen. Pilviagenttitallenteille on kuukausittainen kiintiö, joka riippuu tilauksestasi.",
      },
      {
        question: "Miten maksullisten tilausten hinnoittelu toimii?",
        answer: `${LIGHT} ja ${PRO} maksavat yhden hinnan jäsentä kohden kuukaudessa, ja vuosilaskutuksella vähemmän. Jäsen on henkilö, joka tallentaa, joten maksat vain niistä, jotka tekevät tallenteita.\n\nKun joku liittyy tai lähtee, käyttäjäpaikkojen määrä päivittyy seuraavalle laskulle.`,
      },
      {
        question: "Kuinka kauan tallenteitani säilytetään?",
        answer:
          "Maksullisissa tilauksissa siihen asti, kunnes poistat ne. Ilmaisessa tilauksessa tallenne poistetaan, kun sitä ei ole katsottu 30 päivään, jotta käyttämättömät tilit eivät vie tilaa. Jos ylläpidät palvelua itse, päätät säännöistä itse.",
      },
      {
        question: "Mitä ilmainen tilaus sisältää?",
        answer: `Saat 25 tallennetta henkilöä kohden, kukin enintään 5 minuuttia, datansäästölaadulla sekä litteroinnit ja tekstitykset. Tallenteet poistetaan, kun niitä ei ole katsottu 30 päivään. Rekisteröidy, asenna Chrome-laajennus ja aloita tallentaminen.\n\n${LIGHT} poistaa rajat yhdellä hinnalla jäsentä kohden ja säilyttää tallenteet, kunnes poistat ne.`,
      },
    ],
  },
  cta: {
    headline: "Aloita tallennus",
    subtitle:
      "Ilmainen lataus. Ei luottokorttia. Kerro asiasi lyhyellä videoviestillä uuden kokouksen sijaan.",
    button: "Kokeile CaptureFlow'ta ilmaiseksi",
  },
  footer: {
    tagline: "Avoimen lähdekoodin näytön tallennus ja heti valmiit jakolinkit.",
    lights: "Valot",
    lightsOn: "Päällä · vedä narusta",
    lightsOff: "Pois · vedä narusta",
    product: {
      title: "Tuote",
      features: "Ominaisuudet",
      pricing: "Hinnat",
      compare: "Vertailu",
      download: "Lataa",
      suggest: "Ehdota ominaisuutta",
    },
    resources: {
      title: "Resurssit",
      docs: "Dokumentaatio",
      selfHosting: "Oma ylläpito",
      blog: "Blogi",
      releases: "Julkaisut",
      faq: "UKK",
      security: "Tietoturva",
    },
    community: {
      title: "Yhteisö",
    },
    legal: {
      title: "Juridiset tiedot",
      privacy: "Tietosuojakäytäntö",
      terms: "Käyttöehdot",
      refund: "Hyvityskäytäntö",
      license: "Lisenssi (AGPL-3.0)",
    },
    rights: "© {year} CaptureFlow. Kaikki oikeudet pidätetään.",
    openSource: "Avointa lähdekoodia AGPL-3.0-lisenssillä",
  },
  pageShell: {
    logoAlt: "CaptureFlow",
    backToHome: "Takaisin etusivulle",
  },
  waitlist: {
    errors: {
      joinFailed: "Jonotuslistalle liittyminen ei onnistunut. Yritä uudelleen.",
      network: "Verkkovirhe. Yritä uudelleen.",
    },
    success:
      "Olet listalla. Lähetän sinulle sähköpostia, kun CaptureFlow on valmis.",
    emailPlaceholder: "you@example.com",
    buttonLoading: "Liitytään…",
    buttonDefault: "Liity jonotuslistalle",
    earlyAccessPrompt: "Haluatko käyttöön etuajassa?",
    earlyAccessLink: "Ryhdy betatestaajaksi",
  },
  download: {
    heading: "Lataa CaptureFlow",
    subtitle:
      "Saatavilla Chromelle, ja macOS-sovellus on tulossa pian. Jokainen tallenne saa linkin, jonka voit jakaa.",
    button: "Lataa macOS:lle",
    requires: "Vaatimukset: {version} tai uudempi, Apple Silicon.",
    requirements: "Vaatimukset: macOS 14 tai uudempi, Apple Silicon.",
    versionLabel: "Versio {version}",
    sizeLabel: "{size} Mt, DMG",
    notarized: "Applen allekirjoittama ja notarisoima",
  },
  downloadPage: {
    otherWays: "Muut tavat hankkia se",
    buildTitle: "Käännä lähdekoodista",
    buildBody: "Kloonaa repositorio ja aja tallenninta paikallisesti pnpm:llä.",
    releasesTitle: "Kaikki julkaisut",
    releasesBody:
      "Selaa kaikkia julkaistuja versioita ja muutoslokia GitHubissa.",
    cloud:
      "Käytätkö mieluummin pilveä? {link} ja katso tallenteita selaimessa.",
    cloudLink: "Luo tili",
  },
  blog: {
    title: "Blogi",
    subtitle: "Vinkkejä, oppaita ja uutisia näytön tallennuksesta.",
    readArticle: "Lue artikkeli",
    empty: "Ei vielä julkaisuja. Palaa pian uudelleen.",
  },
};

export default messages;

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
      title: "CaptureFlow - Ekranni yozib olish va havola orqali ulashish",
      description:
        "Ekranni yozib olib, havolasini jamoa yoki mijozlarga yuboring. SI transkriptlari va izohli skrinshotlari bor ochiq kodli dastur, Cloudflareda mustaqil hosting.",
    },
    features: {
      title: "Ekranni yozib olish dasturi imkoniyatlari",
      description:
        "Varaq, oyna yoki butun ekranni kamera va mikrofon bilan yozib oling, izohli skrinshot oling va har birini jamoa fikr qoldira oladigan havola sifatida ulashing.",
    },
    pricing: {
      title: "Narxlar: bepul boshlang, har bir aʼzoga bitta narx",
      description: `${FREE_RECORDINGS} ta yozuv bilan bepul boshlang. ${LIGHT} va ${PRO}: har bir aʼzoga bitta narx, cheksiz yozuvlar va SI. Yoki CaptureFlowni mustaqil hostingda bepul ishlating.`,
    },
    faq: {
      title: "Savol-javob: ulashish, saqlash va mustaqil hosting",
      description:
        "CaptureFlow haqida koʻp beriladigan savollar: ulashish havolalari ishlashi, Cloudflareda mustaqil hosting talablari, saqlash limitlari va yozuvlar maxfiyligi.",
    },
    download: {
      title: "Chrome uchun ekranni yozib olish dasturini yuklab oling",
      description:
        "Ekraningizni yozib olish va havola orqali ulashish uchun CaptureFlow Chrome kengaytmasini oʻrnating.",
    },
    enterprise: {
      title: "Korporativ",
      description:
        "Yirik kompaniyalar uchun boshqariladigan CaptureFlow: hammaga oʻrin, maxsus shartlar va yagona hisob-faktura. Nima kerakligini bizga yozing.",
    },
    selfHostSetup: {
      title: "Mustaqil hostingni sozlash",
      description:
        "CaptureFlowni kompaniyangizning Cloudflare hisobiga oʻrnatib beramiz: oʻz domeningiz, faqat kompaniya uchun kirish va jamoangiz uchun yopiq Chrome kengaytmasi.",
    },
    swarmDemo: {
      title: "Toʻda demosi: agentlar istalgan saytni videoda qayta quradi",
      description:
        "Sayt manzilini kiriting va agent kursorlari toʻdasi uni musiqa ostida elementma-element qayta qurishini tomosha qiling. Sizga ulashish uchun havolali video beriladi.",
    },
    chromeExtension: {
      title: "Chrome kengaytmasi: ekraningizni yozib oling va havola ulashing",
      description:
        "Chrome’da ekraningiz, tab yoki kamerangizni yozib oling. Tugatganingizdan soʻng transkript, xulosa va boblar bilan hamma koʻra oladigan havola olasiz.",
    },
    agentRecorder: {
      title: "MCP server: AI agentingiz video yozib oladi",
      description:
        "Claude Code, Codex, Cursor yoki ChatGPT'ni CaptureFlow'ga MCP orqali ulang. Agentingiz veb-ilovani, ekraningizni yoki bitta oynani yozib oladi va ulashish uchun havola beradi.",
    },
  },
  nav: {
    features: "Imkoniyatlar",
    discover: "Kashf etish",
    pricing: "Narxlar",
    faq: "Savol-javob",
    changelog: "Oʻzgarishlar",
    login: "Kirish",
    library: "Mening yozuvlarim",
    download: "Yuklab olish",
    language: "Til",
    openMenu: "Menyuni ochish",
    menu: "Menyu",
    main: "Asosiy",
    docs: "Hujjatlar",
    resources: "Resurslar",
    faqDescription: "Koʻp beriladigan savollarga javoblar",
    blog: "Blog",
    blogDescription: "Qoʻllanmalar va yangiliklar",
    selfHosting: "Mustaqil hosting",
    selfHostingDescription: "Oʻz Cloudflare hisobingizda ishga tushiring",
    community: "Hamjamiyat",
    communityDescription: "Discordda yordam oling va suhbatlashing",
    products: "Mahsulotlar",
    exploreProducts: "CaptureFlow bilan tanishing",
    plans: "Tariflar",
    exploreResources: "Manbalar bilan tanishing",
    enterprise: "Korporativ",
    swarmDemo: "Toʻda demosi",
    swarmDemoDescription: "Agentlar istalgan saytni videoda qayta quradi",
    extension: "Chrome kengaytmasi",
    extensionDescription: "Ekraningizni yozib oling va havola ulashing",
    agentRecorder: "Agentlar uchun yozuvchi",
    agentRecorderDescription: "SI agentingiz MCP orqali yaratadigan videolar",
    star: "GitHubda yulduzcha qoʻying",
    starCount: "GitHubda yulduzcha qoʻying ({stars})",
    themeToLight: "Yorugʻ mavzuga oʻtish",
    themeToDark: "Qorongʻi mavzuga oʻtish",
  },
  banner: {
    label: "Beta",
    aria: "CaptureFlow ochiq beta bosqichida",
    title: "Siz birinchilardansiz 🎉",
    strip:
      "CaptureFlow hali beta bosqichida, shuning uchun u tez-tez oʻzgaradi va barqarorlashguncha ayrim kamchiliklarga duch kelishingiz mumkin.",
    body: "CaptureFlow ochiq beta bosqichida. Deyarli har hafta yangi narsa qoʻshiladi va birinchi boʻlib foydalanuvchilar soʻragan imkoniyatlar ishlab chiqiladi.",
    cta: "Keyin nima yaratishimni ayting",
    close: "Yopish",
  },
  announcement: {
    badge: "Yangi",
    lead: "Endi SI agentingiz siz uchun yozib oladi.",
    rest: "Uni bir marta ulang, video soʻrang va havola oling.",
    cta: "Ulash",
  },
  hero: {
    title:
      "Siz va SI agentlaringiz uchun\nekranni yozib olish dasturi {bubble}",
    subtitle:
      "Demo, yoʻriqnoma va tanishtiruvlarni {chrome} kengaytmasi bilan oʻzingiz yozib oling yoki {claude}, {chatgpt} yoki {cursor} siz uchun yozib bersin. Har birini istalgan kishi koʻra oladigan havola sifatida ulashing.",
    ctaLabel: "CaptureFlowni bepul sinab koʻring",
    installChrome: "Chrome kengaytmasini oʻrnatish",
    installMac: "macOS uchun yuklab olish",
    installSoon: "Tez kunda",
    connectMcp: "MCP orqali ulash",
    macSoon: "macOS ilovasi tez kunda chiqadi",
    installOr: "yoki",
    mcpCopy: "Nusxalash",
    mcpCopied: "Nusxalandi",
    mcpAddToCursor: "Cursorga qoʻshish",
    noCreditCard: "Bank kartasi talab qilinmaydi",
    teaser: {
      title: "Mustaqil hosting mumkin",
      body: "Oʻz Cloudflare hisobingizda ishga tushiring.",
      cta: "CaptureFlowni sinab koʻring",
    },
    demo: {
      prevAria: "Oldingi demo",
      nextAria: "Keyingi demo",
      dotAria: "{total} tadan {n}-demoni koʻrsatish",
    },
  },
  highlights: {
    heading: "Barcha imkoniyatlar",
    subtitle: "Yozib oling, tahrirlang va ulashing. Hammasi bir joyda.",
    items: {
      recording: { title: "Ekran va kamera", body: "Ikkalasini birga yozing" },
      transcripts: { title: "Transkriptlar", body: "99 tilda", tag: "SI" },
      editing: {
        title: "Transkript orqali tahrir",
        body: "Matnni oʻchirsangiz, video kesiladi",
        tag: "SI",
      },
      camera: {
        title: "Kamera effektlari",
        body: "Fonlar va filtrlar",
      },
      canvas: { title: "Cheksiz doska", body: "Yozish paytida chizing" },
      screenshots: {
        title: "Izohli skrinshotlar",
        body: "Strelka, matn va xiralashtirish",
      },
      feedback: {
        title: "Fikr va reaksiyalar",
        body: "Videoga fikr-mulohaza",
      },
      summary: {
        title: "Xulosa va boblar",
        body: "Har bir videoga sarlavha bilan",
        tag: "SI",
      },
      filler: {
        title: "Parazit soʻzlarni oʻchirish",
        body: "«Hmm» va «eee»larni oʻzi kesadi",
        tag: "SI",
      },
    },
    cta: "Barcha imkoniyatlarni koʻrish",
    previews: {
      app: "Reliz rejasi",
      columns: ["Rejada", "Bajarilmoqda", "Tayyor"],
      lines: [
        "Mana yangi jarayon.",
        "Avval ish maydonini tanlang.",
        "Keyin havolani ulashing.",
      ],
      retake: "Eee, boshidan boshlayman.",
      filler: [
        "[Eee,] mana yangi jarayon.",
        "Avval, [hmm,] ish maydonini tanlang.",
        "Keyin, [eee,] havolani ulashing.",
      ],
      step: "1-qadam",
      note: "Buni suring",
      comment: "Bu jarayon zoʻr",
      summaryTitle: "Jamoani qanday taklif qilish",
      summaryBody: "Ish maydonini tanlang, soʻng havolani ulashing.",
      chapters: ["Kirish", "Ish maydonini tanlash"],
    },
  },
  mcpFeatures: {
    heading: "MCP imkoniyatlari",
    subtitle:
      "SI agentingiz ulangach bajara oladigan ishlar. U Claude Code, Codex, Cursor yoki istalgan MCP mijozi bilan oʻz kompyuteringizda yozib oladi.",
    cta: "Qoʻllanmani oʻqish",
    items: {
      webApp: { title: "Veb-ilovani yozib olish", body: "localhost ham" },
      screen: { title: "Ekranni yozib olish", body: "Butun monitor" },
      window: {
        title: "Bitta oynani yozib olish",
        body: "Terminal, VS Code yoki Figma",
      },
      slides: {
        title: "Slayd qoʻshish",
        body: "Sarlavha, qadamlar va yakuniy soʻz",
      },
      voiceover: {
        title: "Ovozli sharh qoʻshish",
        body: "Kompyuteringizda ishlaydi",
      },
      report: {
        title: "Hisobot yozish",
        body: "Nima qilgani va nima oʻxshamagani",
      },
      search: { title: "Yozuvlarni qidirish", body: "Video va transkriptlar" },
      save: {
        title: "MP4 fayllarni saqlash",
        body: "Yuklashsiz va hisobga kirmasdan",
      },
    },
  },
  useCases: {
    heading: "Jamoalar qanday foydalanadi",
    subtitle:
      "Jamoalar yozib oladigan videolarga misollar. Har bir video istalgan brauzerda ochiladigan havoladir.",
    cta: "Qanday ishlashini koʻring",
    cards: {
      engineering: {
        title: "Ishlab chiqish",
        body: "PR tanishtiruvini yoki xato qanday yuz berishini yozib oling.",
      },
      design: {
        title: "Dizayn",
        body: "Maket tanishtiruvini yozib oling va fikrlarni yigʻing.",
      },
      support: {
        title: "Mijozlarni qoʻllab-quvvatlash",
        body: "Murojaatga qisqa tanishtiruv videosi bilan javob bering.",
      },
      updates: {
        title: "Jamoa yangiliklari",
        body: "Haftalik yangiliklarni yozib oling va havolasini ulashing.",
      },
    },
    engineeringFile: "checkout.ts",
    engineeringPr: "PR #482",
    designApp: "trip-app",
    designBadge: "Toʻlov v3",
    designCardTitle: "Sayohatni rejalang",
    designColors: "Ranglar",
    designComment: "Tugma kattaroq boʻlsinmi?",
    supportQuestion: "Jamoamni ish maydoniga qanday taklif qilaman?",
    supportReply: "Mana qisqa tanishtiruv:",
    supportLink: "captureflow.dev/r/8kx2pnq4",
    updatesTitle: "Haftalik yangiliklar",
    updatesRange: "6–10-oktabr",
    updatesSignups: "Yangi hisoblar",
    updatesShipped: "Chiqarildi",
    updatesFeatures: "imkoniyat",
  },
  agents: {
    heading: "Yoki demo va yoʻriqnomalarni SI agentingizga yozdiring",
    worksWith: "{claude}, {openai} va {cursor} bilan ishlaydi.",
    cta: "Qoʻllanmani oʻqish",
    subtitle:
      "Oddiy soʻzlar bilan soʻrang. U oʻz kompyuteringizda brauzer, ekran yoki ilovani yozib oladi, xohlasangiz slaydlar va ovozli sharh qoʻshadi hamda sizga havola beradi.",
    steps: [
      {
        title: "Agentingizni ulang",
        body: "CaptureFlowni Claude Code, Codex yoki Cursorga bir qator bilan qoʻshing. Node.js 20 yoki undan yangi versiyasi kerak, agentingiz esa hisobga bir marta kiradi. Claude yoki ChatGPTda uni URL orqali qoʻshing.",
      },
      {
        title: "Video soʻrang",
        body: "Imkoniyat demosi, yoʻriqnoma, xato hisoboti yoki ovozli taqdimot.",
      },
      {
        title: "U siz uchun yozib oladi",
        body: "Kompyuteringizda, hatto localhostdagi ilovani ham.",
      },
      {
        title: "Slayd va ovoz qoʻshadi",
        body: "Xohlasangiz, sarlavha slaydlari va ovozli sharh.",
      },
      {
        title: "Ulashish uchun havola beradi",
        body: "Uni pull requestga biriktiring, Slackda eʼlon qiling yoki mijozga yuboring.",
      },
    ],
    scenes: {
      ask: {
        name: "terminal",
        badge: "agent",
        prompt: "Toʻlov demosini yozib ber",
        steps: ["Ilova ochilmoqda", "Qadamlar bosilmoqda", "Havolangiz tayyor"],
      },
      record: {
        url: "localhost:3000",
        badge: "demo",
        title: "Toʻlov",
        fields: ["Ismingiz", "Karta raqami"],
        pay: "Toʻlash",
        paid: "Toʻlandi",
      },
      voice: {
        title: "Toʻlov demosi",
        subtitle: "Uch qadamda qanday toʻlash",
      },
      share: {
        title: "Toʻlov demosi",
        link: "captureflow.dev/r/checkout",
        places: ["PR", "Slack", "E-pochta"],
      },
    },
    chats: {
      claude:
        "Claudeda «Customize», soʻng «Connectors» boʻlimini oching va «Add custom connector» bandini tanlang. Unga CaptureFlow deb nom bering, ushbu URLni joylang, soʻng hisobga kiring.",
      chatgpt:
        "ChatGPT veb-versiyasida «Plugins» boʻlimini oching, + tugmasini bosing va «Add custom MCP server» bandini tanlang. Unga CaptureFlow deb nom bering, ushbu URLni joylang, OAuthni tanlang, soʻng plaginni oʻrnatib, hisobga kiring. Business, Enterprise yoki Edu tarifi kerak.",
      limits:
        "Chatlar kompyuteringizni yozib olmaydi: taqdimot va yoʻriqnoma videolarini bizning serverlarimizda slaydlardan yigʻadi va tarifingizdagi bulutli agent daqiqalarini sarflaydi.",
    },
  },
  modes: {
    cta: "Yozishni boshlash",
    heading: "Chrome kengaytmasi bilan ekraningizni yozib oling",
    subtitle:
      "Uni oʻrnating va yozish tugmasini bosing. Tugatganingizda istalgan kishi koʻra oladigan, sarlavha, xulosa, boblar va transkripti bor havola olasiz.",
    scene: {
      timer: "0:42",
      heading: "Pulni qaytarish qanday ishlaydi",
      steps: ["Soʻrov", "Tasdiq", "Toʻlov"],
      captions: [
        "Pulni qaytarish qanday ishlashi haqida qisqacha.",
        "Avval mijoz soʻrov yuboradi.",
        "Yordam xizmati uni oʻsha kuniyoq tasdiqlaydi.",
        "Soʻng pul avtomatik oʻtkaziladi.",
      ],
    },
  },
  pageHeroes: {
    home: "Bosh sahifa",
    features: {
      label: "Imkoniyatlar",
      word: "IMKONIYATLAR",
      title: "Ekranni yozib oling, tahrirlang va ulashing",
      subtitle:
        "Ekran va kamerangizni yozib oling. Har bir yozuvni jamoangiz fikr qoldira oladigan havola sifatida ulashing.",
    },
    pricing: {
      label: "Narxlar",
      word: "NARXLAR",
      title: "Bepul boshlang. Har bir aʼzo uchun bitta narx toʻlang.",
      subtitle:
        "Bepul tarif dastlabki 25 ta yozuvingizni qamraydi. Light va Pro cheklovni olib tashlaydi. CaptureFlowni mustaqil hostingda bepul ishga tushirish ham mumkin.",
    },
    faq: {
      label: "Savol-javob",
      word: "SAVOLLAR",
      title: "Koʻp beriladigan savollar",
      subtitle:
        "Yozib olish, narxlar, saqlash va mustaqil hosting boʻyicha javoblar. Qolgan hammasi uchun hujjatlarni oʻqing.",
    },
    chromeExtension: {
      label: "Chrome kengaytmasi",
      word: "CHROME",
      title: "Chrome’da ekraningizni yozib oling",
      subtitle:
        "Ekraningiz, tab yoki kamerangizni yozib oling. Tugatganingizdan soʻng transkript, xulosa va boblar bilan hamma koʻra oladigan havola olasiz.",
    },
    agentRecorder: {
      label: "Agentlar uchun yozuvchi",
      word: "MCP",
      title: "Videolaringizni AI agentingiz yozib olsin",
      subtitle:
        "Uni MCP orqali ulang va oddiy so'zlar bilan so'rang. U veb-ilovani, ekraningizni yoki bitta oynani yozib oladi, xohlasangiz slayd va ovoz qo'shadi va sizga havola beradi.",
    },
  },
  collaboration: {
    heading: "Yozib olgandan keyin nima qilish mumkin",
    cta: "Bepul sinab koʻring",
    subtitle:
      "Videoni tahrirlang, soʻng ulashing yoki sahifaga joylang. Jamoangizni bir-birining videolarini koʻrish, reaksiya bildirish va fikr qoldirishga taklif qiling.",
    categories: {
      share: {
        feature: {
          tag: "yangi",
          title: "Videoni tahrirlang",
          cta: "Kengaytmani oʻrnatish",
          body: "Transkriptdan soʻzlarni oʻchirib, ularni videodan kesib tashlang yoki kliplarni vaqt shkalasida qirqing. Fonni almashtiring, kamerani suring, oʻlchamini oʻzgartiring yoki yashiring, mikrofon yoki tizim ovozini oʻchiring.",
        },
        scene: {
          app: "Reliz rejasi",
          nav: ["Umumiy", "Yoʻl xaritasi", "Vazifalar", "Hujjatlar"],
          columns: [
            {
              name: "Rejada",
              tasks: ["Narxlar sahifasi matni", "Tanishuv xati"],
            },
            {
              name: "Bajarilmoqda",
              tasks: ["Toʻlov sahifasi dizayni", "Jamoaga takliflar"],
            },
            { name: "Tayyor", tasks: ["Beta roʻyxati formasi"] },
          ],
          background: "Fon",
          camera: "Kamera",
          shapes: ["Doira", "Kvadrat"],
          fillers: "Parazit soʻzlar",
          remove: "Oʻchirish",
          transcript: {
            before: "Bu yerni bosing va",
            fillers: ["eee,", "shoshmang,", "uzr,"],
            after: "havolani ulashing.",
          },
          saved: "Saqlandi · havola oʻsha",
        },
      },
      embed: {
        feature: {
          title: "Videoni ulashing yoki sahifaga joylang",
          cta: "Kengaytmani oʻrnatish",
          body: "Havolani Slack, GitHub, Notion yoki elektron xatga qoʻysangiz, u oldindan koʻrinish bilan chiqadi. Pleyerni hujjatlaringiz yoki saytingizga ham joylashingiz mumkin. Kengaytma oʻrnatilgan boʻlsa, video GitHub issue va pull requestlari ichida ijro etiladi.",
        },
        scene: {
          question:
            "Jamoamni ish maydoniga qanday taklif qilishni koʻrsata olasizmi?",
          reply: "Albatta! Mana qadamlar boʻyicha qisqa tanishtiruv:",
          url: "captureflow.dev/r/8kx2pnq4",
          app: "Sozlamalar",
          nav: ["Umumiy", "Aʼzolar", "Toʻlovlar"],
          members: "Aʼzolar",
          invite: "Taklif qilish",
          people: [
            { initials: "AR", name: "Alex Rivera", role: "Ega" },
            { initials: "CK", name: "Chris Kim", role: "Aʼzo" },
            { initials: "JB", name: "Jordan Bell", role: "Aʼzo" },
          ],
          duration: "0:48",
        },
      },
      feedback: {
        feature: {
          title: "Videolar ustida birga ishlang",
          cta: "Kirish",
          body: "Uchrashuvsiz, turli vaqt mintaqalarida birga ishlang. Jamoangiz emoji bilan reaksiya bildirishi, videoning istalgan lahzasiga fikr qoldirishi hamda transkript va subtitrlar orqali kuzatib borishi mumkin.",
        },
        scene: {
          title: "Reliz rejasi tanishtiruvi",
          author: "Alex",
          age: "hozirgina",
          duration: "1:12",
          activity: "Faollik",
          events: [
            { initials: "CK", name: "Chris", at: "0:09", emoji: "👍" },
            { initials: "JB", name: "Jordan", at: "0:17", emoji: "🔥" },
            {
              initials: "MC",
              name: "Maya",
              at: "0:27",
              text: "Yangi doska koʻrinishi zoʻr",
            },
            { initials: "SL", name: "Sam", at: "0:37", emoji: "❤️" },
            {
              initials: "JB",
              name: "Jordan",
              at: "0:48",
              text: "Buni juma kuni chiqara olamizmi?",
            },
            {
              initials: "AR",
              name: "Alex",
              at: "0:56",
              text: "Ha, QA tugashi bilan ✅",
            },
            { initials: "MC", name: "Maya", at: "1:05", emoji: "👏" },
          ],
        },
      },
      workspaces: {
        feature: {
          title: "Jamoangizni ish maydoniga taklif qiling",
          cta: "Ish maydoni yaratish",
          body: "Hammaning yozuvlari bitta ish maydonida saqlanadi. Har bir video ommaviy, ish maydoniga koʻrinadigan yoki shaxsiy boʻlishi mumkin.",
        },
        scene: {
          team: "CaptureFlow jamoasi",
          members: ["1 aʼzo", "2 aʼzo", "3 aʼzo"],
          memberInitials: ["AR", "CK", "JB"],
          invitePlaceholder: "E-pochta orqali taklif",
          inviteEmail: "chris@acme.co, jordan@acme.co",
          invite: "Taklif qilish",
          invited: "Yuborildi",
          joined: "Chris va Jordan qoʻshildi 🎉",
          whoCanWatch: "Kim koʻra oladi:",
          visibility: [
            { label: "Ommaviy", detail: "Havolasi bor har kim" },
            { label: "Ish maydoni", detail: "Faqat jamoangiz" },
            { label: "Shaxsiy", detail: "Faqat siz" },
          ],
        },
      },
    },
  },
  setupService: {
    title: "Hammasini biz",
    titleHighlight: "sozlab beramiz",
    subtitle:
      "Kompaniyangiz haqida aytib bering. Biz ilovani, Chrome kengaytmasini, macOS ilovasini va ular ortidagi butun infratuzilmani jamoangiz foydalanishi uchun tayyor holda sozlab beramiz.",
    includedHeading: "Biz sozlab beradigan hamma narsa",
    included: {
      infra: {
        title: "Ilova oʻz infratuzilmangizda",
        body: "Oʻz Cloudflare hisobingizga joylanadi va domeningizda ishlaydi. Hammasi sizniki.",
      },
      storage: {
        title: "Saqlash va maʼlumotlar bazasi",
        body: "Yozuvlar oʻz R2 bucketingizda, ish maydonlari va fikrlar oʻz maʼlumotlar bazangizda.",
      },
      signin: {
        title: "Faqat kompaniya uchun kirish",
        body: "Google Workspace yoki GitHub orqali kirish, faqat kompaniyangizning e-pochta domeni bilan cheklangan.",
      },
      apps: {
        title: "Chrome kengaytmasi va Mac ilovasi",
        body: "Ikkalasi ham sizning tizimingiz uchun yigʻiladi, kengaytma esa faqat jamoangiz uchun yopiq holda nashr qilinadi.",
      },
      ready: {
        title: "Yozishga tayyor",
        body: "Ish maydonlari yaratiladi va jamoangiz taklif qilinadi, shunda hamma darhol ulashishni boshlay oladi.",
      },
      handover: {
        title: "Topshirish",
        body: "Tizimga qaraydigan kishiga uni yuritish va yangilashni koʻrsatib beramiz.",
      },
    },
    nextHeading: "Biz bilan bogʻlaning",
    nextSubheading: "Nima kerakligini yozing, sizga javob beramiz.",
    form: {
      company: "Kompaniya",
      companyPlaceholder: "Acme Inc.",
      name: "Ismingiz",
      namePlaceholder: "Jane Doe",
      email: "Ish e-pochtangiz",
      emailPlaceholder: "jane@acme.com",
      topic: "Nima boʻyicha yordam kerak?",
      topics: ["Mustaqil hostingni sozlash", "1 TB dan koʻp", "Boshqa"],
      teamSize: "Jamoa hajmi",
      teamSizes: ["1–10", "11–50", "51–200", "200+"],
      cloudflare: "Cloudflare hisobingiz bormi?",
      cloudflareOptions: ["Ha", "Yoʻq", "Bilmayman"],
      notes: "Yana nimani bilishimiz kerak?",
      notesPlaceholder: "Jamoangiz hajmi, domeningiz, muddatlaringiz…",
      submit: "Xabar yuborish",
      error:
        "Soʻrovingiz yuborilmadi. Qayta urinib koʻring yoki bizga {email} manziliga yozing.",
      sentTitle: "Xabar yuborildi",
      sentBody: "Rahmat. Sizga {email} manziliga javob yozamiz.",
      back: "Bosh sahifaga qaytish",
    },
  },
  swarmDemo: {
    title: "Tomosha qiling: agentlar to'dasi qayta quradi",
    titleHighlight: "istalgan saytni",
    subtitle:
      "Sayt manzilini kiriting. Agent kursorlari toʻdasi uni musiqa ostida elementma-element qaytadan chizadi va siz ulashish uchun video havolasini olasiz.",
    url: "Sayt manzili",
    urlPlaceholder: "https://example.com",
    generate: "Demo yaratish",
    generating: "Bulutli brauzer ishga tushirilmoqda…",
    check: "Saytni tekshirish",
    checking: "Sayt tekshirilmoqda…",
    previewNote:
      "Agentlar qayta quradigan sahifa shu. To‘g‘ri ko‘rinsa, demo yarating.",
    change: "Manzilni o‘zgartirish",
    note: "Bepul yaratish uchun tizimga kiring. Har bir demo kutubxonangizga tushadi.",
    noteSignedIn: "Bepul yarating. Har bir demo kutubxonangizga tushadi.",
    howHeading: "Bu qanday ishlaydi",
    how: {
      type: {
        title: "Manzil kiriting",
        body: "Istalgan ochiq sayt. Sahifa bulutli brauzerda yuklanadi va undagi har bir sarlavha, rasm, tugma va karta topiladi.",
      },
      build: {
        title: "Agentlar uni qayta quradi",
        body: "Soʻrov chat oynasiga yoziladi, soʻng kursorlar toʻdasi musiqa tezlashgani sayin har bir elementni oʻz joyiga qoʻyadi.",
      },
      share: {
        title: "Havola oling",
        body: "Video tayyor boʻlishi bilan kutubxonangizda ochiladi. Havolani ulashing, faylni yuklab oling yoki joylang.",
      },
    },
    errors: {
      invalidUrl: "example.com kabi sayt manzilini kiriting.",
      unreachable:
        "Bu saytga ulanib bo‘lmadi. Manzilni tekshirib, qayta urinib ko‘ring.",
      unavailable: "Bu serverda demolar mavjud emas.",
      running:
        "Yozuvlaringizdan biri hali davom etmoqda. Tugashini kutib, qayta urinib koʻring.",
      limit:
        "Bu ish maydoni shu oy uchun bulutli agent daqiqalarini sarflab boʻldi. Ular har oyning 1-sanasida yangilanadi.",
      recordings:
        "Bepul tarifdagi yozuvlar chegarasiga yetdingiz. Birorta yozuvni oʻchiring yoki tarifni yangilang, soʻng qayta urinib koʻring.",
      busy: "Hozir barcha bulutli brauzerlar band. Bir necha daqiqadan soʻng qayta urinib koʻring.",
      failed: "Demoni ishga tushirib boʻlmadi. Qayta urinib koʻring.",
    },
  },
  enterprise: {
    title: "CaptureFlow",
    titleHighlight: "kompaniyangiz uchun",
    subtitle:
      "Hammaga oʻrin, bir marta kelishilgan shartlar va yagona hisob-faktura kerak boʻlgan kompaniyalar uchun boshqariladigan tarif.",
    includedHeading: "Korporativ tarif nimalarni qoʻshadi",
    included: {
      storage: {
        title: "Sizga mos saqlash hajmi",
        body: "Har bir oʻringa ajratilgan limit emas, kompaniyangiz qancha yozishiga moslangan umumiy hajm.",
      },
      seats: {
        title: "Hammaga oʻrin",
        body: "Qancha odam yozib olmasin, bitta shartnoma butun kompaniyani qamraydi.",
      },
      roadmap: {
        title: "Avval sizning soʻrovlaringiz",
        body: "Jamoangiz soʻragan imkoniyatlar roʻyxatimizning boshiga chiqadi.",
      },
      managed: {
        title: "Toʻliq boshqariladi",
        body: "Hosting va yangilanishlar bizda, sizga hech narsani yuritish kerak emas.",
      },
      billing: {
        title: "Yillik toʻlov",
        body: "Yiliga bir marta, kompaniyangiz uchun kelishilgan narxda toʻlaysiz.",
      },
      support: {
        title: "Biz bilan bevosita aloqa",
        body: "Savollar toʻgʻridan-toʻgʻri CaptureFlowni yaratayotgan odamlarga boradi.",
      },
    },
    everythingHeading: "Jamoangiz oladigan hamma narsa",
    comingSoon: "Tez kunda",
    everything: {
      extension: {
        title: "Chrome kengaytmasi",
        body: "Istalgan varaq yoki ekranni yozib oling, toʻxtatganingizda havola tayyor boʻladi.",
      },
      mac: {
        title: "Mac ilovasi",
        body: "macOS uchun maxsus yozish dasturi, xuddi shunday tezkor ulashish havolalari bilan.",
      },
      workspaces: {
        title: "Jamoa ish maydonlari",
        body: "Hammaning yozuvlari bir joyda, ulashilgan yoki shaxsiy holda.",
      },
      feedback: {
        title: "Fikr va reaksiyalar",
        body: "Tomoshabinlar vaqt shkalasining aynan kerakli lahzasida javob yozadi.",
      },
      edit: {
        title: "Ulashgandan keyin tahrirlash",
        body: "Fon, kamera yoki ovozni oʻzgartiring, havola esa oʻzgarmaydi.",
      },
      screenshots: {
        title: "Izohli skrinshotlar",
        body: "Skrinshotni strelka, matn va xiralashtirish bilan belgilang va havola sifatida ulashing.",
      },
    },
    formHeading: "Biz bilan bogʻlaning",
    formSubheading: "Jamoangiz haqida yozing, e-pochta orqali javob beramiz.",
    form: {
      company: "Kompaniya",
      companyPlaceholder: "Acme Inc.",
      name: "Ismingiz",
      namePlaceholder: "Jane Doe",
      email: "Ish e-pochtangiz",
      emailPlaceholder: "jane@acme.com",
      need: "Sizga nima kerak?",
      needs: [
        "Katta jamoa uchun oʻrinlar",
        "Maxsus shartlar yoki yagona hisob-faktura",
        "Boshqa",
      ],
      teamSize: "Jamoa hajmi",
      teamSizes: ["1–10", "11–50", "51–200", "200+"],
      storage: "Qancha saqlash hajmi kerak?",
      storageOptions: ["1–5 TB", "5–20 TB", "20 TB+", "Bilmayman"],
      notes: "Yana nimani bilishimiz kerak?",
      notesPlaceholder:
        "Jamoangiz qancha yozadi, muddatlaringiz, toʻlov boʻyicha talablar…",
      submit: "Xabar yuborish",
      error:
        "Xabaringiz yuborilmadi. Qayta urinib koʻring yoki bizga {email} manziliga yozing.",
      sentTitle: "Xabar yuborildi",
      sentBody: "Rahmat. Sizga {email} manziliga javob yozamiz.",
      back: "Bosh sahifaga qaytish",
    },
  },
  pricing: {
    heading: "Narxlar",
    cta: "Barcha tariflarni solishtirish",
    subheading:
      "Bepul tarif dastlabki yozuvlaringizni qamraydi. Pullik tariflarda har bir aʼzo uchun bitta narx.",
    controls: {
      shownIn:
        "Narxlar {currency}da koʻrsatilgan. Toʻlov AQSH dollarida olinadi.",
      teamSize: "Jamoa hajmi",
      members: "aʼzo",
      title: "Toʻlov",
      note: "Har bir aʼzo uchun bitta narx.",
      billing: "Toʻlov davri",
      monthly: "Oylik",
      annually: "Yillik",
      save: "{percent}% tejang",
    },
    compare: {
      loomRow: "Loom {plan}",
      loomDetail: "{seats} kishi × {perSeat} dan",
      caption: "Oylik narxlar.",
      captureflowRow: "CaptureFlow {ourPlan}",
      captureflowDetail: "{seats} aʼzo × {ourPerSeat} dan",
      saveLabel: "Jamoangiz tejaydi",
      saveValue: "yiliga {savings}",
    },
    plans: {
      chargedInUsd: "AQSH dollarida undiriladi.",
      member: "aʼzo",
      members: "aʼzo",
      included: "Kiritilgan",
      notIncluded: "Kiritilmagan",
      free: {
        name: "Bepul",
        description: "Havola orqali ulashiladigan ekran yozuvlari.",
        cta: "Roʻyxatdan oʻtish",
      },
      light: {
        name: LIGHT,
        featuresHeading: "Bepul tarifdagi hamma narsa, hamda",
        features: [
          "Cheksiz yozuvlar",
          "Cheksiz yozish vaqti",
          `Bulutli agent yozuvlari uchun oyiga ${LIGHT_AGENT_MIN} daqiqa, har biri 10 daqiqagacha`,
        ],
        description: "Tejamkor sifatda cheksiz yozuvlar.",
        period: "/oy",
        noteMonthly: "Har bir aʼzo uchun, oylik toʻlov",
        noteAnnual:
          "Har bir aʼzo uchun, yillik toʻlov. {seats} {members} uchun yiliga {yearly}",
        cta: "Bepul sinab koʻring",
      },
      pro: {
        badge: "Tavsiya etiladi",
        name: PRO,
        featuresHeading: `${LIGHT} tarifidagi hamma narsa, hamda`,
        features: [
          "Toʻliq sifat, 1080p gacha",
          "SI boblari, sarlavhalari va parazit soʻzlarni oʻchirish",
          "Oʻz brendingiz",
          `Bulutli agent yozuvlari uchun oyiga ${PRO_AGENT_MIN} daqiqa, shundan ${PRO_VOICEOVER_MIN} daqiqasi SI ovozli sharhi bilan`,
          "Tomoshabinlar statistikasi (tez kunda)",
          "Slack, Notion va Zapier integratsiyalari (tez kunda)",
        ],
        description: "Toʻliq sifat, SI yordamida tozalash va oʻz brendingiz.",
        period: "/oy",
        noteMonthly: "Har bir aʼzo uchun, oylik toʻlov",
        noteAnnual:
          "Har bir aʼzo uchun, yillik toʻlov. {seats} {members} uchun yiliga {yearly}",
        cta: "Bepul sinab koʻring",
      },
      rows: {
        recordings: {
          label: "Har bir kishiga yozuvlar",
          free: "{recordings} tagacha",
          light: "Cheksiz",
          pro: "Cheksiz",
        },
        length: {
          label: "Yozuv davomiyligi",
          free: "Har bir video {minutes} daqiqagacha",
          light: "Cheksiz",
          pro: "Cheksiz",
        },
        quality: {
          label: "Video sifati",
          free: "Tejamkor",
          light: "Tejamkor",
          pro: "1080p gacha",
        },
        transcripts: {
          label: "Transkript va subtitrlar",
          free: true,
          light: true,
          pro: true,
        },
        editing: {
          label: "Transkript orqali tahrirlash",
          free: true,
          light: true,
          pro: true,
        },
        chapters: {
          label: "SI boblari va sarlavhalari",
          free: false,
          light: false,
          pro: true,
        },
        filler: {
          label: "Parazit soʻzlarni oʻchirish",
          free: false,
          light: false,
          pro: true,
        },
        feedback: {
          label: "Fikr va reaksiyalar",
          free: true,
          light: true,
          pro: true,
        },
        agents: {
          label: "Lokal agent yozuvlari",
          free: true,
          light: true,
          pro: true,
        },
        cloudAgents: {
          label: "Bulutli agent yozuvlari",
          free: `Oyiga ${FREE_AGENT_MIN} daqiqa`,
          light: `Oyiga ${LIGHT_AGENT_MIN} daqiqa`,
          pro: `Oyiga ${PRO_AGENT_MIN} daqiqa`,
        },
        voiceover: {
          label: "Lokal SI ovozli sharhi",
          free: true,
          light: true,
          pro: true,
        },
        cloudVoiceover: {
          label: "Bulutli SI ovozli sharhi",
          free: false,
          light: false,
          pro: `Oyiga ${PRO_VOICEOVER_MIN} daqiqa`,
        },
        branding: {
          label: "Oʻz brendingiz",
          free: false,
          light: false,
          pro: true,
        },
      },
    },
    table: {
      heading: "Barcha imkoniyatlar tariflar boʻyicha",
      subtitle: "Bepul, Light va Pro yonma-yon.",
      groups: [
        {
          title: "Yozib olish",
          rows: [
            {
              label: "Aʼzolar",
              free: "Cheksiz",
              light: "Cheksiz",
              pro: "Cheksiz",
            },
            {
              label: "Har bir kishiga yozuvlar",
              free: "{recordings} tagacha",
              light: "Cheksiz",
              pro: "Cheksiz",
            },
            {
              label: "Yozuv davomiyligi",
              free: "Har bir video {minutes} daqiqagacha",
              light: "Cheksiz",
              pro: "Cheksiz",
            },
            {
              label: "Video sifati",
              free: "Tejamkor",
              light: "Tejamkor",
              pro: "1080p gacha",
            },
            {
              label: "Skrinshotlar",
              free: "Cheksiz",
              light: "Cheksiz",
              pro: "Cheksiz",
            },
            {
              label: "Yozuvlarni saqlash",
              free: "Koʻrilmasa, 30 kun",
              light: "Oʻchirmaguningizcha",
              pro: "Oʻchirmaguningizcha",
            },
            {
              label: "Butun ekran, oyna yoki varaqni yozib olish",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Kamera doirachasi va kamera effektlari",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Mikrofon va tizim ovozi",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Silliq kursor",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Chrome kengaytmasi va Mac ilovasi",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "SI",
          rows: [
            {
              label: "Transkriptlar",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Subtitrlar",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Xulosa boblari",
              free: false,
              light: false,
              pro: true,
            },
            {
              label: "Avtomatik sarlavha takliflari",
              free: false,
              light: false,
              pro: true,
            },
            {
              label: "Videoni transkripti orqali tahrirlash",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Parazit soʻzlarni oʻchirish",
              free: false,
              light: false,
              pro: true,
            },
          ],
        },
        {
          title: "Agentlar",
          rows: [
            {
              label: "Kompyuteringizdagi agent yozuvlari",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Bulutda tayyorlangan agent taqdimotlari",
              free: `Har bir kishiga oyiga ${FREE_AGENT_MIN} daqiqa`,
              light: `Har bir aʼzoga oyiga ${LIGHT_AGENT_MIN} daqiqa`,
              pro: `Har bir aʼzoga oyiga ${PRO_AGENT_MIN} daqiqa`,
            },
            {
              label: "Agent yozuvlarida slaydlar",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Kompyuteringizdagi SI ovozli sharhi",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Bulutli taqdimotlarda AI ovozli izoh",
              free: false,
              light: false,
              pro: `Har bir aʼzoga oyiga ${PRO_VOICEOVER_MIN} daqiqa`,
            },
          ],
        },
        {
          title: "Tahrirlash",
          rows: [
            {
              label: "Ulashgandan keyin tahrirlash, havola oʻzgarmaydi",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Fonlar",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Kamera doirachasini surish yoki oʻlchamini oʻzgartirish",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Video qismlarini kesish",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Strelka, matn va xiralashtirishli izohli skrinshotlar",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Cheksiz doska",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "Ulashish va fikr-mulohaza",
          rows: [
            {
              label: "Toʻxtatishingiz bilan ulashish havolasi tayyor",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Ommaviy, ish maydoni yoki shaxsiy havolalar",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Cheklangan havolalarda ruxsat soʻrash",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Chat va e-pochtada havolaning oldindan koʻrinishi",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Pleyerni istalgan sahifaga joylash",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "GitHub issue va pull requestlari ichida ijro etiladi",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Vaqt shkalasidagi fikrlar",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Emoji reaksiyalar",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Koʻrishlar soni",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Asl faylni yuklab olish",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "Ish maydoni va boshqaruv",
          rows: [
            {
              label: "Jamoa ish maydoni",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Ega, aʼzo va tomoshabin rollari",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Standart koʻrinish va yuklash ruxsatlari",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Yozuvlar va skrinshotlar boʻyicha qidiruv",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Oʻz brendingiz",
              free: false,
              light: false,
              pro: true,
            },
          ],
        },
        {
          title: "Hosting va yordam",
          rows: [
            {
              label: "AGPL ostida ochiq kod",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Oʻz Cloudflare hisobingizda mustaqil hosting",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Boshqariladigan hosting va yangilanishlar",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
      ],
    },
    includes: {
      heading: "Har bir tarifda bor",
      items: [
        "Oʻz ish maydoningiz, istalgan kishini taklif qiling",
        "Kamera effektlari",
        "SI transkriptlari va subtitrlar",
        "Videoni transkripti orqali tahrirlash",
        "Ommaviy, ish maydoni yoki shaxsiy ulashish havolalari",
        "Fikrlar va emoji reaksiyalar",
        "Izohli skrinshotlar",
        "Cheksiz doska",
      ],
    },
    annual: {
      badgePro: "Boshqariladigan",
      badgeCycle: "Yillik",
      title: "Boshqariladigan hosting",
      subtitle: "Toʻliq hosting bizda, toʻlov yillik.",
      period: "/oy",
      note: "Yiliga {amount} toʻlanadi. Istalgan vaqtda bekor qilish mumkin.",
      cta: "Boshlash",
    },
  },
  activity: {
    heading: "GitHubdagi soʻnggi oʻzgarishlar",
    subtitle:
      "Har bir oʻzgarish ochiq. Bular GitHubdagi eng soʻnggi pull requestlar va ochiq issuelar.",
    cta: "GitHubda koʻrish",
    shippedHeading: "Yaqinda birlashtirilgan",
    openHeading: "Ochiq issue va pull requestlar",
    emptyOpen: "Hozircha ochiq narsa yoʻq.",
    newIssue: "Xato haqida xabar bering yoki imkoniyat soʻrang",
    viewAll: "Hammasini GitHubda koʻrish",
  },
  faq: {
    heading: "Koʻp beriladigan savollar",
    subtitle:
      "Yozib olish, narxlar, saqlash va mustaqil hosting boʻyicha javoblar. Qolgan hammasi uchun hujjatlarni oʻqing.",
    cta: "Hujjatlarni oʻqish",
    waitlistLink: "Kutish roʻyxatiga qoʻshilish",
    items: [
      {
        question: "Ekranni qanday yozib olaman?",
        answer:
          "Ikki usul bor, farqi esa yozuvni kim qilishida.\n\nChrome kengaytmasi bilan oʻzingiz yozib olasiz. Ekraningizda kerakli joylarni bosib chiqasiz va oʻz ovozingiz hamda kamerangiz bilan tushuntirib borishingiz mumkin. Undan tezkor yangiliklar, fikr-mulohaza yoki oʻzingiz qatnashishingiz kerak boʻlgan har qanday video uchun foydalaning.\n\nSI agenti bilan esa videoni tasvirlab berasiz, agent oʻzi bosib chiqib, siz uchun yozib oladi, siz esa ishingizni davom ettiraverasiz. U slaydlar va SI ovozli sharhini qoʻsha oladi. Undan mahsulot demolari, yoʻriqnomalar va xato hisobotlari uchun foydalaning.\n\nOʻzingiz yozib olish uchun:\n1. Chrome Web Store doʻkonidan CaptureFlow kengaytmasini oʻrnating.\n2. Brauzeringiz asboblar panelidagi kengaytma belgisini bosing va hisobga kiring.\n3. Belgini yana bosing. «This tab», «Window» yoki «Full screen» variantini tanlang, xohlasangiz kamera va mikrofonni yoqing.\n4. «Start Recording» tugmasini bosing. Sahifadagi panel orqali yozuvni pauza qilish yoki toʻxtatish mumkin.\n5. Toʻxtatish tugmasini bosing. Yozuvingiz sahifasi ochiladi, unda istalgan kishiga ulashish mumkin boʻlgan havola bor.\n\nAgentga yozdirish uchun:\n1. CaptureFlowni oʻzingiz ishlatadigan SI ilovasiga ulang. Bosh sahifaning agentlar boʻlimida Claude, ChatGPT, Claude Code, Codex va Cursor uchun qadamlar bor.\n2. Brauzer varagʻi ochilganda hisobga kiring. Buni faqat bir marta qilasiz.\n3. Videoni oddiy soʻzlar bilan soʻrang, masalan: Saytimizda qanday roʻyxatdan oʻtishni koʻrsatadigan demoni ovozli sharh bilan yozib ber.\n4. Agent uni yozib oladi va sizga istalgan kishiga ulashish mumkin boʻlgan havola beradi.",
      },
      {
        question: "CaptureFlowni mustaqil hostingda ishga tushira olamanmi?",
        answer:
          "Ha. CaptureFlow AGPL litsenziyasi ostidagi ochiq kodli dastur boʻlib, butun backend Cloudflareda ishlaydi: ilova va API uchun Workers, yozuvlar uchun R2, qolgan hammasi uchun D1. D1 maʼlumotlar bazasi va R2 bucket yarating, migratsiyalarni qoʻllang, bitta maxfiy kalitni oʻrnating va ishga tushiring. «Deploy to Cloudflare» tugmasi ham bor. Qoʻllanma docs.captureflow.dev manzilida.",
      },
      {
        question: "SI agentim men uchun video yozib bera oladimi?",
        answer:
          "Ha. CaptureFlowni Claude Code, Codex yoki Cursorga bir qator bilan qoʻshing yoki uni Claude yoxud ChatGPTda ulang, soʻng oddiy soʻzlar bilan video soʻrang. U oʻz kompyuteringizda brauzer, ekran yoki ilovani yozib oladi, xohlasangiz slaydlar va ovozli sharh qoʻshadi hamda ulashish uchun havola beradi.\n\nLokal agent yozuvlari har bir tarifga kiradi. Bulutli agent yozuvlari uchun tarifingizga bogʻliq oylik limit beriladi.",
      },
      {
        question: "Pullik tariflar narxi qanday hisoblanadi?",
        answer: `${LIGHT} va ${PRO} tariflarida har bir aʼzo uchun oyiga bitta narx, yillik toʻlovda esa arzonroq. Aʼzo deganda yozib oladigan kishi tushuniladi, yaʼni faqat yozuv qiladigan odamlar uchun toʻlaysiz.\n\nKimdir qoʻshilsa yoki chiqib ketsa, oʻrinlar soni keyingi hisob-fakturada shunga mos oʻzgaradi.`,
      },
      {
        question: "Yozuvlarim qancha vaqt saqlanadi?",
        answer:
          "Pullik tariflarda oʻzingiz oʻchirmaguningizcha. Bepul tarifda yozuv 30 kun davomida koʻrilmasa oʻchiriladi, shunda ishlatilmayotgan hisoblar joy egallab turmaydi. Mustaqil hostingda qoidalarni oʻzingiz belgilaysiz.",
      },
      {
        question: "Bepul tarifga nimalar kiradi?",
        answer: `Har bir kishiga 25 ta, har biri 5 daqiqagacha boʻlgan tejamkor sifatdagi yozuv, transkript va subtitrlari bilan beriladi. Yozuvlar 30 kun davomida koʻrilmasa oʻchiriladi. Roʻyxatdan oʻting, Chrome kengaytmasini oʻrnating va yozishni boshlang.\n\n${LIGHT} har bir aʼzo uchun bitta narx evaziga cheklovlarni olib tashlaydi va yozuvlarni oʻzingiz oʻchirmaguningizcha saqlaydi.`,
      },
    ],
  },
  cta: {
    headline: "Yozishni boshlang",
    subtitle:
      "Bepul yuklab oling. Bank kartasi kerak emas. Yana bir uchrashuv oʻrniga fikringizni qisqa video xabar bilan ayting.",
    button: "CaptureFlowni bepul sinab koʻring",
  },
  footer: {
    tagline: "Tezkor ulashish havolalari bilan ochiq kodli ekran yozuvi.",
    lights: "Chiroq",
    lightsOn: "Yoniq · ipni torting",
    lightsOff: "Oʻchiq · ipni torting",
    product: {
      title: "Mahsulot",
      features: "Imkoniyatlar",
      pricing: "Narxlar",
      compare: "Taqqoslash",
      download: "Yuklab olish",
      suggest: "Imkoniyat taklif qilish",
    },
    resources: {
      title: "Resurslar",
      docs: "Hujjatlar",
      selfHosting: "Mustaqil hosting",
      blog: "Blog",
      releases: "Relizlar",
      faq: "Savol-javob",
      security: "Xavfsizlik",
    },
    community: {
      title: "Hamjamiyat",
    },
    legal: {
      title: "Huquqiy maʼlumot",
      privacy: "Maxfiylik siyosati",
      terms: "Foydalanish shartlari",
      refund: "Pulni qaytarish siyosati",
      license: "Litsenziya (AGPL-3.0)",
    },
    rights: "© {year} CaptureFlow. Barcha huquqlar himoyalangan.",
    openSource: "AGPL-3.0 ostida ochiq kod",
  },
  pageShell: {
    logoAlt: "CaptureFlow",
    backToHome: "Bosh sahifaga qaytish",
  },
  waitlist: {
    errors: {
      joinFailed: "Kutish roʻyxatiga qoʻshilib boʻlmadi. Qayta urinib koʻring.",
      network: "Tarmoq xatosi. Qayta urinib koʻring.",
    },
    success:
      "Siz roʻyxatdasiz. CaptureFlow tayyor boʻlganda sizga xat yozaman.",
    emailPlaceholder: "you@example.com",
    buttonLoading: "Qoʻshilmoqda…",
    buttonDefault: "Kutish roʻyxatiga qoʻshilish",
    earlyAccessPrompt: "Erta kirishni xohlaysizmi?",
    earlyAccessLink: "Beta-sinovchi boʻling",
  },
  download: {
    heading: "CaptureFlowni yuklab oling",
    subtitle:
      "Chrome uchun mavjud, macOS ilovasi tez kunda chiqadi. Har bir yozuvga ulashish mumkin boʻlgan havola beriladi.",
    button: "macOS uchun yuklab olish",
    requires:
      "Apple Silicon qurilmasida {version} yoki undan yangisi talab qilinadi.",
    requirements:
      "Apple Silicon qurilmasida macOS 14 yoki undan yangisi talab qilinadi.",
    versionLabel: "Versiya {version}",
    sizeLabel: "{size} MB DMG",
    notarized: "Apple tomonidan imzolangan va tasdiqlangan",
  },
  downloadPage: {
    otherWays: "Boshqa usullar",
    buildTitle: "Manba kodidan yigʻish",
    buildBody:
      "Repozitoriyni klonlang va yozish dasturini pnpm yordamida lokal ishga tushiring.",
    releasesTitle: "Barcha relizlar",
    releasesBody:
      "Chiqarilgan barcha versiyalar va oʻzgarishlar roʻyxatini GitHubda koʻring.",
    cloud:
      "Bulutni afzal koʻrasizmi? {link} va yozuvlarni brauzeringizda koʻring.",
    cloudLink: "Hisob yarating",
  },
  blog: {
    title: "Blog",
    subtitle:
      "Ekranni yozib olish boʻyicha maslahatlar, qoʻllanmalar va yangiliklar.",
    readArticle: "Maqolani oʻqish",
    empty: "Hozircha maqolalar yoʻq. Tez orada qayta kiring.",
  },
};

export default messages;

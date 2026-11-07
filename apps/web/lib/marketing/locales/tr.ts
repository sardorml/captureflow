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
      title: "CaptureFlow - Paylaşılabilir Bağlantılı Ekran Kaydedici",
      description:
        "Ekranınızı kaydedin, bağlantıyı ekibinizle veya müşterilerinizle paylaşın. Yapay zeka transkriptli, açıklamalı ekran görüntülü açık kaynak ekran kaydedici; Cloudflare'de kendiniz barındırın.",
    },
    features: {
      title: "Ekran kaydedici özellikleri",
      description:
        "Kamera ve mikrofonla sekmeyi, pencereyi veya tüm ekranı kaydedin, açıklamalı ekran görüntüsü alın ve her birini ekibinizin yorum yapabileceği bir bağlantıyla paylaşın.",
    },
    pricing: {
      title: "Fiyatlandırma: ücretsiz başlayın, üye başına tek fiyat",
      description: `${FREE_RECORDINGS} kayıtla ücretsiz başlayın. ${LIGHT} ve ${PRO}, sınırsız kayıt ve yapay zeka ile üye başına tek fiyattır. Ya da CaptureFlow'u ücretsiz olarak kendiniz barındırın.`,
    },
    faq: {
      title: "SSS: paylaşım, depolama ve kendiniz barındırma",
      description:
        "CaptureFlow hakkında sık sorulanlar: paylaşım bağlantıları nasıl çalışır, Cloudflare'de kendiniz barındırma ne gerektirir, depolama sınırları ve kayıtlar nasıl gizli kalır.",
    },
    download: {
      title: "Chrome için ekran kaydediciyi indirin",
      description:
        "Ekranınızı kaydetmek ve bir bağlantıyla paylaşmak için CaptureFlow Chrome uzantısını yükleyin.",
    },
    enterprise: {
      title: "Kurumsal",
      description:
        "Büyük şirketler için yönetilen CaptureFlow: herkes için lisans, özel koşullar ve tek fatura. Neye ihtiyacınız olduğunu bize söyleyin.",
    },
    selfHostSetup: {
      title: "Kendiniz barındırma kurulumu",
      description:
        "CaptureFlow'u şirketinizin kendi Cloudflare hesabına kurdurun: alan adınız, yalnızca şirkete özel giriş ve ekibiniz için özel bir Chrome uzantısı.",
    },
    swarmDemo: {
      title:
        "Sürü demosu: ajanlar herhangi bir web sitesini videoda yeniden kuruyor",
      description:
        "Bir web sitesi adresi yazın ve bir ajan imleci sürüsünün onu müzik eşliğinde öğe öğe yeniden kurmasını izleyin. Paylaşabileceğiniz bir bağlantıyla birlikte bir video alırsınız.",
    },
    chromeExtension: {
      title: "Chrome uzantısı: ekranınızı kaydedin ve bir bağlantı paylaşın",
      description:
        "Chrome'dan ekranınızı, bir sekmeyi veya kameranızı kaydedin. Bitirdiğinizde transkript, özet ve bölümlerle herkesin izleyebileceği bir bağlantı alırsınız.",
    },
    agentRecorder: {
      title: "MCP sunucusu: yapay zekâ ajanınız video kaydeder",
      description:
        "Claude Code, Codex, Cursor veya ChatGPT'yi MCP ile CaptureFlow'a bağlayın. Ajanınız bir web uygulamasını, ekranınızı veya tek bir pencereyi kaydeder ve paylaşmanız için bir bağlantı verir.",
    },
  },
  nav: {
    features: "Özellikler",
    discover: "Keşfedin",
    pricing: "Fiyatlandırma",
    faq: "SSS",
    changelog: "Değişiklik günlüğü",
    login: "Giriş yapın",
    library: "Kayıtlarım",
    download: "İndirin",
    language: "Dil",
    openMenu: "Menüyü aç",
    menu: "Menü",
    main: "Ana menü",
    docs: "Belgeler",
    resources: "Kaynaklar",
    faqDescription: "Sık sorulan soruların yanıtları",
    blog: "Blog",
    blogDescription: "Kılavuzlar ve güncellemeler",
    selfHosting: "Kendiniz barındırma",
    selfHostingDescription: "Kendi Cloudflare hesabınızda çalıştırın",
    community: "Topluluk",
    communityDescription: "Discord'da yardım alın ve sohbet edin",
    products: "Ürünler",
    swarmDemo: "Sürü demosu",
    swarmDemoDescription:
      "Ajanlar herhangi bir web sitesini videoda yeniden kuruyor",
    extension: "Chrome uzantısı",
    extensionDescription: "Ekranınızı kaydedin ve bir bağlantı paylaşın",
    agentRecorder: "Ajanlar için kaydedici",
    agentRecorderDescription:
      "Yapay zeka ajanınızın MCP üzerinden yaptığı videolar",
    star: "GitHub'da yıldız verin",
    starCount: "GitHub'da yıldız verin ({stars})",
    themeToLight: "Açık temaya geç",
    themeToDark: "Koyu temaya geç",
  },
  banner: {
    label: "Beta",
    aria: "CaptureFlow herkese açık beta aşamasında",
    title: "Erken geldiniz 🎉",
    strip:
      "CaptureFlow hâlâ beta aşamasında; bu yüzden sık sık değişiyor ve yerine oturana kadar ufak pürüzlerle karşılaşabilirsiniz.",
    body: "CaptureFlow herkese açık beta aşamasında. Çoğu hafta yeni bir şey ekleniyor ve en çok istenenler ilk geliştirilenler oluyor.",
    cta: "Sırada neyi geliştireceğimi söyleyin",
    close: "Kapat",
  },
  announcement: {
    badge: "Yeni",
    lead: "Yapay zeka ajanınız artık sizin yerinize kayıt yapabiliyor.",
    rest: "Bir kez bağlayın, bir video isteyin ve bağlantınızı alın.",
    cta: "Bağlayın",
  },
  hero: {
    title: "Siz ve yapay zeka ajanlarınız\niçin ekran kaydedici",
    subtitle:
      "Demoları, nasıl yapılır videolarını, adım adım anlatımları ve sunumları kendiniz kaydedin ya da yapay zekanıza kaydettirin. Her birini herkesin izleyebileceği bir bağlantı olarak paylaşın.",
    ctaLabel: "CaptureFlow'u ücretsiz deneyin",
    installChrome: "Chrome uzantısını yükleyin",
    installMac: "macOS için indirin",
    installSoon: "Yakında",
    connectMcp: "MCP'ye bağlanın",
    macSoon: "macOS uygulaması yakında",
    installOr: "veya",
    mcpCopy: "Kopyala",
    mcpCopied: "Kopyalandı",
    mcpAddToCursor: "Cursor'a ekle",
    badge: "Açık kaynak, çalıştırması ücretsiz: {github}",
    noCreditCard: "Kredi kartı gerekmez",
    teaser: {
      title: "Kendiniz barındırabilirsiniz",
      body: "Kendi Cloudflare hesabınızda çalıştırın.",
      cta: "CaptureFlow'u deneyin",
    },
    demo: {
      prevAria: "Önceki demo",
      nextAria: "Sonraki demo",
      dotAria: "{total} demodan {n}. demoyu göster",
    },
  },
  highlights: {
    heading: "Tüm özellikler",
    subtitle: "Kaydedin, düzenleyin ve paylaşın. Hepsi tek bir yerde.",
    items: {
      recording: {
        title: "Ekran ve kamera",
        body: "İkisini aynı anda kaydedin",
      },
      transcripts: { title: "Transkriptler", body: "99 dilde", tag: "YZ" },
      editing: {
        title: "Transkript düzenleme",
        body: "Metni silerek videoyu kesin",
        tag: "YZ",
      },
      camera: {
        title: "Kamera efektleri",
        body: "Arka planlar ve filtreler",
      },
      canvas: { title: "Sonsuz tuval", body: "Kaydederken çizin" },
      screenshots: {
        title: "Açıklamalı ekran görüntüleri",
        body: "Oklar, metin ve bulanıklaştırma",
      },
      feedback: {
        title: "Yorumlar ve tepkiler",
        body: "Video üzerinde geri bildirim",
      },
      summary: {
        title: "Özetler ve bölümler",
        body: "Her videoya bir başlıkla",
        tag: "YZ",
      },
      filler: {
        title: "Otomatik dolgu sözcüğü temizleme",
        body: "“Iıı” ve “eee”leri keser",
        tag: "YZ",
      },
    },
    cta: "Tüm özellikleri görün",
    previews: {
      app: "Lansman planı",
      columns: ["Yapılacak", "Yapılıyor", "Bitti"],
      lines: [
        "İşte yeni akış.",
        "Önce bir çalışma alanı seçin.",
        "Sonra bağlantıyı paylaşın.",
      ],
      retake: "Iıı, baştan başlayayım.",
      filler: [
        "[Iıı,] işte yeni akış.",
        "Önce, [eee,] bir çalışma alanı seçin.",
        "Sonra, [ıı,] bağlantıyı paylaşın.",
      ],
      step: "1. adım",
      note: "Bunu taşıyın",
      comment: "Bu akışa bayıldım",
      summaryTitle: "Ekibinizi nasıl davet edersiniz",
      summaryBody: "Bir çalışma alanı seçin, sonra bağlantıyı paylaşın.",
      chapters: ["Giriş", "Çalışma alanı seçme"],
    },
  },
  mcpFeatures: {
    heading: "MCP özellikleri",
    subtitle:
      "Yapay zeka ajanınızın bağlandıktan sonra yapabildikleri. Claude Code, Codex, Cursor veya herhangi bir MCP istemcisiyle kendi bilgisayarınızda kayıt yapar.",
    cta: "Kılavuzu okuyun",
    items: {
      webApp: { title: "Web uygulamasını kaydeder", body: "localhost dahil" },
      screen: { title: "Ekranınızı kaydeder", body: "Bütün bir ekranı" },
      window: {
        title: "Tek bir pencereyi kaydeder",
        body: "Terminal, VS Code veya Figma",
      },
      slides: {
        title: "Slayt ekler",
        body: "Başlıklar, adımlar ve kapanış cümleleri",
      },
      voiceover: {
        title: "Seslendirme ekler",
        body: "Bilgisayarınızda çalışır",
      },
      report: {
        title: "Rapor yazar",
        body: "Ne yaptığını ve neyin başarısız olduğunu",
      },
      search: { title: "Kayıtlarda arar", body: "Videolar ve transkriptler" },
      save: {
        title: "MP4 dosyası kaydeder",
        body: "Yükleme veya giriş gerekmez",
      },
    },
  },
  useCases: {
    heading: "Ekipler nasıl kullanıyor",
    subtitle:
      "Ekiplerin kaydettiklerinden örnekler. Her video, herhangi bir tarayıcıda oynatılan bir bağlantıdır.",
    cta: "Nasıl çalıştığını görün",
    cards: {
      engineering: {
        title: "Mühendislik",
        body: "Bir PR'ın adım adım anlatımını veya bir hatanın nasıl oluştuğunu kaydedin.",
      },
      design: {
        title: "Tasarım",
        body: "Bir taslağın adım adım anlatımını kaydedin ve yorum toplayın.",
      },
      support: {
        title: "Müşteri desteği",
        body: "Bir destek talebini kısa bir adım adım anlatımla yanıtlayın.",
      },
      updates: {
        title: "Ekip güncellemeleri",
        body: "Haftalık güncellemeyi kaydedin ve bağlantıyı paylaşın.",
      },
    },
    engineeringFile: "checkout.ts",
    engineeringPr: "PR #482",
    designApp: "trip-app",
    designBadge: "Ödeme v3",
    designCardTitle: "Seyahatinizi planlayın",
    designColors: "Renkler",
    designComment: "CTA büyüsün mü?",
    supportQuestion: "Ekibimi çalışma alanına nasıl davet ederim?",
    supportReply: "İşte kısa bir anlatım:",
    supportLink: "captureflow.dev/r/8kx2pnq4",
    updatesTitle: "Haftalık güncelleme",
    updatesRange: "6–10 Eki",
    updatesSignups: "Kaydolanlar",
    updatesShipped: "Yayınlanan",
    updatesFeatures: "özellik",
  },
  agents: {
    heading:
      "Ya da demolarınızı ve nasıl yapılır videolarınızı yapay zeka ajanınıza kaydettirin",
    worksWith: "{claude}, {openai} ve {cursor} ile çalışır.",
    cta: "Kılavuzu okuyun",
    subtitle:
      "Sade bir dille isteyin. Kendi bilgisayarınızda bir tarayıcıyı, ekranınızı veya bir uygulamayı kaydeder, isterseniz slayt ve seslendirme ekler ve size bir bağlantı verir.",
    steps: [
      {
        title: "Ajanınızı bağlayın",
        body: "CaptureFlow'u tek satırla Claude Code, Codex veya Cursor'a ekleyin. Node.js 20 veya daha yeni bir sürüm gerekir ve ajanınız bir kez giriş yapar. Claude veya ChatGPT'de URL ile ekleyin.",
      },
      {
        title: "Bir video isteyin",
        body: "Özellik demosu, nasıl yapılır videosu, hata raporu veya seslendirmeli sunum.",
      },
      {
        title: "Sizin yerinize kaydeder",
        body: "Bilgisayarınızda, localhost'taki bir uygulamayı bile.",
      },
      {
        title: "Slayt ve ses ekler",
        body: "İsterseniz başlık slaytları ve seslendirme.",
      },
      {
        title: "Paylaşacağınız bağlantıyı verir",
        body: "Bir pull request'e ekleyin, Slack'te paylaşın veya bir müşteriye gönderin.",
      },
    ],
    scenes: {
      ask: {
        name: "terminal",
        badge: "ajan",
        prompt: "Ödeme demosu kaydet",
        steps: ["Uygulama açılıyor", "Adımlar tıklanıyor", "Bağlantınız hazır"],
      },
      record: {
        url: "localhost:3000",
        badge: "demo",
        title: "Ödeme",
        fields: ["Adınız", "Kart numarası"],
        pay: "Şimdi öde",
        paid: "Ödendi",
      },
      voice: {
        title: "Ödeme demosu",
        subtitle: "Üç adımda nasıl ödenir",
      },
      share: {
        title: "Ödeme demosu",
        link: "captureflow.dev/r/checkout",
        places: ["PR", "Slack", "E-posta"],
      },
    },
    chats: {
      claude:
        "Claude'da Customize'ı, ardından Connectors'ı açın ve Add custom connector'ı seçin. Adını CaptureFlow koyun, bu URL'yi yapıştırın ve giriş yapın.",
      chatgpt:
        "Web'deki ChatGPT'de Plugins'i açın, + düğmesine basın ve Add custom MCP server'ı seçin. Adını CaptureFlow koyun, bu URL'yi yapıştırın, OAuth'u seçin, ardından eklentiyi yükleyin ve giriş yapın. Business, Enterprise veya Edu planı gerekir.",
      limits:
        "Sohbetler, bilgisayarınızın kaydı yerine sunucularımızda slaytlardan sunum ve nasıl yapılır videoları oluşturur ve planınızın bulut ajan dakikalarını kullanır.",
    },
  },
  modes: {
    cta: "Kayda başlayın",
    heading: "Chrome uzantısıyla ekranınızı kaydedin",
    subtitle:
      "Yükleyin ve kayıt düğmesine basın. Bitirdiğinizde başlığı, özeti, bölümleri ve transkripti olan, herkesin izleyebileceği bir bağlantı alırsınız.",
    scene: {
      timer: "0:42",
      heading: "İade nasıl işler",
      steps: ["Talep", "Onay", "Ödeme"],
      captions: [
        "İadenin nasıl işlediğine kısaca bakalım.",
        "Önce müşteri bir talep gönderir.",
        "Destek ekibi aynı gün onaylar.",
        "Sonra para otomatik olarak ödenir.",
      ],
    },
  },
  pageHeroes: {
    home: "Ana sayfa",
    features: {
      label: "Özellikler",
      word: "ÖZELLİKLER",
      title: "Ekranınızı kaydedin, düzenleyin ve paylaşın",
      subtitle:
        "Ekranınızı ve kameranızı kaydedin. Her kaydı, ekibinizin yorum yapabileceği bir bağlantı olarak paylaşın.",
    },
    pricing: {
      label: "Fiyatlandırma",
      word: "FİYATLAR",
      title: "Ücretsiz başlayın. Üye başına tek fiyat ödeyin.",
      subtitle:
        "Ücretsiz plan ilk 25 kaydınızı kapsar. Light ve Pro sınırı kaldırır. CaptureFlow'u ücretsiz olarak kendiniz de barındırabilirsiniz.",
    },
    faq: {
      label: "SSS",
      word: "SSS",
      title: "Sık Sorulan Sorular",
      subtitle:
        "Kayıt, fiyatlandırma, depolama ve kendiniz barındırma hakkında yanıtlar. Diğer her şey için belgeleri okuyun.",
    },
    chromeExtension: {
      label: "Chrome uzantısı",
      word: "CHROME",
      title: "Chrome'dan ekranınızı kaydedin",
      subtitle:
        "Ekranınızı, bir sekmeyi veya kameranızı kaydedin. Bitirdiğinizde transkript, özet ve bölümlerle herkesin izleyebileceği bir bağlantı alırsınız.",
    },
    agentRecorder: {
      label: "Ajanlar için kaydedici",
      word: "MCP",
      title: "Videolarınızı yapay zekâ ajanınız kaydetsin",
      subtitle:
        "MCP ile bağlayın ve sade sözcüklerle isteyin. Bir web uygulamasını, ekranınızı veya tek bir pencereyi kaydeder, isterseniz slayt ve ses ekler ve size bir bağlantı verir.",
    },
  },
  collaboration: {
    heading: "Kayıttan sonra yapabilecekleriniz",
    cta: "Ücretsiz deneyin",
    subtitle:
      "Düzenleyin, ardından paylaşın veya gömün. Ekibinizi birbirinin videolarını izlemeye, tepki vermeye ve yorum yapmaya davet edin.",
    categories: {
      share: {
        feature: {
          tag: "yeni",
          title: "Videonuzu düzenleyin",
          cta: "Uzantıyı yükleyin",
          body: "Transkriptten sözcükleri silerek videodan kesin veya zaman çizelgesinde klipleri kırpın. Arka planı değiştirin, kameranızı taşıyın, yeniden boyutlandırın veya gizleyin, mikrofonu ya da sistem sesini kapatın.",
        },
        scene: {
          app: "Lansman planı",
          nav: ["Genel bakış", "Yol haritası", "Görevler", "Belgeler"],
          columns: [
            {
              name: "Yapılacak",
              tasks: ["Fiyat sayfası metni", "Karşılama e-postası"],
            },
            {
              name: "Devam ediyor",
              tasks: ["Ödeme sayfası tasarımı", "Ekip davetleri"],
            },
            { name: "Bitti", tasks: ["Beta kayıt formu"] },
          ],
          background: "Arka plan",
          camera: "Kamera",
          shapes: ["Daire", "Kare"],
          fillers: "Dolgu sözcükleri",
          remove: "Kaldır",
          transcript: {
            before: "Bağlantıyı paylaşmak için",
            fillers: ["ıı,", "dur,", "pardon,"],
            after: "buraya tıklayın.",
          },
          saved: "Kaydedildi · aynı bağlantı",
        },
      },
      embed: {
        feature: {
          title: "Videonuzu paylaşın veya gömün",
          cta: "Uzantıyı yükleyin",
          body: "Bağlantıyı Slack'e, GitHub'a, Notion'a veya bir e-postaya yapıştırın; önizlemesi görünür. Oynatıcıyı belgelerinize veya sitenize de gömebilirsiniz. Uzantı yüklüyken video, GitHub issue'larının ve pull request'lerinin içinde oynatılır.",
        },
        scene: {
          question:
            "Ekibimi çalışma alanına nasıl davet edeceğimi gösterebilir misiniz?",
          reply: "Tabii! İşte adımların kısa bir anlatımı:",
          url: "captureflow.dev/r/8kx2pnq4",
          app: "Ayarlar",
          nav: ["Genel", "Üyeler", "Faturalandırma"],
          members: "Üyeler",
          invite: "Davet et",
          people: [
            { initials: "AR", name: "Alex Rivera", role: "Sahip" },
            { initials: "CK", name: "Chris Kim", role: "Üye" },
            { initials: "JB", name: "Jordan Bell", role: "Üye" },
          ],
          duration: "0:48",
        },
      },
      feedback: {
        feature: {
          title: "Videolarınız üzerinde birlikte çalışın",
          cta: "Giriş yapın",
          body: "Toplantı yapmadan, farklı saat dilimlerinde birlikte çalışın. Ekibiniz emojilerle tepki verebilir, videonun herhangi bir anına yorum yapabilir, transkript ve altyazılarla takip edebilir.",
        },
        scene: {
          title: "Lansman planı anlatımı",
          author: "Alex",
          age: "az önce",
          duration: "1:12",
          activity: "Etkinlik",
          events: [
            { initials: "CK", name: "Chris", at: "0:09", emoji: "👍" },
            { initials: "JB", name: "Jordan", at: "0:17", emoji: "🔥" },
            {
              initials: "MC",
              name: "Maya",
              at: "0:27",
              text: "Yeni pano görünümüne bayıldım",
            },
            { initials: "SL", name: "Sam", at: "0:37", emoji: "❤️" },
            {
              initials: "JB",
              name: "Jordan",
              at: "0:48",
              text: "Bunu cuma yayınlayabilir miyiz?",
            },
            {
              initials: "AR",
              name: "Alex",
              at: "0:56",
              text: "Evet, QA'dan hemen sonra ✅",
            },
            { initials: "MC", name: "Maya", at: "1:05", emoji: "👏" },
          ],
        },
      },
      workspaces: {
        feature: {
          title: "Ekibinizi bir çalışma alanına davet edin",
          cta: "Çalışma alanı oluşturun",
          body: "Herkesin kayıtları tek bir çalışma alanında tutulur. Her video herkese açık, çalışma alanına görünür veya özel olabilir.",
        },
        scene: {
          team: "CaptureFlow ekibi",
          members: ["1 üye", "2 üye", "3 üye"],
          memberInitials: ["AR", "CK", "JB"],
          invitePlaceholder: "E-postayla davet edin",
          inviteEmail: "chris@acme.co, jordan@acme.co",
          invite: "Davet et",
          invited: "Gönderildi",
          joined: "Chris ve Jordan katıldı 🎉",
          whoCanWatch: "Kimler izleyebilir:",
          visibility: [
            { label: "Herkese açık", detail: "Bağlantıya sahip herkes" },
            { label: "Çalışma alanı", detail: "Yalnızca ekibiniz" },
            { label: "Özel", detail: "Yalnızca siz" },
          ],
        },
      },
    },
  },
  setupService: {
    title: "Sizin için",
    titleHighlight: "biz kuralım",
    subtitle:
      "Bize şirketinizi anlatın. Uygulamayı, Chrome uzantısını, macOS uygulamasını ve arkasındaki tüm altyapıyı ekibinizin kullanımına hazır şekilde kurarız.",
    includedHeading: "Kurduğumuz her şey",
    included: {
      infra: {
        title: "Uygulama, sizin altyapınızda",
        body: "Kendi Cloudflare hesabınıza dağıtılır ve alan adınızdan sunulur. Tamamı sizindir.",
      },
      storage: {
        title: "Depolama ve veritabanı",
        body: "Kayıtlar kendi R2 bucket'ınızda; çalışma alanları ve yorumlar kendi veritabanınızda.",
      },
      signin: {
        title: "Yalnızca şirkete özel giriş",
        body: "Şirketinizin e-posta alan adıyla sınırlı Google Workspace veya GitHub girişi.",
      },
      apps: {
        title: "Chrome uzantısı ve Mac uygulaması",
        body: "İkisi de sizin kurulumunuz için derlenir; uzantı ekibinize özel olarak yayınlanır.",
      },
      ready: {
        title: "Kayda hazır",
        body: "Çalışma alanları oluşturulur ve ekibiniz davet edilir; herkes hemen paylaşmaya başlayabilir.",
      },
      handover: {
        title: "Devir teslim",
        body: "Bakımını kim üstlenecekse ona nasıl çalıştırılıp güncelleneceğini adım adım gösteririz.",
      },
    },
    nextHeading: "Bize ulaşın",
    nextSubheading: "Neye ihtiyacınız olduğunu söyleyin, size dönüş yapalım.",
    form: {
      company: "Şirket",
      companyPlaceholder: "Acme A.Ş.",
      name: "Adınız",
      namePlaceholder: "Jane Doe",
      email: "İş e-postası",
      emailPlaceholder: "jane@acme.com",
      topic: "Size nasıl yardımcı olabiliriz?",
      topics: [
        "Kendiniz barındırma kurulumu",
        "1 TB'tan fazlası",
        "Başka bir şey",
      ],
      teamSize: "Ekip büyüklüğü",
      teamSizes: ["1–10", "11–50", "51–200", "200+"],
      cloudflare: "Cloudflare hesabınız var mı?",
      cloudflareOptions: ["Evet", "Hayır", "Emin değilim"],
      notes: "Bilmemiz gereken başka bir şey var mı?",
      notesPlaceholder: "Ekip büyüklüğünüz, alan adınız, takviminiz…",
      submit: "Mesajı gönderin",
      error:
        "Talebiniz gönderilemedi. Lütfen tekrar deneyin veya {email} adresine e-posta gönderin.",
      sentTitle: "Mesaj gönderildi",
      sentBody: "Teşekkürler. Size {email} adresine yanıt vereceğiz.",
      back: "Ana sayfaya dönün",
    },
  },
  swarmDemo: {
    title: "Bir ajan sürüsü yeniden kuruyor:",
    titleHighlight: "istediğiniz her web sitesini",
    subtitle:
      "Bir web sitesi adresi yazın. Bir ajan imleci sürüsü onu müzik eşliğinde öğe öğe yeniden çizer ve paylaşabileceğiniz bir video bağlantısı alırsınız.",
    url: "Web sitesi adresi",
    urlPlaceholder: "https://example.com",
    generate: "Demo oluşturun",
    generating: "Bulut tarayıcı başlatılıyor…",
    check: "Siteyi kontrol et",
    checking: "Site kontrol ediliyor…",
    previewNote:
      "Ajanların yeniden kuracağı sayfa bu. Doğru görünüyorsa demoyu oluştur.",
    change: "Adresi değiştir",
    note: "Ücretsiz oluşturmak için giriş yapın. Her demo kitaplığınıza eklenir.",
    noteSignedIn: "Ücretsiz oluşturun. Her demo kitaplığınıza eklenir.",
    howHeading: "Nasıl çalışır",
    how: {
      type: {
        title: "Bir adres yazın",
        body: "Herkese açık herhangi bir web sitesi. Sayfa bir bulut tarayıcıda yüklenir ve her başlık, resim, düğme ve kart bulunur.",
      },
      build: {
        title: "Ajanlar yeniden kurar",
        body: "İstek bir sohbet kutusuna yazılır, ardından bir imleç sürüsü müzik hızlanırken her öğeyi yerine koyar.",
      },
      share: {
        title: "Bağlantıyı alın",
        body: "Video biter bitmez kitaplığınızda açılır. Bağlantıyı paylaşın, dosyayı indirin veya yayınlayın.",
      },
    },
    errors: {
      invalidUrl: "example.com gibi bir web sitesi adresi girin.",
      unreachable: "Bu siteye ulaşılamadı. Adresi kontrol edip tekrar dene.",
      unavailable: "Bu sunucuda demo kullanılamıyor.",
      running:
        "Kayıtlarınızdan biri hâlâ sürüyor. Bitmesini bekleyip yeniden deneyin.",
      limit:
        "Bu çalışma alanı bu ayki bulut ajan dakikalarını kullandı. Ayın 1'inde yenilenir.",
      recordings:
        "Ücretsiz planın kayıt sınırına ulaştınız. Bir kaydı silin veya planı yükseltin, sonra tekrar deneyin.",
      busy: "Tüm bulut tarayıcılar şu anda meşgul. Birkaç dakika sonra yeniden deneyin.",
      failed: "Demo başlatılamadı. Lütfen yeniden deneyin.",
    },
  },
  enterprise: {
    title: "Şirketiniz için",
    titleHighlight: "CaptureFlow",
    subtitle:
      "Herkes için lisansı, bir kez kararlaştırılan koşullarla ve tek faturayla isteyen şirketlere yönelik yönetilen plan.",
    includedHeading: "Kurumsal planın ekledikleri",
    included: {
      storage: {
        title: "Size göre boyutlandırılmış depolama",
        body: "Kişi başına kota değil, şirketinizin ne kadar kayıt yaptığına göre boyutlandırılmış bir havuz.",
      },
      seats: {
        title: "Herkes için lisans",
        body: "Kaç kişi kayıt yaparsa yapsın, tek bir sözleşme tüm şirketi kapsar.",
      },
      roadmap: {
        title: "Önce sizin istekleriniz",
        body: "Ekibinizin istediği özellikler listemizin başına geçer.",
      },
      managed: {
        title: "Tamamen yönetilen",
        body: "Biz barındırır ve güncellemeleri yayınlarız; sizin çalıştırmanız gereken bir şey kalmaz.",
      },
      billing: {
        title: "Yıllık faturalandırma",
        body: "Şirketiniz için kararlaştırılan fiyatla yılda bir kez ödeyin.",
      },
      support: {
        title: "Bize doğrudan ulaşın",
        body: "Sorularınız doğrudan CaptureFlow'u geliştiren kişilere gider.",
      },
    },
    everythingHeading: "Ekibinizin sahip olacağı her şey",
    comingSoon: "Yakında",
    everything: {
      extension: {
        title: "Chrome uzantısı",
        body: "Herhangi bir sekmeyi veya ekranı kaydedin; durdurduğunuzda bağlantı hazır olur.",
      },
      mac: {
        title: "Mac uygulaması",
        body: "Aynı anında paylaşım bağlantılarını sunan, macOS için yerel bir kaydedici.",
      },
      workspaces: {
        title: "Ekip çalışma alanları",
        body: "Herkesin kayıtları tek bir yerde, paylaşılmış veya özel.",
      },
      feedback: {
        title: "Yorumlar ve tepkiler",
        body: "İzleyenler tam kastettikleri anda, doğrudan zaman çizelgesi üzerinde yanıt verir.",
      },
      edit: {
        title: "Paylaştıktan sonra düzenleme",
        body: "Arka planı, kamerayı veya sesi değiştirin; bağlantı aynı kalır.",
      },
      screenshots: {
        title: "Açıklamalı ekran görüntüleri",
        body: "Ekran görüntüsünü oklar, metin ve bulanıklaştırmayla işaretleyin ve bağlantı olarak paylaşın.",
      },
    },
    formHeading: "Bize ulaşın",
    formSubheading: "Bize ekibinizi anlatın, e-postayla yanıt verelim.",
    form: {
      company: "Şirket",
      companyPlaceholder: "Acme A.Ş.",
      name: "Adınız",
      namePlaceholder: "Jane Doe",
      email: "İş e-postası",
      emailPlaceholder: "jane@acme.com",
      need: "Neye ihtiyacınız var?",
      needs: [
        "Büyük bir ekip için lisans",
        "Özel koşullar veya tek fatura",
        "Başka bir şey",
      ],
      teamSize: "Ekip büyüklüğü",
      teamSizes: ["1–10", "11–50", "51–200", "200+"],
      storage: "Ne kadar depolama?",
      storageOptions: ["1–5 TB", "5–20 TB", "20 TB+", "Emin değilim"],
      notes: "Bilmemiz gereken başka bir şey var mı?",
      notesPlaceholder:
        "Ekibinizin ne kadar kayıt yaptığı, takviminiz, faturalandırma ihtiyaçlarınız…",
      submit: "Mesajı gönderin",
      error:
        "Mesajınız gönderilemedi. Lütfen tekrar deneyin veya {email} adresine e-posta gönderin.",
      sentTitle: "Mesaj gönderildi",
      sentBody: "Teşekkürler. Size {email} adresine yanıt vereceğiz.",
      back: "Ana sayfaya dönün",
    },
  },
  pricing: {
    heading: "Fiyatlandırma",
    cta: "Tüm planları karşılaştırın",
    subheading:
      "Ücretsiz plan ilk kayıtlarınızı kapsar. Ücretli planlarda üye başına tek fiyat vardır.",
    controls: {
      shownIn:
        "Fiyatlar {currency} olarak gösterilir. Ödeme ABD doları olarak alınır.",
      teamSize: "Ekip büyüklüğü",
      members: "üye",
      title: "Faturalandırma",
      note: "Üye başına tek fiyat.",
      billing: "Fatura dönemi",
      monthly: "Aylık",
      annually: "Yıllık",
      save: "%{percent} tasarruf",
    },
    compare: {
      loomRow: "Loom {plan}",
      loomDetail: "{seats} kişi × kişi başı {perSeat}",
      caption: "Aylık fiyatlar.",
      captureflowRow: "CaptureFlow {ourPlan}",
      captureflowDetail: "{seats} üye × üye başı {ourPerSeat}",
      saveLabel: "Ekibinizin tasarrufu",
      saveValue: "yılda {savings}",
    },
    plans: {
      chargedInUsd: "ABD doları olarak tahsil edilir.",
      member: "üye",
      members: "üye",
      included: "Dahil",
      notIncluded: "Dahil değil",
      free: {
        name: "Ücretsiz",
        description: "Bağlantı olarak paylaştığınız ekran kayıtları.",
        cta: "Kaydolun",
      },
      light: {
        name: LIGHT,
        featuresHeading: "Ücretsiz plandaki her şey ve",
        features: [
          "Sınırsız kayıt",
          "Sınırsız kayıt süresi",
          `Ayda ${LIGHT_AGENT_MIN} dk bulut ajan kaydı, her biri en fazla 10 dk`,
        ],
        description: "Veri tasarrufu kalitesinde sınırsız kayıt.",
        period: "/ay",
        noteMonthly: "Üye başına, aylık faturalandırılır",
        noteAnnual:
          "Üye başına, yıllık faturalandırılır. {seats} {members} için yılda {yearly}",
        cta: "Ücretsiz deneyin",
      },
      pro: {
        badge: "Önerilen",
        name: PRO,
        featuresHeading: `${LIGHT} planındaki her şey ve`,
        features: [
          "Tam kalite, 1080p'ye kadar",
          "Yapay zeka ile bölümler, başlıklar ve dolgu sözcüğü temizleme",
          "Özel markalama",
          `Ayda ${PRO_AGENT_MIN} dk bulut ajan kaydı, ${PRO_VOICEOVER_MIN} dk yapay zeka seslendirmesiyle`,
          "İzleyici analizleri (yakında)",
          "Slack, Notion ve Zapier entegrasyonları (yakında)",
        ],
        description: "Tam kalite, yapay zeka ile temizleme ve kendi markanız.",
        period: "/ay",
        noteMonthly: "Üye başına, aylık faturalandırılır",
        noteAnnual:
          "Üye başına, yıllık faturalandırılır. {seats} {members} için yılda {yearly}",
        cta: "Ücretsiz deneyin",
      },
      rows: {
        recordings: {
          label: "Kişi başına kayıt",
          free: "En fazla {recordings}",
          light: "Sınırsız",
          pro: "Sınırsız",
        },
        length: {
          label: "Kayıt süresi",
          free: "Video başına {minutes} dk",
          light: "Sınırsız",
          pro: "Sınırsız",
        },
        quality: {
          label: "Video kalitesi",
          free: "Veri tasarrufu",
          light: "Veri tasarrufu",
          pro: "1080p'ye kadar",
        },
        transcripts: {
          label: "Transkriptler ve altyazılar",
          free: true,
          light: true,
          pro: true,
        },
        editing: {
          label: "Transkriptten düzenleme",
          free: true,
          light: true,
          pro: true,
        },
        chapters: {
          label: "Yapay zeka bölümleri ve başlıkları",
          free: false,
          light: false,
          pro: true,
        },
        filler: {
          label: "Dolgu sözcüğü temizleme",
          free: false,
          light: false,
          pro: true,
        },
        feedback: {
          label: "Yorumlar ve tepkiler",
          free: true,
          light: true,
          pro: true,
        },
        agents: {
          label: "Yerel ajan kayıtları",
          free: true,
          light: true,
          pro: true,
        },
        cloudAgents: {
          label: "Bulut ajan kayıtları",
          free: `Ayda ${FREE_AGENT_MIN} dk`,
          light: `Ayda ${LIGHT_AGENT_MIN} dk`,
          pro: `Ayda ${PRO_AGENT_MIN} dk`,
        },
        voiceover: {
          label: "Yerel yapay zeka seslendirmesi",
          free: true,
          light: true,
          pro: true,
        },
        cloudVoiceover: {
          label: "Bulut yapay zeka seslendirmesi",
          free: false,
          light: false,
          pro: `Ayda ${PRO_VOICEOVER_MIN} dk`,
        },
        branding: {
          label: "Özel markalama",
          free: false,
          light: false,
          pro: true,
        },
      },
    },
    table: {
      heading: "Plan plan tüm özellikler",
      subtitle: "Ücretsiz, Light ve Pro yan yana.",
      groups: [
        {
          title: "Kayıt",
          rows: [
            {
              label: "Üyeler",
              free: "Sınırsız",
              light: "Sınırsız",
              pro: "Sınırsız",
            },
            {
              label: "Kişi başına kayıt",
              free: "En fazla {recordings}",
              light: "Sınırsız",
              pro: "Sınırsız",
            },
            {
              label: "Kayıt süresi",
              free: "Video başına {minutes} dk",
              light: "Sınırsız",
              pro: "Sınırsız",
            },
            {
              label: "Video kalitesi",
              free: "Veri tasarrufu",
              light: "Veri tasarrufu",
              pro: "1080p'ye kadar",
            },
            {
              label: "Ekran görüntüleri",
              free: "Sınırsız",
              light: "Sınırsız",
              pro: "Sınırsız",
            },
            {
              label: "Kayıtların saklanması",
              free: "Görüntülenmeden 30 gün",
              light: "Siz silene kadar",
              pro: "Siz silene kadar",
            },
            {
              label: "Tam ekran, pencere veya sekme kaydı",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Kamera balonu ve kamera efektleri",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Mikrofon ve sistem sesi",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Akıcı imleç",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Chrome uzantısı ve Mac uygulaması",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "Yapay zeka",
          rows: [
            {
              label: "Transkriptler",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Altyazılar",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Özet bölümleri",
              free: false,
              light: false,
              pro: true,
            },
            {
              label: "Otomatik önerilen başlıklar",
              free: false,
              light: false,
              pro: true,
            },
            {
              label: "Videoyu transkriptinden düzenleme",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Dolgu sözcüğü temizleme",
              free: false,
              light: false,
              pro: true,
            },
          ],
        },
        {
          title: "Ajanlar",
          rows: [
            {
              label: "Bilgisayarınızda ajan kayıtları",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Bulutta hazırlanan ajan sunumları",
              free: `Kişi başına ayda ${FREE_AGENT_MIN} dk`,
              light: `Üye başına ayda ${LIGHT_AGENT_MIN} dk`,
              pro: `Üye başına ayda ${PRO_AGENT_MIN} dk`,
            },
            {
              label: "Ajan kayıtlarında slaytlar",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Bilgisayarınızda yapay zeka seslendirmesi",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Bulut sunumlarında yapay zekâ seslendirme",
              free: false,
              light: false,
              pro: `Üye başına ayda ${PRO_VOICEOVER_MIN} dk`,
            },
          ],
        },
        {
          title: "Düzenleme",
          rows: [
            {
              label: "Paylaştıktan sonra düzenleme, aynı bağlantı",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Arka planlar",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Kamera balonunu taşıma veya yeniden boyutlandırma",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Videonun bölümlerini kesme",
              free: true,
              light: true,
              pro: true,
            },
            {
              label:
                "Oklar, metin ve bulanıklaştırmayla açıklamalı ekran görüntüleri",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Sonsuz tuval",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "Paylaşım ve geri bildirim",
          rows: [
            {
              label: "Durdurduğunuzda hazır paylaşım bağlantısı",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Herkese açık, çalışma alanına özel veya özel bağlantılar",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Kısıtlı bağlantılarda erişim isteme",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Sohbet ve e-postada bağlantı önizlemeleri",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Oynatıcıyı her yere gömme",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "GitHub issue'ları ve pull request'leri içinde oynatma",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Zaman çizelgesinde yorumlar",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Emoji tepkileri",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Görüntülenme sayıları",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Orijinal dosyayı indirme",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "Çalışma alanı ve yönetim",
          rows: [
            {
              label: "Ekip çalışma alanı",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Sahip, üye ve izleyici rolleri",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Varsayılan görünürlük ve yükleme izinleri",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Kayıtlarda ve ekran görüntülerinde arama",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Özel markalama",
              free: false,
              light: false,
              pro: true,
            },
          ],
        },
        {
          title: "Barındırma ve destek",
          rows: [
            {
              label: "AGPL kapsamında açık kaynak",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Kendi Cloudflare hesabınızda kendiniz barındırma",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Yönetilen barındırma ve güncellemeler",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
      ],
    },
    includes: {
      heading: "Her planda bulunanlar",
      items: [
        "Kendi çalışma alanınız, dilediğinizi davet edin",
        "Kamera efektleri",
        "Yapay zeka transkriptleri ve altyazılar",
        "Videoyu transkriptinden düzenleme",
        "Herkese açık, çalışma alanına özel veya özel paylaşım bağlantıları",
        "Yorumlar ve emoji tepkileri",
        "Açıklamalı ekran görüntüleri",
        "Sonsuz tuval",
      ],
    },
    annual: {
      badgePro: "Yönetilen",
      badgeCycle: "Yıllık",
      title: "Yönetilen barındırma",
      subtitle: "Tamamen barındırılır, yıllık faturalandırılır.",
      period: "/ay",
      note: "Yılda {amount} faturalandırılır. İstediğiniz zaman iptal edin.",
      cta: "Başlayın",
    },
  },
  activity: {
    heading: "GitHub'daki son değişiklikler",
    subtitle:
      "Her değişiklik herkese açıktır. Bunlar GitHub'daki en son pull request'ler ve açık issue'lardır.",
    cta: "GitHub'da görüntüleyin",
    shippedHeading: "Son birleştirilenler",
    openHeading: "Açık issue'lar ve pull request'ler",
    emptyOpen: "Şu anda açık bir şey yok.",
    newIssue: "Hata bildirin veya özellik isteyin",
    viewAll: "Tümünü GitHub'da görün",
  },
  faq: {
    heading: "Sık Sorulan Sorular",
    subtitle:
      "Kayıt, fiyatlandırma, depolama ve kendiniz barındırma hakkında yanıtlar. Diğer her şey için belgeleri okuyun.",
    cta: "Belgeleri okuyun",
    waitlistLink: "Bekleme listesine katılın",
    items: [
      {
        question: "Nasıl kayıt yaparım?",
        answer:
          "İki yol vardır; aralarındaki fark kaydı kimin yaptığıdır.\n\nChrome uzantısıyla kaydı kendiniz yaparsınız. Ekranınızda tıklayarak ilerler, isterseniz kendi sesiniz ve kameranızla anlatırsınız. Hızlı güncellemeler, geri bildirimler veya sizin de içinde olmanız gereken her şey için kullanın.\n\nYapay zeka ajanıyla videoyu siz tarif edersiniz, ajan tıklayarak ilerler ve sizin yerinize kaydeder; siz de işinize devam edersiniz. Slayt ve yapay zeka seslendirmesi ekleyebilir. Ürün demoları, nasıl yapılır videoları ve hata raporları için kullanın.\n\nKendiniz kaydetmek için:\n1. Chrome Web Mağazası'ndan CaptureFlow uzantısını yükleyin.\n2. Tarayıcınızın araç çubuğundaki simgesine tıklayın ve giriş yapın.\n3. Simgeye tekrar tıklayın. This tab, Window veya Full screen seçeneğini seçin; isterseniz kameranızı ve mikrofonunuzu açın.\n4. Start Recording'e basın. Sayfadaki çubuktan kaydı duraklatabilir veya durdurabilirsiniz.\n5. Durdurma düğmesine basın. Herkesle paylaşabileceğiniz bir bağlantıyla birlikte kaydınızın sayfası açılır.\n\nAjana kaydettirmek için:\n1. CaptureFlow'u kullandığınız yapay zeka uygulamasına bağlayın. Ana sayfanın Ajanlar bölümünde Claude, ChatGPT, Claude Code, Codex ve Cursor için adımlar yer alır.\n2. Bir tarayıcı sekmesi açıldığında giriş yapın. Bunu yalnızca bir kez yaparsınız.\n3. Videoyu sade bir dille isteyin, örneğin: Web sitemize nasıl kaydolunacağını gösteren seslendirmeli bir demo kaydet.\n4. Ajan videoyu kaydeder ve herkesle paylaşabileceğiniz bir bağlantı verir.",
      },
      {
        question: "CaptureFlow'u kendim barındırabilir miyim?",
        answer:
          "Evet. CaptureFlow, AGPL kapsamında açık kaynaklıdır ve tüm arka uç Cloudflare üzerinde çalışır: uygulama ve API için Workers, kayıtlar için R2, geri kalan her şey için D1. Bir D1 veritabanı ve bir R2 bucket'ı oluşturun, migration'ları uygulayın, bir secret tanımlayın ve dağıtın. Ayrıca bir Deploy to Cloudflare düğmesi de var. Kılavuz docs.captureflow.dev adresinde.",
      },
      {
        question: "Yapay zeka ajanım benim yerime video kaydedebilir mi?",
        answer:
          "Evet. CaptureFlow'u tek satırla Claude Code, Codex veya Cursor'a ekleyin ya da Claude veya ChatGPT'de ekleyin, sonra sade bir dille bir video isteyin. Kendi bilgisayarınızda bir tarayıcıyı, ekranınızı veya bir uygulamayı kaydeder, isterseniz slayt ve seslendirme ekler ve paylaşmanız için bir bağlantı verir.\n\nYerel ajan kayıtları her plana dahildir. Bulut ajan kayıtları, planınıza göre değişen aylık bir kotayla gelir.",
      },
      {
        question: "Ücretli planların fiyatlandırması nasıl işler?",
        answer: `${LIGHT} ve ${PRO}, üye başına aylık tek fiyattır; yıllık faturalandırmada daha düşüktür. Üye, kayıt yapan kişidir; yani yalnızca kayıt yapan kişiler için ödersiniz.\n\nBiri katıldığında veya ayrıldığında, lisans sayısı bir sonraki faturada buna göre güncellenir.`,
      },
      {
        question: "Kayıtlarım ne kadar süre saklanır?",
        answer:
          "Ücretli planlarda, siz silene kadar. Ücretsiz planda bir kayıt, 30 gün boyunca hiç görüntülenmezse kaldırılır; böylece kullanılmayan hesaplar yer tutmaz. Kendiniz barındırıyorsanız kuralları siz belirlersiniz.",
      },
      {
        question: "Ücretsiz plan neleri içerir?",
        answer: `Kişi başına 25 kayıt hakkınız olur; her biri en fazla 5 dakika, veri tasarrufu kalitesinde, transkript ve altyazılarla birlikte. Kayıtlar 30 gün boyunca görüntülenmezse kaldırılır. Kaydolun, Chrome uzantısını yükleyin ve kayda başlayın.\n\n${LIGHT}, üye başına tek fiyatla sınırları kaldırır ve kayıtları siz silene kadar saklar.`,
      },
    ],
  },
  cta: {
    headline: "Kayda başlayın",
    subtitle:
      "Ücretsiz indirin. Kredi kartı gerekmez. Bir toplantı daha yapmak yerine kısa bir video mesajıyla anlatın.",
    button: "CaptureFlow'u ücretsiz deneyin",
  },
  footer: {
    tagline: "Anında paylaşım bağlantılarıyla açık kaynaklı ekran kaydı.",
    lights: "Işıklar",
    lightsOn: "Açık · ipi çekin",
    lightsOff: "Kapalı · ipi çekin",
    product: {
      title: "Ürün",
      features: "Özellikler",
      pricing: "Fiyatlandırma",
      compare: "Karşılaştırma",
      download: "İndirin",
      suggest: "Özellik önerin",
    },
    resources: {
      title: "Kaynaklar",
      docs: "Belgeler",
      selfHosting: "Kendiniz barındırma",
      blog: "Blog",
      releases: "Sürümler",
      faq: "SSS",
      security: "Güvenlik",
    },
    community: {
      title: "Topluluk",
    },
    legal: {
      title: "Yasal",
      privacy: "Gizlilik Politikası",
      terms: "Hizmet Koşulları",
      refund: "İade Politikası",
      license: "Lisans (AGPL-3.0)",
    },
    rights: "© {year} CaptureFlow. Tüm hakları saklıdır.",
    openSource: "AGPL-3.0 kapsamında açık kaynak",
  },
  pageShell: {
    logoAlt: "CaptureFlow",
    backToHome: "Ana sayfaya dönün",
  },
  waitlist: {
    errors: {
      joinFailed: "Bekleme listesine katılınamadı. Lütfen tekrar deneyin.",
      network: "Ağ hatası. Lütfen tekrar deneyin.",
    },
    success:
      "Listedesiniz. CaptureFlow hazır olduğunda size e-posta göndereceğim.",
    emailPlaceholder: "you@example.com",
    buttonLoading: "Katılınıyor…",
    buttonDefault: "Bekleme listesine katılın",
    earlyAccessPrompt: "Erken erişim ister misiniz?",
    earlyAccessLink: "Beta test kullanıcısı olun",
  },
  download: {
    heading: "CaptureFlow'u indirin",
    subtitle:
      "Chrome için kullanılabilir, macOS uygulaması yakında geliyor. Her kayıt için paylaşabileceğiniz bir bağlantı alırsınız.",
    button: "macOS için indirin",
    requires: "Apple Silicon üzerinde {version} veya sonrası gerekir.",
    requirements: "Apple Silicon üzerinde macOS 14 veya sonrası gerekir.",
    versionLabel: "Sürüm {version}",
    sizeLabel: "{size} MB DMG",
    notarized: "Apple tarafından imzalandı ve onaylandı",
  },
  downloadPage: {
    otherWays: "Diğer edinme yolları",
    buildTitle: "Kaynaktan derleyin",
    buildBody: "Depoyu klonlayın ve kaydediciyi pnpm ile yerelde çalıştırın.",
    releasesTitle: "Tüm sürümler",
    releasesBody:
      "Yayınlanan tüm derlemelere ve değişiklik günlüğüne GitHub'da göz atın.",
    cloud:
      "Bulutu mu tercih edersiniz? {link} ve kayıtları tarayıcınızda görüntüleyin.",
    cloudLink: "Hesap oluşturun",
  },
  blog: {
    title: "Blog",
    subtitle: "Ekran kaydı üzerine ipuçları, kılavuzlar ve güncellemeler.",
    readArticle: "Yazıyı okuyun",
    empty: "Henüz yazı yok. Yakında tekrar bakın.",
  },
};

export default messages;

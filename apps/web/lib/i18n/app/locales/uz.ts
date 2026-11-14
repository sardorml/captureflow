import type { AppMessages } from "../messages";

const messages: AppMessages = {
  common: {
    cancel: "Bekor qilish",
    save: "Saqlash",
    saving: "Saqlanmoqda…",
    delete: "Oʻchirish",
    deleting: "Oʻchirilmoqda…",
    remove: "Olib tashlash",
    close: "Yopish",
    back: "Orqaga",
    continue: "Davom etish",
    confirm: "Tasdiqlash",
    done: "Tayyor",
    edit: "Tahrirlash",
    copy: "Nusxalash",
    copied: "Nusxalandi",
    search: "Qidirish",
    loading: "Yuklanmoqda…",
    retry: "Qayta urinish",
    learnMore: "Batafsil",
    language: "Til",
    themeToLight: "Yorugʻ mavzuga oʻtish",
    themeToDark: "Qorongʻi mavzuga oʻtish",
    somethingWrong: "Xatolik yuz berdi. Qayta urinib koʻring.",
    pageFailed: "Bu sahifani yuklab bo'lmadi.",
    partFailed: "Bu qismni yuklab bo'lmadi.",
    failedBody:
      "Nimadir xato ketdi. Qaytadan urinib ko'ring yoki sahifani qayta yuklang.",
    reload: "Sahifani qayta yuklash",
  },
  auth: {
    signedInAs: "{email} sifatida kirgansiz.",
    errors: {
      generic: "Xatolik yuz berdi. Qayta urinib koʻring.",
      network: "Tarmoq xatosi. Qayta urinib koʻring.",
    },
    login: {
      metaTitle: "Kirish",
      signInTitle: "Xush kelibsiz",
      signInDescription: "Google, GitHub yoki e-pochtangiz orqali kiring",
      signUpTitle: "Hisob yarating",
      signUpDescription:
        "Google, GitHub yoki e-pochtangiz orqali roʻyxatdan oʻting",
      inviteTitle: "{workspace} safiga qoʻshiling",
      inviteDescription:
        "{inviter} sizni taklif qildi. Qabul qilish uchun {email} manzili bilan kiring yoki hisob yarating.",
      continueWith: "{provider} orqali davom etish",
      or: "Yoki",
      emailLabel: "E-pochta",
      emailPlaceholder: "you@example.com",
      emailInvalid: "Toʻgʻri e-pochta manzilini kiriting.",
      continueWithEmail: "E-pochta orqali davom etish",
      askForInvite: "Hisob kerakmi? Administratordan taklif soʻrang.",
      haveAccount: "Hisobingiz bormi? {action}",
      haveAccountAction: "Kirish",
      noAccount: "Hisobingiz yoʻqmi? {action}",
      noAccountAction: "Roʻyxatdan oʻtish",
      changeEmail: "Oʻzgartirish",
      nameLabel: "Ism",
      namePlaceholder: "Ismingiz",
      passwordLabel: "Parol",
      newPasswordPlaceholder: "Kamida 12 ta belgi",
      passwordTooShort: "Kamida 12 ta belgi kiriting.",
      passwordMissing: "Parolingizni kiriting.",
      signInSubmit: "Kirish",
      signUpSubmit: "Hisob yaratish",
      terms:
        "Davom etish orqali quyidagilarga rozilik bildirasiz: {terms} va {privacy}.",
      termsLink: "Foydalanish shartlari",
      privacyLink: "Maxfiylik siyosati",
    },
    verify: {
      title: "E-pochtangizni tekshiring",
      description:
        "{email} manziliga havola yubordik. Hisobingizni sozlashni yakunlash uchun uni oching.",
      resend: "Xatni qayta yuborish",
      resent: "Qayta yuborildi",
      resendFailed: "Xatni yuborib boʻlmadi. Qayta urinib koʻring.",
      wrongAddress: "Manzil notoʻgʻrimi? {action}",
      wrongAddressAction: "Boshqa e-pochtadan foydalanish",
    },
    oauthErrors: {
      unfinished: "Kirish yakunlanmadi. Qayta urinib koʻring.",
      inviteOnly:
        "Bu CaptureFlowga faqat taklif orqali kirish mumkin. Administratordan taklif soʻrang.",
      allowedDomains:
        "{domains} domenidagi manzil bilan roʻyxatdan oʻting yoki administratordan taklif soʻrang.",
      providerDomains:
        "{domains} domenidagi Google yoki GitHub hisobi bilan roʻyxatdan oʻting.",
      domainChoice: "{first} yoki {second}",
    },
    inviteFallbacks: {
      workspace: "CaptureFlow ish maydoni",
      inviter: "Jamoadoshingiz",
    },
    setPassword: {
      title: "Parol oʻrnating",
      description:
        "{email} uchun parol tanlang. Shundan soʻng hisobingizga kirasiz.",
      passwordLabel: "Yangi parol",
      passwordPlaceholder: "Kamida 12 ta belgi",
      submit: "Parolni saqlash",
      expiredTitle: "Bu havola endi ishlamaydi",
      expiredDescription:
        "U allaqachon ishlatilgan yoki muddati tugagan. Administratordan yangisini soʻrang.",
      goToSignIn: "Kirish sahifasiga oʻtish",
    },
    invite: {
      title: "Siz taklif qilindingiz",
      asViewer:
        "Sizni CaptureFlowdagi {workspace} safiga tomoshabin sifatida taklif qilishdi: u yerda ulashilgan hamma narsani koʻrishingiz va fikr qoldirishingiz mumkin.",
      asMember:
        "Sizni CaptureFlowdagi {workspace} safiga aʼzo sifatida taklif qilishdi: u yerda yozib olishingiz va jamoa bilan ulashishingiz mumkin.",
      accept: "Taklifni qabul qilish",
      databaseUnavailable: "Maʼlumotlar bazasi ishlamayapti",
      invalidTitle: "Taklif endi yaroqsiz",
      invalidBody:
        "Bu havolaning muddati tugagan yoki u allaqachon ishlatilgan. Ish maydoni egasidan yangi taklif yuborishni soʻrang.",
      wrongAccountTitle: "Notoʻgʻri hisob",
      wrongAccountBody:
        "Bu taklif {invited} manziliga yuborilgan, siz esa {current} sifatida kirgansiz. Qabul qilish uchun hisobdan chiqing va taklif yuborilgan manzil bilan kiring.",
      goToDashboard: "Boshqaruv paneliga oʻtish",
      signOut: "Chiqish",
    },
    handoff: {
      signingIn: "Hisobingizga kirilmoqda…",
      returning: "CaptureFlowga qaytilmoqda…",
      open: "CaptureFlowni ochish",
      hint: "Hech narsa boʻlmasa, yuqoridagi tugmani bosing. Kompyuter ilovasi qayta ochilgach, bu varaqni yopishingiz mumkin.",
      extensionDone:
        "{email} sifatida kirdingiz. Bu varaqni yopishingiz mumkin.",
      extensionUnreachable:
        "CaptureFlow kengaytmasiga ulanib boʻlmadi. U oʻrnatilganini tekshiring, soʻng qayta urinish uchun uning belgisini bosing.",
      extensionUnverified:
        "Kengaytmani tasdiqlab boʻlmadi. Uni qayta oʻrnatib, yana urinib koʻring.",
    },
  },
  shell: {
    record: {
      newRecording: "Yangi yozuv",
    },
    nav: {
      toggleSidebar: "Yon panelni ochish/yopish",
      dashboard: "Boshqaruv paneli",
      recordings: "Yozuvlar",
      screenshots: "Skrinshotlar",
      canvas: "Doska",
      workspaceGroup: "Ish maydoni",
      members: "Aʼzolar",
      settings: "Sozlamalar",
      personal: "Shaxsiy",
      workspace: "Ish maydoni",
      billing: "Toʻlovlar",
      admin: "Admin paneli",
    },
    upgradeCard: {
      title: "Ish maydoni tarifini oshiring",
      description:
        "Bepul tarifda har bir kishiga tejamkor sifatda {recordings} ta yozuv beriladi. Pullik tariflar cheklovlarni olib tashlaydi, narxi har bir aʼzoga {price} dan boshlanadi.",
      viewPlans: "Tariflarni koʻrish",
    },
    topBar: {
      upgrade: "Tarifni oshirish",
    },
    workspaceSwitcher: {
      switchWorkspace: "Ish maydonini almashtirish",
      summary: "other:Asosiy · {n} aʼzo",
      workspaces: "Ish maydonlari",
      owned: "Egasi sizsiz",
      joined: "Siz qoʻshilgansiz",
      newWorkspace: "Yangi ish maydoni",
      inviteMembers: "Aʼzolarni taklif qilish",
    },
    drawer: {
      open: "Ish maydoni menyusini ochish",
      title: "Ish maydoni menyusi",
    },
    search: {
      prompt: "Yozuv va skrinshotlaringizni qidiring",
      clear: "Qidiruvni tozalash",
      results: "Qidiruv natijalari",
      hint: "Yozuv va skrinshotlaringizni sarlavhasi boʻyicha qidiring.",
      noMatches: "Hech narsa topilmadi",
      kind: {
        recording: "yozuv",
        screenshot: "skrinshot",
      },
    },
    account: {
      menu: "Hisob menyusi",
      nav: {
        billing: "Toʻlovlar",
        devices: "Ulangan qurilmalar",
        settings: "Sozlamalar",
        support: "Yordam xizmatiga yozish",
      },
      freePlan: "Bepul",
      signOut: "Chiqish",
      signingOut: "Chiqilmoqda…",
    },
    theme: {
      label: "Mavzu",
      light: "Yorugʻ",
      dark: "Qorongʻi",
      system: "Tizim",
    },
    notifications: {
      title: "Bildirishnomalar",
      subtitle: "Takliflar va ish maydonlaringizdagi oʻzgarishlar.",
      bellUnread: "other:Bildirishnomalar, {n} tasi oʻqilmagan",
      viewAll: "Hammasini koʻrish",
      menuEmpty:
        "Yangi bildirishnoma yoʻq. Takliflar, yangi jamoadoshlar va rol oʻzgarishlari shu yerda chiqadi.",
      pageEmpty:
        "Yangi bildirishnoma yoʻq. Kimdir sizni taklif qilsa, ish maydoningizga qoʻshilsa yoki rolingizni oʻzgartirsa, shu yerda koʻrasiz.",
      accept: "Qabul qilish",
      decline: "Rad etish",
      unread: "Oʻqilmagan",
      someone: "Kimdir",
      message: {
        invited: {
          member:
            "{actor} sizni {workspace} ish maydoniga aʼzo sifatida taklif qildi",
          viewer:
            "{actor} sizni {workspace} ish maydoniga tomoshabin sifatida taklif qildi",
        },
        joined: {
          member: "{actor} {workspace} ish maydoniga aʼzo sifatida qoʻshildi",
          viewer:
            "{actor} {workspace} ish maydoniga tomoshabin sifatida qoʻshildi",
        },
        seatRequested: "{actor} {workspace} ish maydonida pullik oʻrin soʻradi",
        seatDenied:
          "{actor} {workspace} ish maydonidagi oʻrin soʻrovingizni rad etdi",
        roleChanged: {
          member: "{actor} sizni {workspace} ish maydonida aʼzo qildi",
          viewer: "{actor} sizni {workspace} ish maydonida tomoshabin qildi",
        },
        downgraded:
          "{actor} sizni {workspace} ish maydonida tomoshabinga oʻtkazdi",
        keepRecordingUntil:
          "{date} gacha yozib olishda davom etishingiz mumkin.",
        removed: "{actor} sizni {workspace} ish maydonidan olib tashladi",
      },
      acceptErrors: {
        failed: "Taklifni qabul qilib boʻlmadi",
        signedOut: "Qabul qilish uchun hisobga kiring",
        invalid: "Bu taklifning muddati tugagan yoki u qaytarib olingan",
        emailMismatch: "Bu taklif boshqa e-pochta manziliga yuborilgan",
        alreadyMember: "Siz allaqachon bu ish maydonidasiz",
      },
    },
    mobileNav: {
      open: "Menyuni ochish",
      close: "Menyuni yopish",
      docs: "Hujjatlar",
      star: "GitHubda yulduzcha qoʻying",
      signIn: "Kirish",
      getStarted: "Boshlash",
    },
    skeletons: {
      avatar: "Avatar",
      workspaceName: "Ish maydoni nomi",
      workspaceLogo: "Ish maydoni logotipi",
    },
  },
  library: {
    dashboard: {
      welcome: "Xush kelibsiz",
      welcomeName: "Xush kelibsiz, {name}",
      openCanvas: "Doskani ochish",
      newRecording: "Yangi yozuv",
      stats: {
        recordings: "Yozuvlar",
        plusScreenshots: "other:Yana {count} ta skrinshot",
        noScreenshots: "Hali skrinshot yoʻq",
        views: "Koʻrishlar",
        viewsAverage: "Har bir yozuvga oʻrtacha {count} ta",
        noViews: "Hali koʻrishlar yoʻq",
        recorded: "Yozib olingan",
        recordedAverage: "Har bir yozuv oʻrtacha {duration}",
        nothingRecorded: "Hali hech narsa yozib olinmagan",
        recordingsLeft: "Qolgan yozuvlar",
        leftOfAllowance: "{allowance} tadan {left} ta",
        freePlanLimit: "Bepul tarif, har biri {minutes} daqiqagacha",
      },
      recordedTime: {
        minutes: "{minutes} daq",
        hours: "{hours} soat",
        hoursMinutes: "{hours} soat {minutes} daq",
      },
      recent: {
        title: "Soʻnggi yozuvlar",
        all: "Barcha yozuvlar",
        empty: "Bu ish maydonida hali hech narsa ulashilmagan.",
        views: "other:{n} ta koʻrish",
        comments: "other:{n} ta fikr",
        reactions: "other:{n} ta reaksiya",
      },
      start: {
        title: "{product} bilan yozishni boshlang",
        surfacesLabel: "Qayerda yozib olish",
        surfaces: {
          extension: "Kengaytma",
          desktop: "Kompyuter ilovasi",
          canvas: "Doska",
        },
        extension: {
          description:
            "Asboblar panelidan istalgan varaq, oyna yoki butun ekranni yozib oling va istalgan kishiga ulashish mumkin boʻlgan havola oling.",
          record: "Hozir yozib olish",
          addToChrome: "Chromega qoʻshish",
        },
        desktop: {
          description:
            "Ekran va kamerangizni tizim ovozi bilan yozib oladigan Mac uchun maxsus ilova tez kunda chiqadi. Ungacha kengaytma istalgan varaq, oyna yoki butun ekranni yozib oladi.",
          download: "Mac uchun yuklab olish",
          comingSoon: "Tez kunda",
        },
        canvas: {
          description:
            "Koʻrsatadigan sahifa boʻlmaganda yozish paytida chizish uchun qalam, shakl va matnli boʻsh doska.",
        },
      },
    },
    recording: {
      pageTitle: "Yozuvlar",
      count: "other:{n} ta yozuv",
      untitled: "Sarlavhasiz yozuv",
      aiGenerated: "SI yaratgan",
      processing: "Qayta ishlanmoqda",
      noMatches: "Bu filtrlarga mos yozuv yoʻq.",
      empty:
        "Hali birorta yozuv havolasi yaratmagansiz. CaptureFlow kompyuter ilovasida yozib oling, yozuvlaringiz shu yerda chiqadi.",
      selectAll: "Barcha yozuvlarni tanlash",
      selected: "other:{n} ta yozuv tanlandi",
      open: "Yozuvni ochish",
      edit: "Yozuvni tahrirlash",
      share: "Yozuvni ulashish",
      delete: "Yozuvni oʻchirish",
      deleteTitle: "Bu yozuv oʻchirilsinmi?",
      deleteDescription:
        "Video va uning havolasi darhol ishlamay qoladi. Buni ortga qaytarib boʻlmaydi.",
      deleteSelectedTitle: "other:{n} ta yozuv oʻchirilsinmi?",
    },
    screenshot: {
      pageTitle: "Skrinshotlar",
      count: "other:{n} ta skrinshot",
      untitled: "Sarlavhasiz skrinshot",
      numbered: "Skrinshot {id}",
      noMatches: "Bu filtrlarga mos skrinshot yoʻq.",
      empty:
        "Hali skrinshot yoʻq. CaptureFlowni oching → «Screenshot» varagʻi → suratga olish uchun «Display», «Window» yoki «Area» variantini tanlang. Skrinshotingiz shu yerda avtomatik paydo boʻladi.",
      selectAll: "Barcha skrinshotlarni tanlash",
      selected: "other:{n} ta skrinshot tanlandi",
      open: "Skrinshotni ochish",
      edit: "Skrinshotni tahrirlash",
      share: "Skrinshotni ulashish",
      delete: "Skrinshotni oʻchirish",
      deleteTitle: "Bu skrinshot oʻchirilsinmi?",
      deleteDescription:
        "Rasm va uning havolasi darhol ishlamay qoladi. Buni ortga qaytarib boʻlmaydi.",
      deleteSelectedTitle: "other:{n} ta skrinshot oʻchirilsinmi?",
    },
    filters: {
      access: "Ruxsat",
      sort: "Saralash",
      current: "{label}: {value}",
      accessOptions: {
        all: "Istalgan ruxsat",
        public: "Ommaviy",
        workspace: "Ish maydoni",
        private: "Shaxsiy",
      },
      sortOptions: {
        newest: "Yangidan eskiga",
        oldest: "Eskidan yangiga",
        views: "Eng koʻp koʻrilgan",
      },
    },
    card: {
      select: "Tanlash: {title}",
      moreActions: "Boshqa amallar",
      rename: "Qayta nomlash",
      unknownAuthor: "Nomaʼlum",
    },
    selection: {
      deleteDescription: "Ularning havolalari darhol ishlamay qoladi.",
      deleteFailed:
        "{count} tadan {failed} tasini oʻchirib boʻlmadi. Qolganlari oʻchirildi.",
      clear: "Tozalash",
    },
    pager: {
      label: "Sahifalar",
      previous: "Oldingi sahifa",
      next: "Keyingi sahifa",
    },
    visibility: {
      label: "Koʻrinish",
      labels: {
        public: "Ommaviy",
        workspace: "Ish maydoni",
        private: "Shaxsiy",
      },
      descriptions: {
        public: "Havolasi bor har kim koʻra oladi",
        workspace: "Faqat hisobga kirgan ish maydoni aʼzolari koʻra oladi",
        private: "Faqat siz koʻra olasiz",
      },
      workspaceNamed: "Ish maydoni · {name}",
    },
    share: {
      title: "Ulashish",
      embed: "Sahifaga joylash",
      embedPublic: "Kod qayerga qoʻyilsa, oʻsha yerda ijro etiladi.",
      embedRestricted: "Faqat havolani ocha oladigan kishilarda ijro etiladi.",
      copyCode: "Kodni nusxalash",
      generalAccess: "Umumiy ruxsat",
      generalAccessCurrent: "Umumiy ruxsat: {access}",
      copyLink: "Havolani nusxalash",
      linkCopied: "Havola nusxalandi",
      shareAt: "{time} lahzasidan ulashish",
      socialHeading: "Ulashish",
      socialText: "“{title}” ni ko‘ring",
      email: "Email",
    },
    editableTitle: {
      label: "Yozuv sarlavhasi",
      rename: "Yozuvni qayta nomlash",
    },
  },
  members: {
    title: "Aʼzolar",
    databaseUnavailable: "Maʼlumotlar bazasi ishlamayapti.",
    role: "Rol",
    status: "Holat",
    roles: {
      owner: "Administrator",
      member: "Aʼzo",
      viewer: "Tomoshabin",
    },
    roleHints: {
      member: {
        does: "Bu ish maydonida yozib oladi.",
        costs: "Light va Pro tariflarida pullik oʻrin.",
      },
      viewer: {
        does: "Koʻradi va fikr qoldiradi.",
        costs: "Har doim bepul.",
      },
    },
    statuses: {
      active: "Faol",
      invited: "Taklif qilingan",
    },
    seatSummary: {
      members: "other:{n} aʼzo",
      viewers: "other:{n} tomoshabin",
      paidSeats: "other:{n} ta pullik oʻrin",
      membersAndViewers: "{members} va {viewers}",
      onPaidSeats:
        "{people}, {seats}. Har bir aʼzo bitta oʻrin egallaydi; tomoshabinlar bepul.",
      membersFree: "{people}. Bu tarifda aʼzolar bepul.",
      freePlan:
        "{people}. Bepul tarif: har bir aʼzoga {minutes} daqiqagacha boʻlgan {recordings} ta yozuv beriladi; tomoshabinlar koʻradi va fikr qoldiradi.",
      planTitle: "{plan} tarifi",
      paidPlanTitle: "Pullik tarif",
      freePlanTitle: "Bepul tarif",
      upgrade: "Ish maydoni tarifini oshirish",
    },
    table: {
      intro:
        "Aʼzolar bu yerda yozib oladi; tomoshabinlar koʻradi va fikr qoldiradi.",
      ownerIntro:
        "Ega sifatida siz taklif qilishingiz, olib tashlashingiz va rollarni oʻzgartirishingiz mumkin.",
      searchPlaceholder: "Ism yoki e-pochta manzili",
      searchLabel: "Aʼzolarni qidirish",
      allRoles: "Barcha rollar",
      everyone: "Hamma",
      columns: {
        name: "Ism",
        dateAdded: "Qoʻshilgan sana",
        email: "E-pochta manzili",
        actions: "Amallar",
      },
      empty: "Bu filtrlarga hech kim mos kelmaydi.",
      downgradeNote: "{date} dan tomoshabin · {keep}",
      keepAsMember: "Aʼzo sifatida qoldirish",
      revoke: "Qaytarib olish",
    },
    seatRequests: {
      title: "Oʻrin soʻrovlari",
      description:
        "Bu tomoshabinlar yozib olishga ruxsat soʻradi. Tasdiqlasangiz, ular aʼzoga aylanadi.",
      descriptionPaid:
        "Bu tomoshabinlar yozib olishga ruxsat soʻradi. Tasdiqlasangiz, ular aʼzoga aylanadi va pullik oʻrin qoʻshiladi.",
      asked: "{email} · soʻralgan: {date}",
      deny: "Rad etish",
      approve: "Tasdiqlash",
    },
    seatConfirm: {
      addTitle: "{name} uchun pullik oʻrin qoʻshilsinmi?",
      addBody:
        "Aʼzolar yozib oladi, shuning uchun har biri pullik oʻrin hisoblanadi. {plan} tarifingizdagi oʻrinlar soni {seats} tadan {nextSeats} taga, narxi esa oyiga {before} dan {after} ga oʻzgaradi.",
      addBodyYearly:
        "Aʼzolar yozib oladi, shuning uchun har biri pullik oʻrin hisoblanadi. {plan} tarifingizdagi oʻrinlar soni {seats} tadan {nextSeats} taga, narxi esa yillik toʻlovda oyiga {before} dan {after} ga oʻzgaradi.",
      addInvoice:
        "Joriy toʻlov davrining qolgan qismi keyingi hisob-fakturangizga qoʻshiladi.",
      addConfirm: "Pullik oʻrin qoʻshish",
      removeTitle: "{name} tomoshabinga oʻtkazilsinmi?",
      removeBody:
        "{name} siz toʻlagan davr oxirigacha, yaʼni {date} gacha yozib olishda davom etadi. Keyin u tomoshabinga aylanadi: koʻra oladi va fikr qoldira oladi, lekin yozib ololmaydi.",
      removePlan:
        "Shundan soʻng {plan} tarifingizdagi oʻrinlar soni {seats} tadan {nextSeats} taga, narxi esa oyiga {before} dan {after} ga oʻzgaradi.",
      removePlanYearly:
        "Shundan soʻng {plan} tarifingizdagi oʻrinlar soni {seats} tadan {nextSeats} taga, narxi esa yillik toʻlovda oyiga {before} dan {after} ga oʻzgaradi.",
      removeConfirm: "Tomoshabinga oʻtkazish",
    },
    remove: {
      label: "Ish maydonidan olib tashlash: {name}",
      title: "{name} {workspace} ish maydonidan olib tashlansinmi?",
      body: "U darhol kira olmay qoladi. Uning yozuv va skrinshotlari ish maydonida qoladi.",
      freesSeat:
        "Bunda uning pullik oʻrni boʻshaydi: tarifingizdagi oʻrinlar soni {seats} tadan {nextSeats} taga oʻzgaradi.",
    },
    leave: {
      button: "Tark etish",
      title: "{workspace} ish maydonini tark etasizmi?",
      body: "Uning yozuv va skrinshotlariga kira olmay qolasiz. U yerda yozib olganlaringiz ish maydonida qoladi.",
      comeBack: "Qaytish uchun kimdir sizni yana taklif qilishi kerak.",
      confirm: "Ish maydonini tark etish",
    },
    invite: {
      trigger: "Aʼzolarni taklif qilish",
      title: "{workspace} ish maydoniga aʼzolarni taklif qilish",
      titleOwnWorkspace: "Ish maydoningizga aʼzolarni taklif qilish",
      description:
        "Ularga 7 kun amal qiladigan havolali xat boradi. Ular aynan shu manzil bilan kirishi kerak.",
      removeEmail: "Olib tashlash: {email}",
      addEmails: "E-pochta manzillarini qoʻshing",
      separatorHint: "Manzillarni probel, vergul yoki Enter bilan ajrating.",
      paidSeatNote:
        "Taklifni qabul qilgan har bir aʼzo {plan} tarifingizga pullik oʻrin qoʻshadi, har biri oyiga {price}. Joriy davrning qolgan qismi keyingi hisob-fakturangizga qoʻshiladi.",
      noEmails: "Kamida bitta e-pochta manzilini qoʻshing",
      invalidEmails: "Notoʻgʻri e-pochta manzili: {emails}",
      failed: "Yuborilmadi",
      sent: "other:{n} ta taklif yuborildi.",
      sending: "Yuborilmoqda…",
      submit: "Takliflarni yuborish",
    },
    actions: {
      emailRequired: "E-pochta manzilini kiriting",
      emailInvalid: "Bu toʻgʻri e-pochta manziliga oʻxshamaydi",
      ownWorkspace: "Siz allaqachon oʻz ish maydoningizdasiz",
      alreadyMember: "Bu kishi allaqachon ushbu ish maydoni aʼzosi",
      emailNotSent:
        "Taklif yaratildi, lekin xat yetkazilmadi. Havolani kutilayotganlar roʻyxatidan nusxalang.",
      invitationSent: "Taklif {email} manziliga yuborildi",
      alreadyRecording: "Siz bu yerda allaqachon yozib olishingiz mumkin",
    },
  },
  settings: {
    saved: "Saqlandi",
    errors: {
      ownerOnly: "Buni faqat ish maydoni egasi oʻzgartira oladi",
      databaseUnavailable: "Maʼlumotlar bazasi ishlamayapti",
      saveFailed: "Saqlab boʻlmadi — qayta urinib koʻring",
    },
    upload: {
      uploading: "Yuklanmoqda…",
      missing: "Rasm faylini tanlang",
      failed: "Yuklab boʻlmadi",
      failedReason: "Yuklab boʻlmadi: {reason}",
    },
    personal: {
      title: "Shaxsiy sozlamalar",
      account: {
        title: "Hisob",
        description:
          "Jamoadoshlaringiz va yozuvlaringizni koʻradiganlar sizni qanday koʻrishi.",
      },
      preferences: {
        title: "Moslamalar",
        description:
          "CaptureFlow sizga qanday koʻrinishi va qaysi tilda boʻlishi.",
      },
      languageDescription: "CaptureFlow sizga koʻrsatiladigan til.",
    },
    avatar: {
      label: "Avatar",
      change: "Avatarni almashtirish",
      removing: "Olib tashlanmoqda…",
      hint: "JPG, PNG, WebP yoki GIF. Koʻpi bilan 2 MB.",
      tooLarge: "Avatar 2 MB dan oshmasligi kerak",
      badType: "Avatar PNG, JPEG, WebP yoki GIF formatida boʻlishi kerak",
    },
    account: {
      name: {
        label: "Toʻliq ism",
        placeholder: "Ismingiz",
        description:
          "Yozuvlar, skrinshotlar va faollik qatorlarida koʻrsatiladi.",
        required: "Ism kiritilishi shart.",
        updateFailed: "Ismni yangilab boʻlmadi.",
      },
      email: {
        label: "E-pochta manzili",
        description:
          "Kirish uchun ishlatiladi. Oʻzgartirish uchun yordam xizmatiga yozing.",
      },
      userId: {
        label: "Foydalanuvchi ID",
        copy: "Foydalanuvchi IDsini nusxalash",
        description: "Yordam xizmatiga yozganda shuni koʻrsating.",
      },
      saveChanges: "Oʻzgarishlarni saqlash",
    },
    workspace: {
      title: "Ish maydoni sozlamalari",
      tabs: {
        label: "Sozlamalar boʻlimlari",
        general: "Umumiy",
        security: "Xavfsizlik",
      },
      general: {
        title: "Umumiy",
        description:
          "Ish maydonlari roʻyxatida, aʼzolar sahifasida va havolalarning oldindan koʻrinishida ushbu ish maydonini bildiradigan nom va logotip.",
      },
      name: {
        title: "Ish maydoni nomi",
        description: "Ish maydoningiz uchun koʻrsatiladigan nom.",
        empty: "Ish maydoni nomi boʻsh boʻlishi mumkin emas",
        tooLong: "Ish maydoni nomi juda uzun (koʻpi bilan {max} ta belgi)",
      },
      logo: {
        title: "Ish maydoni logotipi",
        description:
          "Ish maydoni nomi yonida koʻrsatiladi. PNG, JPEG, WebP, GIF yoki SVG, koʻpi bilan 2 MB.",
        upload: "Logotip yuklash",
        replace: "Logotipni almashtirish",
        tooLarge: "Logotip 2 MB dan oshmasligi kerak",
        badType:
          "Logotip PNG, JPEG, WebP, GIF yoki SVG formatida boʻlishi kerak",
      },
      permissions: {
        title: "Standart ruxsatlar",
        description:
          "Ish maydonidagi har bir yangi yozuv va skrinshotga qoʻllanadigan sozlamalar.",
      },
      recordingAccess: {
        title: "Yozib olish ruxsati",
        description:
          "Jamoadoshlar bu ish maydoniga yozuv va skrinshot joylay olishini belgilang.",
        allow: {
          title: "Jamoadoshlarga bu yerga joylashga ruxsat berish",
          body: "Aʼzolar bu ish maydonida yozib olishi mumkin.",
        },
        ownerOnly: {
          title: "Faqat ish maydoni egasi",
          body: "Jamoadoshlar yuklagan fayllar ularning shaxsiy ish maydoniga tushadi.",
        },
      },
    },
    devices: {
      title: "Ulangan qurilmalar",
      count: "other:{n} ta qurilmada kirilgan",
      empty:
        "Ulangan qurilma yoʻq. Bu hisobni ulash uchun CaptureFlow kompyuter ilovasini oching va yozish panelidagi «Sign in» tugmasini bosing.",
      unlabelled: "Nomsiz qurilma",
      added: "Qoʻshilgan: {date}",
      addedLastUsed:
        "Qoʻshilgan: {date} · oxirgi marta ishlatilgan: {lastUsed}",
      neverUsed: "Hech qachon ishlatilmagan",
      revoke: {
        action: "Uzish",
        title: "Bu qurilma hisobdan chiqarilsinmi?",
        description:
          "Yozuvlarni boshqarish uchun unda qayta kirish kerak boʻladi.",
      },
    },
  },
  billing: {
    chargedInUsd: "AQSH dollarida undiriladi.",
    shownIn:
      "Narxlar {currency}da koʻrsatilgan. Toʻlov AQSH dollarida olinadi.",
    page: {
      title: "Toʻlovlar",
      subtitle: "Tarifingiz va undan qancha foydalanganingiz.",
      workspaceLabel: "Ish maydoni · {name}",
      manageSubscription: "Obunani boshqarish",
      upgradeWorkspace: "Ish maydoni tarifini oshirish",
      storage: "Ish maydonining saqlash hajmi",
      usedOfLimit: "{limit} dan {used}",
      usedNoLimit: "{used} — cheklovsiz",
    },
    loading: {
      plan: "Tarif",
      usage: "Foydalanish",
    },
    counts: {
      members: "other:{n} aʼzo",
      paidSeats: "other:{n} ta pullik oʻrin",
      freeViewers: "other:{n} bepul tomoshabin",
    },
    plan: {
      free: "Bepul",
      paid: "Pullik",
      billedMonthly: "Oylik toʻlov",
      billedYearly: "Yillik toʻlov",
      freeSummary:
        "{members} · har bir kishiga {recordings} tagacha yozuv, har biri {minutes} daqiqa, tejamkor sifat",
    },
    status: {
      onTrial: "Sinov",
      active: "Faol",
      paused: "Toʻxtatilgan",
      pastDue: "Toʻlov oʻtmadi",
      unpaid: "Toʻlanmagan",
      cancelled: "Bekor qilingan",
      expired: "Muddati tugagan",
    },
    details: {
      youPay: "Toʻlaysiz",
      amountPerMonth: "Oyiga {amount}",
      amountPerYear: "Yiliga {amount}",
      seatsMonthly: "other:{n} ta oʻrin × oyiga {price}",
      seatsYearly:
        "other:{n} ta oʻrin × oyiga {price}, yillik toʻlovda oyiga {total}",
      nextPayment: "Keyingi toʻlov",
      ends: "Tugaydi",
      endOfPeriod: "Joriy davr oxirida",
      amountOnDate: "{date} kuni {amount}",
      firstPaymentPending: "Birinchi toʻlov oʻtgach",
      estimate: "{base} · {change}, taxminan",
      baseForSeats: "other:{n} ta oʻrin uchun {amount}",
      seatsAdded: "other:shu davrda qoʻshilgan {n} ta oʻrin uchun {amount}",
      seatsRemoved:
        "other:shu davrda olib tashlangan {n} ta oʻrin uchun {amount} qaytarim",
      seatChanges: "shu davrdagi oʻrin oʻzgarishlari uchun {amount}",
      seats: "Oʻrinlar",
      seatsAndViewers: "{seats}, {viewers}",
      billedTo: "Toʻlovchi",
      paymentMethod: "Toʻlov usuli",
      cardEnding: "{brand}, oxiri {last4}",
      card: "Karta",
      updateCard: "Yangilash",
    },
    switchPlan: {
      switchTo: "{plan} tarifiga oʻtish",
      title: "{plan} tarifiga oʻtasizmi?",
      priceMonthly:
        "other:{n} ta oʻrningiz narxi oyiga {before} dan {after} ga oʻzgaradi.",
      priceYearly:
        "other:{n} ta oʻrningiz narxi yillik toʻlovda oyiga {before} dan {after} ga oʻzgaradi.",
      benefits:
        "{plan} tarifi 60 fps gacha har qanday sifatda yozib oladi va SI yordamida tahrirlashni qoʻshadi.",
      timing:
        "U hozirdan boshlanadi. Joriy toʻlov davrining qolgan qismi uchun farq keyingi hisob-fakturangizga qoʻshiladi.",
      errors: {
        failed: "Tarifni oʻzgartirib boʻlmadi",
        unknownPlan: "Nomaʼlum tarif",
        billingUnavailable: "Toʻlov tizimi ishlamayapti",
        noSubscription: "Bu ish maydonida faol obuna yoʻq",
        cancelled: "Tarifni oʻzgartirishdan oldin obunani tiklang",
        unavailable: "Hozir tarifni oʻzgartirib boʻlmaydi",
        rejected:
          "Toʻlov tizimi oʻzgarishni qabul qilmadi. Qayta urinib koʻring.",
      },
    },
    upgrade: {
      title: "{name} tarifini oshirish",
      billingCycle: "Toʻlov davri",
      cycles: {
        monthly: "Oylik",
        annual: "Yillik",
      },
      annualSaving: "{percent}% tejang",
      seatPicker: {
        title: "Kimga pullik oʻrin beriladi",
        selected: "{total} tadan {seats} ta",
        description:
          "Belgilangan kishilar yozib oladi va ular uchun toʻlov olinadi. Qolganlar bepul tomoshabin boʻladi: koʻra oladi, fikr qoldira oladi va reaksiya bildira oladi, lekin yozib ololmaydi. Rollar tarifni oshirganingizda oʻzgaradi.",
        selectAll: "Hammasini tanlash",
        clear: "Tozalash",
        you: "(siz)",
        paidSeat: "Pullik oʻrin",
        viewer: "Tomoshabin",
      },
      perMonth: "oyiga",
      seatsPrice: "other:{n} ta oʻrin × {price}",
      viewersFree: "other:{n} tomoshabin bepul",
      priceWithViewers: "{seats}, {viewers}",
      priceYearly: "{seats}, yillik toʻlov",
      priceWithViewersYearly: "{seats}, {viewers}, yillik toʻlov",
      upgradeTo: "{plan} tarifiga oʻtish",
      checkoutUnavailable: "Toʻlov sahifasi sozlanmagan",
    },
    requestSeat: {
      request: "Yozib olishga ruxsat soʻrash",
      requested: "Oʻrin soʻraldi",
      hint: "Siz bu yerda tomoshabinsiz. Yozib olish uchun egadan pullik oʻrin soʻrang.",
      requestedHint:
        "Egaga soʻrov yuborildi. U tasdiqlagach, yozib olishingiz mumkin boʻladi.",
      failed: "Soʻrovni yuborib boʻlmadi",
    },
  },
  actions: {
    missingSlug: "Slug koʻrsatilmagan",
    recordingNotFound: "Yozuv topilmadi",
    backgroundMissing: "Yuklash uchun rasm tanlang",
    backgroundTooLarge: "Rasm hajmi 5 MB dan oshmasligi kerak",
    backgroundBadType: "PNG, JPEG yoki WebP rasmidan foydalaning",
    backgroundFailed: "Rasmni yuklab bo‘lmadi. Qayta urinib ko‘ring.",
    invalidVisibility: "Koʻrinish qiymati notoʻgʻri",
    deleteVideoFailed: "Video faylni oʻchirib boʻlmadi: {reason}",
    transcriptNotFound: "Transkript topilmadi",
    transcriptEmpty:
      "Transkriptni boʻsh qoldirib boʻlmaydi. Buning oʻrniga tahrirlarni bekor qiling.",
    missingTokenId: "Token ID koʻrsatilmagan",
    tokenNotFound: "Token topilmadi",
    missingScreenshotId: "Skrinshot ID koʻrsatilmagan",
    screenshotNotFound: "Skrinshot topilmadi",
    missingImageBytes: "Rasm maʼlumotlari yoʻq",
    screenshotTooLarge:
      "Tahrirlangan skrinshot bitta skrinshot uchun hajm chegarasidan oshib ketdi.",
    saveScreenshotFailed: "Skrinshotni saqlab boʻlmadi: {reason}",
    saveFailed: "Saqlab boʻlmadi: {reason}",
    invalidCanvasDimensions: "Saqlab boʻlmadi: kanvas oʻlchamlari notoʻgʻri",
  },
  viewer: {
    meta: {
      defaultTitle: "{product} yozuvi",
      defaultDescription: "{product} orqali ulashilgan ekran yozuvi.",
      preparingTitle: "Yozuv tayyorlanmoqda… — {product}",
      notFoundTitle: "Topilmadi",
      description:
        "{product} orqali ulashilgan ekran yozuvi. Brauzeringizda tomosha qiling, roʻyxatdan oʻtish shart emas.",
      descriptionTimed:
        "{product} orqali ulashilgan {duration} davomiylikdagi ekran yozuvi. Brauzeringizda tomosha qiling, roʻyxatdan oʻtish shart emas.",
    },
    loading: "Yozuv yuklanmoqda…",
    nav: {
      download: "Yuklab olish",
    },
    authPrompt: {
      pricing: "Narxlar",
      logIn: "Kirish",
      getStarted: "Boshlash",
      getFree: "{product}ni bepul oling",
    },
    postedBy: {
      label: "Joylagan",
      someone: "Kimdir",
    },
    views: {
      count: "other:{count} ta koʻrish",
      showWhoWatched: "{views}, kimlar koʻrganini koʻrsatish",
      viewers: "Tomoshabinlar",
      emptyTitle: "Hali koʻrishlar yoʻq",
      emptyDescription:
        "Havolani ulashing, koʻrgan kishilar shu yerda chiqadi.",
      signedInViewer: "Hisobga kirgan tomoshabin",
      anonymous: "Anonim",
    },
    actions: {
      share: "Ulashish",
      visibilityFailed: "Koʻrinishni yangilab boʻlmadi",
      deleteFailed: "Yozuvni oʻchirib boʻlmadi",
    },
    requestAccess: {
      title: "Bu videoni koʻrish uchun ruxsat soʻrang",
      notSharedBy: "{name} bu yozuvni siz bilan hali ulashmagan.",
      notSharedByOwner: "Egasi bu yozuvni siz bilan hali ulashmagan.",
      signInHint:
        "Ish e-pochtangiz bilan kiring — agar allaqachon egasining jamoasida boʻlsangiz, darhol kiritilasiz.",
      signIn: "Davom etish uchun kiring",
      sentTitle: "Soʻrov yuborildi",
      sentDescription:
        "Egasiga xabar berdik. U ruxsat bersa, sizga xat keladi.",
      askingAs: "{email} nomidan soʻralmoqda",
      noteLabel: "Izoh qoʻshing {optional}",
      noteOptional: "(ixtiyoriy)",
      notePlaceholder:
        "Salom, kechagi muhokamadagi shu yozuvni koʻrmoqchi edim.",
      sending: "Yuborilmoqda…",
      submit: "Ruxsat soʻrash",
      failed: "Xatolik yuz berdi. Birozdan soʻng qayta urinib koʻring.",
    },
    pending: {
      preparingTitle: "Yozuvingiz tayyorlanmoqda…",
      preparingDescription:
        "Yuklash hali tugamadi. Tayyor boʻlgach, bu sahifa oʻzi yangilanadi.",
      generatingTitle: "Videongiz tayyorlanmoqda…",
      generatingDescription:
        "Bu bir necha daqiqa olishi mumkin, bir piyola qahva yoki gazak oling ☕️🍪 Tayyor bo‘lgach, sahifa o‘zi yangilanadi.",
      failedTitle: "Bu yozuv oxirigacha yuklanmadi",
      failedDescription:
        "Havola yaratildi, lekin video yetib kelmadi. Bir daqiqadan soʻng havolani qayta ochib koʻring yoki yangisini yozib oling.",
      comment: "Fikr",
    },
    upgradeBanner: {
      message:
        "Bepul tarifda {usage}. Toʻliq sifatdagi cheksiz yozuvlar uchun tarifni oshiring.",
      usage: "other:{n} ta yozuvdan {used} tasi ishlatildi",
    },
    editPanel: {
      editTitle: "Videoni tahrirlash",
      editDescription:
        "Muharrirda qisqartiring, kesing, koʻrinishini oʻzgartiring va transkriptni tuzating.",
      downloadTitle: "Videoni yuklab olish",
      downloadDescription:
        "Tahrirlaringiz bilan MP4: fon, kamera va kesilgan joylar.",
      downloadRendering: "Tayyorlanmoqda: {percent}%. Bu varaqni yopmang.",
      downloadCancel: "Bekor qilish",
      downloadFailed:
        "Videoni tayyorlab bo‘lmadi. Uning o‘rniga asl faylni yuklab oling.",
      downloadUnsupported:
        "Bu brauzer videoni tayyorlay olmaydi. Uning o‘rniga asl faylni yuklab oling.",
      originalTitle: "Asl faylni yuklab olish",
      originalDescription: "Yozuv tahrirsiz, yozib olinganidek.",
      captionsTitle: "Subtitrlarni yuklab olish",
      captionsDescription:
        "Video bilan birga yuklanadigan SRT fayl, masalan X uchun.",
      copyEmbed: "Joylash kodini nusxalash",
      embedCopied: "Joylash kodi nusxalandi",
      embedDescription: "Pleyerni istalgan veb-sahifaga joylang.",
    },
    notFound: {
      title: "Yozuv topilmadi",
      description:
        "Bu havolaning muddati tugagan yoki u hech qachon mavjud boʻlmagan. Bepul hisoblardagi yozuvlar oxirgi marta koʻrilgandan boshlab 30 kun saqlanadi.",
      madeWith: "{product} bilan yaratilgan",
    },
  },
  activity: {
    sidebar: {
      label: "Yozuvning yon paneli",
      activityTab: "Faollik",
      transcriptTab: "Transkript",
      toolsTab: "Amallar",
    },
    you: "Siz",
    anonymous: "Anonim",
    jumpToMoment: "Shu lahzaga oʻtish",
    empty: {
      title: "Hali faollik yoʻq",
      description:
        "Tomoshabinlarning reaksiya va fikrlari paydo boʻlishi bilan shu yerda chiqadi.",
      firstTitle: "Birinchi boʻlib fikr qoldiring",
      firstTitleNamed: "{name}, birinchi boʻlib fikr qoldiring",
      hint: "Javob berish uchun {key} tugmasini bosing yoki shu panel pastida fikr qoldiring.",
      focusComposer: "Fikr maydoniga oʻtish",
    },
    composer: {
      signIn: "Reaksiya va fikr qoldirish uchun kiring",
      placeholder: "Fikr qoldiring…",
      mention: "Kimnidir belgilash",
      noOneToMention: "Hali hech kim reaksiya yoki fikr qoldirmagan",
      insertEmoji: "Emoji qoʻyish",
      searchEmoji: "Emoji qidirish",
      posting: "Yuborilmoqda…",
      submitAt: "{time} lahzasiga fikr qoldirish",
      postFailed: "Fikrni yuborib boʻlmadi",
    },
    comment: {
      delete: "Fikrni oʻchirish",
      deleteTitle: "Bu izoh o‘chirilsinmi?",
      deleteDescription:
        "U hamma uchun o‘chiriladi. Buni ortga qaytarib bo‘lmaydi.",
      deleteFailed: "Fikrni oʻchirib boʻlmadi",
    },
    reaction: {
      count: "other:{n} ta reaksiya",
      delete: "Reaksiyani oʻchirish",
      deleteMany: "other:{n} ta reaksiyani oʻchirish",
      deleteFailed: "Reaksiyani oʻchirib boʻlmadi",
    },
    transcript: {
      pendingTitle: "Transkript tayyorlanmoqda…",
      pendingDescription: "Transkript tayyor boʻlishi bilan shu yerda chiqadi.",
      failedTitle: "Transkript oxirigacha tayyorlanmadi",
      failedDescription:
        "Bu yozuv transkriptini tayyorlashda xatolik yuz berdi.",
      noneTitle: "Transkript yoʻq",
      noneOwnerDescription:
        "Mikrofonni yoqib yozib oling, transkript siz uchun yozib beriladi.",
      noneViewerDescription: "Bu yozuv mikrofonsiz yozib olingan.",
      searchLabel: "Transkriptdan qidirish",
      noMatches: "Hech narsa topilmadi.",
    },
    saveFailed: "Saqlab boʻlmadi. Qayta urinib koʻring.",
    summary: {
      title: "Qisqacha mazmun",
      add: "Qoʻshish",
      placeholder: "Bu yozuvda nima boʻladi?",
      empty: "Hali qisqacha mazmun yoʻq.",
      emptyAction: "Qisqacha mazmun qoʻshish",
    },
    chapters: {
      title: "Boʻlimlar",
      count: "other:{n} ta boʻlim",
      addAtPlayhead: "Joriy lahzaga qoʻshish",
      defaultTitle: "{n}-boʻlim",
      editHint:
        "Har bir satrga bitta boʻlim, {short} yoki {long} koʻrinishida.",
      editHintShort: "M:SS Sarlavha",
      editHintLong: "H:MM:SS Sarlavha",
      editPlaceholder: "0:00 Kirish\n0:30 Namoyish\n1:20 Yakun",
      playing: "Ijro etilmoqda",
      remove: "Boʻlimni olib tashlash",
      empty: "Hali boʻlimlar yoʻq.",
      emptyAction: "Joriy lahzaga boʻlim qoʻshish",
    },
  },
  player: {
    overlay: {
      watchAgain: "Qayta koʻrish",
    },
    captions: {
      track: "Subtitrlar",
      size: "Oʻlcham",
      position: "Joylashuv",
      sizes: {
        small: "Kichik",
        medium: "Oʻrtacha",
        large: "Katta",
      },
      positions: {
        top: "Yuqorida",
        bottom: "Pastda",
      },
    },
    reactionBar: {
      comment: "Fikr",
      leaveComment: "Fikr qoldirish",
    },
    reactions: {
      heart: "Yurak",
      thumbsUp: "Layk",
      fire: "Olov",
      clap: "Qarsak",
      raisedHands: "Koʻtarilgan qoʻllar",
      eyes: "Koʻzlar",
    },
    embed: {
      title: "{product} yozuvi",
    },
    controls: {
      buttons: {
        play: "Ijro etish",
        pause: "Pauza",
        replay: "Qayta ijro etish",
        mute: "Ovozni oʻchirish",
        unmute: "Ovozni yoqish",
      },
      seek: {
        forward: "{seconds} soniya oldinga oʻtkazish",
        backward: "{seconds} soniya orqaga oʻtkazish",
      },
      fullscreen: {
        enter: "Toʻliq ekranga oʻtish",
        exit: "Toʻliq ekrandan chiqish",
      },
      captions: {
        enable: "Subtitrlarni yoqish",
        disable: "Subtitrlarni oʻchirish",
      },
      pip: {
        enter: "Tasvir ichida tasvir rejimiga oʻtish",
        exit: "Tasvir ichida tasvir rejimidan chiqish",
      },
      cast: {
        start: "Translatsiyani boshlash",
        stop: "Translatsiyani toʻxtatish",
        connecting: "Ulanmoqda",
      },
      airplay: {
        start: "AirPlayni boshlash",
        stop: "AirPlayni toʻxtatish",
      },
      slider: {
        seek: "Oʻtkazish",
      },
      time: {
        current: "Joriy vaqt",
        duration: "Davomiylik",
        position: "{duration} dan {current}",
        unknown: "Media yuklanmagan, vaqt nomaʼlum.",
      },
      playback: {
        rate: "Ijro tezligi {rate}",
      },
      volume: {
        mutedValue: "{percent}, ovoz oʻchirilgan",
        muted: "Ovoz oʻchirilgan",
        label: "Ovoz balandligi",
        value: "Ovoz balandligi {value}",
      },
      status: {
        captionsOn: "Subtitrlar yoqilgan",
        captionsOff: "Subtitrlar oʻchirilgan",
        paused: "Pauzada",
        playing: "Ijro etilmoqda",
        fullscreen: "Toʻliq ekran",
        pip: "Tasvir ichida tasvir",
        exitPip: "Tasvir ichida tasvir rejimidan chiqish",
        seekedTo: "{time} ga oʻtkazildi",
      },
      container: {
        label: "Media pleyer",
      },
      errors: {
        aborted: "Media ijrosini tugashidan oldin toʻxtatdingiz.",
        network:
          "Tarmoq yoki serverdagi muammo sababli bu mediani yuklab boʻlmadi.",
        decode:
          "Bu mediani ijro etib boʻlmadi. U shikastlangan boʻlishi yoki brauzeringiz uning formatini qoʻllab-quvvatlamasligi mumkin.",
        source:
          "Bu mediani yuklab boʻlmadi. U mavjud boʻlmasligi yoki brauzeringiz uning formatini qoʻllab-quvvatlamasligi mumkin.",
        encrypted:
          "Bu mediani ijro etib boʻlmadi, chunki uning shifrini ochib boʻlmadi.",
        unplayable: "Pleyer bu mediani qoʻllab-quvvatlamaydi.",
        title: "Xatolik yuz berdi.",
        unexpected: "Kutilmagan xatolik yuz berdi.",
      },
      common: {
        ok: "OK",
      },
      menu: {
        settings: "Sozlamalar",
        quality: "Sifat",
        audio: "Audio",
        speed: "Tezlik",
        captions: "Subtitrlar",
        playbackRate: "Ijro tezligi",
        off: "Oʻchiq",
        auto: "Avto",
        autoWithLabel: "Avto ({label})",
      },
    },
  },
  screenshotView: {
    page: {
      defaultTitle: "{product} skrinshoti",
      description: "{product} orqali ulashilgan skrinshot.",
      madeWith: "{product} bilan yaratilgan",
      loading: "Skrinshot yuklanmoqda…",
    },
    authPrompt: {
      pricing: "Narxlar",
      logIn: "Kirish",
      getStarted: "Boshlash",
      getFree: "{product}ni bepul oling",
    },
    actions: {
      edit: "Skrinshotni tahrirlash",
      share: "Ulashish",
      shareTitle: "Skrinshotni ulashish",
      copyLink: "Havolani nusxalash",
      linkCopied: "Havola nusxalandi",
      more: "Boshqa amallar",
      delete: "Skrinshotni oʻchirish",
      deleteTitle: "Bu skrinshot oʻchirilsinmi?",
      deleteDescription:
        "Rasm va uning havolasi darhol ishlamay qoladi. Buni ortga qaytarib boʻlmaydi.",
      visibilityFailed: "Koʻrinishni yangilab boʻlmadi",
      deleteFailed: "Skrinshotni oʻchirib boʻlmadi",
    },
    zoom: {
      expand: "Rasmni kattalashtirish",
      minimize: "Rasmni kichraytirish",
    },
    requestAccess: {
      title: "Bu skrinshotni koʻrish uchun ruxsat soʻrang",
      notSharedBy: "{name} bu skrinshotni siz bilan hali ulashmagan.",
      notSharedByOwner: "Egasi bu skrinshotni siz bilan hali ulashmagan.",
      signInHint:
        "Ish e-pochtangiz bilan kiring — agar allaqachon egasining jamoasida boʻlsangiz, darhol kiritilasiz.",
      signIn: "Davom etish uchun kiring",
      sentTitle: "Soʻrov yuborildi",
      sentDescription:
        "Egasiga xabar berdik. U ruxsat bersa, sizga xat keladi.",
      askingAs: "{email} nomidan soʻralmoqda",
      noteLabel: "Izoh qoʻshing {optional}",
      noteOptional: "(ixtiyoriy)",
      notePlaceholder:
        "Salom, dizayn muhokamasidagi shu skrinshotning nusxasini olmoqchi edim.",
      sending: "Yuborilmoqda…",
      submit: "Ruxsat soʻrash",
      failed: "Xatolik yuz berdi. Birozdan soʻng qayta urinib koʻring.",
    },
    notFound: {
      title: "Skrinshot topilmadi",
      description:
        "Bu havolaning muddati tugagan yoki u hech qachon mavjud boʻlmagan. Bepul hisoblardagi skrinshotlar oxirgi marta koʻrilgandan boshlab 30 kun saqlanadi.",
    },
  },
  recordingEditor: {
    skeleton: {
      label: "Muharrir ochilmoqda",
      status: "Muharrir ochilmoqda…",
    },
    preparing: {
      title: "Yozuv tayyorlanmoqda…",
      description:
        "Yozuv hali yuklanmoqda. Tayyor boʻlgach, bu sahifa avtomatik yangilanadi.",
    },
    failed: {
      title: "Yozuvni yuklab boʻlmadi.",
      description: "Kompyuter ilovasidan qayta yozib koʻring.",
    },
    saveFailed: "Saqlab boʻlmadi",
    topBar: {
      back: "Yozuvga qaytish",
      status: {
        idle: "Tahrirlar avtomatik saqlanadi",
        saved: "Saqlandi",
        error: "Saqlab boʻlmadi",
      },
      versionHistory: "Versiyalar tarixi (tez kunda)",
      undo: "Ortga qaytarish",
      undoShortcut: "Ortga qaytarish ({key})",
      redo: "Qayta bajarish",
      redoShortcut: "Qayta bajarish ({key})",
      finish: "Yakunlash",
    },
    panels: {
      label: "Muharrir panellari",
      tabs: {
        transcript: "Transkript",
        design: "Dizayn",
        camera: "Kamera",
        audio: "Ovoz",
        details: "Tafsilotlar",
      },
      hide: {
        transcript: "Transkriptni yashirish",
        design: "Dizaynni yashirish",
        camera: "Kamerani yashirish",
        audio: "Ovozni yashirish",
        details: "Tafsilotlarni yashirish",
      },
      show: {
        transcript: "Transkriptni koʻrsatish",
        design: "Dizaynni koʻrsatish",
        camera: "Kamerani ko‘rsatish",
        audio: "Ovozni ko‘rsatish",
        details: "Tafsilotlarni koʻrsatish",
      },
    },
    toggleOn: "Yoniq",
    background: {
      title: "Fon",
      gradients: "Gradientlar",
      none: "Yoʻq",
      noBackground: "Fonsiz",
      upload: "Rasm yuklash",
      uploading: "Yuklanmoqda…",
      uploadedImage: "Sizning rasmingiz",
      solid: "Yaxlit rang",
      solidColor: "Yaxlit rang {color}",
      customColor: "Maxsus rang tanlash",
      colors: "Ranglar",
      wallpaper: "{group}: fon rasmi {n}",
      wallpaperGroups: {
        general: "Umumiy",
        cities: "Shaharlar",
        blue: "Ko‘k",
        purple: "Binafsha",
        orange: "To‘q sariq",
        dark: "Qorong‘i",
      },
      presets: {
        violet: "Binafsha",
        sunset: "Shafaq",
        orchid: "Orxideya",
        forest: "Oʻrmon",
        flamingo: "Flamingo",
        citrus: "Sitrus",
        arctic: "Arktika",
        ocean: "Okean",
        deep: "Chuqur",
        ember: "Choʻgʻ",
        mint: "Yalpiz",
        dusk: "Oqshom",
        peach: "Shaftoli",
        midnight: "Yarim tun",
        slate: "Kulrang",
      },
    },
    frame: {
      title: "Ramka",
      padding: "Chekka",
      corners: "Burchaklar",
      shadow: "Soya",
    },
    camera: {
      title: "Kamera",
      show: "Kamerani koʻrsatish",
      hidden: "Yashirilgan",
      position: "Joylashuv",
      positionHint: "Nuqtani suring yoki burchakni bosing",
      positionHintHidden: "Joylashtirish uchun kamerani koʻrsating.",
      corners: {
        topLeft: "Yuqori chap",
        topRight: "Yuqori oʻng",
        bottomLeft: "Pastki chap",
        bottomRight: "Pastki oʻng",
      },
      size: "Oʻlcham",
      sizes: {
        small: "Kichik",
        medium: "Oʻrtacha",
        large: "Katta",
      },
    },
    audio: {
      title: "Audio",
      systemSound: "Tizim ovozi",
      sound: "Ovoz",
      microphone: "Mikrofon",
      muted: "Ovozsiz",
      sharedTrack: "Bu yozuvda mikrofon va tizim ovozi bitta trekda.",
    },
    details: {
      title: "Yozuv",
      link: "Havola",
      size: "Hajm",
      duration: "Davomiylik",
      views: "Koʻrishlar",
      created: "Yaratilgan",
    },
    transcript: {
      transcribing: "Transkript tayyorlanmoqda…",
      unavailable: "Transkript mavjud emas",
      pendingHint:
        "Tahrirlash uchun bir daqiqadan soʻng bu sahifani qayta yuklang.",
      failedHint: "Bu yozuv uchun transkript oxirigacha tayyorlanmadi.",
      missingHint:
        "Mikrofonni yoqib yozib oling, transkript siz uchun yozib beriladi.",
      deleteWord: "Soʻzni oʻchirish",
      deleteWords: "other:{n} ta soʻzni oʻchirish",
      clearSelection: "Tanlovni tozalash",
      hint: "Tanlash uchun soʻzni bosing yoki soʻzlar ustidan suring, matnni tuzatish uchun ikki marta bosing.",
      resetEdits: "Tahrirlarni bekor qilish",
      editLine: "Transkript satrini tahrirlash",
      selectLine: "{time} dagi satrni tanlash",
      restore: "Tiklash",
      saveFailed: "Saqlab boʻlmadi",
      resetFailed: "Tahrirlarni bekor qilib boʻlmadi",
    },
    timeline: {
      hideWaveform: "Ovoz toʻlqinini yashirish",
      showWaveform: "Ovoz toʻlqinini koʻrsatish",
      loadingAudio: "Audio yuklanmoqda…",
      deleteSelection: "Tanlanganini oʻchirish",
      deleteSelectionHint:
        "Transkriptdan soʻzlarni tanlang yoki vaqt chizigʻini boʻlib, qismni tanlang",
      splitAt: "{time} lahzasida boʻlish",
      splitHint: "Avval kerakli lahzagacha ijro eting yoki suring",
      comingSoon: "Tez kunda",
      fit: "Sigʻdirish",
      zoomOut: "Kichraytirish",
      zoom: "Vaqt chizigʻi masshtabi",
      zoomIn: "Kattalashtirish",
      seek: "Oʻtkazish",
      trimStart: "Klip boshini qirqish",
      trimEnd: "Klip oxirini qirqish",
      removeSplit: "{time} dagi boʻlinishni olib tashlash",
    },
  },
  screenshotEditor: {
    loading: "Muharrir yuklanmoqda…",
    imageError: {
      decode: "Skrinshot rasmini dekodlab boʻlmadi.",
      fetch:
        "Skrinshot rasmini yuklab boʻlmadi. Bucket CORS ruxsatini yoʻqotgan boʻlishi mumkin.",
    },
    header: {
      back: "Skrinshotga qaytish",
      reset: "Tahrirlarni bekor qilish",
      undo: "Ortga qaytarish",
      undoTooltip: "Ortga qaytarish ({key})",
      redo: "Qayta bajarish",
      redoTooltip: "Qayta bajarish ({key})",
      finish: "Yakunlash",
    },
    saveError: {
      notMounted: "Muharrir yuklanmagan",
      noCanvas: "Eksport kanvasini olib boʻlmadi",
      workerCrashed: "PNG kodlash jarayoni ishdan chiqdi",
    },
    tools: {
      text: "Matn",
      rect: "Toʻrtburchak",
      arrow: "Strelka",
      background: "Fon",
    },
    background: {
      title: "Fon qoʻshish",
      close: "Fon tanlash oynasini yopish",
      none: "Yoʻq",
      gradients: {
        violet: "Binafsha",
        sunset: "Shafaq",
        orchid: "Orxideya",
        forest: "Oʻrmon",
        flamingo: "Flamingo",
        citrus: "Sitrus",
        arctic: "Arktika",
        ocean: "Okean",
        deep: "Chuqur",
      },
      solid: "Yaxlit rang {color}",
      custom: "Maxsus rang tanlash",
    },
    inspector: {
      color: "Rang {color}",
      size: "{n}px",
      duplicate: "Dublikat",
    },
    textPrompt: "Matn",
  },
  canvas: {
    meta: {
      title: "Doska",
      description: "Yozish paytida chizish uchun boʻsh doska.",
    },
    loading: "Doska yuklanmoqda…",
    tools: {
      select: "Tanlash",
      hand: "Qoʻl",
      pen: "Qalam",
      highlighter: "Marker",
      rect: "Toʻrtburchak",
      ellipse: "Ellips",
      arrow: "Strelka",
      line: "Chiziq",
      text: "Matn",
      eraser: "Oʻchirgʻich",
    },
    shortcut: "{label} · {key}",
    colour: "Rang {colour}",
    stroke: "Chiziq qalinligi {width}",
    hint: "Siljitish uchun aylantiring · masshtab uchun {mod} bilan aylantiring · sudrash uchun {space} tugmasini bosib turing",
    textPlaceholder: "Yozing…",
    history: {
      undo: "Ortga qaytarish",
      redo: "Qayta bajarish",
      clear: "Doskani tozalash",
    },
    zoom: {
      out: "Kichraytirish",
      reset: "Masshtabni tiklash",
      in: "Kattalashtirish",
    },
    extensionPrompt: {
      title: "Bu doskani yozib oling",
      description:
        "Chizish paytida ekran va kamerangizni yozib olish, soʻng havola ulashish uchun CaptureFlow kengaytmasini qoʻshing.",
      dismiss: "Hozir emas",
      install: "Chromega qoʻshish",
    },
  },
};

export default messages;

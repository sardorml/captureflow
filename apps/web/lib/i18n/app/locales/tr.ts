import type { AppMessages } from "../messages";

const messages: AppMessages = {
  common: {
    cancel: "İptal",
    save: "Kaydet",
    saving: "Kaydediliyor…",
    delete: "Sil",
    deleting: "Siliniyor…",
    remove: "Kaldır",
    close: "Kapat",
    back: "Geri",
    continue: "Devam et",
    confirm: "Onayla",
    done: "Bitti",
    edit: "Düzenle",
    copy: "Kopyala",
    copied: "Kopyalandı",
    search: "Ara",
    loading: "Yükleniyor…",
    retry: "Tekrar dene",
    learnMore: "Daha fazla bilgi",
    language: "Dil",
    themeToLight: "Açık temaya geç",
    themeToDark: "Koyu temaya geç",
    somethingWrong: "Bir sorun oluştu. Tekrar deneyin.",
    pageFailed: "Bu sayfa yüklenemedi.",
    partFailed: "Bu bölüm yüklenemedi.",
    failedBody:
      "Bir şeyler ters gitti. Tekrar deneyin veya sayfayı yeniden yükleyin.",
    reload: "Sayfayı yeniden yükle",
  },
  auth: {
    signedInAs: "{email} olarak giriş yapıldı.",
    errors: {
      generic: "Bir sorun oluştu. Lütfen tekrar deneyin.",
      network: "Ağ hatası. Lütfen tekrar deneyin.",
    },
    login: {
      metaTitle: "Giriş yap",
      signInTitle: "Tekrar hoş geldiniz",
      signInDescription: "Google, GitHub veya e-postanızla giriş yapın",
      signUpTitle: "Hesabınızı oluşturun",
      signUpDescription: "Google, GitHub veya e-postanızla kaydolun",
      inviteTitle: "{workspace} çalışma alanına katılın",
      inviteDescription:
        "{inviter} sizi davet etti. Kabul etmek için {email} adresiyle giriş yapın veya hesap oluşturun.",
      continueWith: "{provider} ile devam et",
      or: "Veya",
      emailLabel: "E-posta",
      emailPlaceholder: "you@example.com",
      emailInvalid: "Geçerli bir e-posta girin.",
      continueWithEmail: "E-posta ile devam et",
      askForInvite: "Hesaba mı ihtiyacınız var? Bir yöneticiden davet isteyin.",
      haveAccount: "Zaten hesabınız var mı? {action}",
      haveAccountAction: "Giriş yap",
      noAccount: "Hesabınız yok mu? {action}",
      noAccountAction: "Kaydol",
      changeEmail: "Değiştir",
      nameLabel: "Ad",
      namePlaceholder: "Adınız",
      passwordLabel: "Şifre",
      newPasswordPlaceholder: "En az 12 karakter",
      passwordTooShort: "En az 12 karakter kullanın.",
      passwordMissing: "Şifrenizi girin.",
      signInSubmit: "Giriş yap",
      signUpSubmit: "Hesap oluştur",
      terms:
        "Devam ederek {terms} ve {privacy} metinlerimizi kabul etmiş olursunuz.",
      termsLink: "Hizmet Koşulları",
      privacyLink: "Gizlilik Politikası",
    },
    verify: {
      title: "E-postanızı kontrol edin",
      description:
        "{email} adresine bir bağlantı gönderdik. Hesabınızın kurulumunu tamamlamak için bağlantıyı açın.",
      resend: "E-postayı tekrar gönder",
      resent: "Tekrar gönderildi",
      resendFailed: "E-posta gönderilemedi. Lütfen tekrar deneyin.",
      wrongAddress: "Adres yanlış mı? {action}",
      wrongAddressAction: "Farklı bir e-posta kullan",
    },
    oauthErrors: {
      unfinished: "Giriş tamamlanamadı. Lütfen tekrar deneyin.",
      inviteOnly:
        "Bu CaptureFlow'a yalnızca davetle katılabilirsiniz. Bir yöneticiden davet isteyin.",
      allowedDomains:
        "{domains} uzantılı bir adresle kaydolun ya da bir yöneticiden davet isteyin.",
      providerDomains:
        "{domains} uzantılı bir Google veya GitHub hesabıyla kaydolun.",
      domainChoice: "{first} veya {second}",
    },
    inviteFallbacks: {
      workspace: "Bir CaptureFlow",
      inviter: "Bir ekip arkadaşınız",
    },
    setPassword: {
      title: "Şifrenizi belirleyin",
      description:
        "{email} için bir şifre seçin. Ardından giriş yapmış olacaksınız.",
      passwordLabel: "Yeni şifre",
      passwordPlaceholder: "En az 12 karakter",
      submit: "Şifreyi kaydet",
      expiredTitle: "Bu bağlantı artık çalışmıyor",
      expiredDescription:
        "Bağlantı daha önce kullanılmış veya süresi dolmuş. Bir yöneticiden yenisini isteyin.",
      goToSignIn: "Giriş sayfasına git",
    },
    invite: {
      title: "Davet edildiniz",
      asViewer:
        "{workspace} çalışma alanına CaptureFlow'da izleyici olarak katılmaya davet edildiniz: orada paylaşılan her şeyi izleyebilir ve yorum yapabilirsiniz.",
      asMember:
        "{workspace} çalışma alanına CaptureFlow'da üye olarak katılmaya davet edildiniz: orada kayıt yapabilir ve ekiple paylaşabilirsiniz.",
      accept: "Daveti kabul et",
      databaseUnavailable: "Veritabanı kullanılamıyor",
      invalidTitle: "Davet artık geçerli değil",
      invalidBody:
        "Bu bağlantının süresi dolmuş veya bağlantı daha önce kullanılmış. Çalışma alanı sahibinden yeni bir davet göndermesini isteyin.",
      wrongAccountTitle: "Yanlış hesap",
      wrongAccountBody:
        "Bu davet {invited} adresine gönderildi, ancak siz {current} olarak giriş yaptınız. Kabul etmek için çıkış yapın ve davet edilen adresle giriş yapın.",
      goToDashboard: "Kontrol paneline git",
      signOut: "Çıkış yap",
    },
    handoff: {
      signingIn: "Giriş yapılıyor…",
      returning: "CaptureFlow'a dönülüyor…",
      open: "CaptureFlow'u aç",
      hint: "Hiçbir şey olmazsa yukarıdaki düğmeye tıklayın. Masaüstü uygulaması yeniden açıldığında bu sekmeyi kapatabilirsiniz.",
      extensionDone:
        "{email} olarak giriş yapıldı. Bu sekmeyi kapatabilirsiniz.",
      extensionUnreachable:
        "CaptureFlow uzantısına ulaşılamadı. Yüklü olduğundan emin olun, ardından tekrar denemek için simgesine tıklayın.",
      extensionUnverified:
        "Uzantı doğrulanamadı. Yeniden yükleyip tekrar deneyin.",
    },
  },
  shell: {
    record: {
      newRecording: "Yeni kayıt",
    },
    nav: {
      toggleSidebar: "Kenar çubuğunu aç/kapat",
      dashboard: "Kontrol paneli",
      recordings: "Kayıtlar",
      screenshots: "Ekran görüntüleri",
      canvas: "Tuval",
      workspaceGroup: "Çalışma alanı",
      members: "Üyeler",
      settings: "Ayarlar",
      personal: "Kişisel",
      workspace: "Çalışma alanı",
      billing: "Faturalandırma",
      admin: "Yönetim",
    },
    upgradeCard: {
      title: "Çalışma alanınızı yükseltin",
      description:
        "Ücretsiz plan, veri tasarrufu kalitesinde kişi başına {recordings} kayıt sunar. Ücretli planlar sınırları kaldırır; fiyatlar üye başına {price} tutarından başlar.",
      viewPlans: "Planları gör",
    },
    topBar: {
      upgrade: "Yükselt",
    },
    workspaceSwitcher: {
      switchWorkspace: "Çalışma alanı değiştir",
      summary: "one:Varsayılan · {n} üye|other:Varsayılan · {n} üye",
      workspaces: "Çalışma alanları",
      owned: "Sahibi sizsiniz",
      joined: "Katıldınız",
      newWorkspace: "Yeni çalışma alanı",
      inviteMembers: "Üye davet et",
    },
    drawer: {
      open: "Çalışma alanı menüsünü aç",
      title: "Çalışma alanı menüsü",
    },
    search: {
      prompt: "Kayıtlarınızda ve ekran görüntülerinizde arayın",
      clear: "Aramayı temizle",
      results: "Arama sonuçları",
      hint: "Kayıtlarınızı ve ekran görüntülerinizi başlığa göre arayın.",
      noMatches: "Eşleşme yok",
      kind: {
        recording: "kayıt",
        screenshot: "ekran görüntüsü",
      },
    },
    account: {
      menu: "Hesap menüsü",
      nav: {
        billing: "Faturalandırma",
        devices: "Bağlı cihazlar",
        settings: "Ayarlar",
        support: "Desteğe ulaş",
      },
      freePlan: "Ücretsiz",
      signOut: "Çıkış yap",
      signingOut: "Çıkış yapılıyor…",
    },
    theme: {
      label: "Tema",
      light: "Açık",
      dark: "Koyu",
      system: "Sistem",
    },
    notifications: {
      title: "Bildirimler",
      subtitle: "Davetler ve çalışma alanlarınızdaki değişiklikler.",
      bellUnread:
        "one:Bildirimler, {n} okunmamış|other:Bildirimler, {n} okunmamış",
      viewAll: "Tümünü gör",
      menuEmpty:
        "Tüm bildirimleri gördünüz. Davetler, yeni ekip arkadaşları ve rol değişiklikleri burada görünür.",
      pageEmpty:
        "Tüm bildirimleri gördünüz. Biri sizi davet ettiğinde, çalışma alanınıza katıldığında veya rolünüzü değiştirdiğinde burada görürsünüz.",
      accept: "Kabul et",
      decline: "Reddet",
      unread: "Okunmamış",
      someone: "Biri",
      message: {
        invited: {
          member:
            "{actor} sizi {workspace} çalışma alanına üye olarak davet etti",
          viewer:
            "{actor} sizi {workspace} çalışma alanına izleyici olarak davet etti",
        },
        joined: {
          member: "{actor}, {workspace} çalışma alanına üye olarak katıldı",
          viewer:
            "{actor}, {workspace} çalışma alanına izleyici olarak katıldı",
        },
        seatRequested:
          "{actor}, {workspace} çalışma alanında ücretli lisans istedi",
        seatDenied:
          "{actor}, {workspace} çalışma alanındaki lisans isteğinizi reddetti",
        roleChanged: {
          member: "{actor} sizi {workspace} çalışma alanında üye yaptı",
          viewer: "{actor} sizi {workspace} çalışma alanında izleyici yaptı",
        },
        downgraded:
          "{actor} sizi {workspace} çalışma alanında izleyici rolüne geçirdi",
        keepRecordingUntil:
          "{date} tarihine kadar kayıt yapmaya devam edebilirsiniz.",
        removed: "{actor} sizi {workspace} çalışma alanından kaldırdı",
      },
      acceptErrors: {
        failed: "Davet kabul edilemedi",
        signedOut: "Kabul etmek için giriş yapın",
        invalid: "Bu davetin süresi dolmuş veya davet geri çekilmiş",
        emailMismatch: "Bu davet farklı bir e-posta adresi için",
        alreadyMember: "Zaten bu çalışma alanındasınız",
      },
    },
    mobileNav: {
      open: "Menüyü aç",
      close: "Menüyü kapat",
      docs: "Belgeler",
      star: "GitHub'da yıldız verin",
      signIn: "Giriş yapın",
      getStarted: "Başlayın",
    },
    skeletons: {
      avatar: "Profil fotoğrafı",
      workspaceName: "Çalışma alanı adı",
      workspaceLogo: "Çalışma alanı logosu",
    },
  },
  library: {
    dashboard: {
      welcome: "Tekrar hoş geldiniz",
      welcomeName: "Tekrar hoş geldiniz, {name}",
      openCanvas: "Tuvali aç",
      newRecording: "Yeni kayıt",
      stats: {
        recordings: "Kayıtlar",
        plusScreenshots:
          "one:Ayrıca {count} ekran görüntüsü|other:Ayrıca {count} ekran görüntüsü",
        noScreenshots: "Henüz ekran görüntüsü yok",
        views: "Görüntülenme",
        viewsAverage: "Kayıt başına ortalama {count}",
        noViews: "Henüz görüntülenme yok",
        recorded: "Kaydedilen süre",
        recordedAverage: "Kayıt başına ortalama {duration}",
        nothingRecorded: "Henüz kayıt yapılmadı",
        recordingsLeft: "Kalan kayıt",
        leftOfAllowance: "{left} / {allowance}",
        freePlanLimit: "Ücretsiz plan, her biri en fazla {minutes} dk",
      },
      recordedTime: {
        minutes: "{minutes} dk",
        hours: "{hours} sa",
        hoursMinutes: "{hours} sa {minutes} dk",
      },
      recent: {
        title: "Son kayıtlar",
        all: "Tüm kayıtlar",
        empty: "Bu çalışma alanında henüz bir şey paylaşılmadı.",
        views: "one:{n} görüntülenme|other:{n} görüntülenme",
        comments: "one:{n} yorum|other:{n} yorum",
        reactions: "one:{n} tepki|other:{n} tepki",
      },
      start: {
        title: "{product} ile kayda başlayın",
        surfacesLabel: "Kayıt yapılacak yer",
        surfaces: {
          extension: "Uzantı",
          desktop: "Masaüstü uygulaması",
          canvas: "Tuval",
        },
        extension: {
          description:
            "Araç çubuğundan herhangi bir sekmeyi, pencereyi veya tüm ekranınızı kaydedin ve herkesle paylaşabileceğiniz bir bağlantı alın.",
          record: "Şimdi kaydet",
          addToChrome: "Chrome'a ekle",
        },
        desktop: {
          description:
            "Ekranınızı ve kameranızı sistem sesiyle birlikte kaydeden yerel bir Mac uygulaması yolda. O zamana kadar uzantı herhangi bir sekmeyi, pencereyi veya tüm ekranınızı kaydeder.",
          download: "Mac için indir",
          comingSoon: "Yakında",
        },
        canvas: {
          description:
            "Gösterecek bir sayfa olmadığında, kayıt sırasında üzerine çizebileceğiniz kalemli, şekilli ve metinli boş bir pano.",
        },
      },
    },
    recording: {
      pageTitle: "Kayıtlar",
      count: "one:{n} kayıt|other:{n} kayıt",
      untitled: "Adsız kayıt",
      aiGenerated: "Yapay zeka ile oluşturuldu",
      processing: "İşleniyor",
      noMatches: "Bu filtrelerle eşleşen kayıt yok.",
      empty:
        "Henüz hiç kayıt bağlantısı oluşturmadınız. CaptureFlow masaüstü uygulamasında kayıt yapın; kayıtlarınız burada görünür.",
      selectAll: "Tüm kayıtları seç",
      selected: "one:{n} kayıt seçildi|other:{n} kayıt seçildi",
      open: "Kaydı aç",
      edit: "Kaydı düzenle",
      share: "Kaydı paylaş",
      delete: "Kaydı sil",
      deleteTitle: "Bu kayıt silinsin mi?",
      deleteDescription:
        "Video ve bağlantısı hemen çalışmaz hale gelir. Bu işlem geri alınamaz.",
      deleteSelectedTitle:
        "one:{n} kayıt silinsin mi?|other:{n} kayıt silinsin mi?",
    },
    screenshot: {
      pageTitle: "Ekran görüntüleri",
      count: "one:{n} ekran görüntüsü|other:{n} ekran görüntüsü",
      untitled: "Adsız ekran görüntüsü",
      numbered: "Ekran görüntüsü {id}",
      noMatches: "Bu filtrelerle eşleşen ekran görüntüsü yok.",
      empty:
        "Henüz ekran görüntüsü yok. CaptureFlow'u açın → Screenshot sekmesi → yakalamak için Display, Window veya Area seçin. Ekran görüntünüz otomatik olarak burada görünür.",
      selectAll: "Tüm ekran görüntülerini seç",
      selected:
        "one:{n} ekran görüntüsü seçildi|other:{n} ekran görüntüsü seçildi",
      open: "Ekran görüntüsünü aç",
      edit: "Ekran görüntüsünü düzenle",
      share: "Ekran görüntüsünü paylaş",
      delete: "Ekran görüntüsünü sil",
      deleteTitle: "Bu ekran görüntüsü silinsin mi?",
      deleteDescription:
        "Görsel ve bağlantısı hemen çalışmaz hale gelir. Bu işlem geri alınamaz.",
      deleteSelectedTitle:
        "one:{n} ekran görüntüsü silinsin mi?|other:{n} ekran görüntüsü silinsin mi?",
    },
    filters: {
      access: "Erişim",
      sort: "Sırala",
      current: "{label}: {value}",
      accessOptions: {
        all: "Tüm erişim türleri",
        public: "Herkese açık",
        workspace: "Çalışma alanı",
        private: "Özel",
      },
      sortOptions: {
        newest: "Yeniden eskiye",
        oldest: "Eskiden yeniye",
        views: "En çok görüntülenen",
      },
    },
    card: {
      select: "{title} öğesini seç",
      moreActions: "Diğer işlemler",
      rename: "Yeniden adlandır",
      unknownAuthor: "Bilinmiyor",
    },
    selection: {
      deleteDescription: "Bağlantıları hemen çalışmaz hale gelir.",
      deleteFailed:
        "{count} öğeden {failed} tanesi silinemedi. Diğerleri silindi.",
      clear: "Temizle",
    },
    pager: {
      label: "Sayfalar",
      previous: "Önceki sayfa",
      next: "Sonraki sayfa",
    },
    visibility: {
      label: "Görünürlük",
      labels: {
        public: "Herkese açık",
        workspace: "Çalışma alanı",
        private: "Özel",
      },
      descriptions: {
        public: "Bağlantıya sahip herkes görüntüleyebilir",
        workspace:
          "Yalnızca giriş yapmış çalışma alanı üyeleri görüntüleyebilir",
        private: "Yalnızca siz görüntüleyebilirsiniz",
      },
      workspaceNamed: "Çalışma alanı · {name}",
    },
    share: {
      title: "Paylaş",
      embed: "Göm",
      embedPublic: "Kod parçacığının yapıştırıldığı her yerde oynatılır.",
      embedRestricted:
        "Yalnızca bağlantıyı zaten açabilen kişiler için oynatılır.",
      copyCode: "Kodu kopyala",
      generalAccess: "Genel erişim",
      generalAccessCurrent: "Genel erişim: {access}",
      copyLink: "Bağlantıyı kopyala",
      linkCopied: "Bağlantı kopyalandı",
      shareAt: "{time} anından itibaren paylaş",
      socialHeading: "Şurada paylaş",
      socialText: "“{title}” kaydına göz at",
      email: "E-posta",
    },
    editableTitle: {
      label: "Kayıt başlığı",
      rename: "Kaydı yeniden adlandır",
    },
  },
  members: {
    title: "Üyeler",
    databaseUnavailable: "Veritabanı kullanılamıyor.",
    role: "Rol",
    status: "Durum",
    roles: {
      owner: "Yönetici",
      member: "Üye",
      viewer: "İzleyici",
    },
    roleHints: {
      member: {
        does: "Bu çalışma alanına kayıt yapar.",
        costs: "Light ve Pro'da ücretli bir lisans.",
      },
      viewer: {
        does: "İzler ve yorum yapar.",
        costs: "Her zaman ücretsiz.",
      },
    },
    statuses: {
      active: "Etkin",
      invited: "Davet edildi",
    },
    seatSummary: {
      members: "one:{n} üye|other:{n} üye",
      viewers: "one:{n} izleyici|other:{n} izleyici",
      paidSeats: "one:{n} ücretli lisans|other:{n} ücretli lisans",
      membersAndViewers: "{members} ve {viewers}",
      onPaidSeats:
        "{people}; {seats} kullanılıyor. Her üye bir lisanstır; izleyiciler ücretsizdir.",
      membersFree: "{people}. Bu planda üyeler ücretsizdir.",
      freePlan:
        "{people}. Ücretsiz plan: her üye, her biri en fazla {minutes} dakikalık {recordings} kayıt yapabilir; izleyiciler izler ve yorum yapar.",
      planTitle: "{plan} planı",
      paidPlanTitle: "Ücretli plan",
      freePlanTitle: "Ücretsiz plan",
      upgrade: "Çalışma alanını yükselt",
    },
    table: {
      intro: "Üyeler burada kayıt yapar; izleyiciler izler ve yorum yapar.",
      ownerIntro:
        "Sahibi olarak davet gönderebilir, kişileri kaldırabilir ve rolleri değiştirebilirsiniz.",
      searchPlaceholder: "Ad veya e-posta adresi",
      searchLabel: "Üyelerde ara",
      allRoles: "Tüm roller",
      everyone: "Herkes",
      columns: {
        name: "Ad",
        dateAdded: "Eklenme tarihi",
        email: "E-posta adresi",
        actions: "İşlemler",
      },
      empty: "Bu filtrelerle eşleşen kimse yok.",
      downgradeNote: "{date} tarihinden itibaren izleyici · {keep}",
      keepAsMember: "Üye olarak kalsın",
      revoke: "Geri çek",
    },
    seatRequests: {
      title: "Lisans istekleri",
      description:
        "Bu izleyiciler kayıt yapmak istedi. Onaylarsanız üye olurlar.",
      descriptionPaid:
        "Bu izleyiciler kayıt yapmak istedi. Onaylarsanız üye olurlar ve ücretli bir lisans eklenir.",
      asked: "{email} · {date} tarihinde istedi",
      deny: "Reddet",
      approve: "Onayla",
    },
    seatConfirm: {
      addTitle: "{name} için ücretli lisans eklensin mi?",
      addBody:
        "Üyeler kayıt yapar, bu yüzden her biri ücretli bir lisanstır. {plan} planınız {seats} lisanstan {nextSeats} lisansa çıkar; aylık ücret {before} yerine {after} olur.",
      addBodyYearly:
        "Üyeler kayıt yapar, bu yüzden her biri ücretli bir lisanstır. {plan} planınız {seats} lisanstan {nextSeats} lisansa çıkar; aylık ücret {before} yerine {after} olur ve yıllık faturalandırılır.",
      addInvoice: "Bu fatura döneminin kalanı bir sonraki faturanıza eklenir.",
      addConfirm: "Ücretli lisans ekle",
      removeTitle: "{name} izleyici rolüne geçirilsin mi?",
      removeBody:
        "{name}, ödemesini yaptığınız dönemin sonuna, yani {date} tarihine kadar kayıt yapmaya devam eder. Ardından izleyici olur; izleyebilir ve yorum yapabilir ama kayıt yapamaz.",
      removePlan:
        "O tarihten itibaren {plan} planınız {seats} lisanstan {nextSeats} lisansa iner; aylık ücret {before} yerine {after} olur.",
      removePlanYearly:
        "O tarihten itibaren {plan} planınız {seats} lisanstan {nextSeats} lisansa iner; aylık ücret {before} yerine {after} olur ve yıllık faturalandırılır.",
      removeConfirm: "İzleyici rolüne geçir",
    },
    remove: {
      label: "{name} adlı kişiyi çalışma alanından kaldır",
      title: "{name}, {workspace} çalışma alanından kaldırılsın mı?",
      body: "Erişimini hemen kaybeder. Kayıtları ve ekran görüntüleri çalışma alanında kalır.",
      freesSeat:
        "Böylece ücretli lisansı boşa çıkar: planınız {seats} lisanstan {nextSeats} lisansa iner.",
    },
    leave: {
      button: "Ayrıl",
      title: "{workspace} çalışma alanından ayrılmak istiyor musunuz?",
      body: "Buradaki kayıtlara ve ekran görüntülerine erişiminizi kaybedersiniz. Orada kaydettiğiniz her şey çalışma alanında kalır.",
      comeBack: "Geri dönmek için birinin sizi yeniden davet etmesi gerekir.",
      confirm: "Çalışma alanından ayrıl",
    },
    invite: {
      trigger: "Üye davet et",
      title: "{workspace} çalışma alanına üye davet edin",
      titleOwnWorkspace: "Çalışma alanınıza üye davet edin",
      description:
        "7 gün içinde süresi dolan bir bağlantı içeren bir e-posta alırlar. Aynı adresle giriş yaptıklarından emin olun.",
      removeEmail: "{email} adresini kaldır",
      addEmails: "E-posta ekle",
      separatorHint: "E-postaları boşluk, virgül veya Enter ile ayırın.",
      paidSeatNote:
        "Daveti kabul eden her üye, {plan} planınıza aylık {price} karşılığında ücretli bir lisans ekler. Bu dönemin kalanı bir sonraki faturanıza yansıtılır.",
      noEmails: "En az bir e-posta ekleyin",
      invalidEmails: "Geçerli bir e-posta değil: {emails}",
      failed: "Başarısız",
      sent: "one:{n} davet gönderildi.|other:{n} davet gönderildi.",
      sending: "Gönderiliyor…",
      submit: "Davetleri gönder",
    },
    actions: {
      emailRequired: "Bir e-posta adresi girin",
      emailInvalid: "Bu, geçerli bir e-posta gibi görünmüyor",
      ownWorkspace: "Zaten kendi çalışma alanınızdasınız",
      alreadyMember: "Bu kişi zaten bu çalışma alanının üyesi",
      emailNotSent:
        "Davet oluşturuldu ancak e-posta gönderilemedi. Bağlantıyı bekleyenler listesinden kopyalayın.",
      invitationSent: "Davet {email} adresine gönderildi",
      alreadyRecording: "Burada zaten kayıt yapabilirsiniz",
    },
  },
  settings: {
    saved: "Kaydedildi",
    errors: {
      ownerOnly: "Bunu yalnızca çalışma alanı sahibi değiştirebilir",
      databaseUnavailable: "Veritabanı kullanılamıyor",
      saveFailed: "Kaydedilemedi, tekrar deneyin",
    },
    upload: {
      uploading: "Yükleniyor…",
      missing: "Bir görsel dosyası seçin",
      failed: "Yükleme başarısız oldu",
      failedReason: "Yükleme başarısız oldu: {reason}",
    },
    personal: {
      title: "Kişisel ayarlar",
      account: {
        title: "Hesap",
        description:
          "Ekip arkadaşlarınıza ve kayıtlarınızı izleyenlere nasıl göründüğünüz.",
      },
      preferences: {
        title: "Tercihler",
        description:
          "CaptureFlow'un size nasıl göründüğü ve hangi dilde okunduğu.",
      },
      languageDescription: "CaptureFlow'u hangi dilde göreceğiniz.",
    },
    avatar: {
      label: "Profil fotoğrafı",
      change: "Profil fotoğrafını değiştir",
      removing: "Kaldırılıyor…",
      hint: "JPG, PNG, WebP veya GIF. En fazla 2 MB.",
      tooLarge: "Profil fotoğrafı en fazla 2 MB olmalıdır",
      badType: "Profil fotoğrafı PNG, JPEG, WebP veya GIF olmalıdır",
    },
    account: {
      name: {
        label: "Ad soyad",
        placeholder: "Adınız",
        description:
          "Kayıtlarda, ekran görüntülerinde ve etkinlik satırlarında gösterilir.",
        required: "Ad zorunludur.",
        updateFailed: "Ad güncellenemedi.",
      },
      email: {
        label: "E-posta adresi",
        description:
          "Giriş yapmak için kullanılır. Değiştirmek için desteğe ulaşın.",
      },
      userId: {
        label: "Kullanıcı kimliği",
        copy: "Kullanıcı kimliğini kopyala",
        description: "Desteğe ulaşırken bunu belirtin.",
      },
      saveChanges: "Değişiklikleri kaydet",
    },
    workspace: {
      title: "Çalışma alanı ayarları",
      tabs: {
        label: "Ayar bölümleri",
        general: "Genel",
        security: "Güvenlik",
      },
      general: {
        title: "Genel",
        description:
          "Bu çalışma alanını çalışma alanı seçicide, üyeler sayfasında ve paylaşım önizlemelerinde tanıtan ad ve logo.",
      },
      name: {
        title: "Çalışma alanı adı",
        description: "Çalışma alanınız için görünen ad.",
        empty: "Çalışma alanı adı boş olamaz",
        tooLong: "Çalışma alanı adı çok uzun (en fazla {max} karakter)",
      },
      logo: {
        title: "Çalışma alanı logosu",
        description:
          "Çalışma alanınızın adının yanında gösterilir. PNG, JPEG, WebP, GIF veya SVG, en fazla 2 MB.",
        upload: "Logo yükle",
        replace: "Logoyu değiştir",
        tooLarge: "Logo en fazla 2 MB olmalıdır",
        badType: "Logo PNG, JPEG, WebP, GIF veya SVG olmalıdır",
      },
      permissions: {
        title: "Varsayılan izinler",
        description:
          "Çalışma alanındaki her yeni kayda ve ekran görüntüsüne uygulanan ayarlar.",
      },
      recordingAccess: {
        title: "Kayıt erişimi",
        description:
          "Ekip arkadaşlarınızın bu çalışma alanına kayıt ve ekran görüntüsü ekleyip ekleyemeyeceğine karar verin.",
        allow: {
          title: "Ekip arkadaşları buraya ekleyebilsin",
          body: "Üyeler bu çalışma alanına kayıt yapabilir.",
        },
        ownerOnly: {
          title: "Yalnızca çalışma alanı sahibi",
          body: "Ekip arkadaşlarının yüklemeleri kendi kişisel çalışma alanlarına gider.",
        },
      },
    },
    devices: {
      title: "Bağlı cihazlar",
      count: "one:{n} cihazda giriş yapıldı|other:{n} cihazda giriş yapıldı",
      empty:
        "Bağlı cihaz yok. Bu hesabı bağlamak için CaptureFlow masaüstü uygulamasını açın ve kayıt çubuğundaki Sign in düğmesine tıklayın.",
      unlabelled: "Adsız cihaz",
      added: "{date} tarihinde eklendi",
      addedLastUsed: "{date} tarihinde eklendi · son kullanım {lastUsed}",
      neverUsed: "Hiç kullanılmadı",
      revoke: {
        action: "Erişimi kaldır",
        title: "Bu cihazın oturumu kapatılsın mı?",
        description: "Kayıtları yönetmek için yeniden giriş yapması gerekir.",
      },
    },
  },
  billing: {
    chargedInUsd: "ABD doları olarak tahsil edilir.",
    shownIn:
      "Fiyatlar {currency} olarak gösterilir. Ödeme ABD doları olarak alınır.",
    page: {
      title: "Faturalandırma",
      subtitle: "Planınız ve ne kadarını kullandığınız.",
      workspaceLabel: "Çalışma alanı · {name}",
      manageSubscription: "Aboneliği yönet",
      upgradeWorkspace: "Çalışma alanını yükselt",
      storage: "Çalışma alanı depolaması",
      usedOfLimit: "{used} / {limit}",
      usedNoLimit: "{used} — sınır yok",
    },
    loading: {
      plan: "Plan",
      usage: "Kullanım",
    },
    counts: {
      members: "one:{n} üye|other:{n} üye",
      paidSeats: "one:{n} ücretli lisans|other:{n} ücretli lisans",
      freeViewers: "one:{n} ücretsiz izleyici|other:{n} ücretsiz izleyici",
    },
    plan: {
      free: "Ücretsiz",
      paid: "Ücretli",
      billedMonthly: "Aylık faturalandırılır",
      billedYearly: "Yıllık faturalandırılır",
      freeSummary:
        "{members} · kişi başına en fazla {recordings} kayıt, her biri {minutes} dakika, veri tasarrufu kalitesi",
    },
    status: {
      onTrial: "Deneme",
      active: "Etkin",
      paused: "Duraklatıldı",
      pastDue: "Ödeme başarısız",
      unpaid: "Ödenmedi",
      cancelled: "İptal edildi",
      expired: "Süresi doldu",
    },
    details: {
      youPay: "Ödediğiniz",
      amountPerMonth: "Aylık {amount}",
      amountPerYear: "Yıllık {amount}",
      seatsMonthly:
        "one:{n} lisans × aylık {price}|other:{n} lisans × aylık {price}",
      seatsYearly:
        "one:{n} lisans × aylık {price}, yıllık faturalandırmayla aylık {total}|other:{n} lisans × aylık {price}, yıllık faturalandırmayla aylık {total}",
      nextPayment: "Sonraki ödeme",
      ends: "Bitiş",
      endOfPeriod: "Bu dönemin sonunda",
      amountOnDate: "{date} tarihinde {amount}",
      firstPaymentPending: "İlk ödeme tamamlandığında",
      estimate: "{base} · {change}, tahmini",
      baseForSeats:
        "one:{n} lisans için {amount}|other:{n} lisans için {amount}",
      seatsAdded:
        "one:bu dönem eklenen {n} lisans için {amount}|other:bu dönem eklenen {n} lisans için {amount}",
      seatsRemoved:
        "one:bu dönem kaldırılan {n} lisans için {amount} kredi|other:bu dönem kaldırılan {n} lisans için {amount} kredi",
      seatChanges: "bu dönemki lisans değişiklikleri için {amount}",
      seats: "Lisanslar",
      seatsAndViewers: "{seats}, {viewers}",
      billedTo: "Fatura alıcısı",
      paymentMethod: "Ödeme yöntemi",
      cardEnding: "Sonu {last4} ile biten {brand}",
      card: "Kart",
      updateCard: "Güncelle",
    },
    switchPlan: {
      switchTo: "{plan} planına geç",
      title: "{plan} planına geçilsin mi?",
      priceMonthly:
        "one:{n} lisansınızın aylık ücreti {before} yerine {after} olur.|other:{n} lisansınızın aylık ücreti {before} yerine {after} olur.",
      priceYearly:
        "one:{n} lisansınızın aylık ücreti {before} yerine {after} olur ve yıllık faturalandırılır.|other:{n} lisansınızın aylık ücreti {before} yerine {after} olur ve yıllık faturalandırılır.",
      benefits:
        "{plan}, 60 fps'ye kadar her kalitede kayıt yapar ve yapay zeka ile düzenleme ekler.",
      timing:
        "Hemen başlar. Bu fatura döneminin kalanına ait fark bir sonraki faturanıza eklenir.",
      errors: {
        failed: "Plan değiştirilemedi",
        unknownPlan: "Bilinmeyen plan",
        billingUnavailable: "Faturalandırma kullanılamıyor",
        noSubscription: "Bu çalışma alanının etkin bir aboneliği yok",
        cancelled: "Planı değiştirmeden önce aboneliği sürdürün",
        unavailable: "Plan değişiklikleri şu anda yapılamıyor",
        rejected:
          "Faturalandırma sistemi değişikliği kabul etmedi. Tekrar deneyin.",
      },
    },
    upgrade: {
      title: "{name} çalışma alanını yükseltin",
      billingCycle: "Fatura dönemi",
      cycles: {
        monthly: "Aylık",
        annual: "Yıllık",
      },
      annualSaving: "%{percent} tasarruf",
      seatPicker: {
        title: "Kimler ücretli lisans alacak",
        selected: "{seats} / {total}",
        description:
          "İşaretlenen kişiler kayıt yapar ve ücretlendirilir. Diğer herkes ücretsiz izleyicidir; izleyebilir, yorum yapabilir ve tepki verebilir ama kayıt yapamaz. Roller, yükselttiğinizde değişir.",
        selectAll: "Tümünü seç",
        clear: "Temizle",
        you: "(siz)",
        paidSeat: "Ücretli lisans",
        viewer: "İzleyici",
      },
      perMonth: "/ay",
      seatsPrice: "one:{n} lisans × {price}|other:{n} lisans × {price}",
      viewersFree: "one:{n} izleyici ücretsiz|other:{n} izleyici ücretsiz",
      priceWithViewers: "{seats}, {viewers}",
      priceYearly: "{seats}, yıllık faturalandırılır",
      priceWithViewersYearly: "{seats}, {viewers}, yıllık faturalandırılır",
      upgradeTo: "{plan} planına yükselt",
      checkoutUnavailable: "Ödeme yapılandırılmamış",
    },
    requestSeat: {
      request: "Kayıt izni iste",
      requested: "Lisans istendi",
      hint: "Burada izleyicisiniz. Kayıt yapabilmek için çalışma alanı sahibinden ücretli lisans isteyin.",
      requestedHint:
        "Çalışma alanı sahibine istek gönderildi. Onayladığında kayıt yapabileceksiniz.",
      failed: "İstek gönderilemedi",
    },
  },
  actions: {
    missingSlug: "Slug eksik",
    recordingNotFound: "Kayıt bulunamadı",
    backgroundMissing: "Yüklenecek bir görsel seç",
    backgroundTooLarge: "Görseller en fazla 5 MB olabilir",
    backgroundBadType: "PNG, JPEG veya WebP görsel kullan",
    backgroundFailed: "Görsel yüklenemedi. Tekrar dene.",
    invalidVisibility: "Geçersiz görünürlük",
    deleteVideoFailed: "Video dosyası silinemedi: {reason}",
    transcriptNotFound: "Transkript bulunamadı",
    transcriptEmpty: "Transkript boş bırakılamaz. Bunun yerine sıfırlayın.",
    missingTokenId: "Token kimliği eksik",
    tokenNotFound: "Token bulunamadı",
    missingScreenshotId: "Ekran görüntüsü kimliği eksik",
    screenshotNotFound: "Ekran görüntüsü bulunamadı",
    missingImageBytes: "Görsel verisi eksik",
    screenshotTooLarge:
      "Düzenlenen ekran görüntüsü, ekran görüntüsü başına boyut sınırını aşıyor.",
    saveScreenshotFailed: "Ekran görüntüsü kaydedilemedi: {reason}",
    saveFailed: "Kaydedilemedi: {reason}",
    invalidCanvasDimensions: "Kaydedilemedi: tuval boyutları geçersiz",
  },
  viewer: {
    meta: {
      defaultTitle: "{product} kaydı",
      defaultDescription: "{product} ile paylaşılan bir ekran kaydı.",
      preparingTitle: "Kayıt hazırlanıyor… — {product}",
      notFoundTitle: "Bulunamadı",
      description:
        "{product} ile paylaşılan bir ekran kaydı. Tarayıcınızda izleyin, kaydolmanız gerekmez.",
      descriptionTimed:
        "{product} ile paylaşılan {duration} uzunluğunda bir ekran kaydı. Tarayıcınızda izleyin, kaydolmanız gerekmez.",
    },
    loading: "Kayıt yükleniyor…",
    nav: {
      download: "İndir",
    },
    authPrompt: {
      pricing: "Fiyatlandırma",
      logIn: "Giriş yap",
      getStarted: "Başlayın",
      getFree: "{product} ile ücretsiz başlayın",
    },
    postedBy: {
      label: "Paylaşan",
      someone: "Biri",
    },
    views: {
      count: "one:{count} görüntülenme|other:{count} görüntülenme",
      showWhoWatched: "{views}, izleyenleri göster",
      viewers: "İzleyiciler",
      emptyTitle: "Henüz görüntülenme yok",
      emptyDescription: "Bağlantıyı paylaşın; izleyenler burada görünür.",
      signedInViewer: "Giriş yapmış izleyici",
      anonymous: "Anonim",
    },
    actions: {
      share: "Paylaş",
      visibilityFailed: "Görünürlük güncellenemedi",
      deleteFailed: "Kayıt silinemedi",
    },
    requestAccess: {
      title: "Bu videoyu görüntülemek için erişim isteyin",
      notSharedBy: "{name} bu kaydı henüz sizinle paylaşmadı.",
      notSharedByOwner: "Sahibi bu kaydı henüz sizinle paylaşmadı.",
      signInHint:
        "İş e-postanızla giriş yapın; zaten sahibinin ekibindeyseniz doğrudan içeri alınırsınız.",
      signIn: "Devam etmek için giriş yapın",
      sentTitle: "İstek gönderildi",
      sentDescription:
        "Sahibine haber verdik. Erişim verirse bir e-posta alırsınız.",
      askingAs: "{email} olarak istiyorsunuz",
      noteLabel: "Not ekleyin {optional}",
      noteOptional: "(isteğe bağlı)",
      notePlaceholder:
        "Merhaba, dünkü değerlendirme toplantısının bu kaydını izlemek istiyorum.",
      sending: "Gönderiliyor…",
      submit: "Erişim iste",
      failed: "Bir sorun oluştu. Biraz sonra tekrar deneyin.",
    },
    pending: {
      preparingTitle: "Kaydınız hazırlanıyor…",
      preparingDescription:
        "Yükleme hâlâ tamamlanıyor. Hazır olduğunda bu sayfa kendiliğinden yenilenir.",
      generatingTitle: "Videonuz oluşturuluyor…",
      generatingDescription:
        "Bu birkaç dakika sürebilir, bir kahve ya da atıştırmalık alın ☕️🍪 Hazır olduğunda sayfa kendiliğinden yenilenir.",
      failedTitle: "Bu kaydın yüklenmesi tamamlanmadı",
      failedDescription:
        "Bağlantı oluşturuldu ama video hiç ulaşmadı. Bağlantıyı bir dakika sonra tekrar deneyin veya yeni bir kayıt yapın.",
      comment: "Yorum yap",
    },
    upgradeBanner: {
      message:
        "Ücretsiz planda {usage}. Tam kalitede sınırsız kayıt için yükseltin.",
      usage: "other:{n} kayıttan {used} tanesi kullanıldı",
    },
    editPanel: {
      editTitle: "Videoyu düzenle",
      editDescription:
        "Düzenleyicide kırpın, kesin, görünümü değiştirin ve transkripti düzeltin.",
      downloadTitle: "Videoyu indir",
      downloadDescription:
        "Düzenlemelerinle MP4: arka plan, kamera ve kesimler.",
      downloadRendering: "İşleniyor: %{percent}. Bu sekmeyi açık tut.",
      downloadCancel: "İptal",
      downloadFailed: "Video işlenemedi. Bunun yerine orijinali indir.",
      downloadUnsupported:
        "Bu tarayıcı video işleyemiyor. Bunun yerine orijinali indir.",
      originalTitle: "Orijinali indir",
      originalDescription: "Kaydın düzenlenmemiş, çekildiği hali.",
      captionsTitle: "Altyazıları indir",
      captionsDescription:
        "Videoyla birlikte yüklenecek bir SRT dosyası, örneğin X'te.",
      copyEmbed: "Gömme kodunu kopyala",
      embedCopied: "Gömme kodu kopyalandı",
      embedDescription: "Oynatıcıyı herhangi bir web sayfasına yapıştırın.",
    },
    notFound: {
      title: "Kayıt bulunamadı",
      description:
        "Bu bağlantının süresi dolmuş veya bağlantı hiç var olmamış. Ücretsiz hesaplardaki kayıtlar, son görüntülendikleri andan itibaren 30 gün saklanır.",
      madeWith: "{product} ile yapıldı",
    },
  },
  activity: {
    sidebar: {
      label: "Kayıt kenar çubuğu",
      activityTab: "Etkinlik",
      transcriptTab: "Transkript",
      toolsTab: "İşlemler",
    },
    you: "Siz",
    anonymous: "Anonim",
    jumpToMoment: "Bu ana git",
    empty: {
      title: "Henüz etkinlik yok",
      description:
        "İzleyicilerin tepkileri ve yorumları geldikçe burada görünür.",
      firstTitle: "İlk yorumu siz yapın",
      firstTitleNamed: "İlk yorumu siz yapın, {name}",
      hint: "Yanıtlamak için {key} tuşuna basın veya bu panelin altından yorum bırakın.",
      focusComposer: "Yorum kutusuna odaklan",
    },
    composer: {
      signIn: "Tepki vermek ve yorum yapmak için giriş yapın",
      placeholder: "Yorum bırakın…",
      mention: "Birinden bahset",
      noOneToMention: "Henüz kimse tepki vermedi veya yorum yapmadı",
      insertEmoji: "Emoji ekle",
      searchEmoji: "Emoji ara",
      posting: "Gönderiliyor…",
      submitAt: "{time} anına yorum yap",
      postFailed: "Yorum gönderilemedi",
    },
    comment: {
      delete: "Yorumu sil",
      deleteTitle: "Bu yorum silinsin mi?",
      deleteDescription: "Herkes için kaldırılır. Bu işlem geri alınamaz.",
      deleteFailed: "Yorum silinemedi",
    },
    reaction: {
      count: "one:{n} tepki|other:{n} tepki",
      delete: "Tepkiyi sil",
      deleteMany: "one:{n} tepkiyi sil|other:{n} tepkiyi sil",
      deleteFailed: "Tepki silinemedi",
    },
    transcript: {
      pendingTitle: "Transkript oluşturuluyor…",
      pendingDescription: "Transkript hazır olur olmaz burada görünür.",
      failedTitle: "Transkript oluşturma tamamlanmadı",
      failedDescription:
        "Bu kaydın transkripti oluşturulurken bir sorun oluştu.",
      noneTitle: "Transkript yok",
      noneOwnerDescription:
        "Mikrofon açıkken kayıt yapın, transkript sizin için yazılır.",
      noneViewerDescription: "Bu kayıt mikrofon olmadan yapıldı.",
      searchLabel: "Transkriptte ara",
      noMatches: "Eşleşme yok.",
    },
    saveFailed: "Kaydedilemedi. Tekrar deneyin.",
    summary: {
      title: "Özet",
      add: "Ekle",
      placeholder: "Bu kayıtta neler oluyor?",
      empty: "Henüz özet yok.",
      emptyAction: "Özet ekle",
    },
    chapters: {
      title: "Bölümler",
      count: "one:{n} bölüm|other:{n} bölüm",
      addAtPlayhead: "Oynatma konumuna ekle",
      defaultTitle: "Bölüm {n}",
      editHint: "Her satıra bir bölüm, {short} veya {long} biçiminde.",
      editHintShort: "M:SS Başlık",
      editHintLong: "H:MM:SS Başlık",
      editPlaceholder: "0:00 Giriş\n0:30 Demo\n1:20 Kapanış",
      playing: "Oynatılıyor",
      remove: "Bölümü kaldır",
      empty: "Henüz bölüm yok.",
      emptyAction: "Oynatma konumuna bir tane ekle",
    },
  },
  player: {
    overlay: {
      watchAgain: "Tekrar izle",
    },
    captions: {
      track: "Altyazılar",
      size: "Boyut",
      position: "Konum",
      sizes: {
        small: "Küçük",
        medium: "Orta",
        large: "Büyük",
      },
      positions: {
        top: "Üst",
        bottom: "Alt",
      },
    },
    reactionBar: {
      comment: "Yorum yap",
      leaveComment: "Yorum bırak",
    },
    reactions: {
      heart: "Kalp",
      thumbsUp: "Başparmak yukarı",
      fire: "Ateş",
      clap: "Alkış",
      raisedHands: "Eller havada",
      eyes: "Gözler",
    },
    embed: {
      title: "{product} kaydı",
    },
    controls: {
      buttons: {
        play: "Oynat",
        pause: "Duraklat",
        replay: "Tekrar oynat",
        mute: "Sesi kapat",
        unmute: "Sesi aç",
      },
      seek: {
        forward: "{seconds} saniye ileri sar",
        backward: "{seconds} saniye geri sar",
      },
      fullscreen: {
        enter: "Tam ekrana geç",
        exit: "Tam ekrandan çık",
      },
      captions: {
        enable: "Altyazıları aç",
        disable: "Altyazıları kapat",
      },
      pip: {
        enter: "Pencere içinde pencere moduna geç",
        exit: "Pencere içinde pencere modundan çık",
      },
      cast: {
        start: "Yayınlamayı başlat",
        stop: "Yayınlamayı durdur",
        connecting: "Bağlanıyor",
      },
      airplay: {
        start: "AirPlay'i başlat",
        stop: "AirPlay'i durdur",
      },
      slider: {
        seek: "Sar",
      },
      time: {
        current: "Geçerli zaman",
        duration: "Süre",
        position: "{current} / {duration}",
        unknown: "Medya yüklenmedi, süre bilinmiyor.",
      },
      playback: {
        rate: "Oynatma hızı {rate}",
      },
      volume: {
        mutedValue: "{percent}, sessiz",
        muted: "Sessiz",
        label: "Ses düzeyi",
        value: "Ses düzeyi {value}",
      },
      status: {
        captionsOn: "Altyazılar açık",
        captionsOff: "Altyazılar kapalı",
        paused: "Duraklatıldı",
        playing: "Oynatılıyor",
        fullscreen: "Tam ekran",
        pip: "Pencere içinde pencere",
        exitPip: "Pencere içinde pencere modundan çık",
        seekedTo: "{time} anına sarıldı",
      },
      container: {
        label: "Medya oynatıcı",
      },
      errors: {
        aborted: "Medya oynatımını bitmeden durdurdunuz.",
        network: "Bu medya, bir ağ veya sunucu sorunu nedeniyle yüklenemedi.",
        decode:
          "Bu medya oynatılamadı. Bozulmuş olabilir veya tarayıcınız biçimini desteklemiyor olabilir.",
        source:
          "Bu medya yüklenemedi. Kullanılamıyor olabilir veya tarayıcınız biçimini desteklemiyor olabilir.",
        encrypted: "Bu medya, şifresi çözülemediği için oynatılamadı.",
        unplayable: "Oynatıcı bu medyayı desteklemiyor.",
        title: "Bir sorun oluştu.",
        unexpected: "Beklenmeyen bir hata oluştu.",
      },
      common: {
        ok: "Tamam",
      },
      menu: {
        settings: "Ayarlar",
        quality: "Kalite",
        audio: "Ses",
        speed: "Hız",
        captions: "Altyazılar",
        playbackRate: "Oynatma hızı",
        off: "Kapalı",
        auto: "Otomatik",
        autoWithLabel: "Otomatik ({label})",
      },
    },
  },
  screenshotView: {
    page: {
      defaultTitle: "{product} ekran görüntüsü",
      description: "{product} ile paylaşılan bir ekran görüntüsü.",
      madeWith: "{product} ile yapıldı",
      loading: "Ekran görüntüsü yükleniyor…",
    },
    authPrompt: {
      pricing: "Fiyatlandırma",
      logIn: "Giriş yap",
      getStarted: "Başlayın",
      getFree: "{product} ile ücretsiz başlayın",
    },
    actions: {
      edit: "Ekran görüntüsünü düzenle",
      share: "Paylaş",
      shareTitle: "Ekran görüntüsünü paylaş",
      copyLink: "Bağlantıyı kopyala",
      linkCopied: "Bağlantı kopyalandı",
      more: "Diğer işlemler",
      delete: "Ekran görüntüsünü sil",
      deleteTitle: "Bu ekran görüntüsü silinsin mi?",
      deleteDescription:
        "Görsel ve bağlantısı hemen çalışmaz hale gelir. Bu işlem geri alınamaz.",
      visibilityFailed: "Görünürlük güncellenemedi",
      deleteFailed: "Ekran görüntüsü silinemedi",
    },
    zoom: {
      expand: "Görseli büyüt",
      minimize: "Görseli küçült",
    },
    requestAccess: {
      title: "Bu ekran görüntüsünü görüntülemek için erişim isteyin",
      notSharedBy: "{name} bu ekran görüntüsünü henüz sizinle paylaşmadı.",
      notSharedByOwner: "Sahibi bu ekran görüntüsünü henüz sizinle paylaşmadı.",
      signInHint:
        "İş e-postanızla giriş yapın; zaten sahibinin ekibindeyseniz doğrudan içeri alınırsınız.",
      signIn: "Devam etmek için giriş yapın",
      sentTitle: "İstek gönderildi",
      sentDescription:
        "Sahibine haber verdik. Erişim verirse bir e-posta alırsınız.",
      askingAs: "{email} olarak istiyorsunuz",
      noteLabel: "Not ekleyin {optional}",
      noteOptional: "(isteğe bağlı)",
      notePlaceholder:
        "Merhaba, tasarım değerlendirmesindeki bu ekran görüntüsünün bir kopyasını istiyorum.",
      sending: "Gönderiliyor…",
      submit: "Erişim iste",
      failed: "Bir sorun oluştu. Biraz sonra tekrar deneyin.",
    },
    notFound: {
      title: "Ekran görüntüsü bulunamadı",
      description:
        "Bu bağlantının süresi dolmuş veya bağlantı hiç var olmamış. Ücretsiz hesaplardaki ekran görüntüleri, son görüntülendikleri andan itibaren 30 gün saklanır.",
    },
  },
  recordingEditor: {
    skeleton: {
      label: "Düzenleyici açılıyor",
      status: "Düzenleyici açılıyor…",
    },
    preparing: {
      title: "Kayıt hazırlanıyor…",
      description:
        "Kayıt hâlâ yükleniyor. Hazır olduğunda bu sayfa otomatik olarak yenilenir.",
    },
    failed: {
      title: "Kayıt yüklenemedi.",
      description: "Masaüstü uygulamasından yeniden kayıt yapmayı deneyin.",
    },
    saveFailed: "Kaydedilemedi",
    topBar: {
      back: "Kayda dön",
      status: {
        idle: "Düzenlemeler otomatik kaydedilir",
        saved: "Kaydedildi",
        error: "Kaydedilemedi",
      },
      versionHistory: "Sürüm geçmişi (yakında)",
      undo: "Geri al",
      undoShortcut: "Geri al ({key})",
      redo: "Yinele",
      redoShortcut: "Yinele ({key})",
      finish: "Bitir",
    },
    panels: {
      label: "Düzenleyici panelleri",
      tabs: {
        transcript: "Transkript",
        design: "Tasarım",
        camera: "Kamera",
        audio: "Ses",
        details: "Ayrıntılar",
      },
      hide: {
        transcript: "Transkripti gizle",
        design: "Tasarımı gizle",
        camera: "Kamerayı gizle",
        audio: "Sesi gizle",
        details: "Ayrıntıları gizle",
      },
      show: {
        transcript: "Transkripti göster",
        design: "Tasarımı göster",
        camera: "Kamerayı göster",
        audio: "Sesi göster",
        details: "Ayrıntıları göster",
      },
    },
    toggleOn: "Açık",
    background: {
      title: "Arka plan",
      gradients: "Gradyanlar",
      none: "Yok",
      noBackground: "Arka plan yok",
      upload: "Görsel yükle",
      uploading: "Yükleniyor…",
      uploadedImage: "Görselin",
      solid: "Düz renk",
      solidColor: "Düz renk {color}",
      customColor: "Özel renk seç",
      colors: "Renkler",
      wallpaper: "{group} duvar kâğıdı {n}",
      wallpaperGroups: {
        general: "Genel",
        cities: "Şehirler",
        blue: "Mavi",
        purple: "Mor",
        orange: "Turuncu",
        dark: "Koyu",
      },
      presets: {
        violet: "Menekşe",
        sunset: "Gün batımı",
        orchid: "Orkide",
        forest: "Orman",
        flamingo: "Flamingo",
        citrus: "Narenciye",
        arctic: "Kutup",
        ocean: "Okyanus",
        deep: "Derin",
        ember: "Kor",
        mint: "Nane",
        dusk: "Alacakaranlık",
        peach: "Şeftali",
        midnight: "Gece yarısı",
        slate: "Füme",
      },
    },
    frame: {
      title: "Çerçeve",
      padding: "Boşluk",
      corners: "Köşeler",
      shadow: "Gölge",
    },
    camera: {
      title: "Kamera",
      show: "Kamerayı göster",
      hidden: "Gizli",
      position: "Konum",
      positionHint: "Noktayı sürükleyin veya bir köşeye dokunun",
      positionHintHidden: "Yerleştirmek için kamerayı gösterin.",
      corners: {
        topLeft: "Sol üst",
        topRight: "Sağ üst",
        bottomLeft: "Sol alt",
        bottomRight: "Sağ alt",
      },
      size: "Boyut",
      sizes: {
        small: "Küçük",
        medium: "Orta",
        large: "Büyük",
      },
    },
    audio: {
      title: "Ses",
      systemSound: "Sistem sesi",
      sound: "Ses",
      microphone: "Mikrofon",
      muted: "Sessiz",
      sharedTrack:
        "Bu kayıtta mikrofon ve sistem sesi tek bir ses kanalını paylaşıyor.",
    },
    details: {
      title: "Kayıt",
      link: "Bağlantı",
      size: "Boyut",
      duration: "Süre",
      views: "Görüntülenme",
      created: "Oluşturulma",
    },
    transcript: {
      transcribing: "Transkript oluşturuluyor…",
      unavailable: "Kullanılabilir transkript yok",
      pendingHint:
        "Düzenlemek için bir dakika sonra bu sayfayı yeniden yükleyin.",
      failedHint: "Bu kayıt için transkript oluşturma tamamlanmadı.",
      missingHint:
        "Mikrofon açıkken kayıt yapın, transkript sizin için yazılır.",
      deleteWord: "Kelimeyi sil",
      deleteWords: "one:{n} kelimeyi sil|other:{n} kelimeyi sil",
      clearSelection: "Seçimi temizle",
      hint: "Seçmek için bir kelimeye tıklayın veya kelimelerin üzerinde sürükleyin, metni düzeltmek için çift tıklayın.",
      resetEdits: "Düzenlemeleri sıfırla",
      editLine: "Transkript satırını düzenle",
      selectLine: "{time} anındaki satırı seç",
      restore: "Geri yükle",
      saveFailed: "Kaydedilemedi",
      resetFailed: "Sıfırlanamadı",
    },
    timeline: {
      hideWaveform: "Dalga biçimini gizle",
      showWaveform: "Dalga biçimini göster",
      loadingAudio: "Ses yükleniyor…",
      deleteSelection: "Seçimi sil",
      deleteSelectionHint:
        "Transkriptte kelime seçin veya zaman çizelgesini bölüp bir parça seçin",
      splitAt: "{time} anında böl",
      splitHint: "Önce oynatarak veya sararak bir ana gidin",
      comingSoon: "Yakında",
      fit: "Sığdır",
      zoomOut: "Uzaklaştır",
      zoom: "Zaman çizelgesi yakınlaştırması",
      zoomIn: "Yakınlaştır",
      seek: "Sar",
      trimStart: "Klibin başını kırp",
      trimEnd: "Klibin sonunu kırp",
      removeSplit: "{time} anındaki bölmeyi kaldır",
    },
  },
  screenshotEditor: {
    loading: "Düzenleyici yükleniyor…",
    imageError: {
      decode: "Ekran görüntüsü görseli çözülemedi.",
      fetch:
        "Ekran görüntüsü görseli yüklenemedi. Depolama alanı CORS erişimini kaybetmiş olabilir.",
    },
    header: {
      back: "Ekran görüntüsüne dön",
      reset: "Düzenlemeleri sıfırla",
      undo: "Geri al",
      undoTooltip: "Geri al ({key})",
      redo: "Yinele",
      redoTooltip: "Yinele ({key})",
      finish: "Bitir",
    },
    saveError: {
      notMounted: "Düzenleyici yüklenmedi",
      noCanvas: "Dışa aktarma tuvali alınamadı",
      workerCrashed: "PNG kodlama iş parçacığı çöktü",
    },
    tools: {
      text: "Metin",
      rect: "Dikdörtgen",
      arrow: "Ok",
      background: "Arka plan",
    },
    background: {
      title: "Arka plan ekle",
      close: "Arka plan seçiciyi kapat",
      none: "Yok",
      gradients: {
        violet: "Menekşe",
        sunset: "Gün batımı",
        orchid: "Orkide",
        forest: "Orman",
        flamingo: "Flamingo",
        citrus: "Narenciye",
        arctic: "Kutup",
        ocean: "Okyanus",
        deep: "Derin",
      },
      solid: "Düz renk {color}",
      custom: "Özel renk seç",
    },
    inspector: {
      color: "Renk {color}",
      size: "{n}px",
      duplicate: "Çoğalt",
    },
    textPrompt: "Metin",
  },
  canvas: {
    meta: {
      title: "Tuval",
      description: "Kayıt yaparken üzerine çizebileceğiniz boş bir pano.",
    },
    loading: "Tuval yükleniyor…",
    tools: {
      select: "Seç",
      hand: "El",
      pen: "Kalem",
      highlighter: "Vurgulayıcı",
      rect: "Dikdörtgen",
      ellipse: "Elips",
      arrow: "Ok",
      line: "Çizgi",
      text: "Metin",
      eraser: "Silgi",
    },
    shortcut: "{label} · {key}",
    colour: "Renk {colour}",
    stroke: "Kalınlık {width}",
    hint: "Gezinmek için kaydırın · yakınlaştırmak için {mod} ile kaydırın · sürüklemek için {space} tuşunu basılı tutun",
    textPlaceholder: "Yazın…",
    history: {
      undo: "Geri al",
      redo: "Yinele",
      clear: "Panoyu temizle",
    },
    zoom: {
      out: "Uzaklaştır",
      reset: "Yakınlaştırmayı sıfırla",
      in: "Yakınlaştır",
    },
    extensionPrompt: {
      title: "Bu tuvali kaydedin",
      description:
        "Çizerken ekranınızı ve kameranızı kaydetmek, ardından bir bağlantı paylaşmak için CaptureFlow uzantısını ekleyin.",
      dismiss: "Şimdi değil",
      install: "Chrome'a ekle",
    },
  },
};

export default messages;

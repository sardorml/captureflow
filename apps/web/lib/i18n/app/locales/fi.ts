import type { AppMessages } from "../messages";

const messages: AppMessages = {
  common: {
    cancel: "Peruuta",
    save: "Tallenna",
    saving: "Tallennetaan…",
    delete: "Poista",
    deleting: "Poistetaan…",
    remove: "Poista",
    close: "Sulje",
    back: "Takaisin",
    continue: "Jatka",
    confirm: "Vahvista",
    done: "Valmis",
    edit: "Muokkaa",
    copy: "Kopioi",
    copied: "Kopioitu",
    search: "Hae",
    loading: "Ladataan…",
    retry: "Yritä uudelleen",
    learnMore: "Lue lisää",
    language: "Kieli",
    themeToLight: "Vaihda vaaleaan teemaan",
    themeToDark: "Vaihda tummaan teemaan",
    somethingWrong: "Jokin meni vikaan. Yritä uudelleen.",
    pageFailed: "Tätä sivua ei voitu ladata.",
    partFailed: "Tätä osaa ei voitu ladata.",
    failedBody: "Jokin meni vikaan. Yritä uudelleen tai lataa sivu uudelleen.",
    reload: "Lataa sivu uudelleen",
  },
  auth: {
    signedInAs: "Olet kirjautunut osoitteella {email}.",
    errors: {
      generic: "Jokin meni vikaan. Yritä uudelleen.",
      network: "Verkkovirhe. Yritä uudelleen.",
    },
    login: {
      metaTitle: "Kirjaudu sisään",
      signInTitle: "Tervetuloa takaisin",
      signInDescription:
        "Kirjaudu sisään Googlella, GitHubilla tai sähköpostilla",
      signUpTitle: "Luo tili",
      signUpDescription: "Rekisteröidy Googlella, GitHubilla tai sähköpostilla",
      inviteTitle: "Liity työtilaan {workspace}",
      inviteDescription:
        "{inviter} kutsui sinut. Kirjaudu sisään tai luo tili osoitteella {email}, niin voit hyväksyä kutsun.",
      continueWith: "Jatka {provider}-tilillä",
      or: "Tai",
      emailLabel: "Sähköposti",
      emailPlaceholder: "you@example.com",
      emailInvalid: "Anna kelvollinen sähköpostiosoite.",
      continueWithEmail: "Jatka sähköpostilla",
      askForInvite: "Tarvitsetko tilin? Pyydä kutsu ylläpitäjältä.",
      haveAccount: "Onko sinulla jo tili? {action}",
      haveAccountAction: "Kirjaudu sisään",
      noAccount: "Eikö sinulla ole tiliä? {action}",
      noAccountAction: "Rekisteröidy",
      changeEmail: "Vaihda",
      nameLabel: "Nimi",
      namePlaceholder: "Nimesi",
      passwordLabel: "Salasana",
      newPasswordPlaceholder: "Vähintään 12 merkkiä",
      passwordTooShort: "Käytä vähintään 12 merkkiä.",
      passwordMissing: "Anna salasanasi.",
      signInSubmit: "Kirjaudu sisään",
      signUpSubmit: "Luo tili",
      terms: "Jatkamalla hyväksyt {terms} ja {privacy}.",
      termsLink: "käyttöehdot",
      privacyLink: "tietosuojakäytännön",
    },
    verify: {
      title: "Tarkista sähköpostisi",
      description:
        "Lähetimme linkin osoitteeseen {email}. Avaa se ja viimeistele tilisi luominen.",
      resend: "Lähetä sähköposti uudelleen",
      resent: "Lähetetty uudelleen",
      resendFailed: "Sähköpostin lähetys ei onnistunut. Yritä uudelleen.",
      wrongAddress: "Väärä osoite? {action}",
      wrongAddressAction: "Käytä toista sähköpostiosoitetta",
    },
    oauthErrors: {
      unfinished: "Kirjautuminen jäi kesken. Yritä uudelleen.",
      inviteOnly:
        "Tähän CaptureFlow'hun pääsee vain kutsulla. Pyydä kutsu ylläpitäjältä.",
      allowedDomains:
        "Rekisteröidy osoitteella, jonka pääte on {domains}, tai pyydä kutsu ylläpitäjältä.",
      providerDomains:
        "Rekisteröidy Google- tai GitHub-tilillä, jonka osoitteen pääte on {domains}.",
      domainChoice: "{first} tai {second}",
    },
    inviteFallbacks: {
      workspace: "CaptureFlow-työtila",
      inviter: "Tiimiläinen",
    },
    setPassword: {
      title: "Aseta salasana",
      description:
        "Valitse salasana osoitteelle {email}. Sinut kirjataan sen jälkeen sisään.",
      passwordLabel: "Uusi salasana",
      passwordPlaceholder: "Vähintään 12 merkkiä",
      submit: "Tallenna salasana",
      expiredTitle: "Tämä linkki ei enää toimi",
      expiredDescription:
        "Se on jo käytetty tai vanhentunut. Pyydä ylläpitäjältä uusi.",
      goToSignIn: "Siirry kirjautumiseen",
    },
    invite: {
      title: "Sinut on kutsuttu",
      asViewer:
        "Sinut on kutsuttu CaptureFlow'ssa työtilaan {workspace} katsojaksi: voit katsoa ja kommentoida kaikkea siellä jaettua.",
      asMember:
        "Sinut on kutsuttu CaptureFlow'ssa työtilaan {workspace} jäseneksi: voit tallentaa siihen ja jakaa tiimin kanssa.",
      accept: "Hyväksy kutsu",
      databaseUnavailable: "Tietokanta ei ole käytettävissä",
      invalidTitle: "Kutsu ei ole enää voimassa",
      invalidBody:
        "Tämä linkki on vanhentunut tai jo käytetty. Pyydä työtilan omistajaa lähettämään uusi kutsu.",
      wrongAccountTitle: "Väärä tili",
      wrongAccountBody:
        "Tämä kutsu lähetettiin osoitteeseen {invited}, mutta olet kirjautunut osoitteella {current}. Kirjaudu ulos ja kirjaudu sisään kutsutulla osoitteella, niin voit hyväksyä kutsun.",
      goToDashboard: "Siirry koontinäyttöön",
      signOut: "Kirjaudu ulos",
    },
    handoff: {
      signingIn: "Kirjaudutaan sisään…",
      returning: "Palataan CaptureFlow'hun…",
      open: "Avaa CaptureFlow",
      hint: "Jos mitään ei tapahdu, klikkaa yllä olevaa painiketta. Voit sulkea tämän välilehden, kun työpöytäsovellus avautuu uudelleen.",
      extensionDone:
        "Olet kirjautunut osoitteella {email}. Voit sulkea tämän välilehden.",
      extensionUnreachable:
        "CaptureFlow-laajennukseen ei saatu yhteyttä. Varmista, että se on asennettu, ja yritä uudelleen klikkaamalla sen kuvaketta.",
      extensionUnverified:
        "Laajennusta ei voitu vahvistaa. Asenna se uudelleen ja yritä uudelleen.",
    },
  },
  shell: {
    record: {
      newRecording: "Uusi tallenne",
    },
    nav: {
      toggleSidebar: "Näytä tai piilota sivupalkki",
      dashboard: "Koontinäyttö",
      recordings: "Tallenteet",
      screenshots: "Kuvakaappaukset",
      canvas: "Piirtoalusta",
      workspaceGroup: "Työtila",
      members: "Jäsenet",
      settings: "Asetukset",
      personal: "Omat",
      workspace: "Työtila",
      billing: "Laskutus",
      admin: "Ylläpito",
    },
    upgradeCard: {
      title: "Päivitä työtilasi",
      description:
        "Ilmaisessa tilauksessa on {recordings} tallennetta henkilöä kohden datansäästölaadulla. Maksulliset tilaukset poistavat rajat, alkaen {price} jäsentä kohden.",
      viewPlans: "Katso tilaukset",
    },
    topBar: {
      upgrade: "Päivitä tilaus",
    },
    workspaceSwitcher: {
      switchWorkspace: "Vaihda työtilaa",
      summary: "one:Oletus · {n} jäsen|other:Oletus · {n} jäsentä",
      workspaces: "Työtilat",
      owned: "Omistat tämän",
      joined: "Olet liittynyt",
      newWorkspace: "Uusi työtila",
      inviteMembers: "Kutsu jäseniä",
    },
    drawer: {
      open: "Avaa työtilavalikko",
      title: "Työtilavalikko",
    },
    search: {
      prompt: "Hae tallenteistasi ja kuvakaappauksistasi",
      clear: "Tyhjennä haku",
      results: "Hakutulokset",
      hint: "Hae tallenteitasi ja kuvakaappauksiasi otsikon perusteella.",
      noMatches: "Ei osumia",
      kind: {
        recording: "tallenne",
        screenshot: "kuvakaappaus",
      },
    },
    account: {
      menu: "Tilivalikko",
      nav: {
        billing: "Laskutus",
        devices: "Yhdistetyt laitteet",
        settings: "Asetukset",
        support: "Ota yhteyttä tukeen",
      },
      freePlan: "Ilmainen",
      signOut: "Kirjaudu ulos",
      signingOut: "Kirjaudutaan ulos…",
    },
    theme: {
      label: "Teema",
      light: "Vaalea",
      dark: "Tumma",
      system: "Järjestelmä",
    },
    notifications: {
      title: "Ilmoitukset",
      subtitle: "Kutsut ja työtilojesi muutokset.",
      bellUnread:
        "one:Ilmoitukset, {n} lukematon|other:Ilmoitukset, {n} lukematonta",
      viewAll: "Näytä kaikki",
      menuEmpty:
        "Olet ajan tasalla. Kutsut, uudet tiimiläiset ja roolimuutokset näkyvät täällä.",
      pageEmpty:
        "Olet ajan tasalla. Kun joku kutsuu sinut, liittyy työtilaasi tai muuttaa rooliasi, näet sen täällä.",
      accept: "Hyväksy",
      decline: "Hylkää",
      unread: "Lukematon",
      someone: "Joku",
      message: {
        invited: {
          member: "{actor} kutsui sinut työtilaan {workspace} jäseneksi",
          viewer: "{actor} kutsui sinut työtilaan {workspace} katsojaksi",
        },
        joined: {
          member: "{actor} liittyi työtilaan {workspace} jäsenenä",
          viewer: "{actor} liittyi työtilaan {workspace} katsojana",
        },
        seatRequested:
          "{actor} pyysi maksullista käyttäjäpaikkaa työtilassa {workspace}",
        seatDenied:
          "{actor} hylkäsi käyttäjäpaikkapyyntösi työtilassa {workspace}",
        roleChanged: {
          member: "{actor} teki sinusta jäsenen työtilassa {workspace}",
          viewer: "{actor} teki sinusta katsojan työtilassa {workspace}",
        },
        downgraded: "{actor} muutti sinut katsojaksi työtilassa {workspace}",
        keepRecordingUntil: "Voit tallentaa {date} asti.",
        removed: "{actor} poisti sinut työtilasta {workspace}",
      },
      acceptErrors: {
        failed: "Kutsun hyväksyminen ei onnistunut",
        signedOut: "Kirjaudu sisään, niin voit hyväksyä kutsun",
        invalid: "Tämä kutsu on vanhentunut tai peruttu",
        emailMismatch: "Tämä kutsu on lähetetty toiseen sähköpostiosoitteeseen",
        alreadyMember: "Olet jo tässä työtilassa",
      },
    },
    mobileNav: {
      open: "Avaa valikko",
      close: "Sulje valikko",
      docs: "Dokumentaatio",
      star: "Anna tähti GitHubissa",
      signIn: "Kirjaudu sisään",
      getStarted: "Aloita",
    },
    skeletons: {
      avatar: "Profiilikuva",
      workspaceName: "Työtilan nimi",
      workspaceLogo: "Työtilan logo",
    },
  },
  library: {
    dashboard: {
      welcome: "Tervetuloa takaisin",
      welcomeName: "Tervetuloa takaisin, {name}",
      openCanvas: "Avaa piirtoalusta",
      newRecording: "Uusi tallenne",
      stats: {
        recordings: "Tallenteet",
        plusScreenshots:
          "one:Lisäksi {count} kuvakaappaus|other:Lisäksi {count} kuvakaappausta",
        noScreenshots: "Ei vielä kuvakaappauksia",
        views: "Katselukerrat",
        viewsAverage: "Keskimäärin {count}/tallenne",
        noViews: "Ei vielä katselukertoja",
        recorded: "Tallennettu",
        recordedAverage: "Keskimäärin {duration}/tallenne",
        nothingRecorded: "Mitään ei ole vielä tallennettu",
        recordingsLeft: "Tallenteita jäljellä",
        leftOfAllowance: "{left}/{allowance}",
        freePlanLimit: "Ilmainen tilaus, kukin enintään {minutes} min",
      },
      recordedTime: {
        minutes: "{minutes} min",
        hours: "{hours} h",
        hoursMinutes: "{hours} h {minutes} min",
      },
      recent: {
        title: "Viimeisimmät tallenteet",
        all: "Kaikki tallenteet",
        empty: "Tässä työtilassa ei ole vielä jaettu mitään.",
        views: "one:{n} katselukerta|other:{n} katselukertaa",
        comments: "one:{n} kommentti|other:{n} kommenttia",
        reactions: "one:{n} reaktio|other:{n} reaktiota",
      },
      start: {
        title: "Aloita tallennus {product}'lla",
        surfacesLabel: "Missä tallennat",
        surfaces: {
          extension: "Laajennus",
          desktop: "Työpöytäsovellus",
          canvas: "Piirtoalusta",
        },
        extension: {
          description:
            "Tallenna mikä tahansa välilehti, ikkuna tai koko näyttösi työkalupalkista, niin saat linkin, jonka voit jakaa kenelle tahansa.",
          record: "Tallenna nyt",
          addToChrome: "Lisää Chromeen",
        },
        desktop: {
          description:
            "Natiivi Mac-sovellus, joka tallentaa näyttösi ja kamerasi järjestelmän äänen kanssa, on tulossa. Siihen asti laajennus tallentaa minkä tahansa välilehden, ikkunan tai koko näyttösi.",
          download: "Lataa Macille",
          comingSoon: "Tulossa pian",
        },
        canvas: {
          description:
            "Tyhjä alusta, jolle voit piirtää kynillä, muodoilla ja tekstillä tallennuksen aikana, kun näytettävää sivua ei ole.",
        },
      },
    },
    recording: {
      pageTitle: "Tallenteet",
      count: "one:{n} tallenne|other:{n} tallennetta",
      untitled: "Nimetön tallenne",
      aiGenerated: "Tekoälyn luoma",
      processing: "Käsitellään",
      noMatches: "Mikään tallenne ei vastaa näitä suodattimia.",
      empty:
        "Et ole vielä luonut yhtään tallennelinkkiä. Tallenna CaptureFlow'n työpöytäsovelluksella, niin tallenteesi näkyvät täällä.",
      selectAll: "Valitse kaikki tallenteet",
      selected: "one:{n} tallenne valittu|other:{n} tallennetta valittu",
      open: "Avaa tallenne",
      edit: "Muokkaa tallennetta",
      share: "Jaa tallenne",
      delete: "Poista tallenne",
      deleteTitle: "Poistetaanko tämä tallenne?",
      deleteDescription:
        "Video ja sen linkki lakkaavat toimimasta heti. Tätä ei voi kumota.",
      deleteSelectedTitle:
        "one:Poistetaanko {n} tallenne?|other:Poistetaanko {n} tallennetta?",
    },
    screenshot: {
      pageTitle: "Kuvakaappaukset",
      count: "one:{n} kuvakaappaus|other:{n} kuvakaappausta",
      untitled: "Nimetön kuvakaappaus",
      numbered: "Kuvakaappaus {id}",
      noMatches: "Mikään kuvakaappaus ei vastaa näitä suodattimia.",
      empty:
        "Ei vielä kuvakaappauksia. Avaa CaptureFlow → Screenshot-välilehti → valitse kaapattavaksi Display, Window tai Area. Kuvakaappauksesi ilmestyy tänne automaattisesti.",
      selectAll: "Valitse kaikki kuvakaappaukset",
      selected: "one:{n} kuvakaappaus valittu|other:{n} kuvakaappausta valittu",
      open: "Avaa kuvakaappaus",
      edit: "Muokkaa kuvakaappausta",
      share: "Jaa kuvakaappaus",
      delete: "Poista kuvakaappaus",
      deleteTitle: "Poistetaanko tämä kuvakaappaus?",
      deleteDescription:
        "Kuva ja sen linkki lakkaavat toimimasta heti. Tätä ei voi kumota.",
      deleteSelectedTitle:
        "one:Poistetaanko {n} kuvakaappaus?|other:Poistetaanko {n} kuvakaappausta?",
    },
    filters: {
      access: "Käyttöoikeus",
      sort: "Lajittelu",
      current: "{label}: {value}",
      accessOptions: {
        all: "Kaikki käyttöoikeudet",
        public: "Julkinen",
        workspace: "Työtila",
        private: "Yksityinen",
      },
      sortOptions: {
        newest: "Uusimmasta vanhimpaan",
        oldest: "Vanhimmasta uusimpaan",
        views: "Katsotuimmat",
      },
    },
    card: {
      select: "Valitse {title}",
      moreActions: "Lisää toimintoja",
      rename: "Nimeä uudelleen",
      unknownAuthor: "Tuntematon",
    },
    selection: {
      deleteDescription: "Niiden linkit lakkaavat toimimasta heti.",
      deleteFailed:
        "{failed}/{count} kohteen poisto epäonnistui. Muut on poistettu.",
      clear: "Tyhjennä",
    },
    pager: {
      label: "Sivut",
      previous: "Edellinen sivu",
      next: "Seuraava sivu",
    },
    visibility: {
      label: "Näkyvyys",
      labels: {
        public: "Julkinen",
        workspace: "Työtila",
        private: "Yksityinen",
      },
      descriptions: {
        public: "Kuka tahansa, jolla on linkki, voi katsoa",
        workspace: "Vain työtilan kirjautuneet jäsenet voivat katsoa",
        private: "Vain sinä voit katsoa",
      },
      workspaceNamed: "Työtila · {name}",
    },
    share: {
      title: "Jaa",
      embed: "Upota",
      embedPublic: "Toistuu kaikkialla, minne koodi liitetään.",
      embedRestricted: "Toistuu vain niille, jotka voivat jo avata linkin.",
      copyCode: "Kopioi koodi",
      generalAccess: "Yleinen käyttöoikeus",
      generalAccessCurrent: "Yleinen käyttöoikeus: {access}",
      copyLink: "Kopioi linkki",
      linkCopied: "Linkki kopioitu",
      shareAt: "Jaa kohdasta {time}",
    },
    editableTitle: {
      label: "Tallenteen otsikko",
      rename: "Nimeä tallenne uudelleen",
    },
  },
  members: {
    title: "Jäsenet",
    databaseUnavailable: "Tietokanta ei ole käytettävissä.",
    role: "Rooli",
    status: "Tila",
    roles: {
      owner: "Ylläpitäjä",
      member: "Jäsen",
      viewer: "Katsoja",
    },
    roleHints: {
      member: {
        does: "Tallentaa tähän työtilaan.",
        costs: "Maksullinen käyttäjäpaikka Light- ja Pro-tilauksissa.",
      },
      viewer: {
        does: "Katsoo ja kommentoi.",
        costs: "Aina ilmainen.",
      },
    },
    statuses: {
      active: "Aktiivinen",
      invited: "Kutsuttu",
    },
    seatSummary: {
      members: "one:{n} jäsen|other:{n} jäsentä",
      viewers: "one:{n} katsoja|other:{n} katsojaa",
      paidSeats:
        "one:{n} maksullinen käyttäjäpaikka|other:{n} maksullista käyttäjäpaikkaa",
      membersAndViewers: "{members} ja {viewers}",
      onPaidSeats:
        "{people}, käytössä {seats}. Jokainen jäsen vie käyttäjäpaikan; katsojat ovat ilmaisia.",
      membersFree: "{people}. Jäsenet ovat ilmaisia tässä tilauksessa.",
      freePlan:
        "{people}. Ilmainen tilaus: jokainen jäsen saa {recordings} tallennetta, kukin enintään {minutes} minuuttia; katsojat katsovat ja kommentoivat.",
      planTitle: "{plan}-tilaus",
      paidPlanTitle: "Maksullinen tilaus",
      freePlanTitle: "Ilmainen tilaus",
      upgrade: "Päivitä työtila",
    },
    table: {
      intro: "Jäsenet tallentavat tänne; katsojat katsovat ja kommentoivat.",
      ownerIntro:
        "Omistajana voit kutsua ja poistaa henkilöitä sekä muuttaa rooleja.",
      searchPlaceholder: "Nimi tai sähköpostiosoite",
      searchLabel: "Hae jäseniä",
      allRoles: "Kaikki roolit",
      everyone: "Kaikki",
      columns: {
        name: "Nimi",
        dateAdded: "Lisätty",
        email: "Sähköpostiosoite",
        actions: "Toiminnot",
      },
      empty: "Kukaan ei vastaa näitä suodattimia.",
      downgradeNote: "Katsoja {date} alkaen · {keep}",
      keepAsMember: "Pidä jäsenenä",
      revoke: "Peru kutsu",
    },
    seatRequests: {
      title: "Käyttäjäpaikkapyynnöt",
      description:
        "Nämä katsojat pyysivät tallennusoikeutta. Hyväksyminen tekee heistä jäseniä.",
      descriptionPaid:
        "Nämä katsojat pyysivät tallennusoikeutta. Hyväksyminen tekee heistä jäseniä, mikä lisää maksullisen käyttäjäpaikan.",
      asked: "{email} · pyysi {date}",
      deny: "Hylkää",
      approve: "Hyväksy",
    },
    seatConfirm: {
      addTitle: "Annetaanko käyttäjälle {name} maksullinen käyttäjäpaikka?",
      addBody:
        "Jäsenet tallentavat, joten jokainen heistä on maksullinen käyttäjäpaikka. {plan}-tilauksesi muuttuu {seats} käyttäjäpaikasta {nextSeats} käyttäjäpaikkaan, ja hinnaksi tulee {after} kuukaudessa (nyt {before}).",
      addBodyYearly:
        "Jäsenet tallentavat, joten jokainen heistä on maksullinen käyttäjäpaikka. {plan}-tilauksesi muuttuu {seats} käyttäjäpaikasta {nextSeats} käyttäjäpaikkaan, ja hinnaksi tulee {after} kuukaudessa (nyt {before}), laskutus vuosittain.",
      addInvoice: "Tämän laskutuskauden loppuosa lisätään seuraavaan laskuusi.",
      addConfirm: "Lisää maksullinen käyttäjäpaikka",
      removeTitle: "Muutetaanko {name} katsojaksi?",
      removeBody:
        "{name} voi tallentaa {date} asti eli maksamasi kauden loppuun. Sen jälkeen hänestä tulee katsoja, joka voi katsoa ja kommentoida mutta ei tallentaa.",
      removePlan:
        "Siitä alkaen {plan}-tilauksesi muuttuu {seats} käyttäjäpaikasta {nextSeats} käyttäjäpaikkaan, ja hinnaksi tulee {after} kuukaudessa (nyt {before}).",
      removePlanYearly:
        "Siitä alkaen {plan}-tilauksesi muuttuu {seats} käyttäjäpaikasta {nextSeats} käyttäjäpaikkaan, ja hinnaksi tulee {after} kuukaudessa (nyt {before}), laskutus vuosittain.",
      removeConfirm: "Muuta katsojaksi",
    },
    remove: {
      label: "Poista {name} työtilasta",
      title: "Poistetaanko {name} työtilasta {workspace}?",
      body: "Hän menettää käyttöoikeutensa heti. Hänen tallenteensa ja kuvakaappauksensa säilyvät työtilassa.",
      freesSeat:
        "Samalla hänen maksullinen käyttäjäpaikkansa vapautuu: tilauksesi muuttuu {seats} käyttäjäpaikasta {nextSeats} käyttäjäpaikkaan.",
    },
    leave: {
      button: "Poistu",
      title: "Poistutko työtilasta {workspace}?",
      body: "Menetät pääsyn sen tallenteisiin ja kuvakaappauksiin. Kaikki siellä tallentamasi säilyy työtilassa.",
      comeBack: "Jos haluat palata, jonkun on kutsuttava sinut uudelleen.",
      confirm: "Poistu työtilasta",
    },
    invite: {
      trigger: "Kutsu jäseniä",
      title: "Kutsu jäseniä työtilaan {workspace}",
      titleOwnWorkspace: "Kutsu jäseniä työtilaasi",
      description:
        "He saavat sähköpostiinsa linkin, joka vanhenee 7 päivässä. Varmista, että he kirjautuvat sisään samalla osoitteella.",
      removeEmail: "Poista {email}",
      addEmails: "Lisää sähköpostiosoitteita",
      separatorHint: "Erota osoitteet välilyönnillä, pilkulla tai Enterillä.",
      paidSeatNote:
        "Jokainen kutsun hyväksyvä jäsen lisää {plan}-tilaukseesi maksullisen käyttäjäpaikan, {price} kuukaudessa kultakin. Tämän kauden loppuosa lisätään seuraavaan laskuusi.",
      noEmails: "Lisää vähintään yksi sähköpostiosoite",
      invalidEmails: "Virheellinen sähköpostiosoite: {emails}",
      failed: "Epäonnistui",
      sent: "one:{n} kutsu lähetetty.|other:{n} kutsua lähetetty.",
      sending: "Lähetetään…",
      submit: "Lähetä kutsut",
    },
    actions: {
      emailRequired: "Anna sähköpostiosoite",
      emailInvalid: "Tämä ei näytä kelvolliselta sähköpostiosoitteelta",
      ownWorkspace: "Olet jo omassa työtilassasi",
      alreadyMember: "Hän on jo tämän työtilan jäsen",
      emailNotSent:
        "Kutsu luotiin, mutta sähköpostin lähetys epäonnistui. Kopioi linkki odottavien kutsujen luettelosta.",
      invitationSent: "Kutsu lähetetty osoitteeseen {email}",
      alreadyRecording: "Voit jo tallentaa täällä",
    },
  },
  settings: {
    saved: "Tallennettu",
    errors: {
      ownerOnly: "Vain työtilan omistaja voi muuttaa tätä",
      databaseUnavailable: "Tietokanta ei ole käytettävissä",
      saveFailed: "Tallennus ei onnistunut – yritä uudelleen",
    },
    upload: {
      uploading: "Lähetetään…",
      missing: "Valitse kuvatiedosto",
      failed: "Lähetys epäonnistui",
      failedReason: "Lähetys epäonnistui: {reason}",
    },
    personal: {
      title: "Omat asetukset",
      account: {
        title: "Tili",
        description: "Miten näyt tiimiläisille ja tallenteitasi katsoville.",
      },
      preferences: {
        title: "Mieltymykset",
        description:
          "Miltä CaptureFlow näyttää ja millä kielellä se sinulle näkyy.",
      },
      languageDescription: "Kieli, jolla CaptureFlow näytetään sinulle.",
    },
    avatar: {
      label: "Profiilikuva",
      change: "Vaihda profiilikuva",
      removing: "Poistetaan…",
      hint: "JPG, PNG, WebP tai GIF. Enintään 2 Mt.",
      tooLarge: "Profiilikuvan koko saa olla enintään 2 Mt",
      badType: "Profiilikuvan on oltava PNG, JPEG, WebP tai GIF",
    },
    account: {
      name: {
        label: "Koko nimi",
        placeholder: "Nimesi",
        description:
          "Näkyy tallenteissa, kuvakaappauksissa ja toimintariveillä.",
        required: "Nimi on pakollinen.",
        updateFailed: "Nimen päivitys ei onnistunut.",
      },
      email: {
        label: "Sähköpostiosoite",
        description:
          "Käytetään kirjautumiseen. Jos haluat vaihtaa sen, ota yhteyttä tukeen.",
      },
      userId: {
        label: "Käyttäjätunniste",
        copy: "Kopioi käyttäjätunniste",
        description: "Mainitse tämä, kun otat yhteyttä tukeen.",
      },
      saveChanges: "Tallenna muutokset",
    },
    workspace: {
      title: "Työtilan asetukset",
      tabs: {
        label: "Asetusten osiot",
        general: "Yleiset",
        security: "Tietoturva",
      },
      general: {
        title: "Yleiset",
        description:
          "Nimi ja logo, joista tämä työtila tunnistetaan työtilavalitsimessa, jäsensivulla ja jakolinkkien esikatseluissa.",
      },
      name: {
        title: "Työtilan nimi",
        description: "Nimi, jolla työtilasi näkyy.",
        empty: "Työtilan nimi ei voi olla tyhjä",
        tooLong: "Työtilan nimi on liian pitkä (enintään {max} merkkiä)",
      },
      logo: {
        title: "Työtilan logo",
        description:
          "Näkyy työtilasi nimen vieressä. PNG, JPEG, WebP, GIF tai SVG, enintään 2 Mt.",
        upload: "Lähetä logo",
        replace: "Vaihda logo",
        tooLarge: "Logon koko saa olla enintään 2 Mt",
        badType: "Logon on oltava PNG, JPEG, WebP, GIF tai SVG",
      },
      permissions: {
        title: "Oletusoikeudet",
        description:
          "Asetukset, joita käytetään työtilan jokaisessa uudessa tallenteessa ja kuvakaappauksessa.",
      },
      recordingAccess: {
        title: "Tallennusoikeus",
        description:
          "Päätä, voivatko tiimiläiset lisätä tallenteita ja kuvakaappauksia tähän työtilaan.",
        allow: {
          title: "Salli tiimiläisten lisätä tänne",
          body: "Jäsenet voivat tallentaa tähän työtilaan.",
        },
        ownerOnly: {
          title: "Vain työtilan omistaja",
          body: "Tiimiläisten lähetykset menevät heidän henkilökohtaiseen työtilaansa.",
        },
      },
    },
    devices: {
      title: "Yhdistetyt laitteet",
      count: "one:{n} laite kirjautuneena|other:{n} laitetta kirjautuneena",
      empty:
        "Ei yhdistettyjä laitteita. Avaa CaptureFlow'n työpöytäsovellus ja yhdistä tämä tili valitsemalla tallennuspalkista Sign in.",
      unlabelled: "Nimetön laite",
      added: "Lisätty {date}",
      addedLastUsed: "Lisätty {date} · käytetty viimeksi {lastUsed}",
      neverUsed: "Ei käytetty koskaan",
      revoke: {
        action: "Poista käyttöoikeus",
        title: "Kirjataanko tämä laite ulos?",
        description:
          "Sen on kirjauduttava uudelleen sisään, jotta sillä voi hallita tallenteita.",
      },
    },
  },
  billing: {
    chargedInUsd: "Veloitetaan Yhdysvaltain dollareina.",
    shownIn:
      "Hinnat näytetään valuutassa {currency}. Veloitus tapahtuu Yhdysvaltain dollareina.",
    page: {
      title: "Laskutus",
      subtitle: "Tilauksesi ja se, mitä olet siitä käyttänyt.",
      workspaceLabel: "Työtila · {name}",
      manageSubscription: "Hallitse tilausta",
      upgradeWorkspace: "Päivitä työtila",
      storage: "Työtilan tallennustila",
      usedOfLimit: "{used} / {limit}",
      usedNoLimit: "{used} – ei rajaa",
    },
    loading: {
      plan: "Tilaus",
      usage: "Käyttö",
    },
    counts: {
      members: "one:{n} jäsen|other:{n} jäsentä",
      paidSeats:
        "one:{n} maksullinen käyttäjäpaikka|other:{n} maksullista käyttäjäpaikkaa",
      freeViewers: "one:{n} ilmainen katsoja|other:{n} ilmaista katsojaa",
    },
    plan: {
      free: "Ilmainen",
      paid: "Maksullinen",
      billedMonthly: "Laskutus kuukausittain",
      billedYearly: "Laskutus vuosittain",
      freeSummary:
        "{members} · enintään {recordings} tallennetta henkilöä kohden, kukin enintään {minutes} minuuttia, datansäästölaatu",
    },
    status: {
      onTrial: "Kokeilujakso",
      active: "Aktiivinen",
      paused: "Keskeytetty",
      pastDue: "Maksu epäonnistui",
      unpaid: "Maksamatta",
      cancelled: "Peruttu",
      expired: "Päättynyt",
    },
    details: {
      youPay: "Maksat",
      amountPerMonth: "{amount} kuukaudessa",
      amountPerYear: "{amount} vuodessa",
      seatsMonthly:
        "one:{n} käyttäjäpaikka × {price} kuukaudessa|other:{n} käyttäjäpaikkaa × {price} kuukaudessa",
      seatsYearly:
        "one:{n} käyttäjäpaikka × {price} kuukaudessa, {total} kuukaudessa, laskutus vuosittain|other:{n} käyttäjäpaikkaa × {price} kuukaudessa, {total} kuukaudessa, laskutus vuosittain",
      nextPayment: "Seuraava maksu",
      ends: "Päättyy",
      endOfPeriod: "Tämän kauden lopussa",
      amountOnDate: "{amount}, {date}",
      firstPaymentPending: "Kun ensimmäinen maksu on käsitelty",
      estimate: "{base} · {change}, arvio",
      baseForSeats:
        "one:{n} käyttäjäpaikka: {amount}|other:{n} käyttäjäpaikkaa: {amount}",
      seatsAdded:
        "one:{n} tällä kaudella lisätty käyttäjäpaikka: {amount}|other:{n} tällä kaudella lisättyä käyttäjäpaikkaa: {amount}",
      seatsRemoved:
        "one:{n} tällä kaudella poistettu käyttäjäpaikka: hyvitys {amount}|other:{n} tällä kaudella poistettua käyttäjäpaikkaa: hyvitys {amount}",
      seatChanges: "tämän kauden käyttäjäpaikkamuutokset: {amount}",
      seats: "Käyttäjäpaikat",
      seatsAndViewers: "{seats}, {viewers}",
      billedTo: "Laskun saaja",
      paymentMethod: "Maksutapa",
      cardEnding: "{brand}, päättyy numeroihin {last4}",
      card: "Kortti",
      updateCard: "Päivitä",
    },
    switchPlan: {
      switchTo: "Vaihda {plan}-tilaukseen",
      title: "Vaihdetaanko {plan}-tilaukseen?",
      priceMonthly:
        "one:{n} käyttäjäpaikkasi hinnaksi tulee {after} kuukaudessa (nyt {before}).|other:{n} käyttäjäpaikkasi hinnaksi tulee {after} kuukaudessa (nyt {before}).",
      priceYearly:
        "one:{n} käyttäjäpaikkasi hinnaksi tulee {after} kuukaudessa (nyt {before}), laskutus vuosittain.|other:{n} käyttäjäpaikkasi hinnaksi tulee {after} kuukaudessa (nyt {before}), laskutus vuosittain.",
      benefits:
        "{plan} tallentaa kaikilla laaduilla, enintään 60 fps, ja tuo mukaan tekoälymuokkauksen.",
      timing:
        "Se alkaa heti. Tämän laskutuskauden loppuosan erotus lisätään seuraavaan laskuusi.",
      errors: {
        failed: "Tilauksen vaihtaminen ei onnistunut",
        unknownPlan: "Tuntematon tilaus",
        billingUnavailable: "Laskutus ei ole käytettävissä",
        noSubscription: "Tällä työtilalla ei ole aktiivista tilausta",
        cancelled: "Jatka tilausta, ennen kuin vaihdat sitä",
        unavailable: "Tilausta ei voi vaihtaa juuri nyt",
        rejected: "Laskutus ei hyväksynyt muutosta. Yritä uudelleen.",
      },
    },
    upgrade: {
      title: "Päivitä työtila {name}",
      billingCycle: "Laskutusväli",
      cycles: {
        monthly: "Kuukausittain",
        annual: "Vuosittain",
      },
      annualSaving: "säästä {percent} %",
      seatPicker: {
        title: "Kuka saa maksullisen käyttäjäpaikan",
        selected: "{seats}/{total}",
        description:
          "Valitut henkilöt tallentavat, ja heistä laskutetaan. Kaikki muut ovat ilmaisia katsojia, jotka voivat katsoa, kommentoida ja reagoida mutta eivät tallentaa. Roolit muuttuvat, kun päivität.",
        selectAll: "Valitse kaikki",
        clear: "Tyhjennä",
        you: "(sinä)",
        paidSeat: "Maksullinen käyttäjäpaikka",
        viewer: "Katsoja",
      },
      perMonth: "kuukaudessa",
      seatsPrice:
        "one:{n} käyttäjäpaikka × {price}|other:{n} käyttäjäpaikkaa × {price}",
      viewersFree: "one:{n} katsoja ilmaiseksi|other:{n} katsojaa ilmaiseksi",
      priceWithViewers: "{seats}, {viewers}",
      priceYearly: "{seats}, laskutus vuosittain",
      priceWithViewersYearly: "{seats}, {viewers}, laskutus vuosittain",
      upgradeTo: "Päivitä {plan}-tilaukseen",
      checkoutUnavailable: "Kassaa ei ole määritetty",
    },
    requestSeat: {
      request: "Pyydä tallennusoikeutta",
      requested: "Käyttäjäpaikkaa pyydetty",
      hint: "Olet täällä katsoja. Pyydä omistajalta maksullinen käyttäjäpaikka, niin voit tallentaa.",
      requestedHint:
        "Pyyntö on lähetetty omistajalle. Voit tallentaa, kun hän hyväksyy sen.",
      failed: "Pyynnön lähetys ei onnistunut",
    },
  },
  actions: {
    missingSlug: "Slug puuttuu",
    recordingNotFound: "Tallennetta ei löytynyt",
    backgroundMissing: "Valitse ladattava kuva",
    backgroundTooLarge: "Kuvan enimmäiskoko on 5 Mt",
    backgroundBadType: "Käytä PNG-, JPEG- tai WebP-kuvaa",
    backgroundFailed: "Kuvaa ei voitu ladata. Yritä uudelleen.",
    invalidVisibility: "Virheellinen näkyvyys",
    deleteVideoFailed: "Videotiedoston poisto ei onnistunut: {reason}",
    transcriptNotFound: "Litterointia ei löytynyt",
    transcriptEmpty:
      "Litterointia ei voi jättää tyhjäksi. Nollaa se sen sijaan.",
    missingTokenId: "Tokenin tunniste puuttuu",
    tokenNotFound: "Tokenia ei löytynyt",
    missingScreenshotId: "Kuvakaappauksen tunniste puuttuu",
    screenshotNotFound: "Kuvakaappausta ei löytynyt",
    missingImageBytes: "Kuvan data puuttuu",
    screenshotTooLarge:
      "Muokattu kuvakaappaus ylittää kuvakaappauksen enimmäiskoon.",
    saveScreenshotFailed: "Kuvakaappauksen tallennus ei onnistunut: {reason}",
    saveFailed: "Tallennus epäonnistui: {reason}",
    invalidCanvasDimensions:
      "Tallennus epäonnistui: virheelliset kuva-alueen mitat",
  },
  viewer: {
    meta: {
      defaultTitle: "{product}-tallenne",
      defaultDescription: "{product}'lla jaettu näyttötallenne.",
      preparingTitle: "Tallennetta valmistellaan… – {product}",
      notFoundTitle: "Ei löytynyt",
      description:
        "{product}'lla jaettu näyttötallenne. Katso se selaimessasi ilman rekisteröitymistä.",
      descriptionTimed:
        "{product}'lla jaettu näyttötallenne, kesto {duration}. Katso se selaimessasi ilman rekisteröitymistä.",
    },
    loading: "Ladataan tallennetta…",
    nav: {
      download: "Lataa",
    },
    authPrompt: {
      pricing: "Hinnat",
      logIn: "Kirjaudu sisään",
      getStarted: "Aloita",
      getFree: "Hanki {product} ilmaiseksi",
    },
    postedBy: {
      label: "Julkaissut",
      someone: "Joku",
    },
    views: {
      count: "one:{count} katselukerta|other:{count} katselukertaa",
      showWhoWatched: "{views}, näytä katsojat",
      viewers: "Katsojat",
      emptyTitle: "Ei vielä katselukertoja",
      emptyDescription: "Jaa linkki, niin sen katsoneet näkyvät täällä.",
      signedInViewer: "Kirjautunut katsoja",
      anonymous: "Anonyymi",
    },
    actions: {
      share: "Jaa",
      visibilityFailed: "Näkyvyyden päivitys ei onnistunut",
      deleteFailed: "Tallenteen poisto ei onnistunut",
    },
    requestAccess: {
      title: "Pyydä käyttöoikeutta tämän videon katsomiseen",
      notSharedBy: "{name} ei ole vielä jakanut tätä tallennetta kanssasi.",
      notSharedByOwner:
        "Omistaja ei ole vielä jakanut tätä tallennetta kanssasi.",
      signInHint:
        "Kirjaudu sisään työsähköpostillasi – jos kuulut jo omistajan tiimiin, pääset suoraan sisään.",
      signIn: "Jatka kirjautumalla sisään",
      sentTitle: "Pyyntö lähetetty",
      sentDescription:
        "Ilmoitimme omistajalle. Saat sähköpostin, jos hän myöntää käyttöoikeuden.",
      askingAs: "Pyydät osoitteella {email}",
      noteLabel: "Lisää viesti {optional}",
      noteOptional: "(valinnainen)",
      notePlaceholder:
        "Hei, haluaisin katsoa tämän tallenteen eilisestä katselmuksesta.",
      sending: "Lähetetään…",
      submit: "Pyydä käyttöoikeutta",
      failed: "Jokin meni vikaan. Yritä hetken kuluttua uudelleen.",
    },
    pending: {
      preparingTitle: "Tallennettasi valmistellaan…",
      preparingDescription:
        "Lähetys on vielä kesken. Tämä sivu päivittyy itsestään, kun tallenne on valmis.",
      generatingTitle: "Videotasi luodaan…",
      generatingDescription:
        "Tämä voi kestää muutaman minuutin, joten hae kahvia tai välipala ☕️🍪 Sivu päivittyy itsestään, kun video on valmis.",
      failedTitle: "Tämän tallenteen lähetys jäi kesken",
      failedDescription:
        "Linkki luotiin, mutta video ei koskaan saapunut. Kokeile linkkiä uudelleen minuutin kuluttua tai tee uusi tallenne.",
      comment: "Kommentoi",
    },
    upgradeBanner: {
      message:
        "{usage} ilmaisessa tilauksessa. Päivitä tilaus, niin saat rajattomasti tallenteita täydellä laadulla.",
      usage: "other:{used}/{n} tallenteesta käytetty",
    },
    editPanel: {
      editTitle: "Muokkaa videota",
      editDescription:
        "Lyhennä, leikkaa, muuta ulkoasua ja korjaa tekstitys editorissa.",
      downloadTitle: "Lataa video",
      downloadDescription: "Koko tallenne MP4-tiedostona.",
      copyEmbed: "Kopioi upotuskoodi",
      embedCopied: "Upotuskoodi kopioitu",
      embedDescription: "Liitä soitin mille tahansa verkkosivulle.",
    },
    notFound: {
      title: "Tallennetta ei löytynyt",
      description:
        "Tämä linkki on vanhentunut, tai sitä ei ole koskaan ollut. Ilmaisten tilien tallenteet säilytetään 30 päivää viimeisestä katselukerrasta.",
      madeWith: "Tehty {product}'lla",
    },
  },
  activity: {
    sidebar: {
      label: "Tallenteen sivupalkki",
      activityTab: "Toiminta",
      transcriptTab: "Litterointi",
      toolsTab: "Työkalut",
    },
    you: "Sinä",
    anonymous: "Anonyymi",
    jumpToMoment: "Siirry tähän kohtaan",
    empty: {
      title: "Ei vielä toimintaa",
      description:
        "Katsojien reaktiot ja kommentit näkyvät täällä sitä mukaa kuin niitä tulee.",
      firstTitle: "Kommentoi ensimmäisenä",
      firstTitleNamed: "Kommentoi ensimmäisenä, {name}",
      hint: "Vastaa painamalla {key} tai jätä kommentti tämän paneelin alareunaan.",
      focusComposer: "Siirry kommenttikenttään",
    },
    composer: {
      signIn: "Kirjaudu sisään, niin voit reagoida ja kommentoida",
      placeholder: "Jätä kommentti…",
      mention: "Mainitse joku",
      noOneToMention: "Kukaan ei ole vielä reagoinut tai kommentoinut",
      insertEmoji: "Lisää emoji",
      searchEmoji: "Hae emojia",
      posting: "Lähetetään…",
      submitAt: "Kommentoi kohtaan {time}",
      postFailed: "Kommentin lähetys ei onnistunut",
    },
    comment: {
      delete: "Poista kommentti",
      deleteFailed: "Kommentin poisto ei onnistunut",
    },
    reaction: {
      count: "one:{n} reaktio|other:{n} reaktiota",
      delete: "Poista reaktio",
      deleteMany: "one:Poista {n} reaktio|other:Poista {n} reaktiota",
      deleteFailed: "Reaktion poisto ei onnistunut",
    },
    transcript: {
      pendingTitle: "Litteroidaan…",
      pendingDescription: "Litterointi näkyy täällä heti, kun se on valmis.",
      failedTitle: "Litterointi jäi kesken",
      failedDescription: "Jokin meni vikaan tämän tallenteen litteroinnissa.",
      noneTitle: "Ei litterointia",
      noneOwnerDescription:
        "Tallenna mikrofoni päällä, niin litterointi kirjoitetaan puolestasi.",
      noneViewerDescription: "Tämä tallenne tehtiin ilman mikrofonia.",
      searchLabel: "Hae litteroinnista",
      noMatches: "Ei osumia.",
    },
    saveFailed: "Tallennus ei onnistunut. Yritä uudelleen.",
    summary: {
      title: "Yhteenveto",
      add: "Lisää",
      placeholder: "Mitä tässä tallenteessa tapahtuu?",
      empty: "Ei vielä yhteenvetoa.",
      emptyAction: "Lisää yhteenveto",
    },
    chapters: {
      title: "Luvut",
      count: "one:{n} luku|other:{n} lukua",
      addAtPlayhead: "Lisää toistokohtaan",
      defaultTitle: "Luku {n}",
      editHint: "Yksi luku riviä kohden, muodossa {short} tai {long}.",
      editHintShort: "M:SS Otsikko",
      editHintLong: "H:MM:SS Otsikko",
      editPlaceholder: "0:00 Johdanto\n0:30 Esittely\n1:20 Lopetus",
      playing: "Toistetaan",
      remove: "Poista luku",
      empty: "Ei vielä lukuja.",
      emptyAction: "Lisää luku toistokohtaan",
    },
  },
  player: {
    overlay: {
      watchAgain: "Katso uudelleen",
    },
    captions: {
      track: "Tekstitys",
      size: "Koko",
      position: "Sijainti",
      sizes: {
        small: "Pieni",
        medium: "Keskikokoinen",
        large: "Suuri",
      },
      positions: {
        top: "Ylhäällä",
        bottom: "Alhaalla",
      },
    },
    reactionBar: {
      comment: "Kommentoi",
      leaveComment: "Jätä kommentti",
    },
    reactions: {
      heart: "Sydän",
      thumbsUp: "Peukku ylös",
      fire: "Tuli",
      clap: "Taputus",
      raisedHands: "Kädet ylhäällä",
      eyes: "Silmät",
    },
    embed: {
      title: "{product}-tallenne",
    },
    controls: {
      buttons: {
        play: "Toista",
        pause: "Keskeytä",
        replay: "Toista uudelleen",
        mute: "Mykistä",
        unmute: "Poista mykistys",
      },
      seek: {
        forward: "Kelaa {seconds} sekuntia eteenpäin",
        backward: "Kelaa {seconds} sekuntia taaksepäin",
      },
      fullscreen: {
        enter: "Siirry koko näytön tilaan",
        exit: "Poistu koko näytön tilasta",
      },
      captions: {
        enable: "Ota tekstitys käyttöön",
        disable: "Poista tekstitys käytöstä",
      },
      pip: {
        enter: "Siirry kuva kuvassa -tilaan",
        exit: "Poistu kuva kuvassa -tilasta",
      },
      cast: {
        start: "Aloita suoratoisto",
        stop: "Lopeta suoratoisto",
        connecting: "Yhdistetään",
      },
      airplay: {
        start: "Aloita AirPlay",
        stop: "Lopeta AirPlay",
      },
      slider: {
        seek: "Kelaa",
      },
      time: {
        current: "Nykyinen aika",
        duration: "Kesto",
        position: "{current} / {duration}",
        unknown: "Mediaa ei ole ladattu, aika tuntematon.",
      },
      playback: {
        rate: "Toistonopeus {rate}",
      },
      volume: {
        mutedValue: "{percent}, mykistetty",
        muted: "Mykistetty",
        label: "Äänenvoimakkuus",
        value: "Äänenvoimakkuus {value}",
      },
      status: {
        captionsOn: "Tekstitys päällä",
        captionsOff: "Tekstitys pois",
        paused: "Keskeytetty",
        playing: "Toistetaan",
        fullscreen: "Koko näyttö",
        pip: "Kuva kuvassa",
        exitPip: "Poistu kuva kuvassa -tilasta",
        seekedTo: "Kelattu kohtaan {time}",
      },
      container: {
        label: "Mediasoitin",
      },
      errors: {
        aborted: "Keskeytit median toiston ennen sen päättymistä.",
        network: "Mediaa ei voitu ladata verkko- tai palvelinongelman vuoksi.",
        decode:
          "Mediaa ei voitu toistaa. Se voi olla vioittunut, tai selaimesi ei ehkä tue sen muotoa.",
        source:
          "Mediaa ei voitu ladata. Se ei ehkä ole saatavilla, tai selaimesi ei ehkä tue sen muotoa.",
        encrypted:
          "Mediaa ei voitu toistaa, koska sen salausta ei voitu purkaa.",
        unplayable: "Soitin ei tue tätä mediaa.",
        title: "Jokin meni vikaan.",
        unexpected: "Tapahtui odottamaton virhe.",
      },
      common: {
        ok: "OK",
      },
      menu: {
        settings: "Asetukset",
        quality: "Laatu",
        audio: "Ääni",
        speed: "Nopeus",
        captions: "Tekstitys",
        playbackRate: "Toistonopeus",
        off: "Pois",
        auto: "Automaattinen",
        autoWithLabel: "Automaattinen ({label})",
      },
    },
  },
  screenshotView: {
    page: {
      defaultTitle: "{product}-kuvakaappaus",
      description: "{product}'lla jaettu kuvakaappaus.",
      madeWith: "Tehty {product}'lla",
      loading: "Ladataan kuvakaappausta…",
    },
    authPrompt: {
      pricing: "Hinnat",
      logIn: "Kirjaudu sisään",
      getStarted: "Aloita",
      getFree: "Hanki {product} ilmaiseksi",
    },
    actions: {
      edit: "Muokkaa kuvakaappausta",
      share: "Jaa",
      shareTitle: "Jaa kuvakaappaus",
      copyLink: "Kopioi linkki",
      linkCopied: "Linkki kopioitu",
      more: "Lisää toimintoja",
      delete: "Poista kuvakaappaus",
      deleteTitle: "Poistetaanko tämä kuvakaappaus?",
      deleteDescription:
        "Kuva ja sen linkki lakkaavat toimimasta heti. Tätä ei voi kumota.",
      visibilityFailed: "Näkyvyyden päivitys ei onnistunut",
      deleteFailed: "Kuvakaappauksen poisto ei onnistunut",
    },
    zoom: {
      expand: "Suurenna kuva",
      minimize: "Pienennä kuva",
    },
    requestAccess: {
      title: "Pyydä käyttöoikeutta tämän kuvakaappauksen katsomiseen",
      notSharedBy: "{name} ei ole vielä jakanut tätä kuvakaappausta kanssasi.",
      notSharedByOwner:
        "Omistaja ei ole vielä jakanut tätä kuvakaappausta kanssasi.",
      signInHint:
        "Kirjaudu sisään työsähköpostillasi – jos kuulut jo omistajan tiimiin, pääset suoraan sisään.",
      signIn: "Jatka kirjautumalla sisään",
      sentTitle: "Pyyntö lähetetty",
      sentDescription:
        "Ilmoitimme omistajalle. Saat sähköpostin, jos hän myöntää käyttöoikeuden.",
      askingAs: "Pyydät osoitteella {email}",
      noteLabel: "Lisää viesti {optional}",
      noteOptional: "(valinnainen)",
      notePlaceholder:
        "Hei, haluaisin kopion tästä kuvakaappauksesta suunnittelukatselmuksesta.",
      sending: "Lähetetään…",
      submit: "Pyydä käyttöoikeutta",
      failed: "Jokin meni vikaan. Yritä hetken kuluttua uudelleen.",
    },
    notFound: {
      title: "Kuvakaappausta ei löytynyt",
      description:
        "Tämä linkki on vanhentunut, tai sitä ei ole koskaan ollut. Ilmaisten tilien kuvakaappaukset säilytetään 30 päivää viimeisestä katselukerrasta.",
    },
  },
  recordingEditor: {
    skeleton: {
      label: "Avataan editoria",
      status: "Avataan editoria…",
    },
    preparing: {
      title: "Tallennetta valmistellaan…",
      description:
        "Tallenteen lähetys on vielä kesken. Tämä sivu päivittyy automaattisesti, kun tallenne on valmis.",
    },
    failed: {
      title: "Tallenteen lähetys epäonnistui.",
      description: "Kokeile tallentaa uudelleen työpöytäsovelluksella.",
    },
    saveFailed: "Tallennus ei onnistunut",
    topBar: {
      back: "Takaisin tallenteeseen",
      status: {
        idle: "Muokkaukset tallentuvat automaattisesti",
        saved: "Tallennettu",
        error: "Tallennus ei onnistunut",
      },
      versionHistory: "Versiohistoria (tulossa pian)",
      undo: "Kumoa",
      undoShortcut: "Kumoa ({key})",
      redo: "Tee uudelleen",
      redoShortcut: "Tee uudelleen ({key})",
      finish: "Valmis",
    },
    panels: {
      label: "Editorin paneelit",
      tabs: {
        transcript: "Litterointi",
        design: "Ulkoasu",
        camera: "Kamera",
        audio: "Ääni",
        details: "Tiedot",
      },
      hide: {
        transcript: "Piilota litterointi",
        design: "Piilota ulkoasu",
        camera: "Piilota kamera",
        audio: "Piilota ääni",
        details: "Piilota tiedot",
      },
      show: {
        transcript: "Näytä litterointi",
        design: "Näytä ulkoasu",
        camera: "Näytä kamera",
        audio: "Näytä ääni",
        details: "Näytä tiedot",
      },
    },
    toggleOn: "Päällä",
    background: {
      title: "Tausta",
      gradients: "Liukuvärit",
      none: "Ei mitään",
      noBackground: "Ei taustaa",
      upload: "Lataa kuva",
      uploading: "Ladataan…",
      uploadedImage: "Oma kuva",
      solid: "Yksivärinen",
      solidColor: "Yksivärinen {color}",
      customColor: "Valitse oma väri",
      colors: "Värit",
      wallpaper: "{group}: taustakuva {n}",
      wallpaperGroups: {
        general: "Yleiset",
        cities: "Kaupungit",
        blue: "Sininen",
        purple: "Violetti",
        orange: "Oranssi",
        dark: "Tumma",
      },
      presets: {
        violet: "Violetti",
        sunset: "Auringonlasku",
        orchid: "Orkidea",
        forest: "Metsä",
        flamingo: "Flamingo",
        citrus: "Sitrus",
        arctic: "Arktinen",
        ocean: "Valtameri",
        deep: "Syvyys",
        ember: "Hiillos",
        mint: "Minttu",
        dusk: "Hämärä",
        peach: "Persikka",
        midnight: "Keskiyö",
        slate: "Liuske",
      },
    },
    frame: {
      title: "Kehys",
      padding: "Reunus",
      corners: "Kulmat",
      shadow: "Varjo",
    },
    camera: {
      title: "Kamera",
      show: "Näytä kamera",
      hidden: "Piilotettu",
      position: "Sijainti",
      positionHint: "Vedä pistettä tai napauta kulmaa",
      positionHintHidden: "Näytä kamera, niin voit sijoittaa sen.",
      corners: {
        topLeft: "Vasen yläkulma",
        topRight: "Oikea yläkulma",
        bottomLeft: "Vasen alakulma",
        bottomRight: "Oikea alakulma",
      },
      size: "Koko",
      sizes: {
        small: "Pieni",
        medium: "Keskikokoinen",
        large: "Suuri",
      },
    },
    audio: {
      title: "Ääni",
      systemSound: "Järjestelmän ääni",
      sound: "Ääni",
      microphone: "Mikrofoni",
      muted: "Mykistetty",
      sharedTrack:
        "Mikrofoni ja järjestelmän ääni ovat tässä tallenteessa samalla raidalla.",
    },
    details: {
      title: "Tallenne",
      link: "Linkki",
      size: "Koko",
      duration: "Kesto",
      views: "Katselukerrat",
      created: "Luotu",
    },
    transcript: {
      transcribing: "Litteroidaan…",
      unavailable: "Litterointia ei ole saatavilla",
      pendingHint:
        "Lataa tämä sivu uudelleen minuutin kuluttua, niin voit muokata sitä.",
      failedHint: "Tämän tallenteen litterointi jäi kesken.",
      missingHint:
        "Tallenna mikrofoni päällä, niin litterointi kirjoitetaan puolestasi.",
      deleteWord: "Poista sana",
      deleteWords: "one:Poista {n} sana|other:Poista {n} sanaa",
      clearSelection: "Tyhjennä valinta",
      hint: "Valitse klikkaamalla sanaa tai vetämällä sanojen yli, korjaa tekstiä kaksoisklikkaamalla.",
      resetEdits: "Nollaa muokkaukset",
      editLine: "Muokkaa litteroinnin riviä",
      selectLine: "Valitse rivi kohdassa {time}",
      restore: "Palauta",
      saveFailed: "Tallennus ei onnistunut",
      resetFailed: "Nollaus ei onnistunut",
    },
    timeline: {
      hideWaveform: "Piilota aaltomuoto",
      showWaveform: "Näytä aaltomuoto",
      loadingAudio: "Ladataan ääntä…",
      deleteSelection: "Poista valinta",
      deleteSelectionHint:
        "Valitse sanoja litteroinnista tai jaa aikajana osiin ja valitse osa",
      splitAt: "Jaa osiin kohdasta {time}",
      splitHint: "Toista tai kelaa ensin haluamaasi kohtaan",
      comingSoon: "Tulossa pian",
      fit: "Sovita",
      zoomOut: "Loitonna",
      zoom: "Aikajanan zoomaus",
      zoomIn: "Lähennä",
      seek: "Kelaa",
      trimStart: "Rajaa leikkeen alkua",
      trimEnd: "Rajaa leikkeen loppua",
      removeSplit: "Poista jako kohdasta {time}",
    },
  },
  screenshotEditor: {
    loading: "Ladataan editoria…",
    imageError: {
      decode: "Kuvakaappauksen kuvan purku epäonnistui.",
      fetch:
        "Kuvakaappauksen kuvaa ei voitu ladata. Säilö on ehkä menettänyt CORS-käyttöoikeuden.",
    },
    header: {
      back: "Takaisin kuvakaappaukseen",
      reset: "Nollaa muokkaukset",
      undo: "Kumoa",
      undoTooltip: "Kumoa ({key})",
      redo: "Tee uudelleen",
      redoTooltip: "Tee uudelleen ({key})",
      finish: "Valmis",
    },
    saveError: {
      notMounted: "Editoria ei ole alustettu",
      noCanvas: "Vientiin tarvittavaa piirtoaluetta ei saatu käyttöön",
      workerCrashed: "PNG-koodauksen työsäie kaatui",
    },
    tools: {
      text: "Teksti",
      rect: "Suorakulmio",
      arrow: "Nuoli",
      background: "Tausta",
    },
    background: {
      title: "Lisää tausta",
      close: "Sulje taustavalitsin",
      none: "Ei mitään",
      gradients: {
        violet: "Violetti",
        sunset: "Auringonlasku",
        orchid: "Orkidea",
        forest: "Metsä",
        flamingo: "Flamingo",
        citrus: "Sitrus",
        arctic: "Arktinen",
        ocean: "Valtameri",
        deep: "Syvyys",
      },
      solid: "Yksivärinen {color}",
      custom: "Valitse oma väri",
    },
    inspector: {
      color: "Väri {color}",
      size: "{n}px",
      duplicate: "Monista",
    },
    textPrompt: "Teksti",
  },
  canvas: {
    meta: {
      title: "Piirtoalusta",
      description: "Tyhjä alusta, jolle voit piirtää tallennuksen aikana.",
    },
    loading: "Ladataan piirtoalustaa…",
    tools: {
      select: "Valinta",
      hand: "Käsi",
      pen: "Kynä",
      highlighter: "Korostuskynä",
      rect: "Suorakulmio",
      ellipse: "Ellipsi",
      arrow: "Nuoli",
      line: "Viiva",
      text: "Teksti",
      eraser: "Pyyhekumi",
    },
    shortcut: "{label} · {key}",
    colour: "Väri {colour}",
    stroke: "Viivan paksuus {width}",
    hint: "Siirrä vierittämällä · zoomaa vierittämällä {mod} pohjassa · vedä pitämällä {space} pohjassa",
    textPlaceholder: "Kirjoita…",
    history: {
      undo: "Kumoa",
      redo: "Tee uudelleen",
      clear: "Tyhjennä alusta",
    },
    zoom: {
      out: "Loitonna",
      reset: "Palauta zoomaus",
      in: "Lähennä",
    },
    extensionPrompt: {
      title: "Tallenna tämä piirtoalusta",
      description:
        "Lisää CaptureFlow-laajennus, niin voit tallentaa näyttösi ja kamerasi piirtäessäsi ja jakaa sitten linkin.",
      dismiss: "Ei nyt",
      install: "Lisää Chromeen",
    },
  },
};

export default messages;

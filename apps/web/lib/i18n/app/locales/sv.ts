import type { AppMessages } from "../messages";

const messages: AppMessages = {
  common: {
    cancel: "Avbryt",
    save: "Spara",
    saving: "Sparar…",
    delete: "Radera",
    deleting: "Raderar…",
    remove: "Ta bort",
    close: "Stäng",
    back: "Tillbaka",
    continue: "Fortsätt",
    confirm: "Bekräfta",
    done: "Klar",
    edit: "Redigera",
    copy: "Kopiera",
    copied: "Kopierat",
    search: "Sök",
    loading: "Läser in…",
    retry: "Försök igen",
    learnMore: "Läs mer",
    language: "Språk",
    themeToLight: "Byt till ljust tema",
    themeToDark: "Byt till mörkt tema",
    somethingWrong: "Något gick fel. Försök igen.",
  },
  auth: {
    signedInAs: "Inloggad som {email}.",
    errors: {
      generic: "Något gick fel. Försök igen.",
      network: "Nätverksfel. Försök igen.",
    },
    login: {
      metaTitle: "Logga in",
      signInTitle: "Välkommen tillbaka",
      signInDescription: "Logga in med Google, GitHub eller din e-postadress",
      signUpTitle: "Skapa ditt konto",
      signUpDescription:
        "Registrera dig med Google, GitHub eller din e-postadress",
      inviteTitle: "Gå med i {workspace}",
      inviteDescription:
        "{inviter} har bjudit in dig. Logga in eller skapa ett konto med {email} för att acceptera.",
      continueWith: "Fortsätt med {provider}",
      or: "Eller",
      emailLabel: "E-post",
      emailPlaceholder: "you@example.com",
      emailInvalid: "Ange en giltig e-postadress.",
      continueWithEmail: "Fortsätt med e-post",
      askForInvite: "Behöver du ett konto? Be en administratör om en inbjudan.",
      haveAccount: "Har du redan ett konto? {action}",
      haveAccountAction: "Logga in",
      noAccount: "Har du inget konto? {action}",
      noAccountAction: "Registrera dig",
      changeEmail: "Ändra",
      nameLabel: "Namn",
      namePlaceholder: "Ditt namn",
      passwordLabel: "Lösenord",
      newPasswordPlaceholder: "Minst 12 tecken",
      passwordTooShort: "Använd minst 12 tecken.",
      passwordMissing: "Ange ditt lösenord.",
      signInSubmit: "Logga in",
      signUpSubmit: "Skapa konto",
      terms: "Genom att fortsätta godkänner du våra {terms} och vår {privacy}.",
      termsLink: "användarvillkor",
      privacyLink: "integritetspolicy",
    },
    verify: {
      title: "Kolla din e-post",
      description:
        "Vi har skickat en länk till {email}. Öppna den för att slutföra registreringen.",
      resend: "Skicka mejlet igen",
      resent: "Skickat igen",
      resendFailed: "Det gick inte att skicka mejlet. Försök igen.",
      wrongAddress: "Fel adress? {action}",
      wrongAddressAction: "Använd en annan e-postadress",
    },
    oauthErrors: {
      unfinished: "Inloggningen slutfördes inte. Försök igen.",
      inviteOnly:
        "Den här CaptureFlow-instansen är endast för inbjudna. Be en administratör om en inbjudan.",
      allowedDomains:
        "Registrera dig med en adress på {domains}, eller be en administratör om en inbjudan.",
      providerDomains:
        "Registrera dig med ett Google- eller GitHub-konto på {domains}.",
      domainChoice: "{first} eller {second}",
    },
    inviteFallbacks: {
      workspace: "en CaptureFlow-arbetsyta",
      inviter: "En kollega",
    },
    setPassword: {
      title: "Välj ditt lösenord",
      description: "Välj ett lösenord för {email}. Du loggas in efteråt.",
      passwordLabel: "Nytt lösenord",
      passwordPlaceholder: "Minst 12 tecken",
      submit: "Spara lösenord",
      expiredTitle: "Länken fungerar inte längre",
      expiredDescription:
        "Den har redan använts eller har gått ut. Be en administratör om en ny.",
      goToSignIn: "Gå till inloggningen",
    },
    invite: {
      title: "Du är inbjuden",
      asViewer:
        "Du har bjudits in att gå med i {workspace} på CaptureFlow som tittare: du kan titta på och kommentera allt som delas där.",
      asMember:
        "Du har bjudits in att gå med i {workspace} på CaptureFlow som medlem: du kan spela in i den och dela med teamet.",
      accept: "Acceptera inbjudan",
      databaseUnavailable: "Databasen är inte tillgänglig",
      invalidTitle: "Inbjudan gäller inte längre",
      invalidBody:
        "Länken har gått ut eller har redan använts. Be arbetsytans ägare att skicka en ny inbjudan.",
      wrongAccountTitle: "Fel konto",
      wrongAccountBody:
        "Inbjudan skickades till {invited}, men du är inloggad som {current}. Logga ut och logga in med den inbjudna adressen för att acceptera.",
      goToDashboard: "Gå till översikten",
      signOut: "Logga ut",
    },
    handoff: {
      signingIn: "Loggar in dig…",
      returning: "Går tillbaka till CaptureFlow…",
      open: "Öppna CaptureFlow",
      hint: "Om inget händer klickar du på knappen ovan. Du kan stänga den här fliken när skrivbordsappen har öppnats igen.",
      extensionDone: "Inloggad som {email}. Du kan stänga den här fliken.",
      extensionUnreachable:
        "Det gick inte att nå CaptureFlow-tillägget. Kontrollera att det är installerat och klicka sedan på dess ikon för att försöka igen.",
      extensionUnverified:
        "Det gick inte att verifiera tillägget. Installera om det och försök igen.",
    },
  },
  shell: {
    record: {
      newRecording: "Ny inspelning",
    },
    nav: {
      toggleSidebar: "Visa eller dölj sidofältet",
      dashboard: "Översikt",
      recordings: "Inspelningar",
      screenshots: "Skärmdumpar",
      canvas: "Rityta",
      workspaceGroup: "Arbetsyta",
      members: "Medlemmar",
      settings: "Inställningar",
      personal: "Personligt",
      workspace: "Arbetsyta",
      billing: "Fakturering",
      admin: "Administration",
    },
    upgradeCard: {
      title: "Uppgradera din arbetsyta",
      description:
        "Gratis ger {recordings} inspelningar per person i datasparläge. Betalda planer tar bort gränserna, från {price} per medlem.",
      viewPlans: "Visa planer",
    },
    topBar: {
      upgrade: "Uppgradera",
    },
    workspaceSwitcher: {
      switchWorkspace: "Byt arbetsyta",
      summary: "one:Standard · {n} medlem|other:Standard · {n} medlemmar",
      workspaces: "Arbetsytor",
      owned: "Du äger den här",
      joined: "Du har gått med",
      newWorkspace: "Ny arbetsyta",
      inviteMembers: "Bjud in medlemmar",
    },
    drawer: {
      open: "Öppna arbetsytans meny",
      title: "Arbetsytans meny",
    },
    search: {
      prompt: "Sök bland dina inspelningar och skärmdumpar",
      clear: "Rensa sökningen",
      results: "Sökresultat",
      hint: "Sök bland dina inspelningar och skärmdumpar efter titel.",
      noMatches: "Inga träffar",
      kind: {
        recording: "inspelning",
        screenshot: "skärmdump",
      },
    },
    account: {
      menu: "Kontomeny",
      nav: {
        billing: "Fakturering",
        devices: "Anslutna enheter",
        settings: "Inställningar",
        support: "Kontakta supporten",
      },
      freePlan: "Gratis",
      signOut: "Logga ut",
      signingOut: "Loggar ut…",
    },
    theme: {
      label: "Tema",
      light: "Ljust",
      dark: "Mörkt",
      system: "System",
    },
    notifications: {
      title: "Aviseringar",
      subtitle: "Inbjudningar och ändringar i dina arbetsytor.",
      bellUnread: "one:Aviseringar, {n} oläst|other:Aviseringar, {n} olästa",
      viewAll: "Visa alla",
      menuEmpty:
        "Du har sett allt. Inbjudningar, nya kollegor och rolländringar visas här.",
      pageEmpty:
        "Du har sett allt. När någon bjuder in dig, går med i din arbetsyta eller ändrar din roll ser du det här.",
      accept: "Acceptera",
      decline: "Avböj",
      unread: "Oläst",
      someone: "Någon",
      message: {
        invited: {
          member: "{actor} bjöd in dig att gå med i {workspace} som medlem",
          viewer: "{actor} bjöd in dig att gå med i {workspace} som tittare",
        },
        joined: {
          member: "{actor} gick med i {workspace} som medlem",
          viewer: "{actor} gick med i {workspace} som tittare",
        },
        seatRequested: "{actor} bad om en betald licens i {workspace}",
        seatDenied: "{actor} nekade din licensförfrågan i {workspace}",
        roleChanged: {
          member: "{actor} gjorde dig till medlem i {workspace}",
          viewer: "{actor} gjorde dig till tittare i {workspace}",
        },
        downgraded: "{actor} ändrade din roll till tittare i {workspace}",
        keepRecordingUntil: "Du kan fortsätta spela in till {date}.",
        removed: "{actor} tog bort dig från {workspace}",
      },
      acceptErrors: {
        failed: "Det gick inte att acceptera inbjudan",
        signedOut: "Logga in för att acceptera",
        invalid: "Inbjudan har gått ut eller dragits tillbaka",
        emailMismatch: "Inbjudan gäller en annan e-postadress",
        alreadyMember: "Du är redan med i den här arbetsytan",
      },
    },
    mobileNav: {
      open: "Öppna menyn",
      close: "Stäng menyn",
      docs: "Dokumentation",
      star: "Stjärnmärk på GitHub",
      signIn: "Logga in",
      getStarted: "Kom igång",
    },
    skeletons: {
      avatar: "Profilbild",
      workspaceName: "Arbetsytans namn",
      workspaceLogo: "Arbetsytans logotyp",
    },
  },
  library: {
    dashboard: {
      welcome: "Välkommen tillbaka",
      welcomeName: "Välkommen tillbaka, {name}",
      openCanvas: "Öppna ritytan",
      newRecording: "Ny inspelning",
      stats: {
        recordings: "Inspelningar",
        plusScreenshots:
          "one:Plus {count} skärmdump|other:Plus {count} skärmdumpar",
        noScreenshots: "Inga skärmdumpar än",
        views: "Visningar",
        viewsAverage: "{count} per inspelning i snitt",
        noViews: "Inga visningar än",
        recorded: "Inspelat",
        recordedAverage: "{duration} per inspelning i snitt",
        nothingRecorded: "Inget inspelat än",
        recordingsLeft: "Inspelningar kvar",
        leftOfAllowance: "{left} av {allowance}",
        freePlanLimit: "Gratisplanen, upp till {minutes} min styck",
      },
      recordedTime: {
        minutes: "{minutes} min",
        hours: "{hours} tim",
        hoursMinutes: "{hours} tim {minutes} min",
      },
      recent: {
        title: "Senaste inspelningarna",
        all: "Alla inspelningar",
        empty: "Inget har delats i den här arbetsytan än.",
        views: "one:{n} visning|other:{n} visningar",
        comments: "one:{n} kommentar|other:{n} kommentarer",
        reactions: "one:{n} reaktion|other:{n} reaktioner",
      },
      start: {
        title: "Börja spela in med {product}",
        surfacesLabel: "Var du spelar in",
        surfaces: {
          extension: "Tillägg",
          desktop: "Skrivbordsapp",
          canvas: "Rityta",
        },
        extension: {
          description:
            "Spela in en flik, ett fönster eller hela skärmen från verktygsfältet och få en länk som du kan dela med vem som helst.",
          record: "Spela in nu",
          addToChrome: "Lägg till i Chrome",
        },
        desktop: {
          description:
            "En app byggd för Mac som spelar in skärmen och kameran med systemljud är på väg. Tills dess spelar tillägget in en flik, ett fönster eller hela skärmen.",
          download: "Ladda ner för Mac",
          comingSoon: "Kommer snart",
        },
        canvas: {
          description:
            "En tom tavla med pennor, former och text att rita på medan du spelar in, när det inte finns någon sida att visa.",
        },
      },
    },
    recording: {
      pageTitle: "Inspelningar",
      count: "one:{n} inspelning|other:{n} inspelningar",
      untitled: "Namnlös inspelning",
      aiGenerated: "AI-genererad",
      processing: "Bearbetas",
      noMatches: "Inga inspelningar matchar filtren.",
      empty:
        "Du har inte skapat några inspelningslänkar än. Spela in i CaptureFlows skrivbordsapp så visas dina inspelningar här.",
      selectAll: "Markera alla inspelningar",
      selected: "one:{n} inspelning markerad|other:{n} inspelningar markerade",
      open: "Öppna inspelning",
      edit: "Redigera inspelning",
      share: "Dela inspelning",
      delete: "Radera inspelning",
      deleteTitle: "Radera den här inspelningen?",
      deleteDescription:
        "Videon och dess länk slutar fungera direkt. Det går inte att ångra.",
      deleteSelectedTitle:
        "one:Radera {n} inspelning?|other:Radera {n} inspelningar?",
    },
    screenshot: {
      pageTitle: "Skärmdumpar",
      count: "one:{n} skärmdump|other:{n} skärmdumpar",
      untitled: "Namnlös skärmdump",
      numbered: "Skärmdump {id}",
      noMatches: "Inga skärmdumpar matchar filtren.",
      empty:
        "Inga skärmdumpar än. Öppna CaptureFlow → fliken Screenshot → välj Display, Window eller Area att fånga. Skärmdumpen visas här automatiskt.",
      selectAll: "Markera alla skärmdumpar",
      selected: "one:{n} skärmdump markerad|other:{n} skärmdumpar markerade",
      open: "Öppna skärmdump",
      edit: "Redigera skärmdump",
      share: "Dela skärmdump",
      delete: "Radera skärmdump",
      deleteTitle: "Radera den här skärmdumpen?",
      deleteDescription:
        "Bilden och dess länk slutar fungera direkt. Det går inte att ångra.",
      deleteSelectedTitle:
        "one:Radera {n} skärmdump?|other:Radera {n} skärmdumpar?",
    },
    filters: {
      access: "Åtkomst",
      sort: "Sortering",
      current: "{label}: {value}",
      accessOptions: {
        all: "All åtkomst",
        public: "Offentlig",
        workspace: "Arbetsyta",
        private: "Privat",
      },
      sortOptions: {
        newest: "Nyast först",
        oldest: "Äldst först",
        views: "Mest visade",
      },
    },
    card: {
      select: "Markera {title}",
      moreActions: "Fler åtgärder",
      rename: "Byt namn",
      unknownAuthor: "Okänd",
    },
    selection: {
      deleteDescription: "Deras länkar slutar fungera direkt.",
      deleteFailed: "{failed} av {count} kunde inte raderas. Resten är borta.",
      clear: "Avmarkera",
    },
    pager: {
      label: "Sidor",
      previous: "Föregående sida",
      next: "Nästa sida",
    },
    visibility: {
      label: "Synlighet",
      labels: {
        public: "Offentlig",
        workspace: "Arbetsyta",
        private: "Privat",
      },
      descriptions: {
        public: "Alla med länken kan titta",
        workspace: "Bara inloggade medlemmar i arbetsytan kan titta",
        private: "Bara du kan titta",
      },
      workspaceNamed: "Arbetsyta · {name}",
    },
    share: {
      title: "Dela",
      embed: "Bädda in",
      embedPublic: "Spelas upp överallt där koden klistras in.",
      embedRestricted: "Spelas bara upp för dem som redan kan öppna länken.",
      copyCode: "Kopiera kod",
      generalAccess: "Allmän åtkomst",
      generalAccessCurrent: "Allmän åtkomst: {access}",
      copyLink: "Kopiera länk",
      linkCopied: "Länk kopierad",
      shareAt: "Dela från {time}",
    },
    editableTitle: {
      label: "Inspelningens titel",
      rename: "Byt namn på inspelningen",
    },
  },
  members: {
    title: "Medlemmar",
    databaseUnavailable: "Databasen är inte tillgänglig.",
    role: "Roll",
    status: "Status",
    roles: {
      owner: "Administratör",
      member: "Medlem",
      viewer: "Tittare",
    },
    roleHints: {
      member: {
        does: "Spelar in i den här arbetsytan.",
        costs: "En betald licens på Light och Pro.",
      },
      viewer: {
        does: "Tittar och kommenterar.",
        costs: "Alltid gratis.",
      },
    },
    statuses: {
      active: "Aktiv",
      invited: "Inbjuden",
    },
    seatSummary: {
      members: "one:{n} medlem|other:{n} medlemmar",
      viewers: "one:{n} tittare|other:{n} tittare",
      paidSeats: "one:{n} betald licens|other:{n} betalda licenser",
      membersAndViewers: "{members} och {viewers}",
      onPaidSeats:
        "{people} på {seats}. Varje medlem är en licens; tittare är gratis.",
      membersFree: "{people}. Medlemmar är gratis på den här planen.",
      freePlan:
        "{people}. Gratisplanen: varje medlem får {recordings} inspelningar på upp till {minutes} minuter; tittare tittar och kommenterar.",
      planTitle: "{plan}-planen",
      paidPlanTitle: "Betald plan",
      freePlanTitle: "Gratisplanen",
      upgrade: "Uppgradera arbetsytan",
    },
    table: {
      intro: "Medlemmar spelar in här; tittare tittar och kommenterar.",
      ownerIntro: "Som ägare kan du bjuda in, ta bort och ändra roller.",
      searchPlaceholder: "Namn eller e-postadress",
      searchLabel: "Sök bland medlemmar",
      allRoles: "Alla roller",
      everyone: "Alla",
      columns: {
        name: "Namn",
        dateAdded: "Tillagd",
        email: "E-postadress",
        actions: "Åtgärder",
      },
      empty: "Ingen matchar filtren.",
      downgradeNote: "Tittare från {date} · {keep}",
      keepAsMember: "Behåll som medlem",
      revoke: "Återkalla",
    },
    seatRequests: {
      title: "Licensförfrågningar",
      description:
        "De här tittarna har bett om att få spela in. Om du godkänner blir de medlemmar.",
      descriptionPaid:
        "De här tittarna har bett om att få spela in. Om du godkänner blir de medlemmar, vilket lägger till en betald licens.",
      asked: "{email} · förfrågan {date}",
      deny: "Neka",
      approve: "Godkänn",
    },
    seatConfirm: {
      addTitle: "Ge {name} en betald licens?",
      addBody:
        "Medlemmar spelar in, så var och en är en betald licens. Din {plan}-plan går från {seats} till {nextSeats} licenser, från {before} till {after} per månad.",
      addBodyYearly:
        "Medlemmar spelar in, så var och en är en betald licens. Din {plan}-plan går från {seats} till {nextSeats} licenser, från {before} till {after} per månad, faktureras årsvis.",
      addInvoice:
        "Resten av den här faktureringsperioden läggs till på din nästa faktura.",
      addConfirm: "Lägg till betald licens",
      removeTitle: "Ändra {name} till tittare?",
      removeBody:
        "{name} kan fortsätta spela in till {date}, då perioden du har betalat för tar slut. Sedan blir hen tittare och kan titta och kommentera men inte spela in.",
      removePlan:
        "Därefter går din {plan}-plan från {seats} till {nextSeats} licenser, från {before} till {after} per månad.",
      removePlanYearly:
        "Därefter går din {plan}-plan från {seats} till {nextSeats} licenser, från {before} till {after} per månad, faktureras årsvis.",
      removeConfirm: "Ändra till tittare",
    },
    remove: {
      label: "Ta bort {name} från arbetsytan",
      title: "Ta bort {name} från {workspace}?",
      body: "Hen förlorar åtkomsten direkt. Hens inspelningar och skärmdumpar finns kvar i arbetsytan.",
      freesSeat:
        "Då frigörs den betalda licensen: din plan går från {seats} till {nextSeats} licenser.",
    },
    leave: {
      button: "Lämna",
      title: "Lämna {workspace}?",
      body: "Du förlorar åtkomsten till dess inspelningar och skärmdumpar. Allt du har spelat in där finns kvar i arbetsytan.",
      comeBack: "För att komma tillbaka måste någon bjuda in dig igen.",
      confirm: "Lämna arbetsytan",
    },
    invite: {
      trigger: "Bjud in medlemmar",
      title: "Bjud in medlemmar till {workspace}",
      titleOwnWorkspace: "Bjud in medlemmar till din arbetsyta",
      description:
        "De får ett mejl med en länk som går ut om 7 dagar. Se till att de loggar in med samma adress.",
      removeEmail: "Ta bort {email}",
      addEmails: "Lägg till e-postadresser",
      separatorHint:
        "Separera e-postadresser med mellanslag, komma eller Enter.",
      paidSeatNote:
        "Varje medlem som accepterar lägger till en betald licens i din {plan}-plan, {price} per månad styck. Resten av den här perioden hamnar på din nästa faktura.",
      noEmails: "Lägg till minst en e-postadress",
      invalidEmails: "Ogiltig e-postadress: {emails}",
      failed: "Misslyckades",
      sent: "one:{n} inbjudan skickad.|other:{n} inbjudningar skickade.",
      sending: "Skickar…",
      submit: "Skicka inbjudningar",
    },
    actions: {
      emailRequired: "Ange en e-postadress",
      emailInvalid: "Det ser inte ut som en giltig e-postadress",
      ownWorkspace: "Du är redan med i din egen arbetsyta",
      alreadyMember: "Den personen är redan medlem i den här arbetsytan",
      emailNotSent:
        "Inbjudan skapades men mejlet kunde inte levereras. Kopiera länken från listan över väntande inbjudningar.",
      invitationSent: "Inbjudan skickad till {email}",
      alreadyRecording: "Du kan redan spela in här",
    },
  },
  settings: {
    saved: "Sparat",
    errors: {
      ownerOnly: "Bara arbetsytans ägare kan ändra detta",
      databaseUnavailable: "Databasen är inte tillgänglig",
      saveFailed: "Det gick inte att spara – försök igen",
    },
    upload: {
      uploading: "Laddar upp…",
      missing: "Välj en bildfil",
      failed: "Uppladdningen misslyckades",
      failedReason: "Uppladdningen misslyckades: {reason}",
    },
    personal: {
      title: "Personliga inställningar",
      account: {
        title: "Konto",
        description:
          "Hur du visas för kollegor och för dem som tittar på dina inspelningar.",
      },
      preferences: {
        title: "Preferenser",
        description:
          "Hur CaptureFlow ser ut och vilket språk det använder för dig.",
      },
      languageDescription: "Språket som CaptureFlow visas på för dig.",
    },
    avatar: {
      label: "Profilbild",
      change: "Byt profilbild",
      removing: "Tar bort…",
      hint: "JPG, PNG, WebP eller GIF. Högst 2 MB.",
      tooLarge: "Profilbilden får vara högst 2 MB",
      badType: "Profilbilden måste vara PNG, JPEG, WebP eller GIF",
    },
    account: {
      name: {
        label: "Fullständigt namn",
        placeholder: "Ditt namn",
        description: "Visas på inspelningar, skärmdumpar och aktivitetsrader.",
        required: "Namn krävs.",
        updateFailed: "Det gick inte att uppdatera namnet.",
      },
      email: {
        label: "E-postadress",
        description:
          "Används för att logga in. Kontakta supporten för att ändra den.",
      },
      userId: {
        label: "Användar-ID",
        copy: "Kopiera användar-ID",
        description: "Ange det här när du kontaktar supporten.",
      },
      saveChanges: "Spara ändringar",
    },
    workspace: {
      title: "Arbetsytans inställningar",
      tabs: {
        label: "Inställningsavsnitt",
        general: "Allmänt",
        security: "Säkerhet",
      },
      general: {
        title: "Allmänt",
        description:
          "Namnet och logotypen som identifierar den här arbetsytan i väljaren för arbetsytor, på medlemssidan och i förhandsvisningar av länkar.",
      },
      name: {
        title: "Arbetsytans namn",
        description: "Namnet som visas för din arbetsyta.",
        empty: "Arbetsytans namn får inte vara tomt",
        tooLong: "Arbetsytans namn är för långt (högst {max} tecken)",
      },
      logo: {
        title: "Arbetsytans logotyp",
        description:
          "Visas bredvid arbetsytans namn. PNG, JPEG, WebP, GIF eller SVG, högst 2 MB.",
        upload: "Ladda upp logotyp",
        replace: "Byt logotyp",
        tooLarge: "Logotypen får vara högst 2 MB",
        badType: "Logotypen måste vara PNG, JPEG, WebP, GIF eller SVG",
      },
      permissions: {
        title: "Standardbehörigheter",
        description:
          "Inställningar som gäller för alla nya inspelningar och skärmdumpar i arbetsytan.",
      },
      recordingAccess: {
        title: "Inspelningsbehörighet",
        description:
          "Bestäm om kollegor får lägga upp inspelningar och skärmdumpar i den här arbetsytan.",
        allow: {
          title: "Låt kollegor lägga upp här",
          body: "Medlemmar kan spela in i den här arbetsytan.",
        },
        ownerOnly: {
          title: "Bara arbetsytans ägare",
          body: "Kollegors uppladdningar hamnar i deras personliga arbetsyta.",
        },
      },
    },
    devices: {
      title: "Anslutna enheter",
      count: "one:{n} enhet inloggad|other:{n} enheter inloggade",
      empty:
        "Inga anslutna enheter. Öppna CaptureFlows skrivbordsapp och klicka på Sign in i inspelningsfältet för att koppla det här kontot.",
      unlabelled: "Enhet utan namn",
      added: "Tillagd {date}",
      addedLastUsed: "Tillagd {date} · användes senast {lastUsed}",
      neverUsed: "Aldrig använd",
      revoke: {
        action: "Återkalla",
        title: "Logga ut den här enheten?",
        description: "Den måste logga in igen för att hantera inspelningar.",
      },
    },
  },
  billing: {
    chargedInUsd: "Debiteras i amerikanska dollar.",
    shownIn: "Priserna visas i {currency}. Du debiteras i amerikanska dollar.",
    page: {
      title: "Fakturering",
      subtitle: "Din plan och hur mycket av den du har använt.",
      workspaceLabel: "Arbetsyta · {name}",
      manageSubscription: "Hantera prenumeration",
      upgradeWorkspace: "Uppgradera arbetsytan",
      storage: "Arbetsytans lagring",
      usedOfLimit: "{used} av {limit}",
      usedNoLimit: "{used} – ingen gräns",
    },
    loading: {
      plan: "Plan",
      usage: "Användning",
    },
    counts: {
      members: "one:{n} medlem|other:{n} medlemmar",
      paidSeats: "one:{n} betald licens|other:{n} betalda licenser",
      freeViewers: "one:{n} gratistittare|other:{n} gratistittare",
    },
    plan: {
      free: "Gratis",
      paid: "Betald",
      billedMonthly: "Faktureras månadsvis",
      billedYearly: "Faktureras årsvis",
      freeSummary:
        "{members} · upp till {recordings} inspelningar per person, {minutes} minuter vardera, i datasparläge",
    },
    status: {
      onTrial: "Provperiod",
      active: "Aktiv",
      paused: "Pausad",
      pastDue: "Betalningen misslyckades",
      unpaid: "Obetald",
      cancelled: "Uppsagd",
      expired: "Utgången",
    },
    details: {
      youPay: "Du betalar",
      amountPerMonth: "{amount} per månad",
      amountPerYear: "{amount} per år",
      seatsMonthly:
        "one:{n} licens × {price} per månad|other:{n} licenser × {price} per månad",
      seatsYearly:
        "one:{n} licens × {price} per månad, {total} per månad, faktureras årsvis|other:{n} licenser × {price} per månad, {total} per månad, faktureras årsvis",
      nextPayment: "Nästa betalning",
      ends: "Upphör",
      endOfPeriod: "Vid slutet av den här perioden",
      amountOnDate: "{amount} den {date}",
      firstPaymentPending: "När den första betalningen har gått igenom",
      estimate: "{base} · {change}, uppskattat",
      baseForSeats:
        "one:{amount} för {n} licens|other:{amount} för {n} licenser",
      seatsAdded:
        "one:{amount} för {n} licens som lagts till den här perioden|other:{amount} för {n} licenser som lagts till den här perioden",
      seatsRemoved:
        "one:{amount} tillgodo för {n} licens som tagits bort den här perioden|other:{amount} tillgodo för {n} licenser som tagits bort den här perioden",
      seatChanges: "{amount} för licensändringar den här perioden",
      seats: "Licenser",
      seatsAndViewers: "{seats}, {viewers}",
      billedTo: "Faktureras till",
      paymentMethod: "Betalningsmetod",
      cardEnding: "{brand} som slutar på {last4}",
      card: "Kort",
      updateCard: "Uppdatera",
    },
    switchPlan: {
      switchTo: "Byt till {plan}",
      title: "Byt till {plan}?",
      priceMonthly:
        "one:Din {n} licens går från {before} till {after} per månad.|other:Dina {n} licenser går från {before} till {after} per månad.",
      priceYearly:
        "one:Din {n} licens går från {before} till {after} per månad, faktureras årsvis.|other:Dina {n} licenser går från {before} till {after} per månad, faktureras årsvis.",
      benefits:
        "{plan} spelar in i alla kvaliteter upp till 60 fps och lägger till AI-redigering.",
      timing:
        "Det börjar gälla nu. Mellanskillnaden för resten av den här faktureringsperioden läggs till på din nästa faktura.",
      errors: {
        failed: "Det gick inte att byta plan",
        unknownPlan: "Okänd plan",
        billingUnavailable: "Faktureringen är inte tillgänglig",
        noSubscription: "Den här arbetsytan har ingen aktiv prenumeration",
        cancelled: "Återuppta prenumerationen innan du byter plan",
        unavailable: "Det går inte att byta plan just nu",
        rejected: "Faktureringen godkände inte ändringen. Försök igen.",
      },
    },
    upgrade: {
      title: "Uppgradera {name}",
      billingCycle: "Faktureringsintervall",
      cycles: {
        monthly: "Månadsvis",
        annual: "Årsvis",
      },
      annualSaving: "spara {percent} %",
      seatPicker: {
        title: "Vem får en betald licens",
        selected: "{seats} av {total}",
        description:
          "De som är markerade spelar in och faktureras. Alla andra är gratistittare som kan titta, kommentera och reagera, men inte spela in. Rollerna ändras när du uppgraderar.",
        selectAll: "Markera alla",
        clear: "Avmarkera",
        you: "(du)",
        paidSeat: "Betald licens",
        viewer: "Tittare",
      },
      perMonth: "per månad",
      seatsPrice: "one:{n} licens × {price}|other:{n} licenser × {price}",
      viewersFree: "one:{n} tittare gratis|other:{n} tittare gratis",
      priceWithViewers: "{seats}, {viewers}",
      priceYearly: "{seats}, faktureras årsvis",
      priceWithViewersYearly: "{seats}, {viewers}, faktureras årsvis",
      upgradeTo: "Uppgradera till {plan}",
      checkoutUnavailable: "Kassan är inte konfigurerad",
    },
    requestSeat: {
      request: "Be om att få spela in",
      requested: "Licens begärd",
      hint: "Du är tittare här. Be ägaren om en betald licens så att du kan spela in.",
      requestedHint:
        "Ägaren har fått din förfrågan. Du kan spela in när den har godkänts.",
      failed: "Det gick inte att skicka förfrågan",
    },
  },
  actions: {
    missingSlug: "Slug saknas",
    recordingNotFound: "Inspelningen hittades inte",
    invalidVisibility: "Ogiltig synlighet",
    deleteVideoFailed: "Det gick inte att radera videofilen: {reason}",
    transcriptNotFound: "Transkriptionen hittades inte",
    transcriptEmpty:
      "Transkriptionen får inte vara tom. Återställ den i stället.",
    missingTokenId: "Token-id saknas",
    tokenNotFound: "Token hittades inte",
    missingScreenshotId: "Skärmdumps-id saknas",
    screenshotNotFound: "Skärmdumpen hittades inte",
    missingImageBytes: "Bilddata saknas",
    screenshotTooLarge:
      "Den redigerade skärmdumpen överskrider storleksgränsen per skärmdump.",
    saveScreenshotFailed: "Det gick inte att spara skärmdumpen: {reason}",
    saveFailed: "Det gick inte att spara: {reason}",
    invalidCanvasDimensions: "Det gick inte att spara: ogiltiga canvasmått",
  },
  viewer: {
    meta: {
      defaultTitle: "{product}-inspelning",
      defaultDescription: "En skärminspelning delad från {product}.",
      preparingTitle: "Förbereder inspelningen… – {product}",
      notFoundTitle: "Hittades inte",
      description:
        "En skärminspelning delad från {product}. Titta i webbläsaren, ingen registrering behövs.",
      descriptionTimed:
        "En skärminspelning på {duration} delad från {product}. Titta i webbläsaren, ingen registrering behövs.",
    },
    loading: "Läser in inspelningen…",
    nav: {
      download: "Ladda ner",
    },
    authPrompt: {
      pricing: "Priser",
      logIn: "Logga in",
      getStarted: "Kom igång",
      getFree: "Skaffa {product} gratis",
    },
    postedBy: {
      label: "Upplagd av",
      someone: "Någon",
    },
    views: {
      count: "one:{count} visning|other:{count} visningar",
      showWhoWatched: "{views}, visa vilka som har tittat",
      viewers: "Tittare",
      emptyTitle: "Inga visningar än",
      emptyDescription: "Dela länken så visas de som tittar här.",
      signedInViewer: "Inloggad tittare",
      anonymous: "Anonym",
    },
    actions: {
      share: "Dela",
      visibilityFailed: "Det gick inte att ändra synligheten",
      deleteFailed: "Det gick inte att radera inspelningen",
    },
    requestAccess: {
      title: "Be om åtkomst för att se den här videon",
      notSharedBy: "{name} har inte delat den här inspelningen med dig än.",
      notSharedByOwner:
        "Ägaren har inte delat den här inspelningen med dig än.",
      signInHint:
        "Logga in med din e-postadress på jobbet – om du redan är med i ägarens team släpps du in direkt.",
      signIn: "Logga in för att fortsätta",
      sentTitle: "Förfrågan skickad",
      sentDescription:
        "Vi har meddelat ägaren. Du får ett mejl om du får åtkomst.",
      askingAs: "Du frågar som {email}",
      noteLabel: "Lägg till ett meddelande {optional}",
      noteOptional: "(valfritt)",
      notePlaceholder:
        "Hej, jag skulle vilja se den här inspelningen från gårdagens genomgång.",
      sending: "Skickar…",
      submit: "Be om åtkomst",
      failed: "Något gick fel. Försök igen om en stund.",
    },
    pending: {
      preparingTitle: "Förbereder din inspelning…",
      preparingDescription:
        "Uppladdningen håller på att slutföras. Sidan uppdateras av sig själv när den är klar.",
      failedTitle: "Uppladdningen av den här inspelningen slutfördes inte",
      failedDescription:
        "Länken skapades men videon kom aldrig fram. Prova länken igen om en minut, eller gör en ny inspelning.",
      comment: "Kommentera",
      activityTab: "Aktivitet",
      transcriptTab: "Transkription",
      emptyTitle: "Ingen aktivitet än",
      emptyDescription:
        "Reaktioner och kommentarer från tittare visas här när inspelningen är klar.",
    },
    upgradeBanner: {
      message:
        "{usage} på gratisplanen. Uppgradera för obegränsat antal inspelningar i full kvalitet.",
      usage:
        "one:{used} av {n} inspelning använd|other:{used} av {n} inspelningar använda",
    },
    editPanel: {
      makeEdits: "Gör ändringar",
      status: {
        idle: "Sparas automatiskt",
        saved: "Sparat",
        error: "Det gick inte att spara",
      },
      trimTitle: "Trimma och klipp",
      trimDescription:
        "Dela tidslinjen, klipp bort avsnitt och rätta transkriptionen.",
      background: "Bakgrund",
      camera: "Kamera",
      audio: "Ljud",
      takeAction: "Åtgärder",
      downloadTitle: "Ladda ner video",
      downloadDescription: "Hela inspelningen som MP4.",
      copyEmbed: "Kopiera inbäddningskod",
      embedCopied: "Inbäddningskod kopierad",
      embedDescription: "Klistra in spelaren på valfri webbsida.",
    },
    notFound: {
      title: "Inspelningen hittades inte",
      description:
        "Länken har gått ut eller har aldrig funnits. Inspelningar på gratiskonton sparas i 30 dagar från att de senast visades.",
      madeWith: "Skapad med {product}",
    },
  },
  activity: {
    sidebar: {
      label: "Inspelningens sidofält",
      activityTab: "Aktivitet",
      transcriptTab: "Transkription",
    },
    you: "Du",
    anonymous: "Anonym",
    jumpToMoment: "Hoppa till den här tidpunkten",
    empty: {
      title: "Ingen aktivitet än",
      description:
        "Reaktioner och kommentarer från tittare visas här allt eftersom.",
      firstTitle: "Bli först med att kommentera",
      firstTitleNamed: "Bli först med att kommentera, {name}",
      hint: "Tryck på {key} för att svara eller skriv en kommentar längst ner i den här panelen.",
      focusComposer: "Fokusera kommentarsfältet",
    },
    composer: {
      signIn: "Logga in för att reagera och kommentera",
      placeholder: "Skriv en kommentar…",
      mention: "Nämn någon",
      noOneToMention: "Ingen har reagerat eller kommenterat än",
      insertEmoji: "Infoga emoji",
      searchEmoji: "Sök emoji",
      posting: "Publicerar…",
      submitAt: "Kommentera vid {time}",
      postFailed: "Det gick inte att publicera kommentaren",
    },
    comment: {
      delete: "Radera kommentar",
      deleteFailed: "Det gick inte att radera kommentaren",
    },
    reaction: {
      count: "one:{n} reaktion|other:{n} reaktioner",
      delete: "Radera reaktion",
      deleteMany: "one:Radera {n} reaktion|other:Radera {n} reaktioner",
      deleteFailed: "Det gick inte att radera reaktionen",
    },
    transcript: {
      pendingTitle: "Transkriberar…",
      pendingDescription: "Transkriptionen visas här så snart den är klar.",
      failedTitle: "Transkriberingen slutfördes inte",
      failedDescription:
        "Något gick fel när den här inspelningen transkriberades.",
      noneTitle: "Ingen transkription",
      noneOwnerDescription: "Spela in med mikrofonen på så skrivs en åt dig.",
      noneViewerDescription: "Den här inspelningen gjordes utan mikrofon.",
      searchLabel: "Sök i transkriptionen",
      noMatches: "Inga träffar.",
    },
    saveFailed: "Det gick inte att spara. Försök igen.",
    summary: {
      title: "Sammanfattning",
      add: "Lägg till",
      placeholder: "Vad händer i den här inspelningen?",
      empty: "Ingen sammanfattning än.",
      emptyAction: "Lägg till en sammanfattning",
    },
    chapters: {
      title: "Kapitel",
      count: "one:{n} kapitel|other:{n} kapitel",
      addAtPlayhead: "Lägg till vid spelhuvudet",
      defaultTitle: "Kapitel {n}",
      editHint: "Ett kapitel per rad, som {short} eller {long}.",
      editHintShort: "M:SS Titel",
      editHintLong: "H:MM:SS Titel",
      editPlaceholder: "0:00 Intro\n0:30 Demo\n1:20 Avslutning",
      playing: "Spelas upp",
      remove: "Ta bort kapitel",
      empty: "Inga kapitel än.",
      emptyAction: "Lägg till ett vid spelhuvudet",
    },
  },
  player: {
    overlay: {
      watchAgain: "Titta igen",
    },
    captions: {
      track: "Undertexter",
      size: "Storlek",
      position: "Placering",
      sizes: {
        small: "Liten",
        medium: "Medel",
        large: "Stor",
      },
      positions: {
        top: "Överst",
        bottom: "Nederst",
      },
    },
    reactionBar: {
      comment: "Kommentera",
      leaveComment: "Skriv en kommentar",
    },
    reactions: {
      heart: "Hjärta",
      thumbsUp: "Tummen upp",
      fire: "Eld",
      clap: "Applåd",
      raisedHands: "Höjda händer",
      eyes: "Ögon",
    },
    embed: {
      title: "{product}-inspelning",
    },
    controls: {
      buttons: {
        play: "Spela upp",
        pause: "Pausa",
        replay: "Spela igen",
        mute: "Stäng av ljudet",
        unmute: "Slå på ljudet",
      },
      seek: {
        forward: "Hoppa framåt {seconds} sekunder",
        backward: "Hoppa bakåt {seconds} sekunder",
      },
      fullscreen: {
        enter: "Visa i helskärm",
        exit: "Avsluta helskärm",
      },
      captions: {
        enable: "Slå på undertexter",
        disable: "Stäng av undertexter",
      },
      pip: {
        enter: "Öppna bild-i-bild",
        exit: "Avsluta bild-i-bild",
      },
      cast: {
        start: "Börja casta",
        stop: "Sluta casta",
        connecting: "Ansluter",
      },
      airplay: {
        start: "Starta AirPlay",
        stop: "Stoppa AirPlay",
      },
      slider: {
        seek: "Spola",
      },
      time: {
        current: "Aktuell tid",
        duration: "Längd",
        position: "{current} av {duration}",
        unknown: "Mediet har inte lästs in, okänd tid.",
      },
      playback: {
        rate: "Uppspelningshastighet {rate}",
      },
      volume: {
        mutedValue: "{percent}, ljudet av",
        muted: "Ljudet av",
        label: "Volym",
        value: "Volym {value}",
      },
      status: {
        captionsOn: "Undertexter på",
        captionsOff: "Undertexter av",
        paused: "Pausad",
        playing: "Spelas upp",
        fullscreen: "Helskärm",
        pip: "Bild-i-bild",
        exitPip: "Avsluta bild-i-bild",
        seekedTo: "Hoppade till {time}",
      },
      container: {
        label: "Mediespelare",
      },
      errors: {
        aborted: "Du stoppade uppspelningen innan den var klar.",
        network:
          "Mediet kunde inte läsas in på grund av ett nätverks- eller serverfel.",
        decode:
          "Mediet kunde inte spelas upp. Det kan vara skadat, eller så stöder din webbläsare inte formatet.",
        source:
          "Mediet kunde inte läsas in. Det kan vara otillgängligt, eller så stöder din webbläsare inte formatet.",
        encrypted:
          "Mediet kunde inte spelas upp eftersom det inte gick att dekryptera.",
        unplayable: "Spelaren stöder inte det här mediet.",
        title: "Något gick fel.",
        unexpected: "Ett oväntat fel inträffade.",
      },
      common: {
        ok: "OK",
      },
      menu: {
        settings: "Inställningar",
        quality: "Kvalitet",
        audio: "Ljud",
        speed: "Hastighet",
        captions: "Undertexter",
        playbackRate: "Uppspelningshastighet",
        off: "Av",
        auto: "Auto",
        autoWithLabel: "Auto ({label})",
      },
    },
  },
  screenshotView: {
    page: {
      defaultTitle: "{product}-skärmdump",
      description: "En skärmdump delad från {product}.",
      madeWith: "Skapad med {product}",
      loading: "Läser in skärmdumpen…",
    },
    authPrompt: {
      pricing: "Priser",
      logIn: "Logga in",
      getStarted: "Kom igång",
      getFree: "Skaffa {product} gratis",
    },
    actions: {
      edit: "Redigera skärmdump",
      share: "Dela",
      shareTitle: "Dela skärmdump",
      copyLink: "Kopiera länk",
      linkCopied: "Länk kopierad",
      more: "Fler åtgärder",
      delete: "Radera skärmdump",
      deleteTitle: "Radera den här skärmdumpen?",
      deleteDescription:
        "Bilden och dess länk slutar fungera direkt. Det går inte att ångra.",
      visibilityFailed: "Det gick inte att ändra synligheten",
      deleteFailed: "Det gick inte att radera skärmdumpen",
    },
    zoom: {
      expand: "Förstora bilden",
      minimize: "Förminska bilden",
    },
    requestAccess: {
      title: "Be om åtkomst för att se den här skärmdumpen",
      notSharedBy: "{name} har inte delat den här skärmdumpen med dig än.",
      notSharedByOwner: "Ägaren har inte delat den här skärmdumpen med dig än.",
      signInHint:
        "Logga in med din e-postadress på jobbet – om du redan är med i ägarens team släpps du in direkt.",
      signIn: "Logga in för att fortsätta",
      sentTitle: "Förfrågan skickad",
      sentDescription:
        "Vi har meddelat ägaren. Du får ett mejl om du får åtkomst.",
      askingAs: "Du frågar som {email}",
      noteLabel: "Lägg till ett meddelande {optional}",
      noteOptional: "(valfritt)",
      notePlaceholder:
        "Hej, jag skulle vilja ha en kopia av den här skärmdumpen från designgenomgången.",
      sending: "Skickar…",
      submit: "Be om åtkomst",
      failed: "Något gick fel. Försök igen om en stund.",
    },
    notFound: {
      title: "Skärmdumpen hittades inte",
      description:
        "Länken har gått ut eller har aldrig funnits. Skärmdumpar på gratiskonton sparas i 30 dagar från att de senast visades.",
    },
  },
  recordingEditor: {
    skeleton: {
      label: "Öppnar redigeraren",
      status: "Öppnar redigeraren…",
    },
    preparing: {
      title: "Förbereder inspelningen…",
      description:
        "Inspelningen laddas fortfarande upp. Sidan uppdateras automatiskt när den är klar.",
    },
    failed: {
      title: "Uppladdningen av inspelningen misslyckades.",
      description: "Försök spela in igen från skrivbordsappen.",
    },
    saveFailed: "Det gick inte att spara",
    topBar: {
      back: "Tillbaka till inspelningen",
      status: {
        idle: "Ändringar sparas automatiskt",
        saved: "Sparat",
        error: "Det gick inte att spara",
      },
      versionHistory: "Versionshistorik (kommer snart)",
      undo: "Ångra",
      undoShortcut: "Ångra ({key})",
      redo: "Gör om",
      redoShortcut: "Gör om ({key})",
      finish: "Slutför",
    },
    panels: {
      label: "Redigerarens paneler",
      tabs: {
        transcript: "Transkription",
        design: "Design",
        details: "Detaljer",
      },
      hide: {
        transcript: "Dölj transkription",
        design: "Dölj design",
        details: "Dölj detaljer",
      },
      show: {
        transcript: "Visa transkription",
        design: "Visa design",
        details: "Visa detaljer",
      },
    },
    toggleOn: "På",
    background: {
      title: "Bakgrund",
      gradients: "Övertoningar",
      none: "Ingen",
      noBackground: "Ingen bakgrund",
      solid: "Enfärgad",
      solidColor: "Enfärgad {color}",
      customColor: "Välj en egen färg",
      showLess: "Visa färre",
      seeMore: "Visa fler",
      presets: {
        violet: "Violett",
        sunset: "Solnedgång",
        orchid: "Orkidé",
        forest: "Skog",
        flamingo: "Flamingo",
        citrus: "Citrus",
        arctic: "Arktis",
        ocean: "Hav",
        deep: "Djup",
        ember: "Glöd",
        mint: "Mint",
        dusk: "Skymning",
        peach: "Persika",
        midnight: "Midnatt",
        slate: "Skiffer",
      },
    },
    camera: {
      title: "Kamera",
      show: "Visa kamera",
      hidden: "Dold",
      position: "Placering",
      positionHint: "Dra punkten eller tryck på ett hörn",
      positionHintHidden: "Visa kameran för att placera den.",
      corners: {
        topLeft: "Uppe till vänster",
        topRight: "Uppe till höger",
        bottomLeft: "Nere till vänster",
        bottomRight: "Nere till höger",
      },
      size: "Storlek",
      sizes: {
        small: "Liten",
        medium: "Medel",
        large: "Stor",
      },
    },
    audio: {
      title: "Ljud",
      systemSound: "Systemljud",
      sound: "Ljud",
      microphone: "Mikrofon",
      muted: "Ljudet av",
      sharedTrack:
        "Mikrofon och systemljud delar ett spår i den här inspelningen.",
    },
    details: {
      title: "Inspelning",
      link: "Länk",
      size: "Storlek",
      duration: "Längd",
      views: "Visningar",
      created: "Skapad",
    },
    transcript: {
      transcribing: "Transkriberar…",
      unavailable: "Ingen transkription tillgänglig",
      pendingHint: "Läs in sidan igen om en minut för att redigera den.",
      failedHint: "Transkriberingen slutfördes inte för den här inspelningen.",
      missingHint: "Spela in med mikrofonen på så skrivs en åt dig.",
      deleteWord: "Radera ord",
      deleteWords: "one:Radera {n} ord|other:Radera {n} ord",
      clearSelection: "Avmarkera",
      hint: "Klicka på ett ord eller dra över flera ord för att markera, dubbelklicka för att rätta texten.",
      resetEdits: "Återställ ändringar",
      editLine: "Redigera rad i transkriptionen",
      selectLine: "Markera raden vid {time}",
      restore: "Återställ",
      saveFailed: "Det gick inte att spara",
      resetFailed: "Det gick inte att återställa",
    },
    timeline: {
      hideWaveform: "Dölj vågform",
      showWaveform: "Visa vågform",
      loadingAudio: "Läser in ljud…",
      deleteSelection: "Radera markering",
      deleteSelectionHint:
        "Markera ord i transkriptionen, eller dela tidslinjen och välj ett segment",
      splitAt: "Dela vid {time}",
      splitHint: "Spela upp eller dra till en tidpunkt först",
      comingSoon: "Kommer snart",
      fit: "Anpassa",
      zoomOut: "Zooma ut",
      zoom: "Tidslinjens zoom",
      zoomIn: "Zooma in",
      seek: "Spola",
      trimStart: "Trimma klippets början",
      trimEnd: "Trimma klippets slut",
      removeSplit: "Ta bort delningen vid {time}",
    },
  },
  screenshotEditor: {
    loading: "Läser in redigeraren…",
    imageError: {
      decode: "Det gick inte att avkoda skärmdumpens bild.",
      fetch:
        "Det gick inte att läsa in skärmdumpens bild. Bucketen kan ha förlorat CORS-åtkomsten.",
    },
    header: {
      back: "Tillbaka till skärmdumpen",
      reset: "Återställ ändringar",
      undo: "Ångra",
      undoTooltip: "Ångra ({key})",
      redo: "Gör om",
      redoTooltip: "Gör om ({key})",
      finish: "Slutför",
    },
    saveError: {
      notMounted: "Redigeraren är inte monterad",
      noCanvas: "Det gick inte att få fram en canvas för export",
      workerCrashed: "Workern för PNG-kodning kraschade",
    },
    tools: {
      text: "Text",
      rect: "Rektangel",
      arrow: "Pil",
      background: "Bakgrund",
    },
    background: {
      title: "Lägg till en bakgrund",
      close: "Stäng bakgrundsväljaren",
      none: "Ingen",
      gradients: {
        violet: "Violett",
        sunset: "Solnedgång",
        orchid: "Orkidé",
        forest: "Skog",
        flamingo: "Flamingo",
        citrus: "Citrus",
        arctic: "Arktis",
        ocean: "Hav",
        deep: "Djup",
      },
      solid: "Enfärgad {color}",
      custom: "Välj en egen färg",
    },
    inspector: {
      color: "Färg {color}",
      size: "{n}px",
      duplicate: "Duplicera",
    },
    textPrompt: "Text",
  },
  canvas: {
    meta: {
      title: "Rityta",
      description: "En tom tavla att rita på medan du spelar in.",
    },
    loading: "Läser in ritytan…",
    tools: {
      select: "Markera",
      hand: "Hand",
      pen: "Penna",
      highlighter: "Överstrykningspenna",
      rect: "Rektangel",
      ellipse: "Ellips",
      arrow: "Pil",
      line: "Linje",
      text: "Text",
      eraser: "Suddgummi",
    },
    shortcut: "{label} · {key}",
    colour: "Färg {colour}",
    stroke: "Linjetjocklek {width}",
    hint: "Scrolla för att panorera · scrolla med {mod} för att zooma · håll ned {space} för att dra",
    textPlaceholder: "Skriv…",
    history: {
      undo: "Ångra",
      redo: "Gör om",
      clear: "Rensa tavlan",
    },
    zoom: {
      out: "Zooma ut",
      reset: "Återställ zoom",
      in: "Zooma in",
    },
    extensionPrompt: {
      title: "Spela in den här ritytan",
      description:
        "Lägg till CaptureFlow-tillägget för att spela in skärmen och kameran medan du ritar, och dela sedan en länk.",
      dismiss: "Inte nu",
      install: "Lägg till i Chrome",
    },
  },
};

export default messages;

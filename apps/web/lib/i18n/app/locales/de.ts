import type { AppMessages } from "../messages";

const messages: AppMessages = {
  common: {
    cancel: "Abbrechen",
    save: "Speichern",
    saving: "Wird gespeichert…",
    delete: "Löschen",
    deleting: "Wird gelöscht…",
    remove: "Entfernen",
    close: "Schließen",
    back: "Zurück",
    continue: "Weiter",
    confirm: "Bestätigen",
    done: "Fertig",
    edit: "Bearbeiten",
    copy: "Kopieren",
    copied: "Kopiert",
    search: "Suchen",
    loading: "Wird geladen…",
    retry: "Erneut versuchen",
    learnMore: "Mehr erfahren",
    language: "Sprache",
    themeToLight: "Zum hellen Design wechseln",
    themeToDark: "Zum dunklen Design wechseln",
    somethingWrong: "Etwas ist schiefgelaufen. Versuch es noch einmal.",
    pageFailed: "Diese Seite konnte nicht geladen werden.",
    partFailed: "Dieser Teil konnte nicht geladen werden.",
    failedBody:
      "Etwas ist schiefgelaufen. Versuch es noch einmal oder lade die Seite neu.",
    reload: "Seite neu laden",
  },
  auth: {
    signedInAs: "Angemeldet als {email}.",
    errors: {
      generic: "Etwas ist schiefgelaufen. Bitte versuch es noch einmal.",
      network: "Netzwerkfehler. Bitte versuch es noch einmal.",
    },
    login: {
      metaTitle: "Anmelden",
      signInTitle: "Willkommen zurück",
      signInDescription:
        "Melde dich mit Google, GitHub oder deiner E-Mail-Adresse an",
      signUpTitle: "Erstelle dein Konto",
      signUpDescription:
        "Registriere dich mit Google, GitHub oder deiner E-Mail-Adresse",
      inviteTitle: "Tritt {workspace} bei",
      inviteDescription:
        "{inviter} hat dich eingeladen. Melde dich an oder erstelle ein Konto mit {email}, um die Einladung anzunehmen.",
      continueWith: "Weiter mit {provider}",
      or: "Oder",
      emailLabel: "E-Mail",
      emailPlaceholder: "you@example.com",
      emailInvalid: "Gib eine gültige E-Mail-Adresse ein.",
      continueWithEmail: "Weiter mit E-Mail",
      askForInvite:
        "Du brauchst ein Konto? Bitte einen Admin um eine Einladung.",
      haveAccount: "Du hast schon ein Konto? {action}",
      haveAccountAction: "Anmelden",
      noAccount: "Noch kein Konto? {action}",
      noAccountAction: "Registrieren",
      changeEmail: "Ändern",
      nameLabel: "Name",
      namePlaceholder: "Dein Name",
      passwordLabel: "Passwort",
      newPasswordPlaceholder: "Mindestens 12 Zeichen",
      passwordTooShort: "Verwende mindestens 12 Zeichen.",
      passwordMissing: "Gib dein Passwort ein.",
      signInSubmit: "Anmelden",
      signUpSubmit: "Konto erstellen",
      terms:
        "Wenn du fortfährst, stimmst du unseren {terms} und unserer {privacy} zu.",
      termsLink: "Nutzungsbedingungen",
      privacyLink: "Datenschutzerklärung",
    },
    verify: {
      title: "Prüfe dein Postfach",
      description:
        "Wir haben einen Link an {email} gesendet. Öffne ihn, um die Einrichtung deines Kontos abzuschließen.",
      resend: "E-Mail erneut senden",
      resent: "Erneut gesendet",
      resendFailed:
        "Die E-Mail konnte nicht gesendet werden. Bitte versuch es noch einmal.",
      wrongAddress: "Falsche Adresse? {action}",
      wrongAddressAction: "Andere E-Mail-Adresse verwenden",
    },
    oauthErrors: {
      unfinished:
        "Die Anmeldung wurde nicht abgeschlossen. Bitte versuch es noch einmal.",
      inviteOnly:
        "Diese CaptureFlow-Instanz ist nur mit Einladung zugänglich. Bitte einen Administrator um eine Einladung.",
      allowedDomains:
        "Registriere dich mit einer Adresse bei {domains} oder bitte einen Administrator um eine Einladung.",
      providerDomains:
        "Registriere dich mit einem Google- oder GitHub-Konto bei {domains}.",
      domainChoice: "{first} oder {second}",
    },
    inviteFallbacks: {
      workspace: "einem CaptureFlow-Workspace",
      inviter: "Ein Teammitglied",
    },
    setPassword: {
      title: "Lege dein Passwort fest",
      description:
        "Wähle ein Passwort für {email}. Danach wirst du angemeldet.",
      passwordLabel: "Neues Passwort",
      passwordPlaceholder: "Mindestens 12 Zeichen",
      submit: "Passwort speichern",
      expiredTitle: "Dieser Link funktioniert nicht mehr",
      expiredDescription:
        "Er wurde bereits verwendet oder ist abgelaufen. Bitte einen Administrator um einen neuen.",
      goToSignIn: "Zur Anmeldung",
    },
    invite: {
      title: "Du bist eingeladen",
      asViewer:
        "Du wurdest eingeladen, {workspace} auf CaptureFlow als Betrachter beizutreten: Du kannst alles ansehen und kommentieren, was dort geteilt wird.",
      asMember:
        "Du wurdest eingeladen, {workspace} auf CaptureFlow als Mitglied beizutreten: Du kannst dort aufnehmen und mit dem Team teilen.",
      accept: "Einladung annehmen",
      databaseUnavailable: "Datenbank nicht verfügbar",
      invalidTitle: "Einladung nicht mehr gültig",
      invalidBody:
        "Dieser Link ist abgelaufen oder wurde bereits verwendet. Bitte den Workspace-Inhaber um eine neue Einladung.",
      wrongAccountTitle: "Falsches Konto",
      wrongAccountBody:
        "Diese Einladung ging an {invited}, du bist aber als {current} angemeldet. Melde dich ab und mit der eingeladenen Adresse wieder an, um sie anzunehmen.",
      goToDashboard: "Zum Dashboard",
      signOut: "Abmelden",
    },
    handoff: {
      signingIn: "Du wirst angemeldet…",
      returning: "Zurück zu CaptureFlow…",
      open: "CaptureFlow öffnen",
      hint: "Wenn nichts passiert, klicke auf die Schaltfläche oben. Du kannst diesen Tab schließen, sobald sich die Desktop-App wieder öffnet.",
      extensionDone: "Angemeldet als {email}. Du kannst diesen Tab schließen.",
      extensionUnreachable:
        "Die CaptureFlow-Erweiterung ist nicht erreichbar. Prüfe, ob sie installiert ist, und klicke dann auf ihr Symbol, um es noch einmal zu versuchen.",
      extensionUnverified:
        "Die Erweiterung konnte nicht überprüft werden. Installiere sie neu und versuch es noch einmal.",
    },
  },
  shell: {
    record: {
      newRecording: "Neue Aufnahme",
    },
    nav: {
      toggleSidebar: "Seitenleiste ein- oder ausblenden",
      dashboard: "Dashboard",
      recordings: "Aufnahmen",
      screenshots: "Screenshots",
      canvas: "Leinwand",
      workspaceGroup: "Workspace",
      members: "Mitglieder",
      settings: "Einstellungen",
      personal: "Persönlich",
      workspace: "Workspace",
      billing: "Abrechnung",
      admin: "Admin",
    },
    upgradeCard: {
      title: "Deinen Workspace upgraden",
      description:
        "Der kostenlose Tarif umfasst {recordings} Aufnahmen pro Person im Datensparmodus. Bezahlte Tarife heben die Limits auf, ab {price} pro Mitglied.",
      viewPlans: "Tarife ansehen",
    },
    topBar: {
      upgrade: "Upgrade",
    },
    workspaceSwitcher: {
      switchWorkspace: "Workspace wechseln",
      summary: "one:Standard · {n} Mitglied|other:Standard · {n} Mitglieder",
      workspaces: "Workspaces",
      owned: "Gehört dir",
      joined: "Beigetreten",
      newWorkspace: "Neuer Workspace",
      inviteMembers: "Mitglieder einladen",
    },
    drawer: {
      open: "Workspace-Menü öffnen",
      title: "Workspace-Menü",
    },
    search: {
      prompt: "Deine Aufnahmen und Screenshots durchsuchen",
      clear: "Suche löschen",
      results: "Suchergebnisse",
      hint: "Durchsuche deine Aufnahmen und Screenshots nach Titel.",
      noMatches: "Keine Treffer",
      kind: {
        recording: "Aufnahme",
        screenshot: "Screenshot",
      },
    },
    account: {
      menu: "Kontomenü",
      nav: {
        billing: "Abrechnung",
        devices: "Verbundene Geräte",
        settings: "Einstellungen",
        support: "Support kontaktieren",
      },
      freePlan: "Kostenlos",
      signOut: "Abmelden",
      signingOut: "Wird abgemeldet…",
    },
    theme: {
      label: "Design",
      light: "Hell",
      dark: "Dunkel",
      system: "System",
    },
    notifications: {
      title: "Benachrichtigungen",
      subtitle: "Einladungen und Änderungen in deinen Workspaces.",
      bellUnread: "other:Benachrichtigungen, {n} ungelesen",
      viewAll: "Alle anzeigen",
      menuEmpty:
        "Du bist auf dem neuesten Stand. Einladungen, neue Teammitglieder und Rollenänderungen erscheinen hier.",
      pageEmpty:
        "Du bist auf dem neuesten Stand. Wenn dich jemand einlädt, deinem Workspace beitritt oder deine Rolle ändert, siehst du es hier.",
      accept: "Annehmen",
      decline: "Ablehnen",
      unread: "Ungelesen",
      someone: "Jemand",
      message: {
        invited: {
          member: "{actor} hat dich als Mitglied zu {workspace} eingeladen",
          viewer: "{actor} hat dich als Betrachter zu {workspace} eingeladen",
        },
        joined: {
          member: "{actor} ist {workspace} als Mitglied beigetreten",
          viewer: "{actor} ist {workspace} als Betrachter beigetreten",
        },
        seatRequested:
          "{actor} hat um einen bezahlten Platz in {workspace} gebeten",
        seatDenied: "{actor} hat deine Platzanfrage in {workspace} abgelehnt",
        roleChanged: {
          member: "{actor} hat dich in {workspace} zum Mitglied gemacht",
          viewer: "{actor} hat dich in {workspace} zum Betrachter gemacht",
        },
        downgraded: "{actor} hat dich in {workspace} auf Betrachter umgestellt",
        keepRecordingUntil: "Du kannst noch bis {date} aufnehmen.",
        removed: "{actor} hat dich aus {workspace} entfernt",
      },
      acceptErrors: {
        failed: "Die Einladung konnte nicht angenommen werden",
        signedOut: "Melde dich an, um die Einladung anzunehmen",
        invalid: "Diese Einladung ist abgelaufen oder wurde zurückgezogen",
        emailMismatch: "Diese Einladung gilt für eine andere E-Mail-Adresse",
        alreadyMember: "Du bist bereits in diesem Workspace",
      },
    },
    mobileNav: {
      open: "Menü öffnen",
      close: "Menü schließen",
      docs: "Doku",
      star: "Stern auf GitHub vergeben",
      signIn: "Anmelden",
      getStarted: "Loslegen",
    },
    skeletons: {
      avatar: "Profilbild",
      workspaceName: "Workspace-Name",
      workspaceLogo: "Workspace-Logo",
    },
  },
  library: {
    dashboard: {
      welcome: "Willkommen zurück",
      welcomeName: "Willkommen zurück, {name}",
      openCanvas: "Leinwand öffnen",
      newRecording: "Neue Aufnahme",
      stats: {
        recordings: "Aufnahmen",
        plusScreenshots:
          "one:Dazu {count} Screenshot|other:Dazu {count} Screenshots",
        noScreenshots: "Noch keine Screenshots",
        views: "Aufrufe",
        viewsAverage: "Im Schnitt {count} pro Aufnahme",
        noViews: "Noch keine Aufrufe",
        recorded: "Aufgenommen",
        recordedAverage: "Im Schnitt {duration} pro Aufnahme",
        nothingRecorded: "Noch nichts aufgenommen",
        recordingsLeft: "Verbleibende Aufnahmen",
        leftOfAllowance: "{left} von {allowance}",
        freePlanLimit: "Kostenloser Tarif, je bis zu {minutes} Min.",
      },
      recordedTime: {
        minutes: "{minutes} Min.",
        hours: "{hours} Std.",
        hoursMinutes: "{hours} Std. {minutes} Min.",
      },
      recent: {
        title: "Neueste Aufnahmen",
        all: "Alle Aufnahmen",
        empty: "In diesem Workspace wurde noch nichts geteilt.",
        views: "one:{n} Aufruf|other:{n} Aufrufe",
        comments: "one:{n} Kommentar|other:{n} Kommentare",
        reactions: "one:{n} Reaktion|other:{n} Reaktionen",
      },
      start: {
        title: "Mit {product} aufnehmen",
        surfacesLabel: "Wo du aufnimmst",
        surfaces: {
          extension: "Erweiterung",
          desktop: "Desktop-App",
          canvas: "Leinwand",
        },
        extension: {
          description:
            "Nimm über die Symbolleiste einen Tab, ein Fenster oder den ganzen Bildschirm auf und erhalte einen Link, den du mit jedem teilen kannst.",
          record: "Jetzt aufnehmen",
          addToChrome: "Zu Chrome hinzufügen",
        },
        desktop: {
          description:
            "Eine native Mac-App, die Bildschirm und Kamera mit Systemton aufnimmt, ist in Arbeit. Bis dahin nimmt die Erweiterung jeden Tab, jedes Fenster oder den ganzen Bildschirm auf.",
          download: "Für Mac herunterladen",
          comingSoon: "Demnächst",
        },
        canvas: {
          description:
            "Eine leere Fläche mit Stiften, Formen und Text, auf der du beim Aufnehmen zeichnen kannst, wenn es keine Seite zu zeigen gibt.",
        },
      },
    },
    recording: {
      pageTitle: "Aufnahmen",
      count: "one:{n} Aufnahme|other:{n} Aufnahmen",
      untitled: "Unbenannte Aufnahme",
      aiGenerated: "KI-generiert",
      processing: "Wird verarbeitet",
      noMatches: "Keine Aufnahmen passen zu diesen Filtern.",
      empty:
        "Du hast noch keine Links zu Aufnahmen erstellt. Nimm in der CaptureFlow-Desktop-App auf, dann erscheinen deine Aufnahmen hier.",
      selectAll: "Alle Aufnahmen auswählen",
      selected: "one:{n} Aufnahme ausgewählt|other:{n} Aufnahmen ausgewählt",
      open: "Aufnahme öffnen",
      edit: "Aufnahme bearbeiten",
      share: "Aufnahme teilen",
      delete: "Aufnahme löschen",
      deleteTitle: "Diese Aufnahme löschen?",
      deleteDescription:
        "Das Video und sein Link funktionieren sofort nicht mehr. Das lässt sich nicht rückgängig machen.",
      deleteSelectedTitle:
        "one:{n} Aufnahme löschen?|other:{n} Aufnahmen löschen?",
    },
    screenshot: {
      pageTitle: "Screenshots",
      count: "one:{n} Screenshot|other:{n} Screenshots",
      untitled: "Unbenannter Screenshot",
      numbered: "Screenshot {id}",
      noMatches: "Keine Screenshots passen zu diesen Filtern.",
      empty:
        "Noch keine Screenshots. Öffne CaptureFlow → Tab „Screenshot“ → wähle „Display“, „Window“ oder „Area“ für die Aufnahme. Dein Screenshot erscheint automatisch hier.",
      selectAll: "Alle Screenshots auswählen",
      selected:
        "one:{n} Screenshot ausgewählt|other:{n} Screenshots ausgewählt",
      open: "Screenshot öffnen",
      edit: "Screenshot bearbeiten",
      share: "Screenshot teilen",
      delete: "Screenshot löschen",
      deleteTitle: "Diesen Screenshot löschen?",
      deleteDescription:
        "Das Bild und sein Link funktionieren sofort nicht mehr. Das lässt sich nicht rückgängig machen.",
      deleteSelectedTitle:
        "one:{n} Screenshot löschen?|other:{n} Screenshots löschen?",
    },
    filters: {
      access: "Zugriff",
      sort: "Sortierung",
      current: "{label}: {value}",
      accessOptions: {
        all: "Beliebiger Zugriff",
        public: "Öffentlich",
        workspace: "Workspace",
        private: "Privat",
      },
      sortOptions: {
        newest: "Neueste zuerst",
        oldest: "Älteste zuerst",
        views: "Meiste Aufrufe",
      },
    },
    card: {
      select: "{title} auswählen",
      moreActions: "Weitere Aktionen",
      rename: "Umbenennen",
      unknownAuthor: "Unbekannt",
    },
    selection: {
      deleteDescription: "Ihre Links funktionieren sofort nicht mehr.",
      deleteFailed:
        "Bei {failed} von {count} ist das Löschen fehlgeschlagen. Der Rest ist gelöscht.",
      clear: "Auswahl aufheben",
    },
    pager: {
      label: "Seiten",
      previous: "Vorherige Seite",
      next: "Nächste Seite",
    },
    visibility: {
      label: "Sichtbarkeit",
      labels: {
        public: "Öffentlich",
        workspace: "Workspace",
        private: "Privat",
      },
      descriptions: {
        public: "Für jeden mit dem Link sichtbar",
        workspace: "Nur für angemeldete Workspace-Mitglieder sichtbar",
        private: "Nur für dich sichtbar",
      },
      workspaceNamed: "Workspace · {name}",
    },
    share: {
      title: "Teilen",
      embed: "Einbetten",
      embedPublic: "Wird überall abgespielt, wo der Code eingefügt wird.",
      embedRestricted:
        "Wird nur für Personen abgespielt, die den Link bereits öffnen können.",
      copyCode: "Code kopieren",
      generalAccess: "Allgemeiner Zugriff",
      generalAccessCurrent: "Allgemeiner Zugriff: {access}",
      copyLink: "Link kopieren",
      linkCopied: "Link kopiert",
      shareAt: "Ab {time} teilen",
      socialHeading: "Teilen auf",
      socialText: "Schau dir „{title}“ an",
      email: "E-Mail",
    },
    editableTitle: {
      label: "Titel der Aufnahme",
      rename: "Aufnahme umbenennen",
    },
  },
  members: {
    title: "Mitglieder",
    databaseUnavailable: "Datenbank nicht verfügbar.",
    role: "Rolle",
    status: "Status",
    roles: {
      owner: "Admin",
      member: "Mitglied",
      viewer: "Betrachter",
    },
    roleHints: {
      member: {
        does: "Nimmt in diesem Workspace auf.",
        costs: "Ein bezahlter Platz bei Light und Pro.",
      },
      viewer: {
        does: "Kann ansehen und kommentieren.",
        costs: "Immer kostenlos.",
      },
    },
    statuses: {
      active: "Aktiv",
      invited: "Eingeladen",
    },
    seatSummary: {
      members: "one:{n} Mitglied|other:{n} Mitglieder",
      viewers: "one:{n} Betrachter|other:{n} Betrachter",
      paidSeats: "one:{n} bezahlter Platz|other:{n} bezahlte Plätze",
      membersAndViewers: "{members} und {viewers}",
      onPaidSeats:
        "{people}, {seats}. Jedes Mitglied belegt einen Platz; Betrachter sind kostenlos.",
      membersFree: "{people}. Mitglieder sind in diesem Tarif kostenlos.",
      freePlan:
        "{people}. Kostenloser Tarif: Jedes Mitglied erhält {recordings} Aufnahmen von bis zu {minutes} Minuten; Betrachter können ansehen und kommentieren.",
      planTitle: "{plan}-Tarif",
      paidPlanTitle: "Bezahlter Tarif",
      freePlanTitle: "Kostenloser Tarif",
      upgrade: "Workspace upgraden",
    },
    table: {
      intro:
        "Mitglieder nehmen hier auf; Betrachter können ansehen und kommentieren.",
      ownerIntro:
        "Als Inhaber kannst du einladen, entfernen und Rollen ändern.",
      searchPlaceholder: "Name oder E-Mail-Adresse",
      searchLabel: "Mitglieder suchen",
      allRoles: "Alle Rollen",
      everyone: "Alle",
      columns: {
        name: "Name",
        dateAdded: "Hinzugefügt am",
        email: "E-Mail-Adresse",
        actions: "Aktionen",
      },
      empty: "Niemand passt zu diesen Filtern.",
      downgradeNote: "Betrachter ab {date} · {keep}",
      keepAsMember: "Als Mitglied behalten",
      revoke: "Widerrufen",
    },
    seatRequests: {
      title: "Platzanfragen",
      description:
        "Diese Betrachter möchten aufnehmen. Wer genehmigt wird, wird Mitglied.",
      descriptionPaid:
        "Diese Betrachter möchten aufnehmen. Wer genehmigt wird, wird Mitglied, und es kommt ein bezahlter Platz hinzu.",
      asked: "{email} · angefragt am {date}",
      deny: "Ablehnen",
      approve: "Genehmigen",
    },
    seatConfirm: {
      addTitle: "{name} einen bezahlten Platz geben?",
      addBody:
        "Mitglieder nehmen auf, daher ist jedes ein bezahlter Platz. Die Zahl der Plätze in deinem {plan}-Tarif steigt von {seats} auf {nextSeats}, der Preis von {before} auf {after} pro Monat.",
      addBodyYearly:
        "Mitglieder nehmen auf, daher ist jedes ein bezahlter Platz. Die Zahl der Plätze in deinem {plan}-Tarif steigt von {seats} auf {nextSeats}, der Preis von {before} auf {after} pro Monat bei jährlicher Abrechnung.",
      addInvoice:
        "Der Rest dieses Abrechnungszeitraums wird auf deine nächste Rechnung gesetzt.",
      addConfirm: "Bezahlten Platz hinzufügen",
      removeTitle: "{name} auf Betrachter umstellen?",
      removeBody:
        "{name} kann noch bis {date} aufnehmen, dem Ende des bereits bezahlten Zeitraums, und wird danach Betrachter. Betrachter können ansehen und kommentieren, aber nicht aufnehmen.",
      removePlan:
        "Ab dann sinkt die Zahl der Plätze in deinem {plan}-Tarif von {seats} auf {nextSeats}, der Preis von {before} auf {after} pro Monat.",
      removePlanYearly:
        "Ab dann sinkt die Zahl der Plätze in deinem {plan}-Tarif von {seats} auf {nextSeats}, der Preis von {before} auf {after} pro Monat bei jährlicher Abrechnung.",
      removeConfirm: "Auf Betrachter umstellen",
    },
    remove: {
      label: "{name} aus dem Workspace entfernen",
      title: "{name} aus {workspace} entfernen?",
      body: "Die Person verliert sofort den Zugriff. Ihre Aufnahmen und Screenshots bleiben im Workspace.",
      freesSeat:
        "Damit wird ihr bezahlter Platz frei: Die Zahl der Plätze in deinem Tarif sinkt von {seats} auf {nextSeats}.",
    },
    leave: {
      button: "Verlassen",
      title: "{workspace} verlassen?",
      body: "Du verlierst den Zugriff auf die Aufnahmen und Screenshots dort. Alles, was du dort aufgenommen hast, bleibt im Workspace.",
      comeBack: "Um zurückzukommen, muss dich jemand erneut einladen.",
      confirm: "Workspace verlassen",
    },
    invite: {
      trigger: "Mitglieder einladen",
      title: "Mitglieder zu {workspace} einladen",
      titleOwnWorkspace: "Mitglieder in deinen Workspace einladen",
      description:
        "Sie erhalten eine E-Mail mit einem Link, der nach 7 Tagen abläuft. Achte darauf, dass sie sich mit derselben Adresse anmelden.",
      removeEmail: "{email} entfernen",
      addEmails: "E-Mail-Adressen hinzufügen",
      separatorHint:
        "Trenne E-Mail-Adressen mit Leerzeichen, Komma oder Eingabetaste.",
      paidSeatNote:
        "Jedes Mitglied, das annimmt, fügt deinem {plan}-Tarif einen bezahlten Platz hinzu, für je {price} pro Monat. Der Rest dieses Zeitraums wird auf deine nächste Rechnung gesetzt.",
      noEmails: "Füge mindestens eine E-Mail-Adresse hinzu",
      invalidEmails: "Keine gültige E-Mail-Adresse: {emails}",
      failed: "Fehlgeschlagen",
      sent: "one:{n} Einladung gesendet.|other:{n} Einladungen gesendet.",
      sending: "Wird gesendet…",
      submit: "Einladungen senden",
    },
    actions: {
      emailRequired: "Gib eine E-Mail-Adresse ein",
      emailInvalid: "Das sieht nicht nach einer gültigen E-Mail-Adresse aus",
      ownWorkspace: "Du bist bereits in deinem eigenen Workspace",
      alreadyMember: "Diese Person ist bereits Mitglied in diesem Workspace",
      emailNotSent:
        "Die Einladung wurde erstellt, aber die E-Mail konnte nicht zugestellt werden. Kopiere den Link aus der Liste der ausstehenden Einladungen.",
      invitationSent: "Einladung an {email} gesendet",
      alreadyRecording: "Du kannst hier bereits aufnehmen",
    },
  },
  settings: {
    saved: "Gespeichert",
    errors: {
      ownerOnly: "Nur der Workspace-Inhaber kann das ändern",
      databaseUnavailable: "Datenbank nicht verfügbar",
      saveFailed: "Speichern fehlgeschlagen – versuch es noch einmal",
    },
    upload: {
      uploading: "Wird hochgeladen…",
      missing: "Wähle eine Bilddatei aus",
      failed: "Upload fehlgeschlagen",
      failedReason: "Upload fehlgeschlagen: {reason}",
    },
    personal: {
      title: "Persönliche Einstellungen",
      account: {
        title: "Konto",
        description:
          "So erscheinst du für Teammitglieder und für alle, die deine Aufnahmen ansehen.",
      },
      preferences: {
        title: "Präferenzen",
        description: "Aussehen und Sprache von CaptureFlow für dich.",
      },
      languageDescription:
        "Die Sprache, in der CaptureFlow dir angezeigt wird.",
    },
    avatar: {
      label: "Profilbild",
      change: "Profilbild ändern",
      removing: "Wird entfernt…",
      hint: "JPG, PNG, WebP oder GIF. Max. 2 MB.",
      tooLarge: "Das Profilbild darf höchstens 2 MB groß sein",
      badType: "Das Profilbild muss PNG, JPEG, WebP oder GIF sein",
    },
    account: {
      name: {
        label: "Vollständiger Name",
        placeholder: "Dein Name",
        description:
          "Wird bei Aufnahmen, Screenshots und Aktivitätseinträgen angezeigt.",
        required: "Name ist erforderlich.",
        updateFailed: "Der Name konnte nicht geändert werden.",
      },
      email: {
        label: "E-Mail-Adresse",
        description:
          "Wird für die Anmeldung verwendet. Kontaktiere den Support, um sie zu ändern.",
      },
      userId: {
        label: "Benutzer-ID",
        copy: "Benutzer-ID kopieren",
        description: "Gib sie an, wenn du den Support kontaktierst.",
      },
      saveChanges: "Änderungen speichern",
    },
    workspace: {
      title: "Workspace-Einstellungen",
      tabs: {
        label: "Einstellungsbereiche",
        general: "Allgemein",
        security: "Sicherheit",
      },
      general: {
        title: "Allgemein",
        description:
          "Name und Logo, die diesen Workspace in der Workspace-Auswahl, auf der Mitgliederseite und in Link-Vorschauen kennzeichnen.",
      },
      name: {
        title: "Workspace-Name",
        description: "Der Name, unter dem dein Workspace erscheint.",
        empty: "Der Workspace-Name darf nicht leer sein",
        tooLong: "Der Workspace-Name ist zu lang (max. {max} Zeichen)",
      },
      logo: {
        title: "Workspace-Logo",
        description:
          "Wird neben deinem Workspace-Namen angezeigt. PNG, JPEG, WebP, GIF oder SVG, max. 2 MB.",
        upload: "Logo hochladen",
        replace: "Logo ersetzen",
        tooLarge: "Das Logo darf höchstens 2 MB groß sein",
        badType: "Das Logo muss PNG, JPEG, WebP, GIF oder SVG sein",
      },
      permissions: {
        title: "Standardberechtigungen",
        description:
          "Einstellungen, die für jede neue Aufnahme und jeden neuen Screenshot im Workspace gelten.",
      },
      recordingAccess: {
        title: "Aufnahmerechte",
        description:
          "Lege fest, ob Teammitglieder Aufnahmen und Screenshots in diesen Workspace posten dürfen.",
        allow: {
          title: "Teammitglieder dürfen hier posten",
          body: "Mitglieder können in diesem Workspace aufnehmen.",
        },
        ownerOnly: {
          title: "Nur der Workspace-Inhaber",
          body: "Uploads von Teammitgliedern landen in ihrem persönlichen Workspace.",
        },
      },
    },
    devices: {
      title: "Verbundene Geräte",
      count: "one:{n} Gerät angemeldet|other:{n} Geräte angemeldet",
      empty:
        "Keine verbundenen Geräte. Öffne die CaptureFlow-Desktop-App und klicke in der Aufnahmeleiste auf „Sign in“, um dieses Konto zu verknüpfen.",
      unlabelled: "Unbenanntes Gerät",
      added: "Hinzugefügt am {date}",
      addedLastUsed: "Hinzugefügt am {date} · zuletzt verwendet am {lastUsed}",
      neverUsed: "Nie verwendet",
      revoke: {
        action: "Zugriff entziehen",
        title: "Dieses Gerät abmelden?",
        description: "Es muss sich erneut anmelden, um Aufnahmen zu verwalten.",
      },
    },
  },
  billing: {
    chargedInUsd: "Abgerechnet in US-Dollar.",
    shownIn:
      "Preise werden in {currency} angezeigt. Abgerechnet wird in US-Dollar.",
    page: {
      title: "Abrechnung",
      subtitle: "Dein Tarif und was du davon genutzt hast.",
      workspaceLabel: "Workspace · {name}",
      manageSubscription: "Abo verwalten",
      upgradeWorkspace: "Workspace upgraden",
      storage: "Workspace-Speicher",
      usedOfLimit: "{used} von {limit}",
      usedNoLimit: "{used} – kein Limit",
    },
    loading: {
      plan: "Tarif",
      usage: "Nutzung",
    },
    counts: {
      members: "one:{n} Mitglied|other:{n} Mitglieder",
      paidSeats: "one:{n} bezahlter Platz|other:{n} bezahlte Plätze",
      freeViewers:
        "one:{n} kostenloser Betrachter|other:{n} kostenlose Betrachter",
    },
    plan: {
      free: "Kostenlos",
      paid: "Bezahlt",
      billedMonthly: "Monatliche Abrechnung",
      billedYearly: "Jährliche Abrechnung",
      freeSummary:
        "{members} · bis zu {recordings} Aufnahmen pro Person, je {minutes} Minuten, Datensparmodus",
    },
    status: {
      onTrial: "Testphase",
      active: "Aktiv",
      paused: "Pausiert",
      pastDue: "Zahlung fehlgeschlagen",
      unpaid: "Unbezahlt",
      cancelled: "Gekündigt",
      expired: "Abgelaufen",
    },
    details: {
      youPay: "Du zahlst",
      amountPerMonth: "{amount} pro Monat",
      amountPerYear: "{amount} pro Jahr",
      seatsMonthly:
        "one:{n} Platz × {price} pro Monat|other:{n} Plätze × {price} pro Monat",
      seatsYearly:
        "one:{n} Platz × {price} pro Monat, {total} pro Monat bei jährlicher Abrechnung|other:{n} Plätze × {price} pro Monat, {total} pro Monat bei jährlicher Abrechnung",
      nextPayment: "Nächste Zahlung",
      ends: "Endet",
      endOfPeriod: "Am Ende dieses Zeitraums",
      amountOnDate: "{amount} am {date}",
      firstPaymentPending: "Sobald die erste Zahlung verbucht ist",
      estimate: "{base} · {change}, geschätzt",
      baseForSeats: "one:{amount} für {n} Platz|other:{amount} für {n} Plätze",
      seatsAdded:
        "one:{amount} für {n} in diesem Zeitraum hinzugefügten Platz|other:{amount} für {n} in diesem Zeitraum hinzugefügte Plätze",
      seatsRemoved:
        "one:{amount} Gutschrift für {n} in diesem Zeitraum entfernten Platz|other:{amount} Gutschrift für {n} in diesem Zeitraum entfernte Plätze",
      seatChanges: "{amount} für Platzänderungen in diesem Zeitraum",
      seats: "Plätze",
      seatsAndViewers: "{seats}, {viewers}",
      billedTo: "Rechnung an",
      paymentMethod: "Zahlungsmethode",
      cardEnding: "{brand} endet auf {last4}",
      card: "Karte",
      updateCard: "Aktualisieren",
    },
    switchPlan: {
      switchTo: "Zu {plan} wechseln",
      title: "Zu {plan} wechseln?",
      priceMonthly:
        "one:Dein {n} Platz kostet dann {after} statt {before} pro Monat.|other:Deine {n} Plätze kosten dann {after} statt {before} pro Monat.",
      priceYearly:
        "one:Dein {n} Platz kostet dann {after} statt {before} pro Monat bei jährlicher Abrechnung.|other:Deine {n} Plätze kosten dann {after} statt {before} pro Monat bei jährlicher Abrechnung.",
      benefits:
        "{plan} nimmt in jeder Qualität bis 60 fps auf und bietet zusätzlich KI-Bearbeitung.",
      timing:
        "Der Wechsel gilt sofort. Die Differenz für den Rest dieses Abrechnungszeitraums wird auf deine nächste Rechnung gesetzt.",
      errors: {
        failed: "Der Tarif konnte nicht geändert werden",
        unknownPlan: "Unbekannter Tarif",
        billingUnavailable: "Die Abrechnung ist nicht verfügbar",
        noSubscription: "Dieser Workspace hat kein aktives Abo",
        cancelled: "Setze das Abo fort, bevor du den Tarif änderst",
        unavailable: "Tarifwechsel sind derzeit nicht möglich",
        rejected:
          "Die Abrechnung hat die Änderung nicht akzeptiert. Versuch es noch einmal.",
      },
    },
    upgrade: {
      title: "{name} upgraden",
      billingCycle: "Zahlweise",
      cycles: {
        monthly: "Monatlich",
        annual: "Jährlich",
      },
      annualSaving: "{percent} % sparen",
      seatPicker: {
        title: "Wer einen bezahlten Platz bekommt",
        selected: "{seats} von {total}",
        description:
          "Ausgewählte Personen nehmen auf und werden abgerechnet. Alle anderen sind kostenlose Betrachter, die ansehen, kommentieren und reagieren, aber nicht aufnehmen können. Die Rollen ändern sich mit dem Upgrade.",
        selectAll: "Alle auswählen",
        clear: "Auswahl aufheben",
        you: "(du)",
        paidSeat: "Bezahlter Platz",
        viewer: "Betrachter",
      },
      perMonth: "pro Monat",
      seatsPrice: "one:{n} Platz × {price}|other:{n} Plätze × {price}",
      viewersFree:
        "one:{n} Betrachter kostenlos|other:{n} Betrachter kostenlos",
      priceWithViewers: "{seats}, {viewers}",
      priceYearly: "{seats}, bei jährlicher Abrechnung",
      priceWithViewersYearly: "{seats}, {viewers}, bei jährlicher Abrechnung",
      upgradeTo: "Auf {plan} upgraden",
      checkoutUnavailable: "Checkout ist nicht eingerichtet",
    },
    requestSeat: {
      request: "Aufnahmerecht anfragen",
      requested: "Platz angefragt",
      hint: "Du bist hier Betrachter. Bitte den Inhaber um einen bezahlten Platz, damit du aufnehmen kannst.",
      requestedHint:
        "Der Inhaber wurde gefragt. Du kannst aufnehmen, sobald die Anfrage genehmigt ist.",
      failed: "Die Anfrage konnte nicht gesendet werden",
    },
  },
  actions: {
    missingSlug: "Slug fehlt",
    recordingNotFound: "Aufnahme nicht gefunden",
    backgroundMissing: "Wähle ein Bild zum Hochladen",
    backgroundTooLarge: "Bilder dürfen höchstens 5 MB groß sein",
    backgroundBadType: "Verwende ein PNG-, JPEG- oder WebP-Bild",
    backgroundFailed:
      "Das Bild konnte nicht hochgeladen werden. Versuch es noch einmal.",
    invalidVisibility: "Ungültige Sichtbarkeit",
    deleteVideoFailed: "Die Videodatei konnte nicht gelöscht werden: {reason}",
    transcriptNotFound: "Transkript nicht gefunden",
    transcriptEmpty:
      "Das Transkript darf nicht leer sein. Setze es stattdessen zurück.",
    missingTokenId: "Token-ID fehlt",
    tokenNotFound: "Token nicht gefunden",
    missingScreenshotId: "Screenshot-ID fehlt",
    screenshotNotFound: "Screenshot nicht gefunden",
    missingImageBytes: "Bilddaten fehlen",
    screenshotTooLarge:
      "Der bearbeitete Screenshot überschreitet die maximale Größe pro Screenshot.",
    saveScreenshotFailed:
      "Der Screenshot konnte nicht gespeichert werden: {reason}",
    saveFailed: "Speichern fehlgeschlagen: {reason}",
    invalidCanvasDimensions:
      "Speichern fehlgeschlagen: ungültige Canvas-Abmessungen",
  },
  viewer: {
    meta: {
      defaultTitle: "{product}-Aufnahme",
      defaultDescription: "Eine über {product} geteilte Bildschirmaufnahme.",
      preparingTitle: "Aufnahme wird vorbereitet… – {product}",
      notFoundTitle: "Nicht gefunden",
      description:
        "Eine über {product} geteilte Bildschirmaufnahme. Sieh sie dir im Browser an, ganz ohne Registrierung.",
      descriptionTimed:
        "Eine {duration} lange, über {product} geteilte Bildschirmaufnahme. Sieh sie dir im Browser an, ganz ohne Registrierung.",
    },
    loading: "Aufnahme wird geladen…",
    nav: {
      download: "Herunterladen",
    },
    authPrompt: {
      pricing: "Preise",
      logIn: "Anmelden",
      getStarted: "Loslegen",
      getFree: "{product} kostenlos nutzen",
    },
    postedBy: {
      label: "Gepostet von",
      someone: "Jemand",
    },
    views: {
      count: "one:{count} Aufruf|other:{count} Aufrufe",
      showWhoWatched: "{views}, anzeigen, wer sie angesehen hat",
      viewers: "Betrachter",
      emptyTitle: "Noch keine Aufrufe",
      emptyDescription:
        "Teile den Link, dann erscheint hier, wer die Aufnahme ansieht.",
      signedInViewer: "Angemeldeter Betrachter",
      anonymous: "Anonym",
    },
    actions: {
      share: "Teilen",
      visibilityFailed: "Die Sichtbarkeit konnte nicht geändert werden",
      deleteFailed: "Die Aufnahme konnte nicht gelöscht werden",
    },
    requestAccess: {
      title: "Zugriff anfragen, um dieses Video anzusehen",
      notSharedBy: "{name} hat diese Aufnahme noch nicht mit dir geteilt.",
      notSharedByOwner:
        "Der Inhaber hat diese Aufnahme noch nicht mit dir geteilt.",
      signInHint:
        "Melde dich mit deiner geschäftlichen E-Mail-Adresse an – wenn du bereits zum Team des Inhabers gehörst, kommst du direkt rein.",
      signIn: "Anmelden, um fortzufahren",
      sentTitle: "Anfrage gesendet",
      sentDescription:
        "Wir haben den Inhaber informiert. Du bekommst eine E-Mail, wenn er dir Zugriff gewährt.",
      askingAs: "Anfrage als {email}",
      noteLabel: "Notiz hinzufügen {optional}",
      noteOptional: "(optional)",
      notePlaceholder:
        "Hallo, ich würde mir gern diese Aufnahme vom gestrigen Review ansehen.",
      sending: "Wird gesendet…",
      submit: "Zugriff anfragen",
      failed: "Etwas ist schiefgelaufen. Versuch es gleich noch einmal.",
    },
    pending: {
      preparingTitle: "Deine Aufnahme wird vorbereitet…",
      preparingDescription:
        "Der Upload wird noch abgeschlossen. Diese Seite aktualisiert sich von selbst, sobald die Aufnahme bereit ist.",
      generatingTitle: "Dein Video wird erstellt…",
      generatingDescription:
        "Das kann ein paar Minuten dauern – hol dir einen Kaffee oder einen Snack ☕️🍪 Die Seite aktualisiert sich von selbst, sobald es fertig ist.",
      failedTitle: "Diese Aufnahme wurde nicht vollständig hochgeladen",
      failedDescription:
        "Der Link wurde erstellt, aber das Video ist nie angekommen. Versuch den Link in einer Minute noch einmal oder nimm neu auf.",
      comment: "Kommentieren",
    },
    upgradeBanner: {
      message:
        "{usage} im kostenlosen Tarif. Upgrade für unbegrenzte Aufnahmen in voller Qualität.",
      usage: "other:{used} von {n} Aufnahmen genutzt",
    },
    editPanel: {
      editTitle: "Video bearbeiten",
      editDescription:
        "Kürze, schneide, ändere das Aussehen und korrigiere das Transkript im Editor.",
      downloadTitle: "Video herunterladen",
      downloadDescription: "Die gesamte Aufnahme als MP4.",
      copyEmbed: "Einbettungscode kopieren",
      embedCopied: "Einbettungscode kopiert",
      embedDescription: "Füge den Player in eine beliebige Webseite ein.",
    },
    notFound: {
      title: "Aufnahme nicht gefunden",
      description:
        "Dieser Link ist abgelaufen oder hat nie existiert. Aufnahmen kostenloser Konten werden 30 Tage ab dem letzten Aufruf aufbewahrt.",
      madeWith: "Erstellt mit {product}",
    },
  },
  activity: {
    sidebar: {
      label: "Seitenleiste der Aufnahme",
      activityTab: "Aktivität",
      transcriptTab: "Transkript",
      toolsTab: "Werkzeuge",
    },
    you: "Du",
    anonymous: "Anonym",
    jumpToMoment: "Zu dieser Stelle springen",
    empty: {
      title: "Noch keine Aktivität",
      description:
        "Reaktionen und Kommentare von Betrachtern erscheinen hier, sobald sie eintreffen.",
      firstTitle: "Schreib den ersten Kommentar",
      firstTitleNamed: "Schreib den ersten Kommentar, {name}",
      hint: "Drücke {key}, um zu antworten, oder hinterlasse unten in diesem Bereich einen Kommentar.",
      focusComposer: "Kommentarfeld fokussieren",
    },
    composer: {
      signIn: "Anmelden, um zu reagieren und zu kommentieren",
      placeholder: "Kommentar hinterlassen…",
      mention: "Jemanden erwähnen",
      noOneToMention: "Noch hat niemand reagiert oder kommentiert",
      insertEmoji: "Emoji einfügen",
      searchEmoji: "Emoji suchen",
      posting: "Wird gepostet…",
      submitAt: "Bei {time} kommentieren",
      postFailed: "Der Kommentar konnte nicht gepostet werden",
    },
    comment: {
      delete: "Kommentar löschen",
      deleteFailed: "Der Kommentar konnte nicht gelöscht werden",
    },
    reaction: {
      count: "one:{n} Reaktion|other:{n} Reaktionen",
      delete: "Reaktion löschen",
      deleteMany: "one:{n} Reaktion löschen|other:{n} Reaktionen löschen",
      deleteFailed: "Die Reaktion konnte nicht gelöscht werden",
    },
    transcript: {
      pendingTitle: "Wird transkribiert…",
      pendingDescription:
        "Das Transkript erscheint hier, sobald es fertig ist.",
      failedTitle: "Transkription nicht abgeschlossen",
      failedDescription:
        "Beim Transkribieren dieser Aufnahme ist etwas schiefgelaufen.",
      noneTitle: "Kein Transkript",
      noneOwnerDescription:
        "Nimm mit eingeschaltetem Mikrofon auf, dann wird eins für dich erstellt.",
      noneViewerDescription: "Diese Aufnahme wurde ohne Mikrofon erstellt.",
      searchLabel: "Transkript durchsuchen",
      noMatches: "Keine Treffer.",
    },
    saveFailed: "Speichern fehlgeschlagen. Versuch es noch einmal.",
    summary: {
      title: "Zusammenfassung",
      add: "Hinzufügen",
      placeholder: "Was passiert in dieser Aufnahme?",
      empty: "Noch keine Zusammenfassung.",
      emptyAction: "Zusammenfassung hinzufügen",
    },
    chapters: {
      title: "Kapitel",
      count: "one:{n} Kapitel|other:{n} Kapitel",
      addAtPlayhead: "An Abspielposition hinzufügen",
      defaultTitle: "Kapitel {n}",
      editHint: "Ein Kapitel pro Zeile, als {short} oder {long}.",
      editHintShort: "M:SS Titel",
      editHintLong: "H:MM:SS Titel",
      editPlaceholder: "0:00 Einleitung\n0:30 Demo\n1:20 Fazit",
      playing: "Läuft",
      remove: "Kapitel entfernen",
      empty: "Noch keine Kapitel.",
      emptyAction: "Eins an der Abspielposition hinzufügen",
    },
  },
  player: {
    overlay: {
      watchAgain: "Noch einmal ansehen",
    },
    captions: {
      track: "Untertitel",
      size: "Größe",
      position: "Position",
      sizes: {
        small: "Klein",
        medium: "Mittel",
        large: "Groß",
      },
      positions: {
        top: "Oben",
        bottom: "Unten",
      },
    },
    reactionBar: {
      comment: "Kommentieren",
      leaveComment: "Kommentar hinterlassen",
    },
    reactions: {
      heart: "Herz",
      thumbsUp: "Daumen hoch",
      fire: "Feuer",
      clap: "Applaus",
      raisedHands: "Erhobene Hände",
      eyes: "Augen",
    },
    embed: {
      title: "{product}-Aufnahme",
    },
    controls: {
      buttons: {
        play: "Abspielen",
        pause: "Pause",
        replay: "Erneut abspielen",
        mute: "Stummschalten",
        unmute: "Stummschaltung aufheben",
      },
      seek: {
        forward: "{seconds} Sekunden vorspulen",
        backward: "{seconds} Sekunden zurückspulen",
      },
      fullscreen: {
        enter: "Vollbildmodus starten",
        exit: "Vollbildmodus beenden",
      },
      captions: {
        enable: "Untertitel einschalten",
        disable: "Untertitel ausschalten",
      },
      pip: {
        enter: "Bild-in-Bild starten",
        exit: "Bild-in-Bild beenden",
      },
      cast: {
        start: "Übertragung starten",
        stop: "Übertragung beenden",
        connecting: "Verbindung wird hergestellt",
      },
      airplay: {
        start: "AirPlay starten",
        stop: "AirPlay beenden",
      },
      slider: {
        seek: "Spulen",
      },
      time: {
        current: "Aktuelle Zeit",
        duration: "Dauer",
        position: "{current} von {duration}",
        unknown: "Medium nicht geladen, Zeit unbekannt.",
      },
      playback: {
        rate: "Wiedergabegeschwindigkeit {rate}",
      },
      volume: {
        mutedValue: "{percent}, stumm",
        muted: "Stumm",
        label: "Lautstärke",
        value: "Lautstärke {value}",
      },
      status: {
        captionsOn: "Untertitel an",
        captionsOff: "Untertitel aus",
        paused: "Pausiert",
        playing: "Wiedergabe läuft",
        fullscreen: "Vollbild",
        pip: "Bild-in-Bild",
        exitPip: "Bild-in-Bild beenden",
        seekedTo: "Zu {time} gesprungen",
      },
      container: {
        label: "Mediaplayer",
      },
      errors: {
        aborted: "Du hast die Wiedergabe vor dem Ende abgebrochen.",
        network:
          "Dieses Medium konnte wegen eines Netzwerk- oder Serverproblems nicht geladen werden.",
        decode:
          "Dieses Medium konnte nicht abgespielt werden. Es ist möglicherweise beschädigt, oder dein Browser unterstützt das Format nicht.",
        source:
          "Dieses Medium konnte nicht geladen werden. Es ist möglicherweise nicht verfügbar, oder dein Browser unterstützt das Format nicht.",
        encrypted:
          "Dieses Medium konnte nicht abgespielt werden, weil es sich nicht entschlüsseln ließ.",
        unplayable: "Dieses Medium wird vom Player nicht unterstützt.",
        title: "Etwas ist schiefgelaufen.",
        unexpected: "Ein unerwarteter Fehler ist aufgetreten.",
      },
      common: {
        ok: "OK",
      },
      menu: {
        settings: "Einstellungen",
        quality: "Qualität",
        audio: "Audio",
        speed: "Geschwindigkeit",
        captions: "Untertitel",
        playbackRate: "Wiedergabegeschwindigkeit",
        off: "Aus",
        auto: "Automatisch",
        autoWithLabel: "Automatisch ({label})",
      },
    },
  },
  screenshotView: {
    page: {
      defaultTitle: "{product}-Screenshot",
      description: "Ein über {product} geteilter Screenshot.",
      madeWith: "Erstellt mit {product}",
      loading: "Screenshot wird geladen…",
    },
    authPrompt: {
      pricing: "Preise",
      logIn: "Anmelden",
      getStarted: "Loslegen",
      getFree: "{product} kostenlos nutzen",
    },
    actions: {
      edit: "Screenshot bearbeiten",
      share: "Teilen",
      shareTitle: "Screenshot teilen",
      copyLink: "Link kopieren",
      linkCopied: "Link kopiert",
      more: "Weitere Aktionen",
      delete: "Screenshot löschen",
      deleteTitle: "Diesen Screenshot löschen?",
      deleteDescription:
        "Das Bild und sein Link funktionieren sofort nicht mehr. Das lässt sich nicht rückgängig machen.",
      visibilityFailed: "Die Sichtbarkeit konnte nicht geändert werden",
      deleteFailed: "Der Screenshot konnte nicht gelöscht werden",
    },
    zoom: {
      expand: "Bild vergrößern",
      minimize: "Bild verkleinern",
    },
    requestAccess: {
      title: "Zugriff anfragen, um diesen Screenshot anzusehen",
      notSharedBy: "{name} hat diesen Screenshot noch nicht mit dir geteilt.",
      notSharedByOwner:
        "Der Inhaber hat diesen Screenshot noch nicht mit dir geteilt.",
      signInHint:
        "Melde dich mit deiner geschäftlichen E-Mail-Adresse an – wenn du bereits zum Team des Inhabers gehörst, kommst du direkt rein.",
      signIn: "Anmelden, um fortzufahren",
      sentTitle: "Anfrage gesendet",
      sentDescription:
        "Wir haben den Inhaber informiert. Du bekommst eine E-Mail, wenn er dir Zugriff gewährt.",
      askingAs: "Anfrage als {email}",
      noteLabel: "Notiz hinzufügen {optional}",
      noteOptional: "(optional)",
      notePlaceholder:
        "Hallo, ich hätte gern eine Kopie dieses Screenshots aus dem Design-Review.",
      sending: "Wird gesendet…",
      submit: "Zugriff anfragen",
      failed: "Etwas ist schiefgelaufen. Versuch es gleich noch einmal.",
    },
    notFound: {
      title: "Screenshot nicht gefunden",
      description:
        "Dieser Link ist abgelaufen oder hat nie existiert. Screenshots kostenloser Konten werden 30 Tage ab dem letzten Aufruf aufbewahrt.",
    },
  },
  recordingEditor: {
    skeleton: {
      label: "Editor wird geöffnet",
      status: "Editor wird geöffnet…",
    },
    preparing: {
      title: "Aufnahme wird vorbereitet…",
      description:
        "Die Aufnahme wird noch hochgeladen. Diese Seite aktualisiert sich automatisch, sobald sie bereit ist.",
    },
    failed: {
      title: "Upload der Aufnahme fehlgeschlagen.",
      description: "Nimm noch einmal mit der Desktop-App auf.",
    },
    saveFailed: "Speichern fehlgeschlagen",
    topBar: {
      back: "Zurück zur Aufnahme",
      status: {
        idle: "Änderungen werden automatisch gespeichert",
        saved: "Gespeichert",
        error: "Speichern fehlgeschlagen",
      },
      versionHistory: "Versionsverlauf (demnächst)",
      undo: "Rückgängig",
      undoShortcut: "Rückgängig ({key})",
      redo: "Wiederholen",
      redoShortcut: "Wiederholen ({key})",
      finish: "Fertig",
    },
    panels: {
      label: "Editor-Bereiche",
      tabs: {
        transcript: "Transkript",
        design: "Design",
        camera: "Kamera",
        audio: "Ton",
        details: "Details",
      },
      hide: {
        transcript: "Transkript ausblenden",
        design: "Design ausblenden",
        camera: "Kamera ausblenden",
        audio: "Ton ausblenden",
        details: "Details ausblenden",
      },
      show: {
        transcript: "Transkript einblenden",
        design: "Design einblenden",
        camera: "Kamera einblenden",
        audio: "Ton einblenden",
        details: "Details einblenden",
      },
    },
    toggleOn: "An",
    background: {
      title: "Hintergrund",
      gradients: "Verläufe",
      none: "Keiner",
      noBackground: "Kein Hintergrund",
      upload: "Bild hochladen",
      uploading: "Wird hochgeladen…",
      uploadedImage: "Eigenes Bild",
      solid: "Einfarbig",
      solidColor: "Einfarbig {color}",
      customColor: "Eigene Farbe wählen",
      colors: "Farben",
      wallpaper: "{group}: Hintergrundbild {n}",
      wallpaperGroups: {
        general: "Allgemein",
        cities: "Städte",
        blue: "Blau",
        purple: "Lila",
        orange: "Orange",
        dark: "Dunkel",
      },
      presets: {
        violet: "Violett",
        sunset: "Abendrot",
        orchid: "Orchidee",
        forest: "Wald",
        flamingo: "Flamingo",
        citrus: "Zitrus",
        arctic: "Arktis",
        ocean: "Ozean",
        deep: "Tiefsee",
        ember: "Glut",
        mint: "Minze",
        dusk: "Dämmerung",
        peach: "Pfirsich",
        midnight: "Mitternacht",
        slate: "Schiefer",
      },
    },
    frame: {
      title: "Rahmen",
      padding: "Abstand",
      corners: "Ecken",
      shadow: "Schatten",
    },
    camera: {
      title: "Kamera",
      show: "Kamera anzeigen",
      hidden: "Ausgeblendet",
      position: "Position",
      positionHint: "Ziehe den Punkt oder tippe auf eine Ecke",
      positionHintHidden: "Zeige die Kamera an, um sie zu platzieren.",
      corners: {
        topLeft: "Oben links",
        topRight: "Oben rechts",
        bottomLeft: "Unten links",
        bottomRight: "Unten rechts",
      },
      size: "Größe",
      sizes: {
        small: "Klein",
        medium: "Mittel",
        large: "Groß",
      },
    },
    audio: {
      title: "Audio",
      systemSound: "Systemton",
      sound: "Ton",
      microphone: "Mikrofon",
      muted: "Stumm",
      sharedTrack:
        "Mikrofon und Systemton teilen sich bei dieser Aufnahme eine Spur.",
    },
    details: {
      title: "Aufnahme",
      link: "Link",
      size: "Größe",
      duration: "Dauer",
      views: "Aufrufe",
      created: "Erstellt",
    },
    transcript: {
      transcribing: "Wird transkribiert…",
      unavailable: "Kein Transkript verfügbar",
      pendingHint: "Lade diese Seite in einer Minute neu, um es zu bearbeiten.",
      failedHint:
        "Die Transkription dieser Aufnahme wurde nicht abgeschlossen.",
      missingHint:
        "Nimm mit eingeschaltetem Mikrofon auf, dann wird eins für dich erstellt.",
      deleteWord: "Wort löschen",
      deleteWords: "one:{n} Wort löschen|other:{n} Wörter löschen",
      clearSelection: "Auswahl aufheben",
      hint: "Klicke auf ein Wort oder ziehe über Wörter, um sie auszuwählen; doppelklicke, um den Text zu korrigieren.",
      resetEdits: "Änderungen zurücksetzen",
      editLine: "Transkriptzeile bearbeiten",
      selectLine: "Zeile bei {time} auswählen",
      restore: "Wiederherstellen",
      saveFailed: "Speichern fehlgeschlagen",
      resetFailed: "Zurücksetzen fehlgeschlagen",
    },
    timeline: {
      hideWaveform: "Wellenform ausblenden",
      showWaveform: "Wellenform einblenden",
      loadingAudio: "Audio wird geladen…",
      deleteSelection: "Auswahl löschen",
      deleteSelectionHint:
        "Wähle Wörter im Transkript aus oder trenne die Timeline auf und wähle ein Segment",
      splitAt: "Bei {time} trennen",
      splitHint: "Spiele oder spule zuerst zu einer Stelle",
      comingSoon: "Demnächst",
      fit: "Einpassen",
      zoomOut: "Verkleinern",
      zoom: "Timeline-Zoom",
      zoomIn: "Vergrößern",
      seek: "Spulen",
      trimStart: "Anfang des Clips kürzen",
      trimEnd: "Ende des Clips kürzen",
      removeSplit: "Trennung bei {time} entfernen",
    },
  },
  screenshotEditor: {
    loading: "Editor wird geladen…",
    imageError: {
      decode: "Das Screenshot-Bild konnte nicht dekodiert werden.",
      fetch:
        "Das Screenshot-Bild konnte nicht geladen werden. Möglicherweise hat der Bucket den CORS-Zugriff verloren.",
    },
    header: {
      back: "Zurück zum Screenshot",
      reset: "Änderungen zurücksetzen",
      undo: "Rückgängig",
      undoTooltip: "Rückgängig ({key})",
      redo: "Wiederholen",
      redoTooltip: "Wiederholen ({key})",
      finish: "Fertig",
    },
    saveError: {
      notMounted: "Editor nicht eingebunden",
      noCanvas: "Export-Canvas konnte nicht abgerufen werden",
      workerCrashed: "PNG-Encoder-Worker abgestürzt",
    },
    tools: {
      text: "Text",
      rect: "Rechteck",
      arrow: "Pfeil",
      background: "Hintergrund",
    },
    background: {
      title: "Hintergrund hinzufügen",
      close: "Hintergrundauswahl schließen",
      none: "Keiner",
      gradients: {
        violet: "Violett",
        sunset: "Abendrot",
        orchid: "Orchidee",
        forest: "Wald",
        flamingo: "Flamingo",
        citrus: "Zitrus",
        arctic: "Arktis",
        ocean: "Ozean",
        deep: "Tiefsee",
      },
      solid: "Einfarbig {color}",
      custom: "Eigene Farbe wählen",
    },
    inspector: {
      color: "Farbe {color}",
      size: "{n}px",
      duplicate: "Duplizieren",
    },
    textPrompt: "Text",
  },
  canvas: {
    meta: {
      title: "Leinwand",
      description:
        "Eine leere Fläche, auf der du beim Aufnehmen zeichnen kannst.",
    },
    loading: "Leinwand wird geladen…",
    tools: {
      select: "Auswählen",
      hand: "Hand",
      pen: "Stift",
      highlighter: "Textmarker",
      rect: "Rechteck",
      ellipse: "Ellipse",
      arrow: "Pfeil",
      line: "Linie",
      text: "Text",
      eraser: "Radierer",
    },
    shortcut: "{label} · {key}",
    colour: "Farbe {colour}",
    stroke: "Strichstärke {width}",
    hint: "Scrollen zum Verschieben · {mod} + Scrollen zum Zoomen · {space} halten zum Ziehen",
    textPlaceholder: "Text eingeben…",
    history: {
      undo: "Rückgängig",
      redo: "Wiederholen",
      clear: "Leinwand leeren",
    },
    zoom: {
      out: "Verkleinern",
      reset: "Zoom zurücksetzen",
      in: "Vergrößern",
    },
    extensionPrompt: {
      title: "Diese Leinwand aufnehmen",
      description:
        "Füge die CaptureFlow-Erweiterung hinzu, um beim Zeichnen Bildschirm und Kamera aufzunehmen und dann einen Link zu teilen.",
      dismiss: "Nicht jetzt",
      install: "Zu Chrome hinzufügen",
    },
  },
};

export default messages;

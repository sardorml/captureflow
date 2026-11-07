import type { AppMessages } from "../messages";

const messages: AppMessages = {
  common: {
    cancel: "Annulla",
    save: "Salva",
    saving: "Salvataggio…",
    delete: "Elimina",
    deleting: "Eliminazione…",
    remove: "Rimuovi",
    close: "Chiudi",
    back: "Indietro",
    continue: "Continua",
    confirm: "Conferma",
    done: "Fine",
    edit: "Modifica",
    copy: "Copia",
    copied: "Copiato",
    search: "Cerca",
    loading: "Caricamento…",
    retry: "Riprova",
    learnMore: "Scopri di più",
    language: "Lingua",
    themeToLight: "Passa al tema chiaro",
    themeToDark: "Passa al tema scuro",
    somethingWrong: "Si è verificato un errore. Riprova.",
    pageFailed: "Impossibile caricare questa pagina.",
    partFailed: "Impossibile caricare questa parte.",
    failedBody: "Qualcosa è andato storto. Riprova o ricarica la pagina.",
    reload: "Ricarica la pagina",
  },
  auth: {
    signedInAs: "Accesso effettuato come {email}.",
    errors: {
      generic: "Si è verificato un errore. Riprova.",
      network: "Errore di rete. Riprova.",
    },
    login: {
      metaTitle: "Accedi",
      signInTitle: "Ti diamo il bentornato",
      signInDescription: "Accedi con Google, GitHub o la tua email",
      signUpTitle: "Crea il tuo account",
      signUpDescription: "Iscriviti con Google, GitHub o la tua email",
      inviteTitle: "Entra in {workspace}",
      inviteDescription:
        "{inviter} ti ha invitato. Accedi o crea un account con {email} per accettare.",
      continueWith: "Continua con {provider}",
      or: "Oppure",
      emailLabel: "Email",
      emailPlaceholder: "you@example.com",
      emailInvalid: "Inserisci un'email valida.",
      continueWithEmail: "Continua con l'email",
      askForInvite:
        "Ti serve un account? Chiedi un invito a un amministratore.",
      haveAccount: "Hai già un account? {action}",
      haveAccountAction: "Accedi",
      noAccount: "Non hai un account? {action}",
      noAccountAction: "Iscriviti",
      changeEmail: "Cambia",
      nameLabel: "Nome",
      namePlaceholder: "Il tuo nome",
      passwordLabel: "Password",
      newPasswordPlaceholder: "Almeno 12 caratteri",
      passwordTooShort: "Usa almeno 12 caratteri.",
      passwordMissing: "Inserisci la password.",
      signInSubmit: "Accedi",
      signUpSubmit: "Crea account",
      terms: "Continuando, accetti i nostri {terms} e la nostra {privacy}.",
      termsLink: "Termini",
      privacyLink: "Informativa sulla privacy",
    },
    verify: {
      title: "Controlla la tua email",
      description:
        "Abbiamo inviato un link a {email}. Aprilo per completare la configurazione del tuo account.",
      resend: "Invia di nuovo l'email",
      resent: "Inviata di nuovo",
      resendFailed: "Impossibile inviare l'email. Riprova.",
      wrongAddress: "Indirizzo sbagliato? {action}",
      wrongAddressAction: "Usa un'altra email",
    },
    oauthErrors: {
      unfinished: "L'accesso non è stato completato. Riprova.",
      inviteOnly:
        "Questa istanza di CaptureFlow è solo su invito. Chiedi un invito a un amministratore.",
      allowedDomains:
        "Iscriviti con un indirizzo {domains}, oppure chiedi un invito a un amministratore.",
      providerDomains:
        "Iscriviti usando un account Google o GitHub con indirizzo {domains}.",
      domainChoice: "{first} o {second}",
    },
    inviteFallbacks: {
      workspace: "un workspace CaptureFlow",
      inviter: "Un collega",
    },
    setPassword: {
      title: "Imposta la password",
      description:
        "Scegli una password per {email}. Subito dopo effettuerai l'accesso.",
      passwordLabel: "Nuova password",
      passwordPlaceholder: "Almeno 12 caratteri",
      submit: "Salva password",
      expiredTitle: "Questo link non funziona più",
      expiredDescription:
        "È già stato usato oppure è scaduto. Chiedine uno nuovo a un amministratore.",
      goToSignIn: "Vai all'accesso",
    },
    invite: {
      title: "Hai ricevuto un invito",
      asViewer:
        "Hai ricevuto un invito a entrare in {workspace} su CaptureFlow come spettatore: puoi guardare e commentare tutto ciò che viene condiviso lì.",
      asMember:
        "Hai ricevuto un invito a entrare in {workspace} su CaptureFlow come membro: puoi registrare nel workspace e condividere con il team.",
      accept: "Accetta l'invito",
      databaseUnavailable: "Database non disponibile",
      invalidTitle: "Invito non più valido",
      invalidBody:
        "Questo link è scaduto o è già stato usato. Chiedi al proprietario del workspace di inviarti un nuovo invito.",
      wrongAccountTitle: "Account sbagliato",
      wrongAccountBody:
        "Questo invito è stato inviato a {invited}, ma hai effettuato l'accesso come {current}. Esci e accedi con l'indirizzo invitato per accettare.",
      goToDashboard: "Vai alla dashboard",
      signOut: "Esci",
    },
    handoff: {
      signingIn: "Accesso in corso…",
      returning: "Ritorno a CaptureFlow…",
      open: "Apri CaptureFlow",
      hint: "Se non succede nulla, clicca sul pulsante qui sopra. Puoi chiudere questa scheda quando l'app desktop si riapre.",
      extensionDone:
        "Accesso effettuato come {email}. Puoi chiudere questa scheda.",
      extensionUnreachable:
        "Impossibile raggiungere l'estensione CaptureFlow. Assicurati che sia installata, poi clicca sulla sua icona per riprovare.",
      extensionUnverified:
        "Impossibile verificare l'estensione. Reinstallala e riprova.",
    },
  },
  shell: {
    record: {
      newRecording: "Nuova registrazione",
    },
    nav: {
      toggleSidebar: "Mostra o nascondi la barra laterale",
      dashboard: "Dashboard",
      recordings: "Registrazioni",
      screenshots: "Screenshot",
      canvas: "Canvas",
      workspaceGroup: "Workspace",
      members: "Membri",
      settings: "Impostazioni",
      personal: "Personali",
      workspace: "Workspace",
      billing: "Fatturazione",
      admin: "Amministrazione",
    },
    upgradeCard: {
      title: "Esegui l'upgrade del workspace",
      description:
        "Il piano Gratuito include {recordings} registrazioni per persona in qualità risparmio dati. I piani a pagamento eliminano i limiti, a partire da {price} per membro.",
      viewPlans: "Vedi i piani",
    },
    topBar: {
      upgrade: "Esegui l'upgrade",
    },
    workspaceSwitcher: {
      switchWorkspace: "Cambia workspace",
      summary: "one:Predefinito · {n} membro|other:Predefinito · {n} membri",
      workspaces: "Workspace",
      owned: "È tuo",
      joined: "Ne fai parte",
      newWorkspace: "Nuovo workspace",
      inviteMembers: "Invita membri",
    },
    drawer: {
      open: "Apri il menu del workspace",
      title: "Menu del workspace",
    },
    search: {
      prompt: "Cerca tra le tue registrazioni e i tuoi screenshot",
      clear: "Cancella la ricerca",
      results: "Risultati della ricerca",
      hint: "Cerca tra le tue registrazioni e i tuoi screenshot per titolo.",
      noMatches: "Nessun risultato",
      kind: {
        recording: "registrazione",
        screenshot: "screenshot",
      },
    },
    account: {
      menu: "Menu dell'account",
      nav: {
        billing: "Fatturazione",
        devices: "Dispositivi collegati",
        settings: "Impostazioni",
        support: "Contatta l'assistenza",
      },
      freePlan: "Gratuito",
      signOut: "Esci",
      signingOut: "Uscita in corso…",
    },
    theme: {
      label: "Tema",
      light: "Chiaro",
      dark: "Scuro",
      system: "Sistema",
    },
    notifications: {
      title: "Notifiche",
      subtitle: "Inviti e modifiche ai tuoi workspace.",
      bellUnread: "one:Notifiche, {n} non letta|other:Notifiche, {n} non lette",
      viewAll: "Vedi tutte",
      menuEmpty:
        "Non c'è nulla di nuovo. Inviti, nuovi colleghi e cambi di ruolo compaiono qui.",
      pageEmpty:
        "Non c'è nulla di nuovo. Quando qualcuno ti invita, entra nel tuo workspace o cambia il tuo ruolo, lo vedrai qui.",
      accept: "Accetta",
      decline: "Rifiuta",
      unread: "Non letta",
      someone: "Qualcuno",
      message: {
        invited: {
          member: "{actor} ti ha invitato a entrare in {workspace} come membro",
          viewer:
            "{actor} ti ha invitato a entrare in {workspace} come spettatore",
        },
        joined: {
          member: "{actor} ora fa parte di {workspace} come membro",
          viewer: "{actor} ora fa parte di {workspace} come spettatore",
        },
        seatRequested:
          "{actor} ha chiesto una licenza a pagamento in {workspace}",
        seatDenied:
          "{actor} ha rifiutato la tua richiesta di licenza in {workspace}",
        roleChanged: {
          member: "{actor} ti ha assegnato il ruolo di membro in {workspace}",
          viewer:
            "{actor} ti ha assegnato il ruolo di spettatore in {workspace}",
        },
        downgraded: "{actor} ti ha spostato tra gli spettatori in {workspace}",
        keepRecordingUntil: "Puoi continuare a registrare fino al {date}.",
        removed: "{actor} ti ha rimosso da {workspace}",
      },
      acceptErrors: {
        failed: "Impossibile accettare l'invito",
        signedOut: "Accedi per accettare",
        invalid: "Questo invito è scaduto o è stato revocato",
        emailMismatch: "Questo invito è per un altro indirizzo email",
        alreadyMember: "Fai già parte di questo workspace",
      },
    },
    mobileNav: {
      open: "Apri il menu",
      close: "Chiudi il menu",
      docs: "Documentazione",
      star: "Metti una stella su GitHub",
      signIn: "Accedi",
      getStarted: "Inizia",
    },
    skeletons: {
      avatar: "Avatar",
      workspaceName: "Nome del workspace",
      workspaceLogo: "Logo del workspace",
    },
  },
  library: {
    dashboard: {
      welcome: "Ti diamo il bentornato",
      welcomeName: "Ti diamo il bentornato, {name}",
      openCanvas: "Apri il canvas",
      newRecording: "Nuova registrazione",
      stats: {
        recordings: "Registrazioni",
        plusScreenshots: "other:Più {count} screenshot",
        noScreenshots: "Ancora nessuno screenshot",
        views: "Visualizzazioni",
        viewsAverage: "In media {count} per registrazione",
        noViews: "Ancora nessuna visualizzazione",
        recorded: "Tempo registrato",
        recordedAverage: "In media {duration} per registrazione",
        nothingRecorded: "Ancora nulla di registrato",
        recordingsLeft: "Registrazioni rimaste",
        leftOfAllowance: "{left} di {allowance}",
        freePlanLimit: "Piano Gratuito, fino a {minutes} min ciascuna",
      },
      recordedTime: {
        minutes: "{minutes} min",
        hours: "{hours} h",
        hoursMinutes: "{hours} h {minutes} min",
      },
      recent: {
        title: "Registrazioni recenti",
        all: "Tutte le registrazioni",
        empty: "In questo workspace non è stato ancora condiviso nulla.",
        views: "one:{n} visualizzazione|other:{n} visualizzazioni",
        comments: "one:{n} commento|other:{n} commenti",
        reactions: "one:{n} reazione|other:{n} reazioni",
      },
      start: {
        title: "Inizia a registrare con {product}",
        surfacesLabel: "Dove registrare",
        surfaces: {
          extension: "Estensione",
          desktop: "App desktop",
          canvas: "Canvas",
        },
        extension: {
          description:
            "Registra qualsiasi scheda, finestra o lo schermo intero dalla barra degli strumenti e ottieni un link che puoi condividere con chiunque.",
          record: "Registra ora",
          addToChrome: "Aggiungi a Chrome",
        },
        desktop: {
          description:
            "Un'app nativa per Mac che registra schermo e videocamera con l'audio di sistema è in arrivo. Nel frattempo, l'estensione registra qualsiasi scheda, finestra o lo schermo intero.",
          download: "Scarica per Mac",
          comingSoon: "In arrivo",
        },
        canvas: {
          description:
            "Una lavagna vuota con penne, forme e testo su cui disegnare mentre registri, quando non c'è una pagina da mostrare.",
        },
      },
    },
    recording: {
      pageTitle: "Registrazioni",
      count: "one:{n} registrazione|other:{n} registrazioni",
      untitled: "Registrazione senza titolo",
      aiGenerated: "Generata con AI",
      processing: "In elaborazione",
      noMatches: "Nessuna registrazione corrisponde a questi filtri.",
      empty:
        "Non hai ancora creato nessun link di registrazione. Registra con l'app desktop CaptureFlow e le tue registrazioni compariranno qui.",
      selectAll: "Seleziona tutte le registrazioni",
      selected:
        "one:{n} registrazione selezionata|other:{n} registrazioni selezionate",
      open: "Apri la registrazione",
      edit: "Modifica la registrazione",
      share: "Condividi la registrazione",
      delete: "Elimina la registrazione",
      deleteTitle: "Eliminare questa registrazione?",
      deleteDescription:
        "Il video e il suo link smettono subito di funzionare. L'operazione non può essere annullata.",
      deleteSelectedTitle:
        "one:Eliminare {n} registrazione?|other:Eliminare {n} registrazioni?",
    },
    screenshot: {
      pageTitle: "Screenshot",
      count: "other:{n} screenshot",
      untitled: "Screenshot senza titolo",
      numbered: "Screenshot {id}",
      noMatches: "Nessuno screenshot corrisponde a questi filtri.",
      empty:
        "Ancora nessuno screenshot. Apri CaptureFlow → scheda «Screenshot» → scegli «Display», «Window» o «Area» per la cattura. Lo screenshot compare qui automaticamente.",
      selectAll: "Seleziona tutti gli screenshot",
      selected:
        "one:{n} screenshot selezionato|other:{n} screenshot selezionati",
      open: "Apri lo screenshot",
      edit: "Modifica lo screenshot",
      share: "Condividi lo screenshot",
      delete: "Elimina lo screenshot",
      deleteTitle: "Eliminare questo screenshot?",
      deleteDescription:
        "L'immagine e il suo link smettono subito di funzionare. L'operazione non può essere annullata.",
      deleteSelectedTitle: "other:Eliminare {n} screenshot?",
    },
    filters: {
      access: "Accesso",
      sort: "Ordina",
      current: "{label}: {value}",
      accessOptions: {
        all: "Qualsiasi accesso",
        public: "Pubblico",
        workspace: "Workspace",
        private: "Privato",
      },
      sortOptions: {
        newest: "Dal più recente",
        oldest: "Dal meno recente",
        views: "Più visualizzati",
      },
    },
    card: {
      select: "Seleziona {title}",
      moreActions: "Altre azioni",
      rename: "Rinomina",
      unknownAuthor: "Sconosciuto",
    },
    selection: {
      deleteDescription: "I loro link smettono subito di funzionare.",
      deleteFailed:
        "Impossibile eliminarne {failed} su {count}. Il resto è stato eliminato.",
      clear: "Deseleziona",
    },
    pager: {
      label: "Pagine",
      previous: "Pagina precedente",
      next: "Pagina successiva",
    },
    visibility: {
      label: "Visibilità",
      labels: {
        public: "Pubblico",
        workspace: "Workspace",
        private: "Privato",
      },
      descriptions: {
        public: "Visibile a chiunque abbia il link",
        workspace:
          "Visibile solo ai membri del workspace che hanno effettuato l'accesso",
        private: "Visibile solo a te",
      },
      workspaceNamed: "Workspace · {name}",
    },
    share: {
      title: "Condividi",
      embed: "Incorpora",
      embedPublic: "Si riproduce ovunque venga incollato il codice.",
      embedRestricted: "Si riproduce solo per chi può già aprire il link.",
      copyCode: "Copia codice",
      generalAccess: "Accesso generale",
      generalAccessCurrent: "Accesso generale: {access}",
      copyLink: "Copia link",
      linkCopied: "Link copiato",
      shareAt: "Condividi a partire da {time}",
    },
    editableTitle: {
      label: "Titolo della registrazione",
      rename: "Rinomina la registrazione",
    },
  },
  members: {
    title: "Membri",
    databaseUnavailable: "Database non disponibile.",
    role: "Ruolo",
    status: "Stato",
    roles: {
      owner: "Amministratore",
      member: "Membro",
      viewer: "Spettatore",
    },
    roleHints: {
      member: {
        does: "Registra in questo workspace.",
        costs: "Una licenza a pagamento con Light e Pro.",
      },
      viewer: {
        does: "Guarda e commenta.",
        costs: "Sempre gratis.",
      },
    },
    statuses: {
      active: "Attivo",
      invited: "Invitato",
    },
    seatSummary: {
      members: "one:{n} membro|other:{n} membri",
      viewers: "one:{n} spettatore|other:{n} spettatori",
      paidSeats: "one:{n} licenza a pagamento|other:{n} licenze a pagamento",
      membersAndViewers: "{members} e {viewers}",
      onPaidSeats:
        "{people}, con {seats}. Ogni membro occupa una licenza; gli spettatori sono gratuiti.",
      membersFree: "{people}. Con questo piano i membri sono gratuiti.",
      freePlan:
        "{people}. Piano Gratuito: ogni membro ha {recordings} registrazioni, fino a {minutes} minuti ciascuna; gli spettatori guardano e commentano.",
      planTitle: "Piano {plan}",
      paidPlanTitle: "Piano a pagamento",
      freePlanTitle: "Piano Gratuito",
      upgrade: "Esegui l'upgrade del workspace",
    },
    table: {
      intro: "I membri registrano qui; gli spettatori guardano e commentano.",
      ownerIntro:
        "Come proprietario puoi invitare, rimuovere e cambiare i ruoli.",
      searchPlaceholder: "Nome o indirizzo email",
      searchLabel: "Cerca membri",
      allRoles: "Tutti i ruoli",
      everyone: "Tutti",
      columns: {
        name: "Nome",
        dateAdded: "Data di aggiunta",
        email: "Indirizzo email",
        actions: "Azioni",
      },
      empty: "Nessuno corrisponde a questi filtri.",
      downgradeNote: "Spettatore dal {date} · {keep}",
      keepAsMember: "Mantieni come membro",
      revoke: "Revoca",
    },
    seatRequests: {
      title: "Richieste di licenza",
      description:
        "Questi spettatori hanno chiesto di registrare. Se approvi, diventano membri.",
      descriptionPaid:
        "Questi spettatori hanno chiesto di registrare. Se approvi, diventano membri, e questo aggiunge una licenza a pagamento.",
      asked: "{email} · richiesta del {date}",
      deny: "Rifiuta",
      approve: "Approva",
    },
    seatConfirm: {
      addTitle: "Assegnare a {name} una licenza a pagamento?",
      addBody:
        "I membri registrano, quindi ognuno occupa una licenza a pagamento. Il tuo piano {plan} passa da {seats} a {nextSeats} licenze, da {before} a {after} al mese.",
      addBodyYearly:
        "I membri registrano, quindi ognuno occupa una licenza a pagamento. Il tuo piano {plan} passa da {seats} a {nextSeats} licenze, da {before} a {after} al mese, con fatturazione annuale.",
      addInvoice:
        "Il resto di questo periodo di fatturazione viene aggiunto alla prossima fattura.",
      addConfirm: "Aggiungi licenza a pagamento",
      removeTitle: "Spostare {name} tra gli spettatori?",
      removeBody:
        "{name} continua a registrare fino al {date}, la fine del periodo che hai già pagato. Poi diventa spettatore: può guardare e commentare, ma non registrare.",
      removePlan:
        "Da quel momento, il tuo piano {plan} passa da {seats} a {nextSeats} licenze, da {before} a {after} al mese.",
      removePlanYearly:
        "Da quel momento, il tuo piano {plan} passa da {seats} a {nextSeats} licenze, da {before} a {after} al mese, con fatturazione annuale.",
      removeConfirm: "Sposta tra gli spettatori",
    },
    remove: {
      label: "Rimuovi {name} dal workspace",
      title: "Rimuovere {name} da {workspace}?",
      body: "Perde subito l'accesso. Le sue registrazioni e i suoi screenshot restano nel workspace.",
      freesSeat:
        "Così si libera la sua licenza a pagamento: il tuo piano passa da {seats} a {nextSeats} licenze.",
    },
    leave: {
      button: "Abbandona",
      title: "Abbandonare {workspace}?",
      body: "Perderai l'accesso alle sue registrazioni e ai suoi screenshot. Tutto ciò che hai registrato lì resta nel workspace.",
      comeBack: "Per tornare, qualcuno dovrà invitarti di nuovo.",
      confirm: "Abbandona il workspace",
    },
    invite: {
      trigger: "Invita membri",
      title: "Invita membri in {workspace}",
      titleOwnWorkspace: "Invita membri nel tuo workspace",
      description:
        "Riceveranno un'email con un link che scade tra 7 giorni. Assicurati che accedano con lo stesso indirizzo.",
      removeEmail: "Rimuovi {email}",
      addEmails: "Aggiungi email",
      separatorHint: "Separa le email con uno spazio, una virgola o Invio.",
      paidSeatNote:
        "Ogni membro che accetta aggiunge una licenza a pagamento al tuo piano {plan}, {price} al mese ciascuna. Il resto di questo periodo va nella prossima fattura.",
      noEmails: "Aggiungi almeno un'email",
      invalidEmails: "Email non valida: {emails}",
      failed: "Operazione non riuscita",
      sent: "one:{n} invito inviato.|other:{n} inviti inviati.",
      sending: "Invio in corso…",
      submit: "Invia inviti",
    },
    actions: {
      emailRequired: "Inserisci un indirizzo email",
      emailInvalid: "Non sembra un'email valida",
      ownWorkspace: "Fai già parte del tuo workspace",
      alreadyMember: "Questa persona è già membro di questo workspace",
      emailNotSent:
        "Invito creato, ma l'invio dell'email non è riuscito. Copia il link dall'elenco degli inviti in sospeso.",
      invitationSent: "Invito inviato a {email}",
      alreadyRecording: "Puoi già registrare qui",
    },
  },
  settings: {
    saved: "Salvato",
    errors: {
      ownerOnly:
        "Solo il proprietario del workspace può modificare questa impostazione",
      databaseUnavailable: "Database non disponibile",
      saveFailed: "Impossibile salvare: riprova",
    },
    upload: {
      uploading: "Caricamento in corso…",
      missing: "Scegli un file immagine",
      failed: "Caricamento non riuscito",
      failedReason: "Caricamento non riuscito: {reason}",
    },
    personal: {
      title: "Impostazioni personali",
      account: {
        title: "Account",
        description:
          "Come ti vedono i colleghi e le persone che guardano le tue registrazioni.",
      },
      preferences: {
        title: "Preferenze",
        description: "L'aspetto e la lingua di CaptureFlow per te.",
      },
      languageDescription: "La lingua in cui vedi CaptureFlow.",
    },
    avatar: {
      label: "Avatar",
      change: "Cambia avatar",
      removing: "Rimozione…",
      hint: "JPG, PNG, WebP o GIF. Massimo 2 MB.",
      tooLarge: "L'avatar deve essere di 2 MB al massimo",
      badType: "L'avatar deve essere PNG, JPEG, WebP o GIF",
    },
    account: {
      name: {
        label: "Nome completo",
        placeholder: "Il tuo nome",
        description:
          "Mostrato su registrazioni, screenshot e righe di attività.",
        required: "Il nome è obbligatorio.",
        updateFailed: "Impossibile aggiornare il nome.",
      },
      email: {
        label: "Indirizzo email",
        description: "Usato per accedere. Contatta l'assistenza per cambiarlo.",
      },
      userId: {
        label: "ID utente",
        copy: "Copia ID utente",
        description: "Indicalo quando contatti l'assistenza.",
      },
      saveChanges: "Salva modifiche",
    },
    workspace: {
      title: "Impostazioni del workspace",
      tabs: {
        label: "Sezioni delle impostazioni",
        general: "Generali",
        security: "Sicurezza",
      },
      general: {
        title: "Generali",
        description:
          "Il nome e il logo che identificano questo workspace nel selettore, nella pagina dei membri e nelle anteprime di condivisione.",
      },
      name: {
        title: "Nome del workspace",
        description: "Il nome con cui compare il tuo workspace.",
        empty: "Il nome del workspace non può essere vuoto",
        tooLong:
          "Il nome del workspace è troppo lungo (massimo {max} caratteri)",
      },
      logo: {
        title: "Logo del workspace",
        description:
          "Mostrato accanto al nome del workspace. PNG, JPEG, WebP, GIF o SVG, massimo 2 MB.",
        upload: "Carica logo",
        replace: "Sostituisci logo",
        tooLarge: "Il logo deve essere di 2 MB al massimo",
        badType: "Il logo deve essere PNG, JPEG, WebP, GIF o SVG",
      },
      permissions: {
        title: "Permessi predefiniti",
        description:
          "Impostazioni applicate a ogni nuova registrazione e a ogni nuovo screenshot del workspace.",
      },
      recordingAccess: {
        title: "Accesso alla registrazione",
        description:
          "Decidi se i colleghi possono pubblicare registrazioni e screenshot in questo workspace.",
        allow: {
          title: "Consenti ai colleghi di pubblicare qui",
          body: "I membri possono registrare in questo workspace.",
        },
        ownerOnly: {
          title: "Solo il proprietario del workspace",
          body: "I caricamenti dei colleghi finiscono nel loro workspace personale.",
        },
      },
    },
    devices: {
      title: "Dispositivi collegati",
      count:
        "one:{n} dispositivo con accesso effettuato|other:{n} dispositivi con accesso effettuato",
      empty:
        "Nessun dispositivo collegato. Apri l'app desktop CaptureFlow e clicca su «Sign in» nella barra di registrazione per collegare questo account.",
      unlabelled: "Dispositivo senza nome",
      added: "Aggiunto il {date}",
      addedLastUsed: "Aggiunto il {date} · ultimo utilizzo il {lastUsed}",
      neverUsed: "Mai utilizzato",
      revoke: {
        action: "Revoca",
        title: "Disconnettere questo dispositivo?",
        description: "Dovrà accedere di nuovo per gestire le registrazioni.",
      },
    },
  },
  billing: {
    chargedInUsd: "Addebitato in dollari statunitensi.",
    shownIn:
      "I prezzi sono mostrati in {currency}. L'addebito è in dollari statunitensi.",
    page: {
      title: "Fatturazione",
      subtitle: "Il tuo piano e quanto ne hai usato.",
      workspaceLabel: "Workspace · {name}",
      manageSubscription: "Gestisci abbonamento",
      upgradeWorkspace: "Esegui l'upgrade del workspace",
      storage: "Archiviazione del workspace",
      usedOfLimit: "{used} di {limit}",
      usedNoLimit: "{used}, senza limite",
    },
    loading: {
      plan: "Piano",
      usage: "Utilizzo",
    },
    counts: {
      members: "one:{n} membro|other:{n} membri",
      paidSeats: "one:{n} licenza a pagamento|other:{n} licenze a pagamento",
      freeViewers: "one:{n} spettatore gratuito|other:{n} spettatori gratuiti",
    },
    plan: {
      free: "Gratuito",
      paid: "A pagamento",
      billedMonthly: "Fatturazione mensile",
      billedYearly: "Fatturazione annuale",
      freeSummary:
        "{members} · fino a {recordings} registrazioni per persona, {minutes} minuti ciascuna, qualità risparmio dati",
    },
    status: {
      onTrial: "In prova",
      active: "Attivo",
      paused: "In pausa",
      pastDue: "Pagamento non riuscito",
      unpaid: "Non pagato",
      cancelled: "Annullato",
      expired: "Scaduto",
    },
    details: {
      youPay: "Paghi",
      amountPerMonth: "{amount} al mese",
      amountPerYear: "{amount} all'anno",
      seatsMonthly:
        "one:{n} licenza × {price} al mese|other:{n} licenze × {price} al mese",
      seatsYearly:
        "one:{n} licenza × {price} al mese, {total} al mese con fatturazione annuale|other:{n} licenze × {price} al mese, {total} al mese con fatturazione annuale",
      nextPayment: "Prossimo pagamento",
      ends: "Termina",
      endOfPeriod: "Alla fine di questo periodo",
      amountOnDate: "{amount} il {date}",
      firstPaymentPending: "Quando il primo pagamento va a buon fine",
      estimate: "{base} · {change}, stima",
      baseForSeats:
        "one:{amount} per {n} licenza|other:{amount} per {n} licenze",
      seatsAdded:
        "one:{amount} per {n} licenza aggiunta in questo periodo|other:{amount} per {n} licenze aggiunte in questo periodo",
      seatsRemoved:
        "one:{amount} di credito per {n} licenza rimossa in questo periodo|other:{amount} di credito per {n} licenze rimosse in questo periodo",
      seatChanges: "{amount} per le modifiche alle licenze in questo periodo",
      seats: "Licenze",
      seatsAndViewers: "{seats}, {viewers}",
      billedTo: "Fatturato a",
      paymentMethod: "Metodo di pagamento",
      cardEnding: "{brand} che termina con {last4}",
      card: "Carta",
      updateCard: "Aggiorna",
    },
    switchPlan: {
      switchTo: "Passa a {plan}",
      title: "Passare a {plan}?",
      priceMonthly:
        "one:La tua {n} licenza passa da {before} a {after} al mese.|other:Le tue {n} licenze passano da {before} a {after} al mese.",
      priceYearly:
        "one:La tua {n} licenza passa da {before} a {after} al mese, con fatturazione annuale.|other:Le tue {n} licenze passano da {before} a {after} al mese, con fatturazione annuale.",
      benefits:
        "{plan} registra a ogni qualità fino a 60 fps e aggiunge la modifica con AI.",
      timing:
        "Inizia subito. La differenza per il resto di questo periodo di fatturazione viene aggiunta alla prossima fattura.",
      errors: {
        failed: "Impossibile cambiare il piano",
        unknownPlan: "Piano sconosciuto",
        billingUnavailable: "La fatturazione non è disponibile",
        noSubscription: "Questo workspace non ha un abbonamento attivo",
        cancelled: "Riattiva l'abbonamento prima di cambiare piano",
        unavailable: "Il cambio di piano non è disponibile al momento",
        rejected:
          "Il sistema di fatturazione non ha accettato la modifica. Riprova.",
      },
    },
    upgrade: {
      title: "Esegui l'upgrade di {name}",
      billingCycle: "Ciclo di fatturazione",
      cycles: {
        monthly: "Mensile",
        annual: "Annuale",
      },
      annualSaving: "risparmia il {percent}%",
      seatPicker: {
        title: "Chi riceve una licenza a pagamento",
        selected: "{seats} di {total}",
        description:
          "Le persone selezionate registrano e vengono fatturate. Tutte le altre sono spettatori gratuiti che possono guardare, commentare e reagire, ma non registrare. I ruoli cambiano quando esegui l'upgrade.",
        selectAll: "Seleziona tutti",
        clear: "Deseleziona",
        you: "(tu)",
        paidSeat: "Licenza a pagamento",
        viewer: "Spettatore",
      },
      perMonth: "al mese",
      seatsPrice: "one:{n} licenza × {price}|other:{n} licenze × {price}",
      viewersFree: "one:{n} spettatore gratis|other:{n} spettatori gratis",
      priceWithViewers: "{seats}, {viewers}",
      priceYearly: "{seats}, con fatturazione annuale",
      priceWithViewersYearly: "{seats}, {viewers}, con fatturazione annuale",
      upgradeTo: "Esegui l'upgrade a {plan}",
      checkoutUnavailable: "Checkout non configurato",
    },
    requestSeat: {
      request: "Chiedi di registrare",
      requested: "Licenza richiesta",
      hint: "Qui sei spettatore. Chiedi al proprietario una licenza a pagamento per poter registrare.",
      requestedHint:
        "La richiesta è stata inviata al proprietario. Potrai registrare quando la approverà.",
      failed: "Impossibile inviare la richiesta",
    },
  },
  actions: {
    missingSlug: "Slug mancante",
    recordingNotFound: "Registrazione non trovata",
    backgroundMissing: "Scegli un’immagine da caricare",
    backgroundTooLarge: "Le immagini possono pesare fino a 5 MB",
    backgroundBadType: "Usa un’immagine PNG, JPEG o WebP",
    backgroundFailed: "Impossibile caricare l’immagine. Riprova.",
    invalidVisibility: "Visibilità non valida",
    deleteVideoFailed: "Impossibile eliminare il file video: {reason}",
    transcriptNotFound: "Trascrizione non trovata",
    transcriptEmpty:
      "La trascrizione non può restare vuota. Azzera invece le modifiche.",
    missingTokenId: "ID del token mancante",
    tokenNotFound: "Token non trovato",
    missingScreenshotId: "ID dello screenshot mancante",
    screenshotNotFound: "Screenshot non trovato",
    missingImageBytes: "Byte dell'immagine mancanti",
    screenshotTooLarge:
      "Lo screenshot modificato supera il limite di dimensione per screenshot.",
    saveScreenshotFailed: "Impossibile salvare lo screenshot: {reason}",
    saveFailed: "Salvataggio non riuscito: {reason}",
    invalidCanvasDimensions:
      "Salvataggio non riuscito: dimensioni del canvas non valide",
  },
  viewer: {
    meta: {
      defaultTitle: "Registrazione {product}",
      defaultDescription:
        "Una registrazione dello schermo condivisa da {product}.",
      preparingTitle: "Preparazione della registrazione… — {product}",
      notFoundTitle: "Non trovata",
      description:
        "Una registrazione dello schermo condivisa da {product}. Guardala nel browser, senza iscrizione.",
      descriptionTimed:
        "Una registrazione dello schermo di {duration} condivisa da {product}. Guardala nel browser, senza iscrizione.",
    },
    loading: "Caricamento della registrazione…",
    nav: {
      download: "Scarica",
    },
    authPrompt: {
      pricing: "Prezzi",
      logIn: "Accedi",
      getStarted: "Inizia",
      getFree: "Usa {product} gratis",
    },
    postedBy: {
      label: "Pubblicata da",
      someone: "Qualcuno",
    },
    views: {
      count: "one:{count} visualizzazione|other:{count} visualizzazioni",
      showWhoWatched: "{views}, mostra chi ha guardato",
      viewers: "Spettatori",
      emptyTitle: "Ancora nessuna visualizzazione",
      emptyDescription:
        "Condividi il link e chi guarda la registrazione comparirà qui.",
      signedInViewer: "Spettatore con accesso effettuato",
      anonymous: "Anonimo",
    },
    actions: {
      share: "Condividi",
      visibilityFailed: "Impossibile aggiornare la visibilità",
      deleteFailed: "Impossibile eliminare la registrazione",
    },
    requestAccess: {
      title: "Richiedi l'accesso per vedere questo video",
      notSharedBy:
        "{name} non ha ancora condiviso questa registrazione con te.",
      notSharedByOwner:
        "Il proprietario non ha ancora condiviso questa registrazione con te.",
      signInHint:
        "Accedi con la tua email di lavoro: se fai già parte del team del proprietario, entrerai subito.",
      signIn: "Accedi per continuare",
      sentTitle: "Richiesta inviata",
      sentDescription:
        "Abbiamo avvisato il proprietario. Riceverai un'email se ti concede l'accesso.",
      askingAs: "Richiesta inviata come {email}",
      noteLabel: "Aggiungi una nota {optional}",
      noteOptional: "(facoltativa)",
      notePlaceholder:
        "Ciao, vorrei guardare questa registrazione della revisione di ieri.",
      sending: "Invio in corso…",
      submit: "Richiedi l'accesso",
      failed: "Si è verificato un errore. Riprova tra un momento.",
    },
    pending: {
      preparingTitle: "Preparazione della registrazione…",
      preparingDescription:
        "Il caricamento è ancora in corso. Questa pagina si aggiorna da sola appena è pronta.",
      generatingTitle: "Stiamo creando il tuo video…",
      generatingDescription:
        "Può volerci qualche minuto, quindi prenditi un caffè o uno spuntino ☕️🍪 La pagina si aggiorna da sola quando è pronto.",
      failedTitle:
        "Il caricamento di questa registrazione non è stato completato",
      failedDescription:
        "Il link è stato creato ma il video non è mai arrivato. Riprova il link tra un minuto, oppure fai una nuova registrazione.",
      comment: "Commenta",
    },
    upgradeBanner: {
      message:
        "{usage} con il piano Gratuito. Esegui l'upgrade per avere registrazioni illimitate in piena qualità.",
      usage:
        "one:{used} di {n} registrazione usata|other:{used} di {n} registrazioni usate",
    },
    editPanel: {
      editTitle: "Modifica video",
      editDescription:
        "Accorcia, taglia, cambia l’aspetto e correggi la trascrizione nell’editor.",
      downloadTitle: "Scarica il video",
      downloadDescription: "L'intera registrazione in formato MP4.",
      copyEmbed: "Copia codice di incorporamento",
      embedCopied: "Codice di incorporamento copiato",
      embedDescription: "Incolla il lettore in qualsiasi pagina web.",
    },
    notFound: {
      title: "Registrazione non trovata",
      description:
        "Questo link è scaduto o non è mai esistito. Le registrazioni degli account gratuiti vengono conservate per 30 giorni dall'ultima visualizzazione.",
      madeWith: "Realizzato con {product}",
    },
  },
  activity: {
    sidebar: {
      label: "Barra laterale della registrazione",
      activityTab: "Attività",
      transcriptTab: "Trascrizione",
      toolsTab: "Strumenti",
    },
    you: "Tu",
    anonymous: "Anonimo",
    jumpToMoment: "Vai a questo momento",
    empty: {
      title: "Ancora nessuna attività",
      description:
        "Le reazioni e i commenti degli spettatori compariranno qui man mano che arrivano.",
      firstTitle: "Lascia il primo commento",
      firstTitleNamed: "Lascia il primo commento, {name}",
      hint: "Premi {key} per rispondere oppure lascia un commento in fondo a questo pannello.",
      focusComposer: "Vai al campo del commento",
    },
    composer: {
      signIn: "Accedi per reagire e commentare",
      placeholder: "Lascia un commento…",
      mention: "Menziona qualcuno",
      noOneToMention: "Nessuno ha ancora reagito o commentato",
      insertEmoji: "Inserisci emoji",
      searchEmoji: "Cerca emoji",
      posting: "Pubblicazione…",
      submitAt: "Commenta a {time}",
      postFailed: "Impossibile pubblicare il commento",
    },
    comment: {
      delete: "Elimina il commento",
      deleteFailed: "Impossibile eliminare il commento",
    },
    reaction: {
      count: "one:{n} reazione|other:{n} reazioni",
      delete: "Elimina la reazione",
      deleteMany: "one:Elimina {n} reazione|other:Elimina {n} reazioni",
      deleteFailed: "Impossibile eliminare la reazione",
    },
    transcript: {
      pendingTitle: "Trascrizione in corso…",
      pendingDescription: "La trascrizione compare qui appena è pronta.",
      failedTitle: "La trascrizione non è stata completata",
      failedDescription:
        "Si è verificato un errore durante la trascrizione di questa registrazione.",
      noneTitle: "Nessuna trascrizione",
      noneOwnerDescription:
        "Registra con il microfono attivo e la trascrizione viene scritta per te.",
      noneViewerDescription:
        "Questa registrazione è stata fatta senza microfono.",
      searchLabel: "Cerca nella trascrizione",
      noMatches: "Nessun risultato.",
    },
    saveFailed: "Impossibile salvare. Riprova.",
    summary: {
      title: "Riepilogo",
      add: "Aggiungi",
      placeholder: "Che cosa succede in questa registrazione?",
      empty: "Ancora nessun riepilogo.",
      emptyAction: "Aggiungi un riepilogo",
    },
    chapters: {
      title: "Capitoli",
      count: "one:{n} capitolo|other:{n} capitoli",
      addAtPlayhead: "Aggiungi nel punto corrente",
      defaultTitle: "Capitolo {n}",
      editHint: "Un capitolo per riga, come {short} o {long}.",
      editHintShort: "M:SS Titolo",
      editHintLong: "H:MM:SS Titolo",
      editPlaceholder: "0:00 Introduzione\n0:30 Demo\n1:20 Conclusione",
      playing: "In riproduzione",
      remove: "Rimuovi capitolo",
      empty: "Ancora nessun capitolo.",
      emptyAction: "Aggiungine uno nel punto corrente",
    },
  },
  player: {
    overlay: {
      watchAgain: "Guarda di nuovo",
    },
    captions: {
      track: "Sottotitoli",
      size: "Dimensione",
      position: "Posizione",
      sizes: {
        small: "Piccola",
        medium: "Media",
        large: "Grande",
      },
      positions: {
        top: "In alto",
        bottom: "In basso",
      },
    },
    reactionBar: {
      comment: "Commenta",
      leaveComment: "Lascia un commento",
    },
    reactions: {
      heart: "Cuore",
      thumbsUp: "Pollice in su",
      fire: "Fuoco",
      clap: "Applauso",
      raisedHands: "Mani alzate",
      eyes: "Occhi",
    },
    embed: {
      title: "Registrazione {product}",
    },
    controls: {
      buttons: {
        play: "Riproduci",
        pause: "Pausa",
        replay: "Riproduci di nuovo",
        mute: "Disattiva audio",
        unmute: "Riattiva audio",
      },
      seek: {
        forward: "Avanti di {seconds} secondi",
        backward: "Indietro di {seconds} secondi",
      },
      fullscreen: {
        enter: "Attiva schermo intero",
        exit: "Esci da schermo intero",
      },
      captions: {
        enable: "Attiva sottotitoli",
        disable: "Disattiva sottotitoli",
      },
      pip: {
        enter: "Attiva Picture in Picture",
        exit: "Esci da Picture in Picture",
      },
      cast: {
        start: "Avvia trasmissione",
        stop: "Interrompi trasmissione",
        connecting: "Connessione in corso",
      },
      airplay: {
        start: "Avvia AirPlay",
        stop: "Interrompi AirPlay",
      },
      slider: {
        seek: "Barra di avanzamento",
      },
      time: {
        current: "Tempo attuale",
        duration: "Durata",
        position: "{current} di {duration}",
        unknown: "Contenuto non caricato, tempo sconosciuto.",
      },
      playback: {
        rate: "Velocità di riproduzione {rate}",
      },
      volume: {
        mutedValue: "{percent}, audio disattivato",
        muted: "Audio disattivato",
        label: "Volume",
        value: "Volume {value}",
      },
      status: {
        captionsOn: "Sottotitoli attivati",
        captionsOff: "Sottotitoli disattivati",
        paused: "In pausa",
        playing: "In riproduzione",
        fullscreen: "Schermo intero",
        pip: "Picture in Picture",
        exitPip: "Esci da Picture in Picture",
        seekedTo: "Spostato a {time}",
      },
      container: {
        label: "Lettore multimediale",
      },
      errors: {
        aborted: "Hai interrotto la riproduzione prima che finisse.",
        network:
          "Impossibile caricare questo contenuto per un problema di rete o del server.",
        decode:
          "Impossibile riprodurre questo contenuto. Potrebbe essere danneggiato, oppure il tuo browser potrebbe non supportarne il formato.",
        source:
          "Impossibile caricare questo contenuto. Potrebbe non essere disponibile, oppure il tuo browser potrebbe non supportarne il formato.",
        encrypted:
          "Impossibile riprodurre questo contenuto perché non è stato possibile decifrarlo.",
        unplayable: "Questo contenuto non è supportato dal lettore.",
        title: "Si è verificato un errore.",
        unexpected: "Si è verificato un errore imprevisto.",
      },
      common: {
        ok: "OK",
      },
      menu: {
        settings: "Impostazioni",
        quality: "Qualità",
        audio: "Audio",
        speed: "Velocità",
        captions: "Sottotitoli",
        playbackRate: "Velocità di riproduzione",
        off: "Disattivato",
        auto: "Automatico",
        autoWithLabel: "Automatico ({label})",
      },
    },
  },
  screenshotView: {
    page: {
      defaultTitle: "Screenshot {product}",
      description: "Uno screenshot condiviso da {product}.",
      madeWith: "Realizzato con {product}",
      loading: "Caricamento dello screenshot…",
    },
    authPrompt: {
      pricing: "Prezzi",
      logIn: "Accedi",
      getStarted: "Inizia",
      getFree: "Usa {product} gratis",
    },
    actions: {
      edit: "Modifica lo screenshot",
      share: "Condividi",
      shareTitle: "Condividi lo screenshot",
      copyLink: "Copia link",
      linkCopied: "Link copiato",
      more: "Altre azioni",
      delete: "Elimina lo screenshot",
      deleteTitle: "Eliminare questo screenshot?",
      deleteDescription:
        "L'immagine e il suo link smettono subito di funzionare. L'operazione non può essere annullata.",
      visibilityFailed: "Impossibile aggiornare la visibilità",
      deleteFailed: "Impossibile eliminare lo screenshot",
    },
    zoom: {
      expand: "Ingrandisci l'immagine",
      minimize: "Riduci l'immagine",
    },
    requestAccess: {
      title: "Richiedi l'accesso per vedere questo screenshot",
      notSharedBy: "{name} non ha ancora condiviso questo screenshot con te.",
      notSharedByOwner:
        "Il proprietario non ha ancora condiviso questo screenshot con te.",
      signInHint:
        "Accedi con la tua email di lavoro: se fai già parte del team del proprietario, entrerai subito.",
      signIn: "Accedi per continuare",
      sentTitle: "Richiesta inviata",
      sentDescription:
        "Abbiamo avvisato il proprietario. Riceverai un'email se ti concede l'accesso.",
      askingAs: "Richiesta inviata come {email}",
      noteLabel: "Aggiungi una nota {optional}",
      noteOptional: "(facoltativa)",
      notePlaceholder:
        "Ciao, vorrei una copia di questo screenshot della revisione del design.",
      sending: "Invio in corso…",
      submit: "Richiedi l'accesso",
      failed: "Si è verificato un errore. Riprova tra un momento.",
    },
    notFound: {
      title: "Screenshot non trovato",
      description:
        "Questo link è scaduto o non è mai esistito. Gli screenshot degli account gratuiti vengono conservati per 30 giorni dall'ultima visualizzazione.",
    },
  },
  recordingEditor: {
    skeleton: {
      label: "Apertura dell'editor",
      status: "Apertura dell'editor…",
    },
    preparing: {
      title: "Preparazione della registrazione…",
      description:
        "La registrazione è ancora in fase di caricamento. Questa pagina si aggiornerà automaticamente quando sarà pronta.",
    },
    failed: {
      title: "Caricamento della registrazione non riuscito.",
      description: "Prova a registrare di nuovo dall'app desktop.",
    },
    saveFailed: "Impossibile salvare",
    topBar: {
      back: "Torna alla registrazione",
      status: {
        idle: "Le modifiche vengono salvate automaticamente",
        saved: "Salvato",
        error: "Impossibile salvare",
      },
      versionHistory: "Cronologia delle versioni (in arrivo)",
      undo: "Annulla",
      undoShortcut: "Annulla ({key})",
      redo: "Ripeti",
      redoShortcut: "Ripeti ({key})",
      finish: "Fine",
    },
    panels: {
      label: "Pannelli dell'editor",
      tabs: {
        transcript: "Trascrizione",
        design: "Design",
        camera: "Videocamera",
        audio: "Suono",
        details: "Dettagli",
      },
      hide: {
        transcript: "Nascondi la trascrizione",
        design: "Nascondi il design",
        camera: "Nascondi la videocamera",
        audio: "Nascondi il suono",
        details: "Nascondi i dettagli",
      },
      show: {
        transcript: "Mostra la trascrizione",
        design: "Mostra il design",
        camera: "Mostra la videocamera",
        audio: "Mostra il suono",
        details: "Mostra i dettagli",
      },
    },
    toggleOn: "Attivo",
    background: {
      title: "Sfondo",
      gradients: "Sfumature",
      none: "Senza",
      noBackground: "Nessuno sfondo",
      upload: "Carica immagine",
      uploading: "Caricamento…",
      uploadedImage: "La tua immagine",
      solid: "Tinta unita",
      solidColor: "Tinta unita {color}",
      customColor: "Scegli un colore personalizzato",
      colors: "Colori",
      wallpaper: "{group}: sfondo {n}",
      wallpaperGroups: {
        general: "Generali",
        cities: "Città",
        blue: "Blu",
        purple: "Viola",
        orange: "Arancione",
        dark: "Scuri",
      },
      presets: {
        violet: "Viola",
        sunset: "Tramonto",
        orchid: "Orchidea",
        forest: "Foresta",
        flamingo: "Fenicottero",
        citrus: "Agrumi",
        arctic: "Artico",
        ocean: "Oceano",
        deep: "Abisso",
        ember: "Brace",
        mint: "Menta",
        dusk: "Crepuscolo",
        peach: "Pesca",
        midnight: "Mezzanotte",
        slate: "Ardesia",
      },
    },
    frame: {
      title: "Cornice",
      padding: "Margine",
      corners: "Angoli",
      shadow: "Ombra",
    },
    camera: {
      title: "Videocamera",
      show: "Mostra la videocamera",
      hidden: "Nascosta",
      position: "Posizione",
      positionHint: "Trascina il punto o tocca un angolo",
      positionHintHidden: "Mostra la videocamera per posizionarla.",
      corners: {
        topLeft: "In alto a sinistra",
        topRight: "In alto a destra",
        bottomLeft: "In basso a sinistra",
        bottomRight: "In basso a destra",
      },
      size: "Dimensione",
      sizes: {
        small: "Piccola",
        medium: "Media",
        large: "Grande",
      },
    },
    audio: {
      title: "Audio",
      systemSound: "Audio di sistema",
      sound: "Suono",
      microphone: "Microfono",
      muted: "Disattivato",
      sharedTrack:
        "In questa registrazione il microfono e l'audio di sistema condividono un'unica traccia.",
    },
    details: {
      title: "Registrazione",
      link: "Link",
      size: "Dimensione",
      duration: "Durata",
      views: "Visualizzazioni",
      created: "Creata",
    },
    transcript: {
      transcribing: "Trascrizione in corso…",
      unavailable: "Nessuna trascrizione disponibile",
      pendingHint: "Ricarica questa pagina tra un minuto per modificarla.",
      failedHint:
        "La trascrizione di questa registrazione non è stata completata.",
      missingHint:
        "Registra con il microfono attivo e la trascrizione viene scritta per te.",
      deleteWord: "Elimina la parola",
      deleteWords: "one:Elimina {n} parola|other:Elimina {n} parole",
      clearSelection: "Deseleziona",
      hint: "Clicca su una parola o trascina su più parole per selezionarle, fai doppio clic per correggere il testo.",
      resetEdits: "Azzera le modifiche",
      editLine: "Modifica la riga della trascrizione",
      selectLine: "Seleziona la riga a {time}",
      restore: "Ripristina",
      saveFailed: "Impossibile salvare",
      resetFailed: "Impossibile azzerare",
    },
    timeline: {
      hideWaveform: "Nascondi la forma d'onda",
      showWaveform: "Mostra la forma d'onda",
      loadingAudio: "Caricamento dell'audio…",
      deleteSelection: "Elimina la selezione",
      deleteSelectionHint:
        "Seleziona delle parole nella trascrizione, oppure dividi la timeline e scegli un segmento",
      splitAt: "Dividi a {time}",
      splitHint: "Prima riproduci o scorri fino a un momento",
      comingSoon: "In arrivo",
      fit: "Adatta",
      zoomOut: "Riduci lo zoom",
      zoom: "Zoom della timeline",
      zoomIn: "Aumenta lo zoom",
      seek: "Posizione di riproduzione",
      trimStart: "Accorcia l'inizio della clip",
      trimEnd: "Accorcia la fine della clip",
      removeSplit: "Rimuovi la divisione a {time}",
    },
  },
  screenshotEditor: {
    loading: "Caricamento dell'editor…",
    imageError: {
      decode: "Impossibile decodificare l'immagine dello screenshot.",
      fetch:
        "Impossibile caricare l'immagine dello screenshot. Il bucket potrebbe aver perso l'accesso CORS.",
    },
    header: {
      back: "Torna allo screenshot",
      reset: "Azzera le modifiche",
      undo: "Annulla",
      undoTooltip: "Annulla ({key})",
      redo: "Ripeti",
      redoTooltip: "Ripeti ({key})",
      finish: "Fine",
    },
    saveError: {
      notMounted: "Editor non montato",
      noCanvas: "Impossibile ottenere il canvas di esportazione",
      workerCrashed: "Il worker di codifica PNG si è arrestato",
    },
    tools: {
      text: "Testo",
      rect: "Rettangolo",
      arrow: "Freccia",
      background: "Sfondo",
    },
    background: {
      title: "Aggiungi uno sfondo",
      close: "Chiudi il selettore dello sfondo",
      none: "Nessuno",
      gradients: {
        violet: "Viola",
        sunset: "Tramonto",
        orchid: "Orchidea",
        forest: "Foresta",
        flamingo: "Fenicottero",
        citrus: "Agrumi",
        arctic: "Artico",
        ocean: "Oceano",
        deep: "Abisso",
      },
      solid: "Tinta unita {color}",
      custom: "Scegli un colore personalizzato",
    },
    inspector: {
      color: "Colore {color}",
      size: "{n}px",
      duplicate: "Duplica",
    },
    textPrompt: "Testo",
  },
  canvas: {
    meta: {
      title: "Canvas",
      description: "Una lavagna vuota su cui disegnare mentre registri.",
    },
    loading: "Caricamento del canvas…",
    tools: {
      select: "Seleziona",
      hand: "Mano",
      pen: "Penna",
      highlighter: "Evidenziatore",
      rect: "Rettangolo",
      ellipse: "Ellisse",
      arrow: "Freccia",
      line: "Linea",
      text: "Testo",
      eraser: "Gomma",
    },
    shortcut: "{label} · {key}",
    colour: "Colore {colour}",
    stroke: "Tratto {width}",
    hint: "Scorri per spostarti · scorri con {mod} per lo zoom · tieni premuto {space} per trascinare",
    textPlaceholder: "Scrivi…",
    history: {
      undo: "Annulla",
      redo: "Ripeti",
      clear: "Cancella la lavagna",
    },
    zoom: {
      out: "Riduci lo zoom",
      reset: "Reimposta lo zoom",
      in: "Aumenta lo zoom",
    },
    extensionPrompt: {
      title: "Registra questo canvas",
      description:
        "Aggiungi l'estensione CaptureFlow per registrare schermo e videocamera mentre disegni, poi condividi un link.",
      dismiss: "Non ora",
      install: "Aggiungi a Chrome",
    },
  },
};

export default messages;

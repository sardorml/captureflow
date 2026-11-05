import type { AppMessages } from "../messages";

const messages: AppMessages = {
  common: {
    cancel: "Annuler",
    save: "Sauvegarder",
    saving: "Sauvegarde…",
    delete: "Supprimer",
    deleting: "Suppression…",
    remove: "Retirer",
    close: "Fermer",
    back: "Retour",
    continue: "Continuer",
    confirm: "Confirmer",
    done: "Terminé",
    edit: "Modifier",
    copy: "Copier",
    copied: "Copié",
    search: "Rechercher",
    loading: "Chargement…",
    retry: "Réessayer",
    learnMore: "En savoir plus",
    language: "Langue",
    themeToLight: "Passer au thème clair",
    themeToDark: "Passer au thème sombre",
    somethingWrong: "Une erreur s’est produite. Réessayez.",
  },
  auth: {
    signedInAs: "Connecté en tant que {email}.",
    errors: {
      generic: "Une erreur s’est produite. Veuillez réessayer.",
      network: "Erreur réseau. Veuillez réessayer.",
    },
    login: {
      metaTitle: "Connexion",
      signInTitle: "Bon retour parmi nous",
      signInDescription: "Connectez-vous avec Google, GitHub ou votre e-mail",
      signUpTitle: "Créez votre compte",
      signUpDescription: "Inscrivez-vous avec Google, GitHub ou votre e-mail",
      inviteTitle: "Rejoindre {workspace}",
      inviteDescription:
        "{inviter} vous a envoyé une invitation. Connectez-vous ou créez un compte avec {email} pour l’accepter.",
      continueWith: "Continuer avec {provider}",
      or: "Ou",
      emailLabel: "E-mail",
      emailPlaceholder: "you@example.com",
      emailInvalid: "Saisissez une adresse e-mail valide.",
      continueWithEmail: "Continuer avec l’e-mail",
      askForInvite:
        "Besoin d’un compte ? Demandez une invitation à un administrateur.",
      haveAccount: "Vous avez déjà un compte ? {action}",
      haveAccountAction: "Se connecter",
      noAccount: "Vous n’avez pas de compte ? {action}",
      noAccountAction: "S’inscrire",
      changeEmail: "Modifier",
      nameLabel: "Nom",
      namePlaceholder: "Votre nom",
      passwordLabel: "Mot de passe",
      newPasswordPlaceholder: "Au moins 12 caractères",
      passwordTooShort: "Utilisez au moins 12 caractères.",
      passwordMissing: "Saisissez votre mot de passe.",
      signInSubmit: "Se connecter",
      signUpSubmit: "Créer un compte",
      terms: "En continuant, vous acceptez nos {terms} et notre {privacy}.",
      termsLink: "Conditions d’utilisation",
      privacyLink: "Politique de confidentialité",
    },
    verify: {
      title: "Consultez vos e-mails",
      description:
        "Nous avons envoyé un lien à {email}. Ouvrez-le pour terminer la création de votre compte.",
      resend: "Renvoyer l’e-mail",
      resent: "Renvoyé",
      resendFailed: "Impossible d’envoyer l’e-mail. Veuillez réessayer.",
      wrongAddress: "Mauvaise adresse ? {action}",
      wrongAddressAction: "Utiliser une autre adresse e-mail",
    },
    oauthErrors: {
      unfinished: "La connexion n’a pas abouti. Veuillez réessayer.",
      inviteOnly:
        "Cette instance CaptureFlow est accessible sur invitation uniquement. Demandez une invitation à un administrateur.",
      allowedDomains:
        "Inscrivez-vous avec une adresse du domaine {domains}, ou demandez une invitation à un administrateur.",
      providerDomains:
        "Inscrivez-vous avec un compte Google ou GitHub du domaine {domains}.",
      domainChoice: "{first} ou {second}",
    },
    inviteFallbacks: {
      workspace: "un espace de travail CaptureFlow",
      inviter: "Un membre de votre équipe",
    },
    setPassword: {
      title: "Définissez votre mot de passe",
      description:
        "Choisissez un mot de passe pour {email}. Vous serez ensuite connecté.",
      passwordLabel: "Nouveau mot de passe",
      passwordPlaceholder: "Au moins 12 caractères",
      submit: "Sauvegarder le mot de passe",
      expiredTitle: "Ce lien ne fonctionne plus",
      expiredDescription:
        "Il a déjà été utilisé ou a expiré. Demandez-en un nouveau à un administrateur.",
      goToSignIn: "Aller à la connexion",
    },
    invite: {
      title: "Vous avez reçu une invitation",
      asViewer:
        "Vous avez reçu une invitation à rejoindre {workspace} sur CaptureFlow en tant que lecteur : vous pouvez regarder et commenter tout ce qui y est partagé.",
      asMember:
        "Vous avez reçu une invitation à rejoindre {workspace} sur CaptureFlow en tant que membre : vous pouvez y enregistrer et partager avec l’équipe.",
      accept: "Accepter l’invitation",
      databaseUnavailable: "Base de données indisponible",
      invalidTitle: "Cette invitation n’est plus valide",
      invalidBody:
        "Ce lien a expiré ou a déjà été utilisé. Demandez au propriétaire de l’espace de travail de vous envoyer une nouvelle invitation.",
      wrongAccountTitle: "Mauvais compte",
      wrongAccountBody:
        "Cette invitation a été envoyée à {invited}, mais vous êtes connecté en tant que {current}. Déconnectez-vous, puis connectez-vous avec l’adresse invitée pour l’accepter.",
      goToDashboard: "Aller au tableau de bord",
      signOut: "Se déconnecter",
    },
    handoff: {
      signingIn: "Connexion en cours…",
      returning: "Retour à CaptureFlow…",
      open: "Ouvrir CaptureFlow",
      hint: "Si rien ne se passe, cliquez sur le bouton ci-dessus. Vous pourrez fermer cet onglet une fois l’application de bureau rouverte.",
      extensionDone:
        "Connecté en tant que {email}. Vous pouvez fermer cet onglet.",
      extensionUnreachable:
        "Impossible de joindre l’extension CaptureFlow. Vérifiez qu’elle est installée, puis cliquez sur son icône pour réessayer.",
      extensionUnverified:
        "Impossible de vérifier l’extension. Réinstallez-la et réessayez.",
    },
  },
  shell: {
    record: {
      newRecording: "Nouvel enregistrement",
    },
    nav: {
      toggleSidebar: "Afficher ou masquer la barre latérale",
      dashboard: "Tableau de bord",
      recordings: "Enregistrements",
      screenshots: "Captures d’écran",
      canvas: "Canevas",
      workspaceGroup: "Espace de travail",
      members: "Membres",
      settings: "Paramètres",
      personal: "Personnel",
      workspace: "Espace de travail",
      billing: "Facturation",
      admin: "Administration",
    },
    upgradeCard: {
      title: "Mettez à niveau votre espace de travail",
      description:
        "Le forfait Gratuit comprend {recordings} enregistrements par personne en qualité économie de données. Les forfaits payants suppriment les limites, à partir de {price} par membre.",
      viewPlans: "Voir les forfaits",
    },
    topBar: {
      upgrade: "Mettre à niveau",
    },
    workspaceSwitcher: {
      switchWorkspace: "Changer d’espace de travail",
      summary: "one:Par défaut · {n} membre|other:Par défaut · {n} membres",
      workspaces: "Espaces de travail",
      owned: "Vous en êtes propriétaire",
      joined: "Vous l’avez rejoint",
      newWorkspace: "Nouvel espace de travail",
      inviteMembers: "Inviter des membres",
    },
    drawer: {
      open: "Ouvrir le menu de l’espace de travail",
      title: "Menu de l’espace de travail",
    },
    search: {
      prompt: "Rechercher dans vos enregistrements et captures d’écran",
      clear: "Effacer la recherche",
      results: "Résultats de recherche",
      hint: "Recherchez vos enregistrements et captures d’écran par titre.",
      noMatches: "Aucun résultat",
      kind: {
        recording: "enregistrement",
        screenshot: "capture d’écran",
      },
    },
    account: {
      menu: "Menu du compte",
      nav: {
        billing: "Facturation",
        devices: "Appareils connectés",
        settings: "Paramètres",
        support: "Contacter le support",
      },
      freePlan: "Gratuit",
      signOut: "Se déconnecter",
      signingOut: "Déconnexion…",
    },
    theme: {
      label: "Thème",
      light: "Clair",
      dark: "Sombre",
      system: "Système",
    },
    notifications: {
      title: "Notifications",
      subtitle: "Invitations et changements dans vos espaces de travail.",
      bellUnread:
        "one:Notifications, {n} non lue|other:Notifications, {n} non lues",
      viewAll: "Tout afficher",
      menuEmpty:
        "Vous êtes à jour. Les invitations, les nouveaux membres de l’équipe et les changements de rôle s’affichent ici.",
      pageEmpty:
        "Vous êtes à jour. Quand quelqu’un vous invite, rejoint votre espace de travail ou change votre rôle, vous le voyez ici.",
      accept: "Accepter",
      decline: "Refuser",
      unread: "Non lue",
      someone: "Quelqu’un",
      message: {
        invited: {
          member:
            "{actor} vous invite à rejoindre {workspace} en tant que membre",
          viewer:
            "{actor} vous invite à rejoindre {workspace} en tant que lecteur",
        },
        joined: {
          member: "{actor} a rejoint {workspace} en tant que membre",
          viewer: "{actor} a rejoint {workspace} en tant que lecteur",
        },
        seatRequested: "{actor} a demandé une licence payante dans {workspace}",
        seatDenied:
          "{actor} a refusé votre demande de licence dans {workspace}",
        roleChanged: {
          member: "{actor} vous a attribué le rôle de membre dans {workspace}",
          viewer: "{actor} vous a attribué le rôle de lecteur dans {workspace}",
        },
        downgraded: "{actor} vous a fait passer en lecteur dans {workspace}",
        keepRecordingUntil:
          "Vous pouvez continuer à enregistrer jusqu’au {date}.",
        removed: "{actor} vous a retiré de {workspace}",
      },
      acceptErrors: {
        failed: "Impossible d’accepter l’invitation",
        signedOut: "Connectez-vous pour accepter",
        invalid: "Cette invitation a expiré ou a été retirée",
        emailMismatch:
          "Cette invitation est destinée à une autre adresse e-mail",
        alreadyMember: "Vous faites déjà partie de cet espace de travail",
      },
    },
    mobileNav: {
      open: "Ouvrir le menu",
      close: "Fermer le menu",
      docs: "Documentation",
      star: "Mettre une étoile sur GitHub",
      signIn: "Se connecter",
      getStarted: "Commencer",
    },
    skeletons: {
      avatar: "Avatar",
      workspaceName: "Nom de l’espace de travail",
      workspaceLogo: "Logo de l’espace de travail",
    },
  },
  library: {
    dashboard: {
      welcome: "Bon retour",
      welcomeName: "Bon retour, {name}",
      openCanvas: "Ouvrir le canevas",
      newRecording: "Nouvel enregistrement",
      stats: {
        recordings: "Enregistrements",
        plusScreenshots:
          "one:Et {count} capture d’écran|other:Et {count} captures d’écran",
        noScreenshots: "Aucune capture d’écran pour le moment",
        views: "Vues",
        viewsAverage: "{count} par enregistrement en moyenne",
        noViews: "Aucune vue pour le moment",
        recorded: "Durée enregistrée",
        recordedAverage: "{duration} par enregistrement en moyenne",
        nothingRecorded: "Rien d’enregistré pour le moment",
        recordingsLeft: "Enregistrements restants",
        leftOfAllowance: "{left} sur {allowance}",
        freePlanLimit: "Forfait Gratuit, jusqu’à {minutes} min chacun",
      },
      recordedTime: {
        minutes: "{minutes} min",
        hours: "{hours} h",
        hoursMinutes: "{hours} h {minutes} min",
      },
      recent: {
        title: "Enregistrements récents",
        all: "Tous les enregistrements",
        empty: "Rien n’a encore été partagé dans cet espace de travail.",
        views: "one:{n} vue|other:{n} vues",
        comments: "one:{n} commentaire|other:{n} commentaires",
        reactions: "one:{n} réaction|other:{n} réactions",
      },
      start: {
        title: "Commencez à enregistrer avec {product}",
        surfacesLabel: "Où enregistrer",
        surfaces: {
          extension: "Extension",
          desktop: "Application de bureau",
          canvas: "Canevas",
        },
        extension: {
          description:
            "Enregistrez un onglet, une fenêtre ou tout l’écran depuis la barre d’outils, et obtenez un lien que vous pouvez partager avec tout le monde.",
          record: "Enregistrer maintenant",
          addToChrome: "Ajouter à Chrome",
        },
        desktop: {
          description:
            "Une application Mac native, qui enregistre votre écran et votre caméra avec le son du système, arrive bientôt. En attendant, l’extension enregistre un onglet, une fenêtre ou tout l’écran.",
          download: "Télécharger pour Mac",
          comingSoon: "Bientôt disponible",
        },
        canvas: {
          description:
            "Un tableau vierge avec stylos, formes et texte pour dessiner pendant l’enregistrement, quand il n’y a aucune page à montrer.",
        },
      },
    },
    recording: {
      pageTitle: "Enregistrements",
      count: "one:{n} enregistrement|other:{n} enregistrements",
      untitled: "Enregistrement sans titre",
      aiGenerated: "Généré par IA",
      processing: "Traitement en cours",
      noMatches: "Aucun enregistrement ne correspond à ces filtres.",
      empty:
        "Vous n’avez encore créé aucun lien d’enregistrement. Enregistrez dans l’application de bureau CaptureFlow et vos enregistrements apparaîtront ici.",
      selectAll: "Sélectionner tous les enregistrements",
      selected:
        "one:{n} enregistrement sélectionné|other:{n} enregistrements sélectionnés",
      open: "Ouvrir l’enregistrement",
      edit: "Modifier l’enregistrement",
      share: "Partager l’enregistrement",
      delete: "Supprimer l’enregistrement",
      deleteTitle: "Supprimer cet enregistrement ?",
      deleteDescription:
        "La vidéo et son lien cessent de fonctionner immédiatement. Cette action est irréversible.",
      deleteSelectedTitle:
        "one:Supprimer {n} enregistrement ?|other:Supprimer {n} enregistrements ?",
    },
    screenshot: {
      pageTitle: "Captures d’écran",
      count: "one:{n} capture d’écran|other:{n} captures d’écran",
      untitled: "Capture d’écran sans titre",
      numbered: "Capture d’écran {id}",
      noMatches: "Aucune capture d’écran ne correspond à ces filtres.",
      empty:
        "Aucune capture d’écran pour le moment. Ouvrez CaptureFlow → onglet « Screenshot » → choisissez « Display », « Window » ou « Area » pour capturer. Votre capture d’écran apparaît ici automatiquement.",
      selectAll: "Sélectionner toutes les captures d’écran",
      selected:
        "one:{n} capture d’écran sélectionnée|other:{n} captures d’écran sélectionnées",
      open: "Ouvrir la capture d’écran",
      edit: "Modifier la capture d’écran",
      share: "Partager la capture d’écran",
      delete: "Supprimer la capture d’écran",
      deleteTitle: "Supprimer cette capture d’écran ?",
      deleteDescription:
        "L’image et son lien cessent de fonctionner immédiatement. Cette action est irréversible.",
      deleteSelectedTitle:
        "one:Supprimer {n} capture d’écran ?|other:Supprimer {n} captures d’écran ?",
    },
    filters: {
      access: "Accès",
      sort: "Trier",
      current: "{label} : {value}",
      accessOptions: {
        all: "Tous les accès",
        public: "Public",
        workspace: "Espace de travail",
        private: "Privé",
      },
      sortOptions: {
        newest: "Du plus récent au plus ancien",
        oldest: "Du plus ancien au plus récent",
        views: "Les plus vus",
      },
    },
    card: {
      select: "Sélectionner {title}",
      moreActions: "Plus d’actions",
      rename: "Renommer",
      unknownAuthor: "Inconnu",
    },
    selection: {
      deleteDescription: "Leurs liens cessent de fonctionner immédiatement.",
      deleteFailed:
        "{failed} sur {count} n’ont pas pu être supprimés. Les autres ont été supprimés.",
      clear: "Tout désélectionner",
    },
    pager: {
      label: "Pages",
      previous: "Page précédente",
      next: "Page suivante",
    },
    visibility: {
      label: "Visibilité",
      labels: {
        public: "Public",
        workspace: "Espace de travail",
        private: "Privé",
      },
      descriptions: {
        public: "Toute personne ayant le lien peut regarder",
        workspace:
          "Seuls les membres connectés de l’espace de travail peuvent regarder",
        private: "Visible uniquement par vous",
      },
      workspaceNamed: "Espace de travail · {name}",
    },
    share: {
      title: "Partager",
      embed: "Intégrer",
      embedPublic: "Se lit partout où le code est collé.",
      embedRestricted:
        "Se lit uniquement pour les personnes qui peuvent déjà ouvrir le lien.",
      copyCode: "Copier le code",
      generalAccess: "Accès général",
      generalAccessCurrent: "Accès général : {access}",
      copyLink: "Copier le lien",
      linkCopied: "Lien copié",
      shareAt: "Partager à {time}",
    },
    editableTitle: {
      label: "Titre de l’enregistrement",
      rename: "Renommer l’enregistrement",
    },
  },
  members: {
    title: "Membres",
    databaseUnavailable: "Base de données indisponible.",
    role: "Rôle",
    status: "Statut",
    roles: {
      owner: "Administrateur",
      member: "Membre",
      viewer: "Lecteur",
    },
    roleHints: {
      member: {
        does: "Enregistre dans cet espace de travail.",
        costs: "Une licence payante avec Light et Pro.",
      },
      viewer: {
        does: "Regarde et commente.",
        costs: "Toujours gratuit.",
      },
    },
    statuses: {
      active: "Actif",
      invited: "Invité",
    },
    seatSummary: {
      members: "one:{n} membre|other:{n} membres",
      viewers: "one:{n} lecteur|other:{n} lecteurs",
      paidSeats: "one:{n} licence payante|other:{n} licences payantes",
      membersAndViewers: "{members} et {viewers}",
      onPaidSeats:
        "{people} pour {seats}. Chaque membre occupe une licence ; les lecteurs sont gratuits.",
      membersFree: "{people}. Les membres sont gratuits avec ce forfait.",
      freePlan:
        "{people}. Forfait Gratuit : chaque membre dispose de {recordings} enregistrements de {minutes} minutes maximum ; les lecteurs regardent et commentent.",
      planTitle: "Forfait {plan}",
      paidPlanTitle: "Forfait payant",
      freePlanTitle: "Forfait Gratuit",
      upgrade: "Mettre à niveau l’espace de travail",
    },
    table: {
      intro:
        "Les membres enregistrent ici ; les lecteurs regardent et commentent.",
      ownerIntro:
        "En tant que propriétaire, vous pouvez inviter et retirer des personnes, et modifier les rôles.",
      searchPlaceholder: "Nom ou adresse e-mail",
      searchLabel: "Rechercher des membres",
      allRoles: "Tous les rôles",
      everyone: "Tout le monde",
      columns: {
        name: "Nom",
        dateAdded: "Date d’ajout",
        email: "Adresse e-mail",
        actions: "Actions",
      },
      empty: "Personne ne correspond à ces filtres.",
      downgradeNote: "Lecteur à partir du {date} · {keep}",
      keepAsMember: "Conserver comme membre",
      revoke: "Révoquer",
    },
    seatRequests: {
      title: "Demandes de licence",
      description:
        "Ces lecteurs ont demandé à enregistrer. En approuvant, vous en faites des membres.",
      descriptionPaid:
        "Ces lecteurs ont demandé à enregistrer. En approuvant, vous en faites des membres, ce qui ajoute une licence payante.",
      asked: "{email} · demande du {date}",
      deny: "Refuser",
      approve: "Approuver",
    },
    seatConfirm: {
      addTitle: "Attribuer une licence payante à {name} ?",
      addBody:
        "Les membres enregistrent : chacun occupe donc une licence payante. Votre forfait {plan} passe de {seats} à {nextSeats} licences, soit de {before} à {after} par mois.",
      addBodyYearly:
        "Les membres enregistrent : chacun occupe donc une licence payante. Votre forfait {plan} passe de {seats} à {nextSeats} licences, soit de {before} à {after} par mois, en facturation annuelle.",
      addInvoice:
        "Le reste de cette période de facturation est ajouté à votre prochaine facture.",
      addConfirm: "Ajouter une licence payante",
      removeTitle: "Passer {name} en lecteur ?",
      removeBody:
        "{name} peut continuer à enregistrer jusqu’au {date}, fin de la période que vous avez payée. Ce membre devient ensuite lecteur : il peut regarder et commenter, mais pas enregistrer.",
      removePlan:
        "À partir de cette date, votre forfait {plan} passe de {seats} à {nextSeats} licences, soit de {before} à {after} par mois.",
      removePlanYearly:
        "À partir de cette date, votre forfait {plan} passe de {seats} à {nextSeats} licences, soit de {before} à {after} par mois, en facturation annuelle.",
      removeConfirm: "Passer en lecteur",
    },
    remove: {
      label: "Retirer {name} de l’espace de travail",
      title: "Retirer {name} de {workspace} ?",
      body: "Cette personne perd l’accès immédiatement. Ses enregistrements et captures d’écran restent dans l’espace de travail.",
      freesSeat:
        "Cela libère sa licence payante : votre forfait passe de {seats} à {nextSeats} licences.",
    },
    leave: {
      button: "Quitter",
      title: "Quitter {workspace} ?",
      body: "Vous perdrez l’accès à ses enregistrements et captures d’écran. Tout ce que vous y avez enregistré reste dans l’espace de travail.",
      comeBack: "Pour revenir, il faudra que quelqu’un vous invite à nouveau.",
      confirm: "Quitter l’espace de travail",
    },
    invite: {
      trigger: "Inviter des membres",
      title: "Inviter des membres dans {workspace}",
      titleOwnWorkspace: "Inviter des membres dans votre espace de travail",
      description:
        "Ils recevront un e-mail avec un lien qui expire dans 7 jours. Assurez-vous qu’ils se connectent avec la même adresse.",
      removeEmail: "Retirer {email}",
      addEmails: "Ajouter des adresses e-mail",
      separatorHint:
        "Séparez les adresses par un espace, une virgule ou la touche Entrée.",
      paidSeatNote:
        "Chaque membre qui accepte ajoute une licence payante à votre forfait {plan}, à {price} par mois chacune. Le reste de cette période est reporté sur votre prochaine facture.",
      noEmails: "Ajoutez au moins une adresse e-mail",
      invalidEmails: "Adresse e-mail non valide : {emails}",
      failed: "Échec",
      sent: "one:{n} invitation envoyée.|other:{n} invitations envoyées.",
      sending: "Envoi…",
      submit: "Envoyer les invitations",
    },
    actions: {
      emailRequired: "Saisissez une adresse e-mail",
      emailInvalid: "Cette adresse e-mail ne semble pas valide",
      ownWorkspace: "Vous êtes déjà dans votre propre espace de travail",
      alreadyMember: "Cette personne est déjà membre de cet espace de travail",
      emailNotSent:
        "Invitation créée, mais l’envoi de l’e-mail a échoué. Copiez le lien depuis la liste des invitations en attente.",
      invitationSent: "Invitation envoyée à {email}",
      alreadyRecording: "Vous pouvez déjà enregistrer ici",
    },
  },
  settings: {
    saved: "Sauvegardé",
    errors: {
      ownerOnly:
        "Seul le propriétaire de l’espace de travail peut modifier ce réglage",
      databaseUnavailable: "Base de données indisponible",
      saveFailed: "Échec de la sauvegarde. Réessayez.",
    },
    upload: {
      uploading: "Envoi en cours…",
      missing: "Choisissez un fichier image",
      failed: "Échec de l’envoi",
      failedReason: "Échec de l’envoi : {reason}",
    },
    personal: {
      title: "Paramètres personnels",
      account: {
        title: "Compte",
        description:
          "Comment vous apparaissez auprès de votre équipe et des personnes qui regardent vos enregistrements.",
      },
      preferences: {
        title: "Préférences",
        description: "L’apparence et la langue de CaptureFlow pour vous.",
      },
      languageDescription: "La langue dans laquelle CaptureFlow s’affiche.",
    },
    avatar: {
      label: "Avatar",
      change: "Changer d’avatar",
      removing: "Retrait…",
      hint: "JPG, PNG, WebP ou GIF. 2 Mo maximum.",
      tooLarge: "L’avatar ne doit pas dépasser 2 Mo",
      badType: "L’avatar doit être au format PNG, JPEG, WebP ou GIF",
    },
    account: {
      name: {
        label: "Nom complet",
        placeholder: "Votre nom",
        description:
          "Affiché sur les enregistrements, les captures d’écran et les lignes d’activité.",
        required: "Le nom est obligatoire.",
        updateFailed: "Impossible de mettre à jour le nom.",
      },
      email: {
        label: "Adresse e-mail",
        description:
          "Sert à vous connecter. Contactez le support pour la modifier.",
      },
      userId: {
        label: "ID utilisateur",
        copy: "Copier l’ID utilisateur",
        description: "Indiquez-le quand vous contactez le support.",
      },
      saveChanges: "Sauvegarder les modifications",
    },
    workspace: {
      title: "Paramètres de l’espace de travail",
      tabs: {
        label: "Sections des paramètres",
        general: "Général",
        security: "Sécurité",
      },
      general: {
        title: "Général",
        description:
          "Le nom et le logo qui identifient cet espace de travail dans le sélecteur, sur la page des membres et dans les aperçus de partage.",
      },
      name: {
        title: "Nom de l’espace de travail",
        description: "Le nom affiché pour votre espace de travail.",
        empty: "Le nom de l’espace de travail ne peut pas être vide",
        tooLong:
          "Le nom de l’espace de travail est trop long ({max} caractères maximum)",
      },
      logo: {
        title: "Logo de l’espace de travail",
        description:
          "Affiché à côté du nom de votre espace de travail. PNG, JPEG, WebP, GIF ou SVG, 2 Mo maximum.",
        upload: "Envoyer un logo",
        replace: "Remplacer le logo",
        tooLarge: "Le logo ne doit pas dépasser 2 Mo",
        badType: "Le logo doit être au format PNG, JPEG, WebP, GIF ou SVG",
      },
      permissions: {
        title: "Autorisations par défaut",
        description:
          "Réglages appliqués à chaque nouvel enregistrement et à chaque nouvelle capture d’écran de l’espace de travail.",
      },
      recordingAccess: {
        title: "Accès à l’enregistrement",
        description:
          "Choisissez si les membres de l’équipe peuvent publier des enregistrements et des captures d’écran dans cet espace de travail.",
        allow: {
          title: "Autoriser les membres de l’équipe à publier ici",
          body: "Les membres peuvent enregistrer dans cet espace de travail.",
        },
        ownerOnly: {
          title: "Uniquement le propriétaire de l’espace de travail",
          body: "Les envois des membres de l’équipe vont dans leur espace de travail personnel.",
        },
      },
    },
    devices: {
      title: "Appareils connectés",
      count: "one:{n} appareil connecté|other:{n} appareils connectés",
      empty:
        "Aucun appareil connecté. Ouvrez l’application de bureau CaptureFlow et cliquez sur « Sign in » dans la barre d’enregistrement pour associer ce compte.",
      unlabelled: "Appareil sans nom",
      added: "Ajouté le {date}",
      addedLastUsed: "Ajouté le {date} · dernière utilisation le {lastUsed}",
      neverUsed: "Jamais utilisé",
      revoke: {
        action: "Révoquer",
        title: "Déconnecter cet appareil ?",
        description: "Il devra se reconnecter pour gérer les enregistrements.",
      },
    },
  },
  billing: {
    chargedInUsd: "Facturé en dollars américains.",
    shownIn:
      "Les prix sont affichés en {currency}. Le paiement est en dollars américains.",
    page: {
      title: "Facturation",
      subtitle: "Votre forfait et ce que vous en avez utilisé.",
      workspaceLabel: "Espace de travail · {name}",
      manageSubscription: "Gérer l’abonnement",
      upgradeWorkspace: "Mettre à niveau l’espace de travail",
      storage: "Stockage de l’espace de travail",
      usedOfLimit: "{used} sur {limit}",
      usedNoLimit: "{used} — sans limite",
    },
    loading: {
      plan: "Forfait",
      usage: "Utilisation",
    },
    counts: {
      members: "one:{n} membre|other:{n} membres",
      paidSeats: "one:{n} licence payante|other:{n} licences payantes",
      freeViewers: "one:{n} lecteur gratuit|other:{n} lecteurs gratuits",
    },
    plan: {
      free: "Gratuit",
      paid: "Payant",
      billedMonthly: "Facturation mensuelle",
      billedYearly: "Facturation annuelle",
      freeSummary:
        "{members} · jusqu’à {recordings} enregistrements par personne, de {minutes} minutes chacun, en qualité économie de données",
    },
    status: {
      onTrial: "Essai",
      active: "Actif",
      paused: "En pause",
      pastDue: "Échec du paiement",
      unpaid: "Impayé",
      cancelled: "Annulé",
      expired: "Expiré",
    },
    details: {
      youPay: "Vous payez",
      amountPerMonth: "{amount} par mois",
      amountPerYear: "{amount} par an",
      seatsMonthly:
        "one:{n} licence × {price} par mois|other:{n} licences × {price} par mois",
      seatsYearly:
        "one:{n} licence × {price} par mois, {total} par mois en facturation annuelle|other:{n} licences × {price} par mois, {total} par mois en facturation annuelle",
      nextPayment: "Prochain paiement",
      ends: "Fin",
      endOfPeriod: "À la fin de cette période",
      amountOnDate: "{amount} le {date}",
      firstPaymentPending: "Une fois le premier paiement validé",
      estimate: "{base} · {change}, estimation",
      baseForSeats:
        "one:{amount} pour {n} licence|other:{amount} pour {n} licences",
      seatsAdded:
        "one:{amount} pour {n} licence ajoutée sur cette période|other:{amount} pour {n} licences ajoutées sur cette période",
      seatsRemoved:
        "one:{amount} de crédit pour {n} licence retirée sur cette période|other:{amount} de crédit pour {n} licences retirées sur cette période",
      seatChanges:
        "{amount} pour les changements de licences sur cette période",
      seats: "Licences",
      seatsAndViewers: "{seats}, {viewers}",
      billedTo: "Facturé à",
      paymentMethod: "Moyen de paiement",
      cardEnding: "{brand} se terminant par {last4}",
      card: "Carte",
      updateCard: "Mettre à jour",
    },
    switchPlan: {
      switchTo: "Passer à {plan}",
      title: "Passer à {plan} ?",
      priceMonthly:
        "one:Pour {n} licence, vous passez de {before} à {after} par mois.|other:Pour {n} licences, vous passez de {before} à {after} par mois.",
      priceYearly:
        "one:Pour {n} licence, vous passez de {before} à {after} par mois, en facturation annuelle.|other:Pour {n} licences, vous passez de {before} à {after} par mois, en facturation annuelle.",
      benefits:
        "{plan} enregistre dans toutes les qualités, jusqu’à 60 fps, et ajoute le montage par IA.",
      timing:
        "Le changement prend effet immédiatement. La différence pour le reste de cette période de facturation est ajoutée à votre prochaine facture.",
      errors: {
        failed: "Impossible de changer de forfait",
        unknownPlan: "Forfait inconnu",
        billingUnavailable: "La facturation est indisponible",
        noSubscription: "Cet espace de travail n’a pas d’abonnement actif",
        cancelled: "Réactivez l’abonnement avant de changer de forfait",
        unavailable:
          "Les changements de forfait ne sont pas disponibles pour le moment",
        rejected:
          "Le service de facturation a refusé le changement. Réessayez.",
      },
    },
    upgrade: {
      title: "Mettre à niveau {name}",
      billingCycle: "Fréquence de facturation",
      cycles: {
        monthly: "Mensuelle",
        annual: "Annuelle",
      },
      annualSaving: "économisez {percent} %",
      seatPicker: {
        title: "Qui reçoit une licence payante",
        selected: "{seats} sur {total}",
        description:
          "Les personnes cochées enregistrent et sont facturées. Toutes les autres sont des lecteurs gratuits, qui peuvent regarder, commenter et réagir, mais pas enregistrer. Les rôles changent lors de la mise à niveau.",
        selectAll: "Tout sélectionner",
        clear: "Tout désélectionner",
        you: "(vous)",
        paidSeat: "Licence payante",
        viewer: "Lecteur",
      },
      perMonth: "par mois",
      seatsPrice: "one:{n} licence × {price}|other:{n} licences × {price}",
      viewersFree: "one:{n} lecteur gratuit|other:{n} lecteurs gratuits",
      priceWithViewers: "{seats}, {viewers}",
      priceYearly: "{seats}, en facturation annuelle",
      priceWithViewersYearly: "{seats}, {viewers}, en facturation annuelle",
      upgradeTo: "Passer au forfait {plan}",
      checkoutUnavailable: "Paiement non configuré",
    },
    requestSeat: {
      request: "Demander à enregistrer",
      requested: "Licence demandée",
      hint: "Vous êtes lecteur ici. Demandez une licence payante au propriétaire pour pouvoir enregistrer.",
      requestedHint:
        "La demande a été envoyée au propriétaire. Vous pourrez enregistrer dès qu’elle sera approuvée.",
      failed: "Impossible d’envoyer la demande",
    },
  },
  actions: {
    missingSlug: "Slug manquant",
    recordingNotFound: "Enregistrement introuvable",
    invalidVisibility: "Visibilité non valide",
    deleteVideoFailed: "Impossible de supprimer le fichier vidéo : {reason}",
    transcriptNotFound: "Transcription introuvable",
    transcriptEmpty:
      "La transcription ne peut pas rester vide. Réinitialisez-la plutôt.",
    missingTokenId: "ID de jeton manquant",
    tokenNotFound: "Jeton introuvable",
    missingScreenshotId: "ID de capture d’écran manquant",
    screenshotNotFound: "Capture d’écran introuvable",
    missingImageBytes: "Données de l’image manquantes",
    screenshotTooLarge:
      "La capture d’écran modifiée dépasse la taille maximale par capture d’écran.",
    saveScreenshotFailed:
      "Impossible de sauvegarder la capture d’écran : {reason}",
    saveFailed: "Échec de la sauvegarde : {reason}",
    invalidCanvasDimensions:
      "Échec de la sauvegarde : dimensions du canevas non valides",
  },
  viewer: {
    meta: {
      defaultTitle: "Enregistrement {product}",
      defaultDescription: "Un enregistrement d’écran partagé depuis {product}.",
      preparingTitle: "Préparation de l’enregistrement… — {product}",
      notFoundTitle: "Introuvable",
      description:
        "Un enregistrement d’écran partagé depuis {product}. Regardez-le dans votre navigateur, sans inscription.",
      descriptionTimed:
        "Un enregistrement d’écran de {duration} partagé depuis {product}. Regardez-le dans votre navigateur, sans inscription.",
    },
    loading: "Chargement de l’enregistrement…",
    nav: {
      download: "Télécharger",
    },
    authPrompt: {
      pricing: "Tarifs",
      logIn: "Se connecter",
      getStarted: "Commencer",
      getFree: "Essayer {product} gratuitement",
    },
    postedBy: {
      label: "Publié par",
      someone: "Quelqu’un",
    },
    views: {
      count: "one:{count} vue|other:{count} vues",
      showWhoWatched: "{views}, afficher qui a regardé",
      viewers: "Spectateurs",
      emptyTitle: "Aucune vue pour le moment",
      emptyDescription:
        "Partagez le lien et les personnes qui regardent apparaîtront ici.",
      signedInViewer: "Spectateur connecté",
      anonymous: "Anonyme",
    },
    actions: {
      share: "Partager",
      visibilityFailed: "Impossible de modifier la visibilité",
      deleteFailed: "Impossible de supprimer l’enregistrement",
    },
    requestAccess: {
      title: "Demandez l’accès pour regarder cette vidéo",
      notSharedBy:
        "{name} n’a pas encore partagé cet enregistrement avec vous.",
      notSharedByOwner:
        "Le propriétaire n’a pas encore partagé cet enregistrement avec vous.",
      signInHint:
        "Connectez-vous avec votre adresse e-mail professionnelle : si vous faites déjà partie de l’équipe du propriétaire, vous aurez accès directement.",
      signIn: "Se connecter pour continuer",
      sentTitle: "Demande envoyée",
      sentDescription:
        "Nous avons prévenu le propriétaire. Vous recevrez un e-mail s’il vous donne accès.",
      askingAs: "Demande en tant que {email}",
      noteLabel: "Ajouter une note {optional}",
      noteOptional: "(facultatif)",
      notePlaceholder:
        "Bonjour, j’aimerais regarder cet enregistrement de la revue d’hier.",
      sending: "Envoi…",
      submit: "Demander l’accès",
      failed: "Une erreur s’est produite. Réessayez dans un instant.",
    },
    pending: {
      preparingTitle: "Préparation de votre enregistrement…",
      preparingDescription:
        "L’envoi est en train de se terminer. Cette page s’actualise toute seule dès qu’il est prêt.",
      failedTitle: "L’envoi de cet enregistrement n’a pas abouti",
      failedDescription:
        "Le lien a été créé, mais la vidéo n’est jamais arrivée. Réessayez le lien dans une minute ou faites un nouvel enregistrement.",
      comment: "Commenter",
      activityTab: "Activité",
      transcriptTab: "Transcription",
      emptyTitle: "Aucune activité pour le moment",
      emptyDescription:
        "Les réactions et les commentaires des spectateurs apparaîtront ici une fois l’enregistrement prêt.",
    },
    upgradeBanner: {
      message:
        "{usage} avec le forfait Gratuit. Mettez à niveau pour des enregistrements illimités en pleine qualité.",
      usage: "other:{used} enregistrements utilisés sur {n}",
    },
    editPanel: {
      makeEdits: "Apporter des modifications",
      status: {
        idle: "Sauvegarde automatique",
        saved: "Sauvegardé",
        error: "Échec de la sauvegarde",
      },
      trimTitle: "Raccourcir et couper",
      trimDescription:
        "Scindez la timeline, coupez des passages et corrigez la transcription.",
      background: "Arrière-plan",
      camera: "Caméra",
      audio: "Audio",
      takeAction: "Actions",
      downloadTitle: "Télécharger la vidéo",
      downloadDescription: "L’enregistrement complet au format MP4.",
      copyEmbed: "Copier le code d’intégration",
      embedCopied: "Code d’intégration copié",
      embedDescription: "Collez le lecteur dans n’importe quelle page web.",
    },
    notFound: {
      title: "Enregistrement introuvable",
      description:
        "Ce lien a expiré ou n’a jamais existé. Les enregistrements des comptes gratuits sont conservés 30 jours après leur dernière consultation.",
      madeWith: "Créé avec {product}",
    },
  },
  activity: {
    sidebar: {
      label: "Barre latérale de l’enregistrement",
      activityTab: "Activité",
      transcriptTab: "Transcription",
    },
    you: "Vous",
    anonymous: "Anonyme",
    jumpToMoment: "Aller à ce moment",
    empty: {
      title: "Aucune activité pour le moment",
      description:
        "Les réactions et les commentaires des spectateurs apparaîtront ici au fur et à mesure.",
      firstTitle: "Laissez le premier commentaire",
      firstTitleNamed: "Laissez le premier commentaire, {name}",
      hint: "Appuyez sur {key} pour répondre ou laissez un commentaire en bas de ce panneau.",
      focusComposer: "Aller à la zone de commentaire",
    },
    composer: {
      signIn: "Se connecter pour réagir et commenter",
      placeholder: "Laisser un commentaire…",
      mention: "Mentionner quelqu’un",
      noOneToMention: "Personne n’a encore réagi ni commenté",
      insertEmoji: "Insérer un emoji",
      searchEmoji: "Rechercher un emoji",
      posting: "Publication…",
      submitAt: "Commenter à {time}",
      postFailed: "Impossible de publier le commentaire",
    },
    comment: {
      delete: "Supprimer le commentaire",
      deleteFailed: "Impossible de supprimer le commentaire",
    },
    reaction: {
      count: "one:{n} réaction|other:{n} réactions",
      delete: "Supprimer la réaction",
      deleteMany: "one:Supprimer {n} réaction|other:Supprimer {n} réactions",
      deleteFailed: "Impossible de supprimer la réaction",
    },
    transcript: {
      pendingTitle: "Transcription en cours…",
      pendingDescription:
        "La transcription apparaît ici dès qu’elle est prête.",
      failedTitle: "La transcription n’a pas abouti",
      failedDescription:
        "Une erreur s’est produite pendant la transcription de cet enregistrement.",
      noneTitle: "Aucune transcription",
      noneOwnerDescription:
        "Enregistrez avec le microphone activé et une transcription est rédigée pour vous.",
      noneViewerDescription:
        "Cet enregistrement a été réalisé sans microphone.",
      searchLabel: "Rechercher dans la transcription",
      noMatches: "Aucun résultat.",
    },
    saveFailed: "Impossible de sauvegarder. Réessayez.",
    summary: {
      title: "Résumé",
      add: "Ajouter",
      placeholder: "Que se passe-t-il dans cet enregistrement ?",
      empty: "Aucun résumé pour le moment.",
      emptyAction: "Ajouter un résumé",
    },
    chapters: {
      title: "Chapitres",
      count: "one:{n} chapitre|other:{n} chapitres",
      addAtPlayhead: "Ajouter à la tête de lecture",
      defaultTitle: "Chapitre {n}",
      editHint: "Un chapitre par ligne, au format {short} ou {long}.",
      editHintShort: "M:SS Titre",
      editHintLong: "H:MM:SS Titre",
      editPlaceholder: "0:00 Intro\n0:30 Démo\n1:20 Conclusion",
      playing: "En lecture",
      remove: "Retirer le chapitre",
      empty: "Aucun chapitre pour le moment.",
      emptyAction: "En ajouter un à la tête de lecture",
    },
  },
  player: {
    overlay: {
      watchAgain: "Revoir",
    },
    captions: {
      track: "Sous-titres",
      size: "Taille",
      position: "Position",
      sizes: {
        small: "Petite",
        medium: "Moyenne",
        large: "Grande",
      },
      positions: {
        top: "Haut",
        bottom: "Bas",
      },
    },
    reactionBar: {
      comment: "Commenter",
      leaveComment: "Laisser un commentaire",
    },
    reactions: {
      heart: "Cœur",
      thumbsUp: "Pouce levé",
      fire: "Feu",
      clap: "Applaudissements",
      raisedHands: "Mains levées",
      eyes: "Yeux",
    },
    embed: {
      title: "Enregistrement {product}",
    },
    controls: {
      buttons: {
        play: "Lecture",
        pause: "Pause",
        replay: "Revoir",
        mute: "Couper le son",
        unmute: "Activer le son",
      },
      seek: {
        forward: "Avancer de {seconds} secondes",
        backward: "Reculer de {seconds} secondes",
      },
      fullscreen: {
        enter: "Passer en plein écran",
        exit: "Quitter le plein écran",
      },
      captions: {
        enable: "Activer les sous-titres",
        disable: "Désactiver les sous-titres",
      },
      pip: {
        enter: "Activer l’image dans l’image",
        exit: "Quitter l’image dans l’image",
      },
      cast: {
        start: "Démarrer la diffusion",
        stop: "Arrêter la diffusion",
        connecting: "Connexion en cours",
      },
      airplay: {
        start: "Démarrer AirPlay",
        stop: "Arrêter AirPlay",
      },
      slider: {
        seek: "Position de lecture",
      },
      time: {
        current: "Temps actuel",
        duration: "Durée",
        position: "{current} sur {duration}",
        unknown: "Média non chargé, temps inconnu.",
      },
      playback: {
        rate: "Vitesse de lecture {rate}",
      },
      volume: {
        mutedValue: "{percent}, son coupé",
        muted: "Son coupé",
        label: "Volume",
        value: "Volume {value}",
      },
      status: {
        captionsOn: "Sous-titres activés",
        captionsOff: "Sous-titres désactivés",
        paused: "En pause",
        playing: "En lecture",
        fullscreen: "Plein écran",
        pip: "Image dans l’image",
        exitPip: "Quitter l’image dans l’image",
        seekedTo: "Déplacé à {time}",
      },
      container: {
        label: "Lecteur multimédia",
      },
      errors: {
        aborted: "Vous avez arrêté la lecture du média avant la fin.",
        network:
          "Ce média n’a pas pu être chargé en raison d’un problème de réseau ou de serveur.",
        decode:
          "Ce média n’a pas pu être lu. Il est peut-être corrompu, ou votre navigateur ne prend peut-être pas en charge son format.",
        source:
          "Ce média n’a pas pu être chargé. Il est peut-être indisponible, ou votre navigateur ne prend peut-être pas en charge son format.",
        encrypted:
          "Ce média n’a pas pu être lu, car il n’a pas pu être déchiffré.",
        unplayable: "Ce média n’est pas pris en charge par le lecteur.",
        title: "Une erreur s’est produite.",
        unexpected: "Une erreur inattendue s’est produite.",
      },
      common: {
        ok: "OK",
      },
      menu: {
        settings: "Paramètres",
        quality: "Qualité",
        audio: "Audio",
        speed: "Vitesse",
        captions: "Sous-titres",
        playbackRate: "Vitesse de lecture",
        off: "Désactivé",
        auto: "Auto",
        autoWithLabel: "Auto ({label})",
      },
    },
  },
  screenshotView: {
    page: {
      defaultTitle: "Capture d’écran {product}",
      description: "Une capture d’écran partagée depuis {product}.",
      madeWith: "Créé avec {product}",
      loading: "Chargement de la capture d’écran…",
    },
    authPrompt: {
      pricing: "Tarifs",
      logIn: "Se connecter",
      getStarted: "Commencer",
      getFree: "Essayer {product} gratuitement",
    },
    actions: {
      edit: "Modifier la capture d’écran",
      share: "Partager",
      shareTitle: "Partager la capture d’écran",
      copyLink: "Copier le lien",
      linkCopied: "Lien copié",
      more: "Plus d’actions",
      delete: "Supprimer la capture d’écran",
      deleteTitle: "Supprimer cette capture d’écran ?",
      deleteDescription:
        "L’image et son lien cessent de fonctionner immédiatement. Cette action est irréversible.",
      visibilityFailed: "Impossible de modifier la visibilité",
      deleteFailed: "Impossible de supprimer la capture d’écran",
    },
    zoom: {
      expand: "Agrandir l’image",
      minimize: "Réduire l’image",
    },
    requestAccess: {
      title: "Demandez l’accès pour voir cette capture d’écran",
      notSharedBy:
        "{name} n’a pas encore partagé cette capture d’écran avec vous.",
      notSharedByOwner:
        "Le propriétaire n’a pas encore partagé cette capture d’écran avec vous.",
      signInHint:
        "Connectez-vous avec votre adresse e-mail professionnelle : si vous faites déjà partie de l’équipe du propriétaire, vous aurez accès directement.",
      signIn: "Se connecter pour continuer",
      sentTitle: "Demande envoyée",
      sentDescription:
        "Nous avons prévenu le propriétaire. Vous recevrez un e-mail s’il vous donne accès.",
      askingAs: "Demande en tant que {email}",
      noteLabel: "Ajouter une note {optional}",
      noteOptional: "(facultatif)",
      notePlaceholder:
        "Bonjour, j’aimerais une copie de cette capture d’écran de la revue de design.",
      sending: "Envoi…",
      submit: "Demander l’accès",
      failed: "Une erreur s’est produite. Réessayez dans un instant.",
    },
    notFound: {
      title: "Capture d’écran introuvable",
      description:
        "Ce lien a expiré ou n’a jamais existé. Les captures d’écran des comptes gratuits sont conservées 30 jours après leur dernière consultation.",
    },
  },
  recordingEditor: {
    skeleton: {
      label: "Ouverture de l’éditeur",
      status: "Ouverture de l’éditeur…",
    },
    preparing: {
      title: "Préparation de l’enregistrement…",
      description:
        "L’enregistrement est encore en cours d’envoi. Cette page s’actualisera automatiquement dès qu’il sera prêt.",
    },
    failed: {
      title: "L’envoi de l’enregistrement a échoué.",
      description: "Réessayez d’enregistrer depuis l’application de bureau.",
    },
    saveFailed: "Impossible de sauvegarder",
    topBar: {
      back: "Retour à l’enregistrement",
      status: {
        idle: "Les modifications sont sauvegardées automatiquement",
        saved: "Sauvegardé",
        error: "Échec de la sauvegarde",
      },
      versionHistory: "Historique des versions (bientôt disponible)",
      undo: "Annuler",
      undoShortcut: "Annuler ({key})",
      redo: "Rétablir",
      redoShortcut: "Rétablir ({key})",
      finish: "Terminer",
    },
    panels: {
      label: "Panneaux de l’éditeur",
      tabs: {
        transcript: "Transcription",
        design: "Design",
        details: "Détails",
      },
      hide: {
        transcript: "Masquer la transcription",
        design: "Masquer le design",
        details: "Masquer les détails",
      },
      show: {
        transcript: "Afficher la transcription",
        design: "Afficher le design",
        details: "Afficher les détails",
      },
    },
    toggleOn: "Activé",
    background: {
      title: "Arrière-plan",
      gradients: "Dégradés",
      none: "Aucun",
      noBackground: "Aucun arrière-plan",
      solid: "Uni",
      solidColor: "Couleur unie {color}",
      customColor: "Choisir une couleur personnalisée",
      showLess: "Afficher moins",
      seeMore: "Afficher plus",
      presets: {
        violet: "Violet",
        sunset: "Couchant",
        orchid: "Orchidée",
        forest: "Forêt",
        flamingo: "Flamant",
        citrus: "Agrumes",
        arctic: "Arctique",
        ocean: "Océan",
        deep: "Profond",
        ember: "Braise",
        mint: "Menthe",
        dusk: "Crépuscule",
        peach: "Pêche",
        midnight: "Minuit",
        slate: "Ardoise",
      },
    },
    camera: {
      title: "Caméra",
      show: "Afficher la caméra",
      hidden: "Masquée",
      position: "Position",
      positionHint: "Faites glisser le point ou touchez un coin",
      positionHintHidden: "Affichez la caméra pour la placer.",
      corners: {
        topLeft: "En haut à gauche",
        topRight: "En haut à droite",
        bottomLeft: "En bas à gauche",
        bottomRight: "En bas à droite",
      },
      size: "Taille",
      sizes: {
        small: "Petite",
        medium: "Moyenne",
        large: "Grande",
      },
    },
    audio: {
      title: "Audio",
      systemSound: "Son du système",
      sound: "Son",
      microphone: "Microphone",
      muted: "Coupé",
      sharedTrack:
        "Le microphone et le son du système partagent une seule piste dans cet enregistrement.",
    },
    details: {
      title: "Enregistrement",
      link: "Lien",
      size: "Taille",
      duration: "Durée",
      views: "Vues",
      created: "Création",
    },
    transcript: {
      transcribing: "Transcription en cours…",
      unavailable: "Aucune transcription disponible",
      pendingHint: "Rechargez cette page dans une minute pour la modifier.",
      failedHint: "La transcription de cet enregistrement n’a pas abouti.",
      missingHint:
        "Enregistrez avec le microphone activé et une transcription est rédigée pour vous.",
      deleteWord: "Supprimer le mot",
      deleteWords: "one:Supprimer {n} mot|other:Supprimer {n} mots",
      clearSelection: "Tout désélectionner",
      hint: "Cliquez sur un mot ou faites glisser sur plusieurs mots pour les sélectionner, double-cliquez pour corriger le texte.",
      resetEdits: "Réinitialiser les modifications",
      editLine: "Modifier la ligne de transcription",
      selectLine: "Sélectionner la ligne à {time}",
      restore: "Restaurer",
      saveFailed: "Impossible de sauvegarder",
      resetFailed: "Impossible de réinitialiser",
    },
    timeline: {
      hideWaveform: "Masquer la forme d’onde",
      showWaveform: "Afficher la forme d’onde",
      loadingAudio: "Chargement de l’audio…",
      deleteSelection: "Supprimer la sélection",
      deleteSelectionHint:
        "Sélectionnez des mots dans la transcription, ou scindez la timeline et choisissez un segment",
      splitAt: "Scinder à {time}",
      splitHint: "Lancez la lecture ou placez-vous d’abord sur un moment",
      comingSoon: "Bientôt disponible",
      fit: "Ajuster",
      zoomOut: "Zoom arrière",
      zoom: "Zoom de la timeline",
      zoomIn: "Zoom avant",
      seek: "Position de lecture",
      trimStart: "Raccourcir le début du clip",
      trimEnd: "Raccourcir la fin du clip",
      removeSplit: "Retirer la scission à {time}",
    },
  },
  screenshotEditor: {
    loading: "Chargement de l’éditeur…",
    imageError: {
      decode: "Impossible de décoder l’image de la capture d’écran.",
      fetch:
        "Impossible de charger l’image de la capture d’écran. Le bucket a peut-être perdu l’accès CORS.",
    },
    header: {
      back: "Retour à la capture d’écran",
      reset: "Réinitialiser les modifications",
      undo: "Annuler",
      undoTooltip: "Annuler ({key})",
      redo: "Rétablir",
      redoTooltip: "Rétablir ({key})",
      finish: "Terminer",
    },
    saveError: {
      notMounted: "Éditeur non monté",
      noCanvas: "Impossible d’obtenir le canevas d’export",
      workerCrashed: "Le worker d’encodage PNG a planté",
    },
    tools: {
      text: "Texte",
      rect: "Rectangle",
      arrow: "Flèche",
      background: "Arrière-plan",
    },
    background: {
      title: "Ajouter un arrière-plan",
      close: "Fermer le sélecteur d’arrière-plan",
      none: "Aucun",
      gradients: {
        violet: "Violet",
        sunset: "Couchant",
        orchid: "Orchidée",
        forest: "Forêt",
        flamingo: "Flamant",
        citrus: "Agrumes",
        arctic: "Arctique",
        ocean: "Océan",
        deep: "Profond",
      },
      solid: "Couleur unie {color}",
      custom: "Choisir une couleur personnalisée",
    },
    inspector: {
      color: "Couleur {color}",
      size: "{n}px",
      duplicate: "Dupliquer",
    },
    textPrompt: "Texte",
  },
  canvas: {
    meta: {
      title: "Canevas",
      description:
        "Un tableau vierge pour dessiner pendant que vous enregistrez.",
    },
    loading: "Chargement du canevas…",
    tools: {
      select: "Sélection",
      hand: "Main",
      pen: "Stylo",
      highlighter: "Surligneur",
      rect: "Rectangle",
      ellipse: "Ellipse",
      arrow: "Flèche",
      line: "Ligne",
      text: "Texte",
      eraser: "Gomme",
    },
    shortcut: "{label} · {key}",
    colour: "Couleur {colour}",
    stroke: "Trait {width}",
    hint: "Défilez pour vous déplacer · défilez avec {mod} pour zoomer · maintenez {space} pour faire glisser",
    textPlaceholder: "Écrivez…",
    history: {
      undo: "Annuler",
      redo: "Rétablir",
      clear: "Effacer le tableau",
    },
    zoom: {
      out: "Zoom arrière",
      reset: "Réinitialiser le zoom",
      in: "Zoom avant",
    },
    extensionPrompt: {
      title: "Enregistrer ce canevas",
      description:
        "Ajoutez l’extension CaptureFlow pour enregistrer votre écran et votre caméra pendant que vous dessinez, puis partagez un lien.",
      dismiss: "Pas maintenant",
      install: "Ajouter à Chrome",
    },
  },
};

export default messages;

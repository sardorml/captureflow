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
      title: "CaptureFlow - Enregistreur d’écran avec liens de partage",
      description:
        "Enregistrez votre écran et partagez un lien avec votre équipe ou vos clients. Enregistreur d’écran open source, transcriptions IA, captures d’écran annotées, auto-hébergeable sur Cloudflare.",
    },
    features: {
      title: "Fonctionnalités de l’enregistreur d’écran",
      description:
        "Enregistrez un onglet, une fenêtre ou tout l’écran avec caméra et micro, annotez des captures d’écran et partagez chaque capture par un lien que votre équipe peut commenter.",
    },
    pricing: {
      title: "Tarifs : gratuit pour commencer, un prix par membre",
      description: `Commencez gratuitement avec ${FREE_RECORDINGS} enregistrements. ${LIGHT} et ${PRO} : un prix par membre, enregistrements et IA illimités. Ou auto-hébergez CaptureFlow gratuitement.`,
    },
    faq: {
      title: "FAQ : partage, stockage et auto-hébergement",
      description:
        "Questions fréquentes sur CaptureFlow : liens de partage, auto-hébergement sur Cloudflare, limites de stockage et confidentialité des enregistrements.",
    },
    download: {
      title: "Télécharger l’enregistreur d’écran pour Chrome",
      description:
        "Installez l’extension Chrome CaptureFlow pour enregistrer votre écran et le partager avec un lien.",
    },
    enterprise: {
      title: "Entreprise",
      description:
        "CaptureFlow géré pour les grandes entreprises : des licences pour tous, des conditions sur mesure et une facture unique. Dites-nous ce qu’il vous faut.",
    },
    selfHostSetup: {
      title: "Mise en place de l’auto-hébergement",
      description:
        "Faites installer CaptureFlow sur le compte Cloudflare de votre entreprise : votre domaine, connexion réservée à l’entreprise et extension Chrome privée pour votre équipe.",
    },
  },
  nav: {
    features: "Fonctionnalités",
    discover: "Découvrir",
    pricing: "Tarifs",
    faq: "FAQ",
    changelog: "Nouveautés",
    login: "Connexion",
    download: "Télécharger",
    language: "Langue",
    openMenu: "Ouvrir le menu",
    menu: "Menu",
    main: "Navigation principale",
    docs: "Documentation",
    resources: "Ressources",
    faqDescription: "Les réponses aux questions courantes",
    blog: "Blog",
    blogDescription: "Guides et actualités",
    selfHosting: "Auto-hébergement",
    selfHostingDescription: "Hébergez-le sur votre propre Cloudflare",
    community: "Communauté",
    communityDescription: "Obtenez de l’aide et discutez sur Discord",
    star: "Mettre une étoile sur GitHub",
    starCount: "Mettre une étoile sur GitHub ({stars})",
    themeToLight: "Passer au thème clair",
    themeToDark: "Passer au thème sombre",
  },
  banner: {
    label: "Bêta",
    aria: "CaptureFlow est en bêta publique",
    title: "Vous êtes parmi les premiers 🎉",
    strip:
      "CaptureFlow est encore en bêta : il change souvent et vous pourriez rencontrer quelques imperfections le temps qu’il se stabilise.",
    body: "CaptureFlow est en bêta publique. Une nouveauté arrive presque chaque semaine, et ce que les utilisateurs demandent est développé en premier.",
    cta: "Dites-moi quoi développer ensuite",
    close: "Fermer",
  },
  announcement: {
    badge: "Nouveau",
    lead: "Votre agent IA peut désormais enregistrer pour vous.",
    rest: "Connectez-le une fois, demandez une vidéo et recevez un lien.",
    cta: "Connecter",
  },
  hero: {
    title: "Enregistreur d’écran pour\nvous et vos agents IA",
    subtitle:
      "Enregistrez vous-même vos démos, tutoriels, pas-à-pas et présentations, ou laissez votre IA les enregistrer pour vous. Partagez chaque vidéo par un lien que tout le monde peut regarder.",
    ctaLabel: "Essayer CaptureFlow gratuitement",
    installChrome: "Installer l’extension Chrome",
    installMac: "Télécharger pour macOS",
    installSoon: "Bientôt",
    connectMcp: "Connecter au MCP",
    macSoon: "Application macOS bientôt disponible",
    installOr: "ou",
    mcpCopy: "Copier",
    mcpCopied: "Copié",
    mcpAddToCursor: "Ajouter à Cursor",
    badge: "Open source et gratuit à héberger, sur {github}",
    noCreditCard: "Sans carte bancaire",
    teaser: {
      title: "Auto-hébergeable",
      body: "Hébergez-le sur votre propre compte Cloudflare.",
      cta: "Essayer CaptureFlow",
    },
    demo: {
      prevAria: "Démo précédente",
      nextAria: "Démo suivante",
      dotAria: "Afficher la démo {n} sur {total}",
    },
  },
  highlights: {
    heading: "Toutes les fonctionnalités",
    subtitle: "Enregistrez, modifiez et partagez. Tout est au même endroit.",
    items: {
      recording: {
        title: "Écran et caméra",
        body: "Enregistrez les deux à la fois",
      },
      transcripts: {
        title: "Transcriptions",
        body: "En 99 langues",
        tag: "IA",
      },
      editing: {
        title: "Montage par transcription",
        body: "Supprimez du texte pour couper la vidéo",
        tag: "IA",
      },
      camera: {
        title: "Effets caméra",
        body: "Arrière-plans et filtres",
      },
      canvas: {
        title: "Canevas infini",
        body: "Dessinez pendant l’enregistrement",
      },
      screenshots: {
        title: "Captures d’écran annotées",
        body: "Flèches, texte et floutage",
      },
      feedback: {
        title: "Commentaires et réactions",
        body: "Des retours sur la vidéo",
      },
      summary: {
        title: "Résumés et chapitres",
        body: "Avec un titre pour chaque vidéo",
        tag: "IA",
      },
      filler: {
        title: "Mots parasites supprimés",
        body: "Coupe les « euh » et les « hum »",
        tag: "IA",
      },
    },
    cta: "Voir toutes les fonctionnalités",
    previews: {
      app: "Plan de lancement",
      columns: ["À faire", "En cours", "Terminé"],
      lines: [
        "Voici le nouveau parcours.",
        "D’abord, choisissez un espace.",
        "Puis partagez le lien.",
      ],
      retake: "Euh, je recommence.",
      filler: [
        "[Euh,] voici le nouveau parcours.",
        "D’abord, [hum,] choisissez un espace.",
        "Puis, [euh,] partagez le lien.",
      ],
      step: "Étape 1",
      note: "Déplacer ceci",
      comment: "J’adore ce parcours",
      summaryTitle: "Comment inviter votre équipe",
      summaryBody: "Choisissez un espace de travail, puis partagez le lien.",
      chapters: ["Intro", "Choisir un espace"],
    },
  },
  mcpFeatures: {
    heading: "Fonctionnalités MCP",
    subtitle:
      "Ce que votre agent IA peut faire une fois connecté. Il enregistre sur votre propre ordinateur, avec Claude Code, Codex, Cursor ou n’importe quel client MCP.",
    cta: "Lire le guide",
    items: {
      webApp: {
        title: "Enregistrer une appli web",
        body: "Y compris sur localhost",
      },
      screen: { title: "Enregistrer votre écran", body: "Un écran entier" },
      window: {
        title: "Enregistrer une fenêtre",
        body: "Terminal, VS Code ou Figma",
      },
      slides: {
        title: "Ajouter des diapositives",
        body: "Titres, étapes et phrases de conclusion",
      },
      voiceover: {
        title: "Ajouter une voix off",
        body: "Générée sur votre ordinateur",
      },
      report: {
        title: "Rédiger un rapport",
        body: "Ce qu’il a fait et ce qui a échoué",
      },
      search: {
        title: "Rechercher des enregistrements",
        body: "Vidéos et transcriptions",
      },
      save: {
        title: "Sauvegarder des fichiers MP4",
        body: "Sans envoi ni connexion",
      },
    },
  },
  useCases: {
    heading: "Comment les équipes l’utilisent",
    subtitle:
      "Des exemples de ce que les équipes enregistrent. Chaque vidéo est un lien qui se lit dans n’importe quel navigateur.",
    cta: "Voir comment ça fonctionne",
    cards: {
      engineering: {
        title: "Ingénierie",
        body: "Enregistrez la présentation d’une PR ou la reproduction d’un bug.",
      },
      design: {
        title: "Design",
        body: "Enregistrez la présentation d’une maquette et recueillez les commentaires.",
      },
      support: {
        title: "Support client",
        body: "Répondez à un ticket par une courte démonstration.",
      },
      updates: {
        title: "Points d’équipe",
        body: "Enregistrez le point hebdomadaire et partagez le lien.",
      },
    },
    engineeringFile: "checkout.ts",
    engineeringPr: "PR #482",
    designApp: "trip-app",
    designBadge: "Paiement v3",
    designCardTitle: "Planifiez votre voyage",
    designColors: "Couleurs",
    designComment: "CTA plus grand ?",
    supportQuestion: "Comment inviter mon équipe dans l’espace de travail ?",
    supportReply: "Voici une courte démonstration :",
    supportLink: "captureflow.dev/r/8kx2pnq4",
    updatesTitle: "Point hebdomadaire",
    updatesRange: "6–10 oct.",
    updatesSignups: "Inscriptions",
    updatesShipped: "Livrées",
    updatesFeatures: "fonctionnalités",
  },
  agents: {
    heading:
      "Ou demandez à votre agent IA d’enregistrer vos démos et tutoriels",
    worksWith: "Fonctionne avec {claude}, {openai} et {cursor}.",
    cta: "Lire le guide",
    subtitle:
      "Demandez avec vos propres mots. Il enregistre un navigateur, votre écran ou une application sur votre propre ordinateur, ajoute des diapositives et une voix off si vous le souhaitez, et vous remet un lien.",
    steps: [
      {
        title: "Connectez votre agent",
        body: "Ajoutez CaptureFlow à Claude Code, Codex ou Cursor en une ligne. Il vous faut Node.js 20 ou une version plus récente, et votre agent se connecte une seule fois. Dans Claude ou ChatGPT, ajoutez-le par URL.",
      },
      {
        title: "Demandez une vidéo",
        body: "Une démo de fonctionnalité, un tutoriel, un rapport de bug ou une présentation commentée.",
      },
      {
        title: "Il enregistre pour vous",
        body: "Sur votre ordinateur, même une application sur localhost.",
      },
      {
        title: "Il ajoute des diapositives et une voix",
        body: "Des diapositives de titre et une voix off, si vous le souhaitez.",
      },
      {
        title: "Il vous donne un lien à partager",
        body: "Joignez-le à une pull request, publiez-le dans Slack ou envoyez-le à un client.",
      },
    ],
    scenes: {
      ask: {
        name: "terminal",
        badge: "agent",
        prompt: "Enregistre une démo du paiement",
        steps: [
          "Ouverture de l’application",
          "Parcours des écrans",
          "Votre lien est prêt",
        ],
      },
      record: {
        url: "localhost:3000",
        badge: "démo",
        title: "Paiement",
        fields: ["Votre nom", "Numéro de carte"],
        pay: "Payer",
        paid: "Payé",
      },
      voice: {
        title: "Démo du paiement",
        subtitle: "Comment payer en trois étapes",
      },
      share: {
        title: "Démo du paiement",
        link: "captureflow.dev/r/checkout",
        places: ["PR", "Slack", "E-mail"],
      },
    },
    chats: {
      claude:
        "Dans Claude, ouvrez « Customize », puis « Connectors », et choisissez « Add custom connector ». Nommez-le CaptureFlow, collez cette URL, puis connectez-vous.",
      chatgpt:
        "Dans ChatGPT sur le web, ouvrez « Plugins », appuyez sur +, puis choisissez « Add custom MCP server ». Nommez-le CaptureFlow, collez cette URL, choisissez OAuth, puis installez le plugin et connectez-vous. Nécessite un forfait Business, Enterprise ou Edu.",
      limits:
        "Les applications de chat enregistrent des sites web dans un navigateur cloud, et non votre ordinateur, et utilisent les minutes d’agent cloud de votre forfait.",
    },
  },
  modes: {
    cta: "Commencer à enregistrer",
    heading: "Enregistrez votre écran avec l’extension Chrome",
    subtitle:
      "Installez-la et lancez l’enregistrement. Quand vous avez terminé, vous obtenez un lien que tout le monde peut regarder, avec un titre, un résumé, des chapitres et une transcription.",
    scene: {
      timer: "0:42",
      heading: "Comment fonctionne un remboursement",
      steps: ["Demande", "Validation", "Versement"],
      captions: [
        "Voici rapidement comment fonctionne un remboursement.",
        "D’abord, le client envoie une demande.",
        "Le support la valide le jour même.",
        "Puis l’argent est versé automatiquement.",
      ],
    },
  },
  pageHeroes: {
    home: "Accueil",
    features: {
      label: "Fonctionnalités",
      word: "FONCTIONNALITÉS",
      title: "Enregistrez, modifiez et partagez votre écran",
      subtitle:
        "Enregistrez votre écran et votre caméra. Partagez chaque enregistrement par un lien que votre équipe peut commenter.",
    },
    pricing: {
      label: "Tarifs",
      word: "TARIFS",
      title: "Commencez gratuitement. Payez un prix par membre.",
      subtitle:
        "Le forfait Gratuit couvre vos 25 premiers enregistrements. Light et Pro suppriment la limite. Vous pouvez aussi auto-héberger CaptureFlow gratuitement.",
    },
    faq: {
      label: "FAQ",
      word: "FAQ",
      title: "Questions fréquentes",
      subtitle:
        "Des réponses sur l’enregistrement, les tarifs, le stockage et l’auto-hébergement. Consultez la documentation pour tout le reste.",
    },
  },
  collaboration: {
    heading: "Ce que vous pouvez faire après l’enregistrement",
    cta: "Essayer gratuitement",
    subtitle:
      "Modifiez la vidéo, puis partagez-la ou intégrez-la. Invitez votre équipe à regarder, réagir et commenter les vidéos des uns et des autres.",
    categories: {
      share: {
        feature: {
          tag: "nouveau",
          title: "Modifiez votre vidéo",
          cta: "Installer l’extension",
          body: "Supprimez des mots de la transcription pour les couper de la vidéo, ou raccourcissez des clips sur la timeline. Changez l’arrière-plan, déplacez, redimensionnez ou masquez votre caméra, et coupez le micro ou le son du système.",
        },
        scene: {
          app: "Plan de lancement",
          nav: ["Vue d’ensemble", "Feuille de route", "Tâches", "Docs"],
          columns: [
            {
              name: "À faire",
              tasks: ["Textes de la page tarifs", "E-mail d’accueil"],
            },
            {
              name: "En cours",
              tasks: ["Refonte du paiement", "Invitations d’équipe"],
            },
            { name: "Terminé", tasks: ["Formulaire d’inscription bêta"] },
          ],
          background: "Arrière-plan",
          camera: "Caméra",
          shapes: ["Cercle", "Carré"],
          fillers: "Mots parasites",
          remove: "Supprimer",
          transcript: {
            before: "Cliquez ici pour",
            fillers: ["euh,", "attendez,", "pardon,"],
            after: "partager le lien.",
          },
          saved: "Sauvegardé · même lien",
        },
      },
      embed: {
        feature: {
          title: "Partagez ou intégrez votre vidéo",
          cta: "Installer l’extension",
          body: "Collez le lien dans Slack, GitHub, Notion ou un e-mail et un aperçu s’affiche. Vous pouvez aussi intégrer le lecteur à votre documentation ou à votre site. Avec l’extension installée, la vidéo se lit directement dans les issues et les pull requests GitHub.",
        },
        scene: {
          question:
            "Pouvez-vous me montrer comment inviter mon équipe dans l’espace de travail ?",
          reply: "Bien sûr ! Voici une courte démonstration des étapes :",
          url: "captureflow.dev/r/8kx2pnq4",
          app: "Paramètres",
          nav: ["Général", "Membres", "Facturation"],
          members: "Membres",
          invite: "Inviter",
          people: [
            { initials: "AR", name: "Alex Rivera", role: "Propriétaire" },
            { initials: "CK", name: "Chris Kim", role: "Membre" },
            { initials: "JB", name: "Jordan Bell", role: "Membre" },
          ],
          duration: "0:48",
        },
      },
      feedback: {
        feature: {
          title: "Collaborez sur vos vidéos",
          cta: "Se connecter",
          body: "Travaillez ensemble sans réunion, quel que soit le fuseau horaire. Votre équipe peut réagir avec des émojis, commenter à n’importe quel moment de la vidéo et suivre grâce aux transcriptions et aux sous-titres.",
        },
        scene: {
          title: "Présentation du plan de lancement",
          author: "Alex",
          age: "à l’instant",
          duration: "1:12",
          activity: "Activité",
          events: [
            { initials: "CK", name: "Chris", at: "0:09", emoji: "👍" },
            { initials: "JB", name: "Jordan", at: "0:17", emoji: "🔥" },
            {
              initials: "MC",
              name: "Maya",
              at: "0:27",
              text: "J’adore la nouvelle vue tableau",
            },
            { initials: "SL", name: "Sam", at: "0:37", emoji: "❤️" },
            {
              initials: "JB",
              name: "Jordan",
              at: "0:48",
              text: "On peut livrer ça vendredi ?",
            },
            {
              initials: "AR",
              name: "Alex",
              at: "0:56",
              text: "Oui, juste après la QA ✅",
            },
            { initials: "MC", name: "Maya", at: "1:05", emoji: "👏" },
          ],
        },
      },
      workspaces: {
        feature: {
          title: "Invitez votre équipe dans un espace de travail",
          cta: "Créer un espace de travail",
          body: "Les enregistrements de chacun sont réunis dans un même espace de travail. Chaque vidéo peut être publique, visible par l’espace de travail ou privée.",
        },
        scene: {
          team: "Équipe CaptureFlow",
          members: ["1 membre", "2 membres", "3 membres"],
          memberInitials: ["AR", "CK", "JB"],
          invitePlaceholder: "Inviter par e-mail",
          inviteEmail: "chris@acme.co, jordan@acme.co",
          invite: "Inviter",
          invited: "Envoyé",
          joined: "Chris et Jordan ont rejoint l’équipe 🎉",
          whoCanWatch: "Qui peut regarder :",
          visibility: [
            { label: "Public", detail: "Toute personne ayant le lien" },
            { label: "Espace de travail", detail: "Votre équipe uniquement" },
            { label: "Privé", detail: "Vous uniquement" },
          ],
        },
      },
    },
  },
  setupService: {
    title: "Nous l’installons",
    titleHighlight: "pour vous",
    subtitle:
      "Parlez-nous de votre entreprise. Nous mettons en place l’application, l’extension Chrome, l’application macOS et toute l’infrastructure qui va avec, prêtes à être utilisées par votre équipe.",
    includedHeading: "Tout ce que nous mettons en place",
    included: {
      infra: {
        title: "L’application, sur votre infrastructure",
        body: "Déployée sur votre propre compte Cloudflare et servie depuis votre domaine. Tout vous appartient.",
      },
      storage: {
        title: "Stockage et base de données",
        body: "Les enregistrements dans votre propre bucket R2 ; les espaces de travail et les commentaires dans votre propre base de données.",
      },
      signin: {
        title: "Connexion réservée à l’entreprise",
        body: "Connexion avec Google Workspace ou GitHub, limitée au domaine e-mail de votre entreprise.",
      },
      apps: {
        title: "Extension Chrome et application Mac",
        body: "Toutes deux compilées pour votre instance, l’extension étant publiée en privé pour votre équipe.",
      },
      ready: {
        title: "Prêt à enregistrer",
        body: "Les espaces de travail sont créés et votre équipe est invitée, pour que chacun puisse commencer à partager tout de suite.",
      },
      handover: {
        title: "Passation",
        body: "Nous expliquons à la personne qui en assurera la maintenance comment le faire fonctionner et le mettre à jour.",
      },
    },
    nextHeading: "Contactez-nous",
    nextSubheading:
      "Dites-nous ce qu’il vous faut et nous reviendrons vers vous.",
    form: {
      company: "Entreprise",
      companyPlaceholder: "Acme SAS",
      name: "Votre nom",
      namePlaceholder: "Jane Doe",
      email: "E-mail professionnel",
      emailPlaceholder: "jane@acme.com",
      topic: "Comment pouvons-nous vous aider ?",
      topics: [
        "Mise en place de l’auto-hébergement",
        "Plus de 1 To",
        "Autre chose",
      ],
      teamSize: "Taille de l’équipe",
      teamSizes: ["1–10", "11–50", "51–200", "200+"],
      cloudflare: "Avez-vous un compte Cloudflare ?",
      cloudflareOptions: ["Oui", "Non", "Je ne sais pas"],
      notes: "Autre chose à nous signaler ?",
      notesPlaceholder: "La taille de votre équipe, votre domaine, vos délais…",
      submit: "Envoyer le message",
      error:
        "Votre demande n’a pas pu être envoyée. Veuillez réessayer ou écrivez-nous à {email}.",
      sentTitle: "Message envoyé",
      sentBody: "Merci. Nous vous répondrons à l’adresse {email}.",
      back: "Retour à l’accueil",
    },
  },
  enterprise: {
    title: "CaptureFlow pour",
    titleHighlight: "votre entreprise",
    subtitle:
      "Le forfait géré pour les entreprises qui veulent des licences pour tous, à des conditions convenues une fois pour toutes, avec une facture unique.",
    includedHeading: "Ce qu’apporte le forfait Entreprise",
    included: {
      storage: {
        title: "Un stockage à votre mesure",
        body: "Un volume adapté à ce que votre entreprise enregistre, et non un quota par licence.",
      },
      seats: {
        title: "Des licences pour tous",
        body: "Un seul contrat couvre toute l’entreprise, quel que soit le nombre de personnes qui enregistrent.",
      },
      roadmap: {
        title: "Vos demandes en priorité",
        body: "Les fonctionnalités demandées par votre équipe passent en tête de notre liste.",
      },
      managed: {
        title: "Entièrement géré",
        body: "Nous l’hébergeons et déployons les mises à jour : vous n’avez rien à faire tourner.",
      },
      billing: {
        title: "Facturation annuelle",
        body: "Payez une fois par an, à un prix convenu pour votre entreprise.",
      },
      support: {
        title: "Une ligne directe avec nous",
        body: "Vos questions arrivent directement aux personnes qui développent CaptureFlow.",
      },
    },
    everythingHeading: "Tout ce dont votre équipe dispose",
    comingSoon: "Bientôt disponible",
    everything: {
      extension: {
        title: "Extension Chrome",
        body: "Enregistrez n’importe quel onglet ou écran, avec un lien prêt dès que vous arrêtez.",
      },
      mac: {
        title: "Application Mac",
        body: "Un enregistreur natif pour macOS, avec les mêmes liens de partage instantanés.",
      },
      workspaces: {
        title: "Espaces de travail d’équipe",
        body: "Les enregistrements de chacun au même endroit, partagés ou gardés privés.",
      },
      feedback: {
        title: "Commentaires et réactions",
        body: "Les spectateurs répondent directement sur la timeline, au moment précis dont ils parlent.",
      },
      edit: {
        title: "Modifier après le partage",
        body: "Changez l’arrière-plan, la caméra ou le son, et le lien reste le même.",
      },
      screenshots: {
        title: "Captures d’écran annotées",
        body: "Annotez une capture d’écran avec des flèches, du texte et du floutage, et partagez-la par un lien.",
      },
    },
    formHeading: "Contactez-nous",
    formSubheading:
      "Parlez-nous de votre équipe et nous vous répondrons par e-mail.",
    form: {
      company: "Entreprise",
      companyPlaceholder: "Acme SAS",
      name: "Votre nom",
      namePlaceholder: "Jane Doe",
      email: "E-mail professionnel",
      emailPlaceholder: "jane@acme.com",
      need: "De quoi avez-vous besoin ?",
      needs: [
        "Des licences pour une grande équipe",
        "Des conditions sur mesure ou une facture unique",
        "Autre chose",
      ],
      teamSize: "Taille de l’équipe",
      teamSizes: ["1–10", "11–50", "51–200", "200+"],
      storage: "Quel volume de stockage ?",
      storageOptions: ["1–5 To", "5–20 To", "20 To et plus", "Je ne sais pas"],
      notes: "Autre chose à nous signaler ?",
      notesPlaceholder:
        "Le volume d’enregistrements de votre équipe, vos délais, vos besoins de facturation…",
      submit: "Envoyer le message",
      error:
        "Votre message n’a pas pu être envoyé. Veuillez réessayer ou écrivez-nous à {email}.",
      sentTitle: "Message envoyé",
      sentBody: "Merci. Nous vous répondrons à l’adresse {email}.",
      back: "Retour à l’accueil",
    },
  },
  pricing: {
    heading: "Tarifs",
    cta: "Comparer tous les forfaits",
    subheading:
      "Le forfait Gratuit couvre vos premiers enregistrements. Les forfaits payants sont à un prix par membre.",
    controls: {
      shownIn:
        "Les prix sont affichés en {currency}. Le paiement est en dollars américains.",
      teamSize: "Taille de l’équipe",
      members: "membres",
      title: "Facturation",
      note: "Un prix par membre.",
      billing: "Me facturer",
      monthly: "Mensuelle",
      annually: "Annuelle",
      save: "Économisez {percent} %",
    },
    compare: {
      loomRow: "Loom {plan}",
      loomDetail: "{seats} personnes × {perSeat} chacune",
      caption: "Prix mensuels.",
      captureflowRow: "CaptureFlow {ourPlan}",
      captureflowDetail: "{seats} membres × {ourPerSeat} chacun",
      saveLabel: "Votre équipe économise",
      saveValue: "{savings} par an",
    },
    plans: {
      chargedInUsd: "Facturé en dollars américains.",
      member: "membre",
      members: "membres",
      included: "Inclus",
      notIncluded: "Non inclus",
      free: {
        name: "Gratuit",
        description: "Des enregistrements d’écran à partager par lien.",
        cta: "S’inscrire",
      },
      light: {
        name: LIGHT,
        featuresHeading: "Tout le forfait Gratuit, et aussi",
        features: [
          "Enregistrements illimités",
          "Durée d’enregistrement illimitée",
          `${LIGHT_AGENT_MIN} min par mois d’enregistrements par agent dans le cloud, jusqu’à 10 min chacun`,
        ],
        description:
          "Enregistrements illimités en qualité économie de données.",
        period: "/mois",
        noteMonthly: "Par membre, facturation mensuelle",
        noteAnnual:
          "Par membre, facturation annuelle. {yearly} par an pour {seats} {members}",
        cta: "Essayer gratuitement",
      },
      pro: {
        badge: "Recommandé",
        name: PRO,
        featuresHeading: `Tout le forfait ${LIGHT}, et aussi`,
        features: [
          "Pleine qualité, jusqu’à 1080p",
          "Chapitres et titres IA, suppression des mots parasites",
          "Image de marque personnalisée",
          `${PRO_AGENT_MIN} min par mois d’enregistrements par agent dans le cloud, avec ${PRO_VOICEOVER_MIN} min de voix off IA`,
          "Statistiques d’audience (bientôt disponible)",
          "Intégrations Slack, Notion et Zapier (bientôt disponible)",
        ],
        description:
          "Pleine qualité, nettoyage par IA et votre propre image de marque.",
        period: "/mois",
        noteMonthly: "Par membre, facturation mensuelle",
        noteAnnual:
          "Par membre, facturation annuelle. {yearly} par an pour {seats} {members}",
        cta: "Essayer gratuitement",
      },
      rows: {
        recordings: {
          label: "Enregistrements par personne",
          free: "Jusqu’à {recordings}",
          light: "Illimités",
          pro: "Illimités",
        },
        length: {
          label: "Durée d’enregistrement",
          free: "{minutes} min par vidéo",
          light: "Illimitée",
          pro: "Illimitée",
        },
        quality: {
          label: "Qualité vidéo",
          free: "Économie de données",
          light: "Économie de données",
          pro: "Jusqu’à 1080p",
        },
        transcripts: {
          label: "Transcriptions et sous-titres",
          free: true,
          light: true,
          pro: true,
        },
        editing: {
          label: "Montage depuis la transcription",
          free: true,
          light: true,
          pro: true,
        },
        chapters: {
          label: "Chapitres et titres IA",
          free: false,
          light: false,
          pro: true,
        },
        filler: {
          label: "Suppression des mots parasites",
          free: false,
          light: false,
          pro: true,
        },
        feedback: {
          label: "Commentaires et réactions",
          free: true,
          light: true,
          pro: true,
        },
        agents: {
          label: "Enregistrements par agent en local",
          free: true,
          light: true,
          pro: true,
        },
        cloudAgents: {
          label: "Enregistrements par agent dans le cloud",
          free: `${FREE_AGENT_MIN} min par mois`,
          light: `${LIGHT_AGENT_MIN} min par mois`,
          pro: `${PRO_AGENT_MIN} min par mois`,
        },
        voiceover: {
          label: "Voix off IA en local",
          free: true,
          light: true,
          pro: true,
        },
        cloudVoiceover: {
          label: "Voix off IA dans le cloud",
          free: false,
          light: false,
          pro: `${PRO_VOICEOVER_MIN} min par mois`,
        },
        branding: {
          label: "Image de marque personnalisée",
          free: false,
          light: false,
          pro: true,
        },
      },
    },
    table: {
      heading: "Toutes les fonctionnalités, forfait par forfait",
      subtitle: "Gratuit, Light et Pro, côte à côte.",
      groups: [
        {
          title: "Enregistrement",
          rows: [
            {
              label: "Membres",
              free: "Illimités",
              light: "Illimités",
              pro: "Illimités",
            },
            {
              label: "Enregistrements par personne",
              free: "Jusqu’à {recordings}",
              light: "Illimités",
              pro: "Illimités",
            },
            {
              label: "Durée d’enregistrement",
              free: "{minutes} min par vidéo",
              light: "Illimitée",
              pro: "Illimitée",
            },
            {
              label: "Qualité vidéo",
              free: "Économie de données",
              light: "Économie de données",
              pro: "Jusqu’à 1080p",
            },
            {
              label: "Captures d’écran",
              free: "Illimitées",
              light: "Illimitées",
              pro: "Illimitées",
            },
            {
              label: "Conservation des enregistrements",
              free: "30 jours sans vue",
              light: "Jusqu’à ce que vous les supprimiez",
              pro: "Jusqu’à ce que vous les supprimiez",
            },
            {
              label: "Capture de l’écran entier, d’une fenêtre ou d’un onglet",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Bulle caméra et effets caméra",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Micro et son du système",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Curseur fluide",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Extension Chrome et application Mac",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "IA",
          rows: [
            {
              label: "Transcriptions",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Sous-titres",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Résumé en chapitres",
              free: false,
              light: false,
              pro: true,
            },
            {
              label: "Titres suggérés automatiquement",
              free: false,
              light: false,
              pro: true,
            },
            {
              label: "Monter la vidéo depuis sa transcription",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Suppression des mots parasites",
              free: false,
              light: false,
              pro: true,
            },
          ],
        },
        {
          title: "Agents",
          rows: [
            {
              label: "Enregistrements par agent sur votre ordinateur",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Enregistrements par agent dans un navigateur cloud",
              free: `${FREE_AGENT_MIN} min par mois et par personne`,
              light: `${LIGHT_AGENT_MIN} min par mois et par membre`,
              pro: `${PRO_AGENT_MIN} min par mois et par membre`,
            },
            {
              label: "Diapositives dans les enregistrements par agent",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Voix off IA sur votre ordinateur",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Voix off IA dans un navigateur cloud",
              free: false,
              light: false,
              pro: `${PRO_VOICEOVER_MIN} min par mois et par membre`,
            },
          ],
        },
        {
          title: "Modification",
          rows: [
            {
              label: "Modifier après le partage, même lien",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Arrière-plans",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Déplacer ou redimensionner la bulle caméra",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Couper des passages de la vidéo",
              free: true,
              light: true,
              pro: true,
            },
            {
              label:
                "Captures d’écran annotées avec flèches, texte et floutage",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Canevas infini",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "Partage et retours",
          rows: [
            {
              label: "Lien de partage prêt dès que vous arrêtez",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Liens publics, d’espace de travail ou privés",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Demande d’accès sur les liens restreints",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Aperçus du lien dans les messageries et les e-mails",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Intégrer le lecteur n’importe où",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Lecture dans les issues et les pull requests GitHub",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Commentaires sur la timeline",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Réactions émoji",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Nombre de vues",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Télécharger le fichier d’origine",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "Espace de travail et administration",
          rows: [
            {
              label: "Espace de travail d’équipe",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Rôles propriétaire, membre et lecteur",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Visibilité par défaut et droits d’envoi",
              free: true,
              light: true,
              pro: true,
            },
            {
              label:
                "Recherche dans les enregistrements et les captures d’écran",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Image de marque personnalisée",
              free: false,
              light: false,
              pro: true,
            },
          ],
        },
        {
          title: "Hébergement et support",
          rows: [
            {
              label: "Open source sous licence AGPL",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Auto-hébergement sur votre propre compte Cloudflare",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Hébergement géré et mises à jour",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
      ],
    },
    includes: {
      heading: "Tous les forfaits incluent",
      items: [
        "Votre propre espace de travail, invitez qui vous voulez",
        "Effets caméra",
        "Transcriptions et sous-titres IA",
        "Monter la vidéo depuis sa transcription",
        "Liens de partage publics, d’espace de travail ou privés",
        "Commentaires et réactions émoji",
        "Captures d’écran annotées",
        "Canevas infini",
      ],
    },
    annual: {
      badgePro: "Géré",
      badgeCycle: "Annuel",
      title: "Hébergement géré",
      subtitle: "Entièrement hébergé, facturé annuellement.",
      period: "/mois",
      note: "Facturé {amount}/an. Annulez à tout moment.",
      cta: "Commencer",
    },
  },
  activity: {
    heading: "Derniers changements sur GitHub",
    subtitle:
      "Chaque changement est public. Voici les dernières pull requests et issues ouvertes sur GitHub.",
    cta: "Voir sur GitHub",
    shippedHeading: "Fusionnées récemment",
    openHeading: "Issues et pull requests ouvertes",
    emptyOpen: "Rien d’ouvert pour le moment.",
    newIssue: "Signaler un bug ou demander une fonctionnalité",
    viewAll: "Tout voir sur GitHub",
  },
  faq: {
    heading: "Questions fréquentes",
    subtitle:
      "Des réponses sur l’enregistrement, les tarifs, le stockage et l’auto-hébergement. Consultez la documentation pour tout le reste.",
    cta: "Lire la documentation",
    waitlistLink: "Rejoindre la liste d’attente",
    items: [
      {
        question: "Comment faire un enregistrement ?",
        answer:
          "Il y a deux façons de faire, et la différence tient à qui enregistre.\n\nAvec l’extension Chrome, vous enregistrez vous-même. Vous parcourez votre écran et pouvez commenter avec votre propre voix et votre caméra. Utilisez-la pour un point rapide, un retour ou tout ce qui demande votre présence.\n\nAvec un agent IA, vous décrivez la vidéo et l’agent parcourt l’écran et l’enregistre pour vous, pendant que vous continuez à travailler. Il peut ajouter des diapositives et une voix off IA. Utilisez-le pour les démos produit, les tutoriels et les rapports de bug.\n\nPour enregistrer vous-même :\n1. Installez l’extension CaptureFlow depuis le Chrome Web Store.\n2. Cliquez sur son icône dans la barre d’outils de votre navigateur et connectez-vous.\n3. Cliquez de nouveau sur l’icône. Choisissez « This tab », « Window » ou « Full screen », et activez votre caméra et votre micro si vous le souhaitez.\n4. Appuyez sur « Start Recording ». Une barre sur la page vous permet de mettre en pause ou d’arrêter.\n5. Arrêtez l’enregistrement. La page de votre enregistrement s’ouvre, avec un lien que vous pouvez partager avec n’importe qui.\n\nPour qu’un agent enregistre à votre place :\n1. Connectez CaptureFlow à l’application d’IA que vous utilisez. La section Agents de la page d’accueil donne les étapes pour Claude, ChatGPT, Claude Code, Codex et Cursor.\n2. Connectez-vous quand un onglet de navigateur s’ouvre. Vous ne le faites qu’une seule fois.\n3. Demandez la vidéo avec vos propres mots, par exemple : Enregistre une démo qui montre comment s’inscrire sur notre site, avec une voix off.\n4. L’agent l’enregistre et vous donne un lien que vous pouvez partager avec n’importe qui.",
      },
      {
        question: "Puis-je auto-héberger CaptureFlow ?",
        answer:
          "Oui. CaptureFlow est open source sous licence AGPL, et tout le backend tourne sur Cloudflare : Workers pour l’application et l’API, R2 pour les enregistrements et D1 pour tout le reste. Créez une base de données D1 et un bucket R2, appliquez les migrations, définissez un secret, puis déployez. Il existe aussi un bouton Deploy to Cloudflare. Le guide se trouve sur docs.captureflow.dev.",
      },
      {
        question: "Mon agent IA peut-il enregistrer des vidéos pour moi ?",
        answer:
          "Oui. Ajoutez CaptureFlow à Claude Code, Codex ou Cursor en une ligne, ou ajoutez-le dans Claude ou ChatGPT, puis demandez une vidéo avec vos propres mots. Il enregistre un navigateur, votre écran ou une application sur votre propre ordinateur, ajoute des diapositives et une voix off si vous le souhaitez, et vous donne un lien à partager.\n\nLes enregistrements par agent en local sont inclus dans tous les forfaits. Les enregistrements par agent dans le cloud sont soumis à un quota mensuel qui dépend de votre forfait.",
      },
      {
        question: "Comment fonctionnent les tarifs payants ?",
        answer: `${LIGHT} et ${PRO} sont à un prix par membre et par mois, moins élevé en facturation annuelle. Un membre est une personne qui enregistre : vous ne payez donc que pour les personnes qui font des enregistrements.\n\nQuand quelqu’un arrive ou part, le nombre de licences est ajusté sur la facture suivante.`,
      },
      {
        question: "Combien de temps mes enregistrements sont-ils conservés ?",
        answer:
          "Avec les forfaits payants, jusqu’à ce que vous les supprimiez. Avec le forfait Gratuit, un enregistrement est supprimé après 30 jours sans vue, pour que les comptes inactifs n’occupent pas d’espace. Si vous auto-hébergez, c’est vous qui fixez les règles.",
      },
      {
        question: "Que comprend le forfait Gratuit ?",
        answer: `Vous disposez de 25 enregistrements par personne, de 5 minutes maximum chacun, en qualité économie de données, avec transcriptions et sous-titres. Les enregistrements sont supprimés après 30 jours sans vue. Inscrivez-vous, installez l’extension Chrome et commencez à enregistrer.\n\n${LIGHT} supprime les limites pour un prix par membre et conserve les enregistrements jusqu’à ce que vous les supprimiez.`,
      },
    ],
  },
  cta: {
    headline: "Commencez à enregistrer",
    subtitle:
      "Téléchargement gratuit. Sans carte bancaire. Dites-le dans un court message vidéo plutôt que dans une réunion de plus.",
    button: "Essayer CaptureFlow gratuitement",
  },
  footer: {
    tagline:
      "Enregistrement d’écran open source avec liens de partage instantanés.",
    lights: "Lumière",
    lightsOn: "Allumée · tirez le cordon",
    lightsOff: "Éteinte · tirez le cordon",
    product: {
      title: "Produit",
      features: "Fonctionnalités",
      pricing: "Tarifs",
      compare: "Comparatif",
      download: "Télécharger",
      suggest: "Suggérer une fonctionnalité",
    },
    resources: {
      title: "Ressources",
      docs: "Documentation",
      selfHosting: "Auto-hébergement",
      blog: "Blog",
      releases: "Versions",
      faq: "FAQ",
      security: "Sécurité",
    },
    community: {
      title: "Communauté",
    },
    legal: {
      title: "Légal",
      privacy: "Politique de confidentialité",
      terms: "Conditions d’utilisation",
      refund: "Politique de remboursement",
      license: "Licence (AGPL-3.0)",
    },
    rights: "© {year} CaptureFlow. Tous droits réservés.",
    openSource: "Open source sous licence AGPL-3.0",
  },
  pageShell: {
    logoAlt: "CaptureFlow",
    backToHome: "Retour à l’accueil",
  },
  waitlist: {
    errors: {
      joinFailed:
        "Impossible de rejoindre la liste d’attente. Veuillez réessayer.",
      network: "Erreur réseau. Veuillez réessayer.",
    },
    success:
      "Vous êtes sur la liste. Je vous écrirai quand CaptureFlow sera prêt.",
    emailPlaceholder: "you@example.com",
    buttonLoading: "Inscription…",
    buttonDefault: "Rejoindre la liste d’attente",
    earlyAccessPrompt: "Envie d’un accès anticipé ?",
    earlyAccessLink: "Devenez bêta-testeur",
  },
  download: {
    heading: "Télécharger CaptureFlow",
    subtitle:
      "Disponible pour Chrome, et bientôt en application macOS. Chaque enregistrement a un lien que vous pouvez partager.",
    button: "Télécharger pour macOS",
    requires:
      "Nécessite {version} ou une version ultérieure sur Apple Silicon.",
    requirements:
      "Nécessite macOS 14 ou une version ultérieure sur Apple Silicon.",
    versionLabel: "Version {version}",
    sizeLabel: "DMG de {size} Mo",
    notarized: "Signé et notarié par Apple",
  },
  downloadPage: {
    otherWays: "Autres façons de l’obtenir",
    buildTitle: "Compiler depuis les sources",
    buildBody: "Clonez le dépôt et lancez l’enregistreur en local avec pnpm.",
    releasesTitle: "Toutes les versions",
    releasesBody:
      "Parcourez toutes les versions publiées et leur journal des modifications sur GitHub.",
    cloud:
      "Vous préférez le cloud ? {link} et regardez vos enregistrements dans votre navigateur.",
    cloudLink: "Créez un compte",
  },
  blog: {
    title: "Blog",
    subtitle: "Conseils, guides et actualités sur l’enregistrement d’écran.",
    readArticle: "Lire l’article",
    empty: "Aucun article pour le moment. Revenez bientôt.",
  },
};

export default messages;

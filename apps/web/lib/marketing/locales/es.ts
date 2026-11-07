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
      title: "CaptureFlow - Grabador de pantalla con enlace para compartir",
      description:
        "Graba tu pantalla y comparte un enlace con tu equipo o clientes. Grabador de código abierto con transcripciones con IA y capturas anotadas, autoalojable en Cloudflare.",
    },
    features: {
      title: "Funciones del grabador de pantalla",
      description:
        "Graba una pestaña, una ventana o toda la pantalla con cámara y micrófono, haz capturas anotadas y comparte cada una como un enlace que tu equipo puede comentar.",
    },
    pricing: {
      title: "Precios: empieza gratis, un precio por miembro",
      description: `Empieza gratis con ${FREE_RECORDINGS} grabaciones. ${LIGHT} y ${PRO} tienen un precio por miembro, con grabaciones e IA ilimitadas. O autoaloja CaptureFlow gratis.`,
    },
    faq: {
      title: "FAQ: compartir, almacenamiento y autoalojamiento",
      description:
        "Preguntas frecuentes sobre CaptureFlow: enlaces para compartir, autoalojamiento en Cloudflare, límites de almacenamiento y privacidad de las grabaciones.",
    },
    download: {
      title: "Descarga el grabador de pantalla para Chrome",
      description:
        "Instala la extensión de CaptureFlow para Chrome, graba tu pantalla y compártela con un enlace.",
    },
    enterprise: {
      title: "Empresas",
      description:
        "CaptureFlow gestionado para empresas grandes: licencias para todos, condiciones a medida y una sola factura. Cuéntanos qué necesitas.",
    },
    selfHostSetup: {
      title: "Configuración del autoalojamiento",
      description:
        "Configuramos CaptureFlow en la cuenta de Cloudflare de tu empresa: tu dominio, inicio de sesión solo para tu empresa y una extensión de Chrome privada para tu equipo.",
    },
    swarmDemo: {
      title: "Demo de enjambre: agentes reconstruyen cualquier web en video",
      description:
        "Escribe la dirección de una web y mira cómo un enjambre de cursores de agentes la reconstruye elemento a elemento, con música. Obtienes un video con un enlace para compartir.",
    },
    chromeExtension: {
      title: "Extensión de Chrome: graba tu pantalla y comparte un enlace",
      description:
        "Graba tu pantalla, una pestaña o tu cámara desde Chrome. Al terminar, obtienes un enlace que cualquiera puede ver, con transcripción, resumen y capítulos.",
    },
    agentRecorder: {
      title: "Servidor MCP: tu agente de IA graba vídeos",
      description:
        "Conecta Claude Code, Codex, Cursor o ChatGPT a CaptureFlow por MCP. Tu agente graba una app web, tu pantalla o una ventana y te da un enlace para compartir.",
    },
  },
  nav: {
    features: "Funciones",
    discover: "Descubre",
    pricing: "Precios",
    faq: "FAQ",
    changelog: "Novedades",
    login: "Iniciar sesión",
    library: "Mis grabaciones",
    download: "Descargar",
    language: "Idioma",
    openMenu: "Abrir menú",
    menu: "Menú",
    main: "Principal",
    docs: "Documentación",
    resources: "Recursos",
    faqDescription: "Respuestas a las preguntas habituales",
    blog: "Blog",
    blogDescription: "Guías y novedades",
    selfHosting: "Autoalojamiento",
    selfHostingDescription: "Ejecútalo en tu propio Cloudflare",
    community: "Comunidad",
    communityDescription: "Recibe ayuda y conversa en Discord",
    products: "Productos",
    swarmDemo: "Demo de enjambre",
    swarmDemoDescription: "Agentes reconstruyen cualquier web en video",
    extension: "Extensión de Chrome",
    extensionDescription: "Graba tu pantalla y comparte un enlace",
    agentRecorder: "Grabadora para agentes",
    agentRecorderDescription: "Videos que tu agente de IA crea por MCP",
    star: "Dar estrella en GitHub",
    starCount: "Dar estrella en GitHub ({stars})",
    themeToLight: "Cambiar a tema claro",
    themeToDark: "Cambiar a tema oscuro",
  },
  banner: {
    label: "Beta",
    aria: "CaptureFlow está en beta pública",
    title: "Estás entre los primeros 🎉",
    strip:
      "CaptureFlow sigue en beta, así que cambia a menudo y puede que encuentres algún detalle sin pulir mientras se asienta.",
    body: "CaptureFlow está en beta pública. Casi todas las semanas llega algo nuevo, y lo que la gente pide es lo primero que se construye.",
    cta: "Dime qué construir a continuación",
    close: "Cerrar",
  },
  announcement: {
    badge: "Nuevo",
    lead: "Tu agente de IA ya puede grabar por ti.",
    rest: "Conéctalo una vez, pídele un video y recibe un enlace.",
    cta: "Conectar",
  },
  hero: {
    title: "Grabador de pantalla {bubble}\npara ti y tus agentes de IA",
    subtitle:
      "Graba demos, tutoriales y recorridos por tu cuenta con la extensión de {chrome}, o deja que {claude}, {chatgpt} o {cursor} los graben por ti. Comparte cada uno como un enlace que cualquiera puede ver.",
    ctaLabel: "Prueba CaptureFlow gratis",
    installChrome: "Instalar extensión de Chrome",
    installMac: "Descargar para macOS",
    installSoon: "Pronto",
    connectMcp: "Conectar por MCP",
    macSoon: "App para macOS próximamente",
    installOr: "o",
    mcpCopy: "Copiar",
    mcpCopied: "Copiado",
    mcpAddToCursor: "Añadir a Cursor",
    badge: "Código abierto y de uso gratuito, en {github}",
    noCreditCard: "Sin tarjeta de crédito",
    teaser: {
      title: "Autoalojable",
      body: "Ejecútalo en tu propia cuenta de Cloudflare.",
      cta: "Probar CaptureFlow",
    },
    demo: {
      prevAria: "Demo anterior",
      nextAria: "Demo siguiente",
      dotAria: "Mostrar demo {n} de {total}",
    },
  },
  highlights: {
    heading: "Todas las funciones",
    subtitle: "Graba, edita y comparte. Todo está en un solo lugar.",
    items: {
      recording: { title: "Pantalla y cámara", body: "Graba ambas a la vez" },
      transcripts: {
        title: "Transcripciones",
        body: "En 99 idiomas",
        tag: "IA",
      },
      editing: {
        title: "Edición por transcripción",
        body: "Borra texto para cortar el video",
        tag: "IA",
      },
      camera: {
        title: "Efectos de cámara",
        body: "Fondos y filtros",
      },
      canvas: { title: "Lienzo infinito", body: "Dibuja mientras grabas" },
      screenshots: {
        title: "Capturas de pantalla anotadas",
        body: "Flechas, texto y desenfoque",
      },
      feedback: {
        title: "Comentarios y reacciones",
        body: "Opiniones sobre el video",
      },
      summary: {
        title: "Resúmenes y capítulos",
        body: "Con un título para cada video",
        tag: "IA",
      },
      filler: {
        title: "Eliminación automática de muletillas",
        body: "Quita los «eh» y los «em»",
        tag: "IA",
      },
    },
    cta: "Ver todas las funciones",
    previews: {
      app: "Plan de lanzamiento",
      columns: ["Pendiente", "En curso", "Hecho"],
      lines: [
        "Este es el nuevo flujo.",
        "Primero, elige un espacio de trabajo.",
        "Luego, comparte el enlace.",
      ],
      retake: "Eh, empiezo de nuevo.",
      filler: [
        "[Eh,] este es el nuevo flujo.",
        "Primero, [em,] elige un espacio de trabajo.",
        "Luego, [eh,] comparte el enlace.",
      ],
      step: "Paso 1",
      note: "Mueve esto",
      comment: "Me encanta este flujo",
      summaryTitle: "Cómo invitar a tu equipo",
      summaryBody: "Elige un espacio de trabajo y comparte el enlace.",
      chapters: ["Introducción", "Elige un espacio de trabajo"],
    },
  },
  mcpFeatures: {
    heading: "Funciones de MCP",
    subtitle:
      "Lo que tu agente de IA puede hacer una vez conectado. Graba en tu propia computadora, con Claude Code, Codex, Cursor o cualquier cliente MCP.",
    cta: "Leer la guía",
    items: {
      webApp: { title: "Graba una app web", body: "Incluso en localhost" },
      screen: { title: "Graba tu pantalla", body: "Un monitor completo" },
      window: {
        title: "Graba una sola ventana",
        body: "Terminal, VS Code o Figma",
      },
      slides: {
        title: "Añade diapositivas",
        body: "Títulos, pasos y frases de cierre",
      },
      voiceover: {
        title: "Añade una voz en off",
        body: "Se ejecuta en tu computadora",
      },
      report: { title: "Escribe un informe", body: "Qué hizo y qué falló" },
      search: { title: "Busca grabaciones", body: "Videos y transcripciones" },
      save: {
        title: "Guarda archivos MP4",
        body: "Sin subir nada ni iniciar sesión",
      },
    },
  },
  useCases: {
    heading: "Cómo lo usan los equipos",
    subtitle:
      "Ejemplos de lo que graban los equipos. Cada video es un enlace que se reproduce en cualquier navegador.",
    cta: "Ver cómo funciona",
    cards: {
      engineering: {
        title: "Ingeniería",
        body: "Graba un recorrido por un PR o cómo reproducir un error.",
      },
      design: {
        title: "Diseño",
        body: "Graba un recorrido por una maqueta y recopila comentarios.",
      },
      support: {
        title: "Atención al cliente",
        body: "Responde a un ticket con un recorrido breve.",
      },
      updates: {
        title: "Novedades del equipo",
        body: "Graba la actualización semanal y comparte el enlace.",
      },
    },
    engineeringFile: "checkout.ts",
    engineeringPr: "PR #482",
    designApp: "trip-app",
    designBadge: "Checkout v3",
    designCardTitle: "Planifica tu viaje",
    designColors: "Colores",
    designComment: "¿CTA más grande?",
    supportQuestion: "¿Cómo invito a mi equipo al espacio de trabajo?",
    supportReply: "Aquí tienes un recorrido rápido:",
    supportLink: "captureflow.dev/r/8kx2pnq4",
    updatesTitle: "Actualización semanal",
    updatesRange: "6–10 oct",
    updatesSignups: "Registros",
    updatesShipped: "Lanzamientos",
    updatesFeatures: "funciones",
  },
  agents: {
    heading: "O pídele a tu agente de IA que grabe tus demos y tutoriales",
    worksWith: "Funciona con {claude}, {openai} y {cursor}.",
    cta: "Leer la guía",
    subtitle:
      "Pídelo con palabras sencillas. Graba un navegador, tu pantalla o una app en tu propia computadora, añade diapositivas y voz en off si quieres, y te entrega un enlace.",
    steps: [
      {
        title: "Conecta tu agente",
        body: "Añade CaptureFlow a Claude Code, Codex o Cursor con una sola línea. Necesitas Node.js 20 o posterior, y tu agente inicia sesión una sola vez. En Claude o ChatGPT, añádelo mediante su URL.",
      },
      {
        title: "Pide un video",
        body: "Una demo de una función, un tutorial, un informe de error o una presentación narrada.",
      },
      {
        title: "Graba por ti",
        body: "En tu computadora, incluso una app en localhost.",
      },
      {
        title: "Añade diapositivas y voz",
        body: "Diapositivas de título y voz en off, si las quieres.",
      },
      {
        title: "Te da un enlace para compartir",
        body: "Adjúntalo a un pull request, publícalo en Slack o envíaselo a un cliente.",
      },
    ],
    scenes: {
      ask: {
        name: "terminal",
        badge: "agente",
        prompt: "Graba una demo del pago",
        steps: [
          "Abriendo la app",
          "Recorriendo los pasos",
          "Tu enlace está listo",
        ],
      },
      record: {
        url: "localhost:3000",
        badge: "demo",
        title: "Pago",
        fields: ["Tu nombre", "Número de tarjeta"],
        pay: "Pagar ahora",
        paid: "Pagado",
      },
      voice: {
        title: "Demo del pago",
        subtitle: "Cómo pagar en tres pasos",
      },
      share: {
        title: "Demo del pago",
        link: "captureflow.dev/r/checkout",
        places: ["PR", "Slack", "Correo"],
      },
    },
    chats: {
      claude:
        "En Claude, abre «Customize», luego «Connectors», y elige «Add custom connector». Ponle de nombre CaptureFlow, pega esta URL e inicia sesión.",
      chatgpt:
        "En ChatGPT en la web, abre «Plugins», haz clic en + y elige «Add custom MCP server». Ponle de nombre CaptureFlow, pega esta URL, elige OAuth, y luego instala el plugin e inicia sesión. Requiere un plan Business, Enterprise o Edu.",
      limits:
        "Los chats crean vídeos de presentación y tutoriales a partir de diapositivas en nuestros servidores, no grabaciones de tu ordenador, y consumen los minutos de agente en la nube de tu plan.",
    },
  },
  modes: {
    cta: "Empezar a grabar",
    heading: "Graba tu pantalla con la extensión de Chrome",
    subtitle:
      "Instálala y haz clic en grabar. Al terminar, recibes un enlace que cualquiera puede ver, con título, resumen, capítulos y transcripción.",
    scene: {
      timer: "0:42",
      heading: "Cómo funciona un reembolso",
      steps: ["Solicitud", "Aprobación", "Pago"],
      captions: [
        "Un recorrido rápido por cómo funciona un reembolso.",
        "Primero, el cliente envía una solicitud.",
        "Soporte la aprueba el mismo día.",
        "Después, el dinero se envía automáticamente.",
      ],
    },
  },
  pageHeroes: {
    home: "Inicio",
    features: {
      label: "Funciones",
      word: "FUNCIONES",
      title: "Graba, edita y comparte tu pantalla",
      subtitle:
        "Graba tu pantalla y tu cámara. Comparte cada grabación como un enlace que tu equipo puede comentar.",
    },
    pricing: {
      label: "Precios",
      word: "PRECIOS",
      title: "Empieza gratis. Paga un precio por miembro.",
      subtitle:
        "El plan Gratis cubre tus primeras 25 grabaciones. Light y Pro eliminan el límite. También puedes autoalojar CaptureFlow gratis.",
    },
    faq: {
      label: "FAQ",
      word: "FAQ",
      title: "Preguntas frecuentes",
      subtitle:
        "Respuestas sobre grabación, precios, almacenamiento y autoalojamiento. Consulta la documentación para todo lo demás.",
    },
    chromeExtension: {
      label: "Extensión de Chrome",
      word: "CHROME",
      title: "Graba tu pantalla desde Chrome",
      subtitle:
        "Graba tu pantalla, una pestaña o tu cámara. Al terminar, obtienes un enlace que cualquiera puede ver, con transcripción, resumen y capítulos.",
    },
    agentRecorder: {
      label: "Grabador para agentes",
      word: "MCP",
      title: "Deja que tu agente de IA grabe tus vídeos",
      subtitle:
        "Conéctalo por MCP y pídeselo con palabras sencillas. Graba una app web, tu pantalla o una ventana, añade diapositivas y voz si quieres, y te da un enlace.",
    },
  },
  collaboration: {
    heading: "Qué puedes hacer después de grabar",
    cta: "Pruébalo gratis",
    subtitle:
      "Edítalo y luego compártelo o insértalo. Invita a tu equipo a ver, reaccionar y comentar los videos de los demás.",
    categories: {
      share: {
        feature: {
          tag: "nuevo",
          title: "Edita tu video",
          cta: "Instalar la extensión",
          body: "Borra palabras de la transcripción para cortarlas del video, o recorta clips en la línea de tiempo. Cambia el fondo, mueve, redimensiona u oculta tu cámara, y silencia el micrófono o el sonido del sistema.",
        },
        scene: {
          app: "Plan de lanzamiento",
          nav: ["Resumen", "Hoja de ruta", "Tareas", "Documentos"],
          columns: [
            {
              name: "Pendiente",
              tasks: ["Textos de la página de precios", "Correo de bienvenida"],
            },
            {
              name: "En curso",
              tasks: ["Rediseño del pago", "Invitaciones de equipo"],
            },
            { name: "Hecho", tasks: ["Formulario de registro beta"] },
          ],
          background: "Fondo",
          camera: "Cámara",
          shapes: ["Círculo", "Cuadrado"],
          fillers: "Muletillas",
          remove: "Quitar",
          transcript: {
            before: "Haz clic aquí para",
            fillers: ["eh,", "espera,", "perdón,"],
            after: "compartir el enlace.",
          },
          saved: "Guardado · mismo enlace",
        },
      },
      embed: {
        feature: {
          title: "Comparte o inserta tu video",
          cta: "Instalar la extensión",
          body: "Pega el enlace en Slack, GitHub, Notion o un correo y se muestra una vista previa. También puedes insertar el reproductor en tu documentación o tu sitio. Con la extensión instalada, se reproduce dentro de los issues y pull requests de GitHub.",
        },
        scene: {
          question:
            "¿Me puedes mostrar cómo invitar a mi equipo al espacio de trabajo?",
          reply: "¡Claro! Aquí tienes un recorrido breve por los pasos:",
          url: "captureflow.dev/r/8kx2pnq4",
          app: "Configuración",
          nav: ["General", "Miembros", "Facturación"],
          members: "Miembros",
          invite: "Invitar",
          people: [
            { initials: "AR", name: "Alex Rivera", role: "Propietario" },
            { initials: "CK", name: "Chris Kim", role: "Miembro" },
            { initials: "JB", name: "Jordan Bell", role: "Miembro" },
          ],
          duration: "0:48",
        },
      },
      feedback: {
        feature: {
          title: "Colabora en tus videos",
          cta: "Iniciar sesión",
          body: "Colabora sin reuniones y entre zonas horarias. Tu equipo puede reaccionar con emojis, comentar en cualquier momento del video y seguirlo con transcripciones y subtítulos.",
        },
        scene: {
          title: "Recorrido por el plan de lanzamiento",
          author: "Alex",
          age: "ahora mismo",
          duration: "1:12",
          activity: "Actividad",
          events: [
            { initials: "CK", name: "Chris", at: "0:09", emoji: "👍" },
            { initials: "JB", name: "Jordan", at: "0:17", emoji: "🔥" },
            {
              initials: "MC",
              name: "Maya",
              at: "0:27",
              text: "Me encanta la nueva vista de tablero",
            },
            { initials: "SL", name: "Sam", at: "0:37", emoji: "❤️" },
            {
              initials: "JB",
              name: "Jordan",
              at: "0:48",
              text: "¿Podemos lanzarlo este viernes?",
            },
            {
              initials: "AR",
              name: "Alex",
              at: "0:56",
              text: "Sí, justo después de QA ✅",
            },
            { initials: "MC", name: "Maya", at: "1:05", emoji: "👏" },
          ],
        },
      },
      workspaces: {
        feature: {
          title: "Invita a tu equipo a un espacio de trabajo",
          cta: "Crear un espacio de trabajo",
          body: "Las grabaciones de todos se guardan en un mismo espacio de trabajo. Cada video puede ser público, visible para el espacio de trabajo o privado.",
        },
        scene: {
          team: "Equipo de CaptureFlow",
          members: ["1 miembro", "2 miembros", "3 miembros"],
          memberInitials: ["AR", "CK", "JB"],
          invitePlaceholder: "Invitar por correo",
          inviteEmail: "chris@acme.co, jordan@acme.co",
          invite: "Invitar",
          invited: "Enviado",
          joined: "Chris y Jordan se unieron 🎉",
          whoCanWatch: "Quién puede verlo:",
          visibility: [
            { label: "Público", detail: "Cualquiera con el enlace" },
            { label: "Espacio de trabajo", detail: "Solo tu equipo" },
            { label: "Privado", detail: "Solo tú" },
          ],
        },
      },
    },
  },
  setupService: {
    title: "Lo configuramos",
    titleHighlight: "por ti",
    subtitle:
      "Cuéntanos sobre tu empresa. Configuramos la app, la extensión de Chrome, la app para macOS y toda la infraestructura que hay detrás, lista para que tu equipo la use.",
    includedHeading: "Todo lo que configuramos",
    included: {
      infra: {
        title: "La app, en tu infraestructura",
        body: "Desplegada en tu propia cuenta de Cloudflare y servida desde tu dominio. Todo es tuyo.",
      },
      storage: {
        title: "Almacenamiento y base de datos",
        body: "Las grabaciones en tu propio bucket de R2; los espacios de trabajo y los comentarios en tu propia base de datos.",
      },
      signin: {
        title: "Inicio de sesión solo para tu empresa",
        body: "Inicio de sesión con Google Workspace o GitHub, limitado al dominio de correo de tu empresa.",
      },
      apps: {
        title: "Extensión de Chrome y app para Mac",
        body: "Ambas compiladas para tu instancia, con la extensión publicada de forma privada para tu equipo.",
      },
      ready: {
        title: "Todo listo para grabar",
        body: "Espacios de trabajo creados y tu equipo invitado, para que todos puedan empezar a compartir de inmediato.",
      },
      handover: {
        title: "Entrega",
        body: "Le explicamos a quien lo vaya a mantener cómo ejecutarlo y actualizarlo.",
      },
    },
    nextHeading: "Contáctanos",
    nextSubheading: "Cuéntanos qué necesitas y te responderemos.",
    form: {
      company: "Empresa",
      companyPlaceholder: "Acme S.A.",
      name: "Tu nombre",
      namePlaceholder: "Ana García",
      email: "Correo de trabajo",
      emailPlaceholder: "ana@acme.com",
      topic: "¿En qué podemos ayudarte?",
      topics: ["Configuración del autoalojamiento", "Más de 1 TB", "Otra cosa"],
      teamSize: "Tamaño del equipo",
      teamSizes: ["1–10", "11–50", "51–200", "200+"],
      cloudflare: "¿Tienes una cuenta de Cloudflare?",
      cloudflareOptions: ["Sí", "No", "No lo sé"],
      notes: "¿Algo más que debamos saber?",
      notesPlaceholder: "El tamaño de tu equipo, tu dominio, tus plazos…",
      submit: "Enviar mensaje",
      error:
        "No se pudo enviar tu solicitud. Inténtalo de nuevo o escríbenos a {email}.",
      sentTitle: "Mensaje enviado",
      sentBody: "Gracias. Te responderemos a {email}.",
      back: "Volver al inicio",
    },
  },
  swarmDemo: {
    title: "Mira cómo un enjambre de agentes reconstruye",
    titleHighlight: "cualquier web",
    subtitle:
      "Escribe la dirección de una web. Un enjambre de cursores de agentes la vuelve a dibujar elemento a elemento, con música, y obtienes un enlace de video para compartir.",
    url: "Dirección de la web",
    urlPlaceholder: "https://example.com",
    generate: "Generar demo",
    generating: "Iniciando un navegador en la nube…",
    check: "Comprobar sitio web",
    checking: "Comprobando el sitio web…",
    previewNote:
      "Esta es la página que los agentes reconstruirán. Genera la demo cuando se vea bien.",
    change: "Cambiar dirección",
    note: "Inicia sesión para generar gratis. Cada demo aparece en tu biblioteca.",
    noteSignedIn: "Genera gratis. Cada demo aparece en tu biblioteca.",
    howHeading: "Cómo funciona",
    how: {
      type: {
        title: "Escribe una dirección",
        body: "Cualquier web pública. La página se carga en un navegador en la nube y se detectan todos los títulos, imágenes, botones y tarjetas.",
      },
      build: {
        title: "Los agentes la reconstruyen",
        body: "La petición se escribe en un cuadro de chat y luego un enjambre de cursores coloca cada elemento mientras la música se acelera.",
      },
      share: {
        title: "Obtén un enlace",
        body: "El video se abre en tu biblioteca en cuanto está listo. Comparte el enlace, descarga el archivo o publícalo.",
      },
    },
    errors: {
      invalidUrl: "Escribe una dirección web como example.com.",
      unreachable:
        "No se pudo acceder a ese sitio web. Revisa la dirección e inténtalo de nuevo.",
      unavailable: "Las demos no están disponibles en este servidor.",
      running:
        "Una de tus grabaciones sigue en curso. Espera a que termine y vuelve a intentarlo.",
      limit:
        "Este espacio de trabajo ha agotado sus minutos de agente en la nube de este mes. Se renuevan el día 1.",
      recordings:
        "Has alcanzado el límite de grabaciones del plan gratuito. Elimina una grabación o mejora tu plan e inténtalo de nuevo.",
      busy: "Todos los navegadores en la nube están ocupados ahora mismo. Vuelve a intentarlo en unos minutos.",
      failed: "No se pudo iniciar la demo. Vuelve a intentarlo.",
    },
  },
  enterprise: {
    title: "CaptureFlow para",
    titleHighlight: "tu empresa",
    subtitle:
      "El plan gestionado para empresas que quieren licencias para todos con condiciones acordadas una sola vez y una única factura.",
    includedHeading: "Lo que añade el plan Empresas",
    included: {
      storage: {
        title: "Almacenamiento a tu medida",
        body: "Un espacio común dimensionado según lo que graba tu empresa, no una cuota por licencia.",
      },
      seats: {
        title: "Licencias para todos",
        body: "Un solo acuerdo cubre a toda la empresa, sin importar cuántas personas graben.",
      },
      roadmap: {
        title: "Tus peticiones primero",
        body: "Las funciones que pide tu equipo pasan al principio de nuestra lista.",
      },
      managed: {
        title: "Totalmente gestionado",
        body: "Nosotros lo alojamos y publicamos las actualizaciones, así que no tienes que ejecutar nada.",
      },
      billing: {
        title: "Facturación anual",
        body: "Paga una vez al año, a un precio acordado para tu empresa.",
      },
      support: {
        title: "Línea directa con nosotros",
        body: "Las preguntas llegan directamente a quienes construyen CaptureFlow.",
      },
    },
    everythingHeading: "Todo lo que recibe tu equipo",
    comingSoon: "Próximamente",
    everything: {
      extension: {
        title: "Extensión de Chrome",
        body: "Graba cualquier pestaña o pantalla, con un enlace listo al terminar.",
      },
      mac: {
        title: "App para Mac",
        body: "Un grabador nativo para macOS, con los mismos enlaces para compartir al instante.",
      },
      workspaces: {
        title: "Espacios de trabajo de equipo",
        body: "Las grabaciones de todos en un solo lugar, compartidas o privadas.",
      },
      feedback: {
        title: "Comentarios y reacciones",
        body: "Quienes ven el video responden en la línea de tiempo, en el momento exacto al que se refieren.",
      },
      edit: {
        title: "Edita después de compartir",
        body: "Cambia el fondo, la cámara o el audio, y el enlace sigue siendo el mismo.",
      },
      screenshots: {
        title: "Capturas de pantalla anotadas",
        body: "Marca una captura de pantalla con flechas, texto y desenfoque, y compártela como un enlace.",
      },
    },
    formHeading: "Contáctanos",
    formSubheading: "Cuéntanos sobre tu equipo y te responderemos por correo.",
    form: {
      company: "Empresa",
      companyPlaceholder: "Acme S.A.",
      name: "Tu nombre",
      namePlaceholder: "Ana García",
      email: "Correo de trabajo",
      emailPlaceholder: "ana@acme.com",
      need: "¿Qué necesitas?",
      needs: [
        "Licencias para un equipo grande",
        "Condiciones a medida o una sola factura",
        "Otra cosa",
      ],
      teamSize: "Tamaño del equipo",
      teamSizes: ["1–10", "11–50", "51–200", "200+"],
      storage: "¿Cuánto almacenamiento?",
      storageOptions: ["1–5 TB", "5–20 TB", "Más de 20 TB", "No lo sé"],
      notes: "¿Algo más que debamos saber?",
      notesPlaceholder:
        "Cuánto graba tu equipo, tus plazos, necesidades de facturación…",
      submit: "Enviar mensaje",
      error:
        "No se pudo enviar tu mensaje. Inténtalo de nuevo o escríbenos a {email}.",
      sentTitle: "Mensaje enviado",
      sentBody: "Gracias. Te responderemos a {email}.",
      back: "Volver al inicio",
    },
  },
  pricing: {
    heading: "Precios",
    cta: "Comparar todos los planes",
    subheading:
      "El plan Gratis cubre tus primeras grabaciones. Los planes de pago tienen un precio por miembro.",
    controls: {
      shownIn:
        "Los precios se muestran en {currency}. El cobro se hace en dólares estadounidenses.",
      teamSize: "Tamaño del equipo",
      members: "miembros",
      title: "Facturación",
      note: "Un precio por miembro.",
      billing: "Pago",
      monthly: "Mensual",
      annually: "Anual",
      save: "Ahorra {percent}%",
    },
    compare: {
      loomRow: "Loom {plan}",
      loomDetail: "{seats} personas × {perSeat} cada una",
      caption: "Precios mensuales.",
      captureflowRow: "CaptureFlow {ourPlan}",
      captureflowDetail: "{seats} miembros × {ourPerSeat} cada uno",
      saveLabel: "Tu equipo ahorra",
      saveValue: "{savings} al año",
    },
    plans: {
      chargedInUsd: "Se cobra en dólares estadounidenses.",
      member: "miembro",
      members: "miembros",
      included: "Incluido",
      notIncluded: "No incluido",
      free: {
        name: "Gratis",
        description: "Grabaciones de pantalla que compartes como un enlace.",
        cta: "Regístrate",
      },
      light: {
        name: LIGHT,
        featuresHeading: "Todo lo de Gratis, y además",
        features: [
          "Grabaciones ilimitadas",
          "Tiempo de grabación ilimitado",
          `${LIGHT_AGENT_MIN} min al mes de grabaciones de agente en la nube, de hasta 10 min cada una`,
        ],
        description: "Grabaciones ilimitadas en calidad de ahorro de datos.",
        period: "/mes",
        noteMonthly: "Por miembro, con facturación mensual",
        noteAnnual:
          "Por miembro, con facturación anual. {yearly} al año por {seats} {members}",
        cta: "Probar gratis",
      },
      pro: {
        badge: "Recomendado",
        name: PRO,
        featuresHeading: `Todo lo de ${LIGHT}, y además`,
        features: [
          "Calidad completa, hasta 1080p",
          "Capítulos y títulos con IA y eliminación de muletillas",
          "Marca personalizada",
          `${PRO_AGENT_MIN} min al mes de grabaciones de agente en la nube, con ${PRO_VOICEOVER_MIN} min de voz en off con IA`,
          "Estadísticas de espectadores (próximamente)",
          "Integraciones con Slack, Notion y Zapier (próximamente)",
        ],
        description: "Calidad completa, limpieza con IA y tu propia marca.",
        period: "/mes",
        noteMonthly: "Por miembro, con facturación mensual",
        noteAnnual:
          "Por miembro, con facturación anual. {yearly} al año por {seats} {members}",
        cta: "Probar gratis",
      },
      rows: {
        recordings: {
          label: "Grabaciones por persona",
          free: "Hasta {recordings}",
          light: "Ilimitadas",
          pro: "Ilimitadas",
        },
        length: {
          label: "Duración de la grabación",
          free: "{minutes} min por video",
          light: "Ilimitada",
          pro: "Ilimitada",
        },
        quality: {
          label: "Calidad de video",
          free: "Ahorro de datos",
          light: "Ahorro de datos",
          pro: "Hasta 1080p",
        },
        transcripts: {
          label: "Transcripciones y subtítulos",
          free: true,
          light: true,
          pro: true,
        },
        editing: {
          label: "Edición desde la transcripción",
          free: true,
          light: true,
          pro: true,
        },
        chapters: {
          label: "Capítulos y títulos con IA",
          free: false,
          light: false,
          pro: true,
        },
        filler: {
          label: "Eliminación de muletillas",
          free: false,
          light: false,
          pro: true,
        },
        feedback: {
          label: "Comentarios y reacciones",
          free: true,
          light: true,
          pro: true,
        },
        agents: {
          label: "Grabaciones de agente locales",
          free: true,
          light: true,
          pro: true,
        },
        cloudAgents: {
          label: "Grabaciones de agente en la nube",
          free: `${FREE_AGENT_MIN} min al mes`,
          light: `${LIGHT_AGENT_MIN} min al mes`,
          pro: `${PRO_AGENT_MIN} min al mes`,
        },
        voiceover: {
          label: "Voz en off con IA local",
          free: true,
          light: true,
          pro: true,
        },
        cloudVoiceover: {
          label: "Voz en off con IA en la nube",
          free: false,
          light: false,
          pro: `${PRO_VOICEOVER_MIN} min al mes`,
        },
        branding: {
          label: "Marca personalizada",
          free: false,
          light: false,
          pro: true,
        },
      },
    },
    table: {
      heading: "Todas las funciones, plan por plan",
      subtitle: "Gratis, Light y Pro, lado a lado.",
      groups: [
        {
          title: "Grabación",
          rows: [
            {
              label: "Miembros",
              free: "Ilimitados",
              light: "Ilimitados",
              pro: "Ilimitados",
            },
            {
              label: "Grabaciones por persona",
              free: "Hasta {recordings}",
              light: "Ilimitadas",
              pro: "Ilimitadas",
            },
            {
              label: "Duración de la grabación",
              free: "{minutes} min por video",
              light: "Ilimitada",
              pro: "Ilimitada",
            },
            {
              label: "Calidad de video",
              free: "Ahorro de datos",
              light: "Ahorro de datos",
              pro: "Hasta 1080p",
            },
            {
              label: "Capturas de pantalla",
              free: "Ilimitadas",
              light: "Ilimitadas",
              pro: "Ilimitadas",
            },
            {
              label: "Conservación de las grabaciones",
              free: "30 días sin visualizaciones",
              light: "Hasta que las elimines",
              pro: "Hasta que las elimines",
            },
            {
              label: "Grabación de pantalla completa, ventana o pestaña",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Burbuja de cámara y efectos de cámara",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Micrófono y audio del sistema",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Cursor suavizado",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Extensión de Chrome y app para Mac",
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
              label: "Transcripciones",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Subtítulos",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Capítulos de resumen",
              free: false,
              light: false,
              pro: true,
            },
            {
              label: "Títulos sugeridos automáticamente",
              free: false,
              light: false,
              pro: true,
            },
            {
              label: "Edita el video desde su transcripción",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Eliminación de muletillas",
              free: false,
              light: false,
              pro: true,
            },
          ],
        },
        {
          title: "Agentes",
          rows: [
            {
              label: "Grabaciones de agente en tu computadora",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Presentaciones de agente creadas en la nube",
              free: `${FREE_AGENT_MIN} min al mes por persona`,
              light: `${LIGHT_AGENT_MIN} min al mes por miembro`,
              pro: `${PRO_AGENT_MIN} min al mes por miembro`,
            },
            {
              label: "Diapositivas en las grabaciones de agente",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Voz en off con IA en tu computadora",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Voz en off con IA en presentaciones en la nube",
              free: false,
              light: false,
              pro: `${PRO_VOICEOVER_MIN} min al mes por miembro`,
            },
          ],
        },
        {
          title: "Edición",
          rows: [
            {
              label: "Edita después de compartir, mismo enlace",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Fondos",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Mueve o redimensiona la burbuja de cámara",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Corta partes del video",
              free: true,
              light: true,
              pro: true,
            },
            {
              label:
                "Capturas de pantalla anotadas con flechas, texto y desenfoque",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Lienzo infinito",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "Compartir y comentarios",
          rows: [
            {
              label: "Enlace para compartir listo al terminar",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Enlaces públicos, de espacio de trabajo o privados",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Solicitud de acceso en enlaces restringidos",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Vistas previas del enlace en chats y correos",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Inserta el reproductor en cualquier lugar",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Se reproduce dentro de issues y pull requests de GitHub",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Comentarios en la línea de tiempo",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Reacciones con emojis",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Número de visualizaciones",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Descarga del archivo original",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "Espacio de trabajo y administración",
          rows: [
            {
              label: "Espacio de trabajo de equipo",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Roles de propietario, miembro y espectador",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Visibilidad predeterminada y permisos de subida",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Búsqueda en grabaciones y capturas de pantalla",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Marca personalizada",
              free: false,
              light: false,
              pro: true,
            },
          ],
        },
        {
          title: "Alojamiento y soporte",
          rows: [
            {
              label: "Código abierto bajo la AGPL",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Autoalojamiento en tu propia cuenta de Cloudflare",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Alojamiento gestionado y actualizaciones",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
      ],
    },
    includes: {
      heading: "Todos los planes incluyen",
      items: [
        "Tu propio espacio de trabajo, invita a quien quieras",
        "Efectos de cámara",
        "Transcripciones y subtítulos con IA",
        "Edita el video desde su transcripción",
        "Enlaces para compartir públicos, de espacio de trabajo o privados",
        "Comentarios y reacciones con emojis",
        "Capturas de pantalla anotadas",
        "Lienzo infinito",
      ],
    },
    annual: {
      badgePro: "Gestionado",
      badgeCycle: "Anual",
      title: "Alojamiento gestionado",
      subtitle: "Totalmente alojado, con facturación anual.",
      period: "/mes",
      note: "Se factura {amount}/año. Cancela cuando quieras.",
      cta: "Empezar",
    },
  },
  activity: {
    heading: "Últimos cambios en GitHub",
    subtitle:
      "Todos los cambios son públicos. Estos son los últimos pull requests e issues abiertos en GitHub.",
    cta: "Ver en GitHub",
    shippedHeading: "Fusionados recientemente",
    openHeading: "Issues y pull requests abiertos",
    emptyOpen: "No hay nada abierto ahora mismo.",
    newIssue: "Informa de un error o solicita una función",
    viewAll: "Ver todo en GitHub",
  },
  faq: {
    heading: "Preguntas frecuentes",
    subtitle:
      "Respuestas sobre grabación, precios, almacenamiento y autoalojamiento. Consulta la documentación para todo lo demás.",
    cta: "Leer la documentación",
    waitlistLink: "Únete a la lista de espera",
    items: [
      {
        question: "¿Cómo hago una grabación?",
        answer:
          "Hay dos formas, y la diferencia está en quién graba.\n\nCon la extensión de Chrome, grabas tú. Recorres tu pantalla y puedes hablar por encima con tu propia voz y tu cámara. Úsala para novedades rápidas, comentarios o cualquier cosa en la que tengas que aparecer tú.\n\nCon un agente de IA, describes el video y el agente recorre la pantalla y lo graba por ti, así que puedes seguir trabajando. Puede añadir diapositivas y una voz en off con IA. Úsalo para demos de producto, tutoriales e informes de errores.\n\nPara grabarlo por tu cuenta:\n1. Instala la extensión de CaptureFlow desde Chrome Web Store.\n2. Haz clic en su icono en la barra de herramientas del navegador e inicia sesión.\n3. Vuelve a hacer clic en el icono. Elige «This tab», «Window» o «Full screen», y activa la cámara y el micrófono si los quieres.\n4. Haz clic en «Start Recording». Una barra en la página te permite pausar o detener la grabación.\n5. Haz clic en detener. Se abre la página de tu grabación, con un enlace que puedes compartir con cualquiera.\n\nPara que lo grabe un agente:\n1. Conecta CaptureFlow a la app de IA que uses. La sección de agentes de la página de inicio tiene los pasos para Claude, ChatGPT, Claude Code, Codex y Cursor.\n2. Inicia sesión cuando se abra una pestaña del navegador. Solo lo haces una vez.\n3. Pide el video con palabras sencillas, por ejemplo: Graba una demo de cómo registrarse en nuestro sitio web, con voz en off.\n4. El agente lo graba y te da un enlace que puedes compartir con cualquiera.",
      },
      {
        question: "¿Puedo autoalojar CaptureFlow?",
        answer:
          "Sí. CaptureFlow es de código abierto bajo la AGPL, y todo el backend se ejecuta en Cloudflare: Workers para la app y la API, R2 para las grabaciones y D1 para todo lo demás. Crea una base de datos D1 y un bucket de R2, aplica las migraciones, define un secreto y despliega. También hay un botón «Deploy to Cloudflare». La guía está en docs.captureflow.dev.",
      },
      {
        question: "¿Puede mi agente de IA grabar videos por mí?",
        answer:
          "Sí. Añade CaptureFlow a Claude Code, Codex o Cursor con una sola línea, o añádelo en Claude o ChatGPT, y luego pide un video con palabras sencillas. Graba un navegador, tu pantalla o una app en tu propia computadora, añade diapositivas y voz en off si quieres, y te da un enlace para compartir.\n\nLas grabaciones de agente locales están incluidas en todos los planes. Las grabaciones de agente en la nube tienen una cuota mensual que depende de tu plan.",
      },
      {
        question: "¿Cómo funcionan los precios de los planes de pago?",
        answer: `${LIGHT} y ${PRO} tienen un precio por miembro al mes, más bajo con facturación anual. Un miembro es alguien que graba, así que solo pagas por las personas que hacen grabaciones.\n\nCuando alguien se une o se va, el número de licencias se ajusta en la siguiente factura.`,
      },
      {
        question: "¿Cuánto tiempo se conservan mis grabaciones?",
        answer:
          "En los planes de pago, hasta que las elimines. En el plan Gratis, una grabación se elimina tras 30 días sin visualizaciones, para que las cuentas inactivas no ocupen espacio. Si lo autoalojas, tú pones las reglas.",
      },
      {
        question: "¿Qué incluye el plan Gratis?",
        answer: `Tienes 25 grabaciones por persona, de hasta 5 minutos cada una, en calidad de ahorro de datos, con transcripciones y subtítulos. Las grabaciones se eliminan tras 30 días sin visualizaciones. Regístrate, instala la extensión de Chrome y empieza a grabar.\n\n${LIGHT} elimina los límites por un precio por miembro y conserva las grabaciones hasta que las elimines.`,
      },
    ],
  },
  cta: {
    headline: "Empieza a grabar",
    subtitle:
      "Descarga gratuita. Sin tarjeta de crédito. Dilo con un mensaje de video rápido en lugar de otra reunión.",
    button: "Prueba CaptureFlow gratis",
  },
  footer: {
    tagline:
      "Grabación de pantalla de código abierto con enlaces para compartir al instante.",
    lights: "Luces",
    lightsOn: "Encendidas · tira del cordón",
    lightsOff: "Apagadas · tira del cordón",
    product: {
      title: "Producto",
      features: "Funciones",
      pricing: "Precios",
      compare: "Comparar",
      download: "Descargar",
      suggest: "Sugerir una función",
    },
    resources: {
      title: "Recursos",
      docs: "Documentación",
      selfHosting: "Autoalojamiento",
      blog: "Blog",
      releases: "Versiones",
      faq: "FAQ",
      security: "Seguridad",
    },
    community: {
      title: "Comunidad",
    },
    legal: {
      title: "Legal",
      privacy: "Política de privacidad",
      terms: "Términos del servicio",
      refund: "Política de reembolsos",
      license: "Licencia (AGPL-3.0)",
    },
    rights: "© {year} CaptureFlow. Todos los derechos reservados.",
    openSource: "Código abierto bajo AGPL-3.0",
  },
  pageShell: {
    logoAlt: "CaptureFlow",
    backToHome: "Volver al inicio",
  },
  waitlist: {
    errors: {
      joinFailed:
        "No pudimos añadirte a la lista de espera. Inténtalo de nuevo.",
      network: "Error de red. Inténtalo de nuevo.",
    },
    success: "Estás en la lista. Te escribiré cuando CaptureFlow esté listo.",
    emailPlaceholder: "tu@example.com",
    buttonLoading: "Uniéndote…",
    buttonDefault: "Unirme a la lista de espera",
    earlyAccessPrompt: "¿Quieres acceso anticipado?",
    earlyAccessLink: "Únete como beta tester",
  },
  download: {
    heading: "Descarga CaptureFlow",
    subtitle:
      "Disponible para Chrome, con una app para macOS próximamente. Cada grabación recibe un enlace que puedes compartir.",
    button: "Descargar para macOS",
    requires: "Requiere {version} o posterior en Apple Silicon.",
    requirements: "Requiere macOS 14 o posterior en Apple Silicon.",
    versionLabel: "Versión {version}",
    sizeLabel: "DMG de {size} MB",
    notarized: "Firmado y notarizado por Apple",
  },
  downloadPage: {
    otherWays: "Otras formas de obtenerlo",
    buildTitle: "Compilar desde el código fuente",
    buildBody: "Clona el repositorio y ejecuta el grabador en local con pnpm.",
    releasesTitle: "Todas las versiones",
    releasesBody:
      "Consulta en GitHub cada compilación publicada y su registro de cambios.",
    cloud: "¿Prefieres la nube? {link} y mira tus grabaciones en el navegador.",
    cloudLink: "Crea una cuenta",
  },
  blog: {
    title: "Blog",
    subtitle: "Consejos, guías y novedades sobre grabación de pantalla.",
    readArticle: "Leer artículo",
    empty: "Aún no hay publicaciones. Vuelve pronto.",
  },
};

export default messages;

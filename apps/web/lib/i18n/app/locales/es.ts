import type { AppMessages } from "../messages";

const messages: AppMessages = {
  common: {
    cancel: "Cancelar",
    save: "Guardar",
    saving: "Guardando…",
    delete: "Eliminar",
    deleting: "Eliminando…",
    remove: "Quitar",
    close: "Cerrar",
    back: "Atrás",
    continue: "Continuar",
    confirm: "Confirmar",
    done: "Listo",
    edit: "Editar",
    copy: "Copiar",
    copied: "Copiado",
    search: "Buscar",
    loading: "Cargando…",
    retry: "Reintentar",
    learnMore: "Más información",
    language: "Idioma",
    themeToLight: "Cambiar a tema claro",
    themeToDark: "Cambiar a tema oscuro",
    somethingWrong: "Algo salió mal. Inténtalo de nuevo.",
    pageFailed: "Esta página no se pudo cargar.",
    partFailed: "Esta parte no se pudo cargar.",
    failedBody: "Algo salió mal. Inténtalo de nuevo o recarga la página.",
    reload: "Recargar página",
  },
  auth: {
    signedInAs: "Sesión iniciada como {email}.",
    errors: {
      generic: "Algo salió mal. Inténtalo de nuevo.",
      network: "Error de red. Inténtalo de nuevo.",
    },
    login: {
      metaTitle: "Iniciar sesión",
      signInTitle: "Hola de nuevo",
      signInDescription: "Inicia sesión con Google, GitHub o tu correo",
      signUpTitle: "Crea tu cuenta",
      signUpDescription: "Regístrate con Google, GitHub o tu correo",
      inviteTitle: "Únete a {workspace}",
      inviteDescription:
        "{inviter} te invitó. Inicia sesión o crea una cuenta con {email} para aceptar.",
      continueWith: "Continuar con {provider}",
      or: "O",
      emailLabel: "Correo electrónico",
      emailPlaceholder: "you@example.com",
      emailInvalid: "Escribe un correo válido.",
      continueWithEmail: "Continuar con correo electrónico",
      askForInvite:
        "¿Necesitas una cuenta? Pídele una invitación a un administrador.",
      haveAccount: "¿Ya tienes una cuenta? {action}",
      haveAccountAction: "Inicia sesión",
      noAccount: "¿No tienes una cuenta? {action}",
      noAccountAction: "Regístrate",
      changeEmail: "Cambiar",
      nameLabel: "Nombre",
      namePlaceholder: "Tu nombre",
      passwordLabel: "Contraseña",
      newPasswordPlaceholder: "Al menos 12 caracteres",
      passwordTooShort: "Usa al menos 12 caracteres.",
      passwordMissing: "Escribe tu contraseña.",
      signInSubmit: "Iniciar sesión",
      signUpSubmit: "Crear cuenta",
      terms: "Al continuar, aceptas nuestros {terms} y nuestra {privacy}.",
      termsLink: "Términos",
      privacyLink: "Política de privacidad",
    },
    verify: {
      title: "Revisa tu correo",
      description:
        "Enviamos un enlace a {email}. Ábrelo para terminar de configurar tu cuenta.",
      resend: "Reenviar correo",
      resent: "Reenviado",
      resendFailed: "No se pudo enviar el correo. Inténtalo de nuevo.",
      wrongAddress: "¿Dirección incorrecta? {action}",
      wrongAddressAction: "Usa otro correo",
    },
    oauthErrors: {
      unfinished: "El inicio de sesión no se completó. Inténtalo de nuevo.",
      inviteOnly:
        "Este CaptureFlow es solo por invitación. Pídele una invitación a un administrador.",
      allowedDomains:
        "Regístrate con una dirección de {domains} o pídele una invitación a un administrador.",
      providerDomains:
        "Regístrate con una cuenta de Google o GitHub de {domains}.",
      domainChoice: "{first} o {second}",
    },
    inviteFallbacks: {
      workspace: "un espacio de trabajo de CaptureFlow",
      inviter: "Alguien de tu equipo",
    },
    setPassword: {
      title: "Establece tu contraseña",
      description:
        "Elige una contraseña para {email}. Después se iniciará tu sesión.",
      passwordLabel: "Nueva contraseña",
      passwordPlaceholder: "Al menos 12 caracteres",
      submit: "Guardar contraseña",
      expiredTitle: "Este enlace ya no funciona",
      expiredDescription:
        "Ya se usó o expiró. Pídele uno nuevo a un administrador.",
      goToSignIn: "Ir al inicio de sesión",
    },
    invite: {
      title: "Tienes una invitación",
      asViewer:
        "Te invitaron a unirte a {workspace} en CaptureFlow como espectador: puedes ver y comentar todo lo que se comparte ahí.",
      asMember:
        "Te invitaron a unirte a {workspace} en CaptureFlow como miembro: puedes grabar en él y compartir con el equipo.",
      accept: "Aceptar invitación",
      databaseUnavailable: "Base de datos no disponible",
      invalidTitle: "La invitación ya no es válida",
      invalidBody:
        "Este enlace expiró o ya se usó. Pídele al propietario del espacio de trabajo que envíe una nueva invitación.",
      wrongAccountTitle: "Cuenta incorrecta",
      wrongAccountBody:
        "Esta invitación se envió a {invited}, pero iniciaste sesión como {current}. Cierra sesión e inicia sesión con la dirección invitada para aceptar.",
      goToDashboard: "Ir al panel",
      signOut: "Cerrar sesión",
    },
    handoff: {
      signingIn: "Iniciando sesión…",
      returning: "Volviendo a CaptureFlow…",
      open: "Abrir CaptureFlow",
      hint: "Si no pasa nada, haz clic en el botón de arriba. Puedes cerrar esta pestaña cuando la app de escritorio se vuelva a abrir.",
      extensionDone:
        "Sesión iniciada como {email}. Puedes cerrar esta pestaña.",
      extensionUnreachable:
        "No se pudo conectar con la extensión de CaptureFlow. Comprueba que esté instalada y haz clic en su icono para intentarlo de nuevo.",
      extensionUnverified:
        "No se pudo verificar la extensión. Reinstálala e inténtalo de nuevo.",
    },
  },
  shell: {
    record: {
      newRecording: "Nueva grabación",
    },
    nav: {
      toggleSidebar: "Mostrar u ocultar barra lateral",
      dashboard: "Panel",
      recordings: "Grabaciones",
      screenshots: "Capturas de pantalla",
      canvas: "Lienzo",
      workspaceGroup: "Espacio de trabajo",
      members: "Miembros",
      settings: "Configuración",
      personal: "Personal",
      workspace: "Espacio de trabajo",
      billing: "Facturación",
      admin: "Administración",
    },
    upgradeCard: {
      title: "Mejora tu espacio de trabajo",
      description:
        "El plan Gratis incluye {recordings} grabaciones por persona en calidad de ahorro de datos. Los planes de pago eliminan los límites, desde {price} por miembro.",
      viewPlans: "Ver planes",
    },
    topBar: {
      upgrade: "Mejorar plan",
    },
    workspaceSwitcher: {
      switchWorkspace: "Cambiar de espacio de trabajo",
      summary:
        "one:Predeterminado · {n} miembro|other:Predeterminado · {n} miembros",
      workspaces: "Espacios de trabajo",
      owned: "Es tuyo",
      joined: "Te uniste",
      newWorkspace: "Nuevo espacio de trabajo",
      inviteMembers: "Invitar miembros",
    },
    drawer: {
      open: "Abrir menú del espacio de trabajo",
      title: "Menú del espacio de trabajo",
    },
    search: {
      prompt: "Busca en tus grabaciones y capturas de pantalla",
      clear: "Borrar búsqueda",
      results: "Resultados de búsqueda",
      hint: "Busca tus grabaciones y capturas de pantalla por título.",
      noMatches: "Sin resultados",
      kind: {
        recording: "grabación",
        screenshot: "captura de pantalla",
      },
    },
    account: {
      menu: "Menú de la cuenta",
      nav: {
        billing: "Facturación",
        devices: "Dispositivos conectados",
        settings: "Configuración",
        support: "Contactar con soporte",
      },
      freePlan: "Gratis",
      signOut: "Cerrar sesión",
      signingOut: "Cerrando sesión…",
    },
    theme: {
      label: "Tema",
      light: "Claro",
      dark: "Oscuro",
      system: "Sistema",
    },
    notifications: {
      title: "Notificaciones",
      subtitle: "Invitaciones y cambios en tus espacios de trabajo.",
      bellUnread: "other:Notificaciones, {n} sin leer",
      viewAll: "Ver todas",
      menuEmpty:
        "Estás al día. Las invitaciones, los nuevos compañeros de equipo y los cambios de rol aparecen aquí.",
      pageEmpty:
        "Estás al día. Cuando alguien te invite, se una a tu espacio de trabajo o cambie tu rol, lo verás aquí.",
      accept: "Aceptar",
      decline: "Rechazar",
      unread: "Sin leer",
      someone: "Alguien",
      message: {
        invited: {
          member: "{actor} te invitó a unirte a {workspace} como miembro",
          viewer: "{actor} te invitó a unirte a {workspace} como espectador",
        },
        joined: {
          member: "{actor} se unió a {workspace} como miembro",
          viewer: "{actor} se unió a {workspace} como espectador",
        },
        seatRequested: "{actor} pidió una licencia de pago en {workspace}",
        seatDenied: "{actor} rechazó tu solicitud de licencia en {workspace}",
        roleChanged: {
          member: "{actor} te hizo miembro en {workspace}",
          viewer: "{actor} te hizo espectador en {workspace}",
        },
        downgraded: "{actor} te pasó a espectador en {workspace}",
        keepRecordingUntil: "Puedes seguir grabando hasta el {date}.",
        removed: "{actor} te quitó de {workspace}",
      },
      acceptErrors: {
        failed: "No se pudo aceptar la invitación",
        signedOut: "Inicia sesión para aceptar",
        invalid: "Esta invitación expiró o fue retirada",
        emailMismatch: "Esta invitación es para otra dirección de correo",
        alreadyMember: "Ya estás en este espacio de trabajo",
      },
    },
    mobileNav: {
      open: "Abrir menú",
      close: "Cerrar menú",
      docs: "Documentación",
      star: "Dar estrella en GitHub",
      signIn: "Iniciar sesión",
      getStarted: "Empezar",
    },
    skeletons: {
      avatar: "Avatar",
      workspaceName: "Nombre del espacio de trabajo",
      workspaceLogo: "Logo del espacio de trabajo",
    },
  },
  library: {
    dashboard: {
      welcome: "Hola de nuevo",
      welcomeName: "Hola de nuevo, {name}",
      openCanvas: "Abrir el lienzo",
      newRecording: "Nueva grabación",
      stats: {
        recordings: "Grabaciones",
        plusScreenshots:
          "one:Y {count} captura de pantalla|other:Y {count} capturas de pantalla",
        noScreenshots: "Aún no hay capturas de pantalla",
        views: "Visualizaciones",
        viewsAverage: "{count} por grabación en promedio",
        noViews: "Aún no hay visualizaciones",
        recorded: "Grabado",
        recordedAverage: "{duration} por grabación en promedio",
        nothingRecorded: "Aún no hay nada grabado",
        recordingsLeft: "Grabaciones restantes",
        leftOfAllowance: "{left} de {allowance}",
        freePlanLimit: "Plan Gratis, hasta {minutes} min cada una",
      },
      recordedTime: {
        minutes: "{minutes} min",
        hours: "{hours} h",
        hoursMinutes: "{hours} h {minutes} min",
      },
      recent: {
        title: "Grabaciones recientes",
        all: "Todas las grabaciones",
        empty: "Aún no se ha compartido nada en este espacio de trabajo.",
        views: "one:{n} visualización|other:{n} visualizaciones",
        comments: "one:{n} comentario|other:{n} comentarios",
        reactions: "one:{n} reacción|other:{n} reacciones",
      },
      start: {
        title: "Empieza a grabar con {product}",
        surfacesLabel: "Dónde grabar",
        surfaces: {
          extension: "Extensión",
          desktop: "App de escritorio",
          canvas: "Lienzo",
        },
        extension: {
          description:
            "Graba cualquier pestaña, ventana o toda tu pantalla desde la barra de herramientas y recibe un enlace que puedes compartir con cualquiera.",
          record: "Grabar ahora",
          addToChrome: "Añadir a Chrome",
        },
        desktop: {
          description:
            "Una app nativa para Mac que graba tu pantalla y tu cámara con el audio del sistema está en camino. Hasta entonces, la extensión graba cualquier pestaña, ventana o toda tu pantalla.",
          download: "Descargar para Mac",
          comingSoon: "Próximamente",
        },
        canvas: {
          description:
            "Un tablero en blanco con lápices, formas y texto para dibujar mientras grabas, cuando no hay ninguna página que mostrar.",
        },
      },
    },
    recording: {
      pageTitle: "Grabaciones",
      count: "one:{n} grabación|other:{n} grabaciones",
      untitled: "Grabación sin título",
      aiGenerated: "Generado con IA",
      processing: "Procesando",
      noMatches: "Ninguna grabación coincide con estos filtros.",
      empty:
        "Aún no has creado ningún enlace de grabación. Graba con la app de escritorio de CaptureFlow y tus grabaciones aparecerán aquí.",
      selectAll: "Seleccionar todas las grabaciones",
      selected:
        "one:{n} grabación seleccionada|other:{n} grabaciones seleccionadas",
      open: "Abrir grabación",
      edit: "Editar grabación",
      share: "Compartir grabación",
      delete: "Eliminar grabación",
      deleteTitle: "¿Eliminar esta grabación?",
      deleteDescription:
        "El video y su enlace dejan de funcionar de inmediato. Esta acción no se puede deshacer.",
      deleteSelectedTitle:
        "one:¿Eliminar {n} grabación?|other:¿Eliminar {n} grabaciones?",
    },
    screenshot: {
      pageTitle: "Capturas de pantalla",
      count: "one:{n} captura de pantalla|other:{n} capturas de pantalla",
      untitled: "Captura de pantalla sin título",
      numbered: "Captura de pantalla {id}",
      noMatches: "Ninguna captura de pantalla coincide con estos filtros.",
      empty:
        "Aún no hay capturas de pantalla. Abre CaptureFlow → pestaña «Screenshot» → elige «Display», «Window» o «Area» para capturar. Tu captura de pantalla aparece aquí automáticamente.",
      selectAll: "Seleccionar todas las capturas de pantalla",
      selected:
        "one:{n} captura de pantalla seleccionada|other:{n} capturas de pantalla seleccionadas",
      open: "Abrir captura de pantalla",
      edit: "Editar captura de pantalla",
      share: "Compartir captura de pantalla",
      delete: "Eliminar captura de pantalla",
      deleteTitle: "¿Eliminar esta captura de pantalla?",
      deleteDescription:
        "La imagen y su enlace dejan de funcionar de inmediato. Esta acción no se puede deshacer.",
      deleteSelectedTitle:
        "one:¿Eliminar {n} captura de pantalla?|other:¿Eliminar {n} capturas de pantalla?",
    },
    filters: {
      access: "Acceso",
      sort: "Ordenar",
      current: "{label}: {value}",
      accessOptions: {
        all: "Cualquier acceso",
        public: "Público",
        workspace: "Espacio de trabajo",
        private: "Privado",
      },
      sortOptions: {
        newest: "De más recientes a más antiguas",
        oldest: "De más antiguas a más recientes",
        views: "Más vistas",
      },
    },
    card: {
      select: "Seleccionar {title}",
      moreActions: "Más acciones",
      rename: "Cambiar nombre",
      unknownAuthor: "Desconocido",
    },
    selection: {
      deleteDescription: "Sus enlaces dejan de funcionar de inmediato.",
      deleteFailed:
        "No se pudieron eliminar {failed} de {count}. El resto ya se eliminó.",
      clear: "Deseleccionar",
    },
    pager: {
      label: "Páginas",
      previous: "Página anterior",
      next: "Página siguiente",
    },
    visibility: {
      label: "Visibilidad",
      labels: {
        public: "Público",
        workspace: "Espacio de trabajo",
        private: "Privado",
      },
      descriptions: {
        public: "Cualquiera con el enlace puede verlo",
        workspace:
          "Solo pueden verlo los miembros del espacio de trabajo con sesión iniciada",
        private: "Solo tú puedes verlo",
      },
      workspaceNamed: "Espacio de trabajo · {name}",
    },
    share: {
      title: "Compartir",
      embed: "Insertar",
      embedPublic: "Se reproduce en cualquier lugar donde se pegue el código.",
      embedRestricted:
        "Solo se reproduce para quienes ya pueden abrir el enlace.",
      copyCode: "Copiar código",
      generalAccess: "Acceso general",
      generalAccessCurrent: "Acceso general: {access}",
      copyLink: "Copiar enlace",
      linkCopied: "Enlace copiado",
      shareAt: "Compartir en {time}",
    },
    editableTitle: {
      label: "Título de la grabación",
      rename: "Cambiar nombre de la grabación",
    },
  },
  members: {
    title: "Miembros",
    databaseUnavailable: "Base de datos no disponible.",
    role: "Rol",
    status: "Estado",
    roles: {
      owner: "Administrador",
      member: "Miembro",
      viewer: "Espectador",
    },
    roleHints: {
      member: {
        does: "Graba en este espacio de trabajo.",
        costs: "Una licencia de pago en Light y Pro.",
      },
      viewer: {
        does: "Ve y comenta.",
        costs: "Siempre gratis.",
      },
    },
    statuses: {
      active: "Activo",
      invited: "Invitado",
    },
    seatSummary: {
      members: "one:{n} miembro|other:{n} miembros",
      viewers: "one:{n} espectador|other:{n} espectadores",
      paidSeats: "one:{n} licencia de pago|other:{n} licencias de pago",
      membersAndViewers: "{members} y {viewers}",
      onPaidSeats:
        "{people} con {seats}. Cada miembro ocupa una licencia; los espectadores son gratis.",
      membersFree: "{people}. Los miembros son gratis en este plan.",
      freePlan:
        "{people}. Plan Gratis: cada miembro tiene {recordings} grabaciones de hasta {minutes} minutos; los espectadores ven y comentan.",
      planTitle: "Plan {plan}",
      paidPlanTitle: "Plan de pago",
      freePlanTitle: "Plan Gratis",
      upgrade: "Mejorar espacio de trabajo",
    },
    table: {
      intro: "Los miembros graban aquí; los espectadores ven y comentan.",
      ownerIntro: "Como propietario, puedes invitar, quitar y cambiar roles.",
      searchPlaceholder: "Nombre o dirección de correo",
      searchLabel: "Buscar miembros",
      allRoles: "Todos los roles",
      everyone: "Todos",
      columns: {
        name: "Nombre",
        dateAdded: "Fecha de incorporación",
        email: "Dirección de correo",
        actions: "Acciones",
      },
      empty: "Nadie coincide con estos filtros.",
      downgradeNote: "Espectador a partir del {date} · {keep}",
      keepAsMember: "Mantener como miembro",
      revoke: "Revocar",
    },
    seatRequests: {
      title: "Solicitudes de licencia",
      description:
        "Estos espectadores pidieron grabar. Al aprobarlos, pasan a ser miembros.",
      descriptionPaid:
        "Estos espectadores pidieron grabar. Al aprobarlos, pasan a ser miembros, lo que añade una licencia de pago.",
      asked: "{email} · solicitado el {date}",
      deny: "Rechazar",
      approve: "Aprobar",
    },
    seatConfirm: {
      addTitle: "¿Dar a {name} una licencia de pago?",
      addBody:
        "Los miembros graban, así que cada uno ocupa una licencia de pago. Tu plan {plan} pasa de {seats} a {nextSeats} licencias, de {before} a {after} al mes.",
      addBodyYearly:
        "Los miembros graban, así que cada uno ocupa una licencia de pago. Tu plan {plan} pasa de {seats} a {nextSeats} licencias, de {before} a {after} al mes, con facturación anual.",
      addInvoice:
        "El resto de este periodo de facturación se añade a tu próxima factura.",
      addConfirm: "Añadir licencia de pago",
      removeTitle: "¿Pasar a {name} a espectador?",
      removeBody:
        "{name} sigue grabando hasta el {date}, el final del periodo que ya pagaste. Después pasa a ser espectador: puede ver y comentar, pero no grabar.",
      removePlan:
        "A partir de entonces, tu plan {plan} pasa de {seats} a {nextSeats} licencias, de {before} a {after} al mes.",
      removePlanYearly:
        "A partir de entonces, tu plan {plan} pasa de {seats} a {nextSeats} licencias, de {before} a {after} al mes, con facturación anual.",
      removeConfirm: "Pasar a espectador",
    },
    remove: {
      label: "Quitar a {name} del espacio de trabajo",
      title: "¿Quitar a {name} de {workspace}?",
      body: "Pierde el acceso de inmediato. Sus grabaciones y capturas de pantalla se quedan en el espacio de trabajo.",
      freesSeat:
        "Eso libera su licencia de pago: tu plan pasa de {seats} a {nextSeats} licencias.",
    },
    leave: {
      button: "Salir",
      title: "¿Salir de {workspace}?",
      body: "Perderás el acceso a sus grabaciones y capturas de pantalla. Todo lo que grabaste ahí se queda en el espacio de trabajo.",
      comeBack: "Para volver, alguien tendrá que invitarte de nuevo.",
      confirm: "Salir del espacio de trabajo",
    },
    invite: {
      trigger: "Invitar miembros",
      title: "Invitar miembros a {workspace}",
      titleOwnWorkspace: "Invitar miembros a tu espacio de trabajo",
      description:
        "Recibirán un correo con un enlace que expira en 7 días. Asegúrate de que inicien sesión con la misma dirección.",
      removeEmail: "Quitar {email}",
      addEmails: "Añadir correos",
      separatorHint: "Separa los correos con un espacio, una coma o Enter.",
      paidSeatNote:
        "Cada miembro que acepte añade una licencia de pago a tu plan {plan}, {price} al mes cada una. El resto de este periodo se carga en tu próxima factura.",
      noEmails: "Añade al menos un correo",
      invalidEmails: "Correo no válido: {emails}",
      failed: "Error",
      sent: "one:Se envió {n} invitación.|other:Se enviaron {n} invitaciones.",
      sending: "Enviando…",
      submit: "Enviar invitaciones",
    },
    actions: {
      emailRequired: "Escribe una dirección de correo",
      emailInvalid: "No parece un correo válido",
      ownWorkspace: "Ya estás en tu propio espacio de trabajo",
      alreadyMember: "Esa persona ya es miembro de este espacio de trabajo",
      emailNotSent:
        "Se creó la invitación, pero no se pudo enviar el correo. Copia el enlace de la lista de pendientes.",
      invitationSent: "Invitación enviada a {email}",
      alreadyRecording: "Ya puedes grabar aquí",
    },
  },
  settings: {
    saved: "Guardado",
    errors: {
      ownerOnly:
        "Solo el propietario del espacio de trabajo puede cambiar esto",
      databaseUnavailable: "Base de datos no disponible",
      saveFailed: "No se pudo guardar. Inténtalo de nuevo.",
    },
    upload: {
      uploading: "Subiendo…",
      missing: "Elige un archivo de imagen",
      failed: "Error al subir",
      failedReason: "Error al subir: {reason}",
    },
    personal: {
      title: "Configuración personal",
      account: {
        title: "Cuenta",
        description:
          "Cómo te ven tus compañeros de equipo y quienes ven tus grabaciones.",
      },
      preferences: {
        title: "Preferencias",
        description: "Cómo se ve y se lee CaptureFlow para ti.",
      },
      languageDescription: "El idioma en que CaptureFlow se te muestra.",
    },
    avatar: {
      label: "Avatar",
      change: "Cambiar avatar",
      removing: "Quitando…",
      hint: "JPG, PNG, WebP o GIF. Máximo 2 MB.",
      tooLarge: "El avatar debe pesar 2 MB o menos",
      badType: "El avatar debe ser PNG, JPEG, WebP o GIF",
    },
    account: {
      name: {
        label: "Nombre completo",
        placeholder: "Tu nombre",
        description:
          "Se muestra en grabaciones, capturas de pantalla y filas de actividad.",
        required: "El nombre es obligatorio.",
        updateFailed: "No se pudo actualizar el nombre.",
      },
      email: {
        label: "Dirección de correo",
        description:
          "Se usa para iniciar sesión. Contacta con soporte para cambiarla.",
      },
      userId: {
        label: "ID de usuario",
        copy: "Copiar ID de usuario",
        description: "Indícalo cuando contactes con soporte.",
      },
      saveChanges: "Guardar cambios",
    },
    workspace: {
      title: "Configuración del espacio de trabajo",
      tabs: {
        label: "Secciones de configuración",
        general: "General",
        security: "Seguridad",
      },
      general: {
        title: "General",
        description:
          "El nombre y el logo que identifican este espacio de trabajo en el selector, en la página de miembros y en las vistas previas al compartir.",
      },
      name: {
        title: "Nombre del espacio de trabajo",
        description: "El nombre con el que aparece tu espacio de trabajo.",
        empty: "El nombre del espacio de trabajo no puede estar vacío",
        tooLong:
          "El nombre del espacio de trabajo es demasiado largo (máx. {max} caracteres)",
      },
      logo: {
        title: "Logo del espacio de trabajo",
        description:
          "Se muestra junto al nombre de tu espacio de trabajo. PNG, JPEG, WebP, GIF o SVG, máximo 2 MB.",
        upload: "Subir logo",
        replace: "Reemplazar logo",
        tooLarge: "El logo debe pesar 2 MB o menos",
        badType: "El logo debe ser PNG, JPEG, WebP, GIF o SVG",
      },
      permissions: {
        title: "Permisos predeterminados",
        description:
          "Configuración que se aplica a cada grabación y captura de pantalla nueva del espacio de trabajo.",
      },
      recordingAccess: {
        title: "Acceso para grabar",
        description:
          "Decide si tus compañeros de equipo pueden publicar grabaciones y capturas de pantalla en este espacio de trabajo.",
        allow: {
          title: "Permitir que tus compañeros de equipo publiquen aquí",
          body: "Los miembros pueden grabar en este espacio de trabajo.",
        },
        ownerOnly: {
          title: "Solo el propietario del espacio de trabajo",
          body: "Lo que suben tus compañeros de equipo va a su espacio de trabajo personal.",
        },
      },
    },
    devices: {
      title: "Dispositivos conectados",
      count:
        "one:{n} dispositivo con sesión iniciada|other:{n} dispositivos con sesión iniciada",
      empty:
        "No hay dispositivos conectados. Abre la app de escritorio de CaptureFlow y haz clic en «Sign in» en la barra de grabación para vincular esta cuenta.",
      unlabelled: "Dispositivo sin nombre",
      added: "Añadido el {date}",
      addedLastUsed: "Añadido el {date} · último uso el {lastUsed}",
      neverUsed: "Nunca usado",
      revoke: {
        action: "Revocar",
        title: "¿Cerrar la sesión de este dispositivo?",
        description:
          "Tendrá que volver a iniciar sesión para gestionar grabaciones.",
      },
    },
  },
  billing: {
    chargedInUsd: "Se cobra en dólares estadounidenses.",
    shownIn:
      "Los precios se muestran en {currency}. El cobro se hace en dólares estadounidenses.",
    page: {
      title: "Facturación",
      subtitle: "Tu plan y lo que has usado de él.",
      workspaceLabel: "Espacio de trabajo · {name}",
      manageSubscription: "Gestionar suscripción",
      upgradeWorkspace: "Mejorar espacio de trabajo",
      storage: "Almacenamiento del espacio de trabajo",
      usedOfLimit: "{used} de {limit}",
      usedNoLimit: "{used}, sin límite",
    },
    loading: {
      plan: "Plan",
      usage: "Uso",
    },
    counts: {
      members: "one:{n} miembro|other:{n} miembros",
      paidSeats: "one:{n} licencia de pago|other:{n} licencias de pago",
      freeViewers: "one:{n} espectador gratis|other:{n} espectadores gratis",
    },
    plan: {
      free: "Gratis",
      paid: "De pago",
      billedMonthly: "Facturación mensual",
      billedYearly: "Facturación anual",
      freeSummary:
        "{members} · hasta {recordings} grabaciones por persona, de {minutes} minutos cada una, en calidad de ahorro de datos",
    },
    status: {
      onTrial: "Prueba",
      active: "Activo",
      paused: "En pausa",
      pastDue: "Pago fallido",
      unpaid: "Sin pagar",
      cancelled: "Cancelado",
      expired: "Vencido",
    },
    details: {
      youPay: "Pagas",
      amountPerMonth: "{amount} al mes",
      amountPerYear: "{amount} al año",
      seatsMonthly:
        "one:{n} licencia × {price} al mes|other:{n} licencias × {price} al mes",
      seatsYearly:
        "one:{n} licencia × {price} al mes, {total} al mes con facturación anual|other:{n} licencias × {price} al mes, {total} al mes con facturación anual",
      nextPayment: "Próximo pago",
      ends: "Termina",
      endOfPeriod: "Al final de este periodo",
      amountOnDate: "{amount} el {date}",
      firstPaymentPending: "Cuando se confirme el primer pago",
      estimate: "{base} · {change}, estimado",
      baseForSeats:
        "one:{amount} por {n} licencia|other:{amount} por {n} licencias",
      seatsAdded:
        "one:{amount} por {n} licencia añadida en este periodo|other:{amount} por {n} licencias añadidas en este periodo",
      seatsRemoved:
        "one:{amount} de crédito por {n} licencia quitada en este periodo|other:{amount} de crédito por {n} licencias quitadas en este periodo",
      seatChanges: "{amount} por cambios de licencias en este periodo",
      seats: "Licencias",
      seatsAndViewers: "{seats}, {viewers}",
      billedTo: "Facturado a",
      paymentMethod: "Método de pago",
      cardEnding: "{brand} terminada en {last4}",
      card: "Tarjeta",
      updateCard: "Actualizar",
    },
    switchPlan: {
      switchTo: "Cambiar a {plan}",
      title: "¿Cambiar a {plan}?",
      priceMonthly:
        "one:Tu {n} licencia pasa de {before} a {after} al mes.|other:Tus {n} licencias pasan de {before} a {after} al mes.",
      priceYearly:
        "one:Tu {n} licencia pasa de {before} a {after} al mes, con facturación anual.|other:Tus {n} licencias pasan de {before} a {after} al mes, con facturación anual.",
      benefits:
        "{plan} graba en todas las calidades hasta 60 fps y añade edición con IA.",
      timing:
        "Empieza ahora. La diferencia por el resto de este periodo de facturación se añade a tu próxima factura.",
      errors: {
        failed: "No se pudo cambiar el plan",
        unknownPlan: "Plan desconocido",
        billingUnavailable: "La facturación no está disponible",
        noSubscription:
          "Este espacio de trabajo no tiene una suscripción activa",
        cancelled: "Reanuda la suscripción antes de cambiar de plan",
        unavailable: "Los cambios de plan no están disponibles en este momento",
        rejected:
          "El sistema de facturación no aceptó el cambio. Inténtalo de nuevo.",
      },
    },
    upgrade: {
      title: "Mejorar {name}",
      billingCycle: "Ciclo de facturación",
      cycles: {
        monthly: "Mensual",
        annual: "Anual",
      },
      annualSaving: "ahorra {percent}%",
      seatPicker: {
        title: "Quién recibe una licencia de pago",
        selected: "{seats} de {total}",
        description:
          "Las personas marcadas graban y se facturan. Las demás son espectadores gratis que pueden ver, comentar y reaccionar, pero no grabar. Los roles cambian cuando mejoras el plan.",
        selectAll: "Seleccionar todo",
        clear: "Deseleccionar",
        you: "(tú)",
        paidSeat: "Licencia de pago",
        viewer: "Espectador",
      },
      perMonth: "al mes",
      seatsPrice: "one:{n} licencia × {price}|other:{n} licencias × {price}",
      viewersFree: "one:{n} espectador gratis|other:{n} espectadores gratis",
      priceWithViewers: "{seats}, {viewers}",
      priceYearly: "{seats}, con facturación anual",
      priceWithViewersYearly: "{seats}, {viewers}, con facturación anual",
      upgradeTo: "Mejorar a {plan}",
      checkoutUnavailable: "El pago no está configurado",
    },
    requestSeat: {
      request: "Solicitar grabar",
      requested: "Licencia solicitada",
      hint: "Aquí eres espectador. Pídele al propietario una licencia de pago para poder grabar.",
      requestedHint:
        "Ya se le pidió al propietario. Podrás grabar cuando lo apruebe.",
      failed: "No se pudo enviar la solicitud",
    },
  },
  actions: {
    missingSlug: "Falta el slug",
    recordingNotFound: "Grabación no encontrada",
    backgroundMissing: "Elige una imagen para subir",
    backgroundTooLarge: "Las imágenes pueden ocupar hasta 5 MB",
    backgroundBadType: "Usa una imagen PNG, JPEG o WebP",
    backgroundFailed: "No se pudo subir la imagen. Inténtalo de nuevo.",
    invalidVisibility: "Visibilidad no válida",
    deleteVideoFailed: "No se pudo eliminar el archivo de video: {reason}",
    transcriptNotFound: "Transcripción no encontrada",
    transcriptEmpty:
      "La transcripción no puede quedar vacía. En su lugar, restablécela.",
    missingTokenId: "Falta el ID del token",
    tokenNotFound: "Token no encontrado",
    missingScreenshotId: "Falta el ID de la captura de pantalla",
    screenshotNotFound: "Captura de pantalla no encontrada",
    missingImageBytes: "Faltan los bytes de la imagen",
    screenshotTooLarge:
      "La captura de pantalla editada supera el límite de tamaño por captura de pantalla.",
    saveScreenshotFailed: "No se pudo guardar la captura de pantalla: {reason}",
    saveFailed: "Error al guardar: {reason}",
    invalidCanvasDimensions:
      "Error al guardar: dimensiones del lienzo no válidas",
  },
  viewer: {
    meta: {
      defaultTitle: "Grabación de {product}",
      defaultDescription:
        "Una grabación de pantalla compartida desde {product}.",
      preparingTitle: "Preparando la grabación… — {product}",
      notFoundTitle: "No encontrado",
      description:
        "Una grabación de pantalla compartida desde {product}. Mírala en tu navegador, sin registrarte.",
      descriptionTimed:
        "Una grabación de pantalla de {duration} compartida desde {product}. Mírala en tu navegador, sin registrarte.",
    },
    loading: "Cargando grabación…",
    nav: {
      download: "Descargar",
    },
    authPrompt: {
      pricing: "Precios",
      logIn: "Iniciar sesión",
      getStarted: "Empezar",
      getFree: "Obtén {product} gratis",
    },
    postedBy: {
      label: "Publicado por",
      someone: "Alguien",
    },
    views: {
      count: "one:{count} visualización|other:{count} visualizaciones",
      showWhoWatched: "{views}, mostrar quién la vio",
      viewers: "Espectadores",
      emptyTitle: "Aún no hay visualizaciones",
      emptyDescription: "Comparte el enlace y quienes la vean aparecerán aquí.",
      signedInViewer: "Espectador con sesión iniciada",
      anonymous: "Anónimo",
    },
    actions: {
      share: "Compartir",
      visibilityFailed: "No se pudo actualizar la visibilidad",
      deleteFailed: "No se pudo eliminar la grabación",
    },
    requestAccess: {
      title: "Solicitar acceso para ver este video",
      notSharedBy: "{name} aún no ha compartido esta grabación contigo.",
      notSharedByOwner:
        "El propietario aún no ha compartido esta grabación contigo.",
      signInHint:
        "Inicia sesión con tu correo del trabajo: si ya estás en el equipo del propietario, entrarás directamente.",
      signIn: "Inicia sesión para continuar",
      sentTitle: "Solicitud enviada",
      sentDescription:
        "Avisamos al propietario. Recibirás un correo si te da acceso.",
      askingAs: "Solicitas como {email}",
      noteLabel: "Añadir una nota {optional}",
      noteOptional: "(opcional)",
      notePlaceholder:
        "Hola, me gustaría ver esta grabación de la revisión de ayer.",
      sending: "Enviando…",
      submit: "Solicitar acceso",
      failed: "Algo salió mal. Inténtalo de nuevo en un momento.",
    },
    pending: {
      preparingTitle: "Preparando tu grabación…",
      preparingDescription:
        "La subida aún está terminando. Esta página se actualiza sola cuando esté lista.",
      generatingTitle: "Generando tu vídeo…",
      generatingDescription:
        "Puede tardar uno o dos minutos. La página se actualiza sola cuando esté listo.",
      failedTitle: "Esta grabación no terminó de subirse",
      failedDescription:
        "El enlace se creó, pero el video nunca llegó. Prueba el enlace de nuevo en un minuto o haz una grabación nueva.",
      comment: "Comentar",
    },
    upgradeBanner: {
      message:
        "{usage} en el plan Gratis. Mejora el plan para tener grabaciones ilimitadas en calidad completa.",
      usage: "other:{used} de {n} grabaciones usadas",
    },
    editPanel: {
      editTitle: "Editar video",
      editDescription:
        "Recorta, corta, cambia el aspecto y corrige la transcripción en el editor.",
      downloadTitle: "Descargar video",
      downloadDescription: "La grabación completa en MP4.",
      copyEmbed: "Copiar código de inserción",
      embedCopied: "Código de inserción copiado",
      embedDescription: "Pega el reproductor en cualquier página web.",
    },
    notFound: {
      title: "Grabación no encontrada",
      description:
        "Este enlace expiró o nunca existió. Las grabaciones de las cuentas gratuitas se conservan durante 30 días desde la última vez que se vieron.",
      madeWith: "Hecho con {product}",
    },
  },
  activity: {
    sidebar: {
      label: "Barra lateral de la grabación",
      activityTab: "Actividad",
      transcriptTab: "Transcripción",
      toolsTab: "Herramientas",
    },
    you: "Tú",
    anonymous: "Anónimo",
    jumpToMoment: "Ir a este momento",
    empty: {
      title: "Aún no hay actividad",
      description:
        "Las reacciones y los comentarios de los espectadores aparecerán aquí a medida que ocurran.",
      firstTitle: "Sé el primero en comentar",
      firstTitleNamed: "Sé el primero en comentar, {name}",
      hint: "Presiona {key} para responder o deja un comentario al final de este panel.",
      focusComposer: "Ir al cuadro de comentarios",
    },
    composer: {
      signIn: "Inicia sesión para reaccionar y comentar",
      placeholder: "Deja un comentario…",
      mention: "Mencionar a alguien",
      noOneToMention: "Nadie ha reaccionado ni comentado todavía",
      insertEmoji: "Insertar emoji",
      searchEmoji: "Buscar emoji",
      posting: "Publicando…",
      submitAt: "Comentar en {time}",
      postFailed: "No se pudo publicar el comentario",
    },
    comment: {
      delete: "Eliminar comentario",
      deleteFailed: "No se pudo eliminar el comentario",
    },
    reaction: {
      count: "one:{n} reacción|other:{n} reacciones",
      delete: "Eliminar reacción",
      deleteMany: "one:Eliminar {n} reacción|other:Eliminar {n} reacciones",
      deleteFailed: "No se pudo eliminar la reacción",
    },
    transcript: {
      pendingTitle: "Transcribiendo…",
      pendingDescription:
        "La transcripción aparecerá aquí en cuanto esté lista.",
      failedTitle: "La transcripción no se completó",
      failedDescription: "Algo salió mal al transcribir esta grabación.",
      noneTitle: "Sin transcripción",
      noneOwnerDescription:
        "Graba con el micrófono activado y se escribirá una por ti.",
      noneViewerDescription: "Esta grabación se hizo sin micrófono.",
      searchLabel: "Buscar en la transcripción",
      noMatches: "Sin resultados.",
    },
    saveFailed: "No se pudo guardar. Inténtalo de nuevo.",
    summary: {
      title: "Resumen",
      add: "Añadir",
      placeholder: "¿Qué pasa en esta grabación?",
      empty: "Aún no hay resumen.",
      emptyAction: "Añadir un resumen",
    },
    chapters: {
      title: "Capítulos",
      count: "one:{n} capítulo|other:{n} capítulos",
      addAtPlayhead: "Añadir en el cabezal",
      defaultTitle: "Capítulo {n}",
      editHint: "Un capítulo por línea, como {short} o {long}.",
      editHintShort: "M:SS Título",
      editHintLong: "H:MM:SS Título",
      editPlaceholder: "0:00 Introducción\n0:30 Demostración\n1:20 Cierre",
      playing: "Reproduciendo",
      remove: "Quitar capítulo",
      empty: "Aún no hay capítulos.",
      emptyAction: "Añadir uno en el cabezal",
    },
  },
  player: {
    overlay: {
      watchAgain: "Ver de nuevo",
    },
    captions: {
      track: "Subtítulos",
      size: "Tamaño",
      position: "Posición",
      sizes: {
        small: "Pequeño",
        medium: "Mediano",
        large: "Grande",
      },
      positions: {
        top: "Arriba",
        bottom: "Abajo",
      },
    },
    reactionBar: {
      comment: "Comentar",
      leaveComment: "Dejar un comentario",
    },
    reactions: {
      heart: "Corazón",
      thumbsUp: "Pulgar arriba",
      fire: "Fuego",
      clap: "Aplauso",
      raisedHands: "Manos levantadas",
      eyes: "Ojos",
    },
    embed: {
      title: "Grabación de {product}",
    },
    controls: {
      buttons: {
        play: "Reproducir",
        pause: "Pausar",
        replay: "Repetir",
        mute: "Silenciar",
        unmute: "Activar sonido",
      },
      seek: {
        forward: "Avanzar {seconds} segundos",
        backward: "Retroceder {seconds} segundos",
      },
      fullscreen: {
        enter: "Activar pantalla completa",
        exit: "Salir de pantalla completa",
      },
      captions: {
        enable: "Activar subtítulos",
        disable: "Desactivar subtítulos",
      },
      pip: {
        enter: "Activar imagen en imagen",
        exit: "Salir de imagen en imagen",
      },
      cast: {
        start: "Iniciar transmisión",
        stop: "Detener transmisión",
        connecting: "Conectando",
      },
      airplay: {
        start: "Iniciar AirPlay",
        stop: "Detener AirPlay",
      },
      slider: {
        seek: "Buscar posición",
      },
      time: {
        current: "Tiempo actual",
        duration: "Duración",
        position: "{current} de {duration}",
        unknown: "Contenido no cargado, tiempo desconocido.",
      },
      playback: {
        rate: "Velocidad de reproducción {rate}",
      },
      volume: {
        mutedValue: "{percent}, silenciado",
        muted: "Silenciado",
        label: "Volumen",
        value: "Volumen {value}",
      },
      status: {
        captionsOn: "Subtítulos activados",
        captionsOff: "Subtítulos desactivados",
        paused: "En pausa",
        playing: "Reproduciendo",
        fullscreen: "Pantalla completa",
        pip: "Imagen en imagen",
        exitPip: "Salir de imagen en imagen",
        seekedTo: "Posición cambiada a {time}",
      },
      container: {
        label: "Reproductor multimedia",
      },
      errors: {
        aborted: "Detuviste la reproducción antes de que terminara.",
        network:
          "No se pudo cargar este contenido por un problema de red o del servidor.",
        decode:
          "No se pudo reproducir este contenido. Puede que esté dañado o que tu navegador no admita su formato.",
        source:
          "No se pudo cargar este contenido. Puede que no esté disponible o que tu navegador no admita su formato.",
        encrypted:
          "No se pudo reproducir este contenido porque no se pudo descifrar.",
        unplayable: "El reproductor no admite este contenido.",
        title: "Algo salió mal.",
        unexpected: "Ocurrió un error inesperado.",
      },
      common: {
        ok: "Aceptar",
      },
      menu: {
        settings: "Configuración",
        quality: "Calidad",
        audio: "Audio",
        speed: "Velocidad",
        captions: "Subtítulos",
        playbackRate: "Velocidad de reproducción",
        off: "Desactivado",
        auto: "Automático",
        autoWithLabel: "Automático ({label})",
      },
    },
  },
  screenshotView: {
    page: {
      defaultTitle: "Captura de pantalla de {product}",
      description: "Una captura de pantalla compartida desde {product}.",
      madeWith: "Hecho con {product}",
      loading: "Cargando captura de pantalla…",
    },
    authPrompt: {
      pricing: "Precios",
      logIn: "Iniciar sesión",
      getStarted: "Empezar",
      getFree: "Obtén {product} gratis",
    },
    actions: {
      edit: "Editar captura de pantalla",
      share: "Compartir",
      shareTitle: "Compartir captura de pantalla",
      copyLink: "Copiar enlace",
      linkCopied: "Enlace copiado",
      more: "Más acciones",
      delete: "Eliminar captura de pantalla",
      deleteTitle: "¿Eliminar esta captura de pantalla?",
      deleteDescription:
        "La imagen y su enlace dejan de funcionar de inmediato. Esta acción no se puede deshacer.",
      visibilityFailed: "No se pudo actualizar la visibilidad",
      deleteFailed: "No se pudo eliminar la captura de pantalla",
    },
    zoom: {
      expand: "Ampliar imagen",
      minimize: "Reducir imagen",
    },
    requestAccess: {
      title: "Solicitar acceso para ver esta captura de pantalla",
      notSharedBy:
        "{name} aún no ha compartido esta captura de pantalla contigo.",
      notSharedByOwner:
        "El propietario aún no ha compartido esta captura de pantalla contigo.",
      signInHint:
        "Inicia sesión con tu correo del trabajo: si ya estás en el equipo del propietario, entrarás directamente.",
      signIn: "Inicia sesión para continuar",
      sentTitle: "Solicitud enviada",
      sentDescription:
        "Avisamos al propietario. Recibirás un correo si te da acceso.",
      askingAs: "Solicitas como {email}",
      noteLabel: "Añadir una nota {optional}",
      noteOptional: "(opcional)",
      notePlaceholder:
        "Hola, me gustaría tener una copia de esta captura de pantalla de la revisión de diseño.",
      sending: "Enviando…",
      submit: "Solicitar acceso",
      failed: "Algo salió mal. Inténtalo de nuevo en un momento.",
    },
    notFound: {
      title: "Captura de pantalla no encontrada",
      description:
        "Este enlace expiró o nunca existió. Las capturas de pantalla de las cuentas gratuitas se conservan durante 30 días desde la última vez que se vieron.",
    },
  },
  recordingEditor: {
    skeleton: {
      label: "Abriendo el editor",
      status: "Abriendo el editor…",
    },
    preparing: {
      title: "Preparando la grabación…",
      description:
        "La grabación aún se está subiendo. Esta página se actualizará automáticamente cuando esté lista.",
    },
    failed: {
      title: "No se pudo subir la grabación.",
      description: "Intenta grabar de nuevo desde la app de escritorio.",
    },
    saveFailed: "No se pudo guardar",
    topBar: {
      back: "Volver a la grabación",
      status: {
        idle: "Los cambios se guardan automáticamente",
        saved: "Guardado",
        error: "No se pudo guardar",
      },
      versionHistory: "Historial de versiones (próximamente)",
      undo: "Deshacer",
      undoShortcut: "Deshacer ({key})",
      redo: "Rehacer",
      redoShortcut: "Rehacer ({key})",
      finish: "Finalizar",
    },
    panels: {
      label: "Paneles del editor",
      tabs: {
        transcript: "Transcripción",
        design: "Diseño",
        details: "Detalles",
      },
      hide: {
        transcript: "Ocultar transcripción",
        design: "Ocultar diseño",
        details: "Ocultar detalles",
      },
      show: {
        transcript: "Mostrar transcripción",
        design: "Mostrar diseño",
        details: "Mostrar detalles",
      },
    },
    toggleOn: "Activado",
    background: {
      title: "Fondo",
      gradients: "Degradados",
      none: "Ninguno",
      noBackground: "Sin fondo",
      upload: "Subir imagen",
      uploading: "Subiendo…",
      uploadedImage: "Tu imagen",
      solid: "Sólido",
      solidColor: "Sólido {color}",
      customColor: "Elegir un color personalizado",
      showLess: "Ver menos",
      seeMore: "Ver más",
      presets: {
        violet: "Violeta",
        sunset: "Atardecer",
        orchid: "Orquídea",
        forest: "Bosque",
        flamingo: "Flamenco",
        citrus: "Cítrico",
        arctic: "Ártico",
        ocean: "Océano",
        deep: "Profundo",
        ember: "Brasa",
        mint: "Menta",
        dusk: "Crepúsculo",
        peach: "Durazno",
        midnight: "Medianoche",
        slate: "Pizarra",
      },
    },
    frame: {
      title: "Marco",
      padding: "Margen",
      corners: "Esquinas",
      shadow: "Sombra",
    },
    camera: {
      title: "Cámara",
      show: "Mostrar cámara",
      hidden: "Oculta",
      position: "Posición",
      positionHint: "Arrastra el punto o toca una esquina",
      positionHintHidden: "Muestra la cámara para colocarla.",
      corners: {
        topLeft: "Arriba a la izquierda",
        topRight: "Arriba a la derecha",
        bottomLeft: "Abajo a la izquierda",
        bottomRight: "Abajo a la derecha",
      },
      size: "Tamaño",
      sizes: {
        small: "Pequeño",
        medium: "Mediano",
        large: "Grande",
      },
    },
    audio: {
      title: "Audio",
      systemSound: "Sonido del sistema",
      sound: "Sonido",
      microphone: "Micrófono",
      muted: "Silenciado",
      sharedTrack:
        "El micrófono y el sonido del sistema comparten una sola pista en esta grabación.",
    },
    details: {
      title: "Grabación",
      link: "Enlace",
      size: "Tamaño",
      duration: "Duración",
      views: "Visualizaciones",
      created: "Creada",
    },
    transcript: {
      transcribing: "Transcribiendo…",
      unavailable: "No hay transcripción disponible",
      pendingHint: "Vuelve a cargar esta página en un minuto para editarla.",
      failedHint: "La transcripción de esta grabación no se completó.",
      missingHint: "Graba con el micrófono activado y se escribirá una por ti.",
      deleteWord: "Eliminar palabra",
      deleteWords: "one:Eliminar {n} palabra|other:Eliminar {n} palabras",
      clearSelection: "Deseleccionar",
      hint: "Haz clic en una palabra o arrastra sobre varias para seleccionar; haz doble clic para corregir el texto.",
      resetEdits: "Restablecer cambios",
      editLine: "Editar línea de la transcripción",
      selectLine: "Seleccionar la línea en {time}",
      restore: "Restaurar",
      saveFailed: "No se pudo guardar",
      resetFailed: "No se pudo restablecer",
    },
    timeline: {
      hideWaveform: "Ocultar forma de onda",
      showWaveform: "Mostrar forma de onda",
      loadingAudio: "Cargando audio…",
      deleteSelection: "Eliminar selección",
      deleteSelectionHint:
        "Selecciona palabras en la transcripción o divide la línea de tiempo y elige un segmento",
      splitAt: "Dividir en {time}",
      splitHint: "Primero reproduce o desplázate hasta un momento",
      comingSoon: "Próximamente",
      fit: "Ajustar",
      zoomOut: "Alejar",
      zoom: "Zoom de la línea de tiempo",
      zoomIn: "Acercar",
      seek: "Buscar posición",
      trimStart: "Recortar el inicio del clip",
      trimEnd: "Recortar el final del clip",
      removeSplit: "Quitar división en {time}",
    },
  },
  screenshotEditor: {
    loading: "Cargando editor…",
    imageError: {
      decode: "No se pudo decodificar la imagen de la captura de pantalla.",
      fetch:
        "No se pudo cargar la imagen de la captura de pantalla. Puede que el bucket haya perdido el acceso CORS.",
    },
    header: {
      back: "Volver a la captura de pantalla",
      reset: "Restablecer cambios",
      undo: "Deshacer",
      undoTooltip: "Deshacer ({key})",
      redo: "Rehacer",
      redoTooltip: "Rehacer ({key})",
      finish: "Finalizar",
    },
    saveError: {
      notMounted: "El editor no está montado",
      noCanvas: "No se pudo obtener el lienzo de exportación",
      workerCrashed: "El worker de codificación PNG falló",
    },
    tools: {
      text: "Texto",
      rect: "Rectángulo",
      arrow: "Flecha",
      background: "Fondo",
    },
    background: {
      title: "Añadir un fondo",
      close: "Cerrar selector de fondo",
      none: "Ninguno",
      gradients: {
        violet: "Violeta",
        sunset: "Atardecer",
        orchid: "Orquídea",
        forest: "Bosque",
        flamingo: "Flamenco",
        citrus: "Cítrico",
        arctic: "Ártico",
        ocean: "Océano",
        deep: "Profundo",
      },
      solid: "Sólido {color}",
      custom: "Elegir un color personalizado",
    },
    inspector: {
      color: "Color {color}",
      size: "{n}px",
      duplicate: "Duplicar",
    },
    textPrompt: "Texto",
  },
  canvas: {
    meta: {
      title: "Lienzo",
      description: "Un tablero en blanco para dibujar mientras grabas.",
    },
    loading: "Cargando lienzo…",
    tools: {
      select: "Seleccionar",
      hand: "Mano",
      pen: "Lápiz",
      highlighter: "Resaltador",
      rect: "Rectángulo",
      ellipse: "Elipse",
      arrow: "Flecha",
      line: "Línea",
      text: "Texto",
      eraser: "Borrador",
    },
    shortcut: "{label} · {key}",
    colour: "Color {colour}",
    stroke: "Trazo {width}",
    hint: "Desplázate para mover · {mod} y desplázate para hacer zoom · mantén {space} para arrastrar",
    textPlaceholder: "Escribe…",
    history: {
      undo: "Deshacer",
      redo: "Rehacer",
      clear: "Borrar el tablero",
    },
    zoom: {
      out: "Alejar",
      reset: "Restablecer zoom",
      in: "Acercar",
    },
    extensionPrompt: {
      title: "Graba este lienzo",
      description:
        "Añade la extensión de CaptureFlow para grabar tu pantalla y tu cámara mientras dibujas y luego comparte un enlace.",
      dismiss: "Ahora no",
      install: "Añadir a Chrome",
    },
  },
};

export default messages;

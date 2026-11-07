import type { AppMessages } from "../messages";

const messages: AppMessages = {
  common: {
    cancel: "Cancelar",
    save: "Guardar",
    saving: "A guardar…",
    delete: "Eliminar",
    deleting: "A eliminar…",
    remove: "Remover",
    close: "Fechar",
    back: "Voltar",
    continue: "Continuar",
    confirm: "Confirmar",
    done: "Concluído",
    edit: "Editar",
    copy: "Copiar",
    copied: "Copiado",
    search: "Pesquisar",
    loading: "A carregar…",
    retry: "Tentar novamente",
    learnMore: "Saber mais",
    language: "Idioma",
    themeToLight: "Mudar para o tema claro",
    themeToDark: "Mudar para o tema escuro",
    somethingWrong: "Ocorreu um erro. Tente novamente.",
    pageFailed: "Não foi possível carregar esta página.",
    partFailed: "Não foi possível carregar esta parte.",
    failedBody: "Algo correu mal. Tente novamente ou recarregue a página.",
    reload: "Recarregar página",
  },
  auth: {
    signedInAs: "Sessão iniciada como {email}.",
    errors: {
      generic: "Ocorreu um erro. Tente novamente.",
      network: "Erro de rede. Tente novamente.",
    },
    login: {
      metaTitle: "Iniciar sessão",
      signInTitle: "Olá de novo",
      signInDescription: "Inicie sessão com o Google, o GitHub ou o seu email",
      signUpTitle: "Crie a sua conta",
      signUpDescription: "Registe-se com o Google, o GitHub ou o seu email",
      inviteTitle: "Junte-se a {workspace}",
      inviteDescription:
        "{inviter} enviou-lhe um convite. Inicie sessão ou crie uma conta com {email} para aceitar.",
      continueWith: "Continuar com {provider}",
      or: "Ou",
      emailLabel: "Email",
      emailPlaceholder: "you@example.com",
      emailInvalid: "Introduza um email válido.",
      continueWithEmail: "Continuar com email",
      askForInvite: "Precisa de uma conta? Peça um convite a um administrador.",
      haveAccount: "Já tem uma conta? {action}",
      haveAccountAction: "Iniciar sessão",
      noAccount: "Ainda não tem conta? {action}",
      noAccountAction: "Criar conta",
      changeEmail: "Alterar",
      nameLabel: "Nome",
      namePlaceholder: "O seu nome",
      passwordLabel: "Palavra-passe",
      newPasswordPlaceholder: "Pelo menos 12 caracteres",
      passwordTooShort: "Use pelo menos 12 caracteres.",
      passwordMissing: "Introduza a sua palavra-passe.",
      signInSubmit: "Iniciar sessão",
      signUpSubmit: "Criar conta",
      terms: "Ao continuar, aceita os nossos {terms} e a nossa {privacy}.",
      termsLink: "Termos",
      privacyLink: "Política de privacidade",
    },
    verify: {
      title: "Verifique o seu email",
      description:
        "Enviámos um link para {email}. Abra-o para concluir a configuração da sua conta.",
      resend: "Reenviar email",
      resent: "Enviado novamente",
      resendFailed: "Não foi possível enviar o email. Tente novamente.",
      wrongAddress: "Endereço errado? {action}",
      wrongAddressAction: "Usar outro email",
    },
    oauthErrors: {
      unfinished: "O início de sessão não foi concluído. Tente novamente.",
      inviteOnly:
        "Este CaptureFlow é só por convite. Peça um convite a um administrador.",
      allowedDomains:
        "Registe-se com um endereço de {domains} ou peça um convite a um administrador.",
      providerDomains:
        "Registe-se com uma conta Google ou GitHub de {domains}.",
      domainChoice: "{first} ou {second}",
    },
    inviteFallbacks: {
      workspace: "um espaço de trabalho do CaptureFlow",
      inviter: "Alguém da equipa",
    },
    setPassword: {
      title: "Defina a sua palavra-passe",
      description:
        "Escolha uma palavra-passe para {email}. A seguir, fica com a sessão iniciada.",
      passwordLabel: "Nova palavra-passe",
      passwordPlaceholder: "Pelo menos 12 caracteres",
      submit: "Guardar palavra-passe",
      expiredTitle: "Este link já não funciona",
      expiredDescription:
        "Já foi utilizado ou expirou. Peça um novo a um administrador.",
      goToSignIn: "Ir para o início de sessão",
    },
    invite: {
      title: "Recebeu um convite",
      asViewer:
        "Recebeu um convite para se juntar a {workspace} no CaptureFlow como visualizador: pode ver e comentar tudo o que lá for partilhado.",
      asMember:
        "Recebeu um convite para se juntar a {workspace} no CaptureFlow como membro: pode gravar nesse espaço de trabalho e partilhar com a equipa.",
      accept: "Aceitar convite",
      databaseUnavailable: "Base de dados indisponível",
      invalidTitle: "O convite já não é válido",
      invalidBody:
        "Este link expirou ou já foi utilizado. Peça ao proprietário do espaço de trabalho que envie um novo convite.",
      wrongAccountTitle: "Conta errada",
      wrongAccountBody:
        "Este convite foi enviado para {invited}, mas tem sessão iniciada como {current}. Termine sessão e inicie sessão com o endereço convidado para aceitar.",
      goToDashboard: "Ir para o painel",
      signOut: "Terminar sessão",
    },
    handoff: {
      signingIn: "A iniciar sessão…",
      returning: "A regressar ao CaptureFlow…",
      open: "Abrir o CaptureFlow",
      hint: "Se nada acontecer, clique no botão acima. Pode fechar este separador quando a aplicação para computador voltar a abrir.",
      extensionDone:
        "Sessão iniciada como {email}. Pode fechar este separador.",
      extensionUnreachable:
        "Não foi possível contactar a extensão CaptureFlow. Confirme que está instalada e clique no ícone dela para tentar novamente.",
      extensionUnverified:
        "Não foi possível verificar a extensão. Reinstale-a e tente novamente.",
    },
  },
  shell: {
    record: {
      newRecording: "Nova gravação",
    },
    nav: {
      toggleSidebar: "Mostrar ou ocultar a barra lateral",
      dashboard: "Painel",
      recordings: "Gravações",
      screenshots: "Capturas de ecrã",
      canvas: "Tela",
      workspaceGroup: "Espaço de trabalho",
      members: "Membros",
      settings: "Definições",
      personal: "Pessoal",
      workspace: "Espaço de trabalho",
      billing: "Faturação",
      admin: "Administração",
    },
    upgradeCard: {
      title: "Faça upgrade do seu espaço de trabalho",
      description:
        "O plano Gratuito inclui {recordings} gravações por pessoa em qualidade de poupança de dados. Os planos pagos removem os limites, a partir de {price} por membro.",
      viewPlans: "Ver planos",
    },
    topBar: {
      upgrade: "Fazer upgrade",
    },
    workspaceSwitcher: {
      switchWorkspace: "Mudar de espaço de trabalho",
      summary: "one:Predefinido · {n} membro|other:Predefinido · {n} membros",
      workspaces: "Espaços de trabalho",
      owned: "É seu",
      joined: "Juntou-se",
      newWorkspace: "Novo espaço de trabalho",
      inviteMembers: "Convidar membros",
    },
    drawer: {
      open: "Abrir o menu do espaço de trabalho",
      title: "Menu do espaço de trabalho",
    },
    search: {
      prompt: "Pesquise nas suas gravações e capturas de ecrã",
      clear: "Limpar pesquisa",
      results: "Resultados da pesquisa",
      hint: "Pesquise nas suas gravações e capturas de ecrã por título.",
      noMatches: "Sem resultados",
      kind: {
        recording: "gravação",
        screenshot: "captura de ecrã",
      },
    },
    account: {
      menu: "Menu da conta",
      nav: {
        billing: "Faturação",
        devices: "Dispositivos ligados",
        settings: "Definições",
        support: "Contactar o apoio",
      },
      freePlan: "Gratuito",
      signOut: "Terminar sessão",
      signingOut: "A terminar sessão…",
    },
    theme: {
      label: "Tema",
      light: "Claro",
      dark: "Escuro",
      system: "Sistema",
    },
    notifications: {
      title: "Notificações",
      subtitle: "Convites e alterações nos seus espaços de trabalho.",
      bellUnread:
        "one:Notificações, {n} não lida|other:Notificações, {n} não lidas",
      viewAll: "Ver todas",
      menuEmpty:
        "Está tudo em dia. Os convites, os novos colegas de equipa e as alterações de função aparecem aqui.",
      pageEmpty:
        "Está tudo em dia. Quando alguém lhe enviar um convite, se juntar ao seu espaço de trabalho ou alterar a sua função, verá isso aqui.",
      accept: "Aceitar",
      decline: "Recusar",
      unread: "Não lida",
      someone: "Alguém",
      message: {
        invited: {
          member:
            "{actor} enviou-lhe um convite para se juntar a {workspace} como membro",
          viewer:
            "{actor} enviou-lhe um convite para se juntar a {workspace} como visualizador",
        },
        joined: {
          member: "{actor} juntou-se a {workspace} como membro",
          viewer: "{actor} juntou-se a {workspace} como visualizador",
        },
        seatRequested: "{actor} pediu uma licença paga em {workspace}",
        seatDenied: "{actor} recusou o seu pedido de licença em {workspace}",
        roleChanged: {
          member: "{actor} atribuiu-lhe a função de membro em {workspace}",
          viewer:
            "{actor} atribuiu-lhe a função de visualizador em {workspace}",
        },
        downgraded:
          "{actor} mudou a sua função para visualizador em {workspace}",
        keepRecordingUntil: "Pode continuar a gravar até {date}.",
        removed: "{actor} retirou-lhe o acesso a {workspace}",
      },
      acceptErrors: {
        failed: "Não foi possível aceitar o convite",
        signedOut: "Inicie sessão para aceitar",
        invalid: "Este convite expirou ou foi retirado",
        emailMismatch: "Este convite é para outro endereço de email",
        alreadyMember: "Já faz parte deste espaço de trabalho",
      },
    },
    mobileNav: {
      open: "Abrir menu",
      close: "Fechar menu",
      docs: "Documentação",
      star: "Dar estrela no GitHub",
      signIn: "Iniciar sessão",
      getStarted: "Começar",
    },
    skeletons: {
      avatar: "Avatar",
      workspaceName: "Nome do espaço de trabalho",
      workspaceLogo: "Logótipo do espaço de trabalho",
    },
  },
  library: {
    dashboard: {
      welcome: "Olá de novo",
      welcomeName: "Olá de novo, {name}",
      openCanvas: "Abrir a tela",
      newRecording: "Nova gravação",
      stats: {
        recordings: "Gravações",
        plusScreenshots:
          "one:Mais {count} captura de ecrã|other:Mais {count} capturas de ecrã",
        noScreenshots: "Ainda sem capturas de ecrã",
        views: "Visualizações",
        viewsAverage: "{count} por gravação, em média",
        noViews: "Ainda sem visualizações",
        recorded: "Gravado",
        recordedAverage: "{duration} por gravação, em média",
        nothingRecorded: "Ainda nada gravado",
        recordingsLeft: "Gravações restantes",
        leftOfAllowance: "{left} de {allowance}",
        freePlanLimit: "Plano Gratuito, até {minutes} min cada",
      },
      recordedTime: {
        minutes: "{minutes} min",
        hours: "{hours} h",
        hoursMinutes: "{hours} h {minutes} min",
      },
      recent: {
        title: "Gravações recentes",
        all: "Todas as gravações",
        empty: "Ainda não foi partilhado nada neste espaço de trabalho.",
        views: "one:{n} visualização|other:{n} visualizações",
        comments: "one:{n} comentário|other:{n} comentários",
        reactions: "one:{n} reação|other:{n} reações",
      },
      start: {
        title: "Comece a gravar com o {product}",
        surfacesLabel: "Onde gravar",
        surfaces: {
          extension: "Extensão",
          desktop: "Aplicação para computador",
          canvas: "Tela",
        },
        extension: {
          description:
            "Grave qualquer separador, janela ou o ecrã inteiro a partir da barra de ferramentas e receba um link que pode partilhar com qualquer pessoa.",
          record: "Gravar agora",
          addToChrome: "Adicionar ao Chrome",
        },
        desktop: {
          description:
            "Está a caminho uma aplicação nativa para Mac que grava o ecrã e a câmara com o áudio do sistema. Até lá, a extensão grava qualquer separador, janela ou o ecrã inteiro.",
          download: "Transferir para Mac",
          comingSoon: "Em breve",
        },
        canvas: {
          description:
            "Um quadro em branco com canetas, formas e texto para desenhar enquanto grava, quando não há nenhuma página para mostrar.",
        },
      },
    },
    recording: {
      pageTitle: "Gravações",
      count: "one:{n} gravação|other:{n} gravações",
      untitled: "Gravação sem título",
      aiGenerated: "Gerada por IA",
      processing: "A processar",
      noMatches: "Nenhuma gravação corresponde a estes filtros.",
      empty:
        "Ainda não criou nenhum link de gravação. Grave na aplicação CaptureFlow para computador e as suas gravações aparecem aqui.",
      selectAll: "Selecionar todas as gravações",
      selected: "one:{n} gravação selecionada|other:{n} gravações selecionadas",
      open: "Abrir gravação",
      edit: "Editar gravação",
      share: "Partilhar gravação",
      delete: "Eliminar gravação",
      deleteTitle: "Eliminar esta gravação?",
      deleteDescription:
        "O vídeo e o respetivo link deixam de funcionar de imediato. Esta ação não pode ser anulada.",
      deleteSelectedTitle:
        "one:Eliminar {n} gravação?|other:Eliminar {n} gravações?",
    },
    screenshot: {
      pageTitle: "Capturas de ecrã",
      count: "one:{n} captura de ecrã|other:{n} capturas de ecrã",
      untitled: "Captura de ecrã sem título",
      numbered: "Captura de ecrã {id}",
      noMatches: "Nenhuma captura de ecrã corresponde a estes filtros.",
      empty:
        "Ainda sem capturas de ecrã. Abra o CaptureFlow → separador Screenshot → escolha Display, Window ou Area para capturar. A captura de ecrã aparece aqui automaticamente.",
      selectAll: "Selecionar todas as capturas de ecrã",
      selected:
        "one:{n} captura de ecrã selecionada|other:{n} capturas de ecrã selecionadas",
      open: "Abrir captura de ecrã",
      edit: "Editar captura de ecrã",
      share: "Partilhar captura de ecrã",
      delete: "Eliminar captura de ecrã",
      deleteTitle: "Eliminar esta captura de ecrã?",
      deleteDescription:
        "A imagem e o respetivo link deixam de funcionar de imediato. Esta ação não pode ser anulada.",
      deleteSelectedTitle:
        "one:Eliminar {n} captura de ecrã?|other:Eliminar {n} capturas de ecrã?",
    },
    filters: {
      access: "Acesso",
      sort: "Ordenar",
      current: "{label}: {value}",
      accessOptions: {
        all: "Qualquer acesso",
        public: "Público",
        workspace: "Espaço de trabalho",
        private: "Privado",
      },
      sortOptions: {
        newest: "Das mais recentes às mais antigas",
        oldest: "Das mais antigas às mais recentes",
        views: "Mais vistas",
      },
    },
    card: {
      select: "Selecionar {title}",
      moreActions: "Mais ações",
      rename: "Mudar o nome",
      unknownAuthor: "Desconhecido",
    },
    selection: {
      deleteDescription: "Os respetivos links deixam de funcionar de imediato.",
      deleteFailed:
        "Não foi possível eliminar {failed} de {count}. As restantes foram eliminadas.",
      clear: "Limpar",
    },
    pager: {
      label: "Páginas",
      previous: "Página anterior",
      next: "Página seguinte",
    },
    visibility: {
      label: "Visibilidade",
      labels: {
        public: "Público",
        workspace: "Espaço de trabalho",
        private: "Privado",
      },
      descriptions: {
        public: "Qualquer pessoa com o link pode ver",
        workspace:
          "Só os membros do espaço de trabalho com sessão iniciada podem ver",
        private: "Visível só para si",
      },
      workspaceNamed: "Espaço de trabalho · {name}",
    },
    share: {
      title: "Partilhar",
      embed: "Incorporar",
      embedPublic: "Reproduz-se onde quer que o código seja colado.",
      embedRestricted: "Só se reproduz para quem já pode abrir o link.",
      copyCode: "Copiar código",
      generalAccess: "Acesso geral",
      generalAccessCurrent: "Acesso geral: {access}",
      copyLink: "Copiar link",
      linkCopied: "Link copiado",
      shareAt: "Partilhar a partir de {time}",
    },
    editableTitle: {
      label: "Título da gravação",
      rename: "Mudar o nome da gravação",
    },
  },
  members: {
    title: "Membros",
    databaseUnavailable: "Base de dados indisponível.",
    role: "Função",
    status: "Estado",
    roles: {
      owner: "Administrador",
      member: "Membro",
      viewer: "Visualizador",
    },
    roleHints: {
      member: {
        does: "Grava neste espaço de trabalho.",
        costs: "Uma licença paga nos planos Light e Pro.",
      },
      viewer: {
        does: "Vê e comenta.",
        costs: "Sempre gratuito.",
      },
    },
    statuses: {
      active: "Ativo",
      invited: "Convidado",
    },
    seatSummary: {
      members: "one:{n} membro|other:{n} membros",
      viewers: "one:{n} visualizador|other:{n} visualizadores",
      paidSeats: "one:{n} licença paga|other:{n} licenças pagas",
      membersAndViewers: "{members} e {viewers}",
      onPaidSeats:
        "{people} com {seats}. Cada membro ocupa uma licença; os visualizadores são gratuitos.",
      membersFree: "{people}. Os membros são gratuitos neste plano.",
      freePlan:
        "{people}. Plano Gratuito: cada membro tem {recordings} gravações de até {minutes} minutos; os visualizadores veem e comentam.",
      planTitle: "Plano {plan}",
      paidPlanTitle: "Plano pago",
      freePlanTitle: "Plano Gratuito",
      upgrade: "Fazer upgrade do espaço de trabalho",
    },
    table: {
      intro: "Os membros gravam aqui; os visualizadores veem e comentam.",
      ownerIntro:
        "Como proprietário, pode convidar, remover e alterar funções.",
      searchPlaceholder: "Nome ou endereço de email",
      searchLabel: "Pesquisar membros",
      allRoles: "Todas as funções",
      everyone: "Todos",
      columns: {
        name: "Nome",
        dateAdded: "Adicionado em",
        email: "Endereço de email",
        actions: "Ações",
      },
      empty: "Ninguém corresponde a estes filtros.",
      downgradeNote: "Visualizador a partir de {date} · {keep}",
      keepAsMember: "Manter como membro",
      revoke: "Revogar",
    },
    seatRequests: {
      title: "Pedidos de licença",
      description:
        "Estes visualizadores pediram para gravar. Ao aprovar, passam a membros.",
      descriptionPaid:
        "Estes visualizadores pediram para gravar. Ao aprovar, passam a membros, o que adiciona uma licença paga.",
      asked: "{email} · pedido feito a {date}",
      deny: "Recusar",
      approve: "Aprovar",
    },
    seatConfirm: {
      addTitle: "Dar uma licença paga a {name}?",
      addBody:
        "Os membros gravam, por isso cada um ocupa uma licença paga. O seu plano {plan} passa de {seats} para {nextSeats} licenças, de {before} para {after} por mês.",
      addBodyYearly:
        "Os membros gravam, por isso cada um ocupa uma licença paga. O seu plano {plan} passa de {seats} para {nextSeats} licenças, de {before} para {after} por mês, faturado anualmente.",
      addInvoice:
        "O resto deste período de faturação é adicionado à sua próxima fatura.",
      addConfirm: "Adicionar licença paga",
      removeTitle: "Passar {name} a visualizador?",
      removeBody:
        "{name} continua a gravar até {date}, o fim do período que já pagou. Depois passa a visualizador, que pode ver e comentar, mas não gravar.",
      removePlan:
        "A partir dessa data, o seu plano {plan} passa de {seats} para {nextSeats} licenças, de {before} para {after} por mês.",
      removePlanYearly:
        "A partir dessa data, o seu plano {plan} passa de {seats} para {nextSeats} licenças, de {before} para {after} por mês, faturado anualmente.",
      removeConfirm: "Passar a visualizador",
    },
    remove: {
      label: "Remover {name} do espaço de trabalho",
      title: "Remover {name} de {workspace}?",
      body: "Esta pessoa perde o acesso de imediato. As gravações e capturas de ecrã dela ficam no espaço de trabalho.",
      freesSeat:
        "Isso liberta a licença paga dessa pessoa: o seu plano passa de {seats} para {nextSeats} licenças.",
    },
    leave: {
      button: "Sair",
      title: "Sair de {workspace}?",
      body: "Vai perder o acesso às respetivas gravações e capturas de ecrã. Tudo o que lá gravou fica no espaço de trabalho.",
      comeBack: "Para voltar, terá de receber um novo convite.",
      confirm: "Sair do espaço de trabalho",
    },
    invite: {
      trigger: "Convidar membros",
      title: "Convidar membros para {workspace}",
      titleOwnWorkspace: "Convidar membros para o seu espaço de trabalho",
      description:
        "Vão receber um email com um link que expira dentro de 7 dias. Certifique-se de que iniciam sessão com o mesmo endereço.",
      removeEmail: "Remover {email}",
      addEmails: "Adicionar emails",
      separatorHint: "Separe os emails com um espaço, uma vírgula ou Enter.",
      paidSeatNote:
        "Cada membro que aceitar adiciona uma licença paga ao seu plano {plan}, {price} por mês cada. O resto deste período entra na sua próxima fatura.",
      noEmails: "Adicione pelo menos um email",
      invalidEmails: "Email inválido: {emails}",
      failed: "Falhou",
      sent: "one:{n} convite enviado.|other:{n} convites enviados.",
      sending: "A enviar…",
      submit: "Enviar convites",
    },
    actions: {
      emailRequired: "Introduza um endereço de email",
      emailInvalid: "Não parece ser um email válido",
      ownWorkspace: "Já faz parte do seu próprio espaço de trabalho",
      alreadyMember: "Essa pessoa já é membro deste espaço de trabalho",
      emailNotSent:
        "O convite foi criado, mas o envio do email falhou. Copie o link na lista de pendentes.",
      invitationSent: "Convite enviado para {email}",
      alreadyRecording: "Já pode gravar aqui",
    },
  },
  settings: {
    saved: "Guardado",
    errors: {
      ownerOnly: "Só o proprietário do espaço de trabalho pode alterar isto",
      databaseUnavailable: "Base de dados indisponível",
      saveFailed: "Não foi possível guardar — tente novamente",
    },
    upload: {
      uploading: "A carregar…",
      missing: "Escolha um ficheiro de imagem",
      failed: "O carregamento falhou",
      failedReason: "O carregamento falhou: {reason}",
    },
    personal: {
      title: "Definições pessoais",
      account: {
        title: "Conta",
        description:
          "Como aparece aos colegas de equipa e às pessoas que veem as suas gravações.",
      },
      preferences: {
        title: "Preferências",
        description: "O aspeto e o idioma do CaptureFlow para si.",
      },
      languageDescription: "O idioma em que o CaptureFlow lhe é apresentado.",
    },
    avatar: {
      label: "Avatar",
      change: "Alterar avatar",
      removing: "A remover…",
      hint: "JPG, PNG, WebP ou GIF. Máximo de 2 MB.",
      tooLarge: "O avatar tem de ter 2 MB ou menos",
      badType: "O avatar tem de ser PNG, JPEG, WebP ou GIF",
    },
    account: {
      name: {
        label: "Nome completo",
        placeholder: "O seu nome",
        description:
          "Aparece nas gravações, nas capturas de ecrã e nas linhas de atividade.",
        required: "O nome é obrigatório.",
        updateFailed: "Não foi possível atualizar o nome.",
      },
      email: {
        label: "Endereço de email",
        description:
          "Usado para iniciar sessão. Contacte o apoio para o alterar.",
      },
      userId: {
        label: "ID de utilizador",
        copy: "Copiar ID de utilizador",
        description: "Indique-o quando contactar o apoio.",
      },
      saveChanges: "Guardar alterações",
    },
    workspace: {
      title: "Definições do espaço de trabalho",
      tabs: {
        label: "Secções das definições",
        general: "Geral",
        security: "Segurança",
      },
      general: {
        title: "Geral",
        description:
          "O nome e o logótipo que identificam este espaço de trabalho no seletor, na página de membros e nas pré-visualizações de partilha.",
      },
      name: {
        title: "Nome do espaço de trabalho",
        description: "O nome que aparece para o seu espaço de trabalho.",
        empty: "O nome do espaço de trabalho não pode ficar vazio",
        tooLong:
          "O nome do espaço de trabalho é demasiado longo (máx. {max} caracteres)",
      },
      logo: {
        title: "Logótipo do espaço de trabalho",
        description:
          "Aparece junto ao nome do espaço de trabalho. PNG, JPEG, WebP, GIF ou SVG, máximo de 2 MB.",
        upload: "Carregar logótipo",
        replace: "Substituir logótipo",
        tooLarge: "O logótipo tem de ter 2 MB ou menos",
        badType: "O logótipo tem de ser PNG, JPEG, WebP, GIF ou SVG",
      },
      permissions: {
        title: "Permissões predefinidas",
        description:
          "Definições aplicadas a cada nova gravação e captura de ecrã no espaço de trabalho.",
      },
      recordingAccess: {
        title: "Acesso à gravação",
        description:
          "Decida se os colegas de equipa podem publicar gravações e capturas de ecrã neste espaço de trabalho.",
        allow: {
          title: "Permitir que os colegas de equipa publiquem aqui",
          body: "Os membros podem gravar neste espaço de trabalho.",
        },
        ownerOnly: {
          title: "Só o proprietário do espaço de trabalho",
          body: "Os carregamentos dos colegas de equipa vão para o espaço de trabalho pessoal de cada um.",
        },
      },
    },
    devices: {
      title: "Dispositivos ligados",
      count:
        "one:{n} dispositivo com sessão iniciada|other:{n} dispositivos com sessão iniciada",
      empty:
        "Sem dispositivos ligados. Abra a aplicação CaptureFlow para computador e clique em Sign in na barra de gravação para associar esta conta.",
      unlabelled: "Dispositivo sem nome",
      added: "Adicionado a {date}",
      addedLastUsed: "Adicionado a {date} · última utilização a {lastUsed}",
      neverUsed: "Nunca utilizado",
      revoke: {
        action: "Revogar",
        title: "Terminar a sessão deste dispositivo?",
        description: "Terá de iniciar sessão novamente para gerir gravações.",
      },
    },
  },
  billing: {
    chargedInUsd: "Cobrado em dólares americanos.",
    shownIn:
      "Os preços são apresentados em {currency}. A cobrança é feita em dólares americanos.",
    page: {
      title: "Faturação",
      subtitle: "O seu plano e o que já utilizou dele.",
      workspaceLabel: "Espaço de trabalho · {name}",
      manageSubscription: "Gerir subscrição",
      upgradeWorkspace: "Fazer upgrade do espaço de trabalho",
      storage: "Armazenamento do espaço de trabalho",
      usedOfLimit: "{used} de {limit}",
      usedNoLimit: "{used} — sem limite",
    },
    loading: {
      plan: "Plano",
      usage: "Utilização",
    },
    counts: {
      members: "one:{n} membro|other:{n} membros",
      paidSeats: "one:{n} licença paga|other:{n} licenças pagas",
      freeViewers:
        "one:{n} visualizador gratuito|other:{n} visualizadores gratuitos",
    },
    plan: {
      free: "Gratuito",
      paid: "Pago",
      billedMonthly: "Faturado mensalmente",
      billedYearly: "Faturado anualmente",
      freeSummary:
        "{members} · até {recordings} gravações por pessoa, {minutes} minutos cada, qualidade de poupança de dados",
    },
    status: {
      onTrial: "Período experimental",
      active: "Ativa",
      paused: "Em pausa",
      pastDue: "Pagamento falhado",
      unpaid: "Por pagar",
      cancelled: "Cancelada",
      expired: "Expirada",
    },
    details: {
      youPay: "O que paga",
      amountPerMonth: "{amount} por mês",
      amountPerYear: "{amount} por ano",
      seatsMonthly:
        "one:{n} licença × {price} por mês|other:{n} licenças × {price} por mês",
      seatsYearly:
        "one:{n} licença × {price} por mês, {total} por mês faturado anualmente|other:{n} licenças × {price} por mês, {total} por mês faturado anualmente",
      nextPayment: "Próximo pagamento",
      ends: "Termina",
      endOfPeriod: "No fim deste período",
      amountOnDate: "{amount} a {date}",
      firstPaymentPending: "Quando o primeiro pagamento for concluído",
      estimate: "{base} · {change}, valor estimado",
      baseForSeats:
        "one:{amount} por {n} licença|other:{amount} por {n} licenças",
      seatsAdded:
        "one:{amount} por {n} licença adicionada neste período|other:{amount} por {n} licenças adicionadas neste período",
      seatsRemoved:
        "one:{amount} de crédito por {n} licença removida neste período|other:{amount} de crédito por {n} licenças removidas neste período",
      seatChanges: "{amount} por alterações de licenças neste período",
      seats: "Licenças",
      seatsAndViewers: "{seats}, {viewers}",
      billedTo: "Faturado a",
      paymentMethod: "Método de pagamento",
      cardEnding: "{brand} terminado em {last4}",
      card: "Cartão",
      updateCard: "Atualizar",
    },
    switchPlan: {
      switchTo: "Mudar para {plan}",
      title: "Mudar para {plan}?",
      priceMonthly:
        "one:A sua {n} licença passa de {before} para {after} por mês.|other:As suas {n} licenças passam de {before} para {after} por mês.",
      priceYearly:
        "one:A sua {n} licença passa de {before} para {after} por mês, faturado anualmente.|other:As suas {n} licenças passam de {before} para {after} por mês, faturado anualmente.",
      benefits:
        "O plano {plan} grava em todas as qualidades até 60 fps e acrescenta edição por IA.",
      timing:
        "Começa agora. A diferença relativa ao resto deste período de faturação é adicionada à sua próxima fatura.",
      errors: {
        failed: "Não foi possível alterar o plano",
        unknownPlan: "Plano desconhecido",
        billingUnavailable: "A faturação está indisponível",
        noSubscription: "Este espaço de trabalho não tem uma subscrição ativa",
        cancelled: "Retome a subscrição antes de alterar o plano",
        unavailable: "De momento, não é possível alterar o plano",
        rejected: "A faturação não aceitou a alteração. Tente novamente.",
      },
    },
    upgrade: {
      title: "Fazer upgrade de {name}",
      billingCycle: "Ciclo de faturação",
      cycles: {
        monthly: "Mensal",
        annual: "Anual",
      },
      annualSaving: "poupe {percent}%",
      seatPicker: {
        title: "Quem recebe uma licença paga",
        selected: "{seats} de {total}",
        description:
          "As pessoas assinaladas gravam e são faturadas. As restantes são visualizadores gratuitos, que podem ver, comentar e reagir, mas não gravar. As funções mudam quando fizer o upgrade.",
        selectAll: "Selecionar todos",
        clear: "Limpar",
        you: "(você)",
        paidSeat: "Licença paga",
        viewer: "Visualizador",
      },
      perMonth: "por mês",
      seatsPrice: "one:{n} licença × {price}|other:{n} licenças × {price}",
      viewersFree:
        "one:{n} visualizador gratuito|other:{n} visualizadores gratuitos",
      priceWithViewers: "{seats}, {viewers}",
      priceYearly: "{seats}, faturado anualmente",
      priceWithViewersYearly: "{seats}, {viewers}, faturado anualmente",
      upgradeTo: "Fazer upgrade para {plan}",
      checkoutUnavailable: "Pagamento não configurado",
    },
    requestSeat: {
      request: "Pedir para gravar",
      requested: "Licença pedida",
      hint: "É visualizador aqui. Peça uma licença paga ao proprietário para poder gravar.",
      requestedHint:
        "O pedido foi enviado ao proprietário. Poderá gravar assim que for aprovado.",
      failed: "Não foi possível enviar o pedido",
    },
  },
  actions: {
    missingSlug: "Slug em falta",
    recordingNotFound: "Gravação não encontrada",
    invalidVisibility: "Visibilidade inválida",
    deleteVideoFailed:
      "Não foi possível eliminar o ficheiro de vídeo: {reason}",
    transcriptNotFound: "Transcrição não encontrada",
    transcriptEmpty:
      "A transcrição não pode ficar vazia. Em alternativa, reponha-a.",
    missingTokenId: "ID do token em falta",
    tokenNotFound: "Token não encontrado",
    missingScreenshotId: "ID da captura de ecrã em falta",
    screenshotNotFound: "Captura de ecrã não encontrada",
    missingImageBytes: "Bytes da imagem em falta",
    screenshotTooLarge:
      "A captura de ecrã editada excede o limite de tamanho por captura de ecrã.",
    saveScreenshotFailed:
      "Não foi possível guardar a captura de ecrã: {reason}",
    saveFailed: "Falha ao guardar: {reason}",
    invalidCanvasDimensions: "Falha ao guardar: dimensões da tela inválidas",
  },
  viewer: {
    meta: {
      defaultTitle: "Gravação do {product}",
      defaultDescription:
        "Uma gravação de ecrã partilhada a partir do {product}.",
      preparingTitle: "A preparar a gravação… — {product}",
      notFoundTitle: "Não encontrado",
      description:
        "Uma gravação de ecrã partilhada a partir do {product}. Veja-a no seu navegador, sem necessidade de registo.",
      descriptionTimed:
        "Uma gravação de ecrã de {duration} partilhada a partir do {product}. Veja-a no seu navegador, sem necessidade de registo.",
    },
    loading: "A carregar a gravação…",
    nav: {
      download: "Transferir",
    },
    authPrompt: {
      pricing: "Preços",
      logIn: "Iniciar sessão",
      getStarted: "Começar",
      getFree: "Obter o {product} grátis",
    },
    postedBy: {
      label: "Publicado por",
      someone: "Alguém",
    },
    views: {
      count: "one:{count} visualização|other:{count} visualizações",
      showWhoWatched: "{views}, mostrar quem viu",
      viewers: "Visualizadores",
      emptyTitle: "Ainda sem visualizações",
      emptyDescription: "Partilhe o link e quem vir a gravação aparece aqui.",
      signedInViewer: "Visualizador com sessão iniciada",
      anonymous: "Anónimo",
    },
    actions: {
      share: "Partilhar",
      visibilityFailed: "Não foi possível atualizar a visibilidade",
      deleteFailed: "Não foi possível eliminar a gravação",
    },
    requestAccess: {
      title: "Pedir acesso para ver este vídeo",
      notSharedBy: "{name} ainda não partilhou esta gravação consigo.",
      notSharedByOwner:
        "O proprietário ainda não partilhou esta gravação consigo.",
      signInHint:
        "Inicie sessão com o seu email de trabalho — se já fizer parte da equipa do proprietário, entra de imediato.",
      signIn: "Iniciar sessão para continuar",
      sentTitle: "Pedido enviado",
      sentDescription:
        "Avisámos o proprietário. Receberá um email se o acesso for concedido.",
      askingAs: "A pedir como {email}",
      noteLabel: "Adicionar uma nota {optional}",
      noteOptional: "(opcional)",
      notePlaceholder:
        "Olá, gostaria de ver esta gravação da revisão de ontem.",
      sending: "A enviar…",
      submit: "Pedir acesso",
      failed: "Ocorreu um erro. Tente novamente dentro de momentos.",
    },
    pending: {
      preparingTitle: "A preparar a sua gravação…",
      preparingDescription:
        "O carregamento ainda está a terminar. Esta página atualiza-se sozinha quando estiver pronta.",
      generatingTitle: "A gerar o seu vídeo…",
      generatingDescription:
        "Pode demorar um ou dois minutos. A página atualiza-se sozinha quando estiver pronto.",
      failedTitle: "O carregamento desta gravação não foi concluído",
      failedDescription:
        "O link foi criado, mas o vídeo nunca chegou. Tente abrir o link novamente dentro de um minuto ou faça uma nova gravação.",
      comment: "Comentar",
    },
    upgradeBanner: {
      message:
        "{usage} no plano Gratuito. Faça upgrade para ter gravações ilimitadas em qualidade máxima.",
      usage:
        "one:{used} de {n} gravação utilizada|other:{used} de {n} gravações utilizadas",
    },
    editPanel: {
      editTitle: "Editar vídeo",
      editDescription:
        "Apare, corte, mude o aspeto e corrija a transcrição no editor.",
      downloadTitle: "Transferir vídeo",
      downloadDescription: "A gravação completa em MP4.",
      copyEmbed: "Copiar código de incorporação",
      embedCopied: "Código de incorporação copiado",
      embedDescription: "Cole o leitor em qualquer página web.",
    },
    notFound: {
      title: "Gravação não encontrada",
      description:
        "Este link expirou ou nunca existiu. As gravações em contas gratuitas são mantidas durante 30 dias a contar da última visualização.",
      madeWith: "Feito com o {product}",
    },
  },
  activity: {
    sidebar: {
      label: "Barra lateral da gravação",
      activityTab: "Atividade",
      transcriptTab: "Transcrição",
      toolsTab: "Ferramentas",
    },
    you: "Você",
    anonymous: "Anónimo",
    jumpToMoment: "Ir para este momento",
    empty: {
      title: "Ainda sem atividade",
      description:
        "As reações e os comentários dos visualizadores aparecem aqui à medida que acontecem.",
      firstTitle: "Seja o primeiro a comentar",
      firstTitleNamed: "Seja o primeiro a comentar, {name}",
      hint: "Prima {key} para responder ou deixe um comentário no fundo deste painel.",
      focusComposer: "Focar a caixa de comentários",
    },
    composer: {
      signIn: "Iniciar sessão para reagir e comentar",
      placeholder: "Deixe um comentário…",
      mention: "Mencionar alguém",
      noOneToMention: "Ainda ninguém reagiu ou comentou",
      insertEmoji: "Inserir emoji",
      searchEmoji: "Pesquisar emoji",
      posting: "A publicar…",
      submitAt: "Comentar em {time}",
      postFailed: "Não foi possível publicar o comentário",
    },
    comment: {
      delete: "Eliminar comentário",
      deleteFailed: "Não foi possível eliminar o comentário",
    },
    reaction: {
      count: "one:{n} reação|other:{n} reações",
      delete: "Eliminar reação",
      deleteMany: "one:Eliminar {n} reação|other:Eliminar {n} reações",
      deleteFailed: "Não foi possível eliminar a reação",
    },
    transcript: {
      pendingTitle: "A transcrever…",
      pendingDescription:
        "A transcrição aparece aqui assim que estiver pronta.",
      failedTitle: "A transcrição não foi concluída",
      failedDescription: "Ocorreu um erro ao transcrever esta gravação.",
      noneTitle: "Sem transcrição",
      noneOwnerDescription:
        "Grave com o microfone ligado e a transcrição é escrita para si.",
      noneViewerDescription: "Esta gravação foi feita sem microfone.",
      searchLabel: "Pesquisar na transcrição",
      noMatches: "Sem resultados.",
    },
    saveFailed: "Não foi possível guardar. Tente novamente.",
    summary: {
      title: "Resumo",
      add: "Adicionar",
      placeholder: "O que acontece nesta gravação?",
      empty: "Ainda sem resumo.",
      emptyAction: "Adicionar um resumo",
    },
    chapters: {
      title: "Capítulos",
      count: "one:{n} capítulo|other:{n} capítulos",
      addAtPlayhead: "Adicionar no cursor de reprodução",
      defaultTitle: "Capítulo {n}",
      editHint: "Um capítulo por linha, como {short} ou {long}.",
      editHintShort: "M:SS Título",
      editHintLong: "H:MM:SS Título",
      editPlaceholder: "0:00 Introdução\n0:30 Demonstração\n1:20 Conclusão",
      playing: "A reproduzir",
      remove: "Remover capítulo",
      empty: "Ainda sem capítulos.",
      emptyAction: "Adicionar um no cursor de reprodução",
    },
  },
  player: {
    overlay: {
      watchAgain: "Ver novamente",
    },
    captions: {
      track: "Legendas",
      size: "Tamanho",
      position: "Posição",
      sizes: {
        small: "Pequeno",
        medium: "Médio",
        large: "Grande",
      },
      positions: {
        top: "Em cima",
        bottom: "Em baixo",
      },
    },
    reactionBar: {
      comment: "Comentar",
      leaveComment: "Deixar um comentário",
    },
    reactions: {
      heart: "Coração",
      thumbsUp: "Polegar para cima",
      fire: "Fogo",
      clap: "Aplauso",
      raisedHands: "Mãos levantadas",
      eyes: "Olhos",
    },
    embed: {
      title: "Gravação do {product}",
    },
    controls: {
      buttons: {
        play: "Reproduzir",
        pause: "Pausar",
        replay: "Repetir",
        mute: "Silenciar",
        unmute: "Ativar som",
      },
      seek: {
        forward: "Avançar {seconds} segundos",
        backward: "Recuar {seconds} segundos",
      },
      fullscreen: {
        enter: "Entrar em ecrã inteiro",
        exit: "Sair do ecrã inteiro",
      },
      captions: {
        enable: "Ativar legendas",
        disable: "Desativar legendas",
      },
      pip: {
        enter: "Entrar no modo ecrã no ecrã",
        exit: "Sair do modo ecrã no ecrã",
      },
      cast: {
        start: "Iniciar transmissão",
        stop: "Parar transmissão",
        connecting: "A ligar",
      },
      airplay: {
        start: "Iniciar AirPlay",
        stop: "Parar AirPlay",
      },
      slider: {
        seek: "Procurar",
      },
      time: {
        current: "Tempo atual",
        duration: "Duração",
        position: "{current} de {duration}",
        unknown: "Conteúdo não carregado, tempo desconhecido.",
      },
      playback: {
        rate: "Velocidade de reprodução {rate}",
      },
      volume: {
        mutedValue: "{percent}, sem som",
        muted: "Sem som",
        label: "Volume",
        value: "Volume {value}",
      },
      status: {
        captionsOn: "Legendas ativadas",
        captionsOff: "Legendas desativadas",
        paused: "Em pausa",
        playing: "A reproduzir",
        fullscreen: "Ecrã inteiro",
        pip: "Ecrã no ecrã",
        exitPip: "Sair do modo ecrã no ecrã",
        seekedTo: "Posição alterada para {time}",
      },
      container: {
        label: "Leitor multimédia",
      },
      errors: {
        aborted: "Parou a reprodução do conteúdo antes de esta terminar.",
        network:
          "Não foi possível carregar este conteúdo devido a um problema de rede ou do servidor.",
        decode:
          "Não foi possível reproduzir este conteúdo. Pode estar corrompido ou o seu navegador pode não suportar o formato.",
        source:
          "Não foi possível carregar este conteúdo. Pode estar indisponível ou o seu navegador pode não suportar o formato.",
        encrypted:
          "Não foi possível reproduzir este conteúdo porque não foi possível desencriptá-lo.",
        unplayable: "O leitor não suporta este conteúdo.",
        title: "Ocorreu um erro.",
        unexpected: "Ocorreu um erro inesperado.",
      },
      common: {
        ok: "OK",
      },
      menu: {
        settings: "Definições",
        quality: "Qualidade",
        audio: "Áudio",
        speed: "Velocidade",
        captions: "Legendas",
        playbackRate: "Velocidade de reprodução",
        off: "Desativado",
        auto: "Automático",
        autoWithLabel: "Automático ({label})",
      },
    },
  },
  screenshotView: {
    page: {
      defaultTitle: "Captura de ecrã do {product}",
      description: "Uma captura de ecrã partilhada a partir do {product}.",
      madeWith: "Feito com o {product}",
      loading: "A carregar a captura de ecrã…",
    },
    authPrompt: {
      pricing: "Preços",
      logIn: "Iniciar sessão",
      getStarted: "Começar",
      getFree: "Obter o {product} grátis",
    },
    actions: {
      edit: "Editar captura de ecrã",
      share: "Partilhar",
      shareTitle: "Partilhar captura de ecrã",
      copyLink: "Copiar link",
      linkCopied: "Link copiado",
      more: "Mais ações",
      delete: "Eliminar captura de ecrã",
      deleteTitle: "Eliminar esta captura de ecrã?",
      deleteDescription:
        "A imagem e o respetivo link deixam de funcionar de imediato. Esta ação não pode ser anulada.",
      visibilityFailed: "Não foi possível atualizar a visibilidade",
      deleteFailed: "Não foi possível eliminar a captura de ecrã",
    },
    zoom: {
      expand: "Expandir imagem",
      minimize: "Minimizar imagem",
    },
    requestAccess: {
      title: "Pedir acesso para ver esta captura de ecrã",
      notSharedBy: "{name} ainda não partilhou esta captura de ecrã consigo.",
      notSharedByOwner:
        "O proprietário ainda não partilhou esta captura de ecrã consigo.",
      signInHint:
        "Inicie sessão com o seu email de trabalho — se já fizer parte da equipa do proprietário, entra de imediato.",
      signIn: "Iniciar sessão para continuar",
      sentTitle: "Pedido enviado",
      sentDescription:
        "Avisámos o proprietário. Receberá um email se o acesso for concedido.",
      askingAs: "A pedir como {email}",
      noteLabel: "Adicionar uma nota {optional}",
      noteOptional: "(opcional)",
      notePlaceholder:
        "Olá, gostaria de ter uma cópia desta captura de ecrã da revisão de design.",
      sending: "A enviar…",
      submit: "Pedir acesso",
      failed: "Ocorreu um erro. Tente novamente dentro de momentos.",
    },
    notFound: {
      title: "Captura de ecrã não encontrada",
      description:
        "Este link expirou ou nunca existiu. As capturas de ecrã em contas gratuitas são mantidas durante 30 dias a contar da última visualização.",
    },
  },
  recordingEditor: {
    skeleton: {
      label: "A abrir o editor",
      status: "A abrir o editor…",
    },
    preparing: {
      title: "A preparar a gravação…",
      description:
        "A gravação ainda está a ser carregada. Esta página atualiza-se automaticamente quando estiver pronta.",
    },
    failed: {
      title: "O carregamento da gravação falhou.",
      description:
        "Tente gravar novamente a partir da aplicação para computador.",
    },
    saveFailed: "Não foi possível guardar",
    topBar: {
      back: "Voltar à gravação",
      status: {
        idle: "As edições são guardadas automaticamente",
        saved: "Guardado",
        error: "Não foi possível guardar",
      },
      versionHistory: "Histórico de versões (em breve)",
      undo: "Anular",
      undoShortcut: "Anular ({key})",
      redo: "Refazer",
      redoShortcut: "Refazer ({key})",
      finish: "Concluir",
    },
    panels: {
      label: "Painéis do editor",
      tabs: {
        transcript: "Transcrição",
        design: "Design",
        details: "Detalhes",
      },
      hide: {
        transcript: "Ocultar transcrição",
        design: "Ocultar design",
        details: "Ocultar detalhes",
      },
      show: {
        transcript: "Mostrar transcrição",
        design: "Mostrar design",
        details: "Mostrar detalhes",
      },
    },
    toggleOn: "Ativado",
    background: {
      title: "Fundo",
      gradients: "Gradientes",
      none: "Nenhum",
      noBackground: "Sem fundo",
      solid: "Cor sólida",
      solidColor: "Cor sólida {color}",
      customColor: "Escolher uma cor personalizada",
      showLess: "Mostrar menos",
      seeMore: "Ver mais",
      presets: {
        violet: "Violeta",
        sunset: "Pôr do sol",
        orchid: "Orquídea",
        forest: "Floresta",
        flamingo: "Flamingo",
        citrus: "Citrinos",
        arctic: "Ártico",
        ocean: "Oceano",
        deep: "Profundo",
        ember: "Brasa",
        mint: "Menta",
        dusk: "Crepúsculo",
        peach: "Pêssego",
        midnight: "Meia-noite",
        slate: "Ardósia",
      },
    },
    camera: {
      title: "Câmara",
      show: "Mostrar câmara",
      hidden: "Oculta",
      position: "Posição",
      positionHint: "Arraste o ponto ou toque num canto",
      positionHintHidden: "Mostre a câmara para a posicionar.",
      corners: {
        topLeft: "Superior esquerdo",
        topRight: "Superior direito",
        bottomLeft: "Inferior esquerdo",
        bottomRight: "Inferior direito",
      },
      size: "Tamanho",
      sizes: {
        small: "Pequeno",
        medium: "Médio",
        large: "Grande",
      },
    },
    audio: {
      title: "Áudio",
      systemSound: "Som do sistema",
      sound: "Som",
      microphone: "Microfone",
      muted: "Sem som",
      sharedTrack:
        "O microfone e o som do sistema partilham uma única faixa nesta gravação.",
    },
    details: {
      title: "Gravação",
      link: "Link",
      size: "Tamanho",
      duration: "Duração",
      views: "Visualizações",
      created: "Criada",
    },
    transcript: {
      transcribing: "A transcrever…",
      unavailable: "Sem transcrição disponível",
      pendingHint: "Recarregue esta página dentro de um minuto para a editar.",
      failedHint: "A transcrição desta gravação não foi concluída.",
      missingHint:
        "Grave com o microfone ligado e a transcrição é escrita para si.",
      deleteWord: "Eliminar palavra",
      deleteWords: "one:Eliminar {n} palavra|other:Eliminar {n} palavras",
      clearSelection: "Limpar seleção",
      hint: "Clique numa palavra ou arraste sobre várias para selecionar; faça duplo clique para corrigir o texto.",
      resetEdits: "Repor edições",
      editLine: "Editar linha da transcrição",
      selectLine: "Selecionar a linha em {time}",
      restore: "Restaurar",
      saveFailed: "Não foi possível guardar",
      resetFailed: "Não foi possível repor",
    },
    timeline: {
      hideWaveform: "Ocultar forma de onda",
      showWaveform: "Mostrar forma de onda",
      loadingAudio: "A carregar o áudio…",
      deleteSelection: "Eliminar seleção",
      deleteSelectionHint:
        "Selecione palavras na transcrição ou divida a linha de tempo e escolha um segmento",
      splitAt: "Dividir em {time}",
      splitHint: "Primeiro, reproduza ou arraste até um momento",
      comingSoon: "Em breve",
      fit: "Ajustar",
      zoomOut: "Reduzir zoom",
      zoom: "Zoom da linha de tempo",
      zoomIn: "Aumentar zoom",
      seek: "Procurar",
      trimStart: "Aparar o início do clipe",
      trimEnd: "Aparar o fim do clipe",
      removeSplit: "Remover divisão em {time}",
    },
  },
  screenshotEditor: {
    loading: "A carregar o editor…",
    imageError: {
      decode: "Falha ao descodificar a imagem da captura de ecrã.",
      fetch:
        "Não foi possível carregar a imagem da captura de ecrã. O bucket pode ter perdido o acesso CORS.",
    },
    header: {
      back: "Voltar à captura de ecrã",
      reset: "Repor edições",
      undo: "Anular",
      undoTooltip: "Anular ({key})",
      redo: "Refazer",
      redoTooltip: "Refazer ({key})",
      finish: "Concluir",
    },
    saveError: {
      notMounted: "Editor não montado",
      noCanvas: "Não foi possível obter a tela de exportação",
      workerCrashed: "O worker de codificação PNG falhou",
    },
    tools: {
      text: "Texto",
      rect: "Retângulo",
      arrow: "Seta",
      background: "Fundo",
    },
    background: {
      title: "Adicionar um fundo",
      close: "Fechar o seletor de fundo",
      none: "Nenhum",
      gradients: {
        violet: "Violeta",
        sunset: "Pôr do sol",
        orchid: "Orquídea",
        forest: "Floresta",
        flamingo: "Flamingo",
        citrus: "Citrinos",
        arctic: "Ártico",
        ocean: "Oceano",
        deep: "Profundo",
      },
      solid: "Cor sólida {color}",
      custom: "Escolher uma cor personalizada",
    },
    inspector: {
      color: "Cor {color}",
      size: "{n}px",
      duplicate: "Duplicar",
    },
    textPrompt: "Texto",
  },
  canvas: {
    meta: {
      title: "Tela",
      description: "Um quadro em branco para desenhar enquanto grava.",
    },
    loading: "A carregar a tela…",
    tools: {
      select: "Selecionar",
      hand: "Mão",
      pen: "Caneta",
      highlighter: "Marcador",
      rect: "Retângulo",
      ellipse: "Elipse",
      arrow: "Seta",
      line: "Linha",
      text: "Texto",
      eraser: "Borracha",
    },
    shortcut: "{label} · {key}",
    colour: "Cor {colour}",
    stroke: "Traço {width}",
    hint: "Desloque para mover · {mod} e desloque para fazer zoom · mantenha {space} premida para arrastar",
    textPlaceholder: "Escreva…",
    history: {
      undo: "Anular",
      redo: "Refazer",
      clear: "Limpar o quadro",
    },
    zoom: {
      out: "Reduzir zoom",
      reset: "Repor zoom",
      in: "Aumentar zoom",
    },
    extensionPrompt: {
      title: "Gravar esta tela",
      description:
        "Adicione a extensão CaptureFlow para gravar o ecrã e a câmara enquanto desenha e, depois, partilhe um link.",
      dismiss: "Agora não",
      install: "Adicionar ao Chrome",
    },
  },
};

export default messages;

import type { AppMessages } from "../messages";

const messages: AppMessages = {
  common: {
    cancel: "Cancelar",
    save: "Salvar",
    saving: "Salvando…",
    delete: "Excluir",
    deleting: "Excluindo…",
    remove: "Remover",
    close: "Fechar",
    back: "Voltar",
    continue: "Continuar",
    confirm: "Confirmar",
    done: "Concluído",
    edit: "Editar",
    copy: "Copiar",
    copied: "Copiado",
    search: "Buscar",
    loading: "Carregando…",
    retry: "Tentar de novo",
    learnMore: "Saiba mais",
    language: "Idioma",
    themeToLight: "Mudar para o tema claro",
    themeToDark: "Mudar para o tema escuro",
    somethingWrong: "Algo deu errado. Tente de novo.",
    pageFailed: "Não foi possível carregar esta página.",
    partFailed: "Não foi possível carregar esta parte.",
    failedBody: "Algo deu errado. Tente de novo ou recarregue a página.",
    reload: "Recarregar página",
  },
  auth: {
    signedInAs: "Você entrou como {email}.",
    errors: {
      generic: "Algo deu errado. Tente de novo.",
      network: "Erro de rede. Tente de novo.",
    },
    login: {
      metaTitle: "Entrar",
      signInTitle: "Que bom ver você de novo",
      signInDescription: "Entre com Google, GitHub ou seu e-mail",
      signUpTitle: "Crie sua conta",
      signUpDescription: "Cadastre-se com Google, GitHub ou seu e-mail",
      inviteTitle: "Participe de {workspace}",
      inviteDescription:
        "{inviter} convidou você. Entre ou crie uma conta com {email} para aceitar.",
      continueWith: "Continuar com {provider}",
      or: "Ou",
      emailLabel: "E-mail",
      emailPlaceholder: "you@example.com",
      emailInvalid: "Digite um e-mail válido.",
      continueWithEmail: "Continuar com e-mail",
      askForInvite: "Precisa de uma conta? Peça um convite a um administrador.",
      haveAccount: "Já tem uma conta? {action}",
      haveAccountAction: "Entrar",
      noAccount: "Não tem uma conta? {action}",
      noAccountAction: "Cadastre-se",
      changeEmail: "Alterar",
      nameLabel: "Nome",
      namePlaceholder: "Seu nome",
      passwordLabel: "Senha",
      newPasswordPlaceholder: "Pelo menos 12 caracteres",
      passwordTooShort: "Use pelo menos 12 caracteres.",
      passwordMissing: "Digite sua senha.",
      signInSubmit: "Entrar",
      signUpSubmit: "Criar conta",
      terms:
        "Ao continuar, você concorda com nossos {terms} e nossa {privacy}.",
      termsLink: "Termos",
      privacyLink: "Política de Privacidade",
    },
    verify: {
      title: "Confira seu e-mail",
      description:
        "Enviamos um link para {email}. Abra-o para concluir a configuração da sua conta.",
      resend: "Reenviar e-mail",
      resent: "Reenviado",
      resendFailed: "Não foi possível enviar o e-mail. Tente de novo.",
      wrongAddress: "Endereço errado? {action}",
      wrongAddressAction: "Use outro e-mail",
    },
    oauthErrors: {
      unfinished: "O login não foi concluído. Tente de novo.",
      inviteOnly:
        "Este CaptureFlow é só para convidados. Peça um convite a um administrador.",
      allowedDomains:
        "Cadastre-se com um endereço {domains}, ou peça um convite a um administrador.",
      providerDomains:
        "Cadastre-se com uma conta do Google ou do GitHub com endereço {domains}.",
      domainChoice: "{first} ou {second}",
    },
    inviteFallbacks: {
      workspace: "um workspace do CaptureFlow",
      inviter: "Alguém da equipe",
    },
    setPassword: {
      title: "Defina sua senha",
      description:
        "Escolha uma senha para {email}. Você entrará na conta em seguida.",
      passwordLabel: "Nova senha",
      passwordPlaceholder: "Pelo menos 12 caracteres",
      submit: "Salvar senha",
      expiredTitle: "Este link não funciona mais",
      expiredDescription:
        "Ele já foi usado ou expirou. Peça um novo a um administrador.",
      goToSignIn: "Ir para o login",
    },
    invite: {
      title: "Você recebeu um convite",
      asViewer:
        "Você recebeu um convite para participar de {workspace} no CaptureFlow como espectador: você pode assistir e comentar tudo o que for compartilhado lá.",
      asMember:
        "Você recebeu um convite para participar de {workspace} no CaptureFlow como membro: você pode gravar nele e compartilhar com a equipe.",
      accept: "Aceitar convite",
      databaseUnavailable: "Banco de dados indisponível",
      invalidTitle: "O convite não é mais válido",
      invalidBody:
        "Este link expirou ou já foi usado. Peça ao proprietário do workspace para enviar um novo convite.",
      wrongAccountTitle: "Conta errada",
      wrongAccountBody:
        "Este convite foi enviado para {invited}, mas você entrou como {current}. Saia e entre com o endereço convidado para aceitar.",
      goToDashboard: "Ir para o painel",
      signOut: "Sair",
    },
    handoff: {
      signingIn: "Entrando…",
      returning: "Voltando ao CaptureFlow…",
      open: "Abrir o CaptureFlow",
      hint: "Se nada acontecer, clique no botão acima. Você pode fechar esta aba quando o app para desktop reabrir.",
      extensionDone: "Você entrou como {email}. Pode fechar esta aba.",
      extensionUnreachable:
        "Não foi possível conectar à extensão do CaptureFlow. Verifique se ela está instalada e clique no ícone dela para tentar de novo.",
      extensionUnverified:
        "Não foi possível verificar a extensão. Reinstale-a e tente de novo.",
    },
  },
  shell: {
    record: {
      newRecording: "Nova gravação",
    },
    nav: {
      toggleSidebar: "Alternar barra lateral",
      dashboard: "Painel",
      recordings: "Gravações",
      screenshots: "Capturas de tela",
      canvas: "Canvas",
      workspaceGroup: "Workspace",
      members: "Membros",
      settings: "Configurações",
      personal: "Pessoal",
      workspace: "Workspace",
      billing: "Cobrança",
      admin: "Administração",
    },
    upgradeCard: {
      title: "Faça upgrade do seu workspace",
      description:
        "O Gratuito tem {recordings} gravações por pessoa na qualidade economia de dados. Os planos pagos removem os limites, a partir de {price} por membro.",
      viewPlans: "Ver planos",
    },
    topBar: {
      upgrade: "Fazer upgrade",
    },
    workspaceSwitcher: {
      switchWorkspace: "Trocar de workspace",
      summary: "one:Padrão · {n} membro|other:Padrão · {n} membros",
      workspaces: "Workspaces",
      owned: "Pertence a você",
      joined: "Você entrou",
      newWorkspace: "Novo workspace",
      inviteMembers: "Convidar membros",
    },
    drawer: {
      open: "Abrir menu do workspace",
      title: "Menu do workspace",
    },
    search: {
      prompt: "Buscar nas suas gravações e capturas de tela",
      clear: "Limpar busca",
      results: "Resultados da busca",
      hint: "Busque suas gravações e capturas de tela pelo título.",
      noMatches: "Nenhum resultado",
      kind: {
        recording: "gravação",
        screenshot: "captura de tela",
      },
    },
    account: {
      menu: "Menu da conta",
      nav: {
        billing: "Cobrança",
        devices: "Dispositivos conectados",
        settings: "Configurações",
        support: "Falar com o suporte",
      },
      freePlan: "Gratuito",
      signOut: "Sair",
      signingOut: "Saindo…",
    },
    theme: {
      label: "Tema",
      light: "Claro",
      dark: "Escuro",
      system: "Sistema",
    },
    notifications: {
      title: "Notificações",
      subtitle: "Convites e mudanças nos seus workspaces.",
      bellUnread:
        "one:Notificações, {n} não lida|other:Notificações, {n} não lidas",
      viewAll: "Ver todas",
      menuEmpty:
        "Você está em dia. Convites, novos colegas de equipe e mudanças de função aparecem aqui.",
      pageEmpty:
        "Você está em dia. Quando alguém convidar você, entrar no seu workspace ou mudar sua função, você verá aqui.",
      accept: "Aceitar",
      decline: "Recusar",
      unread: "Não lida",
      someone: "Alguém",
      message: {
        invited: {
          member:
            "{actor} convidou você para participar de {workspace} como membro",
          viewer:
            "{actor} convidou você para participar de {workspace} como espectador",
        },
        joined: {
          member: "{actor} entrou em {workspace} como membro",
          viewer: "{actor} entrou em {workspace} como espectador",
        },
        seatRequested: "{actor} solicitou uma licença paga em {workspace}",
        seatDenied: "{actor} recusou sua solicitação de licença em {workspace}",
        roleChanged: {
          member: "{actor} tornou você membro em {workspace}",
          viewer: "{actor} tornou você espectador em {workspace}",
        },
        downgraded: "{actor} mudou você para espectador em {workspace}",
        keepRecordingUntil: "Você pode continuar gravando até {date}.",
        removed: "{actor} removeu você de {workspace}",
      },
      acceptErrors: {
        failed: "Não foi possível aceitar o convite",
        signedOut: "Entre para aceitar",
        invalid: "Este convite expirou ou foi cancelado",
        emailMismatch: "Este convite é para outro endereço de e-mail",
        alreadyMember: "Você já está neste workspace",
      },
    },
    mobileNav: {
      open: "Abrir menu",
      close: "Fechar menu",
      docs: "Docs",
      star: "Dê uma estrela no GitHub",
      signIn: "Entrar",
      getStarted: "Começar",
    },
    skeletons: {
      avatar: "Avatar",
      workspaceName: "Nome do workspace",
      workspaceLogo: "Logotipo do workspace",
    },
  },
  library: {
    dashboard: {
      welcome: "Que bom ver você de novo",
      welcomeName: "Que bom ver você de novo, {name}",
      openCanvas: "Abrir o canvas",
      newRecording: "Nova gravação",
      stats: {
        recordings: "Gravações",
        plusScreenshots:
          "one:Mais {count} captura de tela|other:Mais {count} capturas de tela",
        noScreenshots: "Nenhuma captura de tela ainda",
        views: "Visualizações",
        viewsAverage: "{count} por gravação, em média",
        noViews: "Nenhuma visualização ainda",
        recorded: "Tempo gravado",
        recordedAverage: "{duration} por gravação, em média",
        nothingRecorded: "Nada gravado ainda",
        recordingsLeft: "Gravações restantes",
        leftOfAllowance: "{left} de {allowance}",
        freePlanLimit: "Plano gratuito, até {minutes} min cada",
      },
      recordedTime: {
        minutes: "{minutes} min",
        hours: "{hours} h",
        hoursMinutes: "{hours} h {minutes} min",
      },
      recent: {
        title: "Gravações recentes",
        all: "Todas as gravações",
        empty: "Nada foi compartilhado neste workspace ainda.",
        views: "one:{n} visualização|other:{n} visualizações",
        comments: "one:{n} comentário|other:{n} comentários",
        reactions: "one:{n} reação|other:{n} reações",
      },
      start: {
        title: "Comece a gravar com o {product}",
        surfacesLabel: "Onde gravar",
        surfaces: {
          extension: "Extensão",
          desktop: "App para desktop",
          canvas: "Canvas",
        },
        extension: {
          description:
            "Grave qualquer aba, janela ou a tela inteira pela barra de ferramentas e receba um link que você pode compartilhar com qualquer pessoa.",
          record: "Gravar agora",
          addToChrome: "Adicionar ao Chrome",
        },
        desktop: {
          description:
            "Um app nativo para Mac que grava sua tela e câmera com o áudio do sistema está a caminho. Até lá, a extensão grava qualquer aba, janela ou a tela inteira.",
          download: "Baixar para Mac",
          comingSoon: "Em breve",
        },
        canvas: {
          description:
            "Um quadro em branco com canetas, formas e texto para desenhar enquanto você grava, quando não há uma página para mostrar.",
        },
      },
    },
    recording: {
      pageTitle: "Gravações",
      count: "one:{n} gravação|other:{n} gravações",
      untitled: "Gravação sem título",
      aiGenerated: "Gerada por IA",
      processing: "Processando",
      noMatches: "Nenhuma gravação corresponde a estes filtros.",
      empty:
        "Você ainda não criou nenhum link de gravação. Grave no app do CaptureFlow para desktop e suas gravações aparecerão aqui.",
      selectAll: "Selecionar todas as gravações",
      selected: "one:{n} gravação selecionada|other:{n} gravações selecionadas",
      open: "Abrir gravação",
      edit: "Editar gravação",
      share: "Compartilhar gravação",
      delete: "Excluir gravação",
      deleteTitle: "Excluir esta gravação?",
      deleteDescription:
        "O vídeo e o link dele param de funcionar imediatamente. Esta ação não pode ser desfeita.",
      deleteSelectedTitle:
        "one:Excluir {n} gravação?|other:Excluir {n} gravações?",
    },
    screenshot: {
      pageTitle: "Capturas de tela",
      count: "one:{n} captura de tela|other:{n} capturas de tela",
      untitled: "Captura de tela sem título",
      numbered: "Captura de tela {id}",
      noMatches: "Nenhuma captura de tela corresponde a estes filtros.",
      empty:
        "Nenhuma captura de tela ainda. Abra o CaptureFlow → aba Screenshot → escolha Display, Window ou Area para capturar. Sua captura de tela aparece aqui automaticamente.",
      selectAll: "Selecionar todas as capturas de tela",
      selected:
        "one:{n} captura de tela selecionada|other:{n} capturas de tela selecionadas",
      open: "Abrir captura de tela",
      edit: "Editar captura de tela",
      share: "Compartilhar captura de tela",
      delete: "Excluir captura de tela",
      deleteTitle: "Excluir esta captura de tela?",
      deleteDescription:
        "A imagem e o link dela param de funcionar imediatamente. Esta ação não pode ser desfeita.",
      deleteSelectedTitle:
        "one:Excluir {n} captura de tela?|other:Excluir {n} capturas de tela?",
    },
    filters: {
      access: "Acesso",
      sort: "Ordenar",
      current: "{label}: {value}",
      accessOptions: {
        all: "Qualquer acesso",
        public: "Público",
        workspace: "Workspace",
        private: "Privado",
      },
      sortOptions: {
        newest: "Mais recentes primeiro",
        oldest: "Mais antigas primeiro",
        views: "Mais vistas",
      },
    },
    card: {
      select: "Selecionar {title}",
      moreActions: "Mais ações",
      rename: "Renomear",
      unknownAuthor: "Desconhecido",
    },
    selection: {
      deleteDescription: "Os links param de funcionar imediatamente.",
      deleteFailed:
        "Não foi possível excluir {failed} de {count}. O restante foi excluído.",
      clear: "Limpar",
    },
    pager: {
      label: "Páginas",
      previous: "Página anterior",
      next: "Próxima página",
    },
    visibility: {
      label: "Visibilidade",
      labels: {
        public: "Público",
        workspace: "Workspace",
        private: "Privado",
      },
      descriptions: {
        public: "Qualquer pessoa com o link pode ver",
        workspace: "Só membros do workspace que fizeram login podem ver",
        private: "Só você pode ver",
      },
      workspaceNamed: "Workspace · {name}",
    },
    share: {
      title: "Compartilhar",
      embed: "Incorporar",
      embedPublic: "Toca onde quer que o código seja colado.",
      embedRestricted: "Toca só para quem já pode abrir o link.",
      copyCode: "Copiar código",
      generalAccess: "Acesso geral",
      generalAccessCurrent: "Acesso geral: {access}",
      copyLink: "Copiar link",
      linkCopied: "Link copiado",
      shareAt: "Compartilhar a partir de {time}",
      socialHeading: "Compartilhar em",
      socialText: "Confira “{title}”",
      email: "E-mail",
    },
    editableTitle: {
      label: "Título da gravação",
      rename: "Renomear gravação",
    },
  },
  members: {
    title: "Membros",
    databaseUnavailable: "Banco de dados indisponível.",
    role: "Função",
    status: "Status",
    roles: {
      owner: "Administrador",
      member: "Membro",
      viewer: "Espectador",
    },
    roleHints: {
      member: {
        does: "Grava neste workspace.",
        costs: "Uma licença paga no Light e no Pro.",
      },
      viewer: {
        does: "Assiste e comenta.",
        costs: "Sempre gratuito.",
      },
    },
    statuses: {
      active: "Ativo",
      invited: "Convidado",
    },
    seatSummary: {
      members: "one:{n} membro|other:{n} membros",
      viewers: "one:{n} espectador|other:{n} espectadores",
      paidSeats: "one:{n} licença paga|other:{n} licenças pagas",
      membersAndViewers: "{members} e {viewers}",
      onPaidSeats:
        "{people} em {seats}. Cada membro ocupa uma licença; espectadores são gratuitos.",
      membersFree: "{people}. Membros são gratuitos neste plano.",
      freePlan:
        "{people}. Plano gratuito: cada membro tem {recordings} gravações de até {minutes} minutos; espectadores assistem e comentam.",
      planTitle: "Plano {plan}",
      paidPlanTitle: "Plano pago",
      freePlanTitle: "Plano gratuito",
      upgrade: "Fazer upgrade do workspace",
    },
    table: {
      intro: "Membros gravam aqui; espectadores assistem e comentam.",
      ownerIntro:
        "Como proprietário, você pode convidar, remover e mudar funções.",
      searchPlaceholder: "Nome ou endereço de e-mail",
      searchLabel: "Buscar membros",
      allRoles: "Todas as funções",
      everyone: "Todos",
      columns: {
        name: "Nome",
        dateAdded: "Adicionado em",
        email: "Endereço de e-mail",
        actions: "Ações",
      },
      empty: "Ninguém corresponde a estes filtros.",
      downgradeNote: "Espectador a partir de {date} · {keep}",
      keepAsMember: "Manter como membro",
      revoke: "Revogar",
    },
    seatRequests: {
      title: "Solicitações de licença",
      description:
        "Estes espectadores pediram para gravar. Quem for aprovado se torna membro.",
      descriptionPaid:
        "Estes espectadores pediram para gravar. Quem for aprovado se torna membro, o que adiciona uma licença paga.",
      asked: "{email} · pediu em {date}",
      deny: "Recusar",
      approve: "Aprovar",
    },
    seatConfirm: {
      addTitle: "Dar uma licença paga a {name}?",
      addBody:
        "Membros gravam, então cada um ocupa uma licença paga. Seu plano {plan} passa de {seats} para {nextSeats} licenças, de {before} para {after} por mês.",
      addBodyYearly:
        "Membros gravam, então cada um ocupa uma licença paga. Seu plano {plan} passa de {seats} para {nextSeats} licenças, de {before} para {after} por mês, com cobrança anual.",
      addInvoice:
        "O restante deste período de cobrança é adicionado à sua próxima fatura.",
      addConfirm: "Adicionar licença paga",
      removeTitle: "Mudar {name} para espectador?",
      removeBody:
        "{name} continua gravando até {date}, o fim do período que você já pagou. Depois, passa a ser espectador, que pode assistir e comentar, mas não gravar.",
      removePlan:
        "A partir de então, seu plano {plan} passa de {seats} para {nextSeats} licenças, de {before} para {after} por mês.",
      removePlanYearly:
        "A partir de então, seu plano {plan} passa de {seats} para {nextSeats} licenças, de {before} para {after} por mês, com cobrança anual.",
      removeConfirm: "Mudar para espectador",
    },
    remove: {
      label: "Remover {name} do workspace",
      title: "Remover {name} de {workspace}?",
      body: "A pessoa perde o acesso imediatamente. As gravações e capturas de tela dela ficam no workspace.",
      freesSeat:
        "Isso libera a licença paga dela: seu plano passa de {seats} para {nextSeats} licenças.",
    },
    leave: {
      button: "Sair",
      title: "Sair de {workspace}?",
      body: "Você perderá o acesso às gravações e capturas de tela dele. Tudo o que você gravou lá fica no workspace.",
      comeBack: "Para voltar, alguém precisa convidar você de novo.",
      confirm: "Sair do workspace",
    },
    invite: {
      trigger: "Convidar membros",
      title: "Convidar membros para {workspace}",
      titleOwnWorkspace: "Convidar membros para seu workspace",
      description:
        "Eles receberão um e-mail com um link que expira em 7 dias. Garanta que eles entrem com o mesmo endereço.",
      removeEmail: "Remover {email}",
      addEmails: "Adicionar e-mails",
      separatorHint: "Separe os e-mails com espaço, vírgula ou Enter.",
      paidSeatNote:
        "Cada membro que aceitar adiciona uma licença paga ao seu plano {plan}, {price} por mês cada. O restante deste período vai para sua próxima fatura.",
      noEmails: "Adicione pelo menos um e-mail",
      invalidEmails: "E-mail inválido: {emails}",
      failed: "Falha",
      sent: "one:{n} convite enviado.|other:{n} convites enviados.",
      sending: "Enviando…",
      submit: "Enviar convites",
    },
    actions: {
      emailRequired: "Digite um endereço de e-mail",
      emailInvalid: "Este e-mail não parece válido",
      ownWorkspace: "Você já está no seu próprio workspace",
      alreadyMember: "Essa pessoa já é membro deste workspace",
      emailNotSent:
        "O convite foi criado, mas o envio do e-mail falhou. Copie o link na lista de pendentes.",
      invitationSent: "Convite enviado para {email}",
      alreadyRecording: "Você já pode gravar aqui",
    },
  },
  settings: {
    saved: "Salvo",
    errors: {
      ownerOnly: "Só o proprietário do workspace pode alterar isto",
      databaseUnavailable: "Banco de dados indisponível",
      saveFailed: "Não foi possível salvar — tente de novo",
    },
    upload: {
      uploading: "Enviando…",
      missing: "Escolha um arquivo de imagem",
      failed: "Falha no envio",
      failedReason: "Falha no envio: {reason}",
    },
    personal: {
      title: "Configurações pessoais",
      account: {
        title: "Conta",
        description:
          "Como você aparece para colegas de equipe e para quem assiste às suas gravações.",
      },
      preferences: {
        title: "Preferências",
        description: "A aparência e o idioma do CaptureFlow para você.",
      },
      languageDescription: "O idioma em que o CaptureFlow é exibido para você.",
    },
    avatar: {
      label: "Avatar",
      change: "Alterar avatar",
      removing: "Removendo…",
      hint: "JPG, PNG, WebP ou GIF. Máx. 2 MB.",
      tooLarge: "O avatar deve ter no máximo 2 MB",
      badType: "O avatar deve ser PNG, JPEG, WebP ou GIF",
    },
    account: {
      name: {
        label: "Nome completo",
        placeholder: "Seu nome",
        description:
          "Exibido em gravações, capturas de tela e linhas de atividade.",
        required: "O nome é obrigatório.",
        updateFailed: "Não foi possível atualizar o nome.",
      },
      email: {
        label: "Endereço de e-mail",
        description: "Usado para entrar. Fale com o suporte para alterar.",
      },
      userId: {
        label: "ID do usuário",
        copy: "Copiar ID do usuário",
        description: "Informe este ID ao falar com o suporte.",
      },
      saveChanges: "Salvar alterações",
    },
    workspace: {
      title: "Configurações do workspace",
      tabs: {
        label: "Seções das configurações",
        general: "Geral",
        security: "Segurança",
      },
      general: {
        title: "Geral",
        description:
          "O nome e o logotipo que identificam este workspace no seletor, na página de membros e nas prévias de compartilhamento.",
      },
      name: {
        title: "Nome do workspace",
        description: "O nome exibido para seu workspace.",
        empty: "O nome do workspace não pode ficar vazio",
        tooLong: "O nome do workspace é longo demais (máx. {max} caracteres)",
      },
      logo: {
        title: "Logotipo do workspace",
        description:
          "Exibido ao lado do nome do workspace. PNG, JPEG, WebP, GIF ou SVG, máx. 2 MB.",
        upload: "Enviar logotipo",
        replace: "Trocar logotipo",
        tooLarge: "O logotipo deve ter no máximo 2 MB",
        badType: "O logotipo deve ser PNG, JPEG, WebP, GIF ou SVG",
      },
      permissions: {
        title: "Permissões padrão",
        description:
          "Configurações aplicadas a cada nova gravação e captura de tela no workspace.",
      },
      recordingAccess: {
        title: "Acesso de gravação",
        description:
          "Decida se colegas de equipe podem publicar gravações e capturas de tela neste workspace.",
        allow: {
          title: "Permitir que colegas de equipe publiquem aqui",
          body: "Membros podem gravar neste workspace.",
        },
        ownerOnly: {
          title: "Só o proprietário do workspace",
          body: "Os uploads de colegas de equipe vão para o workspace pessoal deles.",
        },
      },
    },
    devices: {
      title: "Dispositivos conectados",
      count: "one:{n} dispositivo conectado|other:{n} dispositivos conectados",
      empty:
        "Nenhum dispositivo conectado. Abra o app do CaptureFlow para desktop e clique em Sign in na barra de gravação para vincular esta conta.",
      unlabelled: "Dispositivo sem nome",
      added: "Adicionado em {date}",
      addedLastUsed: "Adicionado em {date} · último uso em {lastUsed}",
      neverUsed: "Nunca usado",
      revoke: {
        action: "Revogar",
        title: "Desconectar este dispositivo?",
        description: "Ele precisará entrar de novo para gerenciar gravações.",
      },
    },
  },
  billing: {
    chargedInUsd: "Cobrado em dólares americanos.",
    shownIn:
      "Os preços são exibidos em {currency}. A cobrança é feita em dólares americanos.",
    page: {
      title: "Cobrança",
      subtitle: "Seu plano e quanto você já usou dele.",
      workspaceLabel: "Workspace · {name}",
      manageSubscription: "Gerenciar assinatura",
      upgradeWorkspace: "Fazer upgrade do workspace",
      storage: "Armazenamento do workspace",
      usedOfLimit: "{used} de {limit}",
      usedNoLimit: "{used} — sem limite",
    },
    loading: {
      plan: "Plano",
      usage: "Uso",
    },
    counts: {
      members: "one:{n} membro|other:{n} membros",
      paidSeats: "one:{n} licença paga|other:{n} licenças pagas",
      freeViewers:
        "one:{n} espectador gratuito|other:{n} espectadores gratuitos",
    },
    plan: {
      free: "Gratuito",
      paid: "Pago",
      billedMonthly: "Cobrança mensal",
      billedYearly: "Cobrança anual",
      freeSummary:
        "{members} · até {recordings} gravações por pessoa, {minutes} minutos cada, qualidade economia de dados",
    },
    status: {
      onTrial: "Em teste",
      active: "Ativo",
      paused: "Pausado",
      pastDue: "Falha no pagamento",
      unpaid: "Não pago",
      cancelled: "Cancelado",
      expired: "Expirado",
    },
    details: {
      youPay: "Você paga",
      amountPerMonth: "{amount} por mês",
      amountPerYear: "{amount} por ano",
      seatsMonthly:
        "one:{n} licença × {price} por mês|other:{n} licenças × {price} por mês",
      seatsYearly:
        "one:{n} licença × {price} por mês, {total} por mês com cobrança anual|other:{n} licenças × {price} por mês, {total} por mês com cobrança anual",
      nextPayment: "Próximo pagamento",
      ends: "Término",
      endOfPeriod: "No fim deste período",
      amountOnDate: "{amount} em {date}",
      firstPaymentPending: "Quando o primeiro pagamento for confirmado",
      estimate: "{base} · {change}, estimativa",
      baseForSeats:
        "one:{amount} por {n} licença|other:{amount} por {n} licenças",
      seatsAdded:
        "one:{amount} por {n} licença adicionada neste período|other:{amount} por {n} licenças adicionadas neste período",
      seatsRemoved:
        "one:{amount} de crédito por {n} licença removida neste período|other:{amount} de crédito por {n} licenças removidas neste período",
      seatChanges: "{amount} por mudanças de licenças neste período",
      seats: "Licenças",
      seatsAndViewers: "{seats}, {viewers}",
      billedTo: "Faturado para",
      paymentMethod: "Forma de pagamento",
      cardEnding: "{brand} com final {last4}",
      card: "Cartão",
      updateCard: "Atualizar",
    },
    switchPlan: {
      switchTo: "Mudar para o {plan}",
      title: "Mudar para o {plan}?",
      priceMonthly:
        "one:Sua {n} licença passa de {before} para {after} por mês.|other:Suas {n} licenças passam de {before} para {after} por mês.",
      priceYearly:
        "one:Sua {n} licença passa de {before} para {after} por mês, com cobrança anual.|other:Suas {n} licenças passam de {before} para {after} por mês, com cobrança anual.",
      benefits:
        "O {plan} grava em todas as qualidades, até 60 fps, e adiciona edição por IA.",
      timing:
        "Começa agora. A diferença pelo restante deste período de cobrança é adicionada à sua próxima fatura.",
      errors: {
        failed: "Não foi possível mudar o plano",
        unknownPlan: "Plano desconhecido",
        billingUnavailable: "A cobrança está indisponível",
        noSubscription: "Este workspace não tem assinatura ativa",
        cancelled: "Retome a assinatura antes de mudar o plano",
        unavailable: "Mudanças de plano não estão disponíveis no momento",
        rejected: "A cobrança não aceitou a mudança. Tente de novo.",
      },
    },
    upgrade: {
      title: "Fazer upgrade de {name}",
      billingCycle: "Ciclo de cobrança",
      cycles: {
        monthly: "Mensal",
        annual: "Anual",
      },
      annualSaving: "economize {percent}%",
      seatPicker: {
        title: "Quem recebe uma licença paga",
        selected: "{seats} de {total}",
        description:
          "As pessoas marcadas gravam e são cobradas. As demais são espectadores gratuitos, que podem assistir, comentar e reagir, mas não gravar. As funções mudam quando você faz o upgrade.",
        selectAll: "Selecionar todos",
        clear: "Limpar",
        you: "(você)",
        paidSeat: "Licença paga",
        viewer: "Espectador",
      },
      perMonth: "por mês",
      seatsPrice: "one:{n} licença × {price}|other:{n} licenças × {price}",
      viewersFree:
        "one:{n} espectador gratuito|other:{n} espectadores gratuitos",
      priceWithViewers: "{seats}, {viewers}",
      priceYearly: "{seats}, com cobrança anual",
      priceWithViewersYearly: "{seats}, {viewers}, com cobrança anual",
      upgradeTo: "Fazer upgrade para o {plan}",
      checkoutUnavailable: "Checkout não configurado",
    },
    requestSeat: {
      request: "Pedir para gravar",
      requested: "Licença solicitada",
      hint: "Você é espectador aqui. Peça uma licença paga ao proprietário para poder gravar.",
      requestedHint:
        "O pedido foi enviado ao proprietário. Você poderá gravar assim que ele aprovar.",
      failed: "Não foi possível enviar a solicitação",
    },
  },
  actions: {
    missingSlug: "Slug ausente",
    recordingNotFound: "Gravação não encontrada",
    backgroundMissing: "Escolha uma imagem para enviar",
    backgroundTooLarge: "As imagens podem ter até 5 MB",
    backgroundBadType: "Use uma imagem PNG, JPEG ou WebP",
    backgroundFailed: "Não foi possível enviar a imagem. Tente de novo.",
    invalidVisibility: "Visibilidade inválida",
    deleteVideoFailed: "Não foi possível excluir o arquivo de vídeo: {reason}",
    transcriptNotFound: "Transcrição não encontrada",
    transcriptEmpty:
      "A transcrição não pode ficar vazia. Redefina-a em vez disso.",
    missingTokenId: "ID do token ausente",
    tokenNotFound: "Token não encontrado",
    missingScreenshotId: "ID da captura de tela ausente",
    screenshotNotFound: "Captura de tela não encontrada",
    missingImageBytes: "Bytes da imagem ausentes",
    screenshotTooLarge:
      "A captura de tela editada excede o limite de tamanho por captura de tela.",
    saveScreenshotFailed: "Não foi possível salvar a captura de tela: {reason}",
    saveFailed: "Falha ao salvar: {reason}",
    invalidCanvasDimensions: "Falha ao salvar: dimensões do canvas inválidas",
  },
  viewer: {
    meta: {
      defaultTitle: "Gravação do {product}",
      defaultDescription: "Uma gravação de tela compartilhada pelo {product}.",
      preparingTitle: "Preparando a gravação… — {product}",
      notFoundTitle: "Não encontrado",
      description:
        "Uma gravação de tela compartilhada pelo {product}. Assista no navegador, sem precisar se cadastrar.",
      descriptionTimed:
        "Uma gravação de tela de {duration} compartilhada pelo {product}. Assista no navegador, sem precisar se cadastrar.",
    },
    loading: "Carregando a gravação…",
    nav: {
      download: "Baixar",
    },
    authPrompt: {
      pricing: "Preços",
      logIn: "Entrar",
      getStarted: "Começar",
      getFree: "Experimente o {product} grátis",
    },
    postedBy: {
      label: "Publicado por",
      someone: "Alguém",
    },
    views: {
      count: "one:{count} visualização|other:{count} visualizações",
      showWhoWatched: "{views}, mostrar quem assistiu",
      viewers: "Espectadores",
      emptyTitle: "Nenhuma visualização ainda",
      emptyDescription:
        "Compartilhe o link e as pessoas que assistirem aparecerão aqui.",
      signedInViewer: "Espectador com login",
      anonymous: "Anônimo",
    },
    actions: {
      share: "Compartilhar",
      visibilityFailed: "Não foi possível atualizar a visibilidade",
      deleteFailed: "Não foi possível excluir a gravação",
    },
    requestAccess: {
      title: "Solicite acesso para ver este vídeo",
      notSharedBy: "{name} ainda não compartilhou esta gravação com você.",
      notSharedByOwner:
        "O proprietário ainda não compartilhou esta gravação com você.",
      signInHint:
        "Entre com seu e-mail de trabalho — se você já faz parte da equipe do proprietário, o acesso é liberado na hora.",
      signIn: "Entre para continuar",
      sentTitle: "Solicitação enviada",
      sentDescription:
        "Avisamos o proprietário. Você receberá um e-mail se ele conceder o acesso.",
      askingAs: "Solicitando como {email}",
      noteLabel: "Adicionar uma nota {optional}",
      noteOptional: "(opcional)",
      notePlaceholder:
        "Oi, gostaria de assistir a esta gravação da revisão de ontem.",
      sending: "Enviando…",
      submit: "Solicitar acesso",
      failed: "Algo deu errado. Tente de novo em instantes.",
    },
    pending: {
      preparingTitle: "Preparando sua gravação…",
      preparingDescription:
        "O envio ainda está terminando. Esta página se atualiza sozinha assim que a gravação estiver pronta.",
      generatingTitle: "Gerando seu vídeo…",
      generatingDescription:
        "Isso pode levar alguns minutos, então pegue um café ou um lanche ☕️🍪 A página se atualiza sozinha quando estiver pronto.",
      failedTitle: "O envio desta gravação não foi concluído",
      failedDescription:
        "O link foi criado, mas o vídeo nunca chegou. Tente o link de novo em um minuto ou faça uma nova gravação.",
      comment: "Comentar",
    },
    upgradeBanner: {
      message:
        "{usage} no plano gratuito. Faça upgrade para ter gravações ilimitadas em qualidade total.",
      usage:
        "one:{used} de {n} gravação usada|other:{used} de {n} gravações usadas",
    },
    editPanel: {
      editTitle: "Editar vídeo",
      editDescription:
        "Apare, corte, mude o visual e corrija a transcrição no editor.",
      downloadTitle: "Baixar vídeo",
      downloadDescription: "A gravação completa em MP4.",
      copyEmbed: "Copiar código de incorporação",
      embedCopied: "Código de incorporação copiado",
      embedDescription: "Cole o player em qualquer página da web.",
    },
    notFound: {
      title: "Gravação não encontrada",
      description:
        "Este link expirou ou nunca existiu. Gravações em contas gratuitas são mantidas por 30 dias a partir da última visualização.",
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
    anonymous: "Anônimo",
    jumpToMoment: "Ir para este momento",
    empty: {
      title: "Nenhuma atividade ainda",
      description:
        "As reações e os comentários dos espectadores aparecerão aqui à medida que acontecerem.",
      firstTitle: "Seja o primeiro a comentar",
      firstTitleNamed: "Seja o primeiro a comentar, {name}",
      hint: "Pressione {key} para responder ou deixe um comentário na parte de baixo deste painel.",
      focusComposer: "Focar a caixa de comentário",
    },
    composer: {
      signIn: "Entre para reagir e comentar",
      placeholder: "Deixe um comentário…",
      mention: "Mencionar alguém",
      noOneToMention: "Ninguém reagiu ou comentou ainda",
      insertEmoji: "Inserir emoji",
      searchEmoji: "Buscar emoji",
      posting: "Publicando…",
      submitAt: "Comentar em {time}",
      postFailed: "Não foi possível publicar o comentário",
    },
    comment: {
      delete: "Excluir comentário",
      deleteTitle: "Excluir este comentário?",
      deleteDescription:
        "Ele será removido para todos. Não é possível desfazer.",
      deleteFailed: "Não foi possível excluir o comentário",
    },
    reaction: {
      count: "one:{n} reação|other:{n} reações",
      delete: "Excluir reação",
      deleteMany: "one:Excluir {n} reação|other:Excluir {n} reações",
      deleteFailed: "Não foi possível excluir a reação",
    },
    transcript: {
      pendingTitle: "Transcrevendo…",
      pendingDescription:
        "A transcrição aparece aqui assim que estiver pronta.",
      failedTitle: "A transcrição não foi concluída",
      failedDescription: "Algo deu errado ao transcrever esta gravação.",
      noneTitle: "Sem transcrição",
      noneOwnerDescription:
        "Grave com o microfone ligado e uma será escrita para você.",
      noneViewerDescription: "Esta gravação foi feita sem microfone.",
      searchLabel: "Buscar na transcrição",
      noMatches: "Nenhum resultado.",
    },
    saveFailed: "Não foi possível salvar. Tente de novo.",
    summary: {
      title: "Resumo",
      add: "Adicionar",
      placeholder: "O que acontece nesta gravação?",
      empty: "Nenhum resumo ainda.",
      emptyAction: "Adicionar um resumo",
    },
    chapters: {
      title: "Capítulos",
      count: "one:{n} capítulo|other:{n} capítulos",
      addAtPlayhead: "Adicionar na posição atual",
      defaultTitle: "Capítulo {n}",
      editHint: "Um capítulo por linha, como {short} ou {long}.",
      editHintShort: "M:SS Título",
      editHintLong: "H:MM:SS Título",
      editPlaceholder: "0:00 Introdução\n0:30 Demonstração\n1:20 Encerramento",
      playing: "Reproduzindo",
      remove: "Remover capítulo",
      empty: "Nenhum capítulo ainda.",
      emptyAction: "Adicionar um na posição atual",
    },
  },
  player: {
    overlay: {
      watchAgain: "Assistir de novo",
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
        top: "Superior",
        bottom: "Inferior",
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
      clap: "Palmas",
      raisedHands: "Mãos para cima",
      eyes: "Olhos",
    },
    embed: {
      title: "Gravação do {product}",
    },
    controls: {
      buttons: {
        play: "Reproduzir",
        pause: "Pausar",
        replay: "Reproduzir de novo",
        mute: "Desativar som",
        unmute: "Ativar som",
      },
      seek: {
        forward: "Avançar {seconds} segundos",
        backward: "Voltar {seconds} segundos",
      },
      fullscreen: {
        enter: "Entrar em tela cheia",
        exit: "Sair da tela cheia",
      },
      captions: {
        enable: "Ativar legendas",
        disable: "Desativar legendas",
      },
      pip: {
        enter: "Entrar em picture-in-picture",
        exit: "Sair do picture-in-picture",
      },
      cast: {
        start: "Iniciar transmissão",
        stop: "Parar transmissão",
        connecting: "Conectando",
      },
      airplay: {
        start: "Iniciar AirPlay",
        stop: "Parar AirPlay",
      },
      slider: {
        seek: "Buscar posição",
      },
      time: {
        current: "Tempo atual",
        duration: "Duração",
        position: "{current} de {duration}",
        unknown: "Mídia não carregada, tempo desconhecido.",
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
        paused: "Pausado",
        playing: "Reproduzindo",
        fullscreen: "Tela cheia",
        pip: "Picture-in-picture",
        exitPip: "Sair do picture-in-picture",
        seekedTo: "Posição alterada para {time}",
      },
      container: {
        label: "Player de mídia",
      },
      errors: {
        aborted: "Você interrompeu a reprodução da mídia antes do fim.",
        network:
          "Não foi possível carregar esta mídia devido a um problema de rede ou do servidor.",
        decode:
          "Não foi possível reproduzir esta mídia. Ela pode estar corrompida ou seu navegador pode não ser compatível com o formato.",
        source:
          "Não foi possível carregar esta mídia. Ela pode estar indisponível ou seu navegador pode não ser compatível com o formato.",
        encrypted:
          "Não foi possível reproduzir esta mídia porque ela não pôde ser descriptografada.",
        unplayable: "O player não é compatível com esta mídia.",
        title: "Algo deu errado.",
        unexpected: "Ocorreu um erro inesperado.",
      },
      common: {
        ok: "OK",
      },
      menu: {
        settings: "Configurações",
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
      defaultTitle: "Captura de tela do {product}",
      description: "Uma captura de tela compartilhada pelo {product}.",
      madeWith: "Feito com o {product}",
      loading: "Carregando a captura de tela…",
    },
    authPrompt: {
      pricing: "Preços",
      logIn: "Entrar",
      getStarted: "Começar",
      getFree: "Experimente o {product} grátis",
    },
    actions: {
      edit: "Editar captura de tela",
      share: "Compartilhar",
      shareTitle: "Compartilhar captura de tela",
      copyLink: "Copiar link",
      linkCopied: "Link copiado",
      more: "Mais ações",
      delete: "Excluir captura de tela",
      deleteTitle: "Excluir esta captura de tela?",
      deleteDescription:
        "A imagem e o link dela param de funcionar imediatamente. Esta ação não pode ser desfeita.",
      visibilityFailed: "Não foi possível atualizar a visibilidade",
      deleteFailed: "Não foi possível excluir a captura de tela",
    },
    zoom: {
      expand: "Ampliar imagem",
      minimize: "Reduzir imagem",
    },
    requestAccess: {
      title: "Solicite acesso para ver esta captura de tela",
      notSharedBy:
        "{name} ainda não compartilhou esta captura de tela com você.",
      notSharedByOwner:
        "O proprietário ainda não compartilhou esta captura de tela com você.",
      signInHint:
        "Entre com seu e-mail de trabalho — se você já faz parte da equipe do proprietário, o acesso é liberado na hora.",
      signIn: "Entre para continuar",
      sentTitle: "Solicitação enviada",
      sentDescription:
        "Avisamos o proprietário. Você receberá um e-mail se ele conceder o acesso.",
      askingAs: "Solicitando como {email}",
      noteLabel: "Adicionar uma nota {optional}",
      noteOptional: "(opcional)",
      notePlaceholder:
        "Oi, gostaria de uma cópia desta captura de tela da revisão de design.",
      sending: "Enviando…",
      submit: "Solicitar acesso",
      failed: "Algo deu errado. Tente de novo em instantes.",
    },
    notFound: {
      title: "Captura de tela não encontrada",
      description:
        "Este link expirou ou nunca existiu. Capturas de tela em contas gratuitas são mantidas por 30 dias a partir da última visualização.",
    },
  },
  recordingEditor: {
    skeleton: {
      label: "Abrindo o editor",
      status: "Abrindo o editor…",
    },
    preparing: {
      title: "Preparando a gravação…",
      description:
        "A gravação ainda está sendo enviada. Esta página será atualizada automaticamente quando ela estiver pronta.",
    },
    failed: {
      title: "Falha no envio da gravação.",
      description: "Tente gravar de novo pelo app para desktop.",
    },
    saveFailed: "Não foi possível salvar",
    topBar: {
      back: "Voltar para a gravação",
      status: {
        idle: "As edições são salvas automaticamente",
        saved: "Salvo",
        error: "Não foi possível salvar",
      },
      versionHistory: "Histórico de versões (em breve)",
      undo: "Desfazer",
      undoShortcut: "Desfazer ({key})",
      redo: "Refazer",
      redoShortcut: "Refazer ({key})",
      finish: "Concluir",
    },
    panels: {
      label: "Painéis do editor",
      tabs: {
        transcript: "Transcrição",
        design: "Design",
        camera: "Câmera",
        audio: "Som",
        details: "Detalhes",
      },
      hide: {
        transcript: "Ocultar transcrição",
        design: "Ocultar design",
        camera: "Ocultar câmera",
        audio: "Ocultar som",
        details: "Ocultar detalhes",
      },
      show: {
        transcript: "Mostrar transcrição",
        design: "Mostrar design",
        camera: "Mostrar câmera",
        audio: "Mostrar som",
        details: "Mostrar detalhes",
      },
    },
    toggleOn: "Ativado",
    background: {
      title: "Fundo",
      gradients: "Gradientes",
      none: "Nenhum",
      noBackground: "Sem fundo",
      upload: "Enviar imagem",
      uploading: "Enviando…",
      uploadedImage: "Sua imagem",
      solid: "Sólido",
      solidColor: "Sólido {color}",
      customColor: "Escolher uma cor personalizada",
      colors: "Cores",
      wallpaper: "{group}: papel de parede {n}",
      wallpaperGroups: {
        general: "Geral",
        cities: "Cidades",
        blue: "Azul",
        purple: "Roxo",
        orange: "Laranja",
        dark: "Escuro",
      },
      presets: {
        violet: "Violeta",
        sunset: "Pôr do sol",
        orchid: "Orquídea",
        forest: "Floresta",
        flamingo: "Flamingo",
        citrus: "Cítrico",
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
    frame: {
      title: "Moldura",
      padding: "Margem",
      corners: "Cantos",
      shadow: "Sombra",
    },
    camera: {
      title: "Câmera",
      show: "Mostrar câmera",
      hidden: "Oculta",
      position: "Posição",
      positionHint: "Arraste o ponto ou toque em um canto",
      positionHintHidden: "Mostre a câmera para posicioná-la.",
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
        "O microfone e o som do sistema compartilham uma única faixa nesta gravação.",
    },
    details: {
      title: "Gravação",
      link: "Link",
      size: "Tamanho",
      duration: "Duração",
      views: "Visualizações",
      created: "Criada em",
    },
    transcript: {
      transcribing: "Transcrevendo…",
      unavailable: "Nenhuma transcrição disponível",
      pendingHint: "Recarregue esta página em um minuto para editá-la.",
      failedHint: "A transcrição desta gravação não foi concluída.",
      missingHint: "Grave com o microfone ligado e uma será escrita para você.",
      deleteWord: "Excluir palavra",
      deleteWords: "one:Excluir {n} palavra|other:Excluir {n} palavras",
      clearSelection: "Limpar seleção",
      hint: "Clique em uma palavra ou arraste sobre várias para selecionar; clique duas vezes para corrigir o texto.",
      resetEdits: "Redefinir edições",
      editLine: "Editar linha da transcrição",
      selectLine: "Selecionar a linha em {time}",
      restore: "Restaurar",
      saveFailed: "Não foi possível salvar",
      resetFailed: "Não foi possível redefinir",
    },
    timeline: {
      hideWaveform: "Ocultar forma de onda",
      showWaveform: "Mostrar forma de onda",
      loadingAudio: "Carregando áudio…",
      deleteSelection: "Excluir seleção",
      deleteSelectionHint:
        "Selecione palavras na transcrição ou divida a linha do tempo e escolha um segmento",
      splitAt: "Dividir em {time}",
      splitHint: "Primeiro reproduza ou arraste até um momento",
      comingSoon: "Em breve",
      fit: "Ajustar",
      zoomOut: "Diminuir zoom",
      zoom: "Zoom da linha do tempo",
      zoomIn: "Aumentar zoom",
      seek: "Buscar posição",
      trimStart: "Aparar o início do clipe",
      trimEnd: "Aparar o fim do clipe",
      removeSplit: "Remover divisão em {time}",
    },
  },
  screenshotEditor: {
    loading: "Carregando o editor…",
    imageError: {
      decode: "Falha ao decodificar a imagem da captura de tela.",
      fetch:
        "Não foi possível carregar a imagem da captura de tela. O bucket pode ter perdido o acesso CORS.",
    },
    header: {
      back: "Voltar para a captura de tela",
      reset: "Redefinir edições",
      undo: "Desfazer",
      undoTooltip: "Desfazer ({key})",
      redo: "Refazer",
      redoTooltip: "Refazer ({key})",
      finish: "Concluir",
    },
    saveError: {
      notMounted: "Editor não montado",
      noCanvas: "Não foi possível obter o canvas de exportação",
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
      close: "Fechar seletor de fundo",
      none: "Nenhum",
      gradients: {
        violet: "Violeta",
        sunset: "Pôr do sol",
        orchid: "Orquídea",
        forest: "Floresta",
        flamingo: "Flamingo",
        citrus: "Cítrico",
        arctic: "Ártico",
        ocean: "Oceano",
        deep: "Profundo",
      },
      solid: "Sólido {color}",
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
      title: "Canvas",
      description: "Um quadro em branco para desenhar enquanto você grava.",
    },
    loading: "Carregando o canvas…",
    tools: {
      select: "Selecionar",
      hand: "Mão",
      pen: "Caneta",
      highlighter: "Marca-texto",
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
    hint: "Role para mover · {mod} e role para dar zoom · segure {space} para arrastar",
    textPlaceholder: "Digite…",
    history: {
      undo: "Desfazer",
      redo: "Refazer",
      clear: "Limpar o quadro",
    },
    zoom: {
      out: "Diminuir zoom",
      reset: "Redefinir zoom",
      in: "Aumentar zoom",
    },
    extensionPrompt: {
      title: "Grave este canvas",
      description:
        "Adicione a extensão do CaptureFlow para gravar sua tela e câmera enquanto você desenha e depois compartilhar um link.",
      dismiss: "Agora não",
      install: "Adicionar ao Chrome",
    },
  },
};

export default messages;

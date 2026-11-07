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
      title: "CaptureFlow - Gravador de ecrã com links de partilha",
      description:
        "Grave o ecrã e partilhe um link com a equipa ou clientes. Gravador de ecrã de código aberto com transcrições por IA e capturas anotadas, alojável na Cloudflare.",
    },
    features: {
      title: "Funcionalidades do gravador de ecrã",
      description:
        "Grave um separador, uma janela ou o ecrã inteiro com câmara e microfone, faça capturas de ecrã anotadas e partilhe tudo como um link que a equipa pode comentar.",
    },
    pricing: {
      title: "Preços: comece grátis, um preço por membro",
      description: `Comece grátis com ${FREE_RECORDINGS} gravações. ${LIGHT} e ${PRO} têm um preço por membro, com gravações ilimitadas e IA. Ou aloje o CaptureFlow por conta própria, sem custos.`,
    },
    faq: {
      title: "FAQ: partilha, armazenamento e alojamento próprio",
      description:
        "Perguntas frequentes sobre o CaptureFlow: links de partilha, alojamento próprio na Cloudflare, limites de armazenamento e privacidade das gravações.",
    },
    download: {
      title: "Transferir o gravador de ecrã para Chrome",
      description:
        "Instale a extensão CaptureFlow para Chrome para gravar o ecrã e partilhá-lo com um link.",
    },
    enterprise: {
      title: "Empresas",
      description:
        "CaptureFlow gerido para empresas maiores: licenças para todos, condições à medida e uma única fatura. Diga-nos do que precisa.",
    },
    selfHostSetup: {
      title: "Configuração do alojamento próprio",
      description:
        "Peça a instalação do CaptureFlow na conta Cloudflare da sua empresa: o seu domínio, início de sessão só para a empresa e uma extensão do Chrome privada.",
    },
    swarmDemo: {
      title: "Demo de enxame: agentes reconstroem qualquer site em vídeo",
      description:
        "Escreva o endereço de um site e veja um enxame de cursores de agentes reconstruí-lo elemento a elemento, ao som de música. Recebe um vídeo com um link para partilhar.",
    },
  },
  nav: {
    features: "Funcionalidades",
    discover: "Descobrir",
    pricing: "Preços",
    faq: "FAQ",
    changelog: "Alterações",
    login: "Iniciar sessão",
    download: "Transferir",
    language: "Idioma",
    openMenu: "Abrir menu",
    menu: "Menu",
    main: "Principal",
    docs: "Documentação",
    resources: "Recursos",
    faqDescription: "Respostas às perguntas comuns",
    blog: "Blogue",
    blogDescription: "Guias e novidades",
    selfHosting: "Alojamento próprio",
    selfHostingDescription: "Execute-o na sua própria Cloudflare",
    community: "Comunidade",
    communityDescription: "Obtenha ajuda e converse no Discord",
    products: "Produtos",
    swarmDemo: "Demo de enxame",
    swarmDemoDescription: "Agentes reconstroem qualquer site em vídeo",
    extension: "Extensão do Chrome",
    extensionDescription: "Grave o ecrã e partilhe um link",
    agentRecorder: "Gravador para agentes",
    agentRecorderDescription: "Vídeos que o seu agente de IA cria por MCP",
    star: "Dar estrela no GitHub",
    starCount: "Dar estrela no GitHub ({stars})",
    themeToLight: "Mudar para o tema claro",
    themeToDark: "Mudar para o tema escuro",
  },
  banner: {
    label: "Beta",
    aria: "O CaptureFlow está em versão beta pública",
    title: "Chegou cedo 🎉",
    strip:
      "O CaptureFlow ainda está em versão beta, por isso muda com frequência e pode encontrar uma ou outra aresta por limar enquanto estabiliza.",
    body: "O CaptureFlow está em versão beta pública. Quase todas as semanas chega algo novo, e o que as pessoas pedem é o que se constrói primeiro.",
    cta: "Diga-me o que construir a seguir",
    close: "Fechar",
  },
  announcement: {
    badge: "Novo",
    lead: "O seu agente de IA já pode gravar por si.",
    rest: "Ligue-o uma vez, peça um vídeo e receba um link.",
    cta: "Ligar",
  },
  hero: {
    title: "Gravador de ecrã para si\ne para os seus agentes de IA",
    subtitle:
      "Grave demos, tutoriais, visitas guiadas e apresentações, ou peça à sua IA que os grave por si. Partilhe cada gravação como um link que qualquer pessoa pode ver.",
    ctaLabel: "Experimentar o CaptureFlow grátis",
    installChrome: "Instalar extensão do Chrome",
    installMac: "Transferir para macOS",
    installSoon: "Em breve",
    connectMcp: "Ligar ao MCP",
    macSoon: "Aplicação para macOS em breve",
    installOr: "ou",
    mcpCopy: "Copiar",
    mcpCopied: "Copiado",
    mcpAddToCursor: "Adicionar ao Cursor",
    badge: "Código aberto e de utilização gratuita, no {github}",
    noCreditCard: "Sem cartão de crédito",
    teaser: {
      title: "Alojamento próprio",
      body: "Execute-o na sua própria conta Cloudflare.",
      cta: "Experimentar o CaptureFlow",
    },
    demo: {
      prevAria: "Demo anterior",
      nextAria: "Demo seguinte",
      dotAria: "Mostrar demo {n} de {total}",
    },
  },
  highlights: {
    heading: "Todas as funcionalidades",
    subtitle: "Grave, edite e partilhe. Fica tudo num só lugar.",
    items: {
      recording: {
        title: "Ecrã e câmara",
        body: "Grave os dois em simultâneo",
      },
      transcripts: { title: "Transcrições", body: "Em 99 idiomas", tag: "IA" },
      editing: {
        title: "Edição pela transcrição",
        body: "Apague texto para cortar o vídeo",
        tag: "IA",
      },
      camera: {
        title: "Efeitos de câmara",
        body: "Fundos e filtros",
      },
      canvas: { title: "Tela infinita", body: "Desenhe enquanto grava" },
      screenshots: {
        title: "Capturas de ecrã anotadas",
        body: "Setas, texto e desfoque",
      },
      feedback: {
        title: "Comentários e reações",
        body: "Feedback no próprio vídeo",
      },
      summary: {
        title: "Resumos e capítulos",
        body: "Com um título para cada vídeo",
        tag: "IA",
      },
      filler: {
        title: "Remoção automática de hesitações",
        body: "Corta os «hum» e os «ah»",
        tag: "IA",
      },
    },
    cta: "Ver todas as funcionalidades",
    previews: {
      app: "Plano de lançamento",
      columns: ["A fazer", "Em curso", "Feito"],
      lines: [
        "Este é o novo fluxo.",
        "Primeiro, escolha o espaço de trabalho.",
        "Depois, partilhe o link.",
      ],
      retake: "Hum, vou começar de novo.",
      filler: [
        "[Hum,] este é o novo fluxo.",
        "Primeiro, [ah,] escolha o espaço de trabalho.",
        "Depois, [hum,] partilhe o link.",
      ],
      step: "Passo 1",
      note: "Mover isto",
      comment: "Adoro este fluxo",
      summaryTitle: "Como convidar a sua equipa",
      summaryBody: "Escolha o espaço de trabalho e partilhe o link.",
      chapters: ["Introdução", "Escolher o espaço de trabalho"],
    },
  },
  mcpFeatures: {
    heading: "Funcionalidades do MCP",
    subtitle:
      "O que o seu agente de IA pode fazer depois de ligado. Grava no seu próprio computador, com Claude Code, Codex, Cursor ou qualquer cliente MCP.",
    cta: "Ler o guia",
    items: {
      webApp: {
        title: "Gravar uma aplicação web",
        body: "Incluindo localhost",
      },
      screen: { title: "Gravar o ecrã", body: "Um monitor inteiro" },
      window: {
        title: "Gravar uma janela",
        body: "Terminal, VS Code ou Figma",
      },
      slides: {
        title: "Adicionar diapositivos",
        body: "Títulos, passos e frases finais",
      },
      voiceover: {
        title: "Adicionar narração",
        body: "Funciona no seu computador",
      },
      report: {
        title: "Escrever um relatório",
        body: "O que fez e o que falhou",
      },
      search: { title: "Pesquisar gravações", body: "Vídeos e transcrições" },
      save: {
        title: "Guardar ficheiros MP4",
        body: "Sem carregamento nem início de sessão",
      },
    },
  },
  useCases: {
    heading: "Como as equipas o utilizam",
    subtitle:
      "Exemplos do que as equipas gravam. Cada vídeo é um link que se reproduz em qualquer browser.",
    cta: "Ver como funciona",
    cards: {
      engineering: {
        title: "Engenharia",
        body: "Grave uma visita guiada a um PR ou a reprodução de um bug.",
      },
      design: {
        title: "Design",
        body: "Grave uma visita guiada a uma maquete e recolha comentários.",
      },
      support: {
        title: "Apoio ao cliente",
        body: "Responda a um pedido de apoio com uma breve visita guiada.",
      },
      updates: {
        title: "Atualizações da equipa",
        body: "Grave a atualização semanal e partilhe o link.",
      },
    },
    engineeringFile: "checkout.ts",
    engineeringPr: "PR #482",
    designApp: "trip-app",
    designBadge: "Checkout v3",
    designCardTitle: "Planeie a sua viagem",
    designColors: "Cores",
    designComment: "CTA maior?",
    supportQuestion: "Como convido a minha equipa para o espaço de trabalho?",
    supportReply: "Aqui fica uma breve visita guiada:",
    supportLink: "captureflow.dev/r/8kx2pnq4",
    updatesTitle: "Atualização semanal",
    updatesRange: "6–10 out.",
    updatesSignups: "Registos",
    updatesShipped: "Lançadas",
    updatesFeatures: "funcionalidades",
  },
  agents: {
    heading: "Ou peça ao seu agente de IA que grave as suas demos e tutoriais",
    worksWith: "Funciona com {claude}, {openai} e {cursor}.",
    cta: "Ler o guia",
    subtitle:
      "Peça por palavras simples. Grava um browser, o seu ecrã ou uma aplicação no seu próprio computador, adiciona diapositivos e narração se quiser, e entrega-lhe um link.",
    steps: [
      {
        title: "Ligue o seu agente",
        body: "Adicione o CaptureFlow ao Claude Code, Codex ou Cursor com uma linha. Precisa do Node.js 20 ou mais recente, e o seu agente inicia sessão uma vez. No Claude ou no ChatGPT, adicione-o por URL.",
      },
      {
        title: "Peça um vídeo",
        body: "Uma demo de uma funcionalidade, um tutorial, um relatório de bug ou uma apresentação narrada.",
      },
      {
        title: "Ele grava por si",
        body: "No seu computador, até uma aplicação em localhost.",
      },
      {
        title: "Adiciona diapositivos e voz",
        body: "Diapositivos de título e narração, se os quiser.",
      },
      {
        title: "Dá-lhe um link para partilhar",
        body: "Anexe-o a um pull request, publique-o no Slack ou envie-o a um cliente.",
      },
    ],
    scenes: {
      ask: {
        name: "terminal",
        badge: "agente",
        prompt: "Grava uma demo do pagamento",
        steps: [
          "A abrir a aplicação",
          "A percorrer os passos",
          "O seu link está pronto",
        ],
      },
      record: {
        url: "localhost:3000",
        badge: "demo",
        title: "Pagamento",
        fields: ["O seu nome", "Número do cartão"],
        pay: "Pagar agora",
        paid: "Pago",
      },
      voice: {
        title: "Demo do pagamento",
        subtitle: "Como pagar em três passos",
      },
      share: {
        title: "Demo do pagamento",
        link: "captureflow.dev/r/checkout",
        places: ["PR", "Slack", "Email"],
      },
    },
    chats: {
      claude:
        "No Claude, abra Customize, depois Connectors, e escolha Add custom connector. Dê-lhe o nome CaptureFlow, cole este URL e inicie sessão.",
      chatgpt:
        "No ChatGPT na web, abra Plugins, prima + e escolha Add custom MCP server. Dê-lhe o nome CaptureFlow, cole este URL, escolha OAuth, depois instale o plugin e inicie sessão. Requer um plano Business, Enterprise ou Edu.",
      limits:
        "Os chats criam vídeos de apresentação e tutoriais a partir de diapositivos nos nossos servidores, não gravações do seu computador, e usam os minutos de agente na nuvem do seu plano.",
    },
  },
  modes: {
    cta: "Começar a gravar",
    heading: "Grave o ecrã com a extensão do Chrome",
    subtitle:
      "Instale-a e carregue em gravar. Quando terminar, recebe um link que qualquer pessoa pode ver, com título, resumo, capítulos e transcrição.",
    scene: {
      timer: "0:42",
      heading: "Como funciona um reembolso",
      steps: ["Pedido", "Aprovação", "Pagamento"],
      captions: [
        "Breve explicação de como funciona um reembolso.",
        "Primeiro, o cliente envia um pedido.",
        "O apoio ao cliente aprova-o no mesmo dia.",
        "Depois, o dinheiro é enviado automaticamente.",
      ],
    },
  },
  pageHeroes: {
    home: "Início",
    features: {
      label: "Funcionalidades",
      word: "FUNCIONALIDADES",
      title: "Grave, edite e partilhe o seu ecrã",
      subtitle:
        "Grave o ecrã e a câmara. Partilhe cada gravação como um link que a sua equipa pode comentar.",
    },
    pricing: {
      label: "Preços",
      word: "PREÇOS",
      title: "Comece grátis. Pague um preço por membro.",
      subtitle:
        "O plano Gratuito cobre as suas primeiras 25 gravações. Os planos Light e Pro removem o limite. Também pode alojar o CaptureFlow por conta própria, gratuitamente.",
    },
    faq: {
      label: "FAQ",
      word: "FAQ",
      title: "Perguntas frequentes",
      subtitle:
        "Respostas sobre gravação, preços, armazenamento e alojamento próprio. Para tudo o resto, consulte a documentação.",
    },
  },
  collaboration: {
    heading: "O que pode fazer depois de gravar",
    cta: "Experimentar grátis",
    subtitle:
      "Edite o vídeo e depois partilhe-o ou incorpore-o. Convide a equipa para ver, reagir e comentar os vídeos uns dos outros.",
    categories: {
      share: {
        feature: {
          tag: "novo",
          title: "Edite o seu vídeo",
          cta: "Instalar a extensão",
          body: "Apague palavras da transcrição para as retirar do vídeo, ou corte clipes na linha de tempo. Altere o fundo, mova, redimensione ou oculte a câmara, e silencie o microfone ou o som do sistema.",
        },
        scene: {
          app: "Plano de lançamento",
          nav: ["Visão geral", "Roteiro", "Tarefas", "Documentos"],
          columns: [
            {
              name: "A fazer",
              tasks: ["Texto da página de preços", "Email de boas-vindas"],
            },
            {
              name: "Em curso",
              tasks: ["Redesenho do pagamento", "Convites da equipa"],
            },
            { name: "Feito", tasks: ["Formulário de registo beta"] },
          ],
          background: "Fundo",
          camera: "Câmara",
          shapes: ["Círculo", "Quadrado"],
          fillers: "Hesitações",
          remove: "Remover",
          transcript: {
            before: "Clique aqui para",
            fillers: ["hum,", "espere,", "desculpe,"],
            after: "partilhar o link.",
          },
          saved: "Guardado · mesmo link",
        },
      },
      embed: {
        feature: {
          title: "Partilhe ou incorpore o seu vídeo",
          cta: "Instalar a extensão",
          body: "Cole o link no Slack, no GitHub, no Notion ou num email e aparece uma pré-visualização. Também pode incorporar o leitor na sua documentação ou no seu site. Com a extensão instalada, o vídeo é reproduzido dentro de issues e pull requests do GitHub.",
        },
        scene: {
          question:
            "Pode mostrar-me como convido a minha equipa para o espaço de trabalho?",
          reply: "Claro! Aqui fica uma breve visita guiada aos passos:",
          url: "captureflow.dev/r/8kx2pnq4",
          app: "Definições",
          nav: ["Geral", "Membros", "Faturação"],
          members: "Membros",
          invite: "Convidar",
          people: [
            { initials: "AR", name: "Alex Rivera", role: "Proprietário" },
            { initials: "CK", name: "Chris Kim", role: "Membro" },
            { initials: "JB", name: "Jordan Bell", role: "Membro" },
          ],
          duration: "0:48",
        },
      },
      feedback: {
        feature: {
          title: "Colabore nos seus vídeos",
          cta: "Iniciar sessão",
          body: "Trabalhem em conjunto sem reuniões, em fusos horários diferentes. A equipa pode reagir com emojis, comentar em qualquer momento do vídeo e acompanhar com transcrições e legendas.",
        },
        scene: {
          title: "Visita guiada ao plano de lançamento",
          author: "Alex",
          age: "agora mesmo",
          duration: "1:12",
          activity: "Atividade",
          events: [
            { initials: "CK", name: "Chris", at: "0:09", emoji: "👍" },
            { initials: "JB", name: "Jordan", at: "0:17", emoji: "🔥" },
            {
              initials: "MC",
              name: "Maya",
              at: "0:27",
              text: "Adoro a nova vista de quadro",
            },
            { initials: "SL", name: "Sam", at: "0:37", emoji: "❤️" },
            {
              initials: "JB",
              name: "Jordan",
              at: "0:48",
              text: "Podemos lançar na sexta?",
            },
            {
              initials: "AR",
              name: "Alex",
              at: "0:56",
              text: "Sim, logo a seguir ao QA ✅",
            },
            { initials: "MC", name: "Maya", at: "1:05", emoji: "👏" },
          ],
        },
      },
      workspaces: {
        feature: {
          title: "Convide a sua equipa para um espaço de trabalho",
          cta: "Criar um espaço de trabalho",
          body: "As gravações de todos ficam num só espaço de trabalho. Cada vídeo pode ser público, visível para o espaço de trabalho ou privado.",
        },
        scene: {
          team: "Equipa CaptureFlow",
          members: ["1 membro", "2 membros", "3 membros"],
          memberInitials: ["AR", "CK", "JB"],
          invitePlaceholder: "Convidar por email",
          inviteEmail: "chris@acme.co, jordan@acme.co",
          invite: "Convidar",
          invited: "Enviado",
          joined: "Chris e Jordan juntaram-se 🎉",
          whoCanWatch: "Quem pode ver:",
          visibility: [
            { label: "Público", detail: "Qualquer pessoa com o link" },
            { label: "Espaço de trabalho", detail: "Só a sua equipa" },
            { label: "Privado", detail: "Só para si" },
          ],
        },
      },
    },
  },
  setupService: {
    title: "Nós configuramos tudo",
    titleHighlight: "por si",
    subtitle:
      "Fale-nos da sua empresa. Configuramos a aplicação, a extensão do Chrome, a aplicação para macOS e toda a infraestrutura por trás, tudo pronto para a sua equipa utilizar.",
    includedHeading: "Tudo o que configuramos",
    included: {
      infra: {
        title: "A aplicação, na sua infraestrutura",
        body: "Implementada na sua própria conta Cloudflare e servida a partir do seu domínio. É tudo seu.",
      },
      storage: {
        title: "Armazenamento e base de dados",
        body: "As gravações ficam no seu próprio bucket R2; os espaços de trabalho e os comentários, na sua própria base de dados.",
      },
      signin: {
        title: "Início de sessão só para a empresa",
        body: "Início de sessão com Google Workspace ou GitHub, limitado ao domínio de email da sua empresa.",
      },
      apps: {
        title: "Extensão do Chrome e aplicação para Mac",
        body: "Ambas compiladas para a sua instância, com a extensão publicada em privado para a sua equipa.",
      },
      ready: {
        title: "Pronto a gravar",
        body: "Espaços de trabalho criados e a equipa convidada, para que todos possam começar a partilhar de imediato.",
      },
      handover: {
        title: "Passagem de conhecimento",
        body: "Explicamos a quem o vai manter como o gerir e atualizar.",
      },
    },
    nextHeading: "Contacte-nos",
    nextSubheading: "Diga-nos do que precisa e entraremos em contacto consigo.",
    form: {
      company: "Empresa",
      companyPlaceholder: "Acme, Lda.",
      name: "O seu nome",
      namePlaceholder: "Jane Doe",
      email: "Email profissional",
      emailPlaceholder: "jane@acme.com",
      topic: "Em que podemos ajudar?",
      topics: [
        "Configuração do alojamento próprio",
        "Mais de 1 TB",
        "Outro assunto",
      ],
      teamSize: "Dimensão da equipa",
      teamSizes: ["1–10", "11–50", "51–200", "200+"],
      cloudflare: "Tem uma conta Cloudflare?",
      cloudflareOptions: ["Sim", "Não", "Não tenho a certeza"],
      notes: "Há mais alguma coisa que devamos saber?",
      notesPlaceholder: "A dimensão da equipa, o seu domínio, os seus prazos…",
      submit: "Enviar mensagem",
      error:
        "Não foi possível enviar o seu pedido. Tente novamente ou envie-nos um email para {email}.",
      sentTitle: "Mensagem enviada",
      sentBody: "Obrigado. Responderemos para {email}.",
      back: "Voltar ao início",
    },
  },
  swarmDemo: {
    title: "Veja agentes a reconstruir",
    titleHighlight: "qualquer site",
    subtitle:
      "Escreva o endereço de um site. Um enxame de cursores de agentes volta a desenhá-lo elemento a elemento, ao som de música, e recebe um link de vídeo para partilhar.",
    url: "Endereço do site",
    urlPlaceholder: "https://example.com",
    generate: "Gerar demo",
    generating: "A iniciar um navegador na nuvem…",
    check: "Verificar site",
    checking: "A verificar o site…",
    previewNote:
      "Esta é a página que os agentes vão reconstruir. Gere a demo quando estiver certa.",
    change: "Mudar endereço",
    note: "Grátis até 25 gravações. Inicie sessão para gerar. Cada demo gasta um ou dois minutos de agente na nuvem do seu plano e fica na sua biblioteca.",
    howHeading: "Como funciona",
    how: {
      type: {
        title: "Escreva um endereço",
        body: "Qualquer site público. A página é carregada num navegador na nuvem e cada título, imagem, botão e cartão é encontrado.",
      },
      build: {
        title: "Os agentes reconstroem tudo",
        body: "O pedido é escrito numa caixa de chat e depois um enxame de cursores coloca cada elemento enquanto a música acelera.",
      },
      share: {
        title: "Receba um link",
        body: "O vídeo abre na sua biblioteca assim que estiver pronto. Partilhe o link, transfira o ficheiro ou publique-o.",
      },
    },
    errors: {
      invalidUrl: "Introduza o endereço de um site, como example.com.",
      unreachable:
        "Não foi possível aceder a esse site. Verifique o endereço e tente novamente.",
      unavailable: "As demos não estão disponíveis neste servidor.",
      running:
        "Uma gravação sua ainda está a decorrer. Aguarde que termine e tente novamente.",
      limit:
        "Este espaço de trabalho já usou os minutos de agente na nuvem deste mês. São renovados no dia 1.",
      recordings:
        "Atingiu o limite de gravações do plano gratuito. Elimine uma gravação ou faça upgrade e tente novamente.",
      busy: "Todos os navegadores na nuvem estão ocupados neste momento. Tente novamente dentro de alguns minutos.",
      failed: "Não foi possível iniciar a demo. Tente novamente.",
    },
  },
  enterprise: {
    title: "CaptureFlow para",
    titleHighlight: "a sua empresa",
    subtitle:
      "O plano gerido para empresas que querem licenças para todos, com condições acordadas uma só vez e uma única fatura.",
    includedHeading: "O que o plano Empresas acrescenta",
    included: {
      storage: {
        title: "Armazenamento à sua medida",
        body: "Um espaço dimensionado para o que a sua empresa grava, e não uma quota por licença.",
      },
      seats: {
        title: "Licenças para todos",
        body: "Um único acordo cobre toda a empresa, seja qual for o número de pessoas que gravam.",
      },
      roadmap: {
        title: "Os seus pedidos primeiro",
        body: "As funcionalidades que a sua equipa pede passam para o topo da nossa lista.",
      },
      managed: {
        title: "Totalmente gerido",
        body: "Nós alojamos e lançamos as atualizações, por isso não tem nada para gerir.",
      },
      billing: {
        title: "Faturação anual",
        body: "Pague uma vez por ano, a um preço acordado para a sua empresa.",
      },
      support: {
        title: "Uma linha direta connosco",
        body: "As perguntas vão diretamente para quem desenvolve o CaptureFlow.",
      },
    },
    everythingHeading: "Tudo o que a sua equipa recebe",
    comingSoon: "Em breve",
    everything: {
      extension: {
        title: "Extensão do Chrome",
        body: "Grave qualquer separador ou ecrã, com um link pronto quando terminar.",
      },
      mac: {
        title: "Aplicação para Mac",
        body: "Um gravador nativo para macOS, com os mesmos links de partilha instantâneos.",
      },
      workspaces: {
        title: "Espaços de trabalho de equipa",
        body: "As gravações de todos num só lugar, partilhadas ou mantidas privadas.",
      },
      feedback: {
        title: "Comentários e reações",
        body: "Quem vê responde diretamente na linha de tempo, no momento exato a que se refere.",
      },
      edit: {
        title: "Editar depois de partilhar",
        body: "Altere o fundo, a câmara ou o áudio, e o link mantém-se o mesmo.",
      },
      screenshots: {
        title: "Capturas de ecrã anotadas",
        body: "Anote uma captura de ecrã com setas, texto e desfoque, e partilhe-a como link.",
      },
    },
    formHeading: "Contacte-nos",
    formSubheading: "Fale-nos da sua equipa e responderemos por email.",
    form: {
      company: "Empresa",
      companyPlaceholder: "Acme, Lda.",
      name: "O seu nome",
      namePlaceholder: "Jane Doe",
      email: "Email profissional",
      emailPlaceholder: "jane@acme.com",
      need: "Do que precisa?",
      needs: [
        "Licenças para uma equipa grande",
        "Condições à medida ou uma única fatura",
        "Outro assunto",
      ],
      teamSize: "Dimensão da equipa",
      teamSizes: ["1–10", "11–50", "51–200", "200+"],
      storage: "Quanto armazenamento?",
      storageOptions: ["1–5 TB", "5–20 TB", "20 TB+", "Não tenho a certeza"],
      notes: "Há mais alguma coisa que devamos saber?",
      notesPlaceholder:
        "Quanto a sua equipa grava, os seus prazos, necessidades de faturação…",
      submit: "Enviar mensagem",
      error:
        "Não foi possível enviar a sua mensagem. Tente novamente ou envie-nos um email para {email}.",
      sentTitle: "Mensagem enviada",
      sentBody: "Obrigado. Responderemos para {email}.",
      back: "Voltar ao início",
    },
  },
  pricing: {
    heading: "Preços",
    cta: "Comparar todos os planos",
    subheading:
      "O plano Gratuito cobre as suas primeiras gravações. Os planos pagos têm um preço por membro.",
    controls: {
      shownIn:
        "Os preços são apresentados em {currency}. A cobrança é feita em dólares americanos.",
      teamSize: "Dimensão da equipa",
      members: "membros",
      title: "Faturação",
      note: "Um preço por membro.",
      billing: "Pagamento",
      monthly: "Mensal",
      annually: "Anual",
      save: "Poupe {percent}%",
    },
    compare: {
      loomRow: "Loom {plan}",
      loomDetail: "{seats} pessoas × {perSeat} cada",
      caption: "Preços mensais.",
      captureflowRow: "CaptureFlow {ourPlan}",
      captureflowDetail: "{seats} membros × {ourPerSeat} cada",
      saveLabel: "A sua equipa poupa",
      saveValue: "{savings} por ano",
    },
    plans: {
      chargedInUsd: "Cobrado em dólares americanos.",
      member: "membro",
      members: "membros",
      included: "Incluído",
      notIncluded: "Não incluído",
      free: {
        name: "Gratuito",
        description: "Gravações de ecrã que partilha como link.",
        cta: "Criar conta",
      },
      light: {
        name: LIGHT,
        featuresHeading: "Tudo do plano Gratuito e ainda",
        features: [
          "Gravações ilimitadas",
          "Tempo de gravação ilimitado",
          `${LIGHT_AGENT_MIN} min por mês de gravações de agente na nuvem, até 10 min cada`,
        ],
        description: "Gravações ilimitadas em qualidade de poupança de dados.",
        period: "/mês",
        noteMonthly: "Por membro, faturado mensalmente",
        noteAnnual:
          "Por membro, faturado anualmente. {yearly} por ano para {seats} {members}",
        cta: "Experimentar grátis",
      },
      pro: {
        badge: "Recomendado",
        name: PRO,
        featuresHeading: `Tudo do plano ${LIGHT} e ainda`,
        features: [
          "Qualidade máxima, até 1080p",
          "Capítulos e títulos por IA e remoção de hesitações",
          "Marca personalizada",
          `${PRO_AGENT_MIN} min por mês de gravações de agente na nuvem, com ${PRO_VOICEOVER_MIN} min de narração por IA`,
          "Estatísticas de visualização (em breve)",
          "Integrações com Slack, Notion e Zapier (em breve)",
        ],
        description: "Qualidade máxima, limpeza por IA e a sua própria marca.",
        period: "/mês",
        noteMonthly: "Por membro, faturado mensalmente",
        noteAnnual:
          "Por membro, faturado anualmente. {yearly} por ano para {seats} {members}",
        cta: "Experimentar grátis",
      },
      rows: {
        recordings: {
          label: "Gravações por pessoa",
          free: "Até {recordings}",
          light: "Ilimitadas",
          pro: "Ilimitadas",
        },
        length: {
          label: "Duração da gravação",
          free: "{minutes} min por vídeo",
          light: "Ilimitada",
          pro: "Ilimitada",
        },
        quality: {
          label: "Qualidade de vídeo",
          free: "Poupança de dados",
          light: "Poupança de dados",
          pro: "Até 1080p",
        },
        transcripts: {
          label: "Transcrições e legendas",
          free: true,
          light: true,
          pro: true,
        },
        editing: {
          label: "Editar a partir da transcrição",
          free: true,
          light: true,
          pro: true,
        },
        chapters: {
          label: "Capítulos e títulos por IA",
          free: false,
          light: false,
          pro: true,
        },
        filler: {
          label: "Remoção de hesitações",
          free: false,
          light: false,
          pro: true,
        },
        feedback: {
          label: "Comentários e reações",
          free: true,
          light: true,
          pro: true,
        },
        agents: {
          label: "Gravações de agente locais",
          free: true,
          light: true,
          pro: true,
        },
        cloudAgents: {
          label: "Gravações de agente na nuvem",
          free: `${FREE_AGENT_MIN} min por mês`,
          light: `${LIGHT_AGENT_MIN} min por mês`,
          pro: `${PRO_AGENT_MIN} min por mês`,
        },
        voiceover: {
          label: "Narração por IA local",
          free: true,
          light: true,
          pro: true,
        },
        cloudVoiceover: {
          label: "Narração por IA na nuvem",
          free: false,
          light: false,
          pro: `${PRO_VOICEOVER_MIN} min por mês`,
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
      heading: "Todas as funcionalidades, plano a plano",
      subtitle: "Gratuito, Light e Pro, lado a lado.",
      groups: [
        {
          title: "Gravação",
          rows: [
            {
              label: "Membros",
              free: "Ilimitados",
              light: "Ilimitados",
              pro: "Ilimitados",
            },
            {
              label: "Gravações por pessoa",
              free: "Até {recordings}",
              light: "Ilimitadas",
              pro: "Ilimitadas",
            },
            {
              label: "Duração da gravação",
              free: "{minutes} min por vídeo",
              light: "Ilimitada",
              pro: "Ilimitada",
            },
            {
              label: "Qualidade de vídeo",
              free: "Poupança de dados",
              light: "Poupança de dados",
              pro: "Até 1080p",
            },
            {
              label: "Capturas de ecrã",
              free: "Ilimitadas",
              light: "Ilimitadas",
              pro: "Ilimitadas",
            },
            {
              label: "Conservação das gravações",
              free: "30 dias sem visualizações",
              light: "Até as eliminar",
              pro: "Até as eliminar",
            },
            {
              label: "Captura de ecrã inteiro, janela ou separador",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Bolha da câmara e efeitos de câmara",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Microfone e áudio do sistema",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Cursor suave",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Extensão do Chrome e aplicação para Mac",
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
              label: "Transcrições",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Legendas",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Resumo por capítulos",
              free: false,
              light: false,
              pro: true,
            },
            {
              label: "Títulos sugeridos automaticamente",
              free: false,
              light: false,
              pro: true,
            },
            {
              label: "Editar o vídeo a partir da transcrição",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Remoção de hesitações",
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
              label: "Gravações de agente no seu computador",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Apresentações de agente feitas na nuvem",
              free: `${FREE_AGENT_MIN} min por mês por pessoa`,
              light: `${LIGHT_AGENT_MIN} min por mês por membro`,
              pro: `${PRO_AGENT_MIN} min por mês por membro`,
            },
            {
              label: "Diapositivos nas gravações de agente",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Narração por IA no seu computador",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Voz-off com IA em apresentações na nuvem",
              free: false,
              light: false,
              pro: `${PRO_VOICEOVER_MIN} min por mês por membro`,
            },
          ],
        },
        {
          title: "Edição",
          rows: [
            {
              label: "Editar depois de partilhar, mesmo link",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Fundos",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Mover ou redimensionar a bolha da câmara",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Cortar partes do vídeo",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Capturas de ecrã anotadas com setas, texto e desfoque",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Tela infinita",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "Partilha e feedback",
          rows: [
            {
              label: "Link de partilha pronto quando termina",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Links públicos, do espaço de trabalho ou privados",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Pedido de acesso em links restritos",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Pré-visualização de links em chats e emails",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Incorporar o leitor em qualquer lado",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Reprodução dentro de issues e pull requests do GitHub",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Comentários na linha de tempo",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Reações com emojis",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Número de visualizações",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Transferir o ficheiro original",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "Espaço de trabalho e administração",
          rows: [
            {
              label: "Espaço de trabalho de equipa",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Funções de proprietário, membro e visualizador",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Visibilidade predefinida e permissões de carregamento",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Pesquisa em gravações e capturas de ecrã",
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
          title: "Alojamento e apoio",
          rows: [
            {
              label: "Código aberto sob a AGPL",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Alojamento próprio na sua conta Cloudflare",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Alojamento gerido e atualizações",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
      ],
    },
    includes: {
      heading: "Todos os planos incluem",
      items: [
        "O seu próprio espaço de trabalho, convide quem quiser",
        "Efeitos de câmara",
        "Transcrições e legendas por IA",
        "Editar o vídeo a partir da transcrição",
        "Links de partilha públicos, do espaço de trabalho ou privados",
        "Comentários e reações com emojis",
        "Capturas de ecrã anotadas",
        "Tela infinita",
      ],
    },
    annual: {
      badgePro: "Gerido",
      badgeCycle: "Anual",
      title: "Alojamento gerido",
      subtitle: "Totalmente alojado, faturado anualmente.",
      period: "/mês",
      note: "Faturado {amount}/ano. Cancele quando quiser.",
      cta: "Começar",
    },
  },
  activity: {
    heading: "Últimas alterações no GitHub",
    subtitle:
      "Todas as alterações são públicas. Estes são os pull requests mais recentes e as issues abertas no GitHub.",
    cta: "Ver no GitHub",
    shippedHeading: "Integrados recentemente",
    openHeading: "Issues e pull requests abertos",
    emptyOpen: "Nada em aberto neste momento.",
    newIssue: "Comunicar um bug ou pedir uma funcionalidade",
    viewAll: "Ver tudo no GitHub",
  },
  faq: {
    heading: "Perguntas frequentes",
    subtitle:
      "Respostas sobre gravação, preços, armazenamento e alojamento próprio. Para tudo o resto, consulte a documentação.",
    cta: "Ler a documentação",
    waitlistLink: "Entrar na lista de espera",
    items: [
      {
        question: "Como faço uma gravação?",
        answer:
          "Há duas formas, e a diferença está em quem grava.\n\nCom a extensão do Chrome, a gravação é feita por si. Percorre o ecrã e pode comentar com a sua própria voz e câmara. Use-a para atualizações rápidas, feedback ou qualquer coisa em que precise de aparecer.\n\nCom um agente de IA, descreve o vídeo e o agente percorre os passos e grava por si, para poder continuar a trabalhar. Pode adicionar diapositivos e narração por IA. Use-o para demos de produto, tutoriais e relatórios de bugs.\n\nPara gravar por conta própria:\n1. Instale a extensão CaptureFlow a partir da Chrome Web Store.\n2. Clique no ícone da extensão na barra de ferramentas do browser e inicie sessão.\n3. Clique novamente no ícone. Escolha «This tab», «Window» ou «Full screen», e ligue a câmara e o microfone se quiser.\n4. Carregue em «Start Recording». Uma barra na página permite pausar ou parar.\n5. Carregue em parar. Abre-se a página da gravação, com um link que pode partilhar com qualquer pessoa.\n\nPara pedir a um agente que grave:\n1. Ligue o CaptureFlow à aplicação de IA que utiliza. A secção Agentes da página inicial tem os passos para Claude, ChatGPT, Claude Code, Codex e Cursor.\n2. Inicie sessão quando se abrir um separador do browser. Só o faz uma vez.\n3. Peça o vídeo por palavras simples, por exemplo: Grava uma demo de como criar conta no nosso site, com narração.\n4. O agente grava e dá-lhe um link que pode partilhar com qualquer pessoa.",
      },
      {
        question: "Posso alojar o CaptureFlow por conta própria?",
        answer:
          "Sim. O CaptureFlow é de código aberto sob a AGPL, e todo o backend corre na Cloudflare: Workers para a aplicação e a API, R2 para as gravações e D1 para tudo o resto. Crie uma base de dados D1 e um bucket R2, aplique as migrações, defina um segredo e faça a implementação. Também existe um botão Deploy to Cloudflare. O guia está em docs.captureflow.dev.",
      },
      {
        question: "O meu agente de IA pode gravar vídeos por mim?",
        answer:
          "Sim. Adicione o CaptureFlow ao Claude Code, Codex ou Cursor com uma linha, ou adicione-o no Claude ou no ChatGPT, e depois peça um vídeo por palavras simples. Grava um browser, o seu ecrã ou uma aplicação no seu próprio computador, adiciona diapositivos e narração se quiser, e dá-lhe um link para partilhar.\n\nAs gravações de agente locais estão incluídas em todos os planos. As gravações de agente na nuvem têm um limite mensal que depende do seu plano.",
      },
      {
        question: "Como funcionam os preços dos planos pagos?",
        answer: `Os planos ${LIGHT} e ${PRO} têm um preço por membro por mês, mais baixo com faturação anual. Um membro é alguém que grava, por isso só paga pelas pessoas que fazem gravações.\n\nQuando alguém entra ou sai, o número de licenças é atualizado na fatura seguinte.`,
      },
      {
        question: "Durante quanto tempo ficam guardadas as minhas gravações?",
        answer:
          "Nos planos pagos, até as eliminar. No plano gratuito, uma gravação é removida após 30 dias sem visualizações, para que as contas inativas não ocupem espaço. Se optar pelo alojamento próprio, as regras são definidas por si.",
      },
      {
        question: "O que inclui o plano gratuito?",
        answer: `Tem 25 gravações por pessoa, até 5 minutos cada, em qualidade de poupança de dados, com transcrições e legendas. As gravações são removidas após 30 dias sem visualizações. Crie conta, instale a extensão do Chrome e comece a gravar.\n\nO plano ${LIGHT} remove os limites por um preço por membro e mantém as gravações até as eliminar.`,
      },
    ],
  },
  cta: {
    headline: "Comece a gravar",
    subtitle:
      "Transferência gratuita. Sem cartão de crédito. Diga-o numa mensagem de vídeo rápida em vez de mais uma reunião.",
    button: "Experimentar o CaptureFlow grátis",
  },
  footer: {
    tagline:
      "Gravação de ecrã de código aberto com links de partilha instantâneos.",
    lights: "Luzes",
    lightsOn: "Ligadas · puxe o cordão",
    lightsOff: "Desligadas · puxe o cordão",
    product: {
      title: "Produto",
      features: "Funcionalidades",
      pricing: "Preços",
      compare: "Comparar",
      download: "Transferir",
      suggest: "Sugerir uma funcionalidade",
    },
    resources: {
      title: "Recursos",
      docs: "Documentação",
      selfHosting: "Alojamento próprio",
      blog: "Blogue",
      releases: "Versões",
      faq: "FAQ",
      security: "Segurança",
    },
    community: {
      title: "Comunidade",
    },
    legal: {
      title: "Informação legal",
      privacy: "Política de privacidade",
      terms: "Termos de serviço",
      refund: "Política de reembolso",
      license: "Licença (AGPL-3.0)",
    },
    rights: "© {year} CaptureFlow. Todos os direitos reservados.",
    openSource: "Código aberto sob a AGPL-3.0",
  },
  pageShell: {
    logoAlt: "CaptureFlow",
    backToHome: "Voltar ao início",
  },
  waitlist: {
    errors: {
      joinFailed:
        "Não foi possível entrar na lista de espera. Tente novamente.",
      network: "Erro de rede. Tente novamente.",
    },
    success:
      "Está na lista. Envio-lhe um email quando o CaptureFlow estiver pronto.",
    emailPlaceholder: "you@example.com",
    buttonLoading: "A entrar…",
    buttonDefault: "Entrar na lista de espera",
    earlyAccessPrompt: "Quer acesso antecipado?",
    earlyAccessLink: "Seja testador beta",
  },
  download: {
    heading: "Transferir o CaptureFlow",
    subtitle:
      "Disponível para Chrome, com uma aplicação para macOS em breve. Cada gravação recebe um link que pode partilhar.",
    button: "Transferir para macOS",
    requires: "Requer {version} ou posterior em Apple Silicon.",
    requirements: "Requer macOS 14 ou posterior em Apple Silicon.",
    versionLabel: "Versão {version}",
    sizeLabel: "DMG de {size} MB",
    notarized: "Assinado e notarizado pela Apple",
  },
  downloadPage: {
    otherWays: "Outras formas de o obter",
    buildTitle: "Compilar a partir do código-fonte",
    buildBody: "Clone o repositório e execute o gravador localmente com pnpm.",
    releasesTitle: "Todas as versões",
    releasesBody:
      "Consulte todas as compilações publicadas e o registo de alterações no GitHub.",
    cloud: "Prefere a nuvem? {link} e veja as gravações no browser.",
    cloudLink: "Crie uma conta",
  },
  blog: {
    title: "Blogue",
    subtitle: "Dicas, guias e novidades sobre gravação de ecrã.",
    readArticle: "Ler artigo",
    empty: "Ainda não há artigos. Volte em breve.",
  },
};

export default messages;

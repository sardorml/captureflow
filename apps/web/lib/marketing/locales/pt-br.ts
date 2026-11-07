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
      title: "CaptureFlow - Gravador de tela com link de compartilhamento",
      description:
        "Grave sua tela e compartilhe um link com a equipe ou clientes. Gravador de tela de código aberto com transcrições por IA, capturas anotadas e auto-hospedagem na Cloudflare.",
    },
    features: {
      title: "Recursos do gravador de tela",
      description:
        "Grave uma aba, uma janela ou a tela inteira com câmera e microfone, faça capturas de tela anotadas e compartilhe tudo por links que sua equipe pode comentar.",
    },
    pricing: {
      title: "Preços: comece grátis, um preço por membro",
      description: `Comece grátis com ${FREE_RECORDINGS} gravações. ${LIGHT} e ${PRO} têm um preço por membro, com gravações ilimitadas e IA. Ou faça a auto-hospedagem do CaptureFlow de graça.`,
    },
    faq: {
      title: "FAQ: compartilhamento, armazenamento e auto-hospedagem",
      description:
        "Dúvidas comuns sobre o CaptureFlow: links de compartilhamento, auto-hospedagem na Cloudflare, limites de armazenamento e privacidade das gravações.",
    },
    download: {
      title: "Baixe o gravador de tela para Chrome",
      description:
        "Instale a extensão do CaptureFlow para Chrome para gravar sua tela e compartilhar com um link.",
    },
    enterprise: {
      title: "Plano Enterprise",
      description:
        "CaptureFlow gerenciado para empresas maiores: licenças para todos, condições personalizadas e uma única fatura. Conte do que você precisa.",
    },
    selfHostSetup: {
      title: "Configuração da auto-hospedagem",
      description:
        "Tenha o CaptureFlow configurado na conta Cloudflare da sua empresa: seu domínio, login restrito à empresa e uma extensão privada do Chrome para sua equipe.",
    },
    swarmDemo: {
      title: "Demo de enxame: agentes reconstroem qualquer site em vídeo",
      description:
        "Digite o endereço de um site e veja um enxame de cursores de agentes reconstruí-lo elemento por elemento, ao som de música. Você recebe um vídeo com um link para compartilhar.",
    },
    chromeExtension: {
      title: "Extensão do Chrome: grave sua tela e compartilhe um link",
      description:
        "Grave sua tela, uma aba ou sua câmera pelo Chrome. Ao terminar, você recebe um link que qualquer pessoa pode assistir, com transcrição, resumo e capítulos.",
    },
    agentRecorder: {
      title: "Servidor MCP: seu agente de IA grava vídeos",
      description:
        "Conecte Claude Code, Codex, Cursor ou ChatGPT ao CaptureFlow por MCP. Seu agente grava um app web, sua tela ou uma janela e entrega um link para compartilhar.",
    },
  },
  nav: {
    features: "Recursos",
    discover: "Descubra",
    pricing: "Preços",
    faq: "FAQ",
    changelog: "Novidades",
    login: "Entrar",
    library: "Minhas gravações",
    download: "Baixar",
    language: "Idioma",
    openMenu: "Abrir menu",
    menu: "Menu",
    main: "Principal",
    docs: "Docs",
    resources: "Materiais",
    faqDescription: "Respostas às dúvidas mais comuns",
    blog: "Blog",
    blogDescription: "Guias e novidades",
    selfHosting: "Auto-hospedagem",
    selfHostingDescription: "Rode na sua própria Cloudflare",
    community: "Comunidade",
    communityDescription: "Tire dúvidas e converse no Discord",
    products: "Produtos",
    swarmDemo: "Demo de enxame",
    swarmDemoDescription: "Agentes reconstroem qualquer site em vídeo",
    extension: "Extensão do Chrome",
    extensionDescription: "Grave sua tela e compartilhe um link",
    agentRecorder: "Gravador para agentes",
    agentRecorderDescription: "Vídeos que seu agente de IA cria via MCP",
    star: "Dê uma estrela no GitHub",
    starCount: "Dê uma estrela no GitHub ({stars})",
    themeToLight: "Mudar para o tema claro",
    themeToDark: "Mudar para o tema escuro",
  },
  banner: {
    label: "Beta",
    aria: "O CaptureFlow está em beta público",
    title: "Você chegou cedo 🎉",
    strip:
      "O CaptureFlow ainda está em beta, então muda com frequência e você pode esbarrar em um ou outro ponto a acertar enquanto ele amadurece.",
    body: "O CaptureFlow está em beta público. Quase toda semana chega algo novo, e o que as pessoas pedem é o que fica pronto primeiro.",
    cta: "Diga o que devo criar a seguir",
    close: "Fechar",
  },
  announcement: {
    badge: "Novo",
    lead: "Seu agente de IA agora pode gravar para você.",
    rest: "Conecte uma vez, peça um vídeo e receba um link.",
    cta: "Conectar",
  },
  hero: {
    title: "Gravador de tela para\nvocê e seus agentes de IA",
    subtitle:
      "Grave demos, tutoriais, guias passo a passo e apresentações você mesmo, ou peça para sua IA gravar para você. Compartilhe cada gravação como um link que qualquer pessoa pode assistir.",
    ctaLabel: "Experimente o CaptureFlow grátis",
    installChrome: "Instalar extensão do Chrome",
    installMac: "Baixar para macOS",
    installSoon: "Em breve",
    connectMcp: "Conectar ao MCP",
    macSoon: "App para macOS em breve",
    installOr: "ou",
    mcpCopy: "Copiar",
    mcpCopied: "Copiado",
    mcpAddToCursor: "Adicionar ao Cursor",
    badge: "Código aberto no {github}, grátis para rodar",
    noCreditCard: "Sem cartão de crédito",
    teaser: {
      title: "Auto-hospedagem",
      body: "Rode na sua própria conta Cloudflare.",
      cta: "Experimente o CaptureFlow",
    },
    demo: {
      prevAria: "Demo anterior",
      nextAria: "Próxima demo",
      dotAria: "Mostrar demo {n} de {total}",
    },
  },
  highlights: {
    heading: "Todos os recursos",
    subtitle: "Grave, edite e compartilhe. Tudo fica em um só lugar.",
    items: {
      recording: {
        title: "Tela e câmera",
        body: "Grave as duas ao mesmo tempo",
      },
      transcripts: { title: "Transcrições", body: "Em 99 idiomas", tag: "IA" },
      editing: {
        title: "Edição pela transcrição",
        body: "Apague texto para cortar o vídeo",
        tag: "IA",
      },
      camera: {
        title: "Efeitos de câmera",
        body: "Fundos e filtros",
      },
      canvas: { title: "Canvas infinito", body: "Desenhe enquanto grava" },
      screenshots: {
        title: "Capturas de tela anotadas",
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
        title: "Remoção de vícios de linguagem",
        body: "Corta os “hã” e “ahn”",
        tag: "IA",
      },
    },
    cta: "Ver todos os recursos",
    previews: {
      app: "Plano de lançamento",
      columns: ["A fazer", "Fazendo", "Feito"],
      lines: [
        "Este é o novo fluxo.",
        "Primeiro, escolha um workspace.",
        "Depois, compartilhe o link.",
      ],
      retake: "Hã, deixa eu começar de novo.",
      filler: [
        "[Hã,] este é o novo fluxo.",
        "Primeiro, [ahn,] escolha um workspace.",
        "Depois, [hã,] compartilhe o link.",
      ],
      step: "Passo 1",
      note: "Mova isto",
      comment: "Adorei esse fluxo",
      summaryTitle: "Como convidar sua equipe",
      summaryBody: "Escolha um workspace e compartilhe o link.",
      chapters: ["Introdução", "Escolha um workspace"],
    },
  },
  mcpFeatures: {
    heading: "Recursos do MCP",
    subtitle:
      "O que seu agente de IA pode fazer depois de conectado. Ele grava no seu próprio computador, com Claude Code, Codex, Cursor ou qualquer cliente MCP.",
    cta: "Leia o guia",
    items: {
      webApp: { title: "Gravar um app web", body: "Inclusive em localhost" },
      screen: { title: "Gravar sua tela", body: "Um monitor inteiro" },
      window: {
        title: "Gravar uma janela",
        body: "Terminal, VS Code ou Figma",
      },
      slides: {
        title: "Adicionar slides",
        body: "Títulos, passos e encerramento",
      },
      voiceover: {
        title: "Adicionar narração",
        body: "Roda no seu computador",
      },
      report: {
        title: "Escrever um relatório",
        body: "O que fez e o que falhou",
      },
      search: { title: "Buscar gravações", body: "Vídeos e transcrições" },
      save: { title: "Salvar arquivos MP4", body: "Sem upload nem login" },
    },
  },
  useCases: {
    heading: "Como as equipes usam",
    subtitle:
      "Exemplos do que as equipes gravam. Cada vídeo é um link que toca em qualquer navegador.",
    cta: "Veja como funciona",
    cards: {
      engineering: {
        title: "Engenharia",
        body: "Grave um passo a passo de um PR ou a reprodução de um bug.",
      },
      design: {
        title: "Design",
        body: "Grave um passo a passo de um mockup e reúna comentários.",
      },
      support: {
        title: "Suporte ao cliente",
        body: "Responda a um chamado com um passo a passo curto.",
      },
      updates: {
        title: "Atualizações da equipe",
        body: "Grave a atualização semanal e compartilhe o link.",
      },
    },
    engineeringFile: "checkout.ts",
    engineeringPr: "PR #482",
    designApp: "trip-app",
    designBadge: "Checkout v3",
    designCardTitle: "Planeje sua viagem",
    designColors: "Cores",
    designComment: "CTA maior?",
    supportQuestion: "Como convido minha equipe para o workspace?",
    supportReply: "Veja este passo a passo rápido:",
    supportLink: "captureflow.dev/r/8kx2pnq4",
    updatesTitle: "Atualização semanal",
    updatesRange: "6–10 de out.",
    updatesSignups: "Cadastros",
    updatesShipped: "Lançados",
    updatesFeatures: "recursos",
  },
  agents: {
    heading: "Ou peça ao seu agente de IA para gravar suas demos e tutoriais",
    worksWith: "Funciona com {claude}, {openai} e {cursor}.",
    cta: "Leia o guia",
    subtitle:
      "Peça com suas palavras. Ele grava um navegador, sua tela ou um app no seu próprio computador, adiciona slides e narração se você quiser e entrega um link.",
    steps: [
      {
        title: "Conecte seu agente",
        body: "Adicione o CaptureFlow ao Claude Code, Codex ou Cursor com uma linha. Você precisa do Node.js 20 ou mais recente, e seu agente faz login uma única vez. No Claude ou no ChatGPT, adicione pela URL.",
      },
      {
        title: "Peça um vídeo",
        body: "Uma demo de recurso, um tutorial, um relato de bug ou uma apresentação narrada.",
      },
      {
        title: "Ele grava para você",
        body: "No seu computador, até mesmo um app em localhost.",
      },
      {
        title: "Adiciona slides e voz",
        body: "Slides de título e narração, se você quiser.",
      },
      {
        title: "Entrega um link para compartilhar",
        body: "Anexe a um pull request, poste no Slack ou envie a um cliente.",
      },
    ],
    scenes: {
      ask: {
        name: "terminal",
        badge: "agente",
        prompt: "Grave uma demo do checkout",
        steps: [
          "Abrindo o app",
          "Clicando pelas telas",
          "Seu link está pronto",
        ],
      },
      record: {
        url: "localhost:3000",
        badge: "demo",
        title: "Checkout",
        fields: ["Seu nome", "Número do cartão"],
        pay: "Pagar agora",
        paid: "Pago",
      },
      voice: {
        title: "Demo do checkout",
        subtitle: "Como pagar em três passos",
      },
      share: {
        title: "Demo do checkout",
        link: "captureflow.dev/r/checkout",
        places: ["PR", "Slack", "E-mail"],
      },
    },
    chats: {
      claude:
        "No Claude, abra “Customize”, depois “Connectors”, e escolha “Add custom connector”. Dê o nome CaptureFlow, cole esta URL e faça login.",
      chatgpt:
        "No ChatGPT na web, abra “Plugins”, pressione + e escolha “Add custom MCP server”. Dê o nome CaptureFlow, cole esta URL, escolha OAuth, depois instale o plugin e faça login. Requer um plano Business, Enterprise ou Edu.",
      limits:
        "Os chats criam vídeos de apresentação e tutoriais a partir de slides nos nossos servidores, não gravações do seu computador, e usam os minutos de agente na nuvem do seu plano.",
    },
  },
  modes: {
    cta: "Começar a gravar",
    heading: "Grave sua tela com a extensão do Chrome",
    subtitle:
      "Instale e aperte gravar. Quando terminar, você recebe um link que qualquer pessoa pode assistir, com título, resumo, capítulos e transcrição.",
    scene: {
      timer: "0:42",
      heading: "Como funciona um reembolso",
      steps: ["Solicitar", "Aprovar", "Pagar"],
      captions: [
        "Um passo a passo rápido de como funciona um reembolso.",
        "Primeiro, o cliente envia uma solicitação.",
        "O suporte aprova no mesmo dia.",
        "Depois, o dinheiro sai automaticamente.",
      ],
    },
  },
  pageHeroes: {
    home: "Início",
    features: {
      label: "Recursos",
      word: "RECURSOS",
      title: "Grave, edite e compartilhe sua tela",
      subtitle:
        "Grave sua tela e sua câmera. Compartilhe cada gravação como um link que sua equipe pode comentar.",
    },
    pricing: {
      label: "Preços",
      word: "PREÇOS",
      title: "Comece grátis. Pague um preço por membro.",
      subtitle:
        "O Gratuito cobre suas primeiras 25 gravações. Light e Pro removem o limite. Você também pode fazer a auto-hospedagem do CaptureFlow de graça.",
    },
    faq: {
      label: "FAQ",
      word: "FAQ",
      title: "Perguntas frequentes",
      subtitle:
        "Respostas sobre gravação, preços, armazenamento e auto-hospedagem. Leia a documentação para todo o resto.",
    },
    chromeExtension: {
      label: "Extensão do Chrome",
      word: "CHROME",
      title: "Grave sua tela pelo Chrome",
      subtitle:
        "Grave sua tela, uma aba ou sua câmera. Ao terminar, você recebe um link que qualquer pessoa pode assistir, com transcrição, resumo e capítulos.",
    },
    agentRecorder: {
      label: "Gravador para agentes",
      word: "MCP",
      title: "Deixe seu agente de IA gravar seus vídeos",
      subtitle:
        "Conecte por MCP e peça com palavras simples. Ele grava um app web, sua tela ou uma janela, adiciona slides e voz se você quiser, e entrega um link.",
    },
  },
  collaboration: {
    heading: "O que você pode fazer depois de gravar",
    cta: "Experimente grátis",
    subtitle:
      "Edite e depois compartilhe ou incorpore. Convide sua equipe para assistir, reagir e comentar nos vídeos uns dos outros.",
    categories: {
      share: {
        feature: {
          tag: "novo",
          title: "Edite seu vídeo",
          cta: "Instalar a extensão",
          body: "Apague palavras da transcrição para cortá-las do vídeo ou apare clipes na linha do tempo. Troque o fundo, mova, redimensione ou oculte sua câmera e silencie o microfone ou o som do sistema.",
        },
        scene: {
          app: "Plano de lançamento",
          nav: ["Visão geral", "Roadmap", "Tarefas", "Docs"],
          columns: [
            {
              name: "A fazer",
              tasks: ["Texto da página de preços", "E-mail de boas-vindas"],
            },
            {
              name: "Em andamento",
              tasks: ["Redesign do checkout", "Convites da equipe"],
            },
            { name: "Feito", tasks: ["Formulário de inscrição no beta"] },
          ],
          background: "Fundo",
          camera: "Câmera",
          shapes: ["Círculo", "Quadrado"],
          fillers: "Vícios de linguagem",
          remove: "Remover",
          transcript: {
            before: "Clique aqui para",
            fillers: ["hã,", "espera,", "desculpa,"],
            after: "compartilhar o link.",
          },
          saved: "Salvo · mesmo link",
        },
      },
      embed: {
        feature: {
          title: "Compartilhe ou incorpore seu vídeo",
          cta: "Instalar a extensão",
          body: "Cole o link no Slack, no GitHub, no Notion ou em um e-mail e ele mostra uma prévia. Você também pode incorporar o player na sua documentação ou no seu site. Com a extensão instalada, ele toca dentro de issues e pull requests do GitHub.",
        },
        scene: {
          question:
            "Pode me mostrar como convidar minha equipe para o workspace?",
          reply: "Claro! Aqui vai um passo a passo curto:",
          url: "captureflow.dev/r/8kx2pnq4",
          app: "Configurações",
          nav: ["Geral", "Membros", "Cobrança"],
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
          cta: "Entrar",
          body: "Trabalhem juntos sem reunião, em fusos horários diferentes. Sua equipe pode reagir com emojis, comentar em qualquer momento do vídeo e acompanhar com transcrições e legendas.",
        },
        scene: {
          title: "Passo a passo do plano de lançamento",
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
              text: "Adorei a nova visão de quadro",
            },
            { initials: "SL", name: "Sam", at: "0:37", emoji: "❤️" },
            {
              initials: "JB",
              name: "Jordan",
              at: "0:48",
              text: "Dá para lançar na sexta?",
            },
            {
              initials: "AR",
              name: "Alex",
              at: "0:56",
              text: "Sim, logo depois do QA ✅",
            },
            { initials: "MC", name: "Maya", at: "1:05", emoji: "👏" },
          ],
        },
      },
      workspaces: {
        feature: {
          title: "Convide sua equipe para um workspace",
          cta: "Criar um workspace",
          body: "As gravações de todos ficam em um só workspace. Cada vídeo pode ser público, visível para o workspace ou privado.",
        },
        scene: {
          team: "Equipe CaptureFlow",
          members: ["1 membro", "2 membros", "3 membros"],
          memberInitials: ["AR", "CK", "JB"],
          invitePlaceholder: "Convidar por e-mail",
          inviteEmail: "chris@acme.co, jordan@acme.co",
          invite: "Convidar",
          invited: "Enviado",
          joined: "Chris e Jordan entraram 🎉",
          whoCanWatch: "Quem pode assistir:",
          visibility: [
            { label: "Público", detail: "Qualquer pessoa com o link" },
            { label: "Workspace", detail: "Só sua equipe" },
            { label: "Privado", detail: "Só você" },
          ],
        },
      },
    },
  },
  setupService: {
    title: "Nós configuramos",
    titleHighlight: "para você",
    subtitle:
      "Conte sobre sua empresa. Nós configuramos o app, a extensão do Chrome, o app para macOS e toda a infraestrutura por trás, tudo pronto para sua equipe usar.",
    includedHeading: "Tudo o que configuramos",
    included: {
      infra: {
        title: "O app, na sua infraestrutura",
        body: "Implantado na sua própria conta Cloudflare e servido a partir do seu domínio. Tudo é seu.",
      },
      storage: {
        title: "Armazenamento e banco de dados",
        body: "Gravações no seu próprio bucket R2; workspaces e comentários no seu próprio banco de dados.",
      },
      signin: {
        title: "Login restrito à empresa",
        body: "Login com Google Workspace ou GitHub, limitado ao domínio de e-mail da sua empresa.",
      },
      apps: {
        title: "Extensão do Chrome e app para Mac",
        body: "Os dois compilados para a sua instância, com a extensão publicada de forma privada para sua equipe.",
      },
      ready: {
        title: "Pronto para gravar",
        body: "Workspaces criados e sua equipe convidada, para que todos possam começar a compartilhar na hora.",
      },
      handover: {
        title: "Entrega",
        body: "Mostramos a quem for cuidar da instância como operá-la e atualizá-la.",
      },
    },
    nextHeading: "Fale conosco",
    nextSubheading: "Conte do que você precisa e nós retornamos.",
    form: {
      company: "Empresa",
      companyPlaceholder: "Acme Inc.",
      name: "Seu nome",
      namePlaceholder: "Jane Doe",
      email: "E-mail corporativo",
      emailPlaceholder: "jane@acme.com",
      topic: "Com o que podemos ajudar?",
      topics: [
        "Configuração da auto-hospedagem",
        "Mais de 1 TB",
        "Outro assunto",
      ],
      teamSize: "Tamanho da equipe",
      teamSizes: ["1–10", "11–50", "51–200", "200+"],
      cloudflare: "Você tem uma conta Cloudflare?",
      cloudflareOptions: ["Sim", "Não", "Não sei"],
      notes: "Mais alguma coisa que devemos saber?",
      notesPlaceholder: "O tamanho da equipe, seu domínio, seu prazo…",
      submit: "Enviar mensagem",
      error:
        "Não foi possível enviar sua solicitação. Tente de novo ou escreva para {email}.",
      sentTitle: "Mensagem enviada",
      sentBody: "Obrigado. Vamos responder para {email}.",
      back: "Voltar ao início",
    },
  },
  swarmDemo: {
    title: "Veja agentes reconstruírem",
    titleHighlight: "qualquer site",
    subtitle:
      "Digite o endereço de um site. Um enxame de cursores de agentes o desenha de volta elemento por elemento, ao som de música, e você recebe um link de vídeo para compartilhar.",
    url: "Endereço do site",
    urlPlaceholder: "https://example.com",
    generate: "Gerar demo",
    generating: "Iniciando um navegador na nuvem…",
    check: "Verificar site",
    checking: "Verificando o site…",
    previewNote:
      "Esta é a página que os agentes vão reconstruir. Gere a demo quando estiver certa.",
    change: "Mudar endereço",
    note: "Faça login para gerar de graça. Cada demo vai para a sua biblioteca.",
    noteSignedIn: "Gere de graça. Cada demo vai para a sua biblioteca.",
    howHeading: "Como funciona",
    how: {
      type: {
        title: "Digite um endereço",
        body: "Qualquer site público. A página é carregada em um navegador na nuvem e cada título, imagem, botão e card é encontrado.",
      },
      build: {
        title: "Agentes reconstroem tudo",
        body: "O pedido é digitado em uma caixa de chat e, em seguida, um enxame de cursores posiciona cada elemento enquanto a música acelera.",
      },
      share: {
        title: "Receba um link",
        body: "O vídeo aparece na sua biblioteca assim que fica pronto. Compartilhe o link, baixe o arquivo ou publique.",
      },
    },
    errors: {
      invalidUrl: "Digite o endereço de um site, como example.com.",
      unreachable:
        "Não foi possível acessar esse site. Confira o endereço e tente de novo.",
      unavailable: "Demos não estão disponíveis neste servidor.",
      running:
        "Uma gravação sua ainda está em andamento. Aguarde até terminar e tente de novo.",
      limit:
        "Este workspace já usou os minutos de agente na nuvem deste mês. Eles são renovados no dia 1.",
      recordings:
        "Você atingiu o limite de gravações do plano gratuito. Exclua uma gravação ou faça upgrade e tente de novo.",
      busy: "Todos os navegadores na nuvem estão ocupados agora. Tente de novo em alguns minutos.",
      failed: "Não foi possível iniciar a demo. Tente de novo.",
    },
  },
  enterprise: {
    title: "CaptureFlow para",
    titleHighlight: "sua empresa",
    subtitle:
      "O plano gerenciado para empresas que querem licenças para todos em condições combinadas uma única vez, com uma só fatura.",
    includedHeading: "O que o Enterprise adiciona",
    included: {
      storage: {
        title: "Armazenamento sob medida",
        body: "Um volume dimensionado para o quanto sua empresa grava, não uma cota por licença.",
      },
      seats: {
        title: "Licenças para todos",
        body: "Um contrato cobre a empresa inteira, não importa quantas pessoas gravem.",
      },
      roadmap: {
        title: "Seus pedidos primeiro",
        body: "Os recursos que sua equipe pede vão para o topo da nossa lista.",
      },
      managed: {
        title: "Totalmente gerenciado",
        body: "Nós hospedamos e publicamos as atualizações, então você não precisa manter nada.",
      },
      billing: {
        title: "Cobrança anual",
        body: "Pague uma vez por ano, com um preço combinado para sua empresa.",
      },
      support: {
        title: "Contato direto conosco",
        body: "As perguntas vão direto para quem desenvolve o CaptureFlow.",
      },
    },
    everythingHeading: "Tudo o que sua equipe recebe",
    comingSoon: "Em breve",
    everything: {
      extension: {
        title: "Extensão do Chrome",
        body: "Grave qualquer aba ou tela, com um link pronto quando você parar.",
      },
      mac: {
        title: "App para Mac",
        body: "Um gravador nativo para macOS, com os mesmos links de compartilhamento instantâneos.",
      },
      workspaces: {
        title: "Workspaces de equipe",
        body: "As gravações de todos em um só lugar, compartilhadas ou privadas.",
      },
      feedback: {
        title: "Comentários e reações",
        body: "Quem assiste responde direto na linha do tempo, no momento exato a que se refere.",
      },
      edit: {
        title: "Edite depois de compartilhar",
        body: "Troque o fundo, a câmera ou o áudio, e o link continua o mesmo.",
      },
      screenshots: {
        title: "Capturas de tela anotadas",
        body: "Marque uma captura de tela com setas, texto e desfoque e compartilhe como um link.",
      },
    },
    formHeading: "Fale conosco",
    formSubheading: "Conte sobre sua equipe e responderemos por e-mail.",
    form: {
      company: "Empresa",
      companyPlaceholder: "Acme Inc.",
      name: "Seu nome",
      namePlaceholder: "Jane Doe",
      email: "E-mail corporativo",
      emailPlaceholder: "jane@acme.com",
      need: "Do que você precisa?",
      needs: [
        "Licenças para uma equipe grande",
        "Condições personalizadas ou fatura única",
        "Outro assunto",
      ],
      teamSize: "Tamanho da equipe",
      teamSizes: ["1–10", "11–50", "51–200", "200+"],
      storage: "Quanto armazenamento?",
      storageOptions: ["1–5 TB", "5–20 TB", "20 TB+", "Não sei"],
      notes: "Mais alguma coisa que devemos saber?",
      notesPlaceholder:
        "Quanto sua equipe grava, seu prazo, necessidades de cobrança…",
      submit: "Enviar mensagem",
      error:
        "Não foi possível enviar sua mensagem. Tente de novo ou escreva para {email}.",
      sentTitle: "Mensagem enviada",
      sentBody: "Obrigado. Vamos responder para {email}.",
      back: "Voltar ao início",
    },
  },
  pricing: {
    heading: "Preços",
    cta: "Comparar todos os planos",
    subheading:
      "O Gratuito cobre suas primeiras gravações. Os planos pagos têm um preço por membro.",
    controls: {
      shownIn:
        "Os preços são exibidos em {currency}. A cobrança é feita em dólares americanos.",
      teamSize: "Tamanho da equipe",
      members: "membros",
      title: "Cobrança",
      note: "Um preço por membro.",
      billing: "Pagamento",
      monthly: "Mensal",
      annually: "Anual",
      save: "Economize {percent}%",
    },
    compare: {
      loomRow: "Loom {plan}",
      loomDetail: "{seats} pessoas × {perSeat} cada",
      caption: "Preços mensais.",
      captureflowRow: "CaptureFlow {ourPlan}",
      captureflowDetail: "{seats} membros × {ourPerSeat} cada",
      saveLabel: "Sua equipe economiza",
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
        description: "Gravações de tela que você compartilha como link.",
        cta: "Cadastre-se",
      },
      light: {
        name: LIGHT,
        featuresHeading: "Tudo do Gratuito e mais",
        features: [
          "Gravações ilimitadas",
          "Tempo de gravação ilimitado",
          `${LIGHT_AGENT_MIN} min por mês de gravações de agente na nuvem, até 10 min cada`,
        ],
        description: "Gravações ilimitadas na qualidade economia de dados.",
        period: "/mês",
        noteMonthly: "Por membro, cobrado mensalmente",
        noteAnnual:
          "Por membro, cobrado anualmente. {yearly} por ano para {seats} {members}",
        cta: "Experimente grátis",
      },
      pro: {
        badge: "Recomendado",
        name: PRO,
        featuresHeading: `Tudo do ${LIGHT} e mais`,
        features: [
          "Qualidade total, até 1080p",
          "Capítulos, títulos e remoção de vícios de linguagem por IA",
          "Marca personalizada",
          `${PRO_AGENT_MIN} min por mês de gravações de agente na nuvem, com ${PRO_VOICEOVER_MIN} min de narração por IA`,
          "Insights de espectadores (em breve)",
          "Integrações com Slack, Notion e Zapier (em breve)",
        ],
        description: "Qualidade total, limpeza por IA e sua própria marca.",
        period: "/mês",
        noteMonthly: "Por membro, cobrado mensalmente",
        noteAnnual:
          "Por membro, cobrado anualmente. {yearly} por ano para {seats} {members}",
        cta: "Experimente grátis",
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
          label: "Qualidade do vídeo",
          free: "Economia de dados",
          light: "Economia de dados",
          pro: "Até 1080p",
        },
        transcripts: {
          label: "Transcrições e legendas",
          free: true,
          light: true,
          pro: true,
        },
        editing: {
          label: "Edição pela transcrição",
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
          label: "Remoção de vícios de linguagem",
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
      heading: "Todos os recursos, plano a plano",
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
              label: "Qualidade do vídeo",
              free: "Economia de dados",
              light: "Economia de dados",
              pro: "Até 1080p",
            },
            {
              label: "Capturas de tela",
              free: "Ilimitadas",
              light: "Ilimitadas",
              pro: "Ilimitadas",
            },
            {
              label: "Gravações mantidas",
              free: "30 dias sem visualização",
              light: "Até você excluir",
              pro: "Até você excluir",
            },
            {
              label: "Captura de tela inteira, janela ou aba",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Bolha de câmera e efeitos de câmera",
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
              label: "Extensão do Chrome e app para Mac",
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
              label: "Capítulos de resumo",
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
              label: "Edite o vídeo pela transcrição",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Remoção de vícios de linguagem",
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
              label: "Slides nas gravações de agente",
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
              label: "Narração com IA em apresentações na nuvem",
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
              label: "Edite depois de compartilhar, mesmo link",
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
              label: "Mova ou redimensione a bolha de câmera",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Corte partes do vídeo",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Capturas de tela anotadas com setas, texto e desfoque",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Canvas infinito",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "Compartilhamento e feedback",
          rows: [
            {
              label: "Link de compartilhamento pronto quando você para",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Links públicos, do workspace ou privados",
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
              label: "Prévias do link em chats e e-mails",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Incorpore o player em qualquer lugar",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Toca dentro de issues e pull requests do GitHub",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Comentários na linha do tempo",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Reações com emoji",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Contagem de visualizações",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Download do arquivo original",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "Workspace e administração",
          rows: [
            {
              label: "Workspace de equipe",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Funções de proprietário, membro e espectador",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Visibilidade padrão e permissões de upload",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Busca em gravações e capturas de tela",
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
          title: "Hospedagem e suporte",
          rows: [
            {
              label: "Código aberto sob a AGPL",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Auto-hospedagem na sua própria conta Cloudflare",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Hospedagem gerenciada e atualizações",
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
        "Seu próprio workspace, convide quem quiser",
        "Efeitos de câmera",
        "Transcrições e legendas por IA",
        "Edite o vídeo pela transcrição",
        "Links de compartilhamento públicos, do workspace ou privados",
        "Comentários e reações com emoji",
        "Capturas de tela anotadas",
        "Canvas infinito",
      ],
    },
    annual: {
      badgePro: "Gerenciado",
      badgeCycle: "Anual",
      title: "Hospedagem gerenciada",
      subtitle: "Totalmente hospedado, com cobrança anual.",
      period: "/mês",
      note: "Cobrança de {amount}/ano. Cancele quando quiser.",
      cta: "Começar",
    },
  },
  activity: {
    heading: "Últimas mudanças no GitHub",
    subtitle:
      "Toda mudança é pública. Estes são os pull requests e as issues abertas mais recentes no GitHub.",
    cta: "Ver no GitHub",
    shippedHeading: "Mesclados recentemente",
    openHeading: "Issues e pull requests abertos",
    emptyOpen: "Nada aberto no momento.",
    newIssue: "Relate um bug ou peça um recurso",
    viewAll: "Ver tudo no GitHub",
  },
  faq: {
    heading: "Perguntas frequentes",
    subtitle:
      "Respostas sobre gravação, preços, armazenamento e auto-hospedagem. Leia a documentação para todo o resto.",
    cta: "Leia a documentação",
    waitlistLink: "Entrar na lista de espera",
    items: [
      {
        question: "Como faço uma gravação?",
        answer:
          "Há duas formas, e a diferença é quem faz a gravação.\n\nCom a extensão do Chrome, você mesmo grava. Você navega pela sua tela e pode narrar com sua própria voz e câmera. Use para atualizações rápidas, feedback ou qualquer coisa que precise de você no vídeo.\n\nCom um agente de IA, você descreve o vídeo e o agente clica pelas telas e grava para você, então você pode continuar trabalhando. Ele pode adicionar slides e uma narração por IA. Use para demos de produto, tutoriais e relatos de bug.\n\nPara gravar você mesmo:\n1. Instale a extensão CaptureFlow pela Chrome Web Store.\n2. Clique no ícone dela na barra de ferramentas do navegador e faça login.\n3. Clique no ícone de novo. Escolha This tab, Window ou Full screen e ligue a câmera e o microfone se quiser.\n4. Pressione Start Recording. Uma barra na página permite pausar ou parar.\n5. Pressione parar. A página da sua gravação abre, com um link que você pode compartilhar com qualquer pessoa.\n\nPara um agente gravar:\n1. Conecte o CaptureFlow ao app de IA que você usa. A seção Agentes da página inicial tem os passos para Claude, ChatGPT, Claude Code, Codex e Cursor.\n2. Faça login quando uma aba do navegador abrir. Você só faz isso uma vez.\n3. Peça o vídeo com suas palavras, por exemplo: Grave uma demo de como se cadastrar no nosso site, com narração.\n4. O agente grava e entrega um link que você pode compartilhar com qualquer pessoa.",
      },
      {
        question: "Posso fazer a auto-hospedagem do CaptureFlow?",
        answer:
          "Sim. O CaptureFlow é de código aberto sob a AGPL, e todo o backend roda na Cloudflare: Workers para o app e a API, R2 para as gravações e D1 para todo o resto. Crie um banco de dados D1 e um bucket R2, aplique as migrações, defina um segredo e faça o deploy. Também há um botão Deploy to Cloudflare. O guia está em docs.captureflow.dev.",
      },
      {
        question: "Meu agente de IA pode gravar vídeos para mim?",
        answer:
          "Sim. Adicione o CaptureFlow ao Claude Code, Codex ou Cursor com uma linha, ou adicione no Claude ou no ChatGPT, e depois peça um vídeo com suas palavras. Ele grava um navegador, sua tela ou um app no seu próprio computador, adiciona slides e narração se você quiser e entrega um link para compartilhar.\n\nAs gravações de agente locais estão incluídas em todos os planos. As gravações de agente na nuvem têm uma cota mensal que depende do seu plano.",
      },
      {
        question: "Como funcionam os preços dos planos pagos?",
        answer: `${LIGHT} e ${PRO} têm um preço por membro por mês, menor na cobrança anual. Um membro é alguém que grava, então você paga só pelas pessoas que fazem gravações.\n\nQuando alguém entra ou sai, o número de licenças é ajustado na fatura seguinte.`,
      },
      {
        question: "Por quanto tempo minhas gravações são mantidas?",
        answer:
          "Nos planos pagos, até você excluir. No plano gratuito, uma gravação é removida depois de 30 dias sem visualização, para que contas inativas não ocupem espaço. Na auto-hospedagem, você define as regras.",
      },
      {
        question: "O que o plano gratuito inclui?",
        answer: `Você tem 25 gravações por pessoa, de até 5 minutos cada, na qualidade economia de dados, com transcrições e legendas. As gravações são removidas depois de 30 dias sem visualização. Cadastre-se, instale a extensão do Chrome e comece a gravar.\n\nO ${LIGHT} remove os limites por um preço por membro e mantém as gravações até você excluir.`,
      },
    ],
  },
  cta: {
    headline: "Comece a gravar",
    subtitle:
      "Download grátis. Sem cartão de crédito. Diga em uma mensagem de vídeo rápida em vez de marcar mais uma reunião.",
    button: "Experimente o CaptureFlow grátis",
  },
  footer: {
    tagline:
      "Gravação de tela de código aberto com links de compartilhamento instantâneos.",
    lights: "Luzes",
    lightsOn: "Acesas · puxe a cordinha",
    lightsOff: "Apagadas · puxe a cordinha",
    product: {
      title: "Produto",
      features: "Recursos",
      pricing: "Preços",
      compare: "Comparar",
      download: "Baixar",
      suggest: "Sugerir um recurso",
    },
    resources: {
      title: "Materiais",
      docs: "Documentação",
      selfHosting: "Auto-hospedagem",
      blog: "Blog",
      releases: "Versões",
      faq: "FAQ",
      security: "Segurança",
    },
    community: {
      title: "Comunidade",
    },
    legal: {
      title: "Jurídico",
      privacy: "Política de Privacidade",
      terms: "Termos de Serviço",
      refund: "Política de Reembolso",
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
      joinFailed: "Não foi possível entrar na lista de espera. Tente de novo.",
      network: "Erro de rede. Tente de novo.",
    },
    success:
      "Você está na lista. Vou enviar um e-mail quando o CaptureFlow estiver pronto.",
    emailPlaceholder: "you@example.com",
    buttonLoading: "Entrando…",
    buttonDefault: "Entrar na lista de espera",
    earlyAccessPrompt: "Quer acesso antecipado?",
    earlyAccessLink: "Seja um testador beta",
  },
  download: {
    heading: "Baixe o CaptureFlow",
    subtitle:
      "Disponível para Chrome, com um app para macOS em breve. Cada gravação ganha um link que você pode compartilhar.",
    button: "Baixar para macOS",
    requires: "Requer {version} ou posterior em Apple Silicon.",
    requirements: "Requer macOS 14 ou posterior em Apple Silicon.",
    versionLabel: "Versão {version}",
    sizeLabel: "DMG de {size} MB",
    notarized: "Assinado e autenticado pela Apple",
  },
  downloadPage: {
    otherWays: "Outras formas de obter",
    buildTitle: "Compilar a partir do código-fonte",
    buildBody: "Clone o repositório e rode o gravador localmente com pnpm.",
    releasesTitle: "Todas as versões",
    releasesBody: "Veja todas as builds publicadas e o changelog no GitHub.",
    cloud: "Prefere a nuvem? {link} e veja as gravações no navegador.",
    cloudLink: "Crie uma conta",
  },
  blog: {
    title: "Blog",
    subtitle: "Dicas, guias e novidades sobre gravação de tela.",
    readArticle: "Ler artigo",
    empty: "Ainda não há posts. Volte em breve.",
  },
};

export default messages;

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
      title: "CaptureFlow - 공유 링크로 전달하는 화면 녹화 프로그램",
      description:
        "화면을 녹화하고 링크로 팀이나 고객에게 공유하세요. AI 전사와 주석 스크린샷을 갖춘 오픈소스 화면 녹화 프로그램으로, Cloudflare에 직접 호스팅할 수 있습니다.",
    },
    features: {
      title: "화면 녹화 프로그램 기능",
      description:
        "탭, 창 또는 전체 화면을 카메라와 마이크와 함께 녹화하고, 주석을 단 스크린샷을 찍고, 각 캡처를 팀이 댓글을 달 수 있는 링크로 공유하세요.",
    },
    pricing: {
      title: "요금제: 무료로 시작, 멤버당 하나의 가격",
      description: `${FREE_RECORDINGS}개의 녹화로 무료로 시작하세요. ${LIGHT}와 ${PRO}는 멤버당 하나의 가격에 녹화와 AI를 무제한으로 제공합니다. CaptureFlow를 직접 무료로 호스팅할 수도 있습니다.`,
    },
    faq: {
      title: "FAQ: 공유, 저장 공간, 셀프 호스팅",
      description:
        "CaptureFlow에 대해 자주 묻는 질문: 공유 링크의 작동 방식, Cloudflare 셀프 호스팅에 필요한 것, 저장 공간 한도, 녹화를 비공개로 유지하는 방법.",
    },
    download: {
      title: "Chrome용 화면 녹화 프로그램 다운로드",
      description:
        "CaptureFlow Chrome 확장 프로그램을 설치해 화면을 녹화하고 링크로 공유하세요.",
    },
    enterprise: {
      title: "엔터프라이즈",
      description:
        "대규모 기업을 위한 관리형 CaptureFlow: 모든 구성원의 좌석, 맞춤 계약 조건, 하나의 청구서. 필요한 사항을 알려주세요.",
    },
    selfHostSetup: {
      title: "셀프 호스팅 설치",
      description:
        "회사의 Cloudflare 계정에 CaptureFlow를 설치해 드립니다: 회사 도메인, 회사 전용 로그인, 팀을 위한 비공개 Chrome 확장 프로그램.",
    },
    swarmDemo: {
      title: "스웜 데모: 에이전트가 어떤 웹사이트든 영상으로 다시 만듭니다",
      description:
        "웹사이트 주소를 입력하면 에이전트 커서 떼가 음악에 맞춰 요소 하나하나를 다시 만들어 가는 모습을 볼 수 있습니다. 공유 링크가 있는 영상을 받습니다.",
    },
    chromeExtension: {
      title: "Chrome 확장 프로그램: 화면을 녹화하고 링크로 공유하세요",
      description:
        "Chrome에서 화면, 탭 또는 카메라를 녹화하세요. 녹화를 마치면 자막, 요약, 챕터가 포함된, 누구나 볼 수 있는 링크를 받습니다.",
    },
    agentRecorder: {
      title: "MCP 서버: AI 에이전트가 동영상을 녹화합니다",
      description:
        "Claude Code, Codex, Cursor 또는 ChatGPT를 MCP로 CaptureFlow에 연결하세요. 에이전트가 웹 앱, 화면 또는 창 하나를 녹화하고 공유할 링크를 건넵니다.",
    },
  },
  nav: {
    features: "기능",
    discover: "둘러보기",
    pricing: "요금제",
    faq: "FAQ",
    changelog: "변경 내역",
    login: "로그인",
    library: "내 녹화",
    download: "다운로드",
    language: "언어",
    openMenu: "메뉴 열기",
    menu: "메뉴",
    main: "메인",
    docs: "문서",
    resources: "리소스",
    faqDescription: "자주 묻는 질문과 답변",
    blog: "블로그",
    blogDescription: "가이드와 업데이트",
    selfHosting: "셀프 호스팅",
    selfHostingDescription: "내 Cloudflare에서 직접 실행",
    community: "커뮤니티",
    communityDescription: "Discord에서 도움 받고 대화하기",
    products: "제품",
    swarmDemo: "스웜 데모",
    swarmDemoDescription: "에이전트가 어떤 웹사이트든 영상으로 다시 만들기",
    extension: "Chrome 확장 프로그램",
    extensionDescription: "화면을 녹화하고 링크로 공유",
    agentRecorder: "에이전트용 레코더",
    agentRecorderDescription: "AI 에이전트가 MCP로 만드는 영상",
    star: "GitHub에서 스타 누르기",
    starCount: "GitHub에서 스타 누르기 ({stars})",
    themeToLight: "라이트 테마로 전환",
    themeToDark: "다크 테마로 전환",
  },
  banner: {
    label: "베타",
    aria: "CaptureFlow는 공개 베타 중입니다",
    title: "일찍 오셨네요 🎉",
    strip:
      "CaptureFlow는 아직 베타이므로 자주 바뀌고, 안정되는 동안 간혹 다듬어지지 않은 부분을 만날 수 있습니다.",
    body: "CaptureFlow는 공개 베타 중입니다. 거의 매주 새 기능이 추가되며, 사람들이 요청한 것부터 먼저 만듭니다.",
    cta: "다음에 만들 기능 제안하기",
    close: "닫기",
  },
  announcement: {
    badge: "새 기능",
    lead: "이제 AI 에이전트가 대신 녹화해 줍니다.",
    rest: "한 번 연결하고 영상을 요청하면 링크를 받습니다.",
    cta: "연결",
  },
  hero: {
    title: "나와 AI 에이전트를 위한\n화면 녹화 프로그램",
    subtitle:
      "데모, 사용법, 안내 영상, 발표를 직접 녹화하거나 AI에게 녹화를 맡기세요. 각 영상은 누구나 볼 수 있는 링크로 공유됩니다.",
    ctaLabel: "CaptureFlow 무료로 사용해 보기",
    installChrome: "Chrome 확장 프로그램 설치",
    installMac: "macOS용 다운로드",
    installSoon: "곧 출시",
    connectMcp: "MCP 연결",
    macSoon: "macOS 앱 곧 출시",
    installOr: "또는",
    mcpCopy: "복사",
    mcpCopied: "복사됨",
    mcpAddToCursor: "Cursor에 추가",
    badge: "오픈소스, {github}에서 무료로 실행",
    noCreditCard: "신용카드 필요 없음",
    teaser: {
      title: "셀프 호스팅 가능",
      body: "내 Cloudflare 계정에서 직접 실행하세요.",
      cta: "CaptureFlow 사용해 보기",
    },
    demo: {
      prevAria: "이전 데모",
      nextAria: "다음 데모",
      dotAria: "{total}개 중 {n}번째 데모 보기",
    },
  },
  highlights: {
    heading: "모든 기능",
    subtitle: "녹화, 편집, 공유. 모두 한곳에서 합니다.",
    items: {
      recording: { title: "화면과 카메라", body: "둘을 동시에 녹화" },
      transcripts: { title: "전사", body: "99개 언어 지원", tag: "AI" },
      editing: {
        title: "전사 편집",
        body: "텍스트를 지우면 영상이 잘립니다",
        tag: "AI",
      },
      camera: {
        title: "카메라 효과",
        body: "배경과 필터",
      },
      canvas: { title: "무한 캔버스", body: "녹화하면서 스케치" },
      screenshots: {
        title: "주석 스크린샷",
        body: "화살표, 텍스트, 블러",
      },
      feedback: {
        title: "댓글과 리액션",
        body: "영상에 대한 피드백",
      },
      summary: {
        title: "요약과 챕터",
        body: "영상마다 제목 포함",
        tag: "AI",
      },
      filler: {
        title: "군더더기 말 자동 제거",
        body: "음, 어 같은 말을 잘라냅니다",
        tag: "AI",
      },
    },
    cta: "모든 기능 보기",
    previews: {
      app: "출시 계획",
      columns: ["할 일", "진행 중", "완료"],
      lines: [
        "새 흐름은 이렇습니다.",
        "먼저 워크스페이스를 고르세요.",
        "그다음 링크를 공유하세요.",
      ],
      retake: "음, 다시 시작할게요.",
      filler: [
        "[음,] 새 흐름은 이렇습니다.",
        "먼저 [어,] 워크스페이스를 고르세요.",
        "그다음 [음,] 링크를 공유하세요.",
      ],
      step: "1단계",
      note: "이걸 옮기기",
      comment: "이 흐름 마음에 들어요",
      summaryTitle: "팀을 초대하는 방법",
      summaryBody: "워크스페이스를 고른 다음 링크를 공유하세요.",
      chapters: ["소개", "워크스페이스 선택"],
    },
  },
  mcpFeatures: {
    heading: "MCP 기능",
    subtitle:
      "연결한 뒤 AI 에이전트가 할 수 있는 일입니다. Claude Code, Codex, Cursor 또는 어떤 MCP 클라이언트에서든 내 컴퓨터에서 녹화합니다.",
    cta: "가이드 읽기",
    items: {
      webApp: { title: "웹 앱 녹화", body: "localhost 포함" },
      screen: { title: "화면 녹화", body: "디스플레이 전체" },
      window: {
        title: "창 하나 녹화",
        body: "터미널, VS Code 또는 Figma",
      },
      slides: { title: "슬라이드 추가", body: "제목, 단계, 마무리 문구" },
      voiceover: { title: "보이스오버 추가", body: "내 컴퓨터에서 실행" },
      report: { title: "보고서 작성", body: "한 일과 실패한 일" },
      search: { title: "녹화 검색", body: "영상과 전사" },
      save: { title: "MP4 파일 저장", body: "업로드나 로그인 없이" },
    },
  },
  useCases: {
    heading: "팀에서 활용하는 방법",
    subtitle:
      "팀이 녹화하는 것들의 예시입니다. 각 영상은 어떤 브라우저에서도 재생되는 링크입니다.",
    cta: "작동 방식 보기",
    cards: {
      engineering: {
        title: "엔지니어링",
        body: "PR 안내나 버그 재현 과정을 녹화합니다.",
      },
      design: {
        title: "디자인",
        body: "목업 안내를 녹화하고 댓글을 모읍니다.",
      },
      support: {
        title: "고객 지원",
        body: "짧은 안내 영상으로 티켓에 답합니다.",
      },
      updates: {
        title: "팀 업데이트",
        body: "주간 업데이트를 녹화하고 링크를 공유합니다.",
      },
    },
    engineeringFile: "checkout.ts",
    engineeringPr: "PR #482",
    designApp: "trip-app",
    designBadge: "결제 v3",
    designCardTitle: "여행 계획하기",
    designColors: "색상",
    designComment: "CTA를 더 크게?",
    supportQuestion: "팀을 워크스페이스에 초대하려면 어떻게 하나요?",
    supportReply: "간단한 안내 영상입니다:",
    supportLink: "captureflow.dev/r/8kx2pnq4",
    updatesTitle: "주간 업데이트",
    updatesRange: "6–10일",
    updatesSignups: "가입",
    updatesShipped: "출시",
    updatesFeatures: "기능",
  },
  agents: {
    heading: "또는 AI 에이전트에게 데모와 사용법 녹화를 맡기세요",
    worksWith: "{claude}, {openai}, {cursor}와 함께 작동합니다.",
    cta: "가이드 읽기",
    subtitle:
      "평소 말하듯 요청하세요. 내 컴퓨터에서 브라우저, 화면 또는 앱을 녹화하고, 원하면 슬라이드와 보이스오버를 넣은 뒤 링크를 건네줍니다.",
    steps: [
      {
        title: "에이전트 연결",
        body: "한 줄로 CaptureFlow를 Claude Code, Codex 또는 Cursor에 추가하세요. Node.js 20 이상이 필요하며, 에이전트는 한 번만 로그인합니다. Claude나 ChatGPT에서는 URL로 추가합니다.",
      },
      {
        title: "영상 요청",
        body: "기능 데모, 사용법, 버그 리포트 또는 내레이션이 들어간 발표 자료.",
      },
      {
        title: "대신 녹화",
        body: "내 컴퓨터에서, localhost의 앱까지 녹화합니다.",
      },
      {
        title: "슬라이드와 음성 추가",
        body: "원하면 제목 슬라이드와 보이스오버를 넣습니다.",
      },
      {
        title: "공유할 링크 전달",
        body: "풀 리퀘스트에 첨부하거나 Slack에 올리거나 고객에게 보내세요.",
      },
    ],
    scenes: {
      ask: {
        name: "터미널",
        badge: "에이전트",
        prompt: "결제 데모 녹화해 줘",
        steps: ["앱 여는 중", "클릭하며 진행 중", "링크가 준비되었습니다"],
      },
      record: {
        url: "localhost:3000",
        badge: "데모",
        title: "결제",
        fields: ["이름", "카드 번호"],
        pay: "지금 결제",
        paid: "결제 완료",
      },
      voice: {
        title: "결제 데모",
        subtitle: "세 단계로 결제하는 방법",
      },
      share: {
        title: "결제 데모",
        link: "captureflow.dev/r/checkout",
        places: ["PR", "Slack", "이메일"],
      },
    },
    chats: {
      claude:
        "Claude에서 사용자 설정을 열고 커넥터로 이동한 다음 사용자 지정 커넥터 추가를 선택하세요. 이름을 CaptureFlow로 정하고 이 URL을 붙여넣은 뒤 로그인하세요.",
      chatgpt:
        "웹 ChatGPT에서 플러그인을 열고 +를 누른 다음 사용자 지정 MCP 서버 추가를 선택하세요. 이름을 CaptureFlow로 정하고 이 URL을 붙여넣고 OAuth를 선택한 뒤 플러그인을 설치하고 로그인하세요. Business, Enterprise 또는 Edu 요금제가 필요합니다.",
      limits:
        "채팅은 컴퓨터를 녹화하지 않고 당사 서버에서 슬라이드로 프레젠테이션과 사용법 영상을 만들며, 플랜의 클라우드 에이전트 시간을 사용합니다.",
    },
  },
  modes: {
    cta: "녹화 시작",
    heading: "Chrome 확장 프로그램으로 화면 녹화하기",
    subtitle:
      "설치하고 녹화 버튼을 누르세요. 녹화를 마치면 제목, 요약, 챕터, 전사가 포함된, 누구나 볼 수 있는 링크를 받습니다.",
    scene: {
      timer: "0:42",
      heading: "환불 처리 방식",
      steps: ["요청", "승인", "지급"],
      captions: [
        "환불이 처리되는 과정을 간단히 살펴봅니다.",
        "먼저 고객이 요청을 보냅니다.",
        "지원팀이 당일에 승인합니다.",
        "그다음 돈이 자동으로 지급됩니다.",
      ],
    },
  },
  pageHeroes: {
    home: "홈",
    features: {
      label: "기능",
      word: "기능",
      title: "화면을 녹화하고 편집하고 공유하세요",
      subtitle:
        "화면과 카메라를 녹화하세요. 각 녹화를 팀이 댓글을 달 수 있는 링크로 공유합니다.",
    },
    pricing: {
      label: "요금제",
      word: "요금제",
      title: "무료로 시작하세요. 멤버당 하나의 가격입니다.",
      subtitle:
        "무료 요금제는 처음 25개의 녹화를 지원합니다. Light와 Pro는 이 한도를 없앱니다. CaptureFlow를 직접 무료로 호스팅할 수도 있습니다.",
    },
    faq: {
      label: "FAQ",
      word: "FAQ",
      title: "자주 묻는 질문",
      subtitle:
        "녹화, 요금제, 저장 공간, 셀프 호스팅에 대한 답변입니다. 그 외에는 문서를 읽어 보세요.",
    },
    chromeExtension: {
      label: "Chrome 확장 프로그램",
      word: "CHROME",
      title: "Chrome에서 화면 녹화",
      subtitle:
        "화면, 탭 또는 카메라를 녹화하세요. 녹화를 마치면 자막, 요약, 챕터가 포함된, 누구나 볼 수 있는 링크를 받습니다.",
    },
    agentRecorder: {
      label: "에이전트용 레코더",
      word: "MCP",
      title: "AI 에이전트가 동영상을 녹화하게 하세요",
      subtitle:
        "MCP로 연결하고 평소 말투로 요청하세요. 웹 앱, 화면 또는 창 하나를 녹화하고, 원하면 슬라이드와 음성을 더해 링크를 건넵니다.",
    },
  },
  collaboration: {
    heading: "녹화 후에 할 수 있는 일",
    cta: "무료로 사용해 보기",
    subtitle:
      "편집한 다음 공유하거나 임베드하세요. 팀을 초대해 서로의 영상을 보고 리액션하고 댓글을 달 수 있습니다.",
    categories: {
      share: {
        feature: {
          tag: "새 기능",
          title: "영상 편집",
          cta: "확장 프로그램 설치",
          body: "전사에서 단어를 지워 영상에서 잘라내거나 타임라인에서 클립을 다듬으세요. 배경을 바꾸고, 카메라를 옮기거나 크기를 조절하거나 숨기고, 마이크나 시스템 소리를 음소거할 수 있습니다.",
        },
        scene: {
          app: "출시 계획",
          nav: ["개요", "로드맵", "작업", "문서"],
          columns: [
            { name: "할 일", tasks: ["요금제 페이지 문구", "온보딩 이메일"] },
            {
              name: "진행 중",
              tasks: ["결제 화면 재설계", "팀 초대"],
            },
            { name: "완료", tasks: ["베타 가입 양식"] },
          ],
          background: "배경",
          camera: "카메라",
          shapes: ["원형", "사각형"],
          fillers: "군더더기 말",
          remove: "제거",
          transcript: {
            before: "여기를 클릭해서",
            fillers: ["어,", "잠깐,", "죄송,"],
            after: "링크를 공유하세요.",
          },
          saved: "저장됨 · 같은 링크",
        },
      },
      embed: {
        feature: {
          title: "영상 공유 또는 임베드",
          cta: "확장 프로그램 설치",
          body: "Slack, GitHub, Notion 또는 이메일에 링크를 붙여넣으면 미리보기가 표시됩니다. 플레이어를 문서나 사이트에 임베드할 수도 있습니다. 확장 프로그램을 설치하면 GitHub 이슈와 풀 리퀘스트 안에서 바로 재생됩니다.",
        },
        scene: {
          question: "팀을 워크스페이스에 초대하는 방법을 보여 주실 수 있나요?",
          reply: "물론이죠! 단계를 짧게 담은 안내 영상입니다:",
          url: "captureflow.dev/r/8kx2pnq4",
          app: "설정",
          nav: ["일반", "멤버", "결제"],
          members: "멤버",
          invite: "초대",
          people: [
            { initials: "AR", name: "Alex Rivera", role: "소유자" },
            { initials: "CK", name: "Chris Kim", role: "멤버" },
            { initials: "JB", name: "Jordan Bell", role: "멤버" },
          ],
          duration: "0:48",
        },
      },
      feedback: {
        feature: {
          title: "영상으로 함께 협업하기",
          cta: "로그인",
          body: "시간대가 달라도 회의 없이 함께 일하세요. 팀은 이모지로 리액션하고, 영상의 원하는 시점에 댓글을 달고, 전사와 자막으로 내용을 따라갈 수 있습니다.",
        },
        scene: {
          title: "출시 계획 안내",
          author: "Alex",
          age: "방금",
          duration: "1:12",
          activity: "활동",
          events: [
            { initials: "CK", name: "Chris", at: "0:09", emoji: "👍" },
            { initials: "JB", name: "Jordan", at: "0:17", emoji: "🔥" },
            {
              initials: "MC",
              name: "Maya",
              at: "0:27",
              text: "새 보드 뷰 마음에 들어요",
            },
            { initials: "SL", name: "Sam", at: "0:37", emoji: "❤️" },
            {
              initials: "JB",
              name: "Jordan",
              at: "0:48",
              text: "이번 금요일에 출시할 수 있을까요?",
            },
            {
              initials: "AR",
              name: "Alex",
              at: "0:56",
              text: "네, QA 직후에요 ✅",
            },
            { initials: "MC", name: "Maya", at: "1:05", emoji: "👏" },
          ],
        },
      },
      workspaces: {
        feature: {
          title: "팀을 워크스페이스에 초대",
          cta: "워크스페이스 만들기",
          body: "모두의 녹화가 하나의 워크스페이스에 보관됩니다. 각 영상은 공개, 워크스페이스 공개 또는 비공개로 설정할 수 있습니다.",
        },
        scene: {
          team: "CaptureFlow 팀",
          members: ["멤버 1명", "멤버 2명", "멤버 3명"],
          memberInitials: ["AR", "CK", "JB"],
          invitePlaceholder: "이메일로 초대",
          inviteEmail: "chris@acme.co, jordan@acme.co",
          invite: "초대",
          invited: "전송됨",
          joined: "Chris와 Jordan이 참여했습니다 🎉",
          whoCanWatch: "볼 수 있는 사람:",
          visibility: [
            { label: "공개", detail: "링크가 있는 누구나" },
            { label: "워크스페이스", detail: "내 팀만" },
            { label: "비공개", detail: "나만" },
          ],
        },
      },
    },
  },
  setupService: {
    title: "설치는 저희가",
    titleHighlight: "대신 해 드립니다",
    subtitle:
      "회사에 대해 알려주세요. 앱, Chrome 확장 프로그램, macOS 앱과 그 뒤의 모든 인프라를 팀이 바로 쓸 수 있게 설치해 드립니다.",
    includedHeading: "설치해 드리는 모든 것",
    included: {
      infra: {
        title: "회사 인프라 위의 앱",
        body: "회사의 Cloudflare 계정에 배포하고 회사 도메인으로 제공합니다. 모든 것이 회사 소유입니다.",
      },
      storage: {
        title: "저장 공간과 데이터베이스",
        body: "녹화는 회사의 R2 버킷에, 워크스페이스와 댓글은 회사의 데이터베이스에 저장됩니다.",
      },
      signin: {
        title: "회사 전용 로그인",
        body: "회사 이메일 도메인으로 제한된 Google Workspace 또는 GitHub 로그인.",
      },
      apps: {
        title: "Chrome 확장 프로그램과 Mac 앱",
        body: "둘 다 회사 인스턴스용으로 빌드하며, 확장 프로그램은 팀만 쓸 수 있게 비공개로 게시합니다.",
      },
      ready: {
        title: "바로 녹화 가능",
        body: "워크스페이스를 만들고 팀을 초대해 두어 바로 공유를 시작할 수 있습니다.",
      },
      handover: {
        title: "인수인계",
        body: "운영과 업데이트 방법을 담당자에게 안내해 드립니다.",
      },
    },
    nextHeading: "문의하기",
    nextSubheading: "필요한 사항을 알려주시면 연락드리겠습니다.",
    form: {
      company: "회사",
      companyPlaceholder: "Acme Inc.",
      name: "이름",
      namePlaceholder: "홍길동",
      email: "업무용 이메일",
      emailPlaceholder: "jane@acme.com",
      topic: "어떤 도움이 필요하신가요?",
      topics: ["셀프 호스팅 설치", "1 TB 이상", "기타"],
      teamSize: "팀 규모",
      teamSizes: ["1–10", "11–50", "51–200", "200+"],
      cloudflare: "Cloudflare 계정이 있으신가요?",
      cloudflareOptions: ["예", "아니요", "잘 모름"],
      notes: "그 밖에 알아야 할 것이 있나요?",
      notesPlaceholder: "팀 규모, 도메인, 일정…",
      submit: "메시지 보내기",
      error:
        "요청을 보내지 못했습니다. 다시 시도하거나 {email}로 이메일을 보내 주세요.",
      sentTitle: "메시지를 보냈습니다",
      sentBody: "감사합니다. {email}로 답장드리겠습니다.",
      back: "홈으로 돌아가기",
    },
  },
  swarmDemo: {
    title: "에이전트가 다시 만드는 모습을 보세요:",
    titleHighlight: "어떤 웹사이트든",
    subtitle:
      "웹사이트 주소를 입력하세요. 에이전트 커서 떼가 음악에 맞춰 요소 하나하나를 다시 그리고, 공유할 수 있는 영상 링크를 받습니다.",
    url: "웹사이트 주소",
    urlPlaceholder: "https://example.com",
    generate: "데모 생성",
    generating: "클라우드 브라우저 시작 중…",
    check: "웹사이트 확인",
    checking: "웹사이트를 확인하는 중…",
    previewNote: "에이전트가 다시 만들 페이지입니다. 맞으면 데모를 생성하세요.",
    change: "주소 변경",
    note: "로그인하면 무료로 생성할 수 있습니다. 데모는 라이브러리에 저장됩니다.",
    noteSignedIn: "무료로 생성할 수 있습니다. 데모는 라이브러리에 저장됩니다.",
    howHeading: "작동 방식",
    how: {
      type: {
        title: "주소 입력",
        body: "공개된 웹사이트라면 무엇이든. 페이지를 클라우드 브라우저에서 불러와 제목, 이미지, 버튼, 카드를 모두 찾아냅니다.",
      },
      build: {
        title: "에이전트가 다시 만듭니다",
        body: "요청이 채팅창에 입력되면 커서 떼가 각 요소를 배치하고, 그동안 음악은 점점 빨라집니다.",
      },
      share: {
        title: "링크 받기",
        body: "완성되는 즉시 영상이 라이브러리에서 열립니다. 링크를 공유하거나 파일을 다운로드하거나 게시하세요.",
      },
    },
    errors: {
      invalidUrl: "example.com 같은 웹사이트 주소를 입력하세요.",
      unreachable:
        "해당 웹사이트에 접속할 수 없습니다. 주소를 확인하고 다시 시도하세요.",
      unavailable: "이 서버에서는 데모를 사용할 수 없습니다.",
      running:
        "아직 진행 중인 녹화가 있습니다. 끝날 때까지 기다린 뒤 다시 시도하세요.",
      limit:
        "이 워크스페이스는 이번 달 클라우드 에이전트 시간을 모두 사용했습니다. 매월 1일에 초기화됩니다.",
      recordings:
        "무료 플랜의 녹화 한도에 도달했습니다. 녹화를 삭제하거나 업그레이드한 뒤 다시 시도하세요.",
      busy: "지금은 모든 클라우드 브라우저가 사용 중입니다. 몇 분 후에 다시 시도하세요.",
      failed: "데모를 시작할 수 없습니다. 다시 시도하세요.",
    },
  },
  enterprise: {
    title: "우리 회사를 위한",
    titleHighlight: "CaptureFlow",
    subtitle:
      "모든 구성원의 좌석을 한 번 합의한 조건으로, 하나의 청구서로 사용하려는 회사를 위한 관리형 요금제입니다.",
    includedHeading: "엔터프라이즈에서 추가되는 것",
    included: {
      storage: {
        title: "회사 규모에 맞춘 저장 공간",
        body: "좌석별 할당량이 아니라 회사의 녹화량에 맞춘 저장 공간 풀입니다.",
      },
      seats: {
        title: "모든 구성원의 좌석",
        body: "녹화하는 사람이 몇 명이든 계약 하나로 회사 전체를 포함합니다.",
      },
      roadmap: {
        title: "요청 사항 우선 반영",
        body: "팀이 요청한 기능을 저희 목록의 맨 위로 올립니다.",
      },
      managed: {
        title: "완전 관리형",
        body: "호스팅과 업데이트를 저희가 맡으므로 직접 운영할 것이 없습니다.",
      },
      billing: {
        title: "연간 결제",
        body: "회사에 맞게 합의한 가격으로 일 년에 한 번 결제합니다.",
      },
      support: {
        title: "직접 소통 창구",
        body: "질문은 CaptureFlow를 만드는 사람들에게 바로 전달됩니다.",
      },
    },
    everythingHeading: "팀이 받는 모든 것",
    comingSoon: "곧 출시",
    everything: {
      extension: {
        title: "Chrome 확장 프로그램",
        body: "어떤 탭이나 화면이든 녹화하고, 중지하면 링크가 준비됩니다.",
      },
      mac: {
        title: "Mac 앱",
        body: "같은 즉시 공유 링크를 제공하는 macOS 네이티브 녹화 앱.",
      },
      workspaces: {
        title: "팀 워크스페이스",
        body: "모두의 녹화를 한곳에 모아 공유하거나 비공개로 둡니다.",
      },
      feedback: {
        title: "댓글과 리액션",
        body: "시청자가 타임라인의 정확한 시점에 바로 답글을 남깁니다.",
      },
      edit: {
        title: "공유 후 편집",
        body: "배경, 카메라, 오디오를 바꿔도 링크는 그대로입니다.",
      },
      screenshots: {
        title: "주석 스크린샷",
        body: "스크린샷에 화살표, 텍스트, 블러로 표시하고 링크로 공유하세요.",
      },
    },
    formHeading: "문의하기",
    formSubheading: "팀에 대해 알려주시면 이메일로 답변드리겠습니다.",
    form: {
      company: "회사",
      companyPlaceholder: "Acme Inc.",
      name: "이름",
      namePlaceholder: "홍길동",
      email: "업무용 이메일",
      emailPlaceholder: "jane@acme.com",
      need: "무엇이 필요하신가요?",
      needs: ["대규모 팀의 좌석", "맞춤 조건 또는 하나의 청구서", "기타"],
      teamSize: "팀 규모",
      teamSizes: ["1–10", "11–50", "51–200", "200+"],
      storage: "저장 공간은 얼마나 필요하신가요?",
      storageOptions: ["1–5 TB", "5–20 TB", "20 TB+", "잘 모름"],
      notes: "그 밖에 알아야 할 것이 있나요?",
      notesPlaceholder: "팀의 녹화량, 일정, 결제 관련 요구 사항…",
      submit: "메시지 보내기",
      error:
        "메시지를 보내지 못했습니다. 다시 시도하거나 {email}로 이메일을 보내 주세요.",
      sentTitle: "메시지를 보냈습니다",
      sentBody: "감사합니다. {email}로 답장드리겠습니다.",
      back: "홈으로 돌아가기",
    },
  },
  pricing: {
    heading: "요금제",
    cta: "모든 요금제 비교",
    subheading:
      "무료 요금제는 처음 몇 개의 녹화를 지원합니다. 유료 요금제는 멤버당 하나의 가격입니다.",
    controls: {
      shownIn: "가격은 {currency}로 표시됩니다. 결제는 미국 달러로 청구됩니다.",
      teamSize: "팀 규모",
      members: "명",
      title: "결제",
      note: "멤버당 하나의 가격.",
      billing: "결제 주기",
      monthly: "월간",
      annually: "연간",
      save: "{percent}% 절약",
    },
    compare: {
      loomRow: "Loom {plan}",
      loomDetail: "{seats}명 × 각 {perSeat}",
      caption: "월 가격 기준.",
      captureflowRow: "CaptureFlow {ourPlan}",
      captureflowDetail: "멤버 {seats}명 × 각 {ourPerSeat}",
      saveLabel: "팀의 절약 금액",
      saveValue: "연간 {savings}",
    },
    plans: {
      chargedInUsd: "미국 달러로 청구됩니다.",
      member: "멤버",
      members: "멤버",
      included: "포함",
      notIncluded: "미포함",
      free: {
        name: "무료",
        description: "링크로 공유하는 화면 녹화.",
        cta: "가입하기",
      },
      light: {
        name: LIGHT,
        featuresHeading: "무료의 모든 기능에 더해",
        features: [
          "무제한 녹화",
          "무제한 녹화 시간",
          `월 ${LIGHT_AGENT_MIN}분의 클라우드 에이전트 녹화, 각 최대 10분`,
        ],
        description: "데이터 절약 화질로 무제한 녹화.",
        period: "/월",
        noteMonthly: "멤버당, 월간 결제",
        noteAnnual: "멤버당, 연간 결제. {members} {seats}명 기준 연 {yearly}",
        cta: "무료로 사용해 보기",
      },
      pro: {
        badge: "추천",
        name: PRO,
        featuresHeading: `${LIGHT}의 모든 기능에 더해`,
        features: [
          "최대 1080p 풀 화질",
          "AI 챕터, 제목, 군더더기 말 제거",
          "맞춤 브랜딩",
          `월 ${PRO_AGENT_MIN}분의 클라우드 에이전트 녹화와 ${PRO_VOICEOVER_MIN}분의 AI 보이스오버`,
          "시청자 인사이트 (곧 출시)",
          "Slack, Notion, Zapier 연동 (곧 출시)",
        ],
        description: "풀 화질, AI 정리, 나만의 브랜딩.",
        period: "/월",
        noteMonthly: "멤버당, 월간 결제",
        noteAnnual: "멤버당, 연간 결제. {members} {seats}명 기준 연 {yearly}",
        cta: "무료로 사용해 보기",
      },
      rows: {
        recordings: {
          label: "구성원별 녹화 수",
          free: "최대 {recordings}개",
          light: "무제한",
          pro: "무제한",
        },
        length: {
          label: "녹화 길이",
          free: "영상당 {minutes}분",
          light: "무제한",
          pro: "무제한",
        },
        quality: {
          label: "영상 화질",
          free: "데이터 절약",
          light: "데이터 절약",
          pro: "최대 1080p",
        },
        transcripts: {
          label: "전사와 자막",
          free: true,
          light: true,
          pro: true,
        },
        editing: {
          label: "전사에서 편집",
          free: true,
          light: true,
          pro: true,
        },
        chapters: {
          label: "AI 챕터와 제목",
          free: false,
          light: false,
          pro: true,
        },
        filler: {
          label: "군더더기 말 제거",
          free: false,
          light: false,
          pro: true,
        },
        feedback: {
          label: "댓글과 리액션",
          free: true,
          light: true,
          pro: true,
        },
        agents: {
          label: "로컬 에이전트 녹화",
          free: true,
          light: true,
          pro: true,
        },
        cloudAgents: {
          label: "클라우드 에이전트 녹화",
          free: `월 ${FREE_AGENT_MIN}분`,
          light: `월 ${LIGHT_AGENT_MIN}분`,
          pro: `월 ${PRO_AGENT_MIN}분`,
        },
        voiceover: {
          label: "로컬 AI 보이스오버",
          free: true,
          light: true,
          pro: true,
        },
        cloudVoiceover: {
          label: "클라우드 AI 보이스오버",
          free: false,
          light: false,
          pro: `월 ${PRO_VOICEOVER_MIN}분`,
        },
        branding: {
          label: "맞춤 브랜딩",
          free: false,
          light: false,
          pro: true,
        },
      },
    },
    table: {
      heading: "요금제별 모든 기능",
      subtitle: "무료, Light, Pro를 나란히 비교합니다.",
      groups: [
        {
          title: "녹화",
          rows: [
            {
              label: "멤버",
              free: "무제한",
              light: "무제한",
              pro: "무제한",
            },
            {
              label: "구성원별 녹화 수",
              free: "최대 {recordings}개",
              light: "무제한",
              pro: "무제한",
            },
            {
              label: "녹화 길이",
              free: "영상당 {minutes}분",
              light: "무제한",
              pro: "무제한",
            },
            {
              label: "영상 화질",
              free: "데이터 절약",
              light: "데이터 절약",
              pro: "최대 1080p",
            },
            {
              label: "스크린샷",
              free: "무제한",
              light: "무제한",
              pro: "무제한",
            },
            {
              label: "녹화 보관 기간",
              free: "조회 없이 30일",
              light: "삭제할 때까지",
              pro: "삭제할 때까지",
            },
            {
              label: "전체 화면, 창 또는 탭 캡처",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "카메라 버블과 카메라 효과",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "마이크와 시스템 오디오",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "부드러운 커서",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Chrome 확장 프로그램과 Mac 앱",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "AI",
          rows: [
            {
              label: "전사",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "자막",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "요약 챕터",
              free: false,
              light: false,
              pro: true,
            },
            {
              label: "자동 제목 제안",
              free: false,
              light: false,
              pro: true,
            },
            {
              label: "전사에서 영상 편집",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "군더더기 말 제거",
              free: false,
              light: false,
              pro: true,
            },
          ],
        },
        {
          title: "에이전트",
          rows: [
            {
              label: "내 컴퓨터에서 에이전트 녹화",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "클라우드에서 만드는 에이전트 프레젠테이션",
              free: `한 사람당 월 ${FREE_AGENT_MIN}분`,
              light: `멤버당 월 ${LIGHT_AGENT_MIN}분`,
              pro: `멤버당 월 ${PRO_AGENT_MIN}분`,
            },
            {
              label: "에이전트 녹화의 슬라이드",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "내 컴퓨터에서 AI 보이스오버",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "클라우드 프레젠테이션의 AI 보이스오버",
              free: false,
              light: false,
              pro: `멤버당 월 ${PRO_VOICEOVER_MIN}분`,
            },
          ],
        },
        {
          title: "편집",
          rows: [
            {
              label: "공유 후 편집, 같은 링크 유지",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "배경",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "카메라 버블 이동 또는 크기 조절",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "영상 일부 잘라내기",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "화살표, 텍스트, 블러가 있는 주석 스크린샷",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "무한 캔버스",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "공유와 피드백",
          rows: [
            {
              label: "중지하면 준비되는 공유 링크",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "공개, 워크스페이스 또는 비공개 링크",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "제한된 링크에 접근 요청",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "채팅과 이메일의 링크 미리보기",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "어디든 플레이어 임베드",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "GitHub 이슈와 풀 리퀘스트 안에서 재생",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "타임라인 댓글",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "이모지 리액션",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "조회수",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "원본 파일 다운로드",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "워크스페이스와 관리",
          rows: [
            {
              label: "팀 워크스페이스",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "소유자, 멤버, 뷰어 역할",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "기본 공개 범위와 업로드 권한",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "녹화와 스크린샷 검색",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "맞춤 브랜딩",
              free: false,
              light: false,
              pro: true,
            },
          ],
        },
        {
          title: "호스팅과 지원",
          rows: [
            {
              label: "AGPL 오픈소스",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "내 Cloudflare 계정에 셀프 호스팅",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "관리형 호스팅과 업데이트",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
      ],
    },
    includes: {
      heading: "모든 요금제에 포함",
      items: [
        "나만의 워크스페이스, 누구나 초대",
        "카메라 효과",
        "AI 전사와 자막",
        "전사에서 영상 편집",
        "공개, 워크스페이스 또는 비공개 공유 링크",
        "댓글과 이모지 리액션",
        "주석 스크린샷",
        "무한 캔버스",
      ],
    },
    annual: {
      badgePro: "관리형",
      badgeCycle: "연간",
      title: "관리형 호스팅",
      subtitle: "완전 호스팅, 연간 결제.",
      period: "/월",
      note: "연 {amount} 결제. 언제든 해지할 수 있습니다.",
      cta: "시작하기",
    },
  },
  activity: {
    heading: "GitHub의 최근 변경 사항",
    subtitle:
      "모든 변경은 공개됩니다. GitHub의 최신 풀 리퀘스트와 열린 이슈입니다.",
    cta: "GitHub에서 보기",
    shippedHeading: "최근 병합됨",
    openHeading: "열린 이슈와 풀 리퀘스트",
    emptyOpen: "지금은 열린 항목이 없습니다.",
    newIssue: "버그 신고 또는 기능 요청",
    viewAll: "GitHub에서 전체 보기",
  },
  faq: {
    heading: "자주 묻는 질문",
    subtitle:
      "녹화, 요금제, 저장 공간, 셀프 호스팅에 대한 답변입니다. 그 외에는 문서를 읽어 보세요.",
    cta: "문서 읽기",
    waitlistLink: "대기자 명단 참여",
    items: [
      {
        question: "녹화는 어떻게 하나요?",
        answer:
          "방법은 두 가지이며, 차이는 누가 녹화하느냐입니다.\n\nChrome 확장 프로그램으로는 직접 녹화합니다. 화면을 클릭하며 진행하고 내 목소리와 카메라로 설명을 덧붙일 수 있습니다. 짧은 업데이트, 피드백, 내가 직접 나와야 하는 영상에 쓰세요.\n\nAI 에이전트로는 원하는 영상을 설명하면 에이전트가 대신 클릭하며 녹화하므로 그동안 다른 일을 할 수 있습니다. 슬라이드와 AI 보이스오버도 넣을 수 있습니다. 제품 데모, 사용법, 버그 리포트에 쓰세요.\n\n직접 녹화하려면:\n1. Chrome Web Store에서 CaptureFlow 확장 프로그램을 설치하세요.\n2. 브라우저 툴바의 아이콘을 클릭하고 로그인하세요.\n3. 아이콘을 다시 클릭하세요. This tab, Window 또는 Full screen을 고르고, 원하면 카메라와 마이크를 켜세요.\n4. Start Recording을 누르세요. 페이지의 바에서 일시정지하거나 중지할 수 있습니다.\n5. 중지를 누르세요. 녹화 페이지가 열리고, 누구에게나 공유할 수 있는 링크가 함께 표시됩니다.\n\n에이전트에게 녹화를 맡기려면:\n1. 사용하는 AI 앱에 CaptureFlow를 연결하세요. 홈페이지의 에이전트 섹션에 Claude, ChatGPT, Claude Code, Codex, Cursor별 단계가 있습니다.\n2. 브라우저 탭이 열리면 로그인하세요. 한 번만 하면 됩니다.\n3. 평소 말하듯 영상을 요청하세요. 예: 우리 웹사이트에서 가입하는 방법을 보이스오버와 함께 데모로 녹화해 줘.\n4. 에이전트가 녹화하고 누구에게나 공유할 수 있는 링크를 줍니다.",
      },
      {
        question: "CaptureFlow를 직접 호스팅할 수 있나요?",
        answer:
          "네. CaptureFlow는 AGPL 오픈소스이며, 백엔드 전체가 Cloudflare에서 실행됩니다: 앱과 API는 Workers, 녹화는 R2, 나머지는 모두 D1입니다. D1 데이터베이스와 R2 버킷을 만들고, 마이그레이션을 적용하고, 시크릿 하나를 설정한 뒤 배포하세요. Deploy to Cloudflare 버튼도 있습니다. 가이드는 docs.captureflow.dev에 있습니다.",
      },
      {
        question: "AI 에이전트가 대신 영상을 녹화할 수 있나요?",
        answer:
          "네. 한 줄로 CaptureFlow를 Claude Code, Codex 또는 Cursor에 추가하거나 Claude나 ChatGPT에 추가한 다음, 평소 말하듯 영상을 요청하세요. 내 컴퓨터에서 브라우저, 화면 또는 앱을 녹화하고, 원하면 슬라이드와 보이스오버를 넣은 뒤 공유할 링크를 줍니다.\n\n로컬 에이전트 녹화는 모든 요금제에 포함됩니다. 클라우드 에이전트 녹화는 요금제에 따라 월 사용 시간이 정해져 있습니다.",
      },
      {
        question: "유료 요금제는 어떻게 계산되나요?",
        answer: `${LIGHT}와 ${PRO}는 멤버당 월 하나의 가격이며, 연간 결제 시 더 저렴합니다. 멤버는 녹화하는 사람이므로 녹화를 만드는 사람에 대해서만 결제합니다.\n\n누군가 들어오거나 나가면 좌석 수는 다음 청구서에 반영됩니다.`,
      },
      {
        question: "녹화는 얼마나 오래 보관되나요?",
        answer:
          "유료 요금제에서는 삭제할 때까지 보관됩니다. 무료 요금제에서는 조회 없이 30일이 지난 녹화가 삭제되어, 쓰지 않는 계정이 공간을 차지하지 않습니다. 직접 호스팅하면 규칙을 직접 정합니다.",
      },
      {
        question: "무료 요금제에는 무엇이 포함되나요?",
        answer: `구성원당 25개의 녹화를 각 최대 5분, 데이터 절약 화질로 전사와 자막과 함께 사용할 수 있습니다. 녹화는 조회 없이 30일이 지나면 삭제됩니다. 가입하고 Chrome 확장 프로그램을 설치한 뒤 녹화를 시작하세요.\n\n${LIGHT}는 멤버당 하나의 가격으로 이 한도를 없애고 삭제할 때까지 녹화를 보관합니다.`,
      },
    ],
  },
  cta: {
    headline: "녹화 시작하기",
    subtitle:
      "무료 다운로드. 신용카드 불필요. 또 한 번의 회의 대신 짧은 영상 메시지로 전하세요.",
    button: "CaptureFlow 무료로 사용해 보기",
  },
  footer: {
    tagline: "즉시 공유 링크를 제공하는 오픈소스 화면 녹화.",
    lights: "조명",
    lightsOn: "켜짐 · 줄을 당기세요",
    lightsOff: "꺼짐 · 줄을 당기세요",
    product: {
      title: "제품",
      features: "기능",
      pricing: "요금제",
      compare: "비교",
      download: "다운로드",
      suggest: "기능 제안",
    },
    resources: {
      title: "리소스",
      docs: "문서",
      selfHosting: "셀프 호스팅",
      blog: "블로그",
      releases: "릴리스",
      faq: "FAQ",
      security: "보안",
    },
    community: {
      title: "커뮤니티",
    },
    legal: {
      title: "법적 고지",
      privacy: "개인정보 처리방침",
      terms: "서비스 이용약관",
      refund: "환불 정책",
      license: "라이선스 (AGPL-3.0)",
    },
    rights: "© {year} CaptureFlow. 모든 권리 보유.",
    openSource: "AGPL-3.0 오픈소스",
  },
  pageShell: {
    logoAlt: "CaptureFlow",
    backToHome: "홈으로 돌아가기",
  },
  waitlist: {
    errors: {
      joinFailed: "대기자 명단에 참여하지 못했습니다. 다시 시도해 주세요.",
      network: "네트워크 오류입니다. 다시 시도해 주세요.",
    },
    success:
      "명단에 등록되었습니다. CaptureFlow가 준비되면 이메일로 알려드리겠습니다.",
    emailPlaceholder: "you@example.com",
    buttonLoading: "참여 중…",
    buttonDefault: "대기자 명단 참여",
    earlyAccessPrompt: "먼저 써 보고 싶으신가요?",
    earlyAccessLink: "베타 테스터 되기",
  },
  download: {
    heading: "CaptureFlow 다운로드",
    subtitle:
      "Chrome에서 사용할 수 있으며 macOS 앱은 곧 출시됩니다. 각 녹화마다 공유할 수 있는 링크가 생깁니다.",
    button: "macOS용 다운로드",
    requires: "Apple Silicon에서 {version} 이상이 필요합니다.",
    requirements: "Apple Silicon에서 macOS 14 이상이 필요합니다.",
    versionLabel: "버전 {version}",
    sizeLabel: "{size} MB DMG",
    notarized: "Apple 서명 및 공증 완료",
  },
  downloadPage: {
    otherWays: "다른 설치 방법",
    buildTitle: "소스에서 빌드",
    buildBody:
      "저장소를 클론하고 pnpm으로 녹화 프로그램을 로컬에서 실행하세요.",
    releasesTitle: "모든 릴리스",
    releasesBody: "GitHub에서 게시된 모든 빌드와 변경 내역을 살펴보세요.",
    cloud: "클라우드가 더 편하신가요? {link} 후 브라우저에서 녹화를 보세요.",
    cloudLink: "계정 만들기",
  },
  blog: {
    title: "블로그",
    subtitle: "화면 녹화에 관한 팁, 가이드, 업데이트.",
    readArticle: "글 읽기",
    empty: "아직 글이 없습니다. 곧 다시 확인해 주세요.",
  },
};

export default messages;

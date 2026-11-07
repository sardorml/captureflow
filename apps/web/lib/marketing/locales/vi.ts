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
      title: "CaptureFlow - Phần mềm quay màn hình, chia sẻ bằng liên kết",
      description:
        "Quay màn hình rồi gửi liên kết cho nhóm hay khách hàng. Phần mềm mã nguồn mở có bản chép lời AI và ảnh chụp màn hình có chú thích, tự host được trên Cloudflare.",
    },
    features: {
      title: "Tính năng của phần mềm quay màn hình",
      description:
        "Quay một tab, cửa sổ hoặc toàn màn hình kèm camera và micro, chụp ảnh màn hình có chú thích và chia sẻ bằng liên kết để nhóm của bạn bình luận.",
    },
    pricing: {
      title: "Bảng giá: bắt đầu miễn phí, một mức giá mỗi thành viên",
      description: `Bắt đầu miễn phí với ${FREE_RECORDINGS} bản ghi. ${LIGHT} và ${PRO} có một mức giá mỗi thành viên, không giới hạn bản ghi và có AI. Hoặc tự host CaptureFlow miễn phí.`,
    },
    faq: {
      title: "Câu hỏi thường gặp: chia sẻ, lưu trữ và tự host",
      description:
        "Câu hỏi thường gặp về CaptureFlow: liên kết chia sẻ hoạt động thế nào, tự host trên Cloudflare cần những gì, giới hạn lưu trữ và cách giữ bản ghi riêng tư.",
    },
    download: {
      title: "Tải phần mềm quay màn hình cho Chrome",
      description:
        "Cài tiện ích CaptureFlow cho Chrome để quay màn hình và chia sẻ bằng một liên kết.",
    },
    enterprise: {
      title: "Doanh nghiệp",
      description:
        "CaptureFlow được quản lý cho công ty lớn: suất dùng cho mọi người, điều khoản riêng và một hóa đơn duy nhất. Hãy cho chúng tôi biết bạn cần gì.",
    },
    selfHostSetup: {
      title: "Thiết lập tự host",
      description:
        "Nhờ thiết lập CaptureFlow trên tài khoản Cloudflare riêng của công ty bạn: tên miền của bạn, đăng nhập chỉ dành cho công ty và tiện ích Chrome riêng cho nhóm.",
    },
    swarmDemo: {
      title:
        "Demo bầy agent: các agent dựng lại bất kỳ website nào thành video",
      description:
        "Nhập địa chỉ website và xem một bầy con trỏ agent dựng lại nó từng phần tử một trên nền nhạc. Bạn nhận được một video kèm liên kết để chia sẻ.",
    },
    chromeExtension: {
      title: "Tiện ích Chrome: quay màn hình và chia sẻ liên kết",
      description:
        "Quay màn hình, một thẻ hoặc camera ngay trong Chrome. Khi xong, bạn nhận được một liên kết ai cũng xem được, kèm bản chép lời, tóm tắt và chương.",
    },
  },
  nav: {
    features: "Tính năng",
    discover: "Khám phá",
    pricing: "Bảng giá",
    faq: "Hỏi đáp",
    changelog: "Nhật ký thay đổi",
    login: "Đăng nhập",
    library: "Bản ghi của tôi",
    download: "Tải xuống",
    language: "Ngôn ngữ",
    openMenu: "Mở menu",
    menu: "Menu",
    main: "Chính",
    docs: "Tài liệu",
    resources: "Tài nguyên",
    faqDescription: "Giải đáp các câu hỏi thường gặp",
    blog: "Blog",
    blogDescription: "Hướng dẫn và cập nhật",
    selfHosting: "Tự host",
    selfHostingDescription: "Chạy trên Cloudflare của riêng bạn",
    community: "Cộng đồng",
    communityDescription: "Nhận trợ giúp và trò chuyện trên Discord",
    products: "Sản phẩm",
    swarmDemo: "Demo bầy agent",
    swarmDemoDescription: "Các agent dựng lại bất kỳ website nào thành video",
    extension: "Tiện ích Chrome",
    extensionDescription: "Quay màn hình và chia sẻ liên kết",
    agentRecorder: "Trình quay cho agent",
    agentRecorderDescription: "Video mà agent AI của bạn tạo qua MCP",
    star: "Gắn sao trên GitHub",
    starCount: "Gắn sao trên GitHub ({stars})",
    themeToLight: "Chuyển sang giao diện sáng",
    themeToDark: "Chuyển sang giao diện tối",
  },
  banner: {
    label: "Beta",
    aria: "CaptureFlow đang ở giai đoạn beta công khai",
    title: "Bạn đến sớm đấy 🎉",
    strip:
      "CaptureFlow vẫn đang ở giai đoạn beta nên thay đổi thường xuyên, và bạn có thể gặp vài chỗ chưa hoàn thiện trong lúc sản phẩm ổn định dần.",
    body: "CaptureFlow đang ở giai đoạn beta công khai. Hầu như tuần nào cũng có thứ mới, và những gì mọi người yêu cầu sẽ được làm trước.",
    cta: "Cho tôi biết nên làm gì tiếp theo",
    close: "Đóng",
  },
  announcement: {
    badge: "Mới",
    lead: "AI agent của bạn giờ có thể quay thay bạn.",
    rest: "Kết nối một lần, yêu cầu một video và nhận lại liên kết.",
    cta: "Kết nối",
  },
  hero: {
    title: "Phần mềm quay màn hình\ncho bạn và AI agent của bạn",
    subtitle:
      "Tự quay demo, video hướng dẫn, video giải thích từng bước và bài thuyết trình, hoặc để AI quay thay bạn. Chia sẻ mỗi video bằng một liên kết mà ai cũng xem được.",
    ctaLabel: "Dùng thử CaptureFlow miễn phí",
    installChrome: "Cài tiện ích Chrome",
    installMac: "Tải cho macOS",
    installSoon: "Sắp có",
    connectMcp: "Kết nối MCP",
    macSoon: "Ứng dụng macOS sắp ra mắt",
    installOr: "hoặc",
    mcpCopy: "Sao chép",
    mcpCopied: "Đã sao chép",
    mcpAddToCursor: "Thêm vào Cursor",
    badge: "Mã nguồn mở, chạy miễn phí trên {github}",
    noCreditCard: "Không cần thẻ tín dụng",
    teaser: {
      title: "Tự host được",
      body: "Chạy trên tài khoản Cloudflare của riêng bạn.",
      cta: "Dùng thử CaptureFlow",
    },
    demo: {
      prevAria: "Demo trước",
      nextAria: "Demo tiếp theo",
      dotAria: "Hiện demo {n} trên {total}",
    },
  },
  highlights: {
    heading: "Tất cả tính năng",
    subtitle: "Quay, chỉnh sửa và chia sẻ. Tất cả ở cùng một nơi.",
    items: {
      recording: { title: "Màn hình và camera", body: "Quay cả hai cùng lúc" },
      transcripts: {
        title: "Bản chép lời",
        body: "Bằng 99 ngôn ngữ",
        tag: "AI",
      },
      editing: {
        title: "Sửa bằng bản chép lời",
        body: "Xóa chữ để cắt video",
        tag: "AI",
      },
      camera: {
        title: "Hiệu ứng camera",
        body: "Phông nền và bộ lọc",
      },
      canvas: { title: "Canvas vô hạn", body: "Vẽ phác trong lúc quay" },
      screenshots: {
        title: "Ảnh chụp màn hình có chú thích",
        body: "Mũi tên, chữ và làm mờ",
      },
      feedback: {
        title: "Bình luận và cảm xúc",
        body: "Góp ý ngay trên video",
      },
      summary: {
        title: "Tóm tắt và chương",
        body: "Kèm tiêu đề cho mỗi video",
        tag: "AI",
      },
      filler: {
        title: "Tự động xóa từ đệm",
        body: "Cắt bỏ các tiếng ừm, ờ",
        tag: "AI",
      },
    },
    cta: "Xem tất cả tính năng",
    previews: {
      app: "Kế hoạch ra mắt",
      columns: ["Cần làm", "Đang làm", "Xong"],
      lines: [
        "Đây là quy trình mới.",
        "Đầu tiên, chọn không gian làm việc.",
        "Sau đó chia sẻ liên kết.",
      ],
      retake: "Ừm, để tôi nói lại.",
      filler: [
        "[Ừm,] đây là quy trình mới.",
        "Đầu tiên, [ờ,] chọn không gian làm việc.",
        "Sau đó, [ừm,] chia sẻ liên kết.",
      ],
      step: "Bước 1",
      note: "Dời cái này",
      comment: "Quy trình này hay quá",
      summaryTitle: "Cách mời nhóm của bạn",
      summaryBody: "Chọn không gian làm việc rồi chia sẻ liên kết.",
      chapters: ["Giới thiệu", "Chọn không gian làm việc"],
    },
  },
  mcpFeatures: {
    heading: "Tính năng MCP",
    subtitle:
      "Những việc AI agent của bạn làm được sau khi kết nối. Agent quay ngay trên máy tính của bạn, với Claude Code, Codex, Cursor hoặc bất kỳ MCP client nào.",
    cta: "Đọc hướng dẫn",
    items: {
      webApp: { title: "Quay ứng dụng web", body: "Kể cả localhost" },
      screen: { title: "Quay màn hình", body: "Toàn bộ một màn hình" },
      window: {
        title: "Quay một cửa sổ",
        body: "Terminal, VS Code hoặc Figma",
      },
      slides: { title: "Thêm slide", body: "Tiêu đề, các bước và lời kết" },
      voiceover: {
        title: "Thêm lời thuyết minh",
        body: "Chạy trên máy tính của bạn",
      },
      report: { title: "Viết báo cáo", body: "Đã làm gì và lỗi ở đâu" },
      search: { title: "Tìm bản ghi", body: "Video và bản chép lời" },
      save: { title: "Lưu tệp MP4", body: "Không cần tải lên hay đăng nhập" },
    },
  },
  useCases: {
    heading: "Các nhóm dùng như thế nào",
    subtitle:
      "Ví dụ về những gì các nhóm thường quay. Mỗi video là một liên kết phát được trên mọi trình duyệt.",
    cta: "Xem cách hoạt động",
    cards: {
      engineering: {
        title: "Kỹ thuật",
        body: "Quay video giải thích một PR hoặc các bước tái hiện lỗi.",
      },
      design: {
        title: "Thiết kế",
        body: "Quay video giới thiệu một bản mockup và thu thập bình luận.",
      },
      support: {
        title: "Hỗ trợ khách hàng",
        body: "Trả lời một ticket bằng video hướng dẫn ngắn.",
      },
      updates: {
        title: "Cập nhật nhóm",
        body: "Quay bản cập nhật hằng tuần và chia sẻ liên kết.",
      },
    },
    engineeringFile: "checkout.ts",
    engineeringPr: "PR #482",
    designApp: "trip-app",
    designBadge: "Thanh toán v3",
    designCardTitle: "Lên kế hoạch chuyến đi",
    designColors: "Màu sắc",
    designComment: "CTA to hơn?",
    supportQuestion: "Làm sao để mời nhóm của tôi vào không gian làm việc?",
    supportReply: "Đây là video hướng dẫn nhanh:",
    supportLink: "captureflow.dev/r/8kx2pnq4",
    updatesTitle: "Cập nhật tuần",
    updatesRange: "6–10 tháng Mười",
    updatesSignups: "Lượt đăng ký",
    updatesShipped: "Đã ra mắt",
    updatesFeatures: "tính năng",
  },
  agents: {
    heading: "Hoặc nhờ AI agent quay demo và video hướng dẫn cho bạn",
    worksWith: "Dùng được với {claude}, {openai} và {cursor}.",
    cta: "Đọc hướng dẫn",
    subtitle:
      "Chỉ cần yêu cầu bằng lời thường. Agent quay trình duyệt, màn hình hoặc một ứng dụng trên máy tính của bạn, thêm slide và lời thuyết minh nếu bạn muốn, rồi đưa cho bạn một liên kết.",
    steps: [
      {
        title: "Kết nối agent của bạn",
        body: "Thêm CaptureFlow vào Claude Code, Codex hoặc Cursor bằng một dòng lệnh. Bạn cần Node.js 20 trở lên, và agent của bạn chỉ đăng nhập một lần. Trong Claude hoặc ChatGPT, hãy thêm bằng URL.",
      },
      {
        title: "Yêu cầu một video",
        body: "Demo tính năng, video hướng dẫn, báo cáo lỗi hoặc bài trình chiếu có thuyết minh.",
      },
      {
        title: "Agent quay thay bạn",
        body: "Trên máy tính của bạn, kể cả ứng dụng chạy trên localhost.",
      },
      {
        title: "Thêm slide và giọng đọc",
        body: "Slide tiêu đề và lời thuyết minh, nếu bạn muốn.",
      },
      {
        title: "Đưa bạn liên kết để chia sẻ",
        body: "Đính kèm vào pull request, đăng lên Slack hoặc gửi cho khách hàng.",
      },
    ],
    scenes: {
      ask: {
        name: "terminal",
        badge: "agent",
        prompt: "Quay demo thanh toán",
        steps: ["Đang mở ứng dụng", "Đang thao tác", "Liên kết đã sẵn sàng"],
      },
      record: {
        url: "localhost:3000",
        badge: "demo",
        title: "Thanh toán",
        fields: ["Tên của bạn", "Số thẻ"],
        pay: "Thanh toán ngay",
        paid: "Đã thanh toán",
      },
      voice: {
        title: "Demo thanh toán",
        subtitle: "Cách thanh toán trong ba bước",
      },
      share: {
        title: "Demo thanh toán",
        link: "captureflow.dev/r/checkout",
        places: ["PR", "Slack", "Email"],
      },
    },
    chats: {
      claude:
        "Trong Claude, mở Customize, rồi Connectors, và chọn Add custom connector. Đặt tên là CaptureFlow, dán URL này rồi đăng nhập.",
      chatgpt:
        "Trong ChatGPT trên web, mở Plugins, nhấn +, và chọn Add custom MCP server. Đặt tên là CaptureFlow, dán URL này, chọn OAuth, rồi cài plugin và đăng nhập. Cần gói Business, Enterprise hoặc Edu.",
      limits:
        "Các cuộc trò chuyện dựng video thuyết trình và hướng dẫn từ slide trên máy chủ của chúng tôi, không ghi màn hình máy tính của bạn, và dùng số phút agent đám mây trong gói của bạn.",
    },
  },
  modes: {
    cta: "Bắt đầu quay",
    heading: "Quay màn hình bằng tiện ích Chrome",
    subtitle:
      "Cài tiện ích rồi nhấn quay. Khi quay xong, bạn nhận được một liên kết mà ai cũng xem được, kèm tiêu đề, tóm tắt, chương và bản chép lời.",
    scene: {
      timer: "0:42",
      heading: "Quy trình hoàn tiền",
      steps: ["Yêu cầu", "Duyệt", "Chi trả"],
      captions: [
        "Hướng dẫn nhanh về quy trình hoàn tiền.",
        "Đầu tiên, khách hàng gửi yêu cầu.",
        "Bộ phận hỗ trợ duyệt ngay trong ngày.",
        "Sau đó tiền được chuyển tự động.",
      ],
    },
  },
  pageHeroes: {
    home: "Trang chủ",
    features: {
      label: "Tính năng",
      word: "TÍNHNĂNG",
      title: "Quay, chỉnh sửa và chia sẻ màn hình của bạn",
      subtitle:
        "Quay màn hình và camera. Chia sẻ mỗi bản ghi bằng một liên kết để nhóm của bạn bình luận.",
    },
    pricing: {
      label: "Bảng giá",
      word: "GIÁ",
      title: "Bắt đầu miễn phí. Trả một mức giá cho mỗi thành viên.",
      subtitle:
        "Gói Miễn phí gồm 25 bản ghi đầu tiên của bạn. Light và Pro bỏ giới hạn này. Bạn cũng có thể tự host CaptureFlow miễn phí.",
    },
    faq: {
      label: "Hỏi đáp",
      word: "FAQ",
      title: "Câu hỏi thường gặp",
      subtitle:
        "Giải đáp về quay màn hình, giá, lưu trữ và tự host. Những nội dung khác có trong tài liệu.",
    },
    chromeExtension: {
      label: "Tiện ích Chrome",
      word: "CHROME",
      title: "Quay màn hình ngay trong Chrome",
      subtitle:
        "Quay màn hình, một thẻ hoặc camera. Khi xong, bạn nhận được một liên kết ai cũng xem được, kèm bản chép lời, tóm tắt và chương.",
    },
  },
  collaboration: {
    heading: "Những việc bạn làm được sau khi quay",
    cta: "Dùng thử miễn phí",
    subtitle:
      "Chỉnh sửa, rồi chia sẻ hoặc nhúng video. Mời nhóm của bạn xem, thả cảm xúc và bình luận video của nhau.",
    categories: {
      share: {
        feature: {
          tag: "mới",
          title: "Chỉnh sửa video",
          cta: "Cài tiện ích",
          body: "Xóa từ trong bản chép lời để cắt chúng khỏi video, hoặc cắt các đoạn trên dòng thời gian. Đổi phông nền, di chuyển, đổi kích thước hoặc ẩn camera, và tắt tiếng micro hoặc âm thanh hệ thống.",
        },
        scene: {
          app: "Kế hoạch ra mắt",
          nav: ["Tổng quan", "Lộ trình", "Công việc", "Tài liệu"],
          columns: [
            {
              name: "Cần làm",
              tasks: ["Nội dung trang giá", "Email chào mừng"],
            },
            {
              name: "Đang làm",
              tasks: ["Thiết kế lại thanh toán", "Mời thành viên"],
            },
            { name: "Xong", tasks: ["Form đăng ký beta"] },
          ],
          background: "Phông nền",
          camera: "Camera",
          shapes: ["Tròn", "Vuông"],
          fillers: "Từ đệm",
          remove: "Xóa",
          transcript: {
            before: "Nhấn vào đây để",
            fillers: ["ờ,", "khoan,", "xin lỗi,"],
            after: "chia sẻ liên kết.",
          },
          saved: "Đã lưu · cùng liên kết",
        },
      },
      embed: {
        feature: {
          title: "Chia sẻ hoặc nhúng video",
          cta: "Cài tiện ích",
          body: "Dán liên kết vào Slack, GitHub, Notion hoặc email và nó sẽ hiện bản xem trước. Bạn cũng có thể nhúng trình phát vào tài liệu hoặc trang web của mình. Khi đã cài tiện ích, video phát ngay trong issue và pull request trên GitHub.",
        },
        scene: {
          question:
            "Bạn chỉ giúp tôi cách mời nhóm vào không gian làm việc được không?",
          reply: "Được chứ! Đây là video ngắn hướng dẫn các bước:",
          url: "captureflow.dev/r/8kx2pnq4",
          app: "Cài đặt",
          nav: ["Chung", "Thành viên", "Thanh toán"],
          members: "Thành viên",
          invite: "Mời",
          people: [
            { initials: "AR", name: "Alex Rivera", role: "Chủ sở hữu" },
            { initials: "CK", name: "Chris Kim", role: "Thành viên" },
            { initials: "JB", name: "Jordan Bell", role: "Thành viên" },
          ],
          duration: "0:48",
        },
      },
      feedback: {
        feature: {
          title: "Cộng tác trên video của bạn",
          cta: "Đăng nhập",
          body: "Làm việc cùng nhau mà không cần họp, dù khác múi giờ. Nhóm của bạn có thể thả emoji, bình luận tại bất kỳ thời điểm nào trong video và theo dõi bằng bản chép lời và phụ đề.",
        },
        scene: {
          title: "Giới thiệu kế hoạch ra mắt",
          author: "Alex",
          age: "vừa xong",
          duration: "1:12",
          activity: "Hoạt động",
          events: [
            { initials: "CK", name: "Chris", at: "0:09", emoji: "👍" },
            { initials: "JB", name: "Jordan", at: "0:17", emoji: "🔥" },
            {
              initials: "MC",
              name: "Maya",
              at: "0:27",
              text: "Thích chế độ bảng mới quá",
            },
            { initials: "SL", name: "Sam", at: "0:37", emoji: "❤️" },
            {
              initials: "JB",
              name: "Jordan",
              at: "0:48",
              text: "Thứ Sáu này ra mắt được không?",
            },
            {
              initials: "AR",
              name: "Alex",
              at: "0:56",
              text: "Được, ngay sau khi QA xong ✅",
            },
            { initials: "MC", name: "Maya", at: "1:05", emoji: "👏" },
          ],
        },
      },
      workspaces: {
        feature: {
          title: "Mời nhóm của bạn vào không gian làm việc",
          cta: "Tạo không gian làm việc",
          body: "Bản ghi của mọi người được lưu trong một không gian làm việc. Mỗi video có thể công khai, chỉ không gian làm việc xem được, hoặc riêng tư.",
        },
        scene: {
          team: "Nhóm CaptureFlow",
          members: ["1 thành viên", "2 thành viên", "3 thành viên"],
          memberInitials: ["AR", "CK", "JB"],
          invitePlaceholder: "Mời qua email",
          inviteEmail: "chris@acme.co, jordan@acme.co",
          invite: "Mời",
          invited: "Đã gửi",
          joined: "Chris và Jordan đã tham gia 🎉",
          whoCanWatch: "Ai xem được:",
          visibility: [
            { label: "Công khai", detail: "Bất kỳ ai có liên kết" },
            { label: "Không gian làm việc", detail: "Chỉ nhóm của bạn" },
            { label: "Riêng tư", detail: "Chỉ mình bạn" },
          ],
        },
      },
    },
  },
  setupService: {
    title: "Chúng tôi sẽ thiết lập",
    titleHighlight: "cho bạn",
    subtitle:
      "Hãy cho chúng tôi biết về công ty bạn. Chúng tôi thiết lập ứng dụng, tiện ích Chrome, ứng dụng macOS và toàn bộ hạ tầng phía sau, sẵn sàng để nhóm của bạn sử dụng.",
    includedHeading: "Mọi thứ chúng tôi thiết lập",
    included: {
      infra: {
        title: "Ứng dụng, trên hạ tầng của bạn",
        body: "Được triển khai lên tài khoản Cloudflare của riêng bạn và chạy trên tên miền của bạn. Tất cả thuộc về bạn.",
      },
      storage: {
        title: "Lưu trữ và cơ sở dữ liệu",
        body: "Bản ghi nằm trong bucket R2 của riêng bạn; không gian làm việc và bình luận nằm trong cơ sở dữ liệu của riêng bạn.",
      },
      signin: {
        title: "Đăng nhập chỉ dành cho công ty",
        body: "Đăng nhập bằng Google Workspace hoặc GitHub, giới hạn theo tên miền email của công ty bạn.",
      },
      apps: {
        title: "Tiện ích Chrome và ứng dụng Mac",
        body: "Cả hai được build riêng cho bản triển khai của bạn, trong đó tiện ích được phát hành riêng cho nhóm của bạn.",
      },
      ready: {
        title: "Sẵn sàng để quay",
        body: "Không gian làm việc đã được tạo và nhóm của bạn đã được mời, nên mọi người có thể bắt đầu chia sẻ ngay.",
      },
      handover: {
        title: "Bàn giao",
        body: "Chúng tôi hướng dẫn người phụ trách bảo trì cách vận hành và cập nhật hệ thống.",
      },
    },
    nextHeading: "Liên hệ với chúng tôi",
    nextSubheading:
      "Hãy cho chúng tôi biết bạn cần gì và chúng tôi sẽ phản hồi.",
    form: {
      company: "Công ty",
      companyPlaceholder: "Công ty Acme",
      name: "Tên của bạn",
      namePlaceholder: "Nguyễn Văn A",
      email: "Email công việc",
      emailPlaceholder: "jane@acme.com",
      topic: "Chúng tôi có thể giúp gì?",
      topics: ["Thiết lập tự host", "Hơn 1 TB", "Việc khác"],
      teamSize: "Quy mô nhóm",
      teamSizes: ["1–10", "11–50", "51–200", "200+"],
      cloudflare: "Bạn đã có tài khoản Cloudflare chưa?",
      cloudflareOptions: ["Có", "Chưa", "Không chắc"],
      notes: "Còn điều gì chúng tôi nên biết không?",
      notesPlaceholder: "Quy mô nhóm, tên miền, thời gian dự kiến…",
      submit: "Gửi tin nhắn",
      error:
        "Không gửi được yêu cầu của bạn. Vui lòng thử lại hoặc gửi email cho chúng tôi theo địa chỉ {email}.",
      sentTitle: "Đã gửi tin nhắn",
      sentBody: "Cảm ơn bạn. Chúng tôi sẽ phản hồi qua {email}.",
      back: "Về trang chủ",
    },
  },
  swarmDemo: {
    title: "Xem các agent dựng lại",
    titleHighlight: "bất kỳ website nào",
    subtitle:
      "Nhập địa chỉ website. Một bầy con trỏ agent vẽ lại nó từng phần tử một trên nền nhạc, và bạn nhận được liên kết video để chia sẻ.",
    url: "Địa chỉ website",
    urlPlaceholder: "https://example.com",
    generate: "Tạo demo",
    generating: "Đang khởi động trình duyệt đám mây…",
    check: "Kiểm tra trang web",
    checking: "Đang kiểm tra trang web…",
    previewNote:
      "Đây là trang mà các agent sẽ dựng lại. Tạo demo khi thấy đúng.",
    change: "Đổi địa chỉ",
    note: "Đăng nhập để tạo miễn phí. Mỗi demo được lưu vào thư viện của bạn.",
    noteSignedIn: "Tạo miễn phí. Mỗi demo được lưu vào thư viện của bạn.",
    howHeading: "Cách hoạt động",
    how: {
      type: {
        title: "Nhập địa chỉ",
        body: "Bất kỳ website công khai nào. Trang được tải trong trình duyệt đám mây và mọi tiêu đề, hình ảnh, nút bấm và thẻ đều được tìm ra.",
      },
      build: {
        title: "Các agent dựng lại",
        body: "Yêu cầu được gõ vào ô chat, rồi một bầy con trỏ đặt từng phần tử vào chỗ trong khi nhạc tăng dần tốc độ.",
      },
      share: {
        title: "Nhận liên kết",
        body: "Video mở trong thư viện của bạn ngay khi hoàn tất. Chia sẻ liên kết, tải tệp về hoặc đăng lên.",
      },
    },
    errors: {
      invalidUrl: "Nhập địa chỉ website như example.com.",
      unreachable:
        "Không thể truy cập trang web đó. Kiểm tra lại địa chỉ rồi thử lại.",
      unavailable: "Máy chủ này không hỗ trợ demo.",
      running:
        "Một bản ghi của bạn vẫn đang chạy. Hãy đợi nó hoàn tất rồi thử lại.",
      limit:
        "Không gian làm việc này đã dùng hết số phút agent đám mây của tháng. Số phút sẽ được đặt lại vào ngày 1.",
      recordings:
        "Bạn đã dùng hết số bản ghi của gói miễn phí. Hãy xóa một bản ghi hoặc nâng cấp, rồi thử lại.",
      busy: "Tất cả trình duyệt đám mây đang bận. Hãy thử lại sau vài phút.",
      failed: "Không thể bắt đầu demo. Vui lòng thử lại.",
    },
  },
  enterprise: {
    title: "CaptureFlow cho",
    titleHighlight: "công ty bạn",
    subtitle:
      "Gói được quản lý cho những công ty muốn có suất dùng cho mọi người theo điều khoản thỏa thuận một lần, với một hóa đơn duy nhất.",
    includedHeading: "Gói Doanh nghiệp có thêm gì",
    included: {
      storage: {
        title: "Dung lượng theo nhu cầu của bạn",
        body: "Một kho dung lượng chung tính theo lượng video công ty bạn quay, không phải hạn mức theo từng suất dùng.",
      },
      seats: {
        title: "Suất dùng cho mọi người",
        body: "Một thỏa thuận áp dụng cho cả công ty, bất kể bao nhiêu người quay.",
      },
      roadmap: {
        title: "Yêu cầu của bạn được ưu tiên",
        body: "Tính năng nhóm của bạn yêu cầu sẽ được đưa lên đầu danh sách của chúng tôi.",
      },
      managed: {
        title: "Quản lý toàn bộ",
        body: "Chúng tôi host và phát hành bản cập nhật, nên bạn không phải vận hành gì cả.",
      },
      billing: {
        title: "Thanh toán theo năm",
        body: "Trả mỗi năm một lần, theo mức giá thỏa thuận riêng cho công ty bạn.",
      },
      support: {
        title: "Liên hệ trực tiếp với chúng tôi",
        body: "Câu hỏi được gửi thẳng đến những người xây dựng CaptureFlow.",
      },
    },
    everythingHeading: "Mọi thứ nhóm của bạn nhận được",
    comingSoon: "Sắp ra mắt",
    everything: {
      extension: {
        title: "Tiện ích Chrome",
        body: "Quay bất kỳ tab hay màn hình nào, liên kết sẵn sàng ngay khi bạn dừng.",
      },
      mac: {
        title: "Ứng dụng Mac",
        body: "Trình quay gốc cho macOS, với cùng liên kết chia sẻ tức thì.",
      },
      workspaces: {
        title: "Không gian làm việc nhóm",
        body: "Bản ghi của mọi người ở cùng một nơi, chia sẻ hoặc giữ riêng tư.",
      },
      feedback: {
        title: "Bình luận và cảm xúc",
        body: "Người xem trả lời ngay trên dòng thời gian, đúng tại thời điểm họ muốn nói tới.",
      },
      edit: {
        title: "Chỉnh sửa sau khi chia sẻ",
        body: "Đổi phông nền, camera hoặc âm thanh, và liên kết vẫn giữ nguyên.",
      },
      screenshots: {
        title: "Ảnh chụp màn hình có chú thích",
        body: "Đánh dấu ảnh chụp màn hình bằng mũi tên, chữ và làm mờ, rồi chia sẻ bằng liên kết.",
      },
    },
    formHeading: "Liên hệ với chúng tôi",
    formSubheading:
      "Hãy cho chúng tôi biết về nhóm của bạn và chúng tôi sẽ trả lời qua email.",
    form: {
      company: "Công ty",
      companyPlaceholder: "Công ty Acme",
      name: "Tên của bạn",
      namePlaceholder: "Nguyễn Văn A",
      email: "Email công việc",
      emailPlaceholder: "jane@acme.com",
      need: "Bạn cần gì?",
      needs: [
        "Suất dùng cho nhóm lớn",
        "Điều khoản riêng hoặc một hóa đơn duy nhất",
        "Việc khác",
      ],
      teamSize: "Quy mô nhóm",
      teamSizes: ["1–10", "11–50", "51–200", "200+"],
      storage: "Cần bao nhiêu dung lượng?",
      storageOptions: ["1–5 TB", "5–20 TB", "20 TB+", "Không chắc"],
      notes: "Còn điều gì chúng tôi nên biết không?",
      notesPlaceholder:
        "Lượng video nhóm bạn quay, thời gian dự kiến, yêu cầu thanh toán…",
      submit: "Gửi tin nhắn",
      error:
        "Không gửi được tin nhắn của bạn. Vui lòng thử lại hoặc gửi email cho chúng tôi theo địa chỉ {email}.",
      sentTitle: "Đã gửi tin nhắn",
      sentBody: "Cảm ơn bạn. Chúng tôi sẽ phản hồi qua {email}.",
      back: "Về trang chủ",
    },
  },
  pricing: {
    heading: "Bảng giá",
    cta: "So sánh tất cả các gói",
    subheading:
      "Gói Miễn phí gồm những bản ghi đầu tiên của bạn. Các gói trả phí có một mức giá cho mỗi thành viên.",
    controls: {
      shownIn: "Giá hiển thị bằng {currency}. Bạn được tính phí bằng đô la Mỹ.",
      teamSize: "Quy mô nhóm",
      members: "thành viên",
      title: "Thanh toán",
      note: "Một mức giá cho mỗi thành viên.",
      billing: "Tính phí",
      monthly: "Theo tháng",
      annually: "Theo năm",
      save: "Tiết kiệm {percent}%",
    },
    compare: {
      loomRow: "Loom {plan}",
      loomDetail: "{seats} người × {perSeat} mỗi người",
      caption: "Giá theo tháng.",
      captureflowRow: "CaptureFlow {ourPlan}",
      captureflowDetail: "{seats} thành viên × {ourPerSeat} mỗi người",
      saveLabel: "Nhóm của bạn tiết kiệm",
      saveValue: "{savings} mỗi năm",
    },
    plans: {
      chargedInUsd: "Thanh toán bằng đô la Mỹ.",
      member: "thành viên",
      members: "thành viên",
      included: "Bao gồm",
      notIncluded: "Không bao gồm",
      free: {
        name: "Miễn phí",
        description: "Bản ghi màn hình bạn chia sẻ bằng liên kết.",
        cta: "Đăng ký",
      },
      light: {
        name: LIGHT,
        featuresHeading: "Mọi thứ trong gói Miễn phí, cùng với",
        features: [
          "Không giới hạn số bản ghi",
          "Không giới hạn thời lượng quay",
          `${LIGHT_AGENT_MIN} phút mỗi tháng cho agent quay trên đám mây, mỗi bản tối đa 10 phút`,
        ],
        description: "Không giới hạn bản ghi ở chất lượng tiết kiệm dữ liệu.",
        period: "/tháng",
        noteMonthly: "Mỗi thành viên, thanh toán theo tháng",
        noteAnnual:
          "Mỗi thành viên, thanh toán theo năm. {yearly} một năm cho {seats} {members}",
        cta: "Dùng thử miễn phí",
      },
      pro: {
        badge: "Đề xuất",
        name: PRO,
        featuresHeading: `Mọi thứ trong gói ${LIGHT}, cùng với`,
        features: [
          "Chất lượng đầy đủ, tối đa 1080p",
          "Chương, tiêu đề và xóa từ đệm bằng AI",
          "Thương hiệu riêng",
          `${PRO_AGENT_MIN} phút mỗi tháng cho agent quay trên đám mây, kèm ${PRO_VOICEOVER_MIN} phút thuyết minh AI`,
          "Thống kê người xem (sắp ra mắt)",
          "Tích hợp Slack, Notion và Zapier (sắp ra mắt)",
        ],
        description:
          "Chất lượng đầy đủ, AI dọn gọn video và thương hiệu của riêng bạn.",
        period: "/tháng",
        noteMonthly: "Mỗi thành viên, thanh toán theo tháng",
        noteAnnual:
          "Mỗi thành viên, thanh toán theo năm. {yearly} một năm cho {seats} {members}",
        cta: "Dùng thử miễn phí",
      },
      rows: {
        recordings: {
          label: "Số bản ghi mỗi người",
          free: "Tối đa {recordings}",
          light: "Không giới hạn",
          pro: "Không giới hạn",
        },
        length: {
          label: "Thời lượng bản ghi",
          free: "{minutes} phút mỗi video",
          light: "Không giới hạn",
          pro: "Không giới hạn",
        },
        quality: {
          label: "Chất lượng video",
          free: "Tiết kiệm dữ liệu",
          light: "Tiết kiệm dữ liệu",
          pro: "Tối đa 1080p",
        },
        transcripts: {
          label: "Bản chép lời và phụ đề",
          free: true,
          light: true,
          pro: true,
        },
        editing: {
          label: "Chỉnh sửa từ bản chép lời",
          free: true,
          light: true,
          pro: true,
        },
        chapters: {
          label: "Chương và tiêu đề bằng AI",
          free: false,
          light: false,
          pro: true,
        },
        filler: {
          label: "Xóa từ đệm",
          free: false,
          light: false,
          pro: true,
        },
        feedback: {
          label: "Bình luận và cảm xúc",
          free: true,
          light: true,
          pro: true,
        },
        agents: {
          label: "Agent quay trên máy",
          free: true,
          light: true,
          pro: true,
        },
        cloudAgents: {
          label: "Agent quay trên đám mây",
          free: `${FREE_AGENT_MIN} phút mỗi tháng`,
          light: `${LIGHT_AGENT_MIN} phút mỗi tháng`,
          pro: `${PRO_AGENT_MIN} phút mỗi tháng`,
        },
        voiceover: {
          label: "Thuyết minh AI trên máy",
          free: true,
          light: true,
          pro: true,
        },
        cloudVoiceover: {
          label: "Thuyết minh AI trên đám mây",
          free: false,
          light: false,
          pro: `${PRO_VOICEOVER_MIN} phút mỗi tháng`,
        },
        branding: {
          label: "Thương hiệu riêng",
          free: false,
          light: false,
          pro: true,
        },
      },
    },
    table: {
      heading: "Mọi tính năng theo từng gói",
      subtitle: "Miễn phí, Light và Pro, đặt cạnh nhau.",
      groups: [
        {
          title: "Quay",
          rows: [
            {
              label: "Thành viên",
              free: "Không giới hạn",
              light: "Không giới hạn",
              pro: "Không giới hạn",
            },
            {
              label: "Số bản ghi mỗi người",
              free: "Tối đa {recordings}",
              light: "Không giới hạn",
              pro: "Không giới hạn",
            },
            {
              label: "Thời lượng bản ghi",
              free: "{minutes} phút mỗi video",
              light: "Không giới hạn",
              pro: "Không giới hạn",
            },
            {
              label: "Chất lượng video",
              free: "Tiết kiệm dữ liệu",
              light: "Tiết kiệm dữ liệu",
              pro: "Tối đa 1080p",
            },
            {
              label: "Ảnh chụp màn hình",
              free: "Không giới hạn",
              light: "Không giới hạn",
              pro: "Không giới hạn",
            },
            {
              label: "Thời gian lưu bản ghi",
              free: "30 ngày không có lượt xem",
              light: "Đến khi bạn xóa",
              pro: "Đến khi bạn xóa",
            },
            {
              label: "Quay toàn màn hình, cửa sổ hoặc tab",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Khung camera và hiệu ứng camera",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Micro và âm thanh hệ thống",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Con trỏ mượt",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Tiện ích Chrome và ứng dụng Mac",
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
              label: "Bản chép lời",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Phụ đề",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Chương tóm tắt",
              free: false,
              light: false,
              pro: true,
            },
            {
              label: "Tiêu đề gợi ý tự động",
              free: false,
              light: false,
              pro: true,
            },
            {
              label: "Chỉnh sửa video từ bản chép lời",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Xóa từ đệm",
              free: false,
              light: false,
              pro: true,
            },
          ],
        },
        {
          title: "Agent",
          rows: [
            {
              label: "Agent quay trên máy tính của bạn",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Bài thuyết trình của agent dựng trên đám mây",
              free: `${FREE_AGENT_MIN} phút mỗi tháng cho mỗi người`,
              light: `${LIGHT_AGENT_MIN} phút mỗi tháng cho mỗi thành viên`,
              pro: `${PRO_AGENT_MIN} phút mỗi tháng cho mỗi thành viên`,
            },
            {
              label: "Slide trong bản ghi của agent",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Thuyết minh AI trên máy tính của bạn",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Thuyết minh AI trong bài thuyết trình đám mây",
              free: false,
              light: false,
              pro: `${PRO_VOICEOVER_MIN} phút mỗi tháng cho mỗi thành viên`,
            },
          ],
        },
        {
          title: "Chỉnh sửa",
          rows: [
            {
              label: "Chỉnh sửa sau khi chia sẻ, giữ nguyên liên kết",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Phông nền",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Di chuyển hoặc đổi kích thước khung camera",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Cắt bớt các phần của video",
              free: true,
              light: true,
              pro: true,
            },
            {
              label:
                "Ảnh chụp màn hình có chú thích bằng mũi tên, chữ và làm mờ",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Canvas vô hạn",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "Chia sẻ và góp ý",
          rows: [
            {
              label: "Liên kết chia sẻ sẵn sàng khi bạn dừng quay",
              free: true,
              light: true,
              pro: true,
            },
            {
              label:
                "Liên kết công khai, trong không gian làm việc hoặc riêng tư",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Yêu cầu quyền truy cập với liên kết bị giới hạn",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Bản xem trước liên kết trong chat và email",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Nhúng trình phát ở bất kỳ đâu",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Phát ngay trong issue và pull request trên GitHub",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Bình luận trên dòng thời gian",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Thả emoji",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Lượt xem",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Tải xuống tệp gốc",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "Không gian làm việc và quản trị",
          rows: [
            {
              label: "Không gian làm việc nhóm",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Vai trò chủ sở hữu, thành viên và người xem",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Chế độ hiển thị mặc định và quyền tải lên",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Tìm kiếm trong bản ghi và ảnh chụp màn hình",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Thương hiệu riêng",
              free: false,
              light: false,
              pro: true,
            },
          ],
        },
        {
          title: "Hosting và hỗ trợ",
          rows: [
            {
              label: "Mã nguồn mở theo giấy phép AGPL",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Tự host trên tài khoản Cloudflare của riêng bạn",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Hosting được quản lý và cập nhật",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
      ],
    },
    includes: {
      heading: "Gói nào cũng có",
      items: [
        "Không gian làm việc riêng, mời bất kỳ ai",
        "Hiệu ứng camera",
        "Bản chép lời và phụ đề AI",
        "Chỉnh sửa video từ bản chép lời",
        "Liên kết chia sẻ công khai, trong không gian làm việc hoặc riêng tư",
        "Bình luận và thả emoji",
        "Ảnh chụp màn hình có chú thích",
        "Canvas vô hạn",
      ],
    },
    annual: {
      badgePro: "Được quản lý",
      badgeCycle: "Theo năm",
      title: "Hosting được quản lý",
      subtitle: "Host toàn bộ, thanh toán theo năm.",
      period: "/tháng",
      note: "Thanh toán {amount}/năm. Hủy bất cứ lúc nào.",
      cta: "Bắt đầu",
    },
  },
  activity: {
    heading: "Thay đổi mới nhất trên GitHub",
    subtitle:
      "Mọi thay đổi đều công khai. Đây là các pull request và issue đang mở mới nhất trên GitHub.",
    cta: "Xem trên GitHub",
    shippedHeading: "Mới được merge",
    openHeading: "Issue và pull request đang mở",
    emptyOpen: "Hiện không có mục nào đang mở.",
    newIssue: "Báo lỗi hoặc đề xuất tính năng",
    viewAll: "Xem tất cả trên GitHub",
  },
  faq: {
    heading: "Câu hỏi thường gặp",
    subtitle:
      "Giải đáp về quay màn hình, giá, lưu trữ và tự host. Những nội dung khác có trong tài liệu.",
    cta: "Đọc tài liệu",
    waitlistLink: "Tham gia danh sách chờ",
    items: [
      {
        question: "Làm thế nào để tạo một bản ghi?",
        answer:
          "Có hai cách, khác nhau ở chỗ ai là người quay.\n\nVới tiện ích Chrome, bạn tự quay. Bạn thao tác trên màn hình và có thể vừa làm vừa nói bằng giọng và camera của chính mình. Hãy dùng cách này cho các cập nhật nhanh, góp ý hoặc bất cứ nội dung nào cần có bạn xuất hiện.\n\nVới AI agent, bạn mô tả video và agent sẽ thao tác rồi quay thay bạn, để bạn tiếp tục làm việc khác. Agent có thể thêm slide và thuyết minh AI. Hãy dùng cách này cho demo sản phẩm, video hướng dẫn và báo cáo lỗi.\n\nĐể tự quay:\n1. Cài tiện ích CaptureFlow từ Chrome Web Store.\n2. Nhấn vào biểu tượng tiện ích trên thanh công cụ của trình duyệt và đăng nhập.\n3. Nhấn vào biểu tượng lần nữa. Chọn This tab, Window hoặc Full screen, và bật camera cùng micro nếu bạn muốn.\n4. Nhấn Start Recording. Một thanh trên trang cho phép bạn tạm dừng hoặc dừng.\n5. Nhấn dừng. Trang của bản ghi sẽ mở ra, kèm một liên kết bạn có thể chia sẻ với bất kỳ ai.\n\nĐể nhờ agent quay:\n1. Kết nối CaptureFlow với ứng dụng AI bạn dùng. Phần Agent trên trang chủ có các bước cho Claude, ChatGPT, Claude Code, Codex và Cursor.\n2. Đăng nhập khi một tab trình duyệt mở ra. Bạn chỉ cần làm việc này một lần.\n3. Yêu cầu video bằng lời thường, ví dụ: Quay demo cách đăng ký trên trang web của chúng tôi, có thuyết minh.\n4. Agent quay video và đưa cho bạn một liên kết có thể chia sẻ với bất kỳ ai.",
      },
      {
        question: "Tôi có thể tự host CaptureFlow không?",
        answer:
          "Có. CaptureFlow là mã nguồn mở theo giấy phép AGPL, và toàn bộ backend chạy trên Cloudflare: Workers cho ứng dụng và API, R2 cho bản ghi, và D1 cho mọi thứ còn lại. Tạo một cơ sở dữ liệu D1 và một bucket R2, chạy các migration, đặt một secret rồi triển khai. Ngoài ra còn có nút Deploy to Cloudflare. Hướng dẫn có tại docs.captureflow.dev.",
      },
      {
        question: "AI agent của tôi có thể quay video thay tôi không?",
        answer:
          "Có. Thêm CaptureFlow vào Claude Code, Codex hoặc Cursor bằng một dòng lệnh, hoặc thêm trong Claude hay ChatGPT, rồi yêu cầu video bằng lời thường. Agent quay trình duyệt, màn hình hoặc một ứng dụng trên máy tính của bạn, thêm slide và lời thuyết minh nếu bạn muốn, rồi đưa cho bạn một liên kết để chia sẻ.\n\nBản ghi do agent quay trên máy có trong mọi gói. Bản ghi do agent quay trên đám mây có hạn mức hằng tháng tùy theo gói của bạn.",
      },
      {
        question: "Giá các gói trả phí được tính thế nào?",
        answer: `${LIGHT} và ${PRO} có một mức giá cho mỗi thành viên mỗi tháng, thấp hơn khi thanh toán theo năm. Thành viên là người có quay, nên bạn chỉ trả tiền cho những người tạo bản ghi.\n\nKhi có người tham gia hoặc rời đi, số suất dùng sẽ được cập nhật ở hóa đơn kế tiếp.`,
      },
      {
        question: "Bản ghi của tôi được lưu trong bao lâu?",
        answer:
          "Với các gói trả phí, đến khi bạn xóa. Với gói miễn phí, bản ghi bị xóa sau 30 ngày không có lượt xem, để các tài khoản không hoạt động không chiếm dung lượng. Nếu bạn tự host, bạn tự đặt quy tắc.",
      },
      {
        question: "Gói miễn phí gồm những gì?",
        answer: `Bạn có 25 bản ghi cho mỗi người, mỗi bản tối đa 5 phút, ở chất lượng tiết kiệm dữ liệu, kèm bản chép lời và phụ đề. Bản ghi bị xóa sau 30 ngày không có lượt xem. Đăng ký, cài tiện ích Chrome và bắt đầu quay.\n\n${LIGHT} bỏ các giới hạn với một mức giá cho mỗi thành viên và giữ bản ghi đến khi bạn xóa.`,
      },
    ],
  },
  cta: {
    headline: "Bắt đầu quay",
    subtitle:
      "Tải miễn phí. Không cần thẻ tín dụng. Hãy nói bằng một tin nhắn video ngắn thay vì thêm một cuộc họp nữa.",
    button: "Dùng thử CaptureFlow miễn phí",
  },
  footer: {
    tagline: "Phần mềm quay màn hình mã nguồn mở với liên kết chia sẻ tức thì.",
    lights: "Đèn",
    lightsOn: "Bật · kéo dây",
    lightsOff: "Tắt · kéo dây",
    product: {
      title: "Sản phẩm",
      features: "Tính năng",
      pricing: "Bảng giá",
      compare: "So sánh",
      download: "Tải xuống",
      suggest: "Đề xuất tính năng",
    },
    resources: {
      title: "Tài nguyên",
      docs: "Tài liệu",
      selfHosting: "Tự host",
      blog: "Blog",
      releases: "Bản phát hành",
      faq: "Hỏi đáp",
      security: "Bảo mật",
    },
    community: {
      title: "Cộng đồng",
    },
    legal: {
      title: "Pháp lý",
      privacy: "Chính sách quyền riêng tư",
      terms: "Điều khoản dịch vụ",
      refund: "Chính sách hoàn tiền",
      license: "Giấy phép (AGPL-3.0)",
    },
    rights: "© {year} CaptureFlow. Bảo lưu mọi quyền.",
    openSource: "Mã nguồn mở theo giấy phép AGPL-3.0",
  },
  pageShell: {
    logoAlt: "CaptureFlow",
    backToHome: "Về trang chủ",
  },
  waitlist: {
    errors: {
      joinFailed: "Không thể tham gia danh sách chờ. Vui lòng thử lại.",
      network: "Lỗi mạng. Vui lòng thử lại.",
    },
    success:
      "Bạn đã có tên trong danh sách. Tôi sẽ gửi email cho bạn khi CaptureFlow sẵn sàng.",
    emailPlaceholder: "you@example.com",
    buttonLoading: "Đang tham gia…",
    buttonDefault: "Tham gia danh sách chờ",
    earlyAccessPrompt: "Muốn dùng sớm?",
    earlyAccessLink: "Trở thành người dùng thử beta",
  },
  download: {
    heading: "Tải CaptureFlow",
    subtitle:
      "Đã có cho Chrome, ứng dụng macOS sắp ra mắt. Mỗi bản ghi có một liên kết để bạn chia sẻ.",
    button: "Tải cho macOS",
    requires: "Yêu cầu {version} trở lên trên Apple Silicon.",
    requirements: "Yêu cầu macOS 14 trở lên trên Apple Silicon.",
    versionLabel: "Phiên bản {version}",
    sizeLabel: "DMG {size} MB",
    notarized: "Được Apple ký và chứng thực",
  },
  downloadPage: {
    otherWays: "Các cách khác để cài đặt",
    buildTitle: "Build từ mã nguồn",
    buildBody: "Clone repo và chạy trình quay trên máy bằng pnpm.",
    releasesTitle: "Tất cả bản phát hành",
    releasesBody:
      "Xem mọi bản build đã phát hành và nhật ký thay đổi trên GitHub.",
    cloud: "Thích dùng đám mây hơn? {link} và xem bản ghi trong trình duyệt.",
    cloudLink: "Tạo tài khoản",
  },
  blog: {
    title: "Blog",
    subtitle: "Mẹo, hướng dẫn và cập nhật về quay màn hình.",
    readArticle: "Đọc bài viết",
    empty: "Chưa có bài viết nào. Hãy quay lại sau.",
  },
};

export default messages;

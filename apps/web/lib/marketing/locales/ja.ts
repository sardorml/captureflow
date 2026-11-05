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
      title: "CaptureFlow - 共有リンク付きの画面録画ツール",
      description:
        "画面を録画して、リンクをチームやお客様に共有できます。AI文字起こしと注釈付きスクリーンショットを備えたオープンソースの画面録画ツールで、Cloudflareにセルフホストすることもできます。",
    },
    features: {
      title: "画面録画ツールの機能",
      description:
        "タブ、ウィンドウ、画面全体をカメラとマイク付きで録画し、注釈付きスクリーンショットを撮って、それぞれをチームがコメントできるリンクとして共有できます。",
    },
    pricing: {
      title: "料金: 無料で始められ、メンバーごとの定額制",
      description: `まず無料で${FREE_RECORDINGS}本まで録画できます。${LIGHT}と${PRO}はメンバーごとの定額制で、録画とAIが無制限です。CaptureFlowを無料でセルフホストすることもできます。`,
    },
    faq: {
      title: "FAQ: 共有、ストレージ、セルフホスト",
      description:
        "CaptureFlowに関するよくある質問: 共有リンクの仕組み、Cloudflareでのセルフホストに必要なこと、ストレージの上限、録画が非公開に保たれる仕組み。",
    },
    download: {
      title: "Chrome向け画面録画ツールをダウンロード",
      description:
        "CaptureFlowのChrome拡張機能をインストールすると、画面を録画してリンクで共有できます。",
    },
    enterprise: {
      title: "エンタープライズ",
      description:
        "大規模な企業向けのマネージド版CaptureFlow: 全員分のシート、個別の契約条件、請求書はひとつにまとめます。必要な内容をお知らせください。",
    },
    selfHostSetup: {
      title: "セルフホストの導入設定",
      description:
        "貴社のCloudflareアカウント上にCaptureFlowを導入します: 貴社のドメイン、社内限定のサインイン、チーム向けの非公開Chrome拡張機能。",
    },
  },
  nav: {
    features: "機能",
    discover: "探す",
    pricing: "料金",
    faq: "FAQ",
    changelog: "変更履歴",
    login: "ログイン",
    download: "ダウンロード",
    language: "言語",
    openMenu: "メニューを開く",
    menu: "メニュー",
    main: "メイン",
    docs: "ドキュメント",
    resources: "リソース",
    faqDescription: "よくある質問と回答",
    blog: "ブログ",
    blogDescription: "ガイドと更新情報",
    selfHosting: "セルフホスト",
    selfHostingDescription: "自分のCloudflareで動かす",
    community: "コミュニティ",
    communityDescription: "Discordで質問や交流",
    star: "GitHubでスターを付ける",
    starCount: "GitHubでスターを付ける ({stars})",
    themeToLight: "ライトテーマに切り替え",
    themeToDark: "ダークテーマに切り替え",
  },
  banner: {
    label: "ベータ",
    aria: "CaptureFlowはパブリックベータ版です",
    title: "早くからのご利用ありがとうございます 🎉",
    strip:
      "CaptureFlowはまだベータ版のため頻繁に変わり、安定するまでは不具合に出くわすことがあります。",
    body: "CaptureFlowはパブリックベータ版です。ほぼ毎週新しい機能が加わり、要望の多いものから先に作られます。",
    cta: "次に作ってほしいものを伝える",
    close: "閉じる",
  },
  announcement: {
    badge: "新機能",
    lead: "AIエージェントが代わりに録画できるようになりました。",
    rest: "一度接続して動画を頼めば、リンクが返ってきます。",
    cta: "接続する",
  },
  hero: {
    title: "あなたとAIエージェントの\nための画面録画ツール",
    subtitle:
      "デモ、使い方、操作手順、プレゼンを自分で録画するか、AIに録画を任せられます。それぞれを誰でも見られるリンクとして共有できます。",
    ctaLabel: "CaptureFlowを無料で試す",
    installChrome: "Chrome拡張機能をインストール",
    installMac: "macOS版をダウンロード",
    installSoon: "近日公開",
    connectMcp: "MCPに接続",
    macSoon: "macOSアプリは近日公開",
    installOr: "または",
    mcpCopy: "コピー",
    mcpCopied: "コピーしました",
    mcpAddToCursor: "Cursorに追加",
    badge: "オープンソース、{github}で無料で動かせます",
    noCreditCard: "クレジットカード不要",
    teaser: {
      title: "セルフホスト可能",
      body: "自分のCloudflareアカウントで動かせます。",
      cta: "CaptureFlowを試す",
    },
    demo: {
      prevAria: "前のデモ",
      nextAria: "次のデモ",
      dotAria: "{total}件中{n}件目のデモを表示",
    },
  },
  highlights: {
    heading: "すべての機能",
    subtitle: "録画、編集、共有。すべてが一か所にまとまっています。",
    items: {
      recording: { title: "画面とカメラ", body: "両方を同時に録画" },
      transcripts: { title: "文字起こし", body: "99言語に対応", tag: "AI" },
      editing: {
        title: "文字起こしで編集",
        body: "テキストを削除して動画をカット",
        tag: "AI",
      },
      camera: {
        title: "カメラエフェクト",
        body: "背景とフィルター",
      },
      canvas: { title: "無限キャンバス", body: "録画しながらスケッチ" },
      screenshots: {
        title: "注釈付きスクリーンショット",
        body: "矢印、テキスト、ぼかし",
      },
      feedback: {
        title: "コメントとリアクション",
        body: "動画へのフィードバック",
      },
      summary: {
        title: "要約とチャプター",
        body: "動画ごとにタイトル付き",
        tag: "AI",
      },
      filler: {
        title: "フィラー語の自動削除",
        body: "「えー」や「あの」をカット",
        tag: "AI",
      },
    },
    cta: "すべての機能を見る",
    previews: {
      app: "ローンチ計画",
      columns: ["未着手", "進行中", "完了"],
      lines: [
        "こちらが新しいフローです。",
        "まず、ワークスペースを選びます。",
        "次に、リンクを共有します。",
      ],
      retake: "えーと、最初からやり直します。",
      filler: [
        "[えー、]こちらが新しいフローです。",
        "まず、[あの、]ワークスペースを選びます。",
        "次に、[えーと、]リンクを共有します。",
      ],
      step: "ステップ 1",
      note: "これを移動",
      comment: "このフロー、いいですね",
      summaryTitle: "チームを招待する方法",
      summaryBody: "ワークスペースを選び、リンクを共有します。",
      chapters: ["はじめに", "ワークスペースを選ぶ"],
    },
  },
  mcpFeatures: {
    heading: "MCPの機能",
    subtitle:
      "接続後にAIエージェントができること。Claude Code、Codex、Cursor、その他のMCPクライアントから、あなた自身のコンピューター上で録画します。",
    cta: "ガイドを読む",
    items: {
      webApp: { title: "Webアプリを録画", body: "localhostも対象" },
      screen: { title: "画面を録画", body: "ディスプレイ全体" },
      window: {
        title: "ウィンドウを録画",
        body: "ターミナル、VS Code、Figma",
      },
      slides: { title: "スライドを追加", body: "タイトル、手順、締めの一言" },
      voiceover: {
        title: "ナレーションを追加",
        body: "あなたのコンピューターで動作",
      },
      report: { title: "レポートを作成", body: "何をして何が失敗したか" },
      search: { title: "録画を検索", body: "動画と文字起こし" },
      save: {
        title: "MP4ファイルを保存",
        body: "アップロードもサインインも不要",
      },
    },
  },
  useCases: {
    heading: "チームでの使い方",
    subtitle:
      "チームが録画する内容の例です。各動画はどのブラウザーでも再生できるリンクになります。",
    cta: "仕組みを見る",
    cards: {
      engineering: {
        title: "エンジニアリング",
        body: "PRの説明やバグの再現手順を録画します。",
      },
      design: {
        title: "デザイン",
        body: "モックアップの説明を録画してコメントを集めます。",
      },
      support: {
        title: "カスタマーサポート",
        body: "短い操作手順の動画でチケットに回答します。",
      },
      updates: {
        title: "チームの近況報告",
        body: "週次の報告を録画してリンクを共有します。",
      },
    },
    engineeringFile: "checkout.ts",
    engineeringPr: "PR #482",
    designApp: "trip-app",
    designBadge: "チェックアウト v3",
    designCardTitle: "旅行を計画",
    designColors: "カラー",
    designComment: "CTAをもっと大きく?",
    supportQuestion: "チームをワークスペースに招待するには?",
    supportReply: "こちらが手順の動画です:",
    supportLink: "captureflow.dev/r/8kx2pnq4",
    updatesTitle: "週次レポート",
    updatesRange: "6–10日",
    updatesSignups: "登録数",
    updatesShipped: "リリース",
    updatesFeatures: "件の機能",
  },
  agents: {
    heading: "または、AIエージェントにデモや使い方動画の録画を頼めます",
    worksWith: "{claude}、{openai}、{cursor}に対応しています。",
    cta: "ガイドを読む",
    subtitle:
      "普段の言葉で頼むだけです。あなたのコンピューター上でブラウザー、画面、アプリを録画し、必要ならスライドとナレーションを加えて、リンクを渡します。",
    steps: [
      {
        title: "エージェントを接続",
        body: "Claude Code、Codex、CursorにCaptureFlowを一行で追加します。Node.js 20以降が必要で、エージェントは一度だけサインインします。ClaudeやChatGPTではURLで追加します。",
      },
      {
        title: "動画を頼む",
        body: "機能デモ、使い方、バグ報告、ナレーション付きのスライド。",
      },
      {
        title: "代わりに録画します",
        body: "あなたのコンピューター上で、localhostのアプリも録画できます。",
      },
      {
        title: "スライドと音声を追加",
        body: "必要なら、タイトルスライドとナレーションを加えます。",
      },
      {
        title: "共有リンクを受け取る",
        body: "プルリクエストに添付、Slackに投稿、お客様に送信できます。",
      },
    ],
    scenes: {
      ask: {
        name: "ターミナル",
        badge: "エージェント",
        prompt: "チェックアウトのデモを録画して",
        steps: [
          "アプリを開いています",
          "操作しています",
          "リンクの準備ができました",
        ],
      },
      record: {
        url: "localhost:3000",
        badge: "デモ",
        title: "チェックアウト",
        fields: ["お名前", "カード番号"],
        pay: "今すぐ支払う",
        paid: "支払い完了",
      },
      voice: {
        title: "チェックアウトのデモ",
        subtitle: "三つのステップで支払う方法",
      },
      share: {
        title: "チェックアウトのデモ",
        link: "captureflow.dev/r/checkout",
        places: ["PR", "Slack", "メール"],
      },
    },
    chats: {
      claude:
        "Claudeで「カスタマイズ」から「コネクタ」を開き、「カスタムコネクタを追加」を選びます。名前をCaptureFlowにしてこのURLを貼り付け、サインインします。",
      chatgpt:
        "Web版ChatGPTで「プラグイン」を開き、「+」を押して「カスタムMCPサーバーを追加」を選びます。名前をCaptureFlowにしてこのURLを貼り付け、OAuthを選び、プラグインをインストールしてサインインします。Business、Enterprise、Eduのいずれかのプランが必要です。",
      limits:
        "チャットからの録画は、あなたのコンピューターではなくクラウドブラウザーでWebサイトを録画し、プランのクラウドエージェント分数を消費します。",
    },
  },
  modes: {
    cta: "録画を始める",
    heading: "Chrome拡張機能で画面を録画",
    subtitle:
      "インストールして録画ボタンを押すだけです。終了すると、タイトル、要約、チャプター、文字起こし付きで、誰でも見られるリンクが手に入ります。",
    scene: {
      timer: "0:42",
      heading: "返金の流れ",
      steps: ["申請", "承認", "支払い"],
      captions: [
        "返金の流れを簡単に説明します。",
        "まず、お客様が申請を送ります。",
        "サポートが当日中に承認します。",
        "その後、自動的に返金が行われます。",
      ],
    },
  },
  pageHeroes: {
    home: "ホーム",
    features: {
      label: "機能",
      word: "機能",
      title: "画面を録画、編集、共有",
      subtitle:
        "画面とカメラを録画し、各録画をチームがコメントできるリンクとして共有できます。",
    },
    pricing: {
      label: "料金",
      word: "料金",
      title: "無料で始めて、メンバーごとの定額で。",
      subtitle:
        "無料プランは最初の25本まで録画できます。LightとProではこの上限がなくなります。CaptureFlowを無料でセルフホストすることもできます。",
    },
    faq: {
      label: "FAQ",
      word: "FAQ",
      title: "よくある質問",
      subtitle:
        "録画、料金、ストレージ、セルフホストについての回答です。それ以外はドキュメントをご覧ください。",
    },
  },
  collaboration: {
    heading: "録画した後にできること",
    cta: "無料で試す",
    subtitle:
      "編集してから共有または埋め込みます。チームを招待して、お互いの動画を見たり、リアクションやコメントを付けたりできます。",
    categories: {
      share: {
        feature: {
          tag: "新機能",
          title: "動画を編集",
          cta: "拡張機能をインストール",
          body: "文字起こしから語句を削除して動画からカットするか、タイムラインでクリップをトリミングします。背景の変更、カメラの移動・サイズ変更・非表示、マイクやシステム音のミュートもできます。",
        },
        scene: {
          app: "ローンチ計画",
          nav: ["概要", "ロードマップ", "タスク", "ドキュメント"],
          columns: [
            {
              name: "未着手",
              tasks: ["料金ページの文言", "オンボーディングメール"],
            },
            {
              name: "進行中",
              tasks: ["チェックアウトの再設計", "チーム招待"],
            },
            { name: "完了", tasks: ["ベータ登録フォーム"] },
          ],
          background: "背景",
          camera: "カメラ",
          shapes: ["円", "四角"],
          fillers: "フィラー語",
          remove: "削除",
          transcript: {
            before: "ここをクリックして",
            fillers: ["えー、", "ちょっと、", "すみません、"],
            after: "リンクを共有します。",
          },
          saved: "保存済み · 同じリンク",
        },
      },
      embed: {
        feature: {
          title: "動画を共有または埋め込み",
          cta: "拡張機能をインストール",
          body: "Slack、GitHub、Notion、メールにリンクを貼り付けるとプレビューが表示されます。プレーヤーをドキュメントやサイトに埋め込むこともできます。拡張機能をインストールしていれば、GitHubのIssueやプルリクエスト内で再生されます。",
        },
        scene: {
          question: "チームをワークスペースに招待する方法を教えてもらえますか?",
          reply: "もちろんです。手順を短い動画にまとめました:",
          url: "captureflow.dev/r/8kx2pnq4",
          app: "設定",
          nav: ["一般", "メンバー", "請求"],
          members: "メンバー",
          invite: "招待",
          people: [
            { initials: "AR", name: "Alex Rivera", role: "オーナー" },
            { initials: "CK", name: "Chris Kim", role: "メンバー" },
            { initials: "JB", name: "Jordan Bell", role: "メンバー" },
          ],
          duration: "0:48",
        },
      },
      feedback: {
        feature: {
          title: "動画で共同作業",
          cta: "サインイン",
          body: "会議なしで、タイムゾーンをまたいで一緒に進められます。チームは絵文字でリアクションし、動画の任意の時点にコメントし、文字起こしと字幕で内容を追えます。",
        },
        scene: {
          title: "ローンチ計画の説明",
          author: "Alex",
          age: "たった今",
          duration: "1:12",
          activity: "アクティビティ",
          events: [
            { initials: "CK", name: "Chris", at: "0:09", emoji: "👍" },
            { initials: "JB", name: "Jordan", at: "0:17", emoji: "🔥" },
            {
              initials: "MC",
              name: "Maya",
              at: "0:27",
              text: "新しいボード表示、いいですね",
            },
            { initials: "SL", name: "Sam", at: "0:37", emoji: "❤️" },
            {
              initials: "JB",
              name: "Jordan",
              at: "0:48",
              text: "金曜日にリリースできますか?",
            },
            {
              initials: "AR",
              name: "Alex",
              at: "0:56",
              text: "はい、QAの直後に ✅",
            },
            { initials: "MC", name: "Maya", at: "1:05", emoji: "👏" },
          ],
        },
      },
      workspaces: {
        feature: {
          title: "チームをワークスペースに招待",
          cta: "ワークスペースを作成",
          body: "全員の録画がひとつのワークスペースにまとまります。各動画は公開、ワークスペース内のみ、非公開のいずれかに設定できます。",
        },
        scene: {
          team: "CaptureFlowチーム",
          members: ["メンバー1人", "メンバー2人", "メンバー3人"],
          memberInitials: ["AR", "CK", "JB"],
          invitePlaceholder: "メールアドレスで招待",
          inviteEmail: "chris@acme.co, jordan@acme.co",
          invite: "招待",
          invited: "送信済み",
          joined: "ChrisとJordanが参加しました 🎉",
          whoCanWatch: "視聴できる人:",
          visibility: [
            { label: "公開", detail: "リンクを知っている全員" },
            { label: "ワークスペース", detail: "チームのみ" },
            { label: "非公開", detail: "自分のみ" },
          ],
        },
      },
    },
  },
  setupService: {
    title: "セットアップは",
    titleHighlight: "私たちにお任せ",
    subtitle:
      "会社についてお知らせください。アプリ、Chrome拡張機能、macOSアプリ、そしてその裏側のインフラをすべてセットアップし、チームがすぐ使える状態にします。",
    includedHeading: "セットアップする内容",
    included: {
      infra: {
        title: "貴社のインフラ上にアプリを",
        body: "貴社のCloudflareアカウントにデプロイし、貴社のドメインから配信します。すべてが貴社の所有です。",
      },
      storage: {
        title: "ストレージとデータベース",
        body: "録画は貴社のR2バケットに、ワークスペースとコメントは貴社のデータベースに保存します。",
      },
      signin: {
        title: "社内限定のサインイン",
        body: "Google WorkspaceまたはGitHubでのサインインを、貴社のメールドメインに限定します。",
      },
      apps: {
        title: "Chrome拡張機能とMacアプリ",
        body: "どちらも貴社のインスタンス向けにビルドし、拡張機能はチーム向けに非公開で公開します。",
      },
      ready: {
        title: "すぐに録画できる状態に",
        body: "ワークスペースを作成しチームを招待しておくので、すぐに共有を始められます。",
      },
      handover: {
        title: "引き継ぎ",
        body: "運用と更新の方法を、保守を担当する方に説明します。",
      },
    },
    nextHeading: "お問い合わせ",
    nextSubheading: "必要な内容をお知らせください。折り返しご連絡します。",
    form: {
      company: "会社名",
      companyPlaceholder: "Acme Inc.",
      name: "お名前",
      namePlaceholder: "山田 花子",
      email: "勤務先メールアドレス",
      emailPlaceholder: "jane@acme.com",
      topic: "ご希望の内容は?",
      topics: ["セルフホストの導入設定", "1 TB以上", "その他"],
      teamSize: "チームの人数",
      teamSizes: ["1–10", "11–50", "51–200", "200+"],
      cloudflare: "Cloudflareアカウントをお持ちですか?",
      cloudflareOptions: ["はい", "いいえ", "わからない"],
      notes: "その他に伝えておきたいことは?",
      notesPlaceholder: "チームの人数、ドメイン、スケジュールなど…",
      submit: "メッセージを送信",
      error:
        "リクエストを送信できませんでした。もう一度お試しいただくか、{email}までメールでご連絡ください。",
      sentTitle: "メッセージを送信しました",
      sentBody: "ありがとうございます。{email}宛てにご連絡します。",
      back: "ホームに戻る",
    },
  },
  enterprise: {
    title: "貴社のための",
    titleHighlight: "CaptureFlow",
    subtitle:
      "全員分のシートを一度合意した条件で使い、請求書をひとつにまとめたい企業向けのマネージドプランです。",
    includedHeading: "エンタープライズで加わるもの",
    included: {
      storage: {
        title: "貴社に合わせたストレージ",
        body: "シート単位の割り当てではなく、貴社の録画量に合わせた容量をご用意します。",
      },
      seats: {
        title: "全員分のシート",
        body: "録画する人数にかかわらず、ひとつの契約で会社全体をカバーします。",
      },
      roadmap: {
        title: "貴社の要望を優先",
        body: "チームからの機能要望を、私たちのリストの最優先に置きます。",
      },
      managed: {
        title: "フルマネージド",
        body: "ホスティングと更新を私たちが行うので、運用の手間はありません。",
      },
      billing: {
        title: "年間請求",
        body: "貴社向けに合意した価格で、年に一度のお支払いです。",
      },
      support: {
        title: "開発チームへの直通窓口",
        body: "質問はCaptureFlowを作っている人に直接届きます。",
      },
    },
    everythingHeading: "チームが使えるすべての機能",
    comingSoon: "近日公開",
    everything: {
      extension: {
        title: "Chrome拡張機能",
        body: "任意のタブや画面を録画し、停止するとリンクが用意されます。",
      },
      mac: {
        title: "Macアプリ",
        body: "macOS向けのネイティブ録画ツールで、同じく即時の共有リンクが使えます。",
      },
      workspaces: {
        title: "チームワークスペース",
        body: "全員の録画を一か所に。共有も非公開も選べます。",
      },
      feedback: {
        title: "コメントとリアクション",
        body: "視聴者はタイムライン上の、まさにその時点に返信できます。",
      },
      edit: {
        title: "共有後も編集",
        body: "背景、カメラ、音声を変更しても、リンクはそのままです。",
      },
      screenshots: {
        title: "注釈付きスクリーンショット",
        body: "スクリーンショットに矢印、テキスト、ぼかしを加えて、リンクとして共有します。",
      },
    },
    formHeading: "お問い合わせ",
    formSubheading: "チームについてお知らせください。メールでご返信します。",
    form: {
      company: "会社名",
      companyPlaceholder: "Acme Inc.",
      name: "お名前",
      namePlaceholder: "山田 花子",
      email: "勤務先メールアドレス",
      emailPlaceholder: "jane@acme.com",
      need: "必要なものは?",
      needs: [
        "大規模チーム向けのシート",
        "個別の契約条件または請求書の一本化",
        "その他",
      ],
      teamSize: "チームの人数",
      teamSizes: ["1–10", "11–50", "51–200", "200+"],
      storage: "必要なストレージ容量は?",
      storageOptions: ["1–5 TB", "5–20 TB", "20 TB+", "わからない"],
      notes: "その他に伝えておきたいことは?",
      notesPlaceholder: "チームの録画量、スケジュール、請求に関するご要望など…",
      submit: "メッセージを送信",
      error:
        "メッセージを送信できませんでした。もう一度お試しいただくか、{email}までメールでご連絡ください。",
      sentTitle: "メッセージを送信しました",
      sentBody: "ありがとうございます。{email}宛てにご連絡します。",
      back: "ホームに戻る",
    },
  },
  pricing: {
    heading: "料金",
    cta: "すべてのプランを比較",
    subheading:
      "無料プランは最初の録画をカバーします。有料プランはメンバーごとの定額制です。",
    controls: {
      teamSize: "チームの人数",
      members: "人",
      title: "請求",
      note: "メンバーごとの定額です。",
      billing: "請求サイクル",
      monthly: "月払い",
      annually: "年払い",
      save: "{percent}%お得",
    },
    compare: {
      loomRow: "Loom {plan}",
      loomDetail: "{seats}人 × 各{perSeat}",
      caption: "月額料金。",
      captureflowRow: "CaptureFlow {ourPlan}",
      captureflowDetail: "メンバー{seats}人 × 各{ourPerSeat}",
      saveLabel: "チームの節約額",
      saveValue: "年間{savings}",
    },
    plans: {
      member: "メンバー",
      members: "メンバー",
      included: "含まれる",
      notIncluded: "含まれない",
      free: {
        name: "無料",
        description: "リンクで共有する画面録画。",
        cta: "登録する",
      },
      light: {
        name: LIGHT,
        featuresHeading: "無料プランのすべてに加えて",
        features: [
          "録画数無制限",
          "録画時間無制限",
          `クラウドエージェント録画が月${LIGHT_AGENT_MIN}分、各回最大10分`,
        ],
        description: "データセーバー画質で録画数無制限。",
        period: "/月",
        noteMonthly: "メンバーごと、月払い",
        noteAnnual: "メンバーごと、年払い。{members}{seats}人で年間${yearly}",
        cta: "無料で試す",
      },
      pro: {
        badge: "おすすめ",
        name: PRO,
        featuresHeading: `${LIGHT}のすべてに加えて`,
        features: [
          "フル画質、最大1080p",
          "AIによるチャプター、タイトル、フィラー語の削除",
          "カスタムブランディング",
          `クラウドエージェント録画が月${PRO_AGENT_MIN}分、AIナレーション${PRO_VOICEOVER_MIN}分付き`,
          "視聴者インサイト (近日公開)",
          "Slack、Notion、Zapierとの連携 (近日公開)",
        ],
        description: "フル画質、AIによるクリーンアップ、独自のブランディング。",
        period: "/月",
        noteMonthly: "メンバーごと、月払い",
        noteAnnual: "メンバーごと、年払い。{members}{seats}人で年間${yearly}",
        cta: "無料で試す",
      },
      rows: {
        recordings: {
          label: "一人あたりの録画数",
          free: "最大{recordings}本",
          light: "無制限",
          pro: "無制限",
        },
        length: {
          label: "録画時間",
          free: "動画ごとに{minutes}分",
          light: "無制限",
          pro: "無制限",
        },
        quality: {
          label: "動画の画質",
          free: "データセーバー",
          light: "データセーバー",
          pro: "最大1080p",
        },
        transcripts: {
          label: "文字起こしと字幕",
          free: true,
          light: true,
          pro: true,
        },
        editing: {
          label: "文字起こしから編集",
          free: true,
          light: true,
          pro: true,
        },
        chapters: {
          label: "AIチャプターとタイトル",
          free: false,
          light: false,
          pro: true,
        },
        filler: {
          label: "フィラー語の削除",
          free: false,
          light: false,
          pro: true,
        },
        feedback: {
          label: "コメントとリアクション",
          free: true,
          light: true,
          pro: true,
        },
        agents: {
          label: "ローカルエージェント録画",
          free: true,
          light: true,
          pro: true,
        },
        cloudAgents: {
          label: "クラウドエージェント録画",
          free: `月${FREE_AGENT_MIN}分`,
          light: `月${LIGHT_AGENT_MIN}分`,
          pro: `月${PRO_AGENT_MIN}分`,
        },
        voiceover: {
          label: "ローカルAIナレーション",
          free: true,
          light: true,
          pro: true,
        },
        cloudVoiceover: {
          label: "クラウドAIナレーション",
          free: false,
          light: false,
          pro: `月${PRO_VOICEOVER_MIN}分`,
        },
        branding: {
          label: "カスタムブランディング",
          free: false,
          light: false,
          pro: true,
        },
      },
    },
    table: {
      heading: "全機能をプランごとに",
      subtitle: "無料、Light、Proを並べて比較。",
      groups: [
        {
          title: "録画",
          rows: [
            {
              label: "メンバー",
              free: "無制限",
              light: "無制限",
              pro: "無制限",
            },
            {
              label: "一人あたりの録画数",
              free: "最大{recordings}本",
              light: "無制限",
              pro: "無制限",
            },
            {
              label: "録画時間",
              free: "動画ごとに{minutes}分",
              light: "無制限",
              pro: "無制限",
            },
            {
              label: "動画の画質",
              free: "データセーバー",
              light: "データセーバー",
              pro: "最大1080p",
            },
            {
              label: "スクリーンショット",
              free: "無制限",
              light: "無制限",
              pro: "無制限",
            },
            {
              label: "録画の保存期間",
              free: "30日間視聴がなければ削除",
              light: "削除するまで",
              pro: "削除するまで",
            },
            {
              label: "画面全体、ウィンドウ、タブの録画",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "カメラバブルとカメラエフェクト",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "マイクとシステム音声",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "スムーズなカーソル",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "Chrome拡張機能とMacアプリ",
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
              label: "文字起こし",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "字幕",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "要約チャプター",
              free: false,
              light: false,
              pro: true,
            },
            {
              label: "タイトルの自動提案",
              free: false,
              light: false,
              pro: true,
            },
            {
              label: "文字起こしから動画を編集",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "フィラー語の削除",
              free: false,
              light: false,
              pro: true,
            },
          ],
        },
        {
          title: "エージェント",
          rows: [
            {
              label: "あなたのコンピューターでのエージェント録画",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "クラウドブラウザーでのエージェント録画",
              free: `一人あたり月${FREE_AGENT_MIN}分`,
              light: `メンバーごとに月${LIGHT_AGENT_MIN}分`,
              pro: `メンバーごとに月${PRO_AGENT_MIN}分`,
            },
            {
              label: "エージェント録画のスライド",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "あなたのコンピューターでのAIナレーション",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "クラウドブラウザーでのAIナレーション",
              free: false,
              light: false,
              pro: `メンバーごとに月${PRO_VOICEOVER_MIN}分`,
            },
          ],
        },
        {
          title: "編集",
          rows: [
            {
              label: "共有後も同じリンクで編集",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "背景",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "カメラバブルの移動とサイズ変更",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "動画の一部をカット",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "矢印、テキスト、ぼかし付きの注釈スクリーンショット",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "無限キャンバス",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "共有とフィードバック",
          rows: [
            {
              label: "停止と同時に共有リンクを用意",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "公開、ワークスペース、非公開のリンク",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "制限付きリンクへのアクセス申請",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "チャットやメールでのリンクプレビュー",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "プレーヤーをどこにでも埋め込み",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "GitHubのIssueやプルリクエスト内で再生",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "タイムライン上のコメント",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "絵文字リアクション",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "視聴回数",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "元のファイルをダウンロード",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
        {
          title: "ワークスペースと管理",
          rows: [
            {
              label: "チームワークスペース",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "オーナー、メンバー、閲覧者のロール",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "デフォルトの公開範囲とアップロード権限",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "録画とスクリーンショットを横断検索",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "カスタムブランディング",
              free: false,
              light: false,
              pro: true,
            },
          ],
        },
        {
          title: "ホスティングとサポート",
          rows: [
            {
              label: "AGPLのもとでオープンソース",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "自分のCloudflareアカウントにセルフホスト",
              free: true,
              light: true,
              pro: true,
            },
            {
              label: "マネージドホスティングと更新",
              free: true,
              light: true,
              pro: true,
            },
          ],
        },
      ],
    },
    includes: {
      heading: "すべてのプランに含まれるもの",
      items: [
        "自分のワークスペース、誰でも招待可能",
        "カメラエフェクト",
        "AI文字起こしと字幕",
        "文字起こしから動画を編集",
        "公開、ワークスペース、非公開の共有リンク",
        "コメントと絵文字リアクション",
        "注釈付きスクリーンショット",
        "無限キャンバス",
      ],
    },
    annual: {
      badgePro: "マネージド",
      badgeCycle: "年払い",
      title: "マネージドホスティング",
      subtitle: "フルホスティング、年払い。",
      period: "/月",
      note: "年間{amount}の請求。いつでも解約できます。",
      cta: "始める",
    },
  },
  activity: {
    heading: "GitHubでの最新の変更",
    subtitle:
      "すべての変更は公開されています。GitHubの最新のプルリクエストと未解決のIssueです。",
    cta: "GitHubで見る",
    shippedHeading: "最近マージされたもの",
    openHeading: "未解決のIssueとプルリクエスト",
    emptyOpen: "現在、未解決のものはありません。",
    newIssue: "バグの報告や機能のリクエスト",
    viewAll: "GitHubですべて見る",
  },
  faq: {
    heading: "よくある質問",
    subtitle:
      "録画、料金、ストレージ、セルフホストについての回答です。それ以外はドキュメントをご覧ください。",
    cta: "ドキュメントを読む",
    waitlistLink: "ウェイトリストに登録",
    items: [
      {
        question: "録画はどうやって作りますか?",
        answer:
          "方法は二つあり、違いは誰が録画するかです。\n\nChrome拡張機能では自分で録画します。画面を操作しながら、自分の声とカメラで解説できます。短い報告やフィードバックなど、あなた自身が映る必要があるものに向いています。\n\nAIエージェントでは動画の内容を説明すると、エージェントが代わりに操作して録画するので、その間も作業を続けられます。スライドやAIナレーションも追加できます。製品デモ、使い方、バグ報告に向いています。\n\n自分で録画するには:\n1. Chrome Web StoreからCaptureFlow拡張機能をインストールします。\n2. ブラウザーのツールバーにあるアイコンをクリックしてサインインします。\n3. もう一度アイコンをクリックします。「このタブ」「ウィンドウ」「画面全体」から選び、必要ならカメラとマイクをオンにします。\n4. 「録画を開始」を押します。ページ上のバーから一時停止や停止ができます。\n5. 停止を押します。録画のページが開き、誰にでも共有できるリンクが表示されます。\n\nエージェントに録画させるには:\n1. 使っているAIアプリにCaptureFlowを接続します。ホームページのエージェントのセクションに、Claude、ChatGPT、Claude Code、Codex、Cursorそれぞれの手順があります。\n2. ブラウザーのタブが開いたらサインインします。これは一度だけです。\n3. 普段の言葉で動画を頼みます。例: 当社のWebサイトでの登録方法のデモを、ナレーション付きで録画して。\n4. エージェントが録画し、誰にでも共有できるリンクを渡します。",
      },
      {
        question: "CaptureFlowはセルフホストできますか?",
        answer:
          "はい。CaptureFlowはAGPLのもとでオープンソースで、バックエンド全体がCloudflare上で動きます: アプリとAPIはWorkers、録画はR2、それ以外はD1です。D1データベースとR2バケットを作成し、マイグレーションを適用し、シークレットをひとつ設定してデプロイします。Deploy to Cloudflareボタンもあります。ガイドはdocs.captureflow.devにあります。",
      },
      {
        question: "AIエージェントに動画を録画してもらえますか?",
        answer:
          "はい。Claude Code、Codex、CursorにCaptureFlowを一行で追加するか、ClaudeやChatGPTに追加して、普段の言葉で動画を頼みます。あなたのコンピューター上でブラウザー、画面、アプリを録画し、必要ならスライドとナレーションを加えて、共有用のリンクを渡します。\n\nローカルのエージェント録画はすべてのプランに含まれます。クラウドのエージェント録画には、プランに応じた月ごとの利用枠があります。",
      },
      {
        question: "有料プランの料金はどう決まりますか?",
        answer: `${LIGHT}と${PRO}はメンバーごとに月額定額で、年払いならさらに安くなります。メンバーとは録画する人のことなので、支払うのは録画を作る人の分だけです。\n\nメンバーが加わったり抜けたりすると、次回の請求書からシート数に反映されます。`,
      },
      {
        question: "録画はどのくらい保存されますか?",
        answer:
          "有料プランでは削除するまで保存されます。無料プランでは、30日間視聴がない録画は削除されるため、使われていないアカウントが容量を占有し続けることはありません。セルフホストの場合はルールを自分で決められます。",
      },
      {
        question: "無料プランには何が含まれますか?",
        answer: `一人あたり25本、各最長5分の録画を、データセーバー画質で、文字起こしと字幕付きで作れます。30日間視聴がない録画は削除されます。登録してChrome拡張機能をインストールすれば、すぐに録画を始められます。\n\n${LIGHT}ではメンバーごとの定額でこの上限がなくなり、録画は削除するまで保存されます。`,
      },
    ],
  },
  cta: {
    headline: "録画を始める",
    subtitle:
      "無料ダウンロード。クレジットカード不要。もう一度会議を開く代わりに、短い動画メッセージで伝えましょう。",
    button: "CaptureFlowを無料で試す",
  },
  footer: {
    tagline: "即時の共有リンク付き、オープンソースの画面録画。",
    lights: "照明",
    lightsOn: "オン · ひもを引く",
    lightsOff: "オフ · ひもを引く",
    product: {
      title: "製品",
      features: "機能",
      pricing: "料金",
      compare: "比較",
      download: "ダウンロード",
      suggest: "機能を提案",
    },
    resources: {
      title: "リソース",
      docs: "ドキュメント",
      selfHosting: "セルフホスト",
      blog: "ブログ",
      releases: "リリース",
      faq: "FAQ",
      security: "セキュリティ",
    },
    community: {
      title: "コミュニティ",
    },
    legal: {
      title: "法的情報",
      privacy: "プライバシーポリシー",
      terms: "利用規約",
      refund: "返金ポリシー",
      license: "ライセンス (AGPL-3.0)",
    },
    rights: "© {year} CaptureFlow. 無断転載を禁じます。",
    openSource: "AGPL-3.0のもとでオープンソース",
  },
  pageShell: {
    logoAlt: "CaptureFlow",
    backToHome: "ホームに戻る",
  },
  waitlist: {
    errors: {
      joinFailed:
        "ウェイトリストに登録できませんでした。もう一度お試しください。",
      network: "ネットワークエラーです。もう一度お試しください。",
    },
    success:
      "登録しました。CaptureFlowの準備ができたらメールでお知らせします。",
    emailPlaceholder: "you@example.com",
    buttonLoading: "登録中…",
    buttonDefault: "ウェイトリストに登録",
    earlyAccessPrompt: "早期アクセスをご希望ですか?",
    earlyAccessLink: "ベータテスターになる",
  },
  download: {
    heading: "CaptureFlowをダウンロード",
    subtitle:
      "Chrome向けに提供中で、macOSアプリは近日公開です。各録画に共有できるリンクが付きます。",
    button: "macOS版をダウンロード",
    requires: "{version}以降、Apple Silicon搭載のMacが必要です。",
    requirements: "macOS 14以降、Apple Silicon搭載のMacが必要です。",
    versionLabel: "バージョン {version}",
    sizeLabel: "{size} MB DMG",
    notarized: "Appleによる署名と公証済み",
  },
  downloadPage: {
    otherWays: "その他の入手方法",
    buildTitle: "ソースからビルド",
    buildBody:
      "リポジトリをクローンして、pnpmで録画ツールをローカルで実行します。",
    releasesTitle: "すべてのリリース",
    releasesBody: "公開済みのすべてのビルドと変更履歴をGitHubで見られます。",
    cloud: "クラウドをご希望ですか? {link}して、ブラウザーで録画を見られます。",
    cloudLink: "アカウントを作成",
  },
  blog: {
    title: "ブログ",
    subtitle: "画面録画に関するヒント、ガイド、更新情報。",
    readArticle: "記事を読む",
    empty: "まだ投稿はありません。また後でご確認ください。",
  },
};

export default messages;

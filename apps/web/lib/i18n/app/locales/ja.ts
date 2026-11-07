import type { AppMessages } from "../messages";

const messages: AppMessages = {
  common: {
    cancel: "キャンセル",
    save: "保存",
    saving: "保存中…",
    delete: "削除",
    deleting: "削除中…",
    remove: "削除",
    close: "閉じる",
    back: "戻る",
    continue: "続行",
    confirm: "確認",
    done: "完了",
    edit: "編集",
    copy: "コピー",
    copied: "コピーしました",
    search: "検索",
    loading: "読み込み中…",
    retry: "もう一度試す",
    learnMore: "詳細を見る",
    language: "言語",
    themeToLight: "ライトテーマに切り替え",
    themeToDark: "ダークテーマに切り替え",
    somethingWrong: "問題が発生しました。もう一度お試しください。",
    pageFailed: "このページを読み込めませんでした。",
    partFailed: "この部分を読み込めませんでした。",
    failedBody:
      "問題が発生しました。もう一度試すか、ページを再読み込みしてください。",
    reload: "ページを再読み込み",
  },
  auth: {
    signedInAs: "{email} としてログイン中です。",
    errors: {
      generic: "問題が発生しました。もう一度お試しください。",
      network: "ネットワークエラーです。もう一度お試しください。",
    },
    login: {
      metaTitle: "ログイン",
      signInTitle: "おかえりなさい",
      signInDescription: "Google、GitHub、またはメールアドレスでログイン",
      signUpTitle: "アカウントを作成",
      signUpDescription: "Google、GitHub、またはメールアドレスで登録",
      inviteTitle: "{workspace} に参加",
      inviteDescription:
        "{inviter} から招待されています。承諾するには {email} でログインするか、アカウントを作成してください。",
      continueWith: "{provider} で続行",
      or: "または",
      emailLabel: "メールアドレス",
      emailPlaceholder: "you@example.com",
      emailInvalid: "有効なメールアドレスを入力してください。",
      continueWithEmail: "メールアドレスで続行",
      askForInvite: "アカウントが必要ですか？管理者に招待を依頼してください。",
      haveAccount: "すでにアカウントをお持ちですか？{action}",
      haveAccountAction: "ログイン",
      noAccount: "アカウントをお持ちでないですか？{action}",
      noAccountAction: "登録",
      changeEmail: "変更",
      nameLabel: "名前",
      namePlaceholder: "あなたの名前",
      passwordLabel: "パスワード",
      newPasswordPlaceholder: "12文字以上",
      passwordTooShort: "12文字以上で入力してください。",
      passwordMissing: "パスワードを入力してください。",
      signInSubmit: "ログイン",
      signUpSubmit: "アカウントを作成",
      terms: "続行すると、{terms}と{privacy}に同意したことになります。",
      termsLink: "利用規約",
      privacyLink: "プライバシーポリシー",
    },
    verify: {
      title: "メールを確認してください",
      description:
        "{email} にリンクを送信しました。開いてアカウントの設定を完了してください。",
      resend: "メールを再送信",
      resent: "再送信しました",
      resendFailed: "メールを送信できませんでした。もう一度お試しください。",
      wrongAddress: "アドレスが違いますか？{action}",
      wrongAddressAction: "別のメールアドレスを使う",
    },
    oauthErrors: {
      unfinished: "ログインが完了しませんでした。もう一度お試しください。",
      inviteOnly:
        "この CaptureFlow は招待制です。管理者に招待を依頼してください。",
      allowedDomains:
        "{domains} のアドレスで登録するか、管理者に招待を依頼してください。",
      providerDomains:
        "{domains} の Google または GitHub アカウントで登録してください。",
      domainChoice: "{first} または {second}",
    },
    inviteFallbacks: {
      workspace: "CaptureFlow のワークスペース",
      inviter: "チームメンバー",
    },
    setPassword: {
      title: "パスワードを設定",
      description:
        "{email} のパスワードを選んでください。設定後、自動的にログインします。",
      passwordLabel: "新しいパスワード",
      passwordPlaceholder: "12文字以上",
      submit: "パスワードを保存",
      expiredTitle: "このリンクは使えなくなりました",
      expiredDescription:
        "すでに使用されたか、期限切れです。管理者に新しいリンクを依頼してください。",
      goToSignIn: "ログインページへ",
    },
    invite: {
      title: "招待が届いています",
      asViewer:
        "CaptureFlow の {workspace} に閲覧者として招待されました。共有されたすべての内容を見てコメントできます。",
      asMember:
        "CaptureFlow の {workspace} にメンバーとして招待されました。このワークスペースに録画してチームと共有できます。",
      accept: "招待を承諾",
      databaseUnavailable: "データベースを利用できません",
      invalidTitle: "招待が無効になりました",
      invalidBody:
        "このリンクは期限切れか、すでに使用されています。ワークスペースのオーナーに新しい招待を依頼してください。",
      wrongAccountTitle: "アカウントが違います",
      wrongAccountBody:
        "この招待は {invited} 宛てですが、現在 {current} としてログインしています。承諾するにはログアウトして、招待されたアドレスでログインしてください。",
      goToDashboard: "ダッシュボードへ",
      signOut: "ログアウト",
    },
    handoff: {
      signingIn: "ログインしています…",
      returning: "CaptureFlow に戻っています…",
      open: "CaptureFlow を開く",
      hint: "何も起こらない場合は、上のボタンをクリックしてください。デスクトップアプリが再び開いたら、このタブは閉じて構いません。",
      extensionDone:
        "{email} としてログインしました。このタブは閉じて構いません。",
      extensionUnreachable:
        "CaptureFlow 拡張機能に接続できませんでした。インストールされていることを確認し、拡張機能のアイコンをクリックしてもう一度お試しください。",
      extensionUnverified:
        "拡張機能を確認できませんでした。再インストールしてもう一度お試しください。",
    },
  },
  shell: {
    record: {
      newRecording: "新しい録画",
    },
    nav: {
      toggleSidebar: "サイドバーを切り替え",
      dashboard: "ダッシュボード",
      recordings: "録画",
      screenshots: "スクリーンショット",
      canvas: "キャンバス",
      workspaceGroup: "ワークスペース",
      members: "メンバー",
      settings: "設定",
      personal: "個人",
      workspace: "ワークスペース",
      billing: "請求",
      admin: "管理",
    },
    upgradeCard: {
      title: "ワークスペースをアップグレード",
      description:
        "無料プランは一人あたり {recordings} 件の録画をデータセーバー画質で保存できます。有料プランではこの制限がなくなり、メンバー一人あたり {price} からご利用いただけます。",
      viewPlans: "プランを見る",
    },
    topBar: {
      upgrade: "アップグレード",
    },
    workspaceSwitcher: {
      switchWorkspace: "ワークスペースを切り替え",
      summary: "other:デフォルト · メンバー {n} 人",
      workspaces: "ワークスペース",
      owned: "あなたがオーナーです",
      joined: "参加中",
      newWorkspace: "新しいワークスペース",
      inviteMembers: "メンバーを招待",
    },
    drawer: {
      open: "ワークスペースメニューを開く",
      title: "ワークスペースメニュー",
    },
    search: {
      prompt: "録画とスクリーンショットを検索",
      clear: "検索をクリア",
      results: "検索結果",
      hint: "録画とスクリーンショットをタイトルで検索します。",
      noMatches: "一致する項目がありません",
      kind: {
        recording: "録画",
        screenshot: "スクリーンショット",
      },
    },
    account: {
      menu: "アカウントメニュー",
      nav: {
        billing: "請求",
        devices: "接続済みデバイス",
        settings: "設定",
        support: "サポートに問い合わせ",
      },
      freePlan: "無料",
      signOut: "ログアウト",
      signingOut: "ログアウトしています…",
    },
    theme: {
      label: "テーマ",
      light: "ライト",
      dark: "ダーク",
      system: "システム",
    },
    notifications: {
      title: "通知",
      subtitle: "ワークスペースへの招待と変更。",
      bellUnread: "other:通知、未読 {n} 件",
      viewAll: "すべて表示",
      menuEmpty:
        "新しい通知はありません。招待、新しいチームメンバー、役割の変更がここに表示されます。",
      pageEmpty:
        "新しい通知はありません。誰かがあなたを招待したり、ワークスペースに参加したり、役割を変更したりすると、ここに表示されます。",
      accept: "承諾",
      decline: "辞退",
      unread: "未読",
      someone: "誰か",
      message: {
        invited: {
          member: "{actor} があなたを {workspace} にメンバーとして招待しました",
          viewer: "{actor} があなたを {workspace} に閲覧者として招待しました",
        },
        joined: {
          member: "{actor} が {workspace} にメンバーとして参加しました",
          viewer: "{actor} が {workspace} に閲覧者として参加しました",
        },
        seatRequested: "{actor} が {workspace} の有料シートを申請しました",
        seatDenied: "{actor} が {workspace} でのシート申請を却下しました",
        roleChanged: {
          member: "{actor} が {workspace} であなたをメンバーにしました",
          viewer: "{actor} が {workspace} であなたを閲覧者にしました",
        },
        downgraded: "{actor} が {workspace} であなたを閲覧者に変更しました",
        keepRecordingUntil: "{date} までは引き続き録画できます。",
        removed: "{actor} があなたを {workspace} から削除しました",
      },
      acceptErrors: {
        failed: "招待を承諾できませんでした",
        signedOut: "承諾するにはログインしてください",
        invalid: "この招待は期限切れか、取り消されています",
        emailMismatch: "この招待は別のメールアドレス宛てです",
        alreadyMember: "すでにこのワークスペースに参加しています",
      },
    },
    mobileNav: {
      open: "メニューを開く",
      close: "メニューを閉じる",
      docs: "ドキュメント",
      star: "GitHub でスターを付ける",
      signIn: "ログイン",
      getStarted: "はじめる",
    },
    skeletons: {
      avatar: "アバター",
      workspaceName: "ワークスペース名",
      workspaceLogo: "ワークスペースのロゴ",
    },
  },
  library: {
    dashboard: {
      welcome: "おかえりなさい",
      welcomeName: "おかえりなさい、{name} さん",
      openCanvas: "キャンバスを開く",
      newRecording: "新しい録画",
      stats: {
        recordings: "録画",
        plusScreenshots: "other:ほかにスクリーンショット {count} 件",
        noScreenshots: "スクリーンショットはまだありません",
        views: "視聴回数",
        viewsAverage: "録画一件あたり平均 {count} 回",
        noViews: "視聴はまだありません",
        recorded: "録画時間",
        recordedAverage: "録画一件あたり平均 {duration}",
        nothingRecorded: "まだ何も録画されていません",
        recordingsLeft: "残りの録画数",
        leftOfAllowance: "{allowance} 件中 {left} 件",
        freePlanLimit: "無料プラン、一件あたり最大 {minutes} 分",
      },
      recordedTime: {
        minutes: "{minutes} 分",
        hours: "{hours} 時間",
        hoursMinutes: "{hours} 時間 {minutes} 分",
      },
      recent: {
        title: "最近の録画",
        all: "すべての録画",
        empty: "このワークスペースにはまだ何も共有されていません。",
        views: "other:{n} 回視聴",
        comments: "other:コメント {n} 件",
        reactions: "other:リアクション {n} 件",
      },
      start: {
        title: "{product} で録画を始める",
        surfacesLabel: "録画する場所",
        surfaces: {
          extension: "拡張機能",
          desktop: "デスクトップアプリ",
          canvas: "キャンバス",
        },
        extension: {
          description:
            "ツールバーからタブ、ウィンドウ、または画面全体を録画して、誰にでも共有できるリンクを取得します。",
          record: "今すぐ録画",
          addToChrome: "Chrome に追加",
        },
        desktop: {
          description:
            "画面とカメラをシステム音声付きで録画するネイティブの Mac アプリを準備中です。それまでは、拡張機能でタブ、ウィンドウ、または画面全体を録画できます。",
          download: "Mac 版をダウンロード",
          comingSoon: "近日公開",
        },
        canvas: {
          description:
            "見せるページがないときに、録画しながらペン、図形、テキストで描き込める白紙のボードです。",
        },
      },
    },
    recording: {
      pageTitle: "録画",
      count: "other:録画 {n} 件",
      untitled: "無題の録画",
      aiGenerated: "AI 生成",
      processing: "処理中",
      noMatches: "このフィルターに一致する録画はありません。",
      empty:
        "録画リンクはまだ作成されていません。CaptureFlow デスクトップアプリで録画すると、ここに表示されます。",
      selectAll: "すべての録画を選択",
      selected: "other:録画 {n} 件を選択中",
      open: "録画を開く",
      edit: "録画を編集",
      share: "録画を共有",
      delete: "録画を削除",
      deleteTitle: "この録画を削除しますか？",
      deleteDescription:
        "動画とそのリンクはすぐに使えなくなります。この操作は元に戻せません。",
      deleteSelectedTitle: "other:録画 {n} 件を削除しますか？",
    },
    screenshot: {
      pageTitle: "スクリーンショット",
      count: "other:スクリーンショット {n} 件",
      untitled: "無題のスクリーンショット",
      numbered: "スクリーンショット {id}",
      noMatches: "このフィルターに一致するスクリーンショットはありません。",
      empty:
        "スクリーンショットはまだありません。CaptureFlow を開き → Screenshot タブ → Display、Window、Area のいずれかを選んで撮影します。スクリーンショットは自動的にここに表示されます。",
      selectAll: "すべてのスクリーンショットを選択",
      selected: "other:スクリーンショット {n} 件を選択中",
      open: "スクリーンショットを開く",
      edit: "スクリーンショットを編集",
      share: "スクリーンショットを共有",
      delete: "スクリーンショットを削除",
      deleteTitle: "このスクリーンショットを削除しますか？",
      deleteDescription:
        "画像とそのリンクはすぐに使えなくなります。この操作は元に戻せません。",
      deleteSelectedTitle: "other:スクリーンショット {n} 件を削除しますか？",
    },
    filters: {
      access: "アクセス",
      sort: "並び替え",
      current: "{label}: {value}",
      accessOptions: {
        all: "すべてのアクセス",
        public: "公開",
        workspace: "ワークスペース",
        private: "非公開",
      },
      sortOptions: {
        newest: "新しい順",
        oldest: "古い順",
        views: "視聴回数順",
      },
    },
    card: {
      select: "{title} を選択",
      moreActions: "その他の操作",
      rename: "名前を変更",
      unknownAuthor: "不明",
    },
    selection: {
      deleteDescription: "これらのリンクはすぐに使えなくなります。",
      deleteFailed:
        "{count} 件のうち {failed} 件を削除できませんでした。残りは削除済みです。",
      clear: "クリア",
    },
    pager: {
      label: "ページ",
      previous: "前のページ",
      next: "次のページ",
    },
    visibility: {
      label: "公開範囲",
      labels: {
        public: "公開",
        workspace: "ワークスペース",
        private: "非公開",
      },
      descriptions: {
        public: "リンクを知っている人は誰でも閲覧できます",
        workspace: "ログイン済みのワークスペースメンバーのみ閲覧できます",
        private: "自分だけが閲覧できます",
      },
      workspaceNamed: "ワークスペース · {name}",
    },
    share: {
      title: "共有",
      embed: "埋め込み",
      embedPublic: "スニペットを貼り付けた場所ならどこでも再生できます。",
      embedRestricted: "すでにリンクを開ける人にだけ再生されます。",
      copyCode: "コードをコピー",
      generalAccess: "一般的なアクセス",
      generalAccessCurrent: "一般的なアクセス: {access}",
      copyLink: "リンクをコピー",
      linkCopied: "リンクをコピーしました",
      shareAt: "{time} から共有",
      socialHeading: "共有先",
      socialText: "「{title}」をチェック",
      email: "メール",
    },
    editableTitle: {
      label: "録画のタイトル",
      rename: "録画の名前を変更",
    },
  },
  members: {
    title: "メンバー",
    databaseUnavailable: "データベースを利用できません。",
    role: "役割",
    status: "ステータス",
    roles: {
      owner: "管理者",
      member: "メンバー",
      viewer: "閲覧者",
    },
    roleHints: {
      member: {
        does: "このワークスペースに録画します。",
        costs: "Light と Pro では有料シートです。",
      },
      viewer: {
        does: "視聴とコメントができます。",
        costs: "常に無料です。",
      },
    },
    statuses: {
      active: "有効",
      invited: "招待済み",
    },
    seatSummary: {
      members: "other:メンバー {n} 人",
      viewers: "other:閲覧者 {n} 人",
      paidSeats: "other:有料シート {n} 席",
      membersAndViewers: "{members}と{viewers}",
      onPaidSeats:
        "{people}、{seats}。メンバー一人につき一席で、閲覧者は無料です。",
      membersFree: "{people}。このプランではメンバーは無料です。",
      freePlan:
        "{people}。無料プラン: 各メンバーは最大 {minutes} 分の録画を {recordings} 件まで作成でき、閲覧者は視聴とコメントができます。",
      planTitle: "{plan} プラン",
      paidPlanTitle: "有料プラン",
      freePlanTitle: "無料プラン",
      upgrade: "ワークスペースをアップグレード",
    },
    table: {
      intro: "メンバーはここに録画し、閲覧者は視聴とコメントができます。",
      ownerIntro: "オーナーとして、招待、削除、役割の変更ができます。",
      searchPlaceholder: "名前またはメールアドレス",
      searchLabel: "メンバーを検索",
      allRoles: "すべての役割",
      everyone: "全員",
      columns: {
        name: "名前",
        dateAdded: "追加日",
        email: "メールアドレス",
        actions: "操作",
      },
      empty: "このフィルターに一致する人はいません。",
      downgradeNote: "{date} から閲覧者 · {keep}",
      keepAsMember: "メンバーのままにする",
      revoke: "取り消す",
    },
    seatRequests: {
      title: "シート申請",
      description:
        "これらの閲覧者が録画を希望しています。承認するとメンバーになります。",
      descriptionPaid:
        "これらの閲覧者が録画を希望しています。承認するとメンバーになり、有料シートが一席追加されます。",
      asked: "{email} · {date} に申請",
      deny: "却下",
      approve: "承認",
    },
    seatConfirm: {
      addTitle: "{name} に有料シートを割り当てますか？",
      addBody:
        "メンバーは録画できるため、一人につき有料シート一席です。{plan} プランは {seats} 席から {nextSeats} 席になり、月額 {before} から {after} になります。",
      addBodyYearly:
        "メンバーは録画できるため、一人につき有料シート一席です。{plan} プランは {seats} 席から {nextSeats} 席になり、月額 {before} から {after} になります（年払い）。",
      addInvoice: "今回の請求期間の残り分は、次回の請求書に追加されます。",
      addConfirm: "有料シートを追加",
      removeTitle: "{name} を閲覧者に変更しますか？",
      removeBody:
        "{name} は支払い済みの期間が終わる {date} までは録画できます。その後は閲覧者になり、視聴とコメントはできますが録画はできません。",
      removePlan:
        "それ以降、{plan} プランは {seats} 席から {nextSeats} 席になり、月額 {before} から {after} になります。",
      removePlanYearly:
        "それ以降、{plan} プランは {seats} 席から {nextSeats} 席になり、月額 {before} から {after} になります（年払い）。",
      removeConfirm: "閲覧者に変更",
    },
    remove: {
      label: "{name} をワークスペースから削除",
      title: "{name} を {workspace} から削除しますか？",
      body: "すぐにアクセスできなくなります。その人の録画とスクリーンショットはワークスペースに残ります。",
      freesSeat:
        "その人の有料シートが空きます。プランは {seats} 席から {nextSeats} 席になります。",
    },
    leave: {
      button: "退出",
      title: "{workspace} から退出しますか？",
      body: "このワークスペースの録画とスクリーンショットにアクセスできなくなります。あなたがそこで録画したものはワークスペースに残ります。",
      comeBack: "戻るには、誰かに再度招待してもらう必要があります。",
      confirm: "ワークスペースから退出",
    },
    invite: {
      trigger: "メンバーを招待",
      title: "{workspace} にメンバーを招待",
      titleOwnWorkspace: "ワークスペースにメンバーを招待",
      description:
        "7 日間有効なリンク付きのメールが届きます。同じアドレスでログインするよう伝えてください。",
      removeEmail: "{email} を削除",
      addEmails: "メールアドレスを追加",
      separatorHint:
        "メールアドレスはスペース、カンマ、または Enter で区切ります。",
      paidSeatNote:
        "承諾したメンバー一人につき、{plan} プランに有料シートが一席追加されます（一人あたり月額 {price}）。今回の期間の残り分は次回の請求書に加算されます。",
      noEmails: "メールアドレスを一つ以上追加してください",
      invalidEmails: "無効なメールアドレス: {emails}",
      failed: "失敗",
      sent: "other:招待を {n} 件送信しました。",
      sending: "送信中…",
      submit: "招待を送信",
    },
    actions: {
      emailRequired: "メールアドレスを入力してください",
      emailInvalid: "有効なメールアドレスではないようです",
      ownWorkspace: "すでに自分のワークスペースに参加しています",
      alreadyMember: "その人はすでにこのワークスペースのメンバーです",
      emailNotSent:
        "招待は作成されましたが、メールを送信できませんでした。保留中リストからリンクをコピーしてください。",
      invitationSent: "{email} に招待を送信しました",
      alreadyRecording: "ここではすでに録画できます",
    },
  },
  settings: {
    saved: "保存しました",
    errors: {
      ownerOnly: "ワークスペースのオーナーのみ変更できます",
      databaseUnavailable: "データベースを利用できません",
      saveFailed: "保存できませんでした。もう一度お試しください",
    },
    upload: {
      uploading: "アップロード中…",
      missing: "画像ファイルを選択してください",
      failed: "アップロードに失敗しました",
      failedReason: "アップロードに失敗しました: {reason}",
    },
    personal: {
      title: "個人設定",
      account: {
        title: "アカウント",
        description:
          "チームメンバーや録画を視聴する人に、あなたがどのように表示されるかを設定します。",
      },
      preferences: {
        title: "環境設定",
        description: "CaptureFlow の表示と言語を設定します。",
      },
      languageDescription: "CaptureFlow の表示言語です。",
    },
    avatar: {
      label: "アバター",
      change: "アバターを変更",
      removing: "削除中…",
      hint: "JPG、PNG、WebP、または GIF。最大 2 MB。",
      tooLarge: "アバターは 2 MB 以下にしてください",
      badType: "アバターは PNG、JPEG、WebP、または GIF にしてください",
    },
    account: {
      name: {
        label: "氏名",
        placeholder: "あなたの名前",
        description:
          "録画、スクリーンショット、アクティビティの行に表示されます。",
        required: "名前は必須です。",
        updateFailed: "名前を更新できませんでした。",
      },
      email: {
        label: "メールアドレス",
        description:
          "ログインに使用します。変更するにはサポートにお問い合わせください。",
      },
      userId: {
        label: "ユーザー ID",
        copy: "ユーザー ID をコピー",
        description: "サポートに問い合わせる際にお知らせください。",
      },
      saveChanges: "変更を保存",
    },
    workspace: {
      title: "ワークスペース設定",
      tabs: {
        label: "設定のセクション",
        general: "一般",
        security: "セキュリティ",
      },
      general: {
        title: "一般",
        description:
          "切り替えメニュー、メンバーページ、共有プレビューでこのワークスペースを識別する名前とロゴです。",
      },
      name: {
        title: "ワークスペース名",
        description: "ワークスペースに表示される名前です。",
        empty: "ワークスペース名は空にできません",
        tooLong: "ワークスペース名が長すぎます（最大 {max} 文字）",
      },
      logo: {
        title: "ワークスペースのロゴ",
        description:
          "ワークスペース名の横に表示されます。PNG、JPEG、WebP、GIF、または SVG、最大 2 MB。",
        upload: "ロゴをアップロード",
        replace: "ロゴを置き換え",
        tooLarge: "ロゴは 2 MB 以下にしてください",
        badType: "ロゴは PNG、JPEG、WebP、GIF、または SVG にしてください",
      },
      permissions: {
        title: "デフォルトの権限",
        description:
          "ワークスペース内の新しい録画とスクリーンショットすべてに適用される設定です。",
      },
      recordingAccess: {
        title: "録画のアクセス",
        description:
          "チームメンバーがこのワークスペースに録画とスクリーンショットを投稿できるかどうかを設定します。",
        allow: {
          title: "チームメンバーの投稿を許可",
          body: "メンバーはこのワークスペースに録画できます。",
        },
        ownerOnly: {
          title: "ワークスペースのオーナーのみ",
          body: "チームメンバーのアップロードは各自の個人ワークスペースに保存されます。",
        },
      },
    },
    devices: {
      title: "接続済みデバイス",
      count: "other:{n} 台のデバイスがログイン中",
      empty:
        "接続済みのデバイスはありません。CaptureFlow デスクトップアプリを開き、録画バーの Sign in をクリックしてこのアカウントを連携してください。",
      unlabelled: "名前のないデバイス",
      added: "{date} に追加",
      addedLastUsed: "{date} に追加 · 最終使用 {lastUsed}",
      neverUsed: "未使用",
      revoke: {
        action: "取り消す",
        title: "このデバイスをログアウトしますか？",
        description: "録画を管理するには、再度ログインが必要になります。",
      },
    },
  },
  billing: {
    chargedInUsd: "請求は米ドルで行われます。",
    shownIn: "価格は{currency}で表示しています。請求は米ドルで行われます。",
    page: {
      title: "請求",
      subtitle: "ご利用中のプランと、その使用状況です。",
      workspaceLabel: "ワークスペース · {name}",
      manageSubscription: "サブスクリプションを管理",
      upgradeWorkspace: "ワークスペースをアップグレード",
      storage: "ワークスペースのストレージ",
      usedOfLimit: "{limit} 中 {used}",
      usedNoLimit: "{used} — 上限なし",
    },
    loading: {
      plan: "プラン",
      usage: "使用状況",
    },
    counts: {
      members: "other:メンバー {n} 人",
      paidSeats: "other:有料シート {n} 席",
      freeViewers: "other:無料の閲覧者 {n} 人",
    },
    plan: {
      free: "無料",
      paid: "有料",
      billedMonthly: "月払い",
      billedYearly: "年払い",
      freeSummary:
        "{members} · 一人あたり最大 {recordings} 件、各 {minutes} 分まで、データセーバー画質",
    },
    status: {
      onTrial: "トライアル",
      active: "有効",
      paused: "一時停止中",
      pastDue: "支払い失敗",
      unpaid: "未払い",
      cancelled: "キャンセル済み",
      expired: "期限切れ",
    },
    details: {
      youPay: "お支払い額",
      amountPerMonth: "月額 {amount}",
      amountPerYear: "年額 {amount}",
      seatsMonthly: "other:{n} 席 × 月額 {price}",
      seatsYearly: "other:{n} 席 × 月額 {price}、月額換算 {total} を年払い",
      nextPayment: "次回のお支払い",
      ends: "終了日",
      endOfPeriod: "今回の期間の終了時",
      amountOnDate: "{date} に {amount}",
      firstPaymentPending: "初回のお支払いが完了した時点",
      estimate: "{base} · {change}、概算",
      baseForSeats: "other:{n} 席分 {amount}",
      seatsAdded: "other:今回の期間に追加された {n} 席分 {amount}",
      seatsRemoved: "other:今回の期間に削除された {n} 席分の返金 {amount}",
      seatChanges: "今回の期間のシート変更分 {amount}",
      seats: "シート",
      seatsAndViewers: "{seats}、{viewers}",
      billedTo: "請求先",
      paymentMethod: "お支払い方法",
      cardEnding: "{brand} 末尾 {last4}",
      card: "カード",
      updateCard: "更新",
    },
    switchPlan: {
      switchTo: "{plan} に切り替え",
      title: "{plan} に切り替えますか？",
      priceMonthly:
        "other:{n} 席の料金が月額 {before} から {after} になります。",
      priceYearly:
        "other:{n} 席の料金が月額 {before} から {after} になります（年払い）。",
      benefits:
        "{plan} では最大 60 fps のすべての画質で録画でき、AI 編集が使えるようになります。",
      timing:
        "すぐに適用されます。今回の請求期間の残り分の差額は、次回の請求書に追加されます。",
      errors: {
        failed: "プランを変更できませんでした",
        unknownPlan: "不明なプランです",
        billingUnavailable: "請求システムを利用できません",
        noSubscription:
          "このワークスペースには有効なサブスクリプションがありません",
        cancelled: "プランを変更する前にサブスクリプションを再開してください",
        unavailable: "現在プランの変更はできません",
        rejected:
          "請求システムが変更を受け付けませんでした。もう一度お試しください。",
      },
    },
    upgrade: {
      title: "{name} をアップグレード",
      billingCycle: "請求サイクル",
      cycles: {
        monthly: "月払い",
        annual: "年払い",
      },
      annualSaving: "{percent}% お得",
      seatPicker: {
        title: "有料シートを割り当てる人",
        selected: "{total} 人中 {seats} 人",
        description:
          "チェックした人は録画でき、請求の対象になります。それ以外の人は無料の閲覧者として視聴、コメント、リアクションはできますが、録画はできません。役割はアップグレード時に変更されます。",
        selectAll: "すべて選択",
        clear: "クリア",
        you: "（あなた）",
        paidSeat: "有料シート",
        viewer: "閲覧者",
      },
      perMonth: "月額",
      seatsPrice: "other:{n} 席 × {price}",
      viewersFree: "other:閲覧者 {n} 人は無料",
      priceWithViewers: "{seats}、{viewers}",
      priceYearly: "{seats}、年払い",
      priceWithViewersYearly: "{seats}、{viewers}、年払い",
      upgradeTo: "{plan} にアップグレード",
      checkoutUnavailable: "決済が設定されていません",
    },
    requestSeat: {
      request: "録画をリクエスト",
      requested: "シートを申請済み",
      hint: "ここでは閲覧者です。録画するには、オーナーに有料シートを依頼してください。",
      requestedHint:
        "オーナーに申請を送りました。承認されると録画できるようになります。",
      failed: "リクエストを送信できませんでした",
    },
  },
  actions: {
    missingSlug: "slug がありません",
    recordingNotFound: "録画が見つかりません",
    backgroundMissing: "アップロードする画像を選んでください",
    backgroundTooLarge: "画像は5MBまでです",
    backgroundBadType: "PNG、JPEG、WebPのいずれかの画像を使ってください",
    backgroundFailed:
      "画像をアップロードできませんでした。もう一度お試しください。",
    invalidVisibility: "公開範囲が無効です",
    deleteVideoFailed: "動画ファイルを削除できませんでした: {reason}",
    transcriptNotFound: "文字起こしが見つかりません",
    transcriptEmpty:
      "文字起こしを空にすることはできません。代わりにリセットしてください。",
    missingTokenId: "トークン ID がありません",
    tokenNotFound: "トークンが見つかりません",
    missingScreenshotId: "スクリーンショット ID がありません",
    screenshotNotFound: "スクリーンショットが見つかりません",
    missingImageBytes: "画像データがありません",
    screenshotTooLarge:
      "編集したスクリーンショットが一枚あたりのサイズ上限を超えています。",
    saveScreenshotFailed: "スクリーンショットを保存できませんでした: {reason}",
    saveFailed: "保存に失敗しました: {reason}",
    invalidCanvasDimensions: "保存に失敗しました: キャンバスのサイズが無効です",
  },
  viewer: {
    meta: {
      defaultTitle: "{product} の録画",
      defaultDescription: "{product} から共有された画面録画です。",
      preparingTitle: "録画を準備中… — {product}",
      notFoundTitle: "見つかりません",
      description:
        "{product} から共有された画面録画です。登録不要でブラウザーからご覧いただけます。",
      descriptionTimed:
        "{product} から共有された {duration} の画面録画です。登録不要でブラウザーからご覧いただけます。",
    },
    loading: "録画を読み込み中…",
    nav: {
      download: "ダウンロード",
    },
    authPrompt: {
      pricing: "料金",
      logIn: "ログイン",
      getStarted: "はじめる",
      getFree: "{product} を無料で使う",
    },
    postedBy: {
      label: "投稿者",
      someone: "誰か",
    },
    views: {
      count: "other:{count} 回視聴",
      showWhoWatched: "{views}、視聴者を表示",
      viewers: "視聴者",
      emptyTitle: "視聴はまだありません",
      emptyDescription: "リンクを共有すると、視聴した人がここに表示されます。",
      signedInViewer: "ログイン済みの視聴者",
      anonymous: "匿名",
    },
    actions: {
      share: "共有",
      visibilityFailed: "公開範囲を更新できませんでした",
      deleteFailed: "録画を削除できませんでした",
    },
    requestAccess: {
      title: "この動画を視聴するためのアクセスをリクエスト",
      notSharedBy: "{name} はこの録画をまだあなたに共有していません。",
      notSharedByOwner: "オーナーはこの録画をまだあなたに共有していません。",
      signInHint:
        "仕事用のメールアドレスでログインしてください。すでにオーナーのチームに所属していれば、そのまま視聴できます。",
      signIn: "ログインして続行",
      sentTitle: "リクエストを送信しました",
      sentDescription:
        "オーナーに通知しました。アクセスが許可されるとメールが届きます。",
      askingAs: "{email} としてリクエスト",
      noteLabel: "メモを追加 {optional}",
      noteOptional: "（任意）",
      notePlaceholder: "こんにちは。昨日のレビューの録画を視聴したいです。",
      sending: "送信中…",
      submit: "アクセスをリクエスト",
      failed: "問題が発生しました。しばらくしてからもう一度お試しください。",
    },
    pending: {
      preparingTitle: "録画を準備しています…",
      preparingDescription:
        "アップロードはまだ完了していません。準備ができるとこのページは自動的に更新されます。",
      generatingTitle: "動画を生成しています…",
      generatingDescription:
        "数分かかることがあります。コーヒーやおやつでもどうぞ ☕️🍪 準備ができると、このページは自動的に更新されます。",
      failedTitle: "この録画のアップロードは完了しませんでした",
      failedDescription:
        "リンクは作成されましたが、動画が届きませんでした。しばらくしてからリンクをもう一度開くか、新しく録画してください。",
      comment: "コメント",
    },
    upgradeBanner: {
      message:
        "無料プランで{usage}。アップグレードすると、フル画質で録画を無制限に作成できます。",
      usage: "other:{n} 件中 {used} 件の録画を使用",
    },
    editPanel: {
      editTitle: "動画を編集",
      editDescription:
        "エディターでトリミング、カット、見た目の変更、文字起こしの修正ができます。",
      downloadTitle: "動画をダウンロード",
      downloadDescription: "編集を反映した MP4(背景、カメラ、カット)。",
      downloadRendering:
        "レンダリング中 {percent}%。このタブを開いたままにしてください。",
      downloadCancel: "キャンセル",
      downloadFailed:
        "動画をレンダリングできませんでした。代わりに元の動画をダウンロードしてください。",
      downloadUnsupported:
        "このブラウザでは動画をレンダリングできません。代わりに元の動画をダウンロードしてください。",
      originalTitle: "元の動画をダウンロード",
      originalDescription: "編集前の録画そのままです。",
      copyEmbed: "埋め込みコードをコピー",
      embedCopied: "埋め込みコードをコピーしました",
      embedDescription: "プレーヤーを任意のウェブページに貼り付けられます。",
    },
    notFound: {
      title: "録画が見つかりません",
      description:
        "このリンクは期限切れか、存在しませんでした。無料アカウントの録画は、最後に視聴された日から 30 日間保存されます。",
      madeWith: "{product} で作成",
    },
  },
  activity: {
    sidebar: {
      label: "録画のサイドバー",
      activityTab: "アクティビティ",
      transcriptTab: "文字起こし",
      toolsTab: "アクション",
    },
    you: "あなた",
    anonymous: "匿名",
    jumpToMoment: "この場面にジャンプ",
    empty: {
      title: "アクティビティはまだありません",
      description:
        "視聴者からのリアクションとコメントが、投稿されるとすぐにここに表示されます。",
      firstTitle: "最初のコメントを書きましょう",
      firstTitleNamed: "{name} さん、最初のコメントを書きましょう",
      hint: "{key} を押して返信するか、このパネルの下部でコメントを残してください。",
      focusComposer: "コメント欄にフォーカス",
    },
    composer: {
      signIn: "ログインしてリアクションやコメントをする",
      placeholder: "コメントを入力…",
      mention: "誰かをメンション",
      noOneToMention: "まだ誰もリアクションやコメントをしていません",
      insertEmoji: "絵文字を挿入",
      searchEmoji: "絵文字を検索",
      posting: "投稿中…",
      submitAt: "{time} にコメント",
      postFailed: "コメントを投稿できませんでした",
    },
    comment: {
      delete: "コメントを削除",
      deleteTitle: "このコメントを削除しますか?",
      deleteDescription: "全員の画面から削除され、元に戻せません。",
      deleteFailed: "コメントを削除できませんでした",
    },
    reaction: {
      count: "other:リアクション {n} 件",
      delete: "リアクションを削除",
      deleteMany: "other:リアクション {n} 件を削除",
      deleteFailed: "リアクションを削除できませんでした",
    },
    transcript: {
      pendingTitle: "文字起こし中…",
      pendingDescription:
        "準備ができるとすぐに文字起こしがここに表示されます。",
      failedTitle: "文字起こしが完了しませんでした",
      failedDescription: "この録画の文字起こし中に問題が発生しました。",
      noneTitle: "文字起こしはありません",
      noneOwnerDescription:
        "マイクをオンにして録画すると、文字起こしが自動的に作成されます。",
      noneViewerDescription: "この録画はマイクなしで作成されました。",
      searchLabel: "文字起こしを検索",
      noMatches: "一致する項目がありません。",
    },
    saveFailed: "保存できませんでした。もう一度お試しください。",
    summary: {
      title: "概要",
      add: "追加",
      placeholder: "この録画の内容は？",
      empty: "概要はまだありません。",
      emptyAction: "概要を追加",
    },
    chapters: {
      title: "チャプター",
      count: "other:チャプター {n} 件",
      addAtPlayhead: "再生位置に追加",
      defaultTitle: "チャプター {n}",
      editHint:
        "一行につき一つのチャプターを {short} または {long} の形式で入力します。",
      editHintShort: "M:SS タイトル",
      editHintLong: "H:MM:SS タイトル",
      editPlaceholder: "0:00 はじめに\n0:30 デモ\n1:20 まとめ",
      playing: "再生中",
      remove: "チャプターを削除",
      empty: "チャプターはまだありません。",
      emptyAction: "再生位置に追加する",
    },
  },
  player: {
    overlay: {
      watchAgain: "もう一度見る",
    },
    captions: {
      track: "字幕",
      size: "サイズ",
      position: "位置",
      sizes: {
        small: "小",
        medium: "中",
        large: "大",
      },
      positions: {
        top: "上",
        bottom: "下",
      },
    },
    reactionBar: {
      comment: "コメント",
      leaveComment: "コメントを残す",
    },
    reactions: {
      heart: "ハート",
      thumbsUp: "いいね",
      fire: "炎",
      clap: "拍手",
      raisedHands: "両手を上げる",
      eyes: "目",
    },
    embed: {
      title: "{product} の録画",
    },
    controls: {
      buttons: {
        play: "再生",
        pause: "一時停止",
        replay: "もう一度再生",
        mute: "ミュート",
        unmute: "ミュート解除",
      },
      seek: {
        forward: "{seconds} 秒進む",
        backward: "{seconds} 秒戻る",
      },
      fullscreen: {
        enter: "全画面表示",
        exit: "全画面表示を終了",
      },
      captions: {
        enable: "字幕をオン",
        disable: "字幕をオフ",
      },
      pip: {
        enter: "ピクチャーインピクチャーを開始",
        exit: "ピクチャーインピクチャーを終了",
      },
      cast: {
        start: "キャストを開始",
        stop: "キャストを停止",
        connecting: "接続中",
      },
      airplay: {
        start: "AirPlay を開始",
        stop: "AirPlay を停止",
      },
      slider: {
        seek: "シーク",
      },
      time: {
        current: "現在の時間",
        duration: "長さ",
        position: "{duration} 中 {current}",
        unknown: "メディアが読み込まれていないため、時間は不明です。",
      },
      playback: {
        rate: "再生速度 {rate}",
      },
      volume: {
        mutedValue: "{percent}、ミュート中",
        muted: "ミュート中",
        label: "音量",
        value: "音量 {value}",
      },
      status: {
        captionsOn: "字幕オン",
        captionsOff: "字幕オフ",
        paused: "一時停止中",
        playing: "再生中",
        fullscreen: "全画面",
        pip: "ピクチャーインピクチャー",
        exitPip: "ピクチャーインピクチャーを終了",
        seekedTo: "{time} に移動しました",
      },
      container: {
        label: "メディアプレーヤー",
      },
      errors: {
        aborted: "メディアの再生が完了する前に停止されました。",
        network:
          "ネットワークまたはサーバーの問題により、このメディアを読み込めませんでした。",
        decode:
          "このメディアを再生できませんでした。ファイルが破損しているか、ブラウザーがこの形式に対応していない可能性があります。",
        source:
          "このメディアを読み込めませんでした。利用できないか、ブラウザーがこの形式に対応していない可能性があります。",
        encrypted: "復号できなかったため、このメディアを再生できませんでした。",
        unplayable: "このメディアはプレーヤーで対応していません。",
        title: "問題が発生しました。",
        unexpected: "予期しないエラーが発生しました。",
      },
      common: {
        ok: "OK",
      },
      menu: {
        settings: "設定",
        quality: "画質",
        audio: "音声",
        speed: "速度",
        captions: "字幕",
        playbackRate: "再生速度",
        off: "オフ",
        auto: "自動",
        autoWithLabel: "自動（{label}）",
      },
    },
  },
  screenshotView: {
    page: {
      defaultTitle: "{product} のスクリーンショット",
      description: "{product} から共有されたスクリーンショットです。",
      madeWith: "{product} で作成",
      loading: "スクリーンショットを読み込み中…",
    },
    authPrompt: {
      pricing: "料金",
      logIn: "ログイン",
      getStarted: "はじめる",
      getFree: "{product} を無料で使う",
    },
    actions: {
      edit: "スクリーンショットを編集",
      share: "共有",
      shareTitle: "スクリーンショットを共有",
      copyLink: "リンクをコピー",
      linkCopied: "リンクをコピーしました",
      more: "その他の操作",
      delete: "スクリーンショットを削除",
      deleteTitle: "このスクリーンショットを削除しますか？",
      deleteDescription:
        "画像とそのリンクはすぐに使えなくなります。この操作は元に戻せません。",
      visibilityFailed: "公開範囲を更新できませんでした",
      deleteFailed: "スクリーンショットを削除できませんでした",
    },
    zoom: {
      expand: "画像を拡大",
      minimize: "画像を縮小",
    },
    requestAccess: {
      title: "このスクリーンショットを見るためのアクセスをリクエスト",
      notSharedBy:
        "{name} はこのスクリーンショットをまだあなたに共有していません。",
      notSharedByOwner:
        "オーナーはこのスクリーンショットをまだあなたに共有していません。",
      signInHint:
        "仕事用のメールアドレスでログインしてください。すでにオーナーのチームに所属していれば、そのまま閲覧できます。",
      signIn: "ログインして続行",
      sentTitle: "リクエストを送信しました",
      sentDescription:
        "オーナーに通知しました。アクセスが許可されるとメールが届きます。",
      askingAs: "{email} としてリクエスト",
      noteLabel: "メモを追加 {optional}",
      noteOptional: "（任意）",
      notePlaceholder:
        "こんにちは。デザインレビューのこのスクリーンショットをいただきたいです。",
      sending: "送信中…",
      submit: "アクセスをリクエスト",
      failed: "問題が発生しました。しばらくしてからもう一度お試しください。",
    },
    notFound: {
      title: "スクリーンショットが見つかりません",
      description:
        "このリンクは期限切れか、存在しませんでした。無料アカウントのスクリーンショットは、最後に閲覧された日から 30 日間保存されます。",
    },
  },
  recordingEditor: {
    skeleton: {
      label: "エディターを開いています",
      status: "エディターを開いています…",
    },
    preparing: {
      title: "録画を準備中…",
      description:
        "録画はまだアップロード中です。準備ができるとこのページは自動的に更新されます。",
    },
    failed: {
      title: "録画のアップロードに失敗しました。",
      description: "デスクトップアプリからもう一度録画してください。",
    },
    saveFailed: "保存できませんでした",
    topBar: {
      back: "録画に戻る",
      status: {
        idle: "編集は自動的に保存されます",
        saved: "保存しました",
        error: "保存できませんでした",
      },
      versionHistory: "バージョン履歴（近日公開）",
      undo: "元に戻す",
      undoShortcut: "元に戻す（{key}）",
      redo: "やり直す",
      redoShortcut: "やり直す（{key}）",
      finish: "完了",
    },
    panels: {
      label: "エディターパネル",
      tabs: {
        transcript: "文字起こし",
        design: "デザイン",
        camera: "カメラ",
        audio: "サウンド",
        details: "詳細",
      },
      hide: {
        transcript: "文字起こしを隠す",
        design: "デザインを隠す",
        camera: "カメラを隠す",
        audio: "サウンドを隠す",
        details: "詳細を隠す",
      },
      show: {
        transcript: "文字起こしを表示",
        design: "デザインを表示",
        camera: "カメラを表示",
        audio: "サウンドを表示",
        details: "詳細を表示",
      },
    },
    toggleOn: "オン",
    background: {
      title: "背景",
      gradients: "グラデーション",
      none: "なし",
      noBackground: "背景なし",
      upload: "画像をアップロード",
      uploading: "アップロード中…",
      uploadedImage: "アップロードした画像",
      solid: "単色",
      solidColor: "単色 {color}",
      customColor: "カスタムカラーを選択",
      colors: "カラー",
      wallpaper: "{group}の壁紙 {n}",
      wallpaperGroups: {
        general: "一般",
        cities: "都市",
        blue: "ブルー",
        purple: "パープル",
        orange: "オレンジ",
        dark: "ダーク",
      },
      presets: {
        violet: "バイオレット",
        sunset: "サンセット",
        orchid: "オーキッド",
        forest: "フォレスト",
        flamingo: "フラミンゴ",
        citrus: "シトラス",
        arctic: "アークティック",
        ocean: "オーシャン",
        deep: "ディープ",
        ember: "エンバー",
        mint: "ミント",
        dusk: "ダスク",
        peach: "ピーチ",
        midnight: "ミッドナイト",
        slate: "スレート",
      },
    },
    frame: {
      title: "フレーム",
      padding: "余白",
      corners: "角の丸み",
      shadow: "影",
    },
    camera: {
      title: "カメラ",
      show: "カメラを表示",
      hidden: "非表示",
      position: "位置",
      positionHint: "ドットをドラッグするか、角をタップします",
      positionHintHidden: "配置するにはカメラを表示してください。",
      corners: {
        topLeft: "左上",
        topRight: "右上",
        bottomLeft: "左下",
        bottomRight: "右下",
      },
      size: "サイズ",
      sizes: {
        small: "小",
        medium: "中",
        large: "大",
      },
    },
    audio: {
      title: "音声",
      systemSound: "システム音声",
      sound: "サウンド",
      microphone: "マイク",
      muted: "ミュート中",
      sharedTrack:
        "この録画では、マイクとシステム音声が一つのトラックを共有しています。",
    },
    details: {
      title: "録画",
      link: "リンク",
      size: "サイズ",
      duration: "長さ",
      views: "視聴回数",
      created: "作成日",
    },
    transcript: {
      transcribing: "文字起こし中…",
      unavailable: "文字起こしはありません",
      pendingHint:
        "編集するには、しばらくしてからこのページを再読み込みしてください。",
      failedHint: "この録画の文字起こしは完了しませんでした。",
      missingHint:
        "マイクをオンにして録画すると、文字起こしが自動的に作成されます。",
      deleteWord: "単語を削除",
      deleteWords: "other:{n} 語を削除",
      clearSelection: "選択を解除",
      hint: "単語をクリックするか、ドラッグして範囲を選択します。ダブルクリックでテキストを修正できます。",
      resetEdits: "編集をリセット",
      editLine: "文字起こしの行を編集",
      selectLine: "{time} の行を選択",
      restore: "復元",
      saveFailed: "保存できませんでした",
      resetFailed: "リセットできませんでした",
    },
    timeline: {
      hideWaveform: "波形を隠す",
      showWaveform: "波形を表示",
      loadingAudio: "音声を読み込み中…",
      deleteSelection: "選択範囲を削除",
      deleteSelectionHint:
        "文字起こしで単語を選択するか、タイムラインを分割してセグメントを選びます",
      splitAt: "{time} で分割",
      splitHint: "先に再生またはスクラブして場面を選んでください",
      comingSoon: "近日公開",
      fit: "全体表示",
      zoomOut: "縮小",
      zoom: "タイムラインのズーム",
      zoomIn: "拡大",
      seek: "シーク",
      trimStart: "クリップの先頭をトリミング",
      trimEnd: "クリップの末尾をトリミング",
      removeSplit: "{time} の分割を削除",
    },
  },
  screenshotEditor: {
    loading: "エディターを読み込み中…",
    imageError: {
      decode: "スクリーンショット画像をデコードできませんでした。",
      fetch:
        "スクリーンショット画像を読み込めませんでした。バケットの CORS アクセスが失われている可能性があります。",
    },
    header: {
      back: "スクリーンショットに戻る",
      reset: "編集をリセット",
      undo: "元に戻す",
      undoTooltip: "元に戻す（{key}）",
      redo: "やり直す",
      redoTooltip: "やり直す（{key}）",
      finish: "完了",
    },
    saveError: {
      notMounted: "エディターがマウントされていません",
      noCanvas: "書き出し用キャンバスを取得できませんでした",
      workerCrashed: "PNG エンコードワーカーがクラッシュしました",
    },
    tools: {
      text: "テキスト",
      rect: "長方形",
      arrow: "矢印",
      background: "背景",
    },
    background: {
      title: "背景を追加",
      close: "背景ピッカーを閉じる",
      none: "なし",
      gradients: {
        violet: "バイオレット",
        sunset: "サンセット",
        orchid: "オーキッド",
        forest: "フォレスト",
        flamingo: "フラミンゴ",
        citrus: "シトラス",
        arctic: "アークティック",
        ocean: "オーシャン",
        deep: "ディープ",
      },
      solid: "単色 {color}",
      custom: "カスタムカラーを選択",
    },
    inspector: {
      color: "色 {color}",
      size: "{n}px",
      duplicate: "複製",
    },
    textPrompt: "テキスト",
  },
  canvas: {
    meta: {
      title: "キャンバス",
      description: "録画しながら描き込める白紙のボードです。",
    },
    loading: "キャンバスを読み込み中…",
    tools: {
      select: "選択",
      hand: "ハンド",
      pen: "ペン",
      highlighter: "蛍光ペン",
      rect: "長方形",
      ellipse: "楕円",
      arrow: "矢印",
      line: "直線",
      text: "テキスト",
      eraser: "消しゴム",
    },
    shortcut: "{label} · {key}",
    colour: "色 {colour}",
    stroke: "線の太さ {width}",
    hint: "スクロールで移動 · {mod} スクロールでズーム · {space} を押しながらドラッグ",
    textPlaceholder: "入力…",
    history: {
      undo: "元に戻す",
      redo: "やり直す",
      clear: "ボードをクリア",
    },
    zoom: {
      out: "縮小",
      reset: "ズームをリセット",
      in: "拡大",
    },
    extensionPrompt: {
      title: "このキャンバスを録画",
      description:
        "CaptureFlow 拡張機能を追加すると、描きながら画面とカメラを録画して、リンクで共有できます。",
      dismiss: "今はしない",
      install: "Chrome に追加",
    },
  },
};

export default messages;

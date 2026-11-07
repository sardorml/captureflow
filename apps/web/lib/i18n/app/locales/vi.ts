import type { AppMessages } from "../messages";

const messages: AppMessages = {
  common: {
    cancel: "Hủy",
    save: "Lưu",
    saving: "Đang lưu…",
    delete: "Xóa",
    deleting: "Đang xóa…",
    remove: "Gỡ",
    close: "Đóng",
    back: "Quay lại",
    continue: "Tiếp tục",
    confirm: "Xác nhận",
    done: "Xong",
    edit: "Chỉnh sửa",
    copy: "Sao chép",
    copied: "Đã sao chép",
    search: "Tìm kiếm",
    loading: "Đang tải…",
    retry: "Thử lại",
    learnMore: "Tìm hiểu thêm",
    language: "Ngôn ngữ",
    themeToLight: "Chuyển sang giao diện sáng",
    themeToDark: "Chuyển sang giao diện tối",
    somethingWrong: "Đã xảy ra lỗi. Hãy thử lại.",
    pageFailed: "Không thể tải trang này.",
    partFailed: "Không thể tải phần này.",
    failedBody: "Đã xảy ra lỗi. Hãy thử lại hoặc tải lại trang.",
    reload: "Tải lại trang",
  },
  auth: {
    signedInAs: "Đã đăng nhập bằng {email}.",
    errors: {
      generic: "Đã xảy ra lỗi. Vui lòng thử lại.",
      network: "Lỗi mạng. Vui lòng thử lại.",
    },
    login: {
      metaTitle: "Đăng nhập",
      signInTitle: "Chào mừng bạn trở lại",
      signInDescription: "Đăng nhập bằng Google, GitHub hoặc email của bạn",
      signUpTitle: "Tạo tài khoản",
      signUpDescription: "Đăng ký bằng Google, GitHub hoặc email của bạn",
      inviteTitle: "Tham gia {workspace}",
      inviteDescription:
        "{inviter} đã mời bạn. Hãy đăng nhập hoặc tạo tài khoản bằng {email} để chấp nhận.",
      continueWith: "Tiếp tục với {provider}",
      or: "Hoặc",
      emailLabel: "Email",
      emailPlaceholder: "you@example.com",
      emailInvalid: "Hãy nhập email hợp lệ.",
      continueWithEmail: "Tiếp tục với Email",
      askForInvite: "Cần tài khoản? Hãy nhờ quản trị viên gửi lời mời.",
      haveAccount: "Đã có tài khoản? {action}",
      haveAccountAction: "Đăng nhập",
      noAccount: "Chưa có tài khoản? {action}",
      noAccountAction: "Đăng ký",
      changeEmail: "Đổi",
      nameLabel: "Tên",
      namePlaceholder: "Tên của bạn",
      passwordLabel: "Mật khẩu",
      newPasswordPlaceholder: "Ít nhất 12 ký tự",
      passwordTooShort: "Hãy dùng ít nhất 12 ký tự.",
      passwordMissing: "Hãy nhập mật khẩu.",
      signInSubmit: "Đăng nhập",
      signUpSubmit: "Tạo tài khoản",
      terms: "Khi tiếp tục, bạn đồng ý với {terms} và {privacy} của chúng tôi.",
      termsLink: "Điều khoản",
      privacyLink: "Chính sách quyền riêng tư",
    },
    verify: {
      title: "Kiểm tra email của bạn",
      description:
        "Chúng tôi đã gửi một liên kết đến {email}. Hãy mở liên kết đó để hoàn tất thiết lập tài khoản.",
      resend: "Gửi lại email",
      resent: "Đã gửi lại",
      resendFailed: "Không gửi được email. Vui lòng thử lại.",
      wrongAddress: "Sai địa chỉ? {action}",
      wrongAddressAction: "Dùng email khác",
    },
    oauthErrors: {
      unfinished: "Đăng nhập chưa hoàn tất. Vui lòng thử lại.",
      inviteOnly:
        "CaptureFlow này chỉ dành cho người được mời. Hãy nhờ quản trị viên gửi lời mời.",
      allowedDomains:
        "Hãy đăng ký bằng địa chỉ thuộc {domains}, hoặc nhờ quản trị viên gửi lời mời.",
      providerDomains:
        "Hãy đăng ký bằng tài khoản Google hoặc GitHub thuộc {domains}.",
      domainChoice: "{first} hoặc {second}",
    },
    inviteFallbacks: {
      workspace: "một không gian làm việc CaptureFlow",
      inviter: "Một đồng đội",
    },
    setPassword: {
      title: "Đặt mật khẩu",
      description:
        "Hãy chọn mật khẩu cho {email}. Sau đó bạn sẽ được đăng nhập.",
      passwordLabel: "Mật khẩu mới",
      passwordPlaceholder: "Ít nhất 12 ký tự",
      submit: "Lưu mật khẩu",
      expiredTitle: "Liên kết này không còn hoạt động",
      expiredDescription:
        "Liên kết đã được dùng hoặc đã hết hạn. Hãy nhờ quản trị viên gửi liên kết mới.",
      goToSignIn: "Đến trang đăng nhập",
    },
    invite: {
      title: "Bạn được mời",
      asViewer:
        "Bạn được mời tham gia {workspace} trên CaptureFlow với vai trò người xem: bạn có thể xem và bình luận mọi nội dung được chia sẻ ở đó.",
      asMember:
        "Bạn được mời tham gia {workspace} trên CaptureFlow với vai trò thành viên: bạn có thể quay vào đó và chia sẻ với nhóm.",
      accept: "Chấp nhận lời mời",
      databaseUnavailable: "Cơ sở dữ liệu không khả dụng",
      invalidTitle: "Lời mời không còn hiệu lực",
      invalidBody:
        "Liên kết này đã hết hạn hoặc đã được dùng. Hãy nhờ chủ sở hữu không gian làm việc gửi lời mời mới.",
      wrongAccountTitle: "Sai tài khoản",
      wrongAccountBody:
        "Lời mời này được gửi đến {invited}, nhưng bạn đang đăng nhập bằng {current}. Hãy đăng xuất rồi đăng nhập bằng địa chỉ được mời để chấp nhận.",
      goToDashboard: "Đến trang tổng quan",
      signOut: "Đăng xuất",
    },
    handoff: {
      signingIn: "Đang đăng nhập…",
      returning: "Đang quay lại CaptureFlow…",
      open: "Mở CaptureFlow",
      hint: "Nếu không có gì xảy ra, hãy nhấn nút ở trên. Bạn có thể đóng tab này khi ứng dụng máy tính mở lại.",
      extensionDone: "Đã đăng nhập bằng {email}. Bạn có thể đóng tab này.",
      extensionUnreachable:
        "Không kết nối được với tiện ích CaptureFlow. Hãy kiểm tra xem tiện ích đã được cài chưa, rồi nhấn vào biểu tượng của tiện ích để thử lại.",
      extensionUnverified:
        "Không xác minh được tiện ích. Hãy cài lại tiện ích rồi thử lại.",
    },
  },
  shell: {
    record: {
      newRecording: "Bản ghi mới",
    },
    nav: {
      toggleSidebar: "Ẩn/hiện thanh bên",
      dashboard: "Trang tổng quan",
      recordings: "Bản ghi",
      screenshots: "Ảnh chụp màn hình",
      canvas: "Canvas",
      workspaceGroup: "Không gian làm việc",
      members: "Thành viên",
      settings: "Cài đặt",
      personal: "Cá nhân",
      workspace: "Không gian làm việc",
      billing: "Thanh toán",
      admin: "Quản trị",
    },
    upgradeCard: {
      title: "Nâng cấp không gian làm việc",
      description:
        "Gói Miễn phí gồm {recordings} bản ghi mỗi người ở chất lượng tiết kiệm dữ liệu. Các gói trả phí bỏ các giới hạn này, từ {price} mỗi thành viên.",
      viewPlans: "Xem các gói",
    },
    topBar: {
      upgrade: "Nâng cấp",
    },
    workspaceSwitcher: {
      switchWorkspace: "Chuyển không gian làm việc",
      summary: "other:Mặc định · {n} thành viên",
      workspaces: "Không gian làm việc",
      owned: "Bạn là chủ sở hữu",
      joined: "Bạn đã tham gia",
      newWorkspace: "Không gian làm việc mới",
      inviteMembers: "Mời thành viên",
    },
    drawer: {
      open: "Mở menu không gian làm việc",
      title: "Menu không gian làm việc",
    },
    search: {
      prompt: "Tìm bản ghi và ảnh chụp màn hình của bạn",
      clear: "Xóa tìm kiếm",
      results: "Kết quả tìm kiếm",
      hint: "Tìm bản ghi và ảnh chụp màn hình của bạn theo tiêu đề.",
      noMatches: "Không có kết quả phù hợp",
      kind: {
        recording: "bản ghi",
        screenshot: "ảnh chụp màn hình",
      },
    },
    account: {
      menu: "Menu tài khoản",
      nav: {
        billing: "Thanh toán",
        devices: "Thiết bị đã kết nối",
        settings: "Cài đặt",
        support: "Liên hệ hỗ trợ",
      },
      freePlan: "Miễn phí",
      signOut: "Đăng xuất",
      signingOut: "Đang đăng xuất…",
    },
    theme: {
      label: "Giao diện",
      light: "Sáng",
      dark: "Tối",
      system: "Hệ thống",
    },
    notifications: {
      title: "Thông báo",
      subtitle: "Lời mời và thay đổi trong các không gian làm việc của bạn.",
      bellUnread: "other:Thông báo, {n} chưa đọc",
      viewAll: "Xem tất cả",
      menuEmpty:
        "Bạn đã xem hết thông báo. Lời mời, đồng đội mới và thay đổi vai trò sẽ hiện ở đây.",
      pageEmpty:
        "Bạn đã xem hết thông báo. Khi có người mời bạn, tham gia không gian làm việc của bạn hoặc đổi vai trò của bạn, bạn sẽ thấy ở đây.",
      accept: "Chấp nhận",
      decline: "Từ chối",
      unread: "Chưa đọc",
      someone: "Ai đó",
      message: {
        invited: {
          member:
            "{actor} đã mời bạn tham gia {workspace} với vai trò thành viên",
          viewer:
            "{actor} đã mời bạn tham gia {workspace} với vai trò người xem",
        },
        joined: {
          member: "{actor} đã tham gia {workspace} với vai trò thành viên",
          viewer: "{actor} đã tham gia {workspace} với vai trò người xem",
        },
        seatRequested:
          "{actor} đã yêu cầu một suất dùng trả phí trong {workspace}",
        seatDenied:
          "{actor} đã từ chối yêu cầu suất dùng của bạn trong {workspace}",
        roleChanged: {
          member: "{actor} đã đặt bạn làm thành viên trong {workspace}",
          viewer: "{actor} đã đặt bạn làm người xem trong {workspace}",
        },
        downgraded: "{actor} đã chuyển bạn sang người xem trong {workspace}",
        keepRecordingUntil: "Bạn có thể tiếp tục quay đến ngày {date}.",
        removed: "{actor} đã gỡ bạn khỏi {workspace}",
      },
      acceptErrors: {
        failed: "Không chấp nhận được lời mời",
        signedOut: "Đăng nhập để chấp nhận",
        invalid: "Lời mời này đã hết hạn hoặc đã bị thu hồi",
        emailMismatch: "Lời mời này dành cho một địa chỉ email khác",
        alreadyMember: "Bạn đã ở trong không gian làm việc này",
      },
    },
    mobileNav: {
      open: "Mở menu",
      close: "Đóng menu",
      docs: "Tài liệu",
      star: "Gắn sao trên GitHub",
      signIn: "Đăng nhập",
      getStarted: "Bắt đầu",
    },
    skeletons: {
      avatar: "Ảnh đại diện",
      workspaceName: "Tên không gian làm việc",
      workspaceLogo: "Logo không gian làm việc",
    },
  },
  library: {
    dashboard: {
      welcome: "Chào mừng bạn trở lại",
      welcomeName: "Chào mừng {name} trở lại",
      openCanvas: "Mở canvas",
      newRecording: "Bản ghi mới",
      stats: {
        recordings: "Bản ghi",
        plusScreenshots: "other:Và {count} ảnh chụp màn hình",
        noScreenshots: "Chưa có ảnh chụp màn hình",
        views: "Lượt xem",
        viewsAverage: "Trung bình {count} lượt mỗi bản ghi",
        noViews: "Chưa có lượt xem",
        recorded: "Đã quay",
        recordedAverage: "Trung bình {duration} mỗi bản ghi",
        nothingRecorded: "Chưa quay gì",
        recordingsLeft: "Bản ghi còn lại",
        leftOfAllowance: "{left} trên {allowance}",
        freePlanLimit: "Gói Miễn phí, mỗi bản tối đa {minutes} phút",
      },
      recordedTime: {
        minutes: "{minutes} phút",
        hours: "{hours} giờ",
        hoursMinutes: "{hours} giờ {minutes} phút",
      },
      recent: {
        title: "Bản ghi gần đây",
        all: "Tất cả bản ghi",
        empty: "Chưa có gì được chia sẻ trong không gian làm việc này.",
        views: "other:{n} lượt xem",
        comments: "other:{n} bình luận",
        reactions: "other:{n} cảm xúc",
      },
      start: {
        title: "Bắt đầu quay với {product}",
        surfacesLabel: "Nơi quay",
        surfaces: {
          extension: "Tiện ích",
          desktop: "Ứng dụng máy tính",
          canvas: "Canvas",
        },
        extension: {
          description:
            "Quay bất kỳ tab, cửa sổ nào hoặc toàn màn hình từ thanh công cụ, và nhận một liên kết bạn có thể chia sẻ với bất kỳ ai.",
          record: "Quay ngay",
          addToChrome: "Thêm vào Chrome",
        },
        desktop: {
          description:
            "Ứng dụng gốc cho Mac, quay màn hình và camera kèm âm thanh hệ thống, sắp ra mắt. Trong lúc chờ, tiện ích quay được bất kỳ tab, cửa sổ nào hoặc toàn màn hình.",
          download: "Tải xuống cho Mac",
          comingSoon: "Sắp ra mắt",
        },
        canvas: {
          description:
            "Một bảng trắng có bút, hình khối và chữ để bạn vẽ trong lúc quay, khi không có trang nào để cho xem.",
        },
      },
    },
    recording: {
      pageTitle: "Bản ghi",
      count: "other:{n} bản ghi",
      untitled: "Bản ghi chưa có tiêu đề",
      aiGenerated: "Do AI tạo",
      processing: "Đang xử lý",
      noMatches: "Không có bản ghi nào khớp với các bộ lọc này.",
      empty:
        "Bạn chưa tạo liên kết bản ghi nào. Hãy quay trong ứng dụng máy tính CaptureFlow và bản ghi của bạn sẽ hiện ở đây.",
      selectAll: "Chọn tất cả bản ghi",
      selected: "other:Đã chọn {n} bản ghi",
      open: "Mở bản ghi",
      edit: "Chỉnh sửa bản ghi",
      share: "Chia sẻ bản ghi",
      delete: "Xóa bản ghi",
      deleteTitle: "Xóa bản ghi này?",
      deleteDescription:
        "Video và liên kết của nó sẽ ngừng hoạt động ngay lập tức. Không thể hoàn tác thao tác này.",
      deleteSelectedTitle: "other:Xóa {n} bản ghi?",
    },
    screenshot: {
      pageTitle: "Ảnh chụp màn hình",
      count: "other:{n} ảnh chụp màn hình",
      untitled: "Ảnh chụp màn hình chưa có tiêu đề",
      numbered: "Ảnh chụp màn hình {id}",
      noMatches: "Không có ảnh chụp màn hình nào khớp với các bộ lọc này.",
      empty:
        "Chưa có ảnh chụp màn hình. Mở CaptureFlow → tab Screenshot → chọn Display, Window hoặc Area để chụp. Ảnh chụp màn hình của bạn sẽ tự động hiện ở đây.",
      selectAll: "Chọn tất cả ảnh chụp màn hình",
      selected: "other:Đã chọn {n} ảnh chụp màn hình",
      open: "Mở ảnh chụp màn hình",
      edit: "Chỉnh sửa ảnh chụp màn hình",
      share: "Chia sẻ ảnh chụp màn hình",
      delete: "Xóa ảnh chụp màn hình",
      deleteTitle: "Xóa ảnh chụp màn hình này?",
      deleteDescription:
        "Hình ảnh và liên kết của nó sẽ ngừng hoạt động ngay lập tức. Không thể hoàn tác thao tác này.",
      deleteSelectedTitle: "other:Xóa {n} ảnh chụp màn hình?",
    },
    filters: {
      access: "Quyền truy cập",
      sort: "Sắp xếp",
      current: "{label}: {value}",
      accessOptions: {
        all: "Mọi quyền truy cập",
        public: "Công khai",
        workspace: "Không gian làm việc",
        private: "Riêng tư",
      },
      sortOptions: {
        newest: "Mới nhất đến cũ nhất",
        oldest: "Cũ nhất đến mới nhất",
        views: "Xem nhiều nhất",
      },
    },
    card: {
      select: "Chọn {title}",
      moreActions: "Thao tác khác",
      rename: "Đổi tên",
      unknownAuthor: "Không rõ",
    },
    selection: {
      deleteDescription: "Liên kết của chúng sẽ ngừng hoạt động ngay lập tức.",
      deleteFailed:
        "Không xóa được {failed} trên {count} mục. Các mục còn lại đã bị xóa.",
      clear: "Bỏ chọn",
    },
    pager: {
      label: "Trang",
      previous: "Trang trước",
      next: "Trang sau",
    },
    visibility: {
      label: "Chế độ hiển thị",
      labels: {
        public: "Công khai",
        workspace: "Không gian làm việc",
        private: "Riêng tư",
      },
      descriptions: {
        public: "Bất kỳ ai có liên kết đều xem được",
        workspace:
          "Chỉ thành viên không gian làm việc đã đăng nhập mới xem được",
        private: "Chỉ mình bạn xem được",
      },
      workspaceNamed: "Không gian làm việc · {name}",
    },
    share: {
      title: "Chia sẻ",
      embed: "Nhúng",
      embedPublic: "Phát được ở bất kỳ nơi nào dán đoạn mã.",
      embedRestricted: "Chỉ phát cho những người vốn đã mở được liên kết.",
      copyCode: "Sao chép mã",
      generalAccess: "Quyền truy cập chung",
      generalAccessCurrent: "Quyền truy cập chung: {access}",
      copyLink: "Sao chép liên kết",
      linkCopied: "Đã sao chép liên kết",
      shareAt: "Chia sẻ tại {time}",
    },
    editableTitle: {
      label: "Tiêu đề bản ghi",
      rename: "Đổi tên bản ghi",
    },
  },
  members: {
    title: "Thành viên",
    databaseUnavailable: "Cơ sở dữ liệu không khả dụng.",
    role: "Vai trò",
    status: "Trạng thái",
    roles: {
      owner: "Quản trị viên",
      member: "Thành viên",
      viewer: "Người xem",
    },
    roleHints: {
      member: {
        does: "Quay vào không gian làm việc này.",
        costs: "Một suất dùng trả phí ở gói Light và Pro.",
      },
      viewer: {
        does: "Xem và bình luận.",
        costs: "Luôn miễn phí.",
      },
    },
    statuses: {
      active: "Đang hoạt động",
      invited: "Đã mời",
    },
    seatSummary: {
      members: "other:{n} thành viên",
      viewers: "other:{n} người xem",
      paidSeats: "other:{n} suất dùng trả phí",
      membersAndViewers: "{members} và {viewers}",
      onPaidSeats:
        "{people} với {seats}. Mỗi thành viên là một suất dùng; người xem miễn phí.",
      membersFree: "{people}. Thành viên được miễn phí trong gói này.",
      freePlan:
        "{people}. Gói Miễn phí: mỗi thành viên có {recordings} bản ghi, mỗi bản tối đa {minutes} phút; người xem có thể xem và bình luận.",
      planTitle: "Gói {plan}",
      paidPlanTitle: "Gói trả phí",
      freePlanTitle: "Gói Miễn phí",
      upgrade: "Nâng cấp không gian làm việc",
    },
    table: {
      intro: "Thành viên quay ở đây; người xem thì xem và bình luận.",
      ownerIntro: "Là chủ sở hữu, bạn có thể mời, gỡ và đổi vai trò.",
      searchPlaceholder: "Tên hoặc địa chỉ email",
      searchLabel: "Tìm thành viên",
      allRoles: "Tất cả vai trò",
      everyone: "Mọi người",
      columns: {
        name: "Tên",
        dateAdded: "Ngày thêm",
        email: "Địa chỉ email",
        actions: "Thao tác",
      },
      empty: "Không ai khớp với các bộ lọc này.",
      downgradeNote: "Người xem từ ngày {date} · {keep}",
      keepAsMember: "Giữ làm thành viên",
      revoke: "Thu hồi",
    },
    seatRequests: {
      title: "Yêu cầu suất dùng",
      description:
        "Những người xem này đã yêu cầu quyền quay. Khi được phê duyệt, họ trở thành thành viên.",
      descriptionPaid:
        "Những người xem này đã yêu cầu quyền quay. Khi được phê duyệt, họ trở thành thành viên và thêm một suất dùng trả phí.",
      asked: "{email} · yêu cầu ngày {date}",
      deny: "Từ chối",
      approve: "Phê duyệt",
    },
    seatConfirm: {
      addTitle: "Cấp cho {name} một suất dùng trả phí?",
      addBody:
        "Thành viên có quyền quay nên mỗi người là một suất dùng trả phí. Gói {plan} của bạn tăng từ {seats} lên {nextSeats} suất dùng, từ {before} lên {after} mỗi tháng.",
      addBodyYearly:
        "Thành viên có quyền quay nên mỗi người là một suất dùng trả phí. Gói {plan} của bạn tăng từ {seats} lên {nextSeats} suất dùng, từ {before} lên {after} mỗi tháng, thanh toán theo năm.",
      addInvoice:
        "Phần còn lại của kỳ thanh toán này sẽ được cộng vào hóa đơn tiếp theo của bạn.",
      addConfirm: "Thêm suất dùng trả phí",
      removeTitle: "Chuyển {name} sang người xem?",
      removeBody:
        "{name} vẫn quay được đến ngày {date}, ngày kết thúc kỳ bạn đã thanh toán. Sau đó họ trở thành người xem, có thể xem và bình luận nhưng không quay được.",
      removePlan:
        "Từ lúc đó, gói {plan} của bạn giảm từ {seats} xuống {nextSeats} suất dùng, từ {before} xuống {after} mỗi tháng.",
      removePlanYearly:
        "Từ lúc đó, gói {plan} của bạn giảm từ {seats} xuống {nextSeats} suất dùng, từ {before} xuống {after} mỗi tháng, thanh toán theo năm.",
      removeConfirm: "Chuyển sang người xem",
    },
    remove: {
      label: "Gỡ {name} khỏi không gian làm việc",
      title: "Gỡ {name} khỏi {workspace}?",
      body: "Họ mất quyền truy cập ngay lập tức. Bản ghi và ảnh chụp màn hình của họ vẫn ở lại trong không gian làm việc.",
      freesSeat:
        "Việc này giải phóng suất dùng trả phí của họ: gói của bạn giảm từ {seats} xuống {nextSeats} suất dùng.",
    },
    leave: {
      button: "Rời đi",
      title: "Rời khỏi {workspace}?",
      body: "Bạn sẽ mất quyền truy cập vào các bản ghi và ảnh chụp màn hình ở đó. Mọi thứ bạn đã quay ở đó vẫn ở lại trong không gian làm việc.",
      comeBack: "Để quay lại, phải có người mời bạn lần nữa.",
      confirm: "Rời khỏi không gian làm việc",
    },
    invite: {
      trigger: "Mời thành viên",
      title: "Mời thành viên vào {workspace}",
      titleOwnWorkspace: "Mời thành viên vào không gian làm việc của bạn",
      description:
        "Họ sẽ nhận được email có liên kết hết hạn sau 7 ngày. Hãy đảm bảo họ đăng nhập bằng đúng địa chỉ đó.",
      removeEmail: "Gỡ {email}",
      addEmails: "Thêm email",
      separatorHint:
        "Phân tách các email bằng dấu cách, dấu phẩy hoặc phím Enter.",
      paidSeatNote:
        "Mỗi thành viên chấp nhận sẽ thêm một suất dùng trả phí vào gói {plan} của bạn, {price} mỗi tháng cho mỗi suất. Phần còn lại của kỳ này sẽ được tính vào hóa đơn tiếp theo của bạn.",
      noEmails: "Hãy thêm ít nhất một email",
      invalidEmails: "Email không hợp lệ: {emails}",
      failed: "Thất bại",
      sent: "other:Đã gửi {n} lời mời.",
      sending: "Đang gửi…",
      submit: "Gửi lời mời",
    },
    actions: {
      emailRequired: "Hãy nhập địa chỉ email",
      emailInvalid: "Email này có vẻ không hợp lệ",
      ownWorkspace: "Bạn đã ở trong không gian làm việc của chính mình",
      alreadyMember: "Người này đã là thành viên của không gian làm việc này",
      emailNotSent:
        "Đã tạo lời mời nhưng không gửi được email. Hãy sao chép liên kết từ danh sách đang chờ.",
      invitationSent: "Đã gửi lời mời đến {email}",
      alreadyRecording: "Bạn đã có thể quay ở đây",
    },
  },
  settings: {
    saved: "Đã lưu",
    errors: {
      ownerOnly: "Chỉ chủ sở hữu không gian làm việc mới thay đổi được mục này",
      databaseUnavailable: "Cơ sở dữ liệu không khả dụng",
      saveFailed: "Không lưu được, hãy thử lại",
    },
    upload: {
      uploading: "Đang tải lên…",
      missing: "Hãy chọn một tệp hình ảnh",
      failed: "Tải lên thất bại",
      failedReason: "Tải lên thất bại: {reason}",
    },
    personal: {
      title: "Cài đặt cá nhân",
      account: {
        title: "Tài khoản",
        description:
          "Cách bạn hiển thị với đồng đội và với những người xem bản ghi của bạn.",
      },
      preferences: {
        title: "Tùy chọn",
        description: "Giao diện và ngôn ngữ của CaptureFlow dành cho bạn.",
      },
      languageDescription: "Ngôn ngữ CaptureFlow hiển thị cho bạn.",
    },
    avatar: {
      label: "Ảnh đại diện",
      change: "Đổi ảnh đại diện",
      removing: "Đang gỡ…",
      hint: "JPG, PNG, WebP hoặc GIF. Tối đa 2 MB.",
      tooLarge: "Ảnh đại diện phải từ 2 MB trở xuống",
      badType: "Ảnh đại diện phải là PNG, JPEG, WebP hoặc GIF",
    },
    account: {
      name: {
        label: "Họ và tên",
        placeholder: "Tên của bạn",
        description:
          "Hiển thị trên bản ghi, ảnh chụp màn hình và các dòng hoạt động.",
        required: "Vui lòng nhập tên.",
        updateFailed: "Không cập nhật được tên.",
      },
      email: {
        label: "Địa chỉ email",
        description: "Dùng để đăng nhập. Liên hệ hỗ trợ để thay đổi.",
      },
      userId: {
        label: "ID người dùng",
        copy: "Sao chép ID người dùng",
        description: "Hãy cung cấp ID này khi liên hệ hỗ trợ.",
      },
      saveChanges: "Lưu thay đổi",
    },
    workspace: {
      title: "Cài đặt không gian làm việc",
      tabs: {
        label: "Các mục cài đặt",
        general: "Chung",
        security: "Bảo mật",
      },
      general: {
        title: "Chung",
        description:
          "Tên và logo nhận diện không gian làm việc này trong trình chuyển không gian làm việc, trên trang thành viên và trên bản xem trước khi chia sẻ.",
      },
      name: {
        title: "Tên không gian làm việc",
        description: "Tên hiển thị cho không gian làm việc của bạn.",
        empty: "Tên không gian làm việc không được để trống",
        tooLong: "Tên không gian làm việc quá dài (tối đa {max} ký tự)",
      },
      logo: {
        title: "Logo không gian làm việc",
        description:
          "Hiển thị bên cạnh tên không gian làm việc của bạn. PNG, JPEG, WebP, GIF hoặc SVG, tối đa 2 MB.",
        upload: "Tải logo lên",
        replace: "Thay logo",
        tooLarge: "Logo phải từ 2 MB trở xuống",
        badType: "Logo phải là PNG, JPEG, WebP, GIF hoặc SVG",
      },
      permissions: {
        title: "Quyền mặc định",
        description:
          "Cài đặt áp dụng cho mọi bản ghi và ảnh chụp màn hình mới trong không gian làm việc.",
      },
      recordingAccess: {
        title: "Quyền quay",
        description:
          "Quyết định xem đồng đội có được đăng bản ghi và ảnh chụp màn hình vào không gian làm việc này hay không.",
        allow: {
          title: "Cho phép đồng đội đăng ở đây",
          body: "Thành viên có thể quay vào không gian làm việc này.",
        },
        ownerOnly: {
          title: "Chỉ chủ sở hữu không gian làm việc",
          body: "Nội dung đồng đội tải lên sẽ vào không gian làm việc cá nhân của họ.",
        },
      },
    },
    devices: {
      title: "Thiết bị đã kết nối",
      count: "other:{n} thiết bị đã đăng nhập",
      empty:
        "Chưa có thiết bị nào được kết nối. Hãy mở ứng dụng máy tính CaptureFlow và nhấn Sign in trên thanh quay để liên kết tài khoản này.",
      unlabelled: "Thiết bị chưa đặt tên",
      added: "Đã thêm ngày {date}",
      addedLastUsed: "Đã thêm ngày {date} · dùng lần cuối ngày {lastUsed}",
      neverUsed: "Chưa từng dùng",
      revoke: {
        action: "Thu hồi",
        title: "Đăng xuất thiết bị này?",
        description: "Thiết bị sẽ phải đăng nhập lại để quản lý bản ghi.",
      },
    },
  },
  billing: {
    chargedInUsd: "Thanh toán bằng đô la Mỹ.",
    shownIn: "Giá hiển thị bằng {currency}. Bạn được tính phí bằng đô la Mỹ.",
    page: {
      title: "Thanh toán",
      subtitle: "Gói của bạn và mức bạn đã sử dụng.",
      workspaceLabel: "Không gian làm việc · {name}",
      manageSubscription: "Quản lý gói đăng ký",
      upgradeWorkspace: "Nâng cấp không gian làm việc",
      storage: "Dung lượng không gian làm việc",
      usedOfLimit: "{used} trên {limit}",
      usedNoLimit: "{used}, không giới hạn",
    },
    loading: {
      plan: "Gói",
      usage: "Mức sử dụng",
    },
    counts: {
      members: "other:{n} thành viên",
      paidSeats: "other:{n} suất dùng trả phí",
      freeViewers: "other:{n} người xem miễn phí",
    },
    plan: {
      free: "Miễn phí",
      paid: "Trả phí",
      billedMonthly: "Thanh toán theo tháng",
      billedYearly: "Thanh toán theo năm",
      freeSummary:
        "{members} · tối đa {recordings} bản ghi mỗi người, mỗi bản {minutes} phút, chất lượng tiết kiệm dữ liệu",
    },
    status: {
      onTrial: "Dùng thử",
      active: "Đang hoạt động",
      paused: "Tạm dừng",
      pastDue: "Thanh toán thất bại",
      unpaid: "Chưa thanh toán",
      cancelled: "Đã hủy",
      expired: "Đã hết hạn",
    },
    details: {
      youPay: "Bạn trả",
      amountPerMonth: "{amount} mỗi tháng",
      amountPerYear: "{amount} mỗi năm",
      seatsMonthly: "other:{n} suất dùng × {price} mỗi tháng",
      seatsYearly:
        "other:{n} suất dùng × {price} mỗi tháng, {total} mỗi tháng, thanh toán theo năm",
      nextPayment: "Lần thanh toán tiếp theo",
      ends: "Kết thúc",
      endOfPeriod: "Vào cuối kỳ này",
      amountOnDate: "{amount} vào ngày {date}",
      firstPaymentPending: "Khi khoản thanh toán đầu tiên hoàn tất",
      estimate: "{base} · {change}, ước tính",
      baseForSeats: "other:{amount} cho {n} suất dùng",
      seatsAdded: "other:{amount} cho {n} suất dùng đã thêm trong kỳ này",
      seatsRemoved:
        "other:{amount} khấu trừ cho {n} suất dùng đã gỡ trong kỳ này",
      seatChanges: "{amount} cho các thay đổi suất dùng trong kỳ này",
      seats: "Suất dùng",
      seatsAndViewers: "{seats}, {viewers}",
      billedTo: "Xuất hóa đơn cho",
      paymentMethod: "Phương thức thanh toán",
      cardEnding: "{brand} có số cuối {last4}",
      card: "Thẻ",
      updateCard: "Cập nhật",
    },
    switchPlan: {
      switchTo: "Chuyển sang {plan}",
      title: "Chuyển sang {plan}?",
      priceMonthly:
        "other:{n} suất dùng của bạn đổi từ {before} thành {after} mỗi tháng.",
      priceYearly:
        "other:{n} suất dùng của bạn đổi từ {before} thành {after} mỗi tháng, thanh toán theo năm.",
      benefits:
        "{plan} quay ở mọi chất lượng, tối đa 60 fps, và có thêm chỉnh sửa bằng AI.",
      timing:
        "Gói bắt đầu ngay. Khoản chênh lệch cho phần còn lại của kỳ thanh toán này sẽ được cộng vào hóa đơn tiếp theo của bạn.",
      errors: {
        failed: "Không đổi được gói",
        unknownPlan: "Gói không xác định",
        billingUnavailable: "Thanh toán không khả dụng",
        noSubscription:
          "Không gian làm việc này không có gói đăng ký đang hoạt động",
        cancelled: "Hãy tiếp tục gói đăng ký trước khi đổi gói",
        unavailable: "Hiện chưa thể đổi gói",
        rejected: "Hệ thống thanh toán không chấp nhận thay đổi. Hãy thử lại.",
      },
    },
    upgrade: {
      title: "Nâng cấp {name}",
      billingCycle: "Chu kỳ thanh toán",
      cycles: {
        monthly: "Theo tháng",
        annual: "Theo năm",
      },
      annualSaving: "tiết kiệm {percent}%",
      seatPicker: {
        title: "Ai có suất dùng trả phí",
        selected: "{seats} trên {total}",
        description:
          "Những người được đánh dấu sẽ quay được và bị tính phí. Những người còn lại là người xem miễn phí, có thể xem, bình luận và thả cảm xúc nhưng không quay được. Vai trò thay đổi khi bạn nâng cấp.",
        selectAll: "Chọn tất cả",
        clear: "Bỏ chọn",
        you: "(bạn)",
        paidSeat: "Suất dùng trả phí",
        viewer: "Người xem",
      },
      perMonth: "mỗi tháng",
      seatsPrice: "other:{n} suất dùng × {price}",
      viewersFree: "other:{n} người xem miễn phí",
      priceWithViewers: "{seats}, {viewers}",
      priceYearly: "{seats}, thanh toán theo năm",
      priceWithViewersYearly: "{seats}, {viewers}, thanh toán theo năm",
      upgradeTo: "Nâng cấp lên {plan}",
      checkoutUnavailable: "Chưa cấu hình thanh toán",
    },
    requestSeat: {
      request: "Yêu cầu quyền quay",
      requested: "Đã yêu cầu suất dùng",
      hint: "Bạn là người xem ở đây. Hãy xin chủ sở hữu một suất dùng trả phí để bạn có thể quay.",
      requestedHint:
        "Đã gửi yêu cầu đến chủ sở hữu. Bạn sẽ quay được khi họ phê duyệt.",
      failed: "Không gửi được yêu cầu",
    },
  },
  actions: {
    missingSlug: "Thiếu slug",
    recordingNotFound: "Không tìm thấy bản ghi",
    invalidVisibility: "Chế độ hiển thị không hợp lệ",
    deleteVideoFailed: "Không xóa được tệp video: {reason}",
    transcriptNotFound: "Không tìm thấy bản chép lời",
    transcriptEmpty:
      "Bản chép lời không được để trống. Thay vào đó, hãy đặt lại.",
    missingTokenId: "Thiếu ID token",
    tokenNotFound: "Không tìm thấy token",
    missingScreenshotId: "Thiếu ID ảnh chụp màn hình",
    screenshotNotFound: "Không tìm thấy ảnh chụp màn hình",
    missingImageBytes: "Thiếu dữ liệu hình ảnh",
    screenshotTooLarge:
      "Ảnh chụp màn hình đã chỉnh sửa vượt quá giới hạn dung lượng cho mỗi ảnh.",
    saveScreenshotFailed: "Không lưu được ảnh chụp màn hình: {reason}",
    saveFailed: "Lưu thất bại: {reason}",
    invalidCanvasDimensions: "Lưu thất bại: kích thước canvas không hợp lệ",
  },
  viewer: {
    meta: {
      defaultTitle: "Bản ghi {product}",
      defaultDescription: "Bản ghi màn hình được chia sẻ từ {product}.",
      preparingTitle: "Đang chuẩn bị bản ghi… — {product}",
      notFoundTitle: "Không tìm thấy",
      description:
        "Bản ghi màn hình được chia sẻ từ {product}. Xem ngay trên trình duyệt, không cần đăng ký.",
      descriptionTimed:
        "Bản ghi màn hình dài {duration} được chia sẻ từ {product}. Xem ngay trên trình duyệt, không cần đăng ký.",
    },
    loading: "Đang tải bản ghi…",
    nav: {
      download: "Tải xuống",
    },
    authPrompt: {
      pricing: "Bảng giá",
      logIn: "Đăng nhập",
      getStarted: "Bắt đầu",
      getFree: "Dùng {product} miễn phí",
    },
    postedBy: {
      label: "Đăng bởi",
      someone: "Ai đó",
    },
    views: {
      count: "other:{count} lượt xem",
      showWhoWatched: "{views}, hiện những người đã xem",
      viewers: "Người xem",
      emptyTitle: "Chưa có lượt xem",
      emptyDescription: "Hãy chia sẻ liên kết, những người xem sẽ hiện ở đây.",
      signedInViewer: "Người xem đã đăng nhập",
      anonymous: "Ẩn danh",
    },
    actions: {
      share: "Chia sẻ",
      visibilityFailed: "Không cập nhật được chế độ hiển thị",
      deleteFailed: "Không xóa được bản ghi",
    },
    requestAccess: {
      title: "Yêu cầu quyền truy cập để xem video này",
      notSharedBy: "{name} chưa chia sẻ bản ghi này với bạn.",
      notSharedByOwner: "Chủ sở hữu chưa chia sẻ bản ghi này với bạn.",
      signInHint:
        "Hãy đăng nhập bằng email công việc: nếu bạn đã ở trong nhóm của chủ sở hữu, bạn sẽ được vào ngay.",
      signIn: "Đăng nhập để tiếp tục",
      sentTitle: "Đã gửi yêu cầu",
      sentDescription:
        "Chúng tôi đã báo cho chủ sở hữu. Bạn sẽ nhận được email nếu họ cấp quyền truy cập.",
      askingAs: "Yêu cầu bằng {email}",
      noteLabel: "Thêm ghi chú {optional}",
      noteOptional: "(không bắt buộc)",
      notePlaceholder:
        "Chào bạn, mình muốn xem bản ghi này từ buổi họp đánh giá hôm qua.",
      sending: "Đang gửi…",
      submit: "Yêu cầu quyền truy cập",
      failed: "Đã xảy ra lỗi. Hãy thử lại sau giây lát.",
    },
    pending: {
      preparingTitle: "Đang chuẩn bị bản ghi của bạn…",
      preparingDescription:
        "Quá trình tải lên vẫn đang hoàn tất. Trang này sẽ tự làm mới khi bản ghi sẵn sàng.",
      generatingTitle: "Đang tạo video của bạn…",
      generatingDescription:
        "Có thể mất một hai phút. Trang sẽ tự làm mới khi video sẵn sàng.",
      failedTitle: "Bản ghi này chưa tải lên xong",
      failedDescription:
        "Liên kết đã được tạo nhưng video không đến nơi. Hãy thử lại liên kết sau một phút, hoặc quay một bản mới.",
      comment: "Bình luận",
    },
    upgradeBanner: {
      message:
        "{usage} ở gói Miễn phí. Nâng cấp để quay không giới hạn với chất lượng đầy đủ.",
      usage: "other:Đã dùng {used} trên {n} bản ghi",
    },
    editPanel: {
      editTitle: "Chỉnh sửa video",
      editDescription:
        "Cắt gọn, cắt bỏ, đổi giao diện và sửa bản chép lời trong trình chỉnh sửa.",
      downloadTitle: "Tải video xuống",
      downloadDescription: "Toàn bộ bản ghi ở dạng MP4.",
      copyEmbed: "Sao chép mã nhúng",
      embedCopied: "Đã sao chép mã nhúng",
      embedDescription: "Dán trình phát vào bất kỳ trang web nào.",
    },
    notFound: {
      title: "Không tìm thấy bản ghi",
      description:
        "Liên kết này đã hết hạn hoặc chưa từng tồn tại. Bản ghi của tài khoản miễn phí được lưu 30 ngày kể từ lần xem gần nhất.",
      madeWith: "Tạo bằng {product}",
    },
  },
  activity: {
    sidebar: {
      label: "Thanh bên bản ghi",
      activityTab: "Hoạt động",
      transcriptTab: "Bản chép lời",
      toolsTab: "Công cụ",
    },
    you: "Bạn",
    anonymous: "Ẩn danh",
    jumpToMoment: "Chuyển đến thời điểm này",
    empty: {
      title: "Chưa có hoạt động",
      description:
        "Cảm xúc và bình luận của người xem sẽ hiện ở đây ngay khi có.",
      firstTitle: "Hãy là người đầu tiên bình luận",
      firstTitleNamed: "{name}, hãy là người đầu tiên bình luận",
      hint: "Nhấn {key} để trả lời hoặc để lại bình luận ở cuối bảng này.",
      focusComposer: "Đặt con trỏ vào ô bình luận",
    },
    composer: {
      signIn: "Đăng nhập để thả cảm xúc và bình luận",
      placeholder: "Để lại bình luận…",
      mention: "Nhắc đến ai đó",
      noOneToMention: "Chưa ai thả cảm xúc hoặc bình luận",
      insertEmoji: "Chèn emoji",
      searchEmoji: "Tìm emoji",
      posting: "Đang đăng…",
      submitAt: "Bình luận tại {time}",
      postFailed: "Không đăng được bình luận",
    },
    comment: {
      delete: "Xóa bình luận",
      deleteFailed: "Không xóa được bình luận",
    },
    reaction: {
      count: "other:{n} cảm xúc",
      delete: "Xóa cảm xúc",
      deleteMany: "other:Xóa {n} cảm xúc",
      deleteFailed: "Không xóa được cảm xúc",
    },
    transcript: {
      pendingTitle: "Đang chép lời…",
      pendingDescription: "Bản chép lời sẽ hiện ở đây ngay khi sẵn sàng.",
      failedTitle: "Chép lời chưa hoàn tất",
      failedDescription: "Đã xảy ra lỗi khi chép lời bản ghi này.",
      noneTitle: "Không có bản chép lời",
      noneOwnerDescription:
        "Hãy quay với micrô bật và bản chép lời sẽ được viết cho bạn.",
      noneViewerDescription: "Bản ghi này được quay không có micrô.",
      searchLabel: "Tìm trong bản chép lời",
      noMatches: "Không có kết quả phù hợp.",
    },
    saveFailed: "Không lưu được. Hãy thử lại.",
    summary: {
      title: "Tóm tắt",
      add: "Thêm",
      placeholder: "Bản ghi này có nội dung gì?",
      empty: "Chưa có tóm tắt.",
      emptyAction: "Thêm tóm tắt",
    },
    chapters: {
      title: "Chương",
      count: "other:{n} chương",
      addAtPlayhead: "Thêm tại đầu phát",
      defaultTitle: "Chương {n}",
      editHint: "Mỗi dòng một chương, theo dạng {short} hoặc {long}.",
      editHintShort: "M:SS Tiêu đề",
      editHintLong: "H:MM:SS Tiêu đề",
      editPlaceholder: "0:00 Giới thiệu\n0:30 Demo\n1:20 Tổng kết",
      playing: "Đang phát",
      remove: "Gỡ chương",
      empty: "Chưa có chương.",
      emptyAction: "Thêm một chương tại đầu phát",
    },
  },
  player: {
    overlay: {
      watchAgain: "Xem lại",
    },
    captions: {
      track: "Phụ đề",
      size: "Kích thước",
      position: "Vị trí",
      sizes: {
        small: "Nhỏ",
        medium: "Vừa",
        large: "Lớn",
      },
      positions: {
        top: "Trên",
        bottom: "Dưới",
      },
    },
    reactionBar: {
      comment: "Bình luận",
      leaveComment: "Để lại bình luận",
    },
    reactions: {
      heart: "Trái tim",
      thumbsUp: "Giơ ngón cái",
      fire: "Lửa",
      clap: "Vỗ tay",
      raisedHands: "Giơ hai tay",
      eyes: "Đôi mắt",
    },
    embed: {
      title: "Bản ghi {product}",
    },
    controls: {
      buttons: {
        play: "Phát",
        pause: "Tạm dừng",
        replay: "Phát lại",
        mute: "Tắt tiếng",
        unmute: "Bật tiếng",
      },
      seek: {
        forward: "Tua tới {seconds} giây",
        backward: "Tua lùi {seconds} giây",
      },
      fullscreen: {
        enter: "Mở toàn màn hình",
        exit: "Thoát toàn màn hình",
      },
      captions: {
        enable: "Bật phụ đề",
        disable: "Tắt phụ đề",
      },
      pip: {
        enter: "Bật hình trong hình",
        exit: "Thoát hình trong hình",
      },
      cast: {
        start: "Bắt đầu truyền",
        stop: "Dừng truyền",
        connecting: "Đang kết nối",
      },
      airplay: {
        start: "Bắt đầu AirPlay",
        stop: "Dừng AirPlay",
      },
      slider: {
        seek: "Tua",
      },
      time: {
        current: "Thời gian hiện tại",
        duration: "Thời lượng",
        position: "{current} trên {duration}",
        unknown: "Chưa tải nội dung, không rõ thời gian.",
      },
      playback: {
        rate: "Tốc độ phát {rate}",
      },
      volume: {
        mutedValue: "{percent}, đã tắt tiếng",
        muted: "Đã tắt tiếng",
        label: "Âm lượng",
        value: "Âm lượng {value}",
      },
      status: {
        captionsOn: "Đã bật phụ đề",
        captionsOff: "Đã tắt phụ đề",
        paused: "Đã tạm dừng",
        playing: "Đang phát",
        fullscreen: "Toàn màn hình",
        pip: "Hình trong hình",
        exitPip: "Thoát hình trong hình",
        seekedTo: "Đã tua đến {time}",
      },
      container: {
        label: "Trình phát đa phương tiện",
      },
      errors: {
        aborted: "Bạn đã dừng phát trước khi nội dung kết thúc.",
        network: "Không tải được nội dung này do sự cố mạng hoặc máy chủ.",
        decode:
          "Không phát được nội dung này. Tệp có thể bị hỏng, hoặc trình duyệt của bạn không hỗ trợ định dạng này.",
        source:
          "Không tải được nội dung này. Nội dung có thể không khả dụng, hoặc trình duyệt của bạn không hỗ trợ định dạng này.",
        encrypted: "Không phát được nội dung này vì không giải mã được.",
        unplayable: "Trình phát không hỗ trợ nội dung này.",
        title: "Đã xảy ra lỗi.",
        unexpected: "Đã xảy ra lỗi không mong muốn.",
      },
      common: {
        ok: "OK",
      },
      menu: {
        settings: "Cài đặt",
        quality: "Chất lượng",
        audio: "Âm thanh",
        speed: "Tốc độ",
        captions: "Phụ đề",
        playbackRate: "Tốc độ phát",
        off: "Tắt",
        auto: "Tự động",
        autoWithLabel: "Tự động ({label})",
      },
    },
  },
  screenshotView: {
    page: {
      defaultTitle: "Ảnh chụp màn hình {product}",
      description: "Ảnh chụp màn hình được chia sẻ từ {product}.",
      madeWith: "Tạo bằng {product}",
      loading: "Đang tải ảnh chụp màn hình…",
    },
    authPrompt: {
      pricing: "Bảng giá",
      logIn: "Đăng nhập",
      getStarted: "Bắt đầu",
      getFree: "Dùng {product} miễn phí",
    },
    actions: {
      edit: "Chỉnh sửa ảnh chụp màn hình",
      share: "Chia sẻ",
      shareTitle: "Chia sẻ ảnh chụp màn hình",
      copyLink: "Sao chép liên kết",
      linkCopied: "Đã sao chép liên kết",
      more: "Thao tác khác",
      delete: "Xóa ảnh chụp màn hình",
      deleteTitle: "Xóa ảnh chụp màn hình này?",
      deleteDescription:
        "Hình ảnh và liên kết của nó sẽ ngừng hoạt động ngay lập tức. Không thể hoàn tác thao tác này.",
      visibilityFailed: "Không cập nhật được chế độ hiển thị",
      deleteFailed: "Không xóa được ảnh chụp màn hình",
    },
    zoom: {
      expand: "Phóng to hình ảnh",
      minimize: "Thu nhỏ hình ảnh",
    },
    requestAccess: {
      title: "Yêu cầu quyền truy cập để xem ảnh chụp màn hình này",
      notSharedBy: "{name} chưa chia sẻ ảnh chụp màn hình này với bạn.",
      notSharedByOwner:
        "Chủ sở hữu chưa chia sẻ ảnh chụp màn hình này với bạn.",
      signInHint:
        "Hãy đăng nhập bằng email công việc: nếu bạn đã ở trong nhóm của chủ sở hữu, bạn sẽ được vào ngay.",
      signIn: "Đăng nhập để tiếp tục",
      sentTitle: "Đã gửi yêu cầu",
      sentDescription:
        "Chúng tôi đã báo cho chủ sở hữu. Bạn sẽ nhận được email nếu họ cấp quyền truy cập.",
      askingAs: "Yêu cầu bằng {email}",
      noteLabel: "Thêm ghi chú {optional}",
      noteOptional: "(không bắt buộc)",
      notePlaceholder:
        "Chào bạn, mình muốn xin một bản ảnh chụp màn hình này từ buổi duyệt thiết kế.",
      sending: "Đang gửi…",
      submit: "Yêu cầu quyền truy cập",
      failed: "Đã xảy ra lỗi. Hãy thử lại sau giây lát.",
    },
    notFound: {
      title: "Không tìm thấy ảnh chụp màn hình",
      description:
        "Liên kết này đã hết hạn hoặc chưa từng tồn tại. Ảnh chụp màn hình của tài khoản miễn phí được lưu 30 ngày kể từ lần xem gần nhất.",
    },
  },
  recordingEditor: {
    skeleton: {
      label: "Đang mở trình chỉnh sửa",
      status: "Đang mở trình chỉnh sửa…",
    },
    preparing: {
      title: "Đang chuẩn bị bản ghi…",
      description:
        "Bản ghi vẫn đang tải lên. Trang này sẽ tự động làm mới khi bản ghi sẵn sàng.",
    },
    failed: {
      title: "Tải bản ghi lên thất bại.",
      description: "Hãy thử quay lần nữa từ ứng dụng máy tính.",
    },
    saveFailed: "Không lưu được",
    topBar: {
      back: "Quay lại bản ghi",
      status: {
        idle: "Chỉnh sửa được lưu tự động",
        saved: "Đã lưu",
        error: "Không lưu được",
      },
      versionHistory: "Lịch sử phiên bản (sắp ra mắt)",
      undo: "Hoàn tác",
      undoShortcut: "Hoàn tác ({key})",
      redo: "Làm lại",
      redoShortcut: "Làm lại ({key})",
      finish: "Hoàn tất",
    },
    panels: {
      label: "Các bảng của trình chỉnh sửa",
      tabs: {
        transcript: "Bản chép lời",
        design: "Thiết kế",
        details: "Chi tiết",
      },
      hide: {
        transcript: "Ẩn bản chép lời",
        design: "Ẩn thiết kế",
        details: "Ẩn chi tiết",
      },
      show: {
        transcript: "Hiện bản chép lời",
        design: "Hiện thiết kế",
        details: "Hiện chi tiết",
      },
    },
    toggleOn: "Bật",
    background: {
      title: "Nền",
      gradients: "Chuyển màu",
      none: "Không",
      noBackground: "Không có nền",
      solid: "Màu trơn",
      solidColor: "Màu trơn {color}",
      customColor: "Chọn màu tùy chỉnh",
      showLess: "Thu gọn",
      seeMore: "Xem thêm",
      presets: {
        violet: "Tím",
        sunset: "Hoàng hôn",
        orchid: "Hoa lan",
        forest: "Rừng",
        flamingo: "Hồng hạc",
        citrus: "Cam chanh",
        arctic: "Bắc Cực",
        ocean: "Đại dương",
        deep: "Sâu thẳm",
        ember: "Than hồng",
        mint: "Bạc hà",
        dusk: "Chạng vạng",
        peach: "Đào",
        midnight: "Nửa đêm",
        slate: "Xám đá",
      },
    },
    camera: {
      title: "Camera",
      show: "Hiện camera",
      hidden: "Đã ẩn",
      position: "Vị trí",
      positionHint: "Kéo chấm hoặc nhấn vào một góc",
      positionHintHidden: "Hãy hiện camera để đặt vị trí.",
      corners: {
        topLeft: "Trên bên trái",
        topRight: "Trên bên phải",
        bottomLeft: "Dưới bên trái",
        bottomRight: "Dưới bên phải",
      },
      size: "Kích thước",
      sizes: {
        small: "Nhỏ",
        medium: "Vừa",
        large: "Lớn",
      },
    },
    audio: {
      title: "Âm thanh",
      systemSound: "Âm thanh hệ thống",
      sound: "Âm thanh",
      microphone: "Micrô",
      muted: "Đã tắt tiếng",
      sharedTrack:
        "Micrô và âm thanh hệ thống dùng chung một rãnh âm thanh trong bản ghi này.",
    },
    details: {
      title: "Bản ghi",
      link: "Liên kết",
      size: "Dung lượng",
      duration: "Thời lượng",
      views: "Lượt xem",
      created: "Ngày tạo",
    },
    transcript: {
      transcribing: "Đang chép lời…",
      unavailable: "Không có bản chép lời",
      pendingHint: "Hãy tải lại trang này sau một phút để chỉnh sửa.",
      failedHint: "Chép lời chưa hoàn tất cho bản ghi này.",
      missingHint:
        "Hãy quay với micrô bật và bản chép lời sẽ được viết cho bạn.",
      deleteWord: "Xóa từ",
      deleteWords: "other:Xóa {n} từ",
      clearSelection: "Bỏ chọn",
      hint: "Nhấn vào một từ hoặc kéo qua nhiều từ để chọn, nhấn đúp để sửa văn bản.",
      resetEdits: "Đặt lại chỉnh sửa",
      editLine: "Chỉnh sửa dòng chép lời",
      selectLine: "Chọn dòng tại {time}",
      restore: "Khôi phục",
      saveFailed: "Không lưu được",
      resetFailed: "Không đặt lại được",
    },
    timeline: {
      hideWaveform: "Ẩn dạng sóng",
      showWaveform: "Hiện dạng sóng",
      loadingAudio: "Đang tải âm thanh…",
      deleteSelection: "Xóa vùng chọn",
      deleteSelectionHint:
        "Chọn các từ trong bản chép lời, hoặc tách dòng thời gian rồi chọn một đoạn",
      splitAt: "Tách tại {time}",
      splitHint: "Trước tiên hãy phát hoặc tua đến một thời điểm",
      comingSoon: "Sắp ra mắt",
      fit: "Vừa khít",
      zoomOut: "Thu nhỏ",
      zoom: "Thu phóng dòng thời gian",
      zoomIn: "Phóng to",
      seek: "Tua",
      trimStart: "Cắt gọn phần đầu clip",
      trimEnd: "Cắt gọn phần cuối clip",
      removeSplit: "Gỡ điểm tách tại {time}",
    },
  },
  screenshotEditor: {
    loading: "Đang tải trình chỉnh sửa…",
    imageError: {
      decode: "Không giải mã được ảnh chụp màn hình.",
      fetch:
        "Không tải được ảnh chụp màn hình. Bucket có thể đã mất quyền truy cập CORS.",
    },
    header: {
      back: "Quay lại ảnh chụp màn hình",
      reset: "Đặt lại chỉnh sửa",
      undo: "Hoàn tác",
      undoTooltip: "Hoàn tác ({key})",
      redo: "Làm lại",
      redoTooltip: "Làm lại ({key})",
      finish: "Hoàn tất",
    },
    saveError: {
      notMounted: "Trình chỉnh sửa chưa được gắn",
      noCanvas: "Không lấy được canvas xuất",
      workerCrashed: "Worker mã hóa PNG gặp sự cố",
    },
    tools: {
      text: "Văn bản",
      rect: "Hình chữ nhật",
      arrow: "Mũi tên",
      background: "Nền",
    },
    background: {
      title: "Thêm nền",
      close: "Đóng bảng chọn nền",
      none: "Không",
      gradients: {
        violet: "Tím",
        sunset: "Hoàng hôn",
        orchid: "Hoa lan",
        forest: "Rừng",
        flamingo: "Hồng hạc",
        citrus: "Cam chanh",
        arctic: "Bắc Cực",
        ocean: "Đại dương",
        deep: "Sâu thẳm",
      },
      solid: "Màu trơn {color}",
      custom: "Chọn màu tùy chỉnh",
    },
    inspector: {
      color: "Màu {color}",
      size: "{n}px",
      duplicate: "Nhân bản",
    },
    textPrompt: "Văn bản",
  },
  canvas: {
    meta: {
      title: "Canvas",
      description: "Một bảng trống để vẽ trong lúc quay.",
    },
    loading: "Đang tải canvas…",
    tools: {
      select: "Chọn",
      hand: "Bàn tay",
      pen: "Bút",
      highlighter: "Bút dạ quang",
      rect: "Hình chữ nhật",
      ellipse: "Hình elip",
      arrow: "Mũi tên",
      line: "Đường thẳng",
      text: "Văn bản",
      eraser: "Tẩy",
    },
    shortcut: "{label} · {key}",
    colour: "Màu {colour}",
    stroke: "Nét {width}",
    hint: "Cuộn để di chuyển · {mod} cuộn để thu phóng · giữ {space} để kéo",
    textPlaceholder: "Nhập…",
    history: {
      undo: "Hoàn tác",
      redo: "Làm lại",
      clear: "Xóa sạch bảng",
    },
    zoom: {
      out: "Thu nhỏ",
      reset: "Đặt lại thu phóng",
      in: "Phóng to",
    },
    extensionPrompt: {
      title: "Quay canvas này",
      description:
        "Thêm tiện ích CaptureFlow để quay màn hình và camera trong lúc bạn vẽ, rồi chia sẻ một liên kết.",
      dismiss: "Để sau",
      install: "Thêm vào Chrome",
    },
  },
};

export default messages;

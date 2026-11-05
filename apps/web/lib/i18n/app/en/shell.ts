export const SHELL = {
  record: {
    newRecording: "New recording",
  },
  nav: {
    toggleSidebar: "Toggle Sidebar",
    dashboard: "Dashboard",
    recordings: "Recordings",
    screenshots: "Screenshots",
    canvas: "Canvas",
    workspaceGroup: "Workspace",
    members: "Members",
    settings: "Settings",
    personal: "Personal",
    workspace: "Workspace",
    billing: "Billing",
    admin: "Admin",
  },
  upgradeCard: {
    title: "Upgrade your workspace",
    description:
      "Free is {recordings} recordings per person at data saver quality. Paid plans remove the limits, from {price} a member.",
    viewPlans: "View plans",
  },
  topBar: {
    upgrade: "Upgrade",
  },
  workspaceSwitcher: {
    switchWorkspace: "Switch workspace",
    summary: "one:Default · {n} member|other:Default · {n} members",
    workspaces: "Workspaces",
    owned: "You own this",
    joined: "You joined",
    newWorkspace: "New workspace",
    inviteMembers: "Invite members",
  },
  drawer: {
    open: "Open workspace menu",
    title: "Workspace menu",
  },
  search: {
    prompt: "Search your recordings and screenshots",
    clear: "Clear search",
    results: "Search results",
    hint: "Search your recordings and screenshots by title.",
    noMatches: "No matches",
    kind: {
      recording: "recording",
      screenshot: "screenshot",
    },
  },
  account: {
    menu: "Account menu",
    nav: {
      billing: "Billing",
      devices: "Connected devices",
      settings: "Settings",
      support: "Contact support",
    },
    freePlan: "Free",
    signOut: "Sign out",
    signingOut: "Signing out…",
  },
  theme: {
    label: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",
  },
  notifications: {
    title: "Notifications",
    subtitle: "Invites and changes to your workspaces.",
    bellUnread: "other:Notifications, {n} unread",
    viewAll: "View all",
    menuEmpty:
      "You’re all caught up. Invites, new teammates, and role changes show up here.",
    pageEmpty:
      "You’re all caught up. When someone invites you, joins your workspace, or changes your role, you’ll see it here.",
    accept: "Accept",
    decline: "Decline",
    unread: "Unread",
    someone: "Someone",
    message: {
      invited: {
        member: "{actor} invited you to join {workspace} as a member",
        viewer: "{actor} invited you to join {workspace} as a viewer",
      },
      joined: {
        member: "{actor} joined {workspace} as a member",
        viewer: "{actor} joined {workspace} as a viewer",
      },
      seatRequested: "{actor} asked for a paid seat in {workspace}",
      seatDenied: "{actor} declined your seat request in {workspace}",
      roleChanged: {
        member: "{actor} made you a member in {workspace}",
        viewer: "{actor} made you a viewer in {workspace}",
      },
      downgraded: "{actor} moved you to viewer in {workspace}",
      keepRecordingUntil: "You can keep recording until {date}.",
      removed: "{actor} removed you from {workspace}",
    },
    acceptErrors: {
      failed: "Couldn’t accept the invitation",
      signedOut: "Sign in to accept",
      invalid: "This invitation has expired or was withdrawn",
      emailMismatch: "This invitation is for a different email address",
      alreadyMember: "You’re already in this workspace",
    },
  },
  mobileNav: {
    open: "Open menu",
    close: "Close menu",
    docs: "Docs",
    star: "Star on GitHub",
    signIn: "Sign in",
    getStarted: "Get started",
  },
  skeletons: {
    avatar: "Avatar",
    workspaceName: "Workspace name",
    workspaceLogo: "Workspace logo",
  },
} as const;

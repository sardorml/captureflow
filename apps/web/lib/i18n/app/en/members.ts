export const MEMBERS = {
  title: "Members",
  databaseUnavailable: "Database unavailable.",
  role: "Role",
  status: "Status",
  roles: {
    owner: "Admin",
    member: "Member",
    viewer: "Viewer",
  },
  roleHints: {
    member: {
      does: "Records into this workspace.",
      costs: "A paid seat on Light and Pro.",
    },
    viewer: {
      does: "Watches and comments.",
      costs: "Always free.",
    },
  },
  statuses: {
    active: "Active",
    invited: "Invited",
  },
  seatSummary: {
    members: "one:{n} member|other:{n} members",
    viewers: "one:{n} viewer|other:{n} viewers",
    paidSeats: "one:{n} paid seat|other:{n} paid seats",
    membersAndViewers: "{members} and {viewers}",
    onPaidSeats:
      "{people} on {seats}. Every member is a seat; viewers are free.",
    membersFree: "{people}. Members are free on this plan.",
    freePlan:
      "{people}. Free plan: each member gets {recordings} recordings of up to {minutes} minutes; viewers watch and comment.",
    planTitle: "{plan} plan",
    paidPlanTitle: "Paid plan",
    freePlanTitle: "Free plan",
    upgrade: "Upgrade workspace",
  },
  table: {
    intro: "Members record here; viewers watch and comment.",
    ownerIntro: "As the owner you can invite, remove and change roles.",
    searchPlaceholder: "Name or email address",
    searchLabel: "Search members",
    allRoles: "All roles",
    everyone: "Everyone",
    columns: {
      name: "Name",
      dateAdded: "Date added",
      email: "Email address",
      actions: "Actions",
    },
    empty: "Nobody matches these filters.",
    downgradeNote: "Viewer from {date} · {keep}",
    keepAsMember: "Keep as member",
    revoke: "Revoke",
  },
  seatRequests: {
    title: "Seat requests",
    description:
      "These viewers asked to record. Approving makes them a member.",
    descriptionPaid:
      "These viewers asked to record. Approving makes them a member, which adds a paid seat.",
    asked: "{email} · asked {date}",
    deny: "Deny",
    approve: "Approve",
  },
  seatConfirm: {
    addTitle: "Give {name} a paid seat?",
    addBody:
      "Members record, so each one is a paid seat. Your {plan} plan goes from {seats} to {nextSeats} seats, ${before} to ${after} a month.",
    addBodyYearly:
      "Members record, so each one is a paid seat. Your {plan} plan goes from {seats} to {nextSeats} seats, ${before} to ${after} a month, billed yearly.",
    addInvoice:
      "The rest of this billing period is added to your next invoice.",
    addConfirm: "Add paid seat",
    removeTitle: "Move {name} to viewer?",
    removeBody:
      "{name} keeps recording until {date}, the end of the period you've paid for. Then they become a viewer, who can watch and comment but not record.",
    removePlan:
      "From then, your {plan} plan goes from {seats} to {nextSeats} seats, ${before} to ${after} a month.",
    removePlanYearly:
      "From then, your {plan} plan goes from {seats} to {nextSeats} seats, ${before} to ${after} a month, billed yearly.",
    removeConfirm: "Move to viewer",
  },
  remove: {
    label: "Remove {name} from workspace",
    title: "Remove {name} from {workspace}?",
    body: "They lose access straight away. Their recordings and screenshots stay in the workspace.",
    freesSeat:
      "That frees their paid seat: your plan goes from {seats} to {nextSeats} seats.",
  },
  leave: {
    button: "Leave",
    title: "Leave {workspace}?",
    body: "You’ll lose access to its recordings and screenshots. Anything you recorded there stays in the workspace.",
    comeBack: "To come back, someone has to invite you again.",
    confirm: "Leave workspace",
  },
  invite: {
    trigger: "Invite members",
    title: "Invite members to {workspace}",
    titleOwnWorkspace: "Invite members to your workspace",
    description:
      "They’ll get an email with a link that expires in 7 days. Make sure they sign in with the same address.",
    removeEmail: "Remove {email}",
    addEmails: "Add emails",
    separatorHint: "Separate emails with a space, comma, or enter.",
    paidSeatNote:
      "Each member who accepts adds a paid seat to your {plan} plan, ${price} a month each. The rest of this period goes on your next invoice.",
    noEmails: "Add at least one email",
    invalidEmails: "Not a valid email: {emails}",
    failed: "Failed",
    sent: "one:Sent {n} invite.|other:Sent {n} invites.",
    sending: "Sending…",
    submit: "Send invites",
  },
  actions: {
    emailRequired: "Enter an email address",
    emailInvalid: "That doesn’t look like a valid email",
    ownWorkspace: "You’re already in your own workspace",
    alreadyMember: "That person is already a member of this workspace",
    emailNotSent:
      "Invitation created but email delivery failed. Copy the link from the pending list.",
    invitationSent: "Invitation sent to {email}",
    alreadyRecording: "You can already record here",
  },
} as const;

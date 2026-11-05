export const AUTH = {
  signedInAs: "Signed in as {email}.",
  errors: {
    generic: "Something went wrong. Please try again.",
    network: "Network error. Please try again.",
  },
  login: {
    metaTitle: "Log in",
    signInTitle: "Welcome back",
    signInDescription: "Log in with Google, GitHub or your email",
    signUpTitle: "Create your account",
    signUpDescription: "Sign up with Google, GitHub or your email",
    inviteTitle: "Join {workspace}",
    inviteDescription:
      "{inviter} invited you. Sign in or create an account with {email} to accept.",
    continueWith: "Continue with {provider}",
    or: "Or",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    emailInvalid: "Enter a valid email.",
    continueWithEmail: "Continue with Email",
    askForInvite: "Need an account? Ask an admin for an invite.",
    haveAccount: "Already have an account? {action}",
    haveAccountAction: "Log in",
    noAccount: "Don't have an account? {action}",
    noAccountAction: "Sign up",
    changeEmail: "Change",
    nameLabel: "Name",
    namePlaceholder: "Your name",
    passwordLabel: "Password",
    newPasswordPlaceholder: "At least 12 characters",
    passwordTooShort: "Use at least 12 characters.",
    passwordMissing: "Enter your password.",
    signInSubmit: "Log in",
    signUpSubmit: "Create account",
    terms: "By continuing, you agree to our {terms} and {privacy}.",
    termsLink: "Terms",
    privacyLink: "Privacy Policy",
  },
  verify: {
    title: "Check your email",
    description:
      "We sent a link to {email}. Open it to finish setting up your account.",
    resend: "Resend email",
    resent: "Sent again",
    resendFailed: "Couldn't send the email. Please try again.",
    wrongAddress: "Wrong address? {action}",
    wrongAddressAction: "Use a different email",
  },
  oauthErrors: {
    unfinished: "Sign-in didn't finish. Please try again.",
    inviteOnly:
      "This CaptureFlow is invite-only. Ask an administrator for an invite.",
    allowedDomains:
      "Sign up with an address on {domains}, or ask an administrator for an invite.",
    providerDomains: "Sign up with a Google or GitHub account on {domains}.",
    domainChoice: "{first} or {second}",
  },
  inviteFallbacks: {
    workspace: "a CaptureFlow workspace",
    inviter: "A teammate",
  },
  setPassword: {
    title: "Set your password",
    description:
      "Choose a password for {email}. You’ll be signed in afterwards.",
    passwordLabel: "New password",
    passwordPlaceholder: "At least 12 characters",
    submit: "Save password",
    expiredTitle: "This link no longer works",
    expiredDescription:
      "It was already used or has expired. Ask an administrator for a new one.",
    goToSignIn: "Go to sign in",
  },
  invite: {
    title: "You’re invited",
    asViewer:
      "You’ve been invited to join {workspace} on CaptureFlow as a viewer: you can watch and comment on everything shared there.",
    asMember:
      "You’ve been invited to join {workspace} on CaptureFlow as a member: you can record into it and share with the team.",
    accept: "Accept invitation",
    databaseUnavailable: "Database unavailable",
    invalidTitle: "Invitation no longer valid",
    invalidBody:
      "This link has expired or already been used. Ask the workspace owner to send a new invitation.",
    wrongAccountTitle: "Wrong account",
    wrongAccountBody:
      "This invitation was sent to {invited}, but you're signed in as {current}. Sign out and sign in with the invited address to accept.",
    goToDashboard: "Go to dashboard",
    signOut: "Sign out",
  },
  handoff: {
    signingIn: "Signing you in…",
    returning: "Returning to CaptureFlow…",
    open: "Open CaptureFlow",
    hint: "If nothing happens, click the button above. You can close this tab once the desktop app reopens.",
    extensionDone: "Signed in as {email}. You can close this tab.",
    extensionUnreachable:
      "Couldn’t reach the CaptureFlow extension. Make sure it’s installed, then click its icon to try again.",
    extensionUnverified:
      "Couldn’t verify the extension. Reinstall it and try again.",
  },
} as const;

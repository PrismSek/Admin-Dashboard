/**
 * Every user-facing string and route in the auth flow, in one place.
 *
 * Screens import from here rather than inlining copy, so wording changes
 * (and, later, i18n extraction) happen in a single file.
 */

/** Auth route table. Change a URL here and every link follows. */
export const authRoutes = {
  signIn: "/sign-in",
  password: "/sign-in/password",
  sso: "/sign-in/sso",
  /** Our own endpoint that mints the nonce and redirects to the gateway. */
  googleStart: "/api/auth/google/start",
  signedIn: "/sign-in/success",
  signUp: "/sign-up",
  forgotPassword: "/forgot-password",
  forgotPasswordSent: "/forgot-password/sent",
  resetPassword: "/reset-password",
  invitation: "/invitation",
  invitationExpired: "/invitation/expired",
  suspended: "/suspended",
  /** Post-authentication landing page. */
  dashboard: "/dashboard",
} as const;

/**
 * Our own auth API route handlers. The browser posts here, never to the
 * gateway directly, so tokens land in httpOnly cookies (see src/app/api/auth).
 */
export const authApiRoutes = {
  login: "/api/auth/login",
  logout: "/api/auth/logout",
  refresh: "/api/auth/refresh",
  forgotPassword: "/api/auth/password/forgot",
  resetPassword: "/api/auth/password/reset",
} as const;

/** Legal/support links shown in the footer of every auth screen. */
export const footerLinks = [
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Terms of Service", href: "/legal/terms" },
  { label: "Support", href: "/support" },
  { label: "Contact", href: "/contact" },
] as const;

export const authCommon = {
  assurance: "Protected with enterprise-grade authentication",
  logoAlt: "PrismSek — Secure What Moves",
} as const;

export const signInContent = {
  title: "Sign in to PrismSek",
  emailLabel: "Work email",
  emailPlaceholder: "Enter your work email",
  submit: "Continue",
  dividerLabel: "or",
  google: "Continue with Google",
  github: "Continue with GitHub",
  googleError: "Google sign-in didn't work. Please try again.",
  googleSigningIn: "Signing you in…",
  noAccount: "Don't have an account?",
  createAccount: "Create account",
} as const;

export const passwordContent = {
  title: "Enter your password",
  passwordLabel: "Password",
  passwordPlaceholder: "Enter your password",
  forgot: "Forgot password?",
  submit: "Sign in",
  useDifferentEmail: "Use a different email",
  invalidCredentials: "Invalid email or password. Please try again.",
} as const;

export const signUpContent = {
  title: "Create your account",
  subtitle: "Get started with PrismSek in minutes",
  firstNameLabel: "First name",
  firstNamePlaceholder: "Jae",
  lastNameLabel: "Last name",
  lastNamePlaceholder: "Mathew",
  emailLabel: "Email address",
  emailPlaceholder: "you@company.com",
  passwordLabel: "Password",
  passwordPlaceholder: "Create a password",
  passwordHint: "Use 8+ characters with a mix of letters, numbers & symbols",
  termsPrefix: "I agree to the",
  termsLabel: "Terms of Service",
  termsJoin: "and",
  privacyLabel: "Privacy Policy",
  submit: "Create Account",
  haveAccount: "Already have an account?",
  signIn: "Sign in",
} as const;

export const forgotPasswordContent = {
  title: "Reset your password",
  subtitle:
    "Enter the email address linked to your PrismSek account and we'll send you a reset link.",
  emailLabel: "Work email",
  emailPlaceholder: "Enter your work email",
  submit: "Send reset link",
  backToSignIn: "Back to sign in",
} as const;

export const checkEmailContent = {
  title: "Check your email",
  body: "We've sent a password reset link to",
  submit: "Back to Sign In",
  noEmailPrefix: "Didn't get it?",
  resend: "Resend link",
} as const;

export const resetPasswordContent = {
  title: "Set your password",
  subtitle: "Choose a password to secure your PrismSek account",
  newPasswordLabel: "New password",
  newPasswordPlaceholder: "Enter new password",
  passwordHint: "Use 8+ characters with a mix of letters, numbers & symbols",
  confirmLabel: "Confirm password",
  confirmPlaceholder: "Re-enter password",
  submit: "Set Password",
  backToSignIn: "Back to sign in",
  linkInvalid: "This link is invalid or has expired. Request a new reset link and try again.",
  weakPassword: "That password doesn't meet the security policy. Choose a stronger one.",
  failed: "Something went wrong setting your password. Please try again.",
} as const;

export const signedInContent = {
  title: "You're signed in",
  body: ["Your identity has been verified.", "Redirecting you to your PrismSek workspace."],
  status: "Redirecting…",
  continueManually: "Continue to your workspace",
} as const;

export const ssoContent = {
  /** `{provider}` is replaced with the organisation's IdP name. */
  title: (provider: string) => `Taking you to ${provider} SSO`,
  body: "Your organization requires single sign-on. You will return here automatically.",
  status: "Connecting…",
  stalledPrompt: "Not redirected within a few seconds?",
  submit: "Continue to SSO",
  useDifferentEmail: "Use a different email",
} as const;

export const invitationContent = {
  body: ["You've been invited to join the PrismSek platform.", "Review your invitation details below."],
  organizationLabel: "Organization",
  invitedByLabel: "Invited by",
  roleLabel: "Role",
  sentLabel: "Invitation sent",
  expiresLabel: "Invitation expires",
  decline: "Decline Invitation",
  accept: "Accept Invitation",
  mistakePrefix: "If you believe this invitation was sent to you by mistake,",
  contactSupport: "contact support.",
} as const;

export const invitationExpiredContent = {
  title: "Invitation expired",
  body: ["This invitation link has expired and is no longer valid.", "Please request a new invitation to continue."],
  submit: "Request New Invitation",
  backToSignIn: "Back to Sign In",
  contactAdmin: "Contact Administrator",
} as const;

export const suspendedContent = {
  title: "Access is suspended",
  /** `{org}` is the organisation whose access was suspended. */
  body: (org: string) =>
    `Your PrismSek access for ${org} has been temporarily suspended by an administrator. Your data has not been removed.`,
  contactPrefix: "Contact an",
  orgOwner: "Org Owner",
  contactSuffix: "in your organization to restore access.",
  submit: "Email an Administrator",
  backToSignIn: "Back to Sign In",
  /** `{ref}` is a support reference code. */
  reference: (ref: string) => `Reference ${ref} · shown only after the account was securely validated.`,
} as const;

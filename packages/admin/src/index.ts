export {
  ADMIN_COOKIE,
  createToken,
  hashToken,
  hashPassword,
  issueSession,
  verifyPassword,
  verifyPasswordOrDecoy,
  verifySession,
  verifySetupToken,
} from "./auth";
export {
  checkThrottle,
  clearThrottle,
  loginScopeKeys,
  recordFailure,
  throttleMessage,
} from "./rate-limit";
export type { ThrottleVerdict } from "./rate-limit";
export {
  claimInvite,
  clearSetupTokens,
  consumeSetupToken,
  countAdmins,
  createAdmin,
  createInvite,
  createSetupToken,
  deleteAdmin,
  deleteInvite,
  getAdmin,
  getAdminCredentials,
  getPendingInvite,
  listAdmins,
  listAudit,
  listAuditForTarget,
  listPendingInvites,
  setAdminStatus,
  touchAdminLogin,
  updateAdminRole,
  writeAudit,
} from "./db";
export type { AdminAccount, AdminAuditRow, AdminInvite } from "./db";
export {
  ADMIN_PAGE_SIZE,
  getAdminTotals,
  getAdminUser,
  getAdminWorkspace,
  getSignupsByWeek,
  getUserActivity,
  inviteStatus,
  listAdminUsers,
  listAdminWorkspaces,
  listUserSubscriptions,
  listUserWorkspaces,
  listWorkspaceInvites,
  listWorkspaceMembers,
  revokeUserAccess,
  summarizePlan,
  weeklyBuckets,
  workspacePlan,
} from "./directory";
export type {
  AdminInviteStatus,
  AdminMemberRow,
  AdminPlanSummary,
  AdminRecentRecording,
  AdminSubscriptionRow,
  AdminUserActivity,
  AdminTotals,
  AdminUserDetail,
  AdminUserRow,
  AdminWorkspaceInviteRow,
  AdminWorkspacePlan,
  AdminWorkspaceRow,
  Page,
  PlanFilter,
  UserSort,
} from "./directory";
export {
  TIMELINE_LIMIT,
  describeUserAgent,
  getUserTimeline,
  mergeTimeline,
} from "./timeline";
export type { AdminTimelineEvent, AdminTimelineKind } from "./timeline";
export {
  MIN_PASSWORD_LENGTH,
  hydrateAdminId,
  hydrateEmail,
  hydrateInviteToken,
  hydrateLimitOverride,
  hydratePassword,
  hydrateRole,
  hydrateUserId,
  hydrateWorkspaceId,
} from "./input";
export type { Hydrated } from "./input";
export { ADMIN_ROLES, ROLE_SUMMARY, can } from "./roles";
export type { AdminPermission, AdminRole, AdminStatus } from "./roles";

export {
  FREE_TIER,
  LIMIT_OVERRIDE_MAX,
  SEAT_PLANS,
  getLimitOverride,
  getSeatPlan,
  isSelfHosted,
  setLimitOverride,
} from "@captureflow/quota";
export type { LimitOverride, SeatPlanId } from "@captureflow/quota";
export type { SubscriptionStatus } from "@captureflow/quota";

export {
  getRecordingActivityByWeek,
  getRecordingTotals,
  listAdminRecordings,
} from "./recordings";
export type {
  AdminRecordingRow,
  AdminRecordingTotals,
  RecordingSort,
  RecordingVisibilityFilter,
} from "./recordings";

export { listContactRequests } from "./contact-requests";
export type { ContactKind, ContactRequestRow } from "./contact-requests";

export { getActivation } from "./activation";
export type {
  ActivationFunnel,
  AdminActivation,
  Bucket,
  CohortRow,
  OneAndDoneUser,
} from "./activation";

export {
  WEB_RANGES,
  getWebAnalytics,
  isWebRange,
  postHogConfig,
} from "./web-analytics";
export type {
  Compared,
  PostHogConfig,
  WebAnalytics,
  WebPoint,
  WebRange,
  WebRow,
} from "./web-analytics";
export { summarizeCapture, type CaptureSummary } from "./capture-summary";

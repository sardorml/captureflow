import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentWorkspaceId = vi.fn();
const isWorkspaceMember = vi.fn();
const getPersonalWorkspaceForUser = vi.fn();

vi.mock("@captureflow/quota", () => ({
  ACCOUNT_LIMITS: {},
  ensurePersonalWorkspace: vi.fn(),
  getEffectiveLimitsForUser: vi.fn(),
  getCurrentWorkspaceId: (...a: unknown[]) => getCurrentWorkspaceId(...a),
  getPersonalWorkspaceForUser: (...a: unknown[]) =>
    getPersonalWorkspaceForUser(...a),
  getWorkspaceById: vi.fn(),
  isWorkspaceMember: (...a: unknown[]) => isWorkspaceMember(...a),
  totalStorageForUser: vi.fn(),
}));
vi.mock("./db-memory", () => ({ memoryTotalStorageForUser: vi.fn() }));
vi.mock("./cf-env", () => ({ getCloudflareEnv: async () => ({ DB: {} }) }));
vi.mock("./dev-allowlist", () => ({ isDevDevice: () => false }));

const { resolveUploadWorkspaceId } = await import("./quota");

beforeEach(() => {
  vi.clearAllMocks();
  getPersonalWorkspaceForUser.mockResolvedValue({ id: "personal" });
});

// A client that names no workspace is every extension upload; before this it
// always landed in the personal workspace whatever the switcher said.
describe("resolveUploadWorkspaceId", () => {
  it("uses the workspace the account is currently switched to", async () => {
    getCurrentWorkspaceId.mockResolvedValue("team");
    isWorkspaceMember.mockResolvedValue(true);
    expect(await resolveUploadWorkspaceId("u1")).toBe("team");
  });

  it("falls back to personal when nothing is switched to", async () => {
    getCurrentWorkspaceId.mockResolvedValue(null);
    expect(await resolveUploadWorkspaceId("u1")).toBe("personal");
    expect(isWorkspaceMember).not.toHaveBeenCalled();
  });

  it("falls back to personal once the membership is gone", async () => {
    getCurrentWorkspaceId.mockResolvedValue("team");
    isWorkspaceMember.mockResolvedValue(false);
    expect(await resolveUploadWorkspaceId("u1")).toBe("personal");
  });
});

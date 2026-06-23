/// <reference types="@cloudflare/workers-types" />

/*
 * Every user owns exactly one personal workspace (auto-created on signup).
 * All writes here are idempotent: the signup hook can run twice without
 * creating a duplicate, and re-accepting an invite is a no-op.
 */

export type WorkspaceRole = 'owner' | 'member';

export type WorkspaceKind = 'personal' | 'team';

export type WorkspaceRow = {
  id: string;
  slug: string;
  kind: WorkspaceKind;
  name: string;
  owner_user_id: string;
  created_at: number;
  updated_at: number;
  logo_key: string | null;
  // When allow_public_links is false the upload endpoints coerce public → workspace; when allow_member_uploads is false, member uploads fall back to their personal workspace.
  allow_public_links: boolean;
  allow_member_uploads: boolean;
};

export type WorkspaceMembership = {
  workspace_id: string;
  workspace_slug: string;
  workspace_kind: WorkspaceKind;
  workspace_name: string;
  owner_user_id: string;
  role: WorkspaceRole;
  joined_at: number;
};

export type WorkspaceMember = {
  user_id: string;
  name: string;
  email: string;
  image: string | null;
  role: WorkspaceRole;
  joined_at: number;
};

export type WorkspaceInviteRow = {
  id: string;
  workspace_id: string;
  email: string;
  invited_by_user_id: string;
  created_at: number;
  expires_at: number;
  accepted_at: number | null;
};

const DEFAULT_INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function nowMs(): number {
  return Date.now();
}

function generateId(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

function generateSlug(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Plaintext invite token; only its SHA-256 hash is stored in token_hash.
function generateInviteToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const WORKSPACE_COLUMNS =
  'id, slug, kind, name, owner_user_id, created_at, updated_at, ' +
  'logo_key, allow_public_links, allow_member_uploads';

type WorkspaceD1Row = {
  id: string;
  slug: string;
  kind: string;
  name: string;
  owner_user_id: string;
  created_at: number;
  updated_at: number;
  logo_key: string | null;
  allow_public_links: number;
  allow_member_uploads: number;
};

function hydrateWorkspaceRow(r: WorkspaceD1Row): WorkspaceRow {
  return {
    id: r.id,
    slug: r.slug,
    kind: r.kind === 'team' ? 'team' : 'personal',
    name: r.name,
    owner_user_id: r.owner_user_id,
    created_at: r.created_at,
    updated_at: r.updated_at,
    logo_key: r.logo_key ?? null,
    allow_public_links: r.allow_public_links !== 0,
    allow_member_uploads: r.allow_member_uploads !== 0,
  };
}

function deriveWorkspaceName(displayName: string | null | undefined): string {
  const trimmed = (displayName ?? '').trim();
  const firstWord = trimmed.split(/\s+/)[0] ?? '';
  if (firstWord.length === 0) return 'My Workspace';
  return `${firstWord}'s Workspace`;
}

/*
 * Returns null if the signup hook hasn't run yet; the partial unique index
 * idx_workspace_owner_personal guarantees at most one match so v2 'team'
 * workspaces don't shadow the personal one. Use ensurePersonalWorkspace to
 * guarantee a row.
 */
export async function getPersonalWorkspaceForUser(
  db: D1Database,
  userId: string
): Promise<WorkspaceRow | null> {
  const row = await db
    .prepare(
      `SELECT ${WORKSPACE_COLUMNS}
         FROM workspace
         WHERE owner_user_id = ?1 AND kind = 'personal'
         LIMIT 1`
    )
    .bind(userId)
    .first<WorkspaceD1Row>();
  return row ? hydrateWorkspaceRow(row) : null;
}

export async function getWorkspaceById(
  db: D1Database,
  workspaceId: string
): Promise<WorkspaceRow | null> {
  const row = await db
    .prepare(
      `SELECT ${WORKSPACE_COLUMNS}
         FROM workspace
         WHERE id = ?1
         LIMIT 1`
    )
    .bind(workspaceId)
    .first<WorkspaceD1Row>();
  return row ? hydrateWorkspaceRow(row) : null;
}

// Idempotent: creates the personal workspace + owner member row if neither
// exists, otherwise returns the existing workspace.
export async function ensurePersonalWorkspace(
  db: D1Database,
  userId: string,
  displayName: string | null | undefined
): Promise<WorkspaceRow> {
  const existing = await getPersonalWorkspaceForUser(db, userId);
  if (existing) return existing;

  const id = generateId();
  const slug = generateSlug();
  const now = nowMs();
  const name = deriveWorkspaceName(displayName);

  // INSERT OR IGNORE so concurrent calls don't fail on
  // idx_workspace_owner_personal; the loser re-reads the winner's row below.
  await db
    .prepare(
      `INSERT OR IGNORE INTO workspace
         (id, slug, kind, name, owner_user_id, created_at, updated_at)
         VALUES (?1, ?2, 'personal', ?3, ?4, ?5, ?5)`
    )
    .bind(id, slug, name, userId, now)
    .run();

  await db
    .prepare(
      `INSERT OR IGNORE INTO workspace_member
         (workspace_id, user_id, role, joined_at)
         VALUES (?1, ?2, 'owner', ?3)`
    )
    .bind(id, userId, now)
    .run();

  const row = await getPersonalWorkspaceForUser(db, userId);
  if (!row) {
    throw new Error(
      `ensurePersonalWorkspace: insert succeeded but lookup returned null for user ${userId}`
    );
  }
  return row;
}

// These helpers do NOT gate on ownership; the API route layer is the only
// security check that role = 'owner'.
export async function updateWorkspaceName(
  db: D1Database,
  workspaceId: string,
  name: string
): Promise<boolean> {
  const trimmed = name.trim();
  if (trimmed.length === 0 || trimmed.length > 80) return false;
  const res = await db
    .prepare(
      `UPDATE workspace
         SET name = ?2, updated_at = ?3
         WHERE id = ?1`
    )
    .bind(workspaceId, trimmed, nowMs())
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

export async function updateWorkspaceLogo(
  db: D1Database,
  workspaceId: string,
  logoKey: string | null
): Promise<boolean> {
  const res = await db
    .prepare(
      `UPDATE workspace
         SET logo_key = ?2, updated_at = ?3
         WHERE id = ?1`
    )
    .bind(workspaceId, logoKey, nowMs())
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

export type WorkspacePolicyPatch = {
  allowPublicLinks?: boolean;
  allowMemberUploads?: boolean;
};

// Partial update: an undefined flag is left unchanged.
export async function updateWorkspacePolicy(
  db: D1Database,
  workspaceId: string,
  patch: WorkspacePolicyPatch
): Promise<boolean> {
  const sets: string[] = [];
  const binds: (number | string)[] = [];
  if (typeof patch.allowPublicLinks === 'boolean') {
    sets.push(`allow_public_links = ?${binds.length + 2}`);
    binds.push(patch.allowPublicLinks ? 1 : 0);
  }
  if (typeof patch.allowMemberUploads === 'boolean') {
    sets.push(`allow_member_uploads = ?${binds.length + 2}`);
    binds.push(patch.allowMemberUploads ? 1 : 0);
  }
  if (sets.length === 0) return false;
  sets.push(`updated_at = ?${binds.length + 2}`);
  binds.push(nowMs());
  const res = await db
    .prepare(`UPDATE workspace SET ${sets.join(', ')} WHERE id = ?1`)
    .bind(workspaceId, ...binds)
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

export async function listWorkspacesForUser(
  db: D1Database,
  userId: string
): Promise<WorkspaceMembership[]> {
  const { results } = await db
    .prepare(
      `SELECT w.id           AS workspace_id,
              w.slug         AS workspace_slug,
              w.kind         AS workspace_kind,
              w.name         AS workspace_name,
              w.owner_user_id,
              m.role,
              m.joined_at
         FROM workspace_member m
         JOIN workspace w ON w.id = m.workspace_id
         WHERE m.user_id = ?1
         ORDER BY (CASE WHEN m.role = 'owner' THEN 0 ELSE 1 END), m.joined_at ASC`
    )
    .bind(userId)
    .all<WorkspaceMembership>();
  return results ?? [];
}

export async function isWorkspaceMember(
  db: D1Database,
  workspaceId: string,
  userId: string
): Promise<boolean> {
  const row = await db
    .prepare(
      `SELECT 1 AS hit
         FROM workspace_member
         WHERE workspace_id = ?1 AND user_id = ?2
         LIMIT 1`
    )
    .bind(workspaceId, userId)
    .first<{ hit: number }>();
  return row !== null;
}

export async function listMembers(
  db: D1Database,
  workspaceId: string
): Promise<WorkspaceMember[]> {
  const { results } = await db
    .prepare(
      `SELECT u.id    AS user_id,
              u.name  AS name,
              u.email AS email,
              u.image AS image,
              m.role  AS role,
              m.joined_at
         FROM workspace_member m
         JOIN users u ON u.id = m.user_id
         WHERE m.workspace_id = ?1
         ORDER BY (CASE WHEN m.role = 'owner' THEN 0 ELSE 1 END), m.joined_at ASC`
    )
    .bind(workspaceId)
    .all<WorkspaceMember>();
  return results ?? [];
}

export type RemoveMemberResult =
  | { ok: true }
  | { ok: false; reason: 'not_member' | 'cannot_remove_owner' };

// Refuses to remove the owner; to remove the owner, delete the whole
// workspace (cascades through the FKs).
export async function removeWorkspaceMember(
  db: D1Database,
  workspaceId: string,
  userId: string
): Promise<RemoveMemberResult> {
  const existing = await db
    .prepare(
      `SELECT role FROM workspace_member
         WHERE workspace_id = ?1 AND user_id = ?2
         LIMIT 1`
    )
    .bind(workspaceId, userId)
    .first<{ role: string }>();
  if (!existing) return { ok: false, reason: 'not_member' };
  if (existing.role === 'owner') {
    return { ok: false, reason: 'cannot_remove_owner' };
  }
  await db
    .prepare(
      `DELETE FROM workspace_member
         WHERE workspace_id = ?1 AND user_id = ?2`
    )
    .bind(workspaceId, userId)
    .run();
  return { ok: true };
}

export type CreateInviteResult = {
  ok: true;
  invite: WorkspaceInviteRow;
  // Returned only at creation time; the DB stores only its SHA-256 hash.
  plaintextToken: string;
};

export type CreateInviteError = { ok: false; reason: 'already_member' };

export async function createInvite(
  db: D1Database,
  args: {
    workspaceId: string;
    email: string;
    invitedByUserId: string;
    ttlMs?: number;
  }
): Promise<CreateInviteResult | CreateInviteError> {
  const memberRow = await db
    .prepare(
      `SELECT m.user_id
         FROM workspace_member m
         JOIN users u ON u.id = m.user_id
         WHERE m.workspace_id = ?1 AND LOWER(u.email) = LOWER(?2)
         LIMIT 1`
    )
    .bind(args.workspaceId, args.email)
    .first<{ user_id: string }>();
  if (memberRow) return { ok: false, reason: 'already_member' };

  // Drop any pending invite for the same (workspace, email) so the partial
  // unique index doesn't reject the insert; this implicitly resends it.
  await db
    .prepare(
      `DELETE FROM workspace_invite
         WHERE workspace_id = ?1
           AND LOWER(email) = LOWER(?2)
           AND accepted_at IS NULL`
    )
    .bind(args.workspaceId, args.email)
    .run();

  const id = generateId();
  const plaintextToken = generateInviteToken();
  const tokenHash = await sha256Hex(plaintextToken);
  const now = nowMs();
  const ttl = args.ttlMs ?? DEFAULT_INVITE_TTL_MS;
  const expiresAt = now + ttl;

  await db
    .prepare(
      `INSERT INTO workspace_invite
         (id, workspace_id, email, token_hash, invited_by_user_id,
          created_at, expires_at, accepted_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, NULL)`
    )
    .bind(
      id,
      args.workspaceId,
      args.email,
      tokenHash,
      args.invitedByUserId,
      now,
      expiresAt
    )
    .run();

  const invite: WorkspaceInviteRow = {
    id,
    workspace_id: args.workspaceId,
    email: args.email,
    invited_by_user_id: args.invitedByUserId,
    created_at: now,
    expires_at: expiresAt,
    accepted_at: null,
  };
  return { ok: true, invite, plaintextToken };
}

// Returns the row only when still valid (not expired, not accepted). The
// caller must verify the signed-in user's email matches the invite's email
// before calling acceptInvite.
export async function findInviteByToken(
  db: D1Database,
  plaintextToken: string
): Promise<WorkspaceInviteRow | null> {
  const tokenHash = await sha256Hex(plaintextToken);
  const row = await db
    .prepare(
      `SELECT id, workspace_id, email, invited_by_user_id,
              created_at, expires_at, accepted_at
         FROM workspace_invite
         WHERE token_hash = ?1
         LIMIT 1`
    )
    .bind(tokenHash)
    .first<WorkspaceInviteRow>();
  if (!row) return null;
  if (row.accepted_at !== null) return null;
  if (row.expires_at <= nowMs()) return null;
  return row;
}

export type AcceptInviteResult =
  | { ok: true; workspaceId: string }
  | {
      ok: false;
      reason: 'not_found' | 'expired' | 'already_accepted' | 'already_member';
    };

// The two writes aren't transactional (D1 has no BEGIN/COMMIT) but are
// safe to retry. Callers must verify the user's email matches the invite.
export async function acceptInvite(
  db: D1Database,
  args: { inviteId: string; userId: string }
): Promise<AcceptInviteResult> {
  const invite = await db
    .prepare(
      `SELECT id, workspace_id, email, invited_by_user_id,
              created_at, expires_at, accepted_at
         FROM workspace_invite
         WHERE id = ?1
         LIMIT 1`
    )
    .bind(args.inviteId)
    .first<WorkspaceInviteRow>();

  if (!invite) return { ok: false, reason: 'not_found' };
  if (invite.accepted_at !== null)
    return { ok: false, reason: 'already_accepted' };
  if (invite.expires_at <= nowMs()) return { ok: false, reason: 'expired' };

  const alreadyMember = await isWorkspaceMember(
    db,
    invite.workspace_id,
    args.userId
  );
  if (alreadyMember) {
    // Mark accepted so it stops showing as pending, but report
    // already_member so the UI doesn't render a "joined!" message.
    await db
      .prepare(`UPDATE workspace_invite SET accepted_at = ?1 WHERE id = ?2`)
      .bind(nowMs(), args.inviteId)
      .run();
    return { ok: false, reason: 'already_member' };
  }

  const now = nowMs();
  await db
    .prepare(
      `INSERT INTO workspace_member (workspace_id, user_id, role, joined_at)
         VALUES (?1, ?2, 'member', ?3)`
    )
    .bind(invite.workspace_id, args.userId, now)
    .run();

  await db
    .prepare(`UPDATE workspace_invite SET accepted_at = ?1 WHERE id = ?2`)
    .bind(now, args.inviteId)
    .run();

  return { ok: true, workspaceId: invite.workspace_id };
}

export async function listPendingInvites(
  db: D1Database,
  workspaceId: string
): Promise<WorkspaceInviteRow[]> {
  const { results } = await db
    .prepare(
      `SELECT id, workspace_id, email, invited_by_user_id,
              created_at, expires_at, accepted_at
         FROM workspace_invite
         WHERE workspace_id = ?1
           AND accepted_at IS NULL
           AND expires_at > ?2
         ORDER BY created_at ASC`
    )
    .bind(workspaceId, nowMs())
    .all<WorkspaceInviteRow>();
  return results ?? [];
}

export async function revokeInvite(
  db: D1Database,
  args: { inviteId: string; workspaceId: string }
): Promise<void> {
  // Hard delete frees the unique token_hash slot for re-inviting the email.
  await db
    .prepare(
      `DELETE FROM workspace_invite
         WHERE id = ?1 AND workspace_id = ?2 AND accepted_at IS NULL`
    )
    .bind(args.inviteId, args.workspaceId)
    .run();
}

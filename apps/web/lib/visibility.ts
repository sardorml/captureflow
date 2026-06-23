/* Shared visibility/authorization gate for shares and snaps. Extracted from four
 * byte-identical copies (r/[id] and s/[id], each in generateMetadata and the page
 * body) so the rule can't silently drift between the metadata gate and the render
 * gate. Structurally typed so neither the share nor snap module has to depend on
 * the other's VerifiedSession / row types. Pure — pinned by tests. */

type Visitor = { userId: string; workspaceIds: string[] };

type Resource = {
  visibility: string;
  userId: string | null;
  workspaceId: string | null;
};

/**
 * Whether `visitor` may view `resource`.
 * - public: anyone.
 * - private: the owner only.
 * - workspace: the owner or a member of the resource's workspace.
 *
 * Pass `null` for an unauthenticated/unverified visitor (callers normalize the
 * transient 'unknown' session result to null first).
 */
export function canViewResource(visitor: Visitor | null, resource: Resource): boolean {
  if (resource.visibility === 'public') return true;
  if (!visitor) return false;
  if (resource.visibility === 'private') return visitor.userId === resource.userId;
  if (resource.visibility === 'workspace') {
    if (!resource.workspaceId) return false;
    return visitor.userId === resource.userId || visitor.workspaceIds.includes(resource.workspaceId);
  }
  return false;
}

-- OAuth for MCP clients (better-auth's mcp plugin). An agent such as Claude
-- registers itself as an application, the user signs in and consents once,
-- and the agent then calls /mcp with an access token for that user.

CREATE TABLE IF NOT EXISTS oauth_applications (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  metadata TEXT,
  clientId TEXT NOT NULL UNIQUE,
  clientSecret TEXT,
  redirectUrls TEXT NOT NULL,
  type TEXT NOT NULL,
  disabled INTEGER DEFAULT 0,
  userId TEXT REFERENCES users(id) ON DELETE CASCADE,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS oauth_access_tokens (
  id TEXT PRIMARY KEY,
  accessToken TEXT NOT NULL UNIQUE,
  refreshToken TEXT NOT NULL UNIQUE,
  accessTokenExpiresAt INTEGER NOT NULL,
  refreshTokenExpiresAt INTEGER NOT NULL,
  clientId TEXT NOT NULL REFERENCES oauth_applications(clientId) ON DELETE CASCADE,
  userId TEXT REFERENCES users(id) ON DELETE CASCADE,
  scopes TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS oauth_access_tokens_user
  ON oauth_access_tokens (userId);

CREATE TABLE IF NOT EXISTS oauth_consents (
  id TEXT PRIMARY KEY,
  clientId TEXT NOT NULL REFERENCES oauth_applications(clientId) ON DELETE CASCADE,
  userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scopes TEXT NOT NULL,
  consentGiven INTEGER NOT NULL,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS oauth_consents_user_client
  ON oauth_consents (userId, clientId);

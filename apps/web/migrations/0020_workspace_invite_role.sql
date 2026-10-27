-- An invite carries the role it grants: 'member' records and is a seat on
-- Team, 'viewer' watches and comments for free. Existing rows were all members.
ALTER TABLE workspace_invite ADD COLUMN role TEXT NOT NULL DEFAULT 'member';

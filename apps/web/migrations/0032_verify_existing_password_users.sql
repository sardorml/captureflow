-- Password sign-in now requires a confirmed email. Accounts made before that
-- never got a link, so they count as confirmed rather than being locked out.
UPDATE users
   SET emailVerified = 1
 WHERE emailVerified = 0
   AND id IN (SELECT userId FROM accounts WHERE providerId = 'credential');

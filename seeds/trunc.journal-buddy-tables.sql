BEGIN;
truncate users, entries restart identity cascade;
COMMIT;

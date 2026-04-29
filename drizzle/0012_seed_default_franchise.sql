-- Default franchise: resolveFranchiseId() falls back to id 1 / DEFAULT_FRANCHISE_ID.
-- Fresh databases have an empty `franchises` table, so bookings would violate FK.
INSERT INTO "franchises" ("slug", "name", "currency", "timezone")
VALUES ('default', 'ENEX Fahrzeugpflege', 'EUR', 'Europe/Berlin')
ON CONFLICT ("slug") DO NOTHING;

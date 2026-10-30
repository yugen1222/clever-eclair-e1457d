CREATE TABLE requests (
 id TEXT PRIMARY KEY,
 floor INTEGER NOT NULL CHECK(floor BETWEEN 1 AND 3),
 zone TEXT NOT NULL,
 items TEXT NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('new','assigned','transit','delivered','cancelled')),
 runner TEXT NOT NULL DEFAULT '',
 urgent INTEGER NOT NULL DEFAULT 0,
 comment TEXT NOT NULL DEFAULT '',
 created BIGINT NOT NULL,
 updated BIGINT NOT NULL,
 version INTEGER NOT NULL DEFAULT 1,
 events TEXT NOT NULL
);
CREATE INDEX requests_status_created ON requests(status,created);
CREATE INDEX requests_updated ON requests(updated DESC);
CREATE TABLE settings (id TEXT PRIMARY KEY,value TEXT NOT NULL);

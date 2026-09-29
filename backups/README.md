# Local backups

Keep backup data in separate categories:

- `database/` — SQLite database snapshots (for example, `SIH26036-2026-09-29.db`).
- `exports/` — data exports such as JSON or CSV files.
- `uploads/` — timestamped copies of uploaded documents and other file data.

Backup contents are intentionally ignored by Git because they may contain
personal or sensitive information. Keep another copy outside this repository
or on secure storage. A backup is only a copy; the running application writes
to the database configured by `DATABASE_URL`.

When the backend starts, it creates a SQLite-consistent database snapshot and
an uploads snapshot. It then repeats this every `SIH_BACKUP_INTERVAL_HOURS`
(default: 24 hours). Snapshots use unique names and are append-only; this
project does not automatically delete or replace older backups. Backups stop
when the backend process stops and resume with a new snapshot the next time it
starts.

Before backing up, verify that the active database contains the data you intend
to preserve. The scheduled service uses SQLite `VACUUM INTO` rather than
copying a live database file directly, so the snapshot includes committed
write-ahead-log data.

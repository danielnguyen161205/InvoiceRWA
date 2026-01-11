Alembic: stamp vs upgrade — quick guide

When to use `alembic stamp head`:
- Your database already contains the correct schema (created manually or via `Base.metadata.create_all`) and you want Alembic to start tracking versions without applying migrations.
- Use `stamp` when migrating an existing database into Alembic management to avoid destructive schema operations.

When to use `alembic upgrade head`:
- You want Alembic to apply migrations to bring the DB schema up to date with your migration scripts.
- Use this on fresh databases or when you intentionally want to run schema changes.

Recommended safe workflow
1. Backup your database.
2. Inspect current DB revision:
   ```powershell
   $env:DATABASE_URL='your_database_url'
   alembic current
   ```
3. If `alembic current` returns nothing (no revision recorded), but your schema exists (e.g., created by `Base.metadata.create_all`), then stamp:
   ```powershell
   alembic stamp head
   ```
   This will set Alembic's current revision to the latest migration without changing schema.
4. If `alembic current` returns a revision, run:
   ```powershell
   alembic upgrade head
   ```

Use the helper script `scripts/run_migrations.ps1` to guide you interactively.

If you prefer, I can run these commands for you step-by-step (I cannot run them against your DB without access). If your DB already has tables created by `create_all`, stamping is usually the correct choice.

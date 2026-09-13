# Development Workflow

## Schema changes (add/remove/modify fields)

1. **Validate schema**:
   Always validate the Prisma schema first inside Docker:
   ```bash
   docker compose exec backend npx prisma validate
   ```

2. **Create and apply migration**:
   Run the migration command inside Docker:
   ```bash
   docker compose exec backend npx prisma migrate dev --name your_migration_name
   ```
   *(Note: In development, if Prisma warns about dropping columns or data loss and prompts `(y/N)`, confirm with `y`).*

3. **Rebuild the container**:
   Whenever the Prisma schema changes or migrations are applied, the container must be rebuilt so the new Prisma Client is generated inside the Docker image:
   ```bash
   docker compose up --build -d backend
   ```
   *(Use `-d` to run in detached mode so your terminal remains free).*

4. **Verify container startup**:
   Check backend logs to ensure compilation succeeded with 0 errors:
   ```bash
   docker compose logs --tail=50 backend
   ```

## Dependency changes (add/remove packages in package.json)

Rebuild the container in detached mode:
```bash
docker compose up --build -d backend
```

## Code-only changes (no schema or dependency changes)

Hot-reload handles it automatically via NestJS watch mode (`start:dev`).
If containers are already running, changes take effect immediately.
To start all services:
```bash
docker compose up -d
```

## Note

You cannot run `npx prisma` from Windows PowerShell.
All Prisma commands and Node scripts must be executed inside the Docker container:
`docker compose exec backend npx prisma <command>`


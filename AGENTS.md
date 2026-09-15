# AGENTS.md - Repository Instructions

## Project Overview
- Monorepo with `backend/` and `frontend/`.
- Backend uses **NestJS**.
- Database uses **Prisma/MySQL**.

## Backend Conventions
- **Architecture**:
  - Every module follows the structure: `controller.ts`, `service.ts`, `module.ts`, and `dto/`.
  - Flow: `Controller` (Input Validation) -> `Service` (Business Logic) -> `DTOs` (Response Formatting).
  - Use constructor injection for services.
  - Document controllers with Swagger (`@ApiTags`, `@ApiOperation`, `@ApiResponse`).
  - **File Naming**: Use `kebab-case` with type suffixes for all files (e.g., `feature.controller.ts`, `submit-form.dto.ts`).
  - **Class Naming**: Follow naming convention: `<Action><Name>Dto` for input classes, `<Name>ResponseDto` for output classes.
- **Prisma Schema**:
  - Must maintain **3rd Normal Form (3NF)** for relational integrity.
  - Schema changes MUST be validated using `docker compose exec backend npx prisma validate`.
  - Apply changes via `docker compose exec backend npx prisma migrate dev`.
- **Form Module Logic**:
  - Forms with existing submissions are **locked** for editing (throwing `ForbiddenException`).
  - Use `POST /forms/:id/copy` for cloning existing forms.
  - Updates use a "Reset & Recreate" pattern within a Prisma transaction (`$transaction`).

## NestJS Pitfalls
- **Dependency Injection**: 
  - Guards (like `JwtAuthGuard`) are exported by `AuthModule`. To use a guard, import `AuthModule` in your module's `imports` array. **Do not** add the guard to your local `providers` array.
  - When using a Guard in a controller, ensure the module providing the dependency (e.g., `AuthModule` for `JwtService`) is in the `imports` array.
- **Strict Typing**: TypeScript `strict` mode is enabled. Use definite assignment assertions (`!`) for DTO properties.

- **Database Access**: Always perform Prisma commands (validate/generate/migrate) inside the docker container:
  `docker compose exec backend npx prisma <command>`
- **Authentication**: JWT authentication is handled by `JwtAuthGuard` in `backend/src/modules/auth/auth.middleware.ts`.
- **Anonymous Submissions**: Submissions are anonymous but must attach a CV stored in a private bucket, and require an email address for contact.

## Development & Testing Workflow
- Always read and follow [`backend/DEVELOPMENT.md`](backend/DEVELOPMENT.md) before running, testing, or building services. Do NOT run ad-hoc scripts against `./dist`.

## Active Roadmaps & Checklists
- **Backend Refactoring & Technical Debt**: Always consult [`backend/CHECKLIST.md`](backend/CHECKLIST.md) before making structural changes to submissions, CV handling, or AI evaluation.

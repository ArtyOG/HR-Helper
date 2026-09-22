# Backend Refactoring & Technical Debt Checklist

> **Purpose**: This checklist tracks planned architectural refactoring, schema improvements, and technical debt for the backend. Agents and developers should consult this file before implementing major schema or feature changes to the CV/submission subsystem. When you complete an item or section, remove it from this checklist.


---

## 1. Future AI Capabilities Unlocked by the Split
- [ ] **Detailed Score Breakdown**: Store sub-scores (e.g., `skillsScore`, `experienceScore`, `educationScore`).
- [ ] **Extracted Skills & Summary**: Store parsed candidate skills array and generated CV summary.
- [ ] **Multi-Version Evaluation**: Support historical re-scores or comparing multiple AI model outputs.
- [ ] **Forms Without CVs**: Enable non-job or general inquiry forms without dummy CV fields.

---

## 2. File Security & UUID Migration
Because `FilesModule` was developed before `AuthModule`, file IDs are auto-incrementing integers and endpoints lack access control.

### Schema Changes (`backend/prisma/schema.prisma`)
- [ ] Change `File.id` to UUID:
  ```prisma
  model File {
    id          String   @id @default(uuid())
    filename    String
    key         String   @unique
    size        Int
    contentType String   @map("content_type")
    ...
  }
  ```
- [ ] Change `CvEvaluation.fileId` from `Int` to `String` (UUID foreign key referencing `File.id`).
- [ ] Validate schema: `docker compose exec backend npx prisma validate`.
- [ ] Apply migration: `docker compose exec backend npx prisma migrate dev --name change_file_id_to_uuid`.

### Service, DTO & Controller Updates
- [ ] **`fileResponse.dto.ts`**: Update `id` type from `number` to `string` (UUID).
- [ ] **`submit-form.dto.ts`**: Update `cvFileId` validation from `@IsNumber()` to `@IsString()` and `@IsUUID()`.
- [ ] **`cv-evaluation-response.dto.ts`**: Update `fileId` and `FileDetailDto.id` to `string`.
- [ ] **`FilesService.getFileById(id: string)`**: Update parameter to `string`.


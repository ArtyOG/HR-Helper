# Backend Refactoring & Technical Debt Checklist

> **Purpose**: This checklist tracks planned architectural refactoring, schema improvements, and technical debt for the backend. Agents and developers should consult this file before implementing major schema or feature changes to the CV/submission subsystem.

---

## 1. Planned Refactor: Split `CvEvaluation` Entity (Phase 2)
Currently, `FormSubmission` holds both application metadata (`email`, `status`, answers) and AI evaluation data (`cvFileId`, `cvScore`, `aiScoreStatus`, `aiError`). To avoid entity bloat, maintain strict 3NF, and support future AI features, decouple CV evaluation into its own entity.

### Schema Changes (`backend/prisma/schema.prisma`)
- [ ] Create `model CvEvaluation`:
  ```prisma
  model CvEvaluation {
    id             Int              @id @default(autoincrement())
    submissionId   Int              @unique @map("submission_id")
    fileId         Int              @unique @map("file_id")
    score          Float?           @map("score")
    status         AiScoreStatus    @default(PENDING) @map("status")
    error          String?          @db.Text @map("error")
    createdAt      DateTime         @default(now()) @map("created_at")
    updatedAt      DateTime         @updatedAt @map("updated_at")

    submission     FormSubmission   @relation(fields: [submissionId], references: [id], onDelete: Cascade)
    file           File             @relation(fields: [fileId], references: [id], onDelete: Cascade)

    @@map("cv_evaluations")
  }
  ```
- [ ] Remove `cvFileId`, `cvScore`, `aiScoreStatus`, and `aiError` from `FormSubmission`.
- [ ] Add `cvEvaluation CvEvaluation?` relation on `FormSubmission`.
- [ ] Validate schema: `docker compose exec backend npx prisma validate`.
- [ ] Apply migration: `docker compose exec backend npx prisma migrate dev --name extract_cv_evaluation_table`.

### Service & DTO Updates
- [ ] **`FormSubmissionsService.submit()`**: Create `CvEvaluation` within `$transaction` alongside submission.
- [ ] **`FormSubmissionsService.findOne()` & `findAllByFormId()`**: Update relation includes from `cvFile: true` to `cvEvaluation: { include: { file: true } }`.
- [ ] **`AiService.processSubmission()`**: Update status and score targeting `prisma.cvEvaluation` instead of `prisma.formSubmission`.
- [ ] **`FormSubmissionsService.rescore()`**: Reset status on `CvEvaluation` record.
- [ ] **DTOs**: Update `SubmissionResponseDto` and `SubmissionDetailResponseDto` to expose evaluation data cleanly.

---

## 2. Future AI Capabilities Unlocked by the Split
- [ ] **Detailed Score Breakdown**: Store sub-scores (e.g., `skillsScore`, `experienceScore`, `educationScore`).
- [ ] **Extracted Skills & Summary**: Store parsed candidate skills array and generated CV summary.
- [ ] **Multi-Version Evaluation**: Support historical re-scores or comparing multiple AI model outputs.
- [ ] **Forms Without CVs**: Enable non-job or general inquiry forms without dummy CV fields.

---

## 3. File Security & UUID Migration
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
- [ ] Change `FormSubmission.cvFileId` from `Int` to `String` (UUID foreign key).
- [ ] Validate schema: `docker compose exec backend npx prisma validate`.
- [ ] Apply migration: `docker compose exec backend npx prisma migrate dev --name change_file_id_to_uuid`.

### Service, DTO & Controller Updates
- [ ] **`fileResponse.dto.ts`**: Update `id` type from `number` to `string` (UUID).
- [ ] **`submit-form.dto.ts`**: Update `cvFileId` validation from `@IsInt()` to `@IsString()` and `@IsUUID()`.
- [ ] **`submission-response.dto.ts` & `submission-detail-response.dto.ts`**: Update `cvFileId` and `cvFile.id` to `string`.
- [ ] **`FilesService.getFileById(id: string)`**: Update parameter to `string`.

### Access Control & Authorization (`FilesController`)
- [ ] **Secure `GET /api/files/:id`**: Apply `JwtAuthGuard` and verify permission so unauthenticated users cannot generate presigned download URLs for stored CVs.
- [ ] **Remove or Protect `GET /api/files`**: Prevent public listing of all file records in the database.

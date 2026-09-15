# API Documentation: Candidate Form Submission Flow

This document outlines the required steps for a candidate to submit a form via the API.

### 1. Upload CV to S3
The application requires that all CVs are uploaded via a pre-signed S3 URL to ensure privacy and security.

**Step A: Request a pre-signed upload URL**
- **Endpoint**: `POST /api/files/presigned-url`
- **Request Body**:
  ```json
  {
    "filename": "resume.pdf",
    "filesize": 1048576 
  }
  ```
- **Response**:
  ```json
  {
    "key": "documents/123456789-resume.pdf",
    "uploadUrl": "https://s3.amazonaws.com/your-bucket/..."
  }
  ```

**Step B: Upload the file to S3**
- **Method**: `PUT`
- **URL**: Use the `uploadUrl` returned in Step A.
- **Headers**: `Content-Type: application/pdf`
- **Body**: The binary content of the file.

**Step C: Record the file in the database**
- **Endpoint**: `POST /api/files`
- **Request Body**:
  ```json
  {
    "key": "documents/123456789-resume.pdf"
  }
  ```
- **Response**: Returns the file record, which includes the `id` (this is your `cvFileId`).

---

### 2. Submit the Form
Once you have the `cvFileId`, submit the form responses.

- **Endpoint**: `POST /api/forms/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/submissions`
- **Request Body**:
  ```json
  {
    "cvFileId": 123,
    "answers": [
      { "fieldId": 1, "value": "John Doe" },
      { "fieldId": 2, "optionId": 5 }
    ]
  }
  ```
- **Success Response**: `201 Created`
- **Validation**:
  - The endpoint validates that all mandatory fields are present.
  - The system checks if the current time is within the form's `openAt` and `closeAt` window.
  - The submission is recorded atomically.

---

### 3. Update Form Schedule
To open a form immediately and schedule a closing time, use the following endpoint:

- **Endpoint**: `PATCH /api/forms/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/status`
- **Request Body**:
  ```json
  {
    "closeAt": "2026-09-10T17:00:00.000Z"
  }
  ```
- **Behavior**: 
  - The form is automatically opened at the time of the request.
  - The form will automatically close at the provided ISO 8601 timestamp.
  - **Timezone Best Practice**: Always send full ISO 8601 strings (ending with `Z` for UTC). The backend will handle the comparison safely using UTC timestamps.


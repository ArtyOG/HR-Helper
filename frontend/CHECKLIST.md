# Frontend Refactoring & Feature Checklist

> **Purpose**: This checklist tracks planned UI enhancements, API integrations, and technical debt for the frontend. Agents and developers should consult this file before implementing or modifying frontend features. When you complete an item or section, remove it from this checklist.

---

## 1. Interview Timeslots: Backend Delete Endpoints Integration
- [ ] **Backend Endpoint Implementation**:
  - Add `DELETE /api/forms/:formId/interview-slots/:slotId` in `backend/src/modules/interview-slots` to allow HR users to permanently delete an individual unbooked interview slot from MySQL.
  - Add `DELETE /api/forms/:formId/interview-slots` to allow HR users to clear all unbooked interview slots for a form.
- [ ] **Frontend API Integration**:
  - In `frontend/src/services/api.js`, add `deleteInterviewSlot(formId, slotId)` and `clearInterviewSlots(formId)`.
  - Wire the inline `[X]` delete button and "Clear All" trigger in the Timeslot Manager to invoke the backend delete endpoints for previously persisted slots.

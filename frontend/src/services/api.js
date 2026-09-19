const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const API_PREFIX = '/api';

export function googleAuthUrl() {
  return `${API_URL}/auth/google`;
}

export async function getApiHealth() {
  const response = await fetch(`${API_URL}${API_PREFIX}/health`);
  if (!response.ok) throw new Error('API health request failed');
  return response.json();
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  const response = await fetch(`${API_URL}${API_PREFIX}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.message || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function checkAuth() {
  let response;
  try {
    response = await fetch(`${API_URL}${API_PREFIX}/forms`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
  } catch {
    throw new Error('Unable to verify session (network error)');
  }

  if (response.status === 200) return { authenticated: true };
  if (response.status === 401) return { authenticated: false };

  const error = new Error(`Session check failed (${response.status})`);
  error.status = response.status;
  throw error;
}

export async function logout() {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.message || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export function listForms() {
  return request('/forms');
}

export function getForm(id) {
  return request(`/forms/${id}`);
}

export function createForm(payload) {
  return request('/forms', { method: 'POST', body: payload });
}

export function updateForm(formId, payload) {
  return request(`/forms/${formId}`, { method: 'PATCH', body: payload });
}

export function updateFormSchedule(formId, closeAt) {
  return request(`/forms/${formId}/status`, { method: 'PATCH', body: { closeAt } });
}

export function deleteForm(formId) {
  return request(`/forms/${formId}`, { method: 'DELETE' });
}

export function copyForm(formId) {
  return request(`/forms/${formId}/copy`, { method: 'POST' });
}

export function getPresignedUploadUrl(filename, filesize) {
  return request('/files/presigned-url', { method: 'POST', body: { filename, filesize } });
}

export function createFileRecord(key) {
  return request('/files', { method: 'POST', body: { key } });
}

export async function uploadCvToS3(uploadUrl, file) {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/pdf' },
    body: file,
  });
  if (!response.ok) throw new Error(`File upload failed (${response.status})`);
}

export function getFileDownloadUrl(fileId) {
  return request(`/files/${fileId}`);
}

export function submitFormAnswers(formId, payload) {
  return request(`/forms/${formId}/submissions`, { method: 'POST', body: payload });
}

export function listSubmissions(formId) {
  return request(`/forms/${formId}/submissions`);
}

export function getSubmission(formId, submissionId) {
  return request(`/forms/${formId}/submissions/${submissionId}`);
}

export function deleteSubmission(formId, submissionId) {
  return request(`/forms/${formId}/submissions/${submissionId}`, { method: 'DELETE' });
}

export function updateSubmissionStatus(formId, submissionId, status) {
  return request(`/forms/${formId}/submissions/${submissionId}/status`, {
    method: 'PATCH',
    body: { status },
  });
}

export function bulkUpdateSubmissionStatus(formId, submissionIds, status) {
  return request(`/forms/${formId}/submissions/bulk/status`, {
    method: 'PATCH',
    body: { submissionIds, status },
  });
}

export function rescoreSubmission(formId, submissionId) {
  return request(`/forms/${formId}/submissions/${submissionId}/rescore`, {
    method: 'POST',
  });
}

export function listInterviewSlots(formId) {
  return request(`/forms/${formId}/interview-slots`);
}

export function createInterviewSlots(formId, slots) {
  return request(`/forms/${formId}/interview-slots`, {
    method: 'POST',
    body: { slots },
  });
}

export function listAvailableInterviewSlots(formId) {
  return request(`/forms/${formId}/interview-slots/available`);
}

export function bookInterviewSlot(submissionId, slotId) {
  return request(`/submissions/${submissionId}/interview-slot`, {
    method: 'POST',
    body: { slotId },
  });
}
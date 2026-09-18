function answerValue(answers, field) {
  if (!field) return '';
  const answer = (Array.isArray(answers) ? answers : []).find(
    (a) => a.fieldId === field.id
  );
  if (!answer) return '';
  return answer.option?.value ?? answer.value ?? '';
}

export function getApplicantName(submission, form) {
  if (!submission) return '';
  const fields = form?.fields;
  const answers = submission.answers;

  if (Array.isArray(fields) && Array.isArray(answers)) {
    const fieldFor = (regex) => fields.find((f) => regex.test((f.label || '').trim()));
    const first = answerValue(answers, fieldFor(/^first name$/i));
    const last = answerValue(answers, fieldFor(/^last name$/i));
    const full = `${first} ${last}`.trim();
    if (full) return full;
  }

  return submission.email || '';
}

export function initialsFromNameOrEmail(name, email = '') {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  const local = email.split('@')[0] || email;
  const emailParts = local.split(/[.\s_-]+/).filter(Boolean);
  if (emailParts.length >= 2) return (emailParts[0][0] + emailParts[1][0]).toUpperCase();
  return local.slice(0, 2).toUpperCase();
}
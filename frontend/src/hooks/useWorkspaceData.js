import { useCallback, useEffect, useState } from 'react';
import { listForms, listSubmissions, getForm, listInterviewSlots } from '../services/api';

export function useForms({ enabled = true } = {}) {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listForms();
      setForms(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to load forms.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const data = await listForms();
        if (!cancelled) setForms(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load forms.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { forms, loading, error, refresh, setForms };
}

export function useSubmissions(formId, { enabled = true } = {}) {
  const [submissions, setSubmissions] = useState(null);
  const [loading, setLoading] = useState(enabled && !!formId);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!formId) return null;
    setLoading(true);
    setError(null);
    try {
      const data = await listSubmissions(formId);
      setSubmissions(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to load submissions.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    if (!enabled || !formId) {
      setSubmissions(null);
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const data = await listSubmissions(formId);
        if (!cancelled) setSubmissions(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load submissions.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, formId]);

  return { submissions, loading, error, refresh };
}

export function useFormDetail(formId, { enabled = true } = {}) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(enabled && !!formId);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!formId) return null;
    setLoading(true);
    setError(null);
    try {
      const data = await getForm(formId);
      setDetail(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to load the form.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    if (!enabled || !formId) {
      setDetail(null);
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const data = await getForm(formId);
        if (!cancelled) setDetail(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load the form.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, formId]);

  return { detail, loading, error, refresh };
}

export async function fetchWorkspaceData(forms, { includeSlots = true } = {}) {
  const list = Array.isArray(forms) ? forms : [];
  const results = await Promise.all(
    list.map(async (form) => {
      const calls = includeSlots
        ? [
            listSubmissions(form.id).catch(() => []),
            getForm(form.id).catch(() => null),
            listInterviewSlots(form.id).catch(() => []),
          ]
        : [listSubmissions(form.id).catch(() => []), getForm(form.id).catch(() => null)];
      const [subs, detail, slots] = await Promise.all(calls);
      return { form, detail: detail || form, submissions: Array.isArray(subs) ? subs : [], slots: slots || [] };
    })
  );
  return results;
}
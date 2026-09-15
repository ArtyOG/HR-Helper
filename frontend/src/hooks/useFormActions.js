import { useEffect, useRef, useState } from 'react';
import { deleteForm, copyForm, updateFormSchedule } from '../services/api';

export function useFormActions({ onUnauthorized, onDeleted, onDuplicated, onScheduled } = {}) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(null);
  const copyTimer = useRef(null);
  const [dupNotice, setDupNotice] = useState(null);
  const dupTimer = useRef(null);
  const [duplicating, setDuplicating] = useState(false);
  const [closeTarget, setCloseTarget] = useState(null);
  const [openTarget, setOpenTarget] = useState(null);
  const [scheduleBusy, setScheduleBusy] = useState(false);
  const [scheduleError, setScheduleError] = useState(null);

  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
      if (dupTimer.current) clearTimeout(dupTimer.current);
    },
    []
  );

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteForm(deleteTarget.id);
      onDeleted?.(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      if (err.status === 401) {
        onUnauthorized?.();
      } else {
        setDeleteError(err.message || 'Failed to delete the form.');
      }
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
    setDeleteError(null);
  };

  const copyLink = async (form) => {
    const url = `${window.location.origin}/apply/${form.id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
      } catch {
        /* ignore */
      }
      document.body.removeChild(textarea);
    }
    setCopiedLink(form.title);
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopiedLink(null), 2500);
  };

  const handleDuplicate = async (form) => {
    if (duplicating) return;
    setDuplicating(true);
    try {
      const dup = await copyForm(form.id);
      onDuplicated?.(dup);
      setDupNotice(dup.title || 'Form duplicated');
      if (dupTimer.current) window.clearTimeout(dupTimer.current);
      dupTimer.current = window.setTimeout(() => setDupNotice(null), 3000);
    } catch (err) {
      if (err.status === 401) {
        onUnauthorized?.();
      }
    } finally {
      setDuplicating(false);
    }
  };

  const applySchedule = async (form, closeAtISO) => {
    if (!form || scheduleBusy) return;
    setScheduleBusy(true);
    setScheduleError(null);
    try {
      const updated = await updateFormSchedule(form.id, closeAtISO);
      onScheduled?.(form.id, updated);
      setCloseTarget(null);
      setOpenTarget(null);
    } catch (err) {
      if (err.status === 401) {
        onUnauthorized?.();
      } else {
        setScheduleError(err.message || 'Failed to update the form schedule.');
      }
    } finally {
      setScheduleBusy(false);
    }
  };

  const closeFormNow = () => {
    if (!closeTarget) return;
    applySchedule(closeTarget, new Date().toISOString());
  };

  const cancelSchedule = () => {
    setCloseTarget(null);
    setOpenTarget(null);
    setScheduleError(null);
  };

  return {
    deleteTarget,
    deleteError,
    deleting,
    confirmDelete,
    cancelDelete,
    copiedLink,
    copyLink,
    dupNotice,
    duplicating,
    handleDuplicate,
    closeTarget,
    openTarget,
    scheduleBusy,
    scheduleError,
    applySchedule,
    closeFormNow,
    cancelSchedule,
    setDeleteTarget,
    setCloseTarget,
    setOpenTarget,
  };
}
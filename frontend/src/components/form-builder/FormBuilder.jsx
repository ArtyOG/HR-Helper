import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createForm, updateForm, updateFormSchedule } from '../../services/api';
import { useFormsBackNav } from '../../hooks/useFormsBackNav';
import { copyText } from '../../utils/clipboard';
import { DEFAULT_CLOSE_WINDOW_MS, formatDateTime, toLocalInput } from '../../utils/forms';

const FIELD_TYPES = ['TEXT', 'NUMBER', 'DATE', 'CHECKBOX', 'RADIO', 'SELECT'];

const buildFormLink = (formId) =>
  formId ? `${window.location.origin}/apply/${formId}` : null;

const DEFAULT_FIELDS = [
  { label: 'Email', type: 'TEXT', required: true, options: [] },
  { label: 'First name', type: 'TEXT', required: true, options: [] },
  { label: 'Last name', type: 'TEXT', required: true, options: [] },
  { label: 'Phone number', type: 'NUMBER', required: false, options: [] },
];

const BLANK_FIELDS = [
  { label: 'Email', type: 'TEXT', required: true, options: [] },
];

let uidCounter = 0;
const nextUid = () => `field-${Date.now()}-${uidCounter++}`;
const withUids = (fields) => fields.map((f) => ({ ...f, uid: nextUid() }));

const sortByOrder = (items) =>
  [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

const seedFields = (initialForm, templateFields) =>
  initialForm?.fields?.length
    ? withUids(
        sortByOrder(initialForm.fields).map((f) => ({
          label: f.label ?? '',
          type: f.type ?? 'TEXT',
          required: !!f.required,
          options: sortByOrder(f.options || []).map((o) => ({ value: o.value ?? o ?? '' })),
        })),
      )
    : withUids(templateFields);

const TYPE_META = {
  TEXT: { label: 'Text', icon: <path d="M4 6h16M4 10h16M4 14h10M4 18h7" /> },
  NUMBER: { label: 'Number', icon: <path d="M4 9h16M4 15h16M10 3v18M14 3v18" /> },
  DATE: { label: 'Date', icon: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></> },
  CHECKBOX: { label: 'Checkbox', icon: <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="m9 12 2 2 4-4" /></> },
  RADIO: { label: 'Radio', icon: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none" /></> },
  SELECT: { label: 'Select', icon: <path d="M8 9l4-4 4 4M8 15l4 4 4-4" /> },
};

function TypeIcon({ type, className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {TYPE_META[type]?.icon}
    </svg>
  );
}

function FieldTypeSelect({ value, onChange, onOpenChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const radioName = useId();

  const setOpenState = (next) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  const select = (type) => {
    onChange(type);
    setOpenState(false);
  };

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpenState(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={`fs-select ${open ? 'open' : ''} ${open ? 'relative' : ''}`}
      onClick={() => setOpenState(!open)}
    >
      <div className="fs-selected">
        <span className="fs-label">
          <TypeIcon type={value} className="h-3.5 w-3.5 shrink-0 text-gold" />
          {TYPE_META[value]?.label ?? value}
        </span>
        <svg viewBox="0 0 512 512" className="fs-arrow" aria-hidden="true">
          <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
        </svg>
      </div>

      <div className="fs-options" role="listbox" aria-label="Question type">
        {FIELD_TYPES.map((type) => (
          <label
            key={type}
            className={`fs-option ${type === value ? 'is-current' : ''}`}
            role="presentation"
            onClick={(e) => {
              e.stopPropagation();
              select(type);
            }}
          >
            <input
              type="radio"
              name={radioName}
              value={type}
              checked={type === value}
              onChange={() => select(type)}
            />
            <span className="fs-option-body">
              <TypeIcon type={type} className="h-3.5 w-3.5 shrink-0 text-teal" />
              {TYPE_META[type]?.label ?? type}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function OptionsEditor({ options, onChange }) {
  const [leavingKey, setLeavingKey] = useState(null);
  const leavingRef = useRef(null);

  useEffect(
    () => () => {
      if (leavingRef.current) {
        clearTimeout(leavingRef.current);
        leavingRef.current = null;
      }
    },
    []
  );

  const keyOf = (opt, idx) => String(opt.id ?? opt.key ?? idx);

  const update = (idx, value) => {
    const next = options.map((o, i) => (i === idx ? { ...o, value } : o));
    onChange(next);
  };

  const addOption = () => {
    onChange([...options, { value: '', key: `option-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }]);
  };

  const moveOption = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= options.length) return;
    const next = [...options];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  const removeOption = (opt, idx) => {
    if (leavingRef.current) return;
    const key = keyOf(opt, idx);
    setLeavingKey(key);
    leavingRef.current = setTimeout(() => {
      onChange(options.filter((o, i) => keyOf(o, i) !== key));
      setLeavingKey(null);
      leavingRef.current = null;
    }, 180);
  };

  return (
    <div className="mt-2 space-y-2">
      {options.map((opt, idx) => {
        const key = keyOf(opt, idx);
        const leaving = leavingKey === key;
        return (
          <div key={key} className={`flex items-center gap-2 ${leaving ? 'option-out' : 'option-in'}`}>
            <span className="w-4 shrink-0 text-xs text-stone-400">{idx + 1}.</span>
            <input
              value={opt.value}
              onChange={(e) => update(idx, e.target.value)}
              placeholder="Option label"
              className="h-9 flex-1 rounded-[12px] bg-[#d9d9d9] px-3 text-sm text-stone-700 outline-none"
            />
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => moveOption(idx, -1)}
                disabled={idx === 0}
                aria-label="Move option up"
                title="Move up"
                className="flex h-6 w-6 items-center justify-center rounded-full text-teal transition hover:bg-plum hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="m18 15-6-6-6 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => moveOption(idx, 1)}
                disabled={idx === options.length - 1}
                aria-label="Move option down"
                title="Move down"
                className="flex h-6 w-6 items-center justify-center rounded-full text-teal transition hover:bg-plum hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </div>
            <button
              type="button"
              onClick={() => removeOption(opt, idx)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-teal transition hover:bg-plum hover:text-white"
              aria-label="Remove option"
            >
              &times;
            </button>
          </div>
        );
      })}
      <button
        type="button"
        onClick={addOption}
        className="text-xs font-semibold text-plum transition hover:underline"
      >
        + Add option
      </button>
    </div>
  );
}

function FieldCard({ field, index, onChange, onRemove, showErrors, isEmail, isDuplicate, leaving, uid, siblingDragging }) {
  const [selectOpen, setSelectOpen] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: uid, disabled: isEmail });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 40 : selectOpen ? 30 : undefined,
      }}
      className={isDragging || selectOpen ? 'relative' : ''}
    >
      <div
        className={`group flex flex-col rounded-[20px] bg-white/70 p-4 shadow-sm ring-1 ring-plum/10 transition-all duration-300 focus-within:shadow-md focus-within:ring-plum/30 ${
          leaving ? 'field-out' : 'field-in'
        } ${
          isDragging
            ? 'cursor-grabbing scale-[1.04] rotate-[1deg] bg-white shadow-[0_18px_36px_rgba(49,74,61,0.3)] ring-2 ring-teal/60'
            : ''
        } ${siblingDragging ? 'opacity-50' : ''}`}
      >
      <div className="flex w-full items-start gap-3">
        {!isEmail && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label="Drag to reorder question"
            title="Drag to reorder"
            className="mt-5 cursor-grab touch-none rounded-full p-0.5 text-stone-400 opacity-40 transition hover:bg-[#e8e6dd] hover:text-plum group-hover:opacity-100 active:cursor-grabbing"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <circle cx="9" cy="5" r="1.4" />
              <circle cx="15" cy="5" r="1.4" />
              <circle cx="9" cy="12" r="1.4" />
              <circle cx="15" cy="12" r="1.4" />
              <circle cx="9" cy="19" r="1.4" />
              <circle cx="15" cy="19" r="1.4" />
            </svg>
          </button>
        )}
        <div className="group relative w-full">
          <input
            id={`field-label-${index}`}
            type="text"
            value={field.label}
            onChange={(e) => onChange({ ...field, label: e.target.value })}
            readOnly={isEmail}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById(`field-label-${index + 1}`)?.focus();
              }
            }}
            placeholder=" "
            className="peer w-full border-b-2 border-neutral-300 bg-transparent pb-1.5 pt-5 text-base text-neutral-900 outline-none transition-colors duration-300 disabled:cursor-not-allowed"
          />
          <label
            htmlFor={`field-label-${index}`}
            className="pointer-events-none absolute left-0 top-5 text-base text-neutral-400 transition-all duration-300 ease-out group-hover:text-neutral-600 peer-focus:-translate-y-6 peer-focus:text-sm peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-neutral-900"
          >
            Question
          </label>
          <span className="absolute bottom-0 left-0 h-[2px] w-full scale-x-0 bg-neutral-900 transition-transform duration-300 ease-out group-hover:scale-x-100 peer-focus:scale-x-100 peer-[:not(:placeholder-shown)]:scale-x-100" />
          {showErrors && !field.label.trim() && (
            <p className="mt-1 text-[11px] font-semibold text-red-500">Question label is required</p>
          )}
          {showErrors && isDuplicate && <p className="mt-1 text-[11px] font-semibold text-red-500">Duplicate label, change one of them.</p>}
        </div>
        {isEmail ? (
          <span
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-plum"
            aria-label="Mandatory field"
            title="Email is mandatory and cannot be removed"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          </span>
        ) : (
          <button
            type="button"
            onClick={onRemove}
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-teal transition hover:bg-plum hover:text-white"
            aria-label="Remove field"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path strokeLinecap="round" d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
            </svg>
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span className="text-xs font-semibold text-plum">Type:</span>
        {isEmail ? (
          <span className="flex h-[38px] w-36 items-center justify-between rounded-[20px] bg-[#e8e6dd] px-3 text-xs font-medium text-stone-500">
            Text
          </span>
        ) : (
          <FieldTypeSelect
            value={field.type}
            onChange={(type) => onChange({ ...field, type })}
            onOpenChange={setSelectOpen}
          />
        )}
        <label className="ml-auto flex shrink-0 cursor-pointer items-center gap-2 text-xs font-medium text-stone-600">
          <input
            type="checkbox"
            checked={isEmail ? true : !!field.required}
            disabled={isEmail}
            onChange={(e) => onChange({ ...field, required: e.target.checked })}
            className="h-4 w-4 rounded accent-plum disabled:cursor-not-allowed disabled:opacity-70"
          />
          {isEmail ? 'Required (mandatory)' : 'Required'}
        </label>
      </div>

      {(field.type === 'RADIO' || field.type === 'SELECT' || field.type === 'CHECKBOX') && (
        <OptionsEditor options={field.options || []} onChange={(options) => onChange({ ...field, options })} />
      )}
      </div>
    </div>
  );
}

function UploadZone({ icon, title, subtitle, onRemove }) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 rounded-[20px] border-2 border-dashed border-plum/20 bg-white/60 px-8 py-12 text-center transition hover:border-plum/40">
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${title}`}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-teal shadow-sm ring-1 ring-plum/10 transition hover:bg-plum hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="h-3.5 w-3.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d9d9d9] text-plum">{icon}</span>
      <div>
        <p className="text-sm font-semibold text-plum">{title}</p>
        <p className="mt-0.5 text-xs text-stone-500">{subtitle}</p>
      </div>
    </div>
  );
}

function UploadSection({ includeCoverLetter, onIncludeCoverLetterChange }) {
  return (
    <section className="rounded-[20px] bg-[#f2efe7] p-5 ring-1 ring-plum/10 sm:p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-plum">Uploads</h3>
        {!includeCoverLetter && (
          <button
            type="button"
            onClick={() => onIncludeCoverLetterChange(true)}
            className="rounded-full bg-plum px-4 py-2 text-xs font-semibold text-white transition hover:bg-plum-dark"
          >
            + Add cover letter
          </button>
        )}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <UploadZone
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6"><path strokeLinecap="round" d="M7 3h7l4 4v14a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" /><path strokeLinecap="round" d="M14 3v4h4" /></svg>}
          title="Upload your CV"
          subtitle="Drop your CV here / PDF Max 10MB"
        />
        {includeCoverLetter && (
          <UploadZone
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6"><path strokeLinecap="round" d="M17 8h2a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2h7l2 2 4 4z" /></svg>}
            title="Cover letter"
            subtitle="Drop your cover letter here"
            onRemove={() => onIncludeCoverLetterChange(false)}
          />
        )}
      </div>
      <p className="mt-3 text-[11px] text-stone-400">
        Note: uploaded files are stored as a single CV attachment per submission.
      </p>
    </section>
  );
}

function StatusCard({ variant = 'success', message, subText, onClose }) {
  const success = variant === 'success';
  const warn = variant === 'warning';
  const color = success ? '#269b24' : warn ? '#b45309' : '#d64545';
  const waveFill = success ? '#04e4003a' : warn ? '#f59e0b33' : '#ff53533a';
  const iconBg = success ? '#04e40048' : warn ? '#fcd34d66' : '#ff535348';

  return (
    <div className="relative mt-6 flex w-full max-w-[330px] items-center gap-3.5 overflow-hidden rounded-lg bg-white px-[15px] py-[10px] shadow-[0_8px_24px_rgba(149,157,165,0.2)]">
      <svg
        viewBox="0 0 80 40"
        fill={waveFill}
        aria-hidden="true"
        className="pointer-events-none absolute -left-[31px] top-[32px] w-20 rotate-90"
      >
        <path d="M0 40 Q10 20 20 40 Q30 60 40 40 Q50 20 60 40 Q70 60 80 40 V80 H0 Z" />
      </svg>

      <span
        className="relative ml-2 flex h-[35px] w-[35px] items-center justify-center rounded-full"
        style={{ backgroundColor: iconBg }}
      >
        {warn ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color }} className="h-[17px] w-[17px]">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
        ) : success ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color }} className="h-[17px] w-[17px]">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="h-[17px] w-[17px]" style={{ color }}>
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        )}
      </span>

      <div className="flex flex-1 flex-col items-start justify-center">
        <p className="text-[17px] font-bold" style={{ color }}>
          {message}
        </p>
        {subText && <p className="text-sm text-[#555]">{subText}</p>}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="shrink-0 cursor-pointer text-[#555] transition hover:text-stone-800"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="h-[18px] w-[18px]">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

function FormBuilder({ initialForm = null, template = 'standard' }) {
  const backTo = useFormsBackNav();
  const isEditing = Boolean(initialForm);
  const templateFields = template === 'blank' ? BLANK_FIELDS : DEFAULT_FIELDS;
  const [title, setTitle] = useState(initialForm?.title ?? '');
  const [description, setDescription] = useState(initialForm?.description ?? '');
  const [requirements, setRequirements] = useState(initialForm?.requirements ?? '');
  const [fields, setFields] = useState(() => seedFields(initialForm, templateFields));
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formLink, setFormLink] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [includeCoverLetter, setIncludeCoverLetter] = useState(true);
  const [scheduleEnabled, setScheduleEnabled] = useState(!!initialForm?.closeAt);
  const [closeAtLocal, setCloseAtLocal] = useState(() =>
    initialForm?.closeAt
      ? toLocalInput(initialForm.closeAt)
      : toLocalInput(new Date(Date.now() + DEFAULT_CLOSE_WINDOW_MS))
  );
  const closeAtISO = (() => {
    if (!closeAtLocal) return null;
    const d = new Date(closeAtLocal);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  })();
  const [scheduleNote, setScheduleNote] = useState('');
  const [scheduleWarning, setScheduleWarning] = useState('');
  const opensOnFixed = useMemo(() => toLocalInput(new Date()), []);
  const [showErrors, setShowErrors] = useState(false);
  const [pillHovered, setPillHovered] = useState('submit');
  const [pill, setPill] = useState({ x: 0, w: 0, ready: false });
  const [leavingField, setLeavingField] = useState(null);
  const [activeFieldId, setActiveFieldId] = useState(null);
  const cancelBtnRef = useRef(null);
  const submitBtnRef = useRef(null);
  const leavingFieldTimerRef = useRef(null);
  const redirectTimerRef = useRef(null);

  const movePill = (ref) => {
    if (!ref.current) return;
    setPill({ x: ref.current.offsetLeft, w: ref.current.offsetWidth, ready: true });
  };

  useLayoutEffect(() => {
    movePill(submitBtnRef);
    const remeasure = () => movePill(submitBtnRef);
    window.addEventListener('resize', remeasure);
    return () => window.removeEventListener('resize', remeasure);
  }, []);

  useEffect(() => {
    if (initialForm) {
      setTitle(initialForm.title ?? '');
      setDescription(initialForm.description ?? '');
      setRequirements(initialForm.requirements ?? '');
      setScheduleEnabled(!!initialForm.closeAt);
      setCloseAtLocal(
        initialForm.closeAt
          ? toLocalInput(initialForm.closeAt)
          : toLocalInput(new Date(Date.now() + DEFAULT_CLOSE_WINDOW_MS))
      );
    }
    setFields(seedFields(initialForm, templateFields));
  }, [initialForm, template]);

  const addField = () => {
    setFields((prev) => [...prev, { uid: nextUid(), label: '', type: 'TEXT', required: false, options: [] }]);
  };

  const isEmailField = (f) => (f.label || '').trim().toLowerCase() === 'email';

  const updateField = (idx, next) => {
    setFields((prev) =>
      prev.map((f, i) => {
        if (i !== idx) return f;
        if (isEmailField(f)) return { ...next, label: 'Email', type: 'TEXT', required: true };
        return next;
      })
    );
  };

  const removeField = (idx) => {
    const target = fields[idx];
    if (!target || isEmailField(target)) return;
    setLeavingField(idx);
    if (leavingFieldTimerRef.current) clearTimeout(leavingFieldTimerRef.current);
    leavingFieldTimerRef.current = setTimeout(() => {
      setFields((prev) => prev.filter((_, i) => i !== idx));
      setLeavingField(null);
      leavingFieldTimerRef.current = null;
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (leavingFieldTimerRef.current) clearTimeout(leavingFieldTimerRef.current);
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    setFields((prev) => {
      const oldIndex = prev.findIndex((f) => f.uid === active.id);
      const newIndex = prev.findIndex((f) => f.uid === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      if (isEmailField(prev[oldIndex]) || isEmailField(prev[newIndex])) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const hasDuplicateLabels = (list) => {
    const seen = new Set();
    for (const f of list) {
      const label = (f.label || '').trim().toLowerCase();
      if (label && seen.has(label)) return true;
      if (label) seen.add(label);
    }
    return false;
  };

  const buildPayload = () => {
    const clean = fields
      .filter((f) => f.label.trim() !== '')
      .map((f, fieldIdx) => ({
        label: f.label.trim(),
        type: f.type === 'EMAIL' ? 'TEXT' : f.type,
        required: !!f.required,
        order: fieldIdx,
        options: (f.options || [])
          .filter((o) => o.value.trim() !== '')
          .map((o, optIdx) => ({ value: o.value.trim(), order: optIdx })),
      }));

    return {
      title: title.trim(),
      description: description.trim() || undefined,
      requirements: requirements.trim() || undefined,
      fields: clean,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNeedsSignIn(false);
    setError(null);
    setScheduleNote('');
    setScheduleWarning('');

    if (!title.trim()) {
      setError('Form title is required.');
      return;
    }
    if (!requirements.trim()) {
      setError('Job requirements are required — the AI scoring needs them.');
      return;
    }
    if (fields.length === 0) {
      setError('Add at least one question.');
      return;
    }

    const hasEmptyLabel = fields.some((f) => !(f.label || '').trim());
    if (hasEmptyLabel) {
      setShowErrors(true);
      setError('Every question needs a label before saving.');
      return;
    }

    if (!fields.some(isEmailField)) {
      setShowErrors(true);
      setError('Every form must include an Email question.');
      return;
    }

    if (hasDuplicateLabels(fields)) {
      setShowErrors(true);
      setError('Duplicate question labels. Please change one of them.');
      return;
    }

    if (scheduleEnabled) {
      if (!closeAtISO) {
        setError('Choose a closing time for the schedule.');
        return;
      }
      if (new Date(closeAtISO) <= new Date()) {
        setError('Closing time must be after the form opens (publish time).');
        return;
      }
    }

    const payload = buildPayload();
    if (payload.fields.length === 0) {
      setError('Add at least one question with a label.');
      return;
    }

    setSubmitting(true);
    setFormLink(null);
    setLinkCopied(false);
    try {
      let publishedLink;
      let formId;
      if (isEditing) {
        await updateForm(initialForm.id, payload);
        formId = initialForm.id;
        publishedLink = buildFormLink(initialForm.id);
      } else {
        const created = await createForm(payload);
        formId = created?.id;
        publishedLink = buildFormLink(formId);
      }

      let scheduleNoteText = '';
      let scheduleWarningText = '';
      if (formId && (scheduleEnabled || initialForm?.closeAt)) {
        try {
          if (scheduleEnabled) {
            await updateFormSchedule(formId, closeAtISO);
            scheduleNoteText = ` Close at: ${formatDateTime(closeAtISO)} — the form closes automatically.`;
          } else {
            await updateFormSchedule(formId, null);
            scheduleNoteText = ' No close time is set, so the form is closed to applications until you schedule one.';
          }
        } catch (scheduleErr) {
          scheduleWarningText = scheduleErr?.message || 'The closing time could not be updated.';
        }
      }
      setScheduleNote(scheduleNoteText);
      setScheduleWarning(scheduleWarningText);

      setFormLink(publishedLink);
      if (!scheduleWarningText) {
        setSuccess(true);
        if (publishedLink) {
          setLinkCopied(await copyText(publishedLink));
        }
        redirectTimerRef.current = setTimeout(() => backTo(), 1600);
      }
    } catch (err) {
      if (err.status === 401) {
        setNeedsSignIn(true);
      } else {
        setError(err.message || 'Failed to publish the form.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = async () => {
    if (!formLink) return;
    setLinkCopied(await copyText(formLink));
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[20px] bg-[#f2efe7] p-5 ring-1 ring-plum/10 sm:p-8 lg:p-10">
      <p className="text-center font-sans text-xl font-semibold text-plum">
        {isEditing ? 'Edit Hiring Form' : 'New Hiring Form'}
      </p>

      <label className="mb-2 mt-4 block text-base font-bold text-plum">
        Title <span className="text-red-500">*</span>
      </label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('form-description')?.focus();
          }
        }}
        placeholder="Hiring - UX Designer — Product Team"
        className="w-full rounded-[20px] bg-[#d9d9d9] px-5 py-4 text-lg font-semibold text-stone-800 outline-none transition placeholder:font-normal placeholder:text-stone-400 focus:bg-[#cfcfcf] sm:text-xl"
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-plum">JOB DESCRIPTION</label>
          <textarea
            id="form-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('form-requirements')?.focus();
              }
            }}
            rows={5}
            placeholder="Describe the role..."
            className="w-full resize-y rounded-[20px] bg-[#d9d9d9] px-4 py-3 text-sm text-stone-700 outline-none transition placeholder:text-stone-400 focus:bg-[#cfcfcf]"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-plum">
            Job Requirements <span className="text-red-500">*</span>
          </label>
          <textarea
            id="form-requirements"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const firstEditable = fields.findIndex((f) => !isEmailField(f));
                if (firstEditable !== -1) {
                  document.getElementById(`field-label-${firstEditable}`)?.focus();
                }
              }
            }}
            rows={5}
            placeholder="eg. React, Node.js, MySQL, etc.."
            className="w-full resize-y rounded-[20px] bg-[#d9d9d9] px-4 py-3 text-sm text-stone-700 outline-none transition placeholder:text-stone-400 focus:bg-[#cfcfcf]"
          />
        </div>
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-plum">Questions</h3>
          <button
            type="button"
            onClick={addField}
            className="rounded-full bg-plum px-4 py-2 text-xs font-semibold text-white transition hover:bg-plum-dark"
          >
            + Add question
          </button>
        </div>
        <p className="mt-3 rounded-xl bg-gold/15 px-4 py-3 text-xs font-medium leading-relaxed text-plum">
          <span className="font-bold">Recommended:</span> add a{' '}
          <span className="font-bold">"First name"</span> and a{' '}
          <span className="font-bold">"Last name"</span> question so the applicant's name is shown
          across your dashboard — otherwise their email is displayed automatically.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={({ active }) => setActiveFieldId(active.id)}
            onDragEnd={(event) => { setActiveFieldId(null); handleDragEnd(event); }}
            onDragCancel={() => setActiveFieldId(null)}
          >
            <SortableContext items={fields.map((f) => f.uid)} strategy={rectSortingStrategy}>
              {fields.map((field, idx) => (
                <FieldCard
                  key={field.uid}
                  uid={field.uid}
                  field={field}
                  index={idx}
                  showErrors={showErrors}
                  isEmail={isEmailField(field)}
                  isDuplicate={!isEmailField(field) && fields.some((f, i) => i !== idx && (f.label || '').trim().toLowerCase() === (field.label || '').trim().toLowerCase() && (field.label || '').trim() !== '')}
                  leaving={leavingField === idx}
                  siblingDragging={activeFieldId !== null && activeFieldId !== field.uid}
                  onChange={(next) => updateField(idx, next)}
                  onRemove={() => removeField(idx)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </section>

      <div className="mt-8">
        <UploadSection includeCoverLetter={includeCoverLetter} onIncludeCoverLetterChange={setIncludeCoverLetter} />
      </div>

      <section className="mt-8 rounded-[20px] bg-[#f2efe7] p-5 ring-1 ring-plum/10 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-plum">Schedule</h3>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-stone-600">
            <input
              type="checkbox"
              checked={scheduleEnabled}
              onChange={(e) => setScheduleEnabled(e.target.checked)}
              className="h-4 w-4 rounded accent-plum"
            />
            Set close time
          </label>
        </div>

        {!scheduleEnabled && (
          <p className="mt-3 text-[11px] font-medium text-stone-400">
            No close time set — the form will not accept applications until you set one.
          </p>
        )}

        {scheduleEnabled && (
          <div className="mt-5 max-w-lg space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-plum">Opens on</label>
                <input
                  type="datetime-local"
                  value={opensOnFixed}
                  readOnly
                  className="w-full cursor-not-allowed rounded-[20px] bg-[#efede5] px-4 py-3 text-sm text-stone-500 outline-none"
                />
                <p className="mt-1 text-[11px] text-stone-400">
                  Fixed — the form opens the moment you publish it.
                </p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-plum">Close at</label>
                <input
                  type="datetime-local"
                  value={closeAtLocal}
                  min={opensOnFixed}
                  onChange={(e) => setCloseAtLocal(e.target.value)}
                  className="w-full rounded-[20px] bg-[#d9d9d9] px-4 py-3 text-sm text-stone-700 outline-none transition focus:bg-[#cfcfcf]"
                />
              </div>
            </div>
            <p className="text-[11px] text-stone-400">
              Submissions are blocked automatically after the close time.
            </p>
          </div>
        )}
      </section>

      {scheduleWarning && (
        <StatusCard
          variant="warning"
          message={isEditing ? 'Form saved, but the close time was not updated' : 'Form published, but the close time was not set'}
          subText={scheduleWarning}
          onClose={() => setScheduleWarning('')}
        />
      )}

      {success && (
        <div>
          <StatusCard
            variant="success"
            message={isEditing ? 'Saved Successfully!' : 'Published Successfully!'}
            subText={
              (linkCopied
                ? `${
                    isEditing ? 'Your hiring form has been updated.' : (scheduleEnabled ? 'Your hiring form is now live.' : 'Your hiring form is saved, but closed to applications until you set a close time.')
                  } The form link was copied to your clipboard.`
                : `${
                    isEditing ? 'Your hiring form has been updated.' : (scheduleEnabled ? 'Your hiring form is now live.' : 'Your hiring form is saved, but closed to applications until you set a close time.')
                  } ${formLink ? 'Copy the form link below to share it.' : ''}`) + scheduleNote
            }
            onClose={() => setSuccess(false)}
          />
        </div>
      )}

      {formLink && (
        <div className="mt-3 flex items-center gap-2 rounded-[20px] bg-white/70 px-4 py-3 ring-1 ring-plum/10">
          <p className="min-w-0 flex-1 truncate text-xs text-stone-500">
            Form link: <span className="font-semibold text-plum">{formLink}</span>
          </p>
          <button
            type="button"
            onClick={handleCopyLink}
            className="shrink-0 rounded-full bg-plum px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-plum-dark"
          >
            {linkCopied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}

      {error && (
        <StatusCard
          variant="error"
          message="Failed to publish"
          subText={error}
          onClose={() => setError(null)}
        />
      )}

      {needsSignIn && (
        <div className="mt-6 flex flex-col items-start gap-3 rounded-[20px] bg-white/70 px-5 py-4 text-sm font-medium text-stone-700 ring-1 ring-plum/10">
          <p>You need to sign in before publishing a form.</p>
          <a
            href={`${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/auth/google`}
            className="rounded-full bg-plum px-5 py-2 text-sm font-semibold text-white transition hover:bg-plum-dark"
          >
            Sign in with Google
          </a>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <div
          className="relative inline-flex items-center gap-3"
          onMouseLeave={() => {
            setPillHovered('submit');
            movePill(submitBtnRef);
          }}
        >
          <span
            aria-hidden="true"
            style={{ transform: `translateX(${pill.x}px)`, width: `${pill.w}px` }}
            className={`absolute inset-y-0 rounded-full bg-plum transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
              pill.ready ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={backTo}
            onMouseEnter={() => {
              setPillHovered('cancel');
              movePill(cancelBtnRef);
            }}
            className={`relative z-10 rounded-full px-8 py-3 text-sm font-semibold transition-colors duration-200 ${
              pillHovered === 'submit' ? 'text-plum' : 'text-white'
            }`}
          >
            Cancel
          </button>
          <button
            ref={submitBtnRef}
            type="submit"
            disabled={submitting}
            onMouseEnter={() => {
              setPillHovered('submit');
              movePill(submitBtnRef);
            }}
            className={`relative z-10 inline-flex items-center justify-center rounded-full border px-8 py-3 text-sm font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
              pillHovered === 'submit' ? 'border-transparent text-white' : 'border-plum/40 text-plum'
            }`}
          >
            <span>
              {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Publish form'}
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}

export default FormBuilder;
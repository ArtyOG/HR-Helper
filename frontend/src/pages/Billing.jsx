import { useEffect, useState } from 'react';
import UserMenu from '../components/common/UserMenu';

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

const PLANS = {
  starter: {
    name: 'Starter',
    price: '$0',
    tagline: 'Free while you are getting started',
    badge: null,
    accent: '#B8860B',
    limits: [
      ['Active jobs', '3'],
      ['Candidates per job', 'Unlimited'],
      ['AI resume scans', '50 / mo'],
      ['Email sends', '150 / mo'],
    ],
  },
  pro: {
    name: 'Pro',
    price: '$29',
    tagline: 'For growing teams that need more',
    badge: 'Most popular',
    accent: '#23737A',
    limits: [
      ['Active jobs', '15'],
      ['Candidates per job', 'Unlimited'],
      ['AI resume scans', '1,000 / mo'],
      ['Email sends', '5,000 / mo'],
    ],
  },
  business: {
    name: 'Business',
    price: '$99',
    tagline: 'Scale hiring across your whole org',
    badge: null,
    accent: '#588157',
    limits: [
      ['Active jobs', 'Unlimited'],
      ['Candidates per job', 'Unlimited'],
      ['AI resume scans', 'Unlimited'],
      ['Email sends', 'Unlimited'],
    ],
  },
};

function PlanPickerModal({ open, currentKey, onClose, onSelect }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[auth-backdrop-in_0.3s_ease-out]"
        onClick={onClose}
      />
      <div className="relative flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl animate-[auth-card-in_0.45s_cubic-bezier(0.16,1,0.3,1)]">
        <div className="shrink-0 items-center justify-between border-b border-plum/10 px-6 py-4 sm:flex sm:px-8">
          <div>
            <h3 className="font-sans text-xl font-bold text-plum">Choose your plan</h3>
            <p className="mt-1 text-sm text-stone-500">Pricing and features that grow with your hiring</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close plan picker"
            className="mt-3 flex h-9 w-9 items-center justify-center rounded-full text-stone-400 transition hover:bg-plum/5 hover:text-plum sm:mt-0"
          >
            <XIcon />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6 sm:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {Object.entries(PLANS).map(([key, plan]) => {
            const isCurrent = key === currentKey;
            const isPopular = plan.badge !== null;
            return (
              <div
                key={key}
                className={`flex flex-col rounded-2xl border p-5 transition ${
                  isCurrent
                    ? 'border-plum/40 bg-plum/5'
                    : isPopular
                      ? 'border-teal/40 bg-teal/5'
                      : 'border-plum/10 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-sans text-lg font-bold text-[#344e41]">{plan.name}</h4>
                  {isPopular && (
                    <span className="rounded-full bg-teal px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-3xl font-extrabold text-plum">
                  {plan.price}<span className="text-base font-semibold text-stone-400">/mo</span>
                </p>
                <p className="mt-2 min-h-10 text-xs font-medium leading-relaxed text-stone-500">
                  {plan.tagline}
                </p>
                <ul className="mt-4 flex flex-col gap-2 border-t border-plum/10 pt-4">
                  {plan.limits.map(([label, value]) => (
                    <li key={label} className="flex items-center gap-2 text-xs text-stone-600">
                      <span className="text-teal">
                        <CheckIcon />
                      </span>
                      <span className="truncate">{label}</span>
                      <span className="ml-auto font-semibold text-[#344e41]">{value}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => onSelect(key)}
                  className={`mt-5 w-full rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                    isCurrent
                      ? 'bg-plum/10 text-plum'
                      : 'bg-plum text-white hover:bg-plum-dark'
                  }`}
                >
                  {isCurrent ? 'Current plan' : `Switch to ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
        </div>
      </div>
    </div>
  );
}

function PaymentMethodModal({ open, onClose, onSave }) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [email, setEmail] = useState('billing@hioring.app');

  if (!open) return null;

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    let digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) digits = `${digits.slice(0, 2)} / ${digits.slice(2)}`;
    return digits;
  };

  const canSubmit = cardNumber.replace(/\s/g, '').length === 16 && expiry.length === 7 && cvc.length >= 3 && email.includes('@');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    const lastFour = cardNumber.replace(/\D/g, '').slice(-4);
    onSave({ lastFour, expiry, email });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[auth-backdrop-in_0.3s_ease-out]"
        onClick={onClose}
      />
      <div className="relative flex max-h-full w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl animate-[auth-card-in_0.45s_cubic-bezier(0.16,1,0.3,1)]">
        <div className="shrink-0 items-center justify-between border-b border-plum/10 px-6 py-4 sm:flex sm:px-8">
          <div>
            <h3 className="font-sans text-xl font-bold text-plum">Update payment method</h3>
            <p className="mt-1 text-sm text-stone-500">Your card is stored securely for billing</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close payment method"
            className="mt-3 flex h-9 w-9 items-center justify-center rounded-full text-stone-400 transition hover:bg-plum/5 hover:text-plum sm:mt-0"
          >
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-6 sm:px-8">
          <label className="block text-sm font-semibold text-[#344e41]">
            Card number
            <input
              type="text"
              inputMode="numeric"
              placeholder="4242 4242 4242 4242"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              className="mt-2 w-full rounded-xl border border-plum/20 px-4 py-3 text-sm text-[#344e41] outline-none transition placeholder:text-stone-400 focus:border-plum focus:ring-2 focus:ring-plum/10"
            />
          </label>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="block text-sm font-semibold text-[#344e41]">
              Expiry
              <input
                type="text"
                inputMode="numeric"
                placeholder="08 / 28"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                className="mt-2 w-full rounded-xl border border-plum/20 px-4 py-3 text-sm text-[#344e41] outline-none transition placeholder:text-stone-400 focus:border-plum focus:ring-2 focus:ring-plum/10"
              />
            </label>
            <label className="block text-sm font-semibold text-[#344e41]">
              CVC
              <input
                type="text"
                inputMode="numeric"
                placeholder="123"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="mt-2 w-full rounded-xl border border-plum/20 px-4 py-3 text-sm text-[#344e41] outline-none transition placeholder:text-stone-400 focus:border-plum focus:ring-2 focus:ring-plum/10"
              />
            </label>
          </div>

          <label className="mt-4 block text-sm font-semibold text-[#344e41]">
            Billing email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-plum/20 px-4 py-3 text-sm text-[#344e41] outline-none transition placeholder:text-stone-400 focus:border-plum focus:ring-2 focus:ring-plum/10"
            />
          </label>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button
              type="submit"
              disabled={!canSubmit}
              className={`flex-1 rounded-full px-4 py-2.5 text-center text-sm font-semibold text-white transition ${
                canSubmit ? 'bg-plum hover:bg-plum-dark' : 'cursor-not-allowed bg-plum/30'
              }`}
            >
              Save payment method
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-plum/30 px-4 py-2.5 text-center text-sm font-semibold text-plum transition hover:bg-plum/5"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Billing() {
  const [open, setOpen] = useState(false);
  const [planKey, setPlanKey] = useState(() => localStorage.getItem('hioring_plan_key') || 'starter');
  const [payOpen, setPayOpen] = useState(false);
  const [card, setCard] = useState(() => {
    try {
      const stored = localStorage.getItem('hioring_card');
      return stored ? JSON.parse(stored) : { lastFour: '4242', expiry: '08 / 2028', email: 'billing@hioring.app' };
    } catch {
      return { lastFour: '4242', expiry: '08 / 2028', email: 'billing@hioring.app' };
    }
  });
  const plan = PLANS[planKey];

  useEffect(() => {
    localStorage.setItem('hioring_plan_key', planKey);
  }, [planKey]);

  useEffect(() => {
    localStorage.setItem('hioring_card', JSON.stringify(card));
  }, [card]);

  const selectPlan = (key) => {
    setPlanKey(key);
    setOpen(false);
  };

  const saveCard = (data) => setCard(data);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div>
          <h1 className="font-sans text-[26px] font-bold leading-none tracking-tight text-[#344e41]">
            Billing
          </h1>
          <p className="mt-2 text-sm font-medium text-stone-500">
            Manage your plan, payment method and invoices
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <UserMenu />
        </div>
      </div>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-plum/10 lg:col-span-2">
          <div className="border-b border-plum/10 px-6 py-4">
            <p className="text-xs font-bold uppercase tracking-wider text-plum">Current plan</p>
          </div>
          <div className="flex flex-wrap items-center gap-6 px-6 py-6">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#588157] text-white">
              <CardIcon />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-sans text-xl font-bold text-[#344e41]">{plan.name}</h2>
                <span className="rounded-full bg-teal/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-teal">
                  Active
                </span>
              </div>
              <p className="mt-1 text-sm text-stone-500">
                {plan.tagline} &middot; Unlimited candidates
              </p>
            </div>
            <div className="text-left lg:text-right">
              <p className="text-3xl font-extrabold text-plum">
                {plan.price}<span className="text-base font-semibold text-stone-400">/mo</span>
              </p>
              <p className="mt-1 text-xs text-stone-500">Renews Oct 1, 2026</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-plum/10 px-6 py-4">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-full border border-plum/20 px-5 py-2 text-sm font-semibold text-plum transition hover:bg-plum hover:text-white"
            >
              Manage plan
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-full bg-plum px-5 py-2 text-sm font-semibold text-white transition hover:bg-plum-dark"
            >
              Upgrade
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-plum/10">
          <div className="border-b border-plum/10 px-6 py-4">
            <p className="text-xs font-bold uppercase tracking-wider text-plum">Plan limits</p>
          </div>
          <ul className="divide-y divide-plum/5">
            {plan.limits.map(([label, value]) => (
              <li key={label} className="flex items-center justify-between gap-3 px-6 py-3.5 text-sm">
                <span className="text-stone-500">{label}</span>
                <span className="font-semibold text-[#344e41]">{value}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-plum/10">
          <div className="border-b border-plum/10 px-6 py-4">
            <p className="text-xs font-bold uppercase tracking-wider text-plum">Payment method</p>
          </div>
          <div className="flex items-center gap-4 px-6 py-6">
            <span className="flex h-11 w-16 items-center justify-center rounded-lg bg-[#f3f1e9] text-xs font-bold uppercase text-[#344e41]">
              Visa
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#344e41]">&bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; {card.lastFour}</p>
              <p className="mt-0.5 text-xs text-stone-500">Expires {card.expiry}</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-plum/10 px-6 py-4">
            <span className="text-sm text-stone-500">Billing email</span>
            <span className="truncate text-sm font-semibold text-[#344e41]">{card.email}</span>
          </div>
          <div className="px-6 pb-6">
            <button
              type="button"
              onClick={() => setPayOpen(true)}
              className="w-full rounded-full border border-plum/20 px-5 py-2 text-sm font-semibold text-plum transition hover:bg-plum hover:text-white"
            >
              Update payment method
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-plum/10 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-plum/10 px-6 py-4">
            <p className="text-xs font-bold uppercase tracking-wider text-plum">Invoices</p>
            <span className="rounded-full bg-[#f3f1e9] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-stone-500">
              Sample data
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-plum/5">
                {[
                  ['Sep 1, 2026', `${plan.name} plan — September`, plan.price === '$0' ? '$0.00' : `${plan.price}.00`, 'Paid'],
                  ['Aug 1, 2026', `${plan.name} plan — August`, plan.price === '$0' ? '$0.00' : `${plan.price}.00`, 'Paid'],
                  ['Jul 1, 2026', `${plan.name} plan — July`, plan.price === '$0' ? '$0.00' : `${plan.price}.00`, 'Paid'],
                ].map(([date, desc, amount, status]) => (
                  <tr key={date}>
                    <td className="px-6 py-3.5 font-semibold text-[#344e41]">{date}</td>
                    <td className="px-6 py-3.5 text-stone-600">{desc}</td>
                    <td className="px-6 py-3.5 text-right font-semibold text-stone-700">{amount}</td>
                    <td className="px-6 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-teal/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-teal">
                        <CheckIcon />
                        {status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <PlanPickerModal
        open={open}
        currentKey={planKey}
        onClose={() => setOpen(false)}
        onSelect={selectPlan}
      />
      <PaymentMethodModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        onSave={saveCard}
      />
    </div>
  );
}

export default Billing;
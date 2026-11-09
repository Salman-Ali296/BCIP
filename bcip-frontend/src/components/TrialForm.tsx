"use client";

import { useEffect, useState } from "react";
import { plans, TRIAL_DAYS } from "@/lib/plans";

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export default function TrialForm() {
  const [plan, setPlan] = useState("growth");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (plans.some((p) => p.id === id)) setPlan(id);
    };
    window.addEventListener("select-plan", handler);
    return () => window.removeEventListener("select-plan", handler);
  }, []);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") || "");
    const name = String(data.get("name") || "").trim();
    const business = String(data.get("business") || "").trim();

    if (!name || !business) return setError("Please fill in your name and business name.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter a valid email address.");

    setError("");
    // TODO: replace with a real call, e.g. fetch("/api/trial", { method: "POST", body: ... })
    setEndDate(
      addDays(new Date(), TRIAL_DAYS).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <h3 className="text-xl font-semibold text-emerald-900">Your trial is ready</h3>
        <p className="mt-2 text-emerald-800">
          You have full access until <strong>{endDate}</strong>. We have sent setup steps to your email.
        </p>
      </div>
    );
  }

  const input =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Your name
          <input name="name" className={`${input} mt-1`} placeholder="Ayesha Ali" />
        </label>
        <label className="block text-sm font-medium">
          Business name
          <input name="business" className={`${input} mt-1`} placeholder="Ali Traders" />
        </label>
      </div>
      <label className="block text-sm font-medium">
        Work email
        <input name="email" type="email" className={`${input} mt-1`} placeholder="you@business.pk" />
      </label>
      <label className="block text-sm font-medium">
        Plan to try
        <select value={plan} onChange={(e) => setPlan(e.target.value)} className={`${input} mt-1`}>
          {plans
            .filter((p) => p.monthly !== null)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
        </select>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
      >
        Start my {TRIAL_DAYS}-day free trial
      </button>
      <p className="text-center text-xs text-slate-500">
        No credit card needed. Cancel any time.
      </p>
    </form>
  );
}

"use client";

import { useState } from "react";
import { plans, formatPKR, YEARLY_DISCOUNT, TRIAL_DAYS } from "@/lib/plans";

export default function PricingCards({
  onSelect,
}: {
  onSelect?: (planId: string) => void;
}) {
  const [yearly, setYearly] = useState(false);

  function pick(id: string) {
    if (onSelect) onSelect(id);
    document.getElementById("trial")?.scrollIntoView({ behavior: "smooth" });
    window.dispatchEvent(new CustomEvent("select-plan", { detail: id }));
  }

  return (
    <div>
      <div className="mb-10 flex items-center justify-center gap-3 text-sm">
        <span className={yearly ? "text-slate-500" : "font-semibold text-slate-900"}>Monthly</span>
        <button
          type="button"
          role="switch"
          aria-checked={yearly}
          aria-label="Bill yearly"
          onClick={() => setYearly(!yearly)}
          className={`relative h-6 w-11 rounded-full transition ${yearly ? "bg-brand-600" : "bg-slate-300"}`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${yearly ? "left-[22px]" : "left-0.5"}`}
          />
        </button>
        <span className={yearly ? "font-semibold text-slate-900" : "text-slate-500"}>
          Yearly <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Save {YEARLY_DISCOUNT * 100}%</span>
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((p) => {
          const price =
            p.monthly === null ? null : Math.round(p.monthly * (yearly ? 1 - YEARLY_DISCOUNT : 1));
          return (
            <div
              key={p.id}
              className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm ${
                p.featured ? "border-brand-500 ring-2 ring-brand-500" : "border-slate-200"
              }`}
            >
              {p.featured && (
                <span className="absolute -top-3 left-6 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="mt-1 min-h-[40px] text-sm text-slate-600">{p.tagline}</p>

              <div className="mt-5">
                {price === null ? (
                  <div className="text-3xl font-bold">Custom</div>
                ) : (
                  <>
                    <div className="text-3xl font-bold">{formatPKR(price)}</div>
                    <div className="text-sm text-slate-500">
                      per month{yearly ? ", billed yearly" : ""}
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 space-y-1 rounded-lg bg-brand-50 p-3 text-sm text-brand-900">
                <div>{p.complaints}</div>
                <div>{p.seats}</div>
              </div>

              <ul className="mt-5 flex-1 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <svg className="mt-0.5 h-4 w-4 flex-none text-brand-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                      <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z" clipRule="evenodd" />
                    </svg>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => pick(p.id)}
                className={`mt-6 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  p.featured
                    ? "bg-brand-600 text-white hover:bg-brand-700"
                    : "border border-brand-600 text-brand-700 hover:bg-brand-50"
                }`}
              >
                {p.monthly === null ? "Talk to sales" : `Start ${TRIAL_DAYS}-day free trial`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

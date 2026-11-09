"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { COMPLAINT_CATEGORY_OPTIONS } from "@/features/complaints/submission/services/category-options";

interface CategorySelectorProps {
    value: string[];
    onChange: (value: string[]) => void;
    error?: string;
}

export function CategorySelector({ value, onChange, error }: CategorySelectorProps) {
    const [query, setQuery] = useState("");
    const options = useMemo(
        () => COMPLAINT_CATEGORY_OPTIONS.filter((option) => option.label.toLowerCase().includes(query.toLowerCase())),
        [query],
    );

    function toggle(category: string) {
        onChange(value.includes(category) ? value.filter((item) => item !== category) : [...value, category]);
    }

    return (
        <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-slate-900">Category <span className="text-rose-600">*</span></legend>
            <div className="relative">
                <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search categories" className="h-11 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" aria-label="Search complaint categories" />
            </div>
            <div className="grid max-h-52 gap-2 overflow-y-auto sm:grid-cols-2">
                {options.map(({ value: category, label, icon: Icon }) => {
                    const selected = value.includes(category);
                    return (
                        <button key={category} type="button" onClick={() => toggle(category)} aria-pressed={selected} className={`flex items-center gap-3 rounded-md border p-3 text-left text-sm transition ${selected ? "border-blue-600 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"}`}>
                            <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                            <span>{label}</span>
                        </button>
                    );
                })}
            </div>
            {error && <p className="text-sm text-rose-600" role="alert">{error}</p>}
        </fieldset>
    );
}

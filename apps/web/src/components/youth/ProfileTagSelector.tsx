import React, { useMemo, useState } from "react";
import { LoaderCircle, Plus } from "lucide-react";

type Tone = "emerald" | "teal";

interface Props {
  id: string;
  label: string;
  options: string[];
  values: string[];
  placeholder: string;
  onChange: (values: string[], addedValue?: string) => void;
  tone?: Tone;
  disabled?: boolean;
  busy?: boolean;
  error?: string | null;
}

const selectedClasses: Record<Tone, string> = {
  emerald: "bg-emerald-700 text-white shadow-2xs",
  teal: "bg-teal-700 text-white shadow-2xs",
};

const normalize = (value: string) => value.trim().toLowerCase();

export const ProfileTagSelector: React.FC<Props> = ({
  id,
  label,
  options,
  values,
  placeholder,
  onChange,
  tone = "emerald",
  disabled = false,
  busy = false,
  error,
}) => {
  const [draft, setDraft] = useState("");
  const allOptions = useMemo(
    () => [...options, ...values].filter(
      (value, index, items) =>
        items.findIndex((candidate) => normalize(candidate) === normalize(value)) === index,
    ),
    [options, values],
  );

  const toggle = (value: string) => {
    const normalized = normalize(value);
    const selected = values.some((candidate) => normalize(candidate) === normalized);
    onChange(
      selected
        ? values.filter((candidate) => normalize(candidate) !== normalized)
        : [...values, value],
      selected ? undefined : value,
    );
  };

  const addDraft = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (values.some((value) => normalize(value) === normalize(trimmed))) {
      setDraft("");
      return;
    }
    onChange([...values, trimmed], trimmed);
    setDraft("");
  };

  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700">
        {label}:
      </label>
      <div className="flex flex-wrap gap-1.5">
        {allOptions.map((option) => {
          const selected = values.some((value) => normalize(value) === normalize(option));
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              disabled={disabled || busy}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-all disabled:cursor-wait disabled:opacity-50 ${
                selected
                  ? selectedClasses[tone]
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              aria-pressed={selected}
            >
              {option}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex gap-2">
        <label htmlFor={id} className="sr-only">{placeholder}</label>
        <input
          id={id}
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addDraft();
            }
          }}
          disabled={disabled || busy}
          placeholder={placeholder}
          autoComplete="off"
          className="uk-focus-ring min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white disabled:opacity-60"
        />
        <button
          type="button"
          onClick={addDraft}
          disabled={disabled || busy || !draft.trim()}
          className="uk-focus-ring flex shrink-0 cursor-pointer items-center gap-1 rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={placeholder}
        >
          {busy
            ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            : <Plus className="h-3.5 w-3.5" />}
          <span>Add</span>
        </button>
      </div>

      {error && <p className="mt-3 text-xs font-medium text-rose-700" role="alert">{error}</p>}
    </div>
  );
};

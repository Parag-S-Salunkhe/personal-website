'use client'
// Search + filter chips + optional sort, controlled by the page. Same props and behaviour as
// components/zine/Filters.tsx (client state only, no URL parameters), restyled for the evening.
import { Search, X } from 'lucide-react'

type Option = { value: string; label: string }

export default function Filters({
  idPrefix, query, onQuery, searchLabel, placeholder, chips, chip, onChip, chipsLabel = 'Show', sort, onSort, sortOptions, count, noun,
}: {
  idPrefix: string
  query: string
  onQuery: (q: string) => void
  searchLabel: string
  placeholder?: string
  chips?: Option[]
  chip?: string
  onChip?: (v: string) => void
  chipsLabel?: string
  sort?: string
  onSort?: (v: string) => void
  sortOptions?: Option[]
  count: number
  noun: [string, string]
}) {
  return (
    <div className="mb-12 grid gap-5 border-y border-[rgb(184_138_68/0.4)] py-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
      <div className="grid gap-4">
        <div>
          <label htmlFor={`${idPrefix}-search`} className="ev-label block text-[var(--wax)]">{searchLabel}</label>
          <div className="relative mt-1.5 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--sage)]" aria-hidden="true" />
            <input
              id={`${idPrefix}-search`}
              type="search"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder={placeholder}
              autoComplete="off"
              className="ev-field ev-field-dark min-h-[48px] pl-10 pr-10 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button type="button" onClick={() => onQuery('')} aria-label="Clear the search" className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center text-[var(--sage)] hover:text-[var(--wax)]">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        {chips && chips.length > 1 && onChip && (
          <div role="group" aria-label={chipsLabel} className="flex flex-wrap gap-2">
            {chips.map((c) => {
              const on = c.value === chip
              return (
                <button
                  key={c.value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChip(c.value)}
                  className={`min-h-[44px] rounded-[3px] border px-4 text-[0.9375rem] font-semibold transition-[background-color,color,border-color,box-shadow,transform] duration-200 ease-[var(--ease-ev)] active:translate-y-px active:scale-[.98] ${
                    on
                      ? 'border-[var(--candle)] bg-[var(--candle)] text-[var(--cloth)] shadow-[0_0_18px_rgb(246_185_79/0.35)]'
                      : 'border-[rgb(184_138_68/0.6)] text-[var(--wax)] hover:border-[var(--candle)] hover:bg-[rgb(246_185_79/0.1)]'
                  }`}
                >
                  {c.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4 md:flex-col md:items-end">
        {sortOptions && onSort && (
          <div>
            <label htmlFor={`${idPrefix}-sort`} className="ev-label block text-[var(--wax)] md:text-right">Sort by</label>
            <select id={`${idPrefix}-sort`} value={sort} onChange={(e) => onSort(e.target.value)} className="ev-field ev-field-dark mt-1.5 min-h-[48px] w-auto pr-8">
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        )}
        <p className="ev-meta text-base text-[var(--sage)]" role="status" aria-live="polite">
          {count} {count === 1 ? noun[0] : noun[1]}
        </p>
      </div>
    </div>
  )
}

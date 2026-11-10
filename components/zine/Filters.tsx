'use client'
import { Search, X } from 'lucide-react'

type Option = { value: string; label: string }

// Search box + filter chips cut out like index tabs + an optional sort. Controlled by the page.
export default function Filters({
  idPrefix,
  query,
  onQuery,
  searchLabel,
  placeholder,
  chips,
  chip,
  onChip,
  chipsLabel = 'Show',
  sort,
  onSort,
  sortOptions,
  count,
  noun,
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
    <div className="mb-10 grid gap-4 border-y-2 border-riso-blue py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
      <div className="grid gap-3">
        <div>
          <label htmlFor={`${idPrefix}-search`} className="t-label block text-lg">{searchLabel}</label>
          <div className="relative mt-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" aria-hidden="true" />
            <input
              id={`${idPrefix}-search`}
              type="search"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder={placeholder}
              autoComplete="off"
              className="field min-h-[48px] pl-10 pr-10 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => onQuery('')}
                aria-label="Clear the search"
                className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center hover:text-ink"
              >
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
                  className={`t-label min-h-[44px] border-2 border-riso-blue px-4 text-lg transition-[background-color,color,transform] duration-200 ease-zine active:translate-y-px active:scale-[.98] ${
                    on ? 'bg-riso-blue text-paper' : 'bg-slip/60 hover:bg-riso-yellow hover:text-ink'
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
            <label htmlFor={`${idPrefix}-sort`} className="t-label block text-lg md:text-right">Sort by</label>
            <select
              id={`${idPrefix}-sort`}
              value={sort}
              onChange={(e) => onSort(e.target.value)}
              className="field mt-1 min-h-[48px] w-auto pr-8"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        )}
        <p className="t-label nums text-lg" role="status" aria-live="polite">
          {count} {count === 1 ? noun[0] : noun[1]}
        </p>
      </div>
    </div>
  )
}

import Link from 'next/link'

const looks = [
  { slug: 'late-show', name: 'Late Show', line: 'The house as a small repertory cinema after dark.' },
  { slug: 'house-zine', name: 'House Zine', line: 'The risograph zine handed to guests at the door.' },
  { slug: 'bold-kitchen', name: 'Bold Kitchen', line: 'A Swiss-poster kitchen: enamel colours and tile grids.' },
  { slug: 'table-for-eight', name: 'Table for Eight', line: 'The supper club seen from above, every section has a place.' },
]

export default function LabIndex() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold tracking-tight">Design lab</h1>
      <p className="mt-4 text-lg text-neutral-600">Four directions for the new site. Not indexed; remove before production.</p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {looks.map((l) => (
          <li key={l.slug}>
            <Link href={`/lab/${l.slug}`} className="block rounded-xl border border-neutral-300 bg-white p-6 hover:border-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
              <span className="block text-xl font-semibold">{l.name}</span>
              <span className="mt-2 block text-neutral-600">{l.line}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

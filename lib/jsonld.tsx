// JSON-LD helpers. The `<` escape keeps any stored text from closing the script tag
// (the one sanctioned dangerouslySetInnerHTML; see .claude/skills/security-audit).
import { siteName, siteUrl, socials } from '@/lib/site'

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', ...data }).replace(/</g, '\\u003c') }}
    />
  )
}

export const personId = `${siteUrl}/#parag`
export const person = { '@type': 'Person', '@id': personId, name: siteName, url: `${siteUrl}/`, sameAs: [socials.linkedin, socials.github] }
export const author = { '@id': personId }
export const abs = (path: string) => `${siteUrl}${path}`

export const breadcrumbs = (trail: [string, string][]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: trail.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) })),
})

export const collection = (name: string, path: string, description: string, items: { name: string; path: string }[]) => ({
  '@graph': [
    {
      '@type': 'CollectionPage',
      name,
      url: abs(path),
      description,
      isPartOf: { '@id': `${siteUrl}/#website` },
      mainEntity: items.length
        ? { '@type': 'ItemList', itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(it.path), name: it.name })) }
        : undefined,
    },
    breadcrumbs([['Home', '/'], [name, path]]),
  ],
})

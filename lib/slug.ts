// Item URLs: `${slugify(title)}-${id}`. The id suffix is the source of truth,
// so renaming an item never breaks links (no schema change needed).

export function slugify(text: string): string {
  const base = text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '')
  return base || 'item'
}

export function itemSlug(title: string, id: string): string {
  return `${slugify(title)}-${id}`
}

/** cuid ids are lowercase alphanumerics without dashes, so the id is the last segment. */
export function idFromSlug(slug: string): string | null {
  const id = slug.split('-').pop()
  return id && /^[a-z0-9]{6,40}$/i.test(id) ? id : null
}

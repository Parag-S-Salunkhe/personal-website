// Deterministic look of a dish: derived from its name and category so the same dish always plates the same way.
export type Kind = 0 | 1 | 2 | 3 // 0 pasta nest, 1 bowl of soup, 2 three pieces and a smear, 3 leaves
export type Recipe = { kind: Kind; seed: number; sauce: string; food: string; food2: string; herb: string }

export function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const SAUCES = ['#B5502F', '#C9772E', '#E8D9B0', '#7C2236', '#8A5A33', '#D9A441']
const FOODS = ['#E0B35C', '#C98A45', '#A5522F', '#E8D9B0', '#B36A3A', '#D9A441']
const HERBS = ['#5E8C4A', '#7FA86A', '#A9C3AE', '#46703A']

export function recipeFor(name: string, category: string): Recipe {
  const seed = hash(`${name}|${category}`)
  const r = rng(seed)
  const c = `${name} ${category}`.toLowerCase()
  let kind: Kind
  if (/soup|stew|curry|dal|broth|chowder/.test(c)) kind = 1
  else if (/salad|veg|green|slaw/.test(c)) kind = 3
  else if (/pasta|noodle|rice|risotto|spaghetti|ramen/.test(c)) kind = 0
  else if (/dessert|sweet|cake|pudding|tart|pie|cookie/.test(c)) kind = 2
  else kind = ([0, 2, 3, 1, 2, 0] as Kind[])[seed % 6]
  const dessert = /dessert|sweet|cake|pudding|tart|pie|cookie/.test(c)
  return {
    kind, seed,
    sauce: dessert ? '#7C2236' : SAUCES[Math.floor(r() * SAUCES.length)],
    food: dessert ? '#E8D9B0' : FOODS[Math.floor(r() * FOODS.length)],
    food2: dessert ? '#B36A3A' : FOODS[Math.floor(r() * FOODS.length)],
    herb: HERBS[Math.floor(r() * HERBS.length)],
  }
}

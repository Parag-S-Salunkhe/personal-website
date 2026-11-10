export type Film = { id: string; title: string; rating: number; watchDate: string; posterUrl: string }

/** Shared mutable state between the scroll trigger, the pointer listener and the R3F frame loop. */
export type Shared = {
  progress: number
  pointer: { x: number; y: number }
  onShown: (i: number) => void
}

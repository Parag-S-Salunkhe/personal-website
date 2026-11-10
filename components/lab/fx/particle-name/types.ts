export interface Shared {
  /** raw scroll progress 0..1 across the story wrapper */
  progress: number
  /** damped progress, written by the scene */
  sp: number
  pointer: { x: number; y: number; active: boolean }
  onPhase: (phase: number) => void
  onReady: () => void
}

// Shared global types for the /lab pages. Declare these ONCE here; experiments must not redeclare them.
export {}

declare global {
  interface Window {
    /** Real mouse steps the recorder plays before scrolling (x/y are 0..1 fractions of the viewport). */
    __labDemoSteps?: { type: 'move' | 'down' | 'up' | 'click' | 'wait'; x?: number; y?: number; ms?: number }[]
    /** Alternative: the page scripts its own demo (lab pages only). */
    __labDemo?: () => Promise<void>
  }
}

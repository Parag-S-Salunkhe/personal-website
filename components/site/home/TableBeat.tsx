'use client'
// Beat 3: the candle-lit table, seat to seat. Ported from components/lab/table-for-eight/TableOrbit.tsx (the canvas part;
// the seat-card overlay is SeatCards.tsx, outside the Canvas).
import { useEffect, useMemo, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { Bloom, DepthOfField, EffectComposer, Noise, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import type { SeatCard } from './seats'
import type { StageData } from './content'
import World from './World'
import TableRig from './TableRig'
import { preloadProjector } from './Projector'

export type TableShared = MutableRefObject<{ p: number; s: number; lit?: number }>

export default function TableBeat({ cards, stage, shared, light, still, onReady }: { cards: SeatCard[]; stage: StageData; shared: TableShared; light: boolean; still: boolean; onReady: () => void }) {
  const dof = useMemo(() => new THREE.Vector3(), [])
  useEffect(() => { const id = window.setTimeout(preloadProjector, 600); return () => window.clearTimeout(id) }, [])
  return (
    <>
      <World cards={cards} stage={stage} shared={shared} light={light} still={still} />
      <TableRig shared={shared} still={still} onFrame={() => {}} onReady={onReady} dof={dof} />
      <EffectComposer multisampling={light ? 2 : 4} enableNormalPass={false}>
        {light ? <></> : <DepthOfField target={dof} focalLength={0.06} bokehScale={1.3} height={480} />}
        <Bloom intensity={light ? 0.8 : 1.0} luminanceThreshold={1.0} luminanceSmoothing={0.25} mipmapBlur radius={0.7} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Vignette eskil={false} offset={0.25} darkness={0.75} />
        <Noise opacity={0.045} />
      </EffectComposer>
    </>
  )
}

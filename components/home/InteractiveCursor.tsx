'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

interface Particle {
  id: number
  x: number
  y: number
}

export default function InteractiveCursor() {
  const [particles, setParticles] = useState<Particle[]>([])
  const [isMobile, setIsMobile] = useState(false)
  
  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)
  
  const springConfig = { damping: 25, stiffness: 700 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  useEffect(() => {
    // Check if mobile
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
    
    if (isMobile) return

    let particleId = 0

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)

      // Create particle trail
      if (Math.random() > 0.7) {
        const newParticle: Particle = {
          id: particleId++,
          x: e.clientX,
          y: e.clientY,
        }
        setParticles((prev) => [...prev, newParticle])

        // Remove particle after animation
        setTimeout(() => {
          setParticles((prev) => prev.filter((p) => p.id !== newParticle.id))
        }, 1000)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [cursorX, cursorY, isMobile])

  if (isMobile) return null

  return (
    <>
      {/* Cursor dot */}
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 pointer-events-none z-50 mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />

      {/* Particle trail */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="fixed top-0 left-0 w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 pointer-events-none z-40"
          initial={{
            x: particle.x,
            y: particle.y,
            opacity: 0.8,
            scale: 1,
          }}
          animate={{
            opacity: 0,
            scale: 0,
          }}
          transition={{
            duration: 1,
            ease: 'easeOut',
          }}
          style={{
            translateX: '-50%',
            translateY: '-50%',
          }}
        />
      ))}
    </>
  )
}

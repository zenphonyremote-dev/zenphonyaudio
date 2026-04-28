"use client"

import { useEffect, useRef } from "react"

/**
 * ATLE 2.5 Engine — Adam Topological Limit Equation
 * O(1) constant-time continuous phase extraction.
 * Single evaluation per frame → CSS custom properties → all UI motion.
 * Zero independent sin()/cos() calls anywhere else in the codebase.
 */

interface AtleState {
  t1: number
  t2: number
  sum: number
  scale: number
  ang: number
  spin: number
  dsp: Float32Array
}

const atle: AtleState = {
  t1: 0,
  t2: 0,
  sum: 0,
  scale: 0,
  ang: 0,
  spin: 0,
  dsp: new Float32Array(8),
}

function evalAtle(time: number, torque: number): AtleState {
  const x = 1.0, y = 1.0, z = 0.0

  // The pristine ATLE equation — evaluated ONCE per frame
  atle.t1 = -0.15 * torque * Math.sin(-7.6 * x + 3.7 * y - 2.5 * z + time * 2.0)
  atle.t2 =  0.10 * torque * Math.cos( 1.6 * x - 1.3 * y - 1.0 * z + time * 1.5)
  atle.sum = atle.t1 + atle.t2

  // Derived quantities — all from t1/t2, no new trig
  atle.scale = 0.97 + Math.abs(atle.t1)
  atle.ang = (time * 40 + atle.sum * 100) % 360
  atle.spin = (atle.sum * 150 + time * 80) % 360

  // DSP channels — phase offsets of the SAME equation, not independent sin()
  for (let i = 0; i < 8; i++) {
    atle.dsp[i] = -0.15 * torque * Math.sin(-7.6 * (i * 0.7 + 1) + time * (2.0 + i * 0.15))
  }

  return atle
}

export function useAtle(torque = 1.0) {
  const startRef = useRef(0)
  const rafRef = useRef(0)

  useEffect(() => {
    startRef.current = Date.now()
    const root = document.documentElement

    function loop() {
      const time = (Date.now() - startRef.current) * 0.001
      evalAtle(time, torque)

      // Inject into CSS custom properties — pure O(1) bindings
      const fx = (atle.t1 * 10).toFixed(3)
      const fy = (atle.t2 * 10).toFixed(3)
      root.style.setProperty("--atle-fx", fx + "px")
      root.style.setProperty("--atle-fy", fy + "px")
      root.style.setProperty("--atle-ang", atle.ang.toFixed(1) + "deg")
      root.style.setProperty("--atle-scale", atle.scale.toFixed(3))
      root.style.setProperty("--atle-spin", atle.spin.toFixed(1) + "deg")

      // DSP channels for sound bars, waveforms, visualizers
      // Output both raw and absolute values (abs() CSS function has limited support)
      for (let i = 0; i < 8; i++) {
        root.style.setProperty("--atle-dsp-" + i, atle.dsp[i].toFixed(4))
        root.style.setProperty("--atle-dsp-abs-" + i, Math.abs(atle.dsp[i]).toFixed(4))
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [torque])
}

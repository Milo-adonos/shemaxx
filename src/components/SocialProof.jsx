import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const globalStats = [
  { value: '+12 000', label: 'analyses done' },
  { value: '4.9/5', label: 'average rating' },
  { value: '97%', label: 'satisfaction' },
  { value: '+68', label: 'points analyzed' },
]

export default function SocialProof() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="proof" ref={ref} />
  )
}

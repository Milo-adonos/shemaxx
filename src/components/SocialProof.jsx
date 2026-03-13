import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const globalStats = [
  { value: '+12 000', label: 'analyses réalisées' },
  { value: '4.9/5', label: 'note moyenne' },
  { value: '97%', label: 'de satisfaction' },
  { value: '+68', label: 'points analysés' },
]

export default function SocialProof() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="proof" ref={ref} />
  )
}

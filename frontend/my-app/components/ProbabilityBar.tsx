'use client'

import { motion } from 'framer-motion'

interface ProbabilityBarProps {
  value: number // 0 to 1
}

export default function ProbabilityBar({ value }: ProbabilityBarProps) {
  const percentage = Math.min(Math.max(value * 100, 0), 100)

  // Dynamic color based on value
  const getColor = () => {
    if (percentage > 70) return 'bg-red-500'
    if (percentage > 40) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="w-full bg-gray-700 rounded h-5 overflow-hidden mt-3">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8 }}
        className={`h-full ${getColor()}`}
      />
    </div>
  )
}

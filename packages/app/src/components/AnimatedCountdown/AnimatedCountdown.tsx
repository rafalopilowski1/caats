import { DateTime } from 'luxon'
import { Key, ReactNode, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNowStore } from '../../contexts/NowStore'

type AnimatedValueProps = {
  children: ReactNode
  key: Key
}

function AnimatedValue(props: AnimatedValueProps) {
  return (
    <motion.div
      key={props.key}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      initial={{
        x: 40,
        opacity: 0,
        position: 'absolute',
        rotateY: '60deg',
        scale: 0.8,
      }}
      animate={{ x: 0, y: 0, opacity: 1, rotateY: 0, scale: 1 }}
      exit={{
        y: 25,
        opacity: 0,
        position: 'absolute',
        scale: 0.8,
      }}
    >
      {props.children}
    </motion.div>
  )
}

export type AnimatedCountdownProps = {
  target: Date | DateTime
  onEnd?: () => void
}

export function AnimatedCountdown(props: AnimatedCountdownProps) {
  const now = useNowStore((state) => state.now)
  const target = useMemo(() => {
    if (props.target instanceof Date) {
      return DateTime.fromJSDate(props.target)
    }
    return props.target
  }, [props.target])

  const diff = useMemo(
    () => target.diff(now, ['hours', 'minutes', 'seconds']),
    [target, now]
  )

  return (
    <div className="flex gap-2">
      {diff.toHuman({ maximumFractionDigits: 0 })}
    </div>
  )
}

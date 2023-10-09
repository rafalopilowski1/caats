import { DateTime } from 'luxon'
import { useCallback, useState } from 'react'
import { useInterval } from 'react-use'
import { useNowStore } from '../../contexts/NowStore'

export type CountdownProps = {
  countdownTo: Date
}

export function Countdown(props: CountdownProps) {
  const countdownToDateTime = DateTime.fromJSDate(props.countdownTo)
  const now = useNowStore((state) => state.now)
  const getDiff = useCallback(() => {
    return countdownToDateTime.diff(now).shiftToAll()
  }, [countdownToDateTime])
  const [diff, setDiff] = useState(getDiff())
  useInterval(() => setDiff(getDiff()), 1000)

  return (
    <span className="countdown font-mono text-2xl">
      <span style={{ '--value': diff.hours } as Record<string, number>} />h
      <span style={{ '--value': diff.minutes } as Record<string, number>} />m
      <span style={{ '--value': diff.seconds } as Record<string, number>} />s
    </span>
  )
}

import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useState } from 'react'
import { HiArrowLeft, HiArrowRight, HiReply } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import { CalDatePicker } from '../../components/CalDatePicker/CalDatePicker'
import { useNowStore } from '../../contexts/NowStore'

const variants = {
  enter: (direction: number) => {
    console.log({ direction })
    return {
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      zIndex: 10,
    }
  },
  center: { x: 0, opacity: 1, position: 'relative' },
  exit: () => ({
    visibility: 'hidden',
    position: 'absolute',
    zIndex: 0,
  }),
}

export default function Calendar() {
  //const client = useGqlClient()
  //const rq = useAllRangeQuery(client)
  const [now, setNow] = useState(useNowStore.getState().now)
  const [direction, setDirection] = useState(0)
  const addMonth = useCallback(
    (amount: number) => {
      setDirection(amount)
      setNow(now.plus({ months: amount }))
    },
    [setNow, now]
  )

  const navigate = useNavigate()

  return (
    <div className="mx-auto p-2 md:max-w-md md:px-0">
      <div className="overflow-hidden">
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            className="z-10 overflow-hidden bg-white"
            key={now.toISODate()}
            custom={direction}
            // @ts-expect-error wtf
            variants={variants}
            initial={'enter'}
            animate={'center'}
            exit={'exit'}
            drag="x"
            dragConstraints={{ right: 0, left: 0 }}
            dragElastic={0.8}
            transition={{
              duration: 0.2,
              ease: 'easeInOut',
            }}
            onDragEnd={(e, { offset }) => {
              if (offset.x > 100) {
                addMonth(-1)
              } else if (offset.x < -100) {
                addMonth(1)
              }
            }}
          >
            <CalDatePicker
              date={now.toJSDate()}
              onClick={(d) => navigate(`/app/calendar/${d.toISOString()}/week`)}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-3 gap-8 px-8 py-2">
        <button onClick={() => addMonth(-1)} className="btn btn-outline">
          <HiArrowLeft />
        </button>
        <button
          onClick={() => setNow(useNowStore.getState().now)}
          className="btn btn-outline"
        >
          <HiReply />
        </button>
        <button onClick={() => addMonth(1)} className="btn btn-outline">
          <HiArrowRight />
        </button>
      </div>
    </div>
  )
}

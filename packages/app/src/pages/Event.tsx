import classNames from 'classnames'
import { ReactNode } from 'react'
import { HiChevronDown, HiCubeTransparent } from 'react-icons/hi'
import { Link, useParams } from 'react-router-dom'
import { useGqlClient } from '../components'
import { useEventDetailsQuery, useUserQuery } from '../gql/react-query'
import { useNowStore } from '../contexts/NowStore'
import { DateTime } from 'luxon'

type DataRowProps = {
  value: [string, ReactNode]
}

function useIsInUserGroups(groups: string[] | null | undefined) {
  const client = useGqlClient()
  const userQuery = useUserQuery(client, {})

  if (!userQuery.data || !groups) return false

  for (const theirGroup of groups) {
    if (!userQuery.data.user.groups.includes(theirGroup)) return false
  }

  return true
}

function DataRow(props: DataRowProps) {
  return (
    <>
      <span className="place-self-start font-bold">{props.value[0]}</span>
      <span className="place-self-stretch text-right">{props.value[1]}</span>
    </>
  )
}

function DataRowContainer(props: { children: ReactNode | ReactNode[] }) {
  return (
    <div className="grid grid-cols-2 place-content-between gap-2">
      {props.children}
    </div>
  )
}

export default function Event() {
  const now = useNowStore((state) => state.now)
  const { id } = useParams()
  if (!id) return null

  const client = useGqlClient()
  const query = useEventDetailsQuery(client, { id: Number(id) })
  const notUserGroupsWarning = useIsInUserGroups(query.data?.event?.groups)

  if (query.isLoading) {
    return (
      <div className="container max-w-md space-y-2 p-2 md:px-0">
        <div className="bg-base-300 h-16 w-1/2 animate-pulse rounded-lg" />
        <div className="bg-base-300 h-6 w-2/3 animate-pulse rounded-lg" />
        <div className="bg-base-300 h-12 w-full animate-pulse rounded-lg" />
        <div className="bg-base-300 h-12 w-full animate-pulse rounded-lg" />
      </div>
    )
  }

  if (!query.data || !query.data.event) {
    return (
      <div className="container max-w-md p-2 md:px-0">
        <HiCubeTransparent className="my-4 text-[96px]" />
        <p className="text-xl font-bold">Wybrany event nie istnieje.</p>
        <Link className="btn my-4" to="/app/calendar">
          Powrót do kalendarza
        </Link>
      </div>
    )
  }

  const event = query.data.event
  const eventEndsAt = DateTime.fromISO(event.endsAt)
  const eventStartingAt = DateTime.fromISO(event.startsAt)
  const isCurrent = eventEndsAt > now && eventStartingAt < now

  return (
    <div className="container max-w-md p-2 md:px-0">
      <h1 className="text-5xl font-bold">
        <span
          className={classNames({
            'text-white bg-black rounded-lg px-1': isCurrent,
          })}
        >
          {event.code}
        </span>{' '}
        <span className="text-lg">{`(#${event.id})`}</span>
      </h1>
      <p>{event.subject}</p>
      {event.source.task.status !== 'SUCCESS' ? (
        <p className="text-warning border-y-warning my-2 border-y-2 py-2 font-bold">
          Wybrany event nie jest aktualny!
        </p>
      ) : null}
      {!notUserGroupsWarning ? (
        <p className="text-info border-y-info my-2 border-y-2 py-2 font-bold">
          Przeglądasz wydarzenie dla innej grupy!
        </p>
      ) : null}
      <div className="space-y-4 py-2">
        <h2 className="text-3xl font-bold">Informacje ogólne</h2>
        <DataRowContainer>
          <DataRow value={['Rodzaj zajęć', event.type]} />
          <DataRow
            value={[
              'Sala',
              event.room ? (
                event.room
              ) : (
                <span className="italic">Nie przypisano sali</span>
              ),
            ]}
          />
          <DataRow
            value={[
              'Prowadzący',
              event.hosts.length > 0 ? (
                event.hosts.join(', ')
              ) : (
                <span className="italic">Nie przypisano prowadzących</span>
              ),
            ]}
          />
          <DataRow
            value={[
              'Grupy',
              event.groups.length > 0 ? (
                event.groups.join(', ')
              ) : (
                <span className="italic">Nie przypisano grup</span>
              ),
            ]}
          />
          <DataRow
            value={[
              'Data',
              eventStartingAt.toLocaleString(DateTime.DATE_SHORT),
            ]}
          />
          <DataRow
            value={[
              'Czas rozpoczęcia',
              eventStartingAt.toLocaleString(DateTime.TIME_24_SIMPLE),
            ]}
          />
          <DataRow
            value={[
              'Czas zakończenia',
              eventEndsAt.toLocaleString(DateTime.TIME_24_SIMPLE),
            ]}
          />
        </DataRowContainer>
        <h2 className="text-3xl font-bold">Źródło</h2>
        <DataRowContainer>
          <DataRow value={['Identyfikator', event.source.id]} />
          <DataRow value={['Sygnatura', event.source.constantId]} />
          <DataRow
            value={[
              'Przetworzono',
              DateTime.fromISO(event.source.createdAt).toLocaleString(
                DateTime.DATETIME_SHORT_WITH_SECONDS
              ),
            ]}
          />
          <div className="col-span-2">
            <div
              tabIndex={0}
              className="rounded-box collapse border-2 border-black"
            >
              <input type="checkbox" />
              <div className="collapse-title text-xl font-medium">
                <HiChevronDown className="mr-2 inline" />
                Zapisane dane
              </div>
              <div className="collapse-content space-y-2">
                {Object.entries<{ value: string; humanKey: string }>(
                  event.source.object as Record<
                    string,
                    { value: string; humanKey: string }
                  >
                ).map(([key, { value, humanKey }]) => (
                  <div key={key}>
                    <p className="text-xs italic opacity-70">({key})</p>
                    <p>
                      <span className="font-bold">{humanKey}</span> {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DataRowContainer>
        <h2 className="text-3xl font-bold">Pochodzenie</h2>
        <DataRowContainer>
          {event.source.task?.scraper ? (
            <>
              <DataRow value={['Scraper', event.source.task.scraper.alias]} />
              <DataRow
                value={[
                  'Ostatnio widziany',
                  DateTime.fromISO(
                    event.source.task.scraper.lastSeen!
                  ).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
                ]}
              />
            </>
          ) : null}
          <DataRow value={['Identyfikator', event.source.task.id]} />
          <DataRow
            value={[
              'Sygnatura początkowa strony źródłowej',
              event.source.task.initialHash ?? (
                <span className="italic">Nie określono</span>
              ),
            ]}
          />
          <DataRow
            value={[
              'Sygnatura wynikowa strony źródłowej',
              event.source.task.initialHash ?? (
                <span className="italic">Nie określono</span>
              ),
            ]}
          />
          <DataRow
            value={[
              'Zaplanowano',
              DateTime.fromISO(event.source.task.createdAt).toLocaleString(
                DateTime.DATETIME_SHORT_WITH_SECONDS
              ),
            ]}
          />
          <DataRow
            value={[
              'Wykonano',
              DateTime.fromISO(event.source.task.finishedAt!).toLocaleString(
                DateTime.DATETIME_SHORT_WITH_SECONDS
              ),
            ]}
          />
        </DataRowContainer>
      </div>
    </div>
  )
}

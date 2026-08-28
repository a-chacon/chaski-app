import { createLazyFileRoute } from '@tanstack/react-router'
import MainSectionLayout from '../components/layout/MainSectionLayout'
import { Button, Tooltip } from "@heroui/react"
import EntryLayoutSwitch from "../components/EntriesLayoutSwitch"
import EntriesFiltersSwitch from "../components/EntriesFiltersSwitch"
import { RiRefreshLine, RiCheckDoubleLine } from '@remixicon/react'
import { useEffect, useRef } from 'react'
import { EntryInterface } from '../interfaces'
import { invoke } from '@tauri-apps/api/core'
import EntriesList from '../components/EntriesList'
import { useEntries } from '../IndexEntriesContext'
import { useNotification } from '../NotificationContext'
import { updateAllEntriesAsRead } from '../helpers/feedsData'
import { useAppContext } from '../AppContext'
import { useTranslation } from 'react-i18next'

export const Route = createLazyFileRoute('/')({
  component: App,
})

export default function App() {
  const { t } = useTranslation('entries')
  const { addNotification } = useNotification()
  const { currentAccount, showReadEntries, showHiddenEntries } = useAppContext()
  const { entries, setEntries, page, setPage, hasMore, setHasMore, scrollTop, setScrollTop } =
    useEntries('/')

  const isMounted = useRef(false)

  // Save scroll position when leaving, restore it on mount
  useEffect(() => {
    const el = document.getElementById('mainDiv')
    if (el && scrollTop > 0) {
      el.scrollTop = scrollTop
    }

    return () => {
      const el = document.getElementById('mainDiv')
      if (el) {
        setScrollTop(el.scrollTop)
      }
    }
  }, [])

  useEffect(() => {
    if (page === 1 && entries.length == 0) {
      fetchEntries()
    }
  }, [page, entries.length, currentAccount?.id, showReadEntries, showHiddenEntries])

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    setEntries([])
    setPage(1)
    setHasMore(true)
  }, [currentAccount?.id, showReadEntries, showHiddenEntries])

  const fetchEntries = async () => {
    try {
      if (!currentAccount?.id) {
        setHasMore(false)
        return
      }

      const message = await invoke<string>('list_entries', {
        page: page,
        items: 50,
        filters: {
          account_id_eq: currentAccount.id,
          ...(showReadEntries ? {} : { read_eq: 0 }),
          ...(showHiddenEntries ? {} : { hidden_eq: 0 }),
        }
      })

      const new_entries: EntryInterface[] = JSON.parse(message)

      setEntries((prevEntries) => [...prevEntries, ...new_entries])

      if (new_entries.length === 0) {
        setHasMore(false)
      }

      setPage((prevPage) => prevPage + 1)
    } catch (error) {
      console.error('Error fetching entries:', error)
    }
  }

  const handleReloadButton = () => {
    setPage(1)
    setEntries([])
    setHasMore(true)

    addNotification(t('reloadingTitle'), t('reloadingBody'), 'secondary')
  }

  const handleUpdateEntriesAsRead = async () => {
    await updateAllEntriesAsRead()
    resetEntryList()

    addNotification(t('updatedTitle'), t('updatedBody'), 'primary')
  }

  const resetEntryList = () => {
    setEntries([])
    setPage(1)
  }

  return (
    <MainSectionLayout>
      <div className="flex flex-col max-w-screen-md mx-auto px-4">
        <div className="flex flex-col sm:flex-row py-8 sm:justify-between sm:items-start gap-2">
          <div>
            <h1 className="text-3xl pt-2 font-bold">{t('allEntries')}</h1>
            <h2 className="pt-1 pb-2 sm:pb-4">{t('allEntriesSubtitle')}</h2>
          </div>
          <div className="flex flex-row items-center gap-2 sm:pt-2">
            <EntryLayoutSwitch />
            <EntriesFiltersSwitch />
            <Tooltip content={t('updateAllAsRead')}>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={handleUpdateEntriesAsRead}
              >
                <RiCheckDoubleLine></RiCheckDoubleLine>
              </Button>
            </Tooltip>
            <Tooltip content={t('reloadEntries')}>
              <Button
                color="default"
                isIconOnly
                variant="light"
                size="sm"
                onPress={handleReloadButton}
              >
                <RiRefreshLine></RiRefreshLine>
              </Button>
            </Tooltip>
          </div>
        </div>
        <EntriesList
          key="index"
          entries={entries}
          fetchEntries={fetchEntries}
          hasMore={hasMore}
          header={true}
        />
      </div>
    </MainSectionLayout>
  )
}

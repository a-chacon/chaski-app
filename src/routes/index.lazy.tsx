import { createLazyFileRoute } from '@tanstack/react-router'
import MainSectionLayout from '../components/layout/MainSectionLayout'
import { useEffect, useRef, useState } from 'react'

import { EntryInterface } from '../interfaces'
import { invoke } from '@tauri-apps/api/core'
import EntriesList from '../components/EntriesList'
import { useEntries } from '../IndexEntriesContext'
import { useNotification } from '../NotificationContext'
import { updateAllEntriesAsRead } from '../helpers/feedsData'
import { fullSync } from '../helpers/accountsData'
import { useAppContext } from '../AppContext'
import { useTranslation } from 'react-i18next'
import EntryListActionsModal from '../components/EntryListActionsModal'
import { Button } from '@heroui/react'
import { RiRefreshLine } from '@remixicon/react'

export const Route = createLazyFileRoute('/')({
  component: App,
})

export default function App() {
  const { t } = useTranslation('entries')
  const { addNotification } = useNotification()
  const { currentAccount, showReadEntries, showHiddenEntries, isMobile } = useAppContext()
  const { entries, setEntries, page, setPage, hasMore, setHasMore, scrollTop, setScrollTop } =
    useEntries('/')

  const [refreshLoading, setRefreshLoading] = useState(false)
  const isMounted = useRef(false)

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
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    resetEntryList()
    setHasMore(true)
  }, [currentAccount?.id, showReadEntries, showHiddenEntries])

  useEffect(() => {
    if (page === 1 && entries.length === 0 && currentAccount?.id) {
      fetchEntries()
    }
  }, [page, currentAccount?.id, showReadEntries, showHiddenEntries])

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

  const handleReloadButton = async () => {
    setRefreshLoading(true)
    try {
      if (currentAccount?.id && currentAccount.kind !== 'local') {
        await fullSync(currentAccount.id)
      }
      resetEntryList()
      addNotification(t('reloadingTitle'), t('reloadingBody'), 'secondary')
    } catch (error) {
      console.error('Error reloading entries:', error)
      addNotification('Error', 'Failed to reload entries', 'danger')
    } finally {
      setRefreshLoading(false)
    }
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
      <div className="flex flex-col max-w-(--breakpoint-md) mx-auto px-4">
        <div className="flex flex-row justify-between items-center sm:flex-row py-8 sm:justify-between sm:items-start gap-2">
          <h1 className="text-3xl pt-2 font-bold">{t('allEntries')}</h1>
          <div className="flex items-center gap-1">
            {!isMobile && (
              <Button
                isIconOnly
                variant="light"
                onPress={handleReloadButton}
                isLoading={refreshLoading}
                aria-label={t('reloadEntries')}
                className="text-foreground-500"
              >
                <RiRefreshLine className="w-5 h-5" />
              </Button>
            )}
            <EntryListActionsModal
              actions={[
                { key: "markRead", label: t('updateAllAsRead'), onPress: handleUpdateEntriesAsRead },
              ]}
            />
          </div>
        </div>
        {entries.length > 0 || !hasMore ? (
          <EntriesList
            key="index"
            entries={entries}
            fetchEntries={fetchEntries}
            hasMore={hasMore}
            header={true}
            onRefresh={resetEntryList}
          />
        ) : (
          <div className="flex justify-center p-6">Loading initial data...</div>
        )}
      </div>
    </MainSectionLayout>
  )
}

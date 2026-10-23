import { createLazyFileRoute } from '@tanstack/react-router'
import MainSectionLayout from '../components/layout/MainSectionLayout'
import { useEffect, useRef } from 'react'
import { EntryInterface } from '../interfaces'
import { invoke } from '@tauri-apps/api/core'
import EntriesList from '../components/EntriesList'
import { useEntries } from '../IndexEntriesContext'
import EntryListToolbar from '../components/EntryListToolbar'
import { useNotification } from '../NotificationContext'
import { updateAllReadLaterAsRead } from '../helpers/feedsData'

import { useAppContext } from '../AppContext'
import { useTranslation } from 'react-i18next'

export const Route = createLazyFileRoute('/read_later')({
  component: ReadLater,
})

export default function ReadLater() {
  const { t } = useTranslation('entries')
  const { addNotification } = useNotification()
  const { entries, setEntries, page, setPage, hasMore, setHasMore, scrollTop, setScrollTop } = useEntries("/read_later");
  const { currentAccount, showHiddenEntries, entriesOrder } = useAppContext();
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
    if (page === 1 && entries.length == 0) {
      fetchEntries()
    }
  }, [page, entries.length, currentAccount?.id, showHiddenEntries, entriesOrder])

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    resetEntryList()
    setHasMore(true)
  }, [currentAccount?.id, showHiddenEntries, entriesOrder])

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
          read_later_eq: 1,
          account_id_eq: currentAccount.id,
          order: entriesOrder,
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
    resetEntryList()
    setHasMore(true);
  }

  const handleUpdateEntriesAsRead = async () => {
    if (!currentAccount?.id) return
    await updateAllReadLaterAsRead(currentAccount.id)
    resetEntryList()
    setHasMore(true)

    addNotification(t('updatedTitle'), t('updatedBody'), 'primary')
  }

  const resetEntryList = () => {
    setEntries([])
    setPage(1)
  }

  return (
    <MainSectionLayout>
      <div className="flex flex-col max-w-(--breakpoint-md) mx-auto px-4">
        <div className="flex flex-col sm:flex-row py-8 sm:justify-between sm:items-start gap-2">
          <div>
            <h1 className="text-3xl pt-2 font-bold">{t('readLater')}</h1>
            <h2 className="pt-1 pb-4">{t('readLaterSubtitle')}</h2>
          </div>
          <EntryListToolbar
            onReload={handleReloadButton}
            onMarkAllAsRead={handleUpdateEntriesAsRead}
          />
        </div>
        {entries.length > 0 || !hasMore ? (
          <EntriesList
            key="index"
            entries={entries}
            fetchEntries={fetchEntries}
            hasMore={hasMore}
            header={true}
            onRefresh={handleReloadButton}
          />
        ) : (
          <div className="flex justify-center p-6">Loading initial data...</div>
        )}
      </div>
    </MainSectionLayout>
  )
}

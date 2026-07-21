import { createLazyFileRoute } from '@tanstack/react-router'
import MainSectionLayout from '../components/layout/MainSectionLayout'
import { Button, Tooltip } from "@heroui/react"
import EntryLayoutSwitch from "../components/EntriesLayoutSwitch"
import { RiRefreshLine, RiCheckDoubleLine } from '@remixicon/react'
import { useEffect } from 'react'
import { EntryInterface } from '../interfaces'
import { invoke } from '@tauri-apps/api/core'
import EntriesList from '../components/EntriesList'
import { useEntries } from '../IndexEntriesContext'
import { useNotification } from '../NotificationContext'
import { updateAllEntriesAsRead } from '../helpers/feedsData'
import { useAppContext } from '../AppContext'

export const Route = createLazyFileRoute('/')({
  component: App,
})

export default function App() {
  const { addNotification } = useNotification()
  const { currentAccount } = useAppContext()
  const { entries, setEntries, page, setPage, hasMore, setHasMore } =
    useEntries('/')

  useEffect(() => {
    if (page === 1 && entries.length == 0) {
      fetchEntries()
    }
  }, [page, currentAccount?.id])

  useEffect(() => {
    setEntries([])
    setPage(1)
    setHasMore(true)
  }, [currentAccount?.id])

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

    addNotification('Reloading', 'Entries are reloaded!', 'secondary')
  }

  const handleUpdateEntriesAsRead = async () => {
    await updateAllEntriesAsRead()
    resetEntryList()

    addNotification('Updated', 'All entries were updated as read!', 'primary')
  }

  const resetEntryList = () => {
    setEntries([])
    setPage(1)
  }

  return (
    <MainSectionLayout>
      <div className="flex flex-col max-w-screen-md mx-auto">
        <div className="flex py-8 justify-between items-start">
          <div>
            <h1 className="text-3xl pt-2 font-bold">All entries</h1>
            <h2 className="pt-1 pb-4">
              Explore the latest entries and updates from your favorite
              sources, all in one place.
            </h2>
          </div>
          <div className="flex flex-row items-center gap-2">
            <EntryLayoutSwitch />
            <Tooltip content="Update All Entries As Read">
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={handleUpdateEntriesAsRead}
              >
                <RiCheckDoubleLine></RiCheckDoubleLine>
              </Button>
            </Tooltip>
            <Tooltip content="Reload The Page's Entries">
              <Button
                color="primary"
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

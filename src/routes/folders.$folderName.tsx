import { EntryInterface } from '../interfaces'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import MainSectionLayout from '../components/layout/MainSectionLayout'
import EntryLayoutSwitch from "../components/EntriesLayoutSwitch"
import EntriesList from '../components/EntriesList'
import { useEntries } from '../IndexEntriesContext'
import { Button, Tooltip } from '@heroui/react'
import { RiRefreshLine, RiCheckDoubleLine } from '@remixicon/react'
import { useNotification } from '../NotificationContext'
import { updateEntriesAsReadByFolder } from '../helpers/feedsData'

export const Route = createFileRoute('/folders/$folderName')({
  component: Folder,
})

export default function Folder() {
  const { addNotification } = useNotification()
  const { folderName: folderParam } = Route.useParams()
  const [accountIdStr, folderName] = folderParam.split('-')
  const accountId = Number(accountIdStr)
  const { entries, setEntries, page, setPage, hasMore, setHasMore } =
    useEntries(folderName)

  useEffect(() => {
    if (page === 1 && entries.length == 0) {
      fetchEntries()
    }
  }, [page])

  const fetchEntries = async () => {
    try {
      const message = await invoke<string>('list_entries', {
        page,
        items: 20,
        filters: { folder_eq: folderName, read_eq: 0, account_id_eq: accountId },
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

    addNotification('Reloaded', 'Entries are reloaded!', 'primary')
  }

  const handleUpdateEntriesAsRead = async () => {
    await updateEntriesAsReadByFolder(folderName, accountId)
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
        <div className="flex flex-col py-8 justify-between items-start">
          <div className="flex flex-row justify-between w-full">
            <div className="flex flex-row">
              <h1 className="text-xl md:text-3xl font-bold">{folderName}</h1>
            </div>

            <div className="flex flex-row items-center gap-2">
              <EntryLayoutSwitch />
              <Tooltip content="Update All Entries of The Folder As Read">
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
        </div>
        <EntriesList
          key={folderParam}
          entries={entries}
          fetchEntries={fetchEntries}
          hasMore={hasMore}
          header={true}
        />
      </div>
    </MainSectionLayout>
  )
}

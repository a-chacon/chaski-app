import { createLazyFileRoute } from '@tanstack/react-router'
import MainSectionLayout from '../components/layout/MainSectionLayout'
import { Button } from "@heroui/react"
import { RiRefreshLine } from '@remixicon/react'
import { useEffect } from 'react'
import { EntryInterface } from '../interfaces'
import { invoke } from '@tauri-apps/api/core'
import EntriesList from '../components/EntriesList'
import { useEntries } from '../IndexEntriesContext'
import EntryLayoutSwitch from "../components/EntriesLayoutSwitch"
import { useAppContext } from '../AppContext'

export const Route = createLazyFileRoute('/read_later')({
  component: ReadLater,
})

export default function ReadLater() {
  const { entries, setEntries, page, setPage, hasMore, setHasMore } = useEntries("/read_later");
  const { currentAccount } = useAppContext();

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
        items: 20,
        filters: {
          read_later_eq: 1,
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
    setPage(1);
    setEntries([]);
    setHasMore(true);
  }

  return (
    <MainSectionLayout>
      <div className="flex flex-col max-w-screen-md mx-auto">
        <div className="flex py-8 justify-between items-start">
          <div>
            <h1 className="text-3xl pt-2 font-bold">Read Later</h1>
            <h2 className="pt-1 pb-4">Curate your journey, one entry at a time.</h2>
          </div>
          <div className="flex flex-row items-center gap-2">
            <EntryLayoutSwitch />
            <Button color="primary" isIconOnly variant="light" size="sm" onClick={handleReloadButton}>
              <RiRefreshLine></RiRefreshLine>
            </Button>
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

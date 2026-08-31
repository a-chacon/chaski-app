import { EntryInterface } from '../interfaces'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { invoke } from '@tauri-apps/api/core'
import MainSectionLayout from '../components/layout/MainSectionLayout'

import EntriesList from '../components/EntriesList'
import { useEntries } from '../IndexEntriesContext'
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react'
import { RiMoreLine } from '@remixicon/react'
import { useNotification } from '../NotificationContext'
import { useAppContext } from '../AppContext'
import { updateEntriesAsReadByFolder } from '../helpers/feedsData'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/folders/$folderName')({
  component: Folder,
})

export default function Folder() {
  const { t } = useTranslation('entries')
  const { addNotification } = useNotification()
  const { showReadEntries, showHiddenEntries } = useAppContext()
  const { folderName: folderParam } = Route.useParams()
  const [accountIdStr, folderName] = folderParam.split('-')
  const accountId = Number(accountIdStr)
  const { entries, setEntries, page, setPage, hasMore, setHasMore, scrollTop, setScrollTop } =
    useEntries(folderName)

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
  }, [page, entries.length, showReadEntries, showHiddenEntries])

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    setEntries([])
    setPage(1)
    setHasMore(true)
  }, [folderParam, showReadEntries, showHiddenEntries])

  const fetchEntries = async () => {
    try {
      const message = await invoke<string>('list_entries', {
        page,
        items: 50,
        filters: {
          folder_eq: folderName,
          account_id_eq: accountId,
          ...(showReadEntries ? {} : { read_eq: 0 }),
          ...(showHiddenEntries ? {} : { hidden_eq: 0 }),
        },
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

    addNotification(t('reloadedTitle'), t('reloadingBody'), 'primary')
  }

  const handleUpdateEntriesAsRead = async () => {
    await updateEntriesAsReadByFolder(folderName, accountId)
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
        <div className="flex flex-col py-8 justify-between items-start">
          <div className="flex flex-col sm:flex-row sm:justify-between w-full gap-2">
            <div className="flex flex-row justify-between">
              <h1 className="text-xl md:text-3xl font-bold">{folderName}</h1>
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly variant="light" size="sm">
                    <RiMoreLine />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  variant="light"
                  aria-label="Folder entry actions"
                  className="sm:min-w-0 min-w-[200px]"
                >
                  <DropdownItem
                    key="markRead"
                    onPress={handleUpdateEntriesAsRead}
                  >
                    {t('updateFolderAsRead')}
                  </DropdownItem>
                  <DropdownItem
                    key="reload"
                    onPress={handleReloadButton}
                  >
                    {t('reloadEntries')}
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
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

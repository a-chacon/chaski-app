import { EntryInterface } from '../interfaces'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import MainSectionLayout from '../components/layout/MainSectionLayout'

import EntriesList from '../components/EntriesList'
import { useEntries } from '../IndexEntriesContext'
import { useNotification } from '../NotificationContext'
import { useAppContext } from '../AppContext'
import { updateEntriesAsReadByFolder } from '../helpers/feedsData'
import { useTranslation } from 'react-i18next'
import EntryListToolbar from '../components/EntryListToolbar'
import FolderActions from '../components/FolderActions'
import { RiEditLine, RiDeleteBinLine } from '@remixicon/react'

export const Route = createFileRoute('/folders/$folderName')({
  component: Folder,
})

export default function Folder() {
  const { t } = useTranslation('entries')
  const { addNotification } = useNotification()
  const { showReadEntries, showHiddenEntries, entriesOrder } = useAppContext()
  const navigate = useNavigate()
  const { folderName: folderParam } = Route.useParams()
  // The param is "<accountId>-<folderName>"; folder names may contain hyphens.
  const separatorIndex = folderParam.indexOf('-')
  const accountId = Number(folderParam.slice(0, separatorIndex))
  const folderName = folderParam.slice(separatorIndex + 1)
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
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
  }, [page, entries.length, showReadEntries, showHiddenEntries, entriesOrder])

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    resetEntryList()
    setHasMore(true)
  }, [folderParam, showReadEntries, showHiddenEntries, entriesOrder])

  const fetchEntries = async () => {
    try {
      const message = await invoke<string>('list_entries', {
        page,
        items: 50,
        filters: {
          folder_eq: folderName,
          account_id_eq: accountId,
          order: entriesOrder,
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
    resetEntryList()

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
      <div className="flex flex-col max-w-(--breakpoint-md) mx-auto px-4">
        <div className="flex flex-col py-8 justify-between items-start">
          <div className="w-full flex flex-row justify-between">
            <h1 className="text-xl md:text-3xl font-bold">{folderName}</h1>
            <EntryListToolbar
              onReload={handleReloadButton}
              onMarkAllAsRead={handleUpdateEntriesAsRead}
              extraActions={[
                { key: 'edit', label: t('editFolder'), icon: <RiEditLine className="w-4 h-4" />, onPress: () => setRenameOpen(true) },
                { key: 'delete', label: t('removeFolder'), icon: <RiDeleteBinLine className="w-4 h-4" />, color: 'danger', onPress: () => setDeleteOpen(true) },
              ]}
            />
            <FolderActions
              accountId={accountId}
              folder={folderName}
              renameOpen={renameOpen}
              onRenameOpenChange={setRenameOpen}
              deleteOpen={deleteOpen}
              onDeleteOpenChange={setDeleteOpen}
              onRenamed={(newName) =>
                navigate({ to: '/folders/$folderName', params: { folderName: accountId + '-' + newName } })
              }
              onDeleted={() => navigate({ to: '/' })}
            />
          </div>
        </div>
        {entries.length > 0 || !hasMore ? (
          <EntriesList
            key={folderParam}
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
    </MainSectionLayout >
  )
}

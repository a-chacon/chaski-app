import { createLazyFileRoute } from '@tanstack/react-router'
import MainSectionLayout from '../components/layout/MainSectionLayout'
import { useEffect, useRef } from 'react'
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react"
import { RiMoreLine } from '@remixicon/react'
import { EntryInterface } from '../interfaces'
import { invoke } from '@tauri-apps/api/core'
import EntriesList from '../components/EntriesList'
import { useEntries } from '../IndexEntriesContext'

import { useAppContext } from '../AppContext'
import { useTranslation } from 'react-i18next'

export const Route = createLazyFileRoute('/read_later')({
  component: ReadLater,
})

export default function ReadLater() {
  const { t } = useTranslation('entries')
  const { entries, setEntries, page, setPage, hasMore, setHasMore, scrollTop, setScrollTop } = useEntries("/read_later");
  const { currentAccount, showReadEntries, showHiddenEntries } = useAppContext();
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
          read_later_eq: 1,
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
    setPage(1);
    setEntries([]);
    setHasMore(true);
  }

  return (
    <MainSectionLayout>
      <div className="flex flex-col max-w-screen-md mx-auto px-4">
        <div className="flex flex-col sm:flex-row py-8 sm:justify-between sm:items-start gap-2">
          <div>
            <h1 className="text-3xl pt-2 font-bold">{t('readLater')}</h1>
            <h2 className="pt-1 pb-4">{t('readLaterSubtitle')}</h2>
          </div>
          <div className="sm:pt-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly variant="light" size="sm">
                  <RiMoreLine />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                variant="light"
                aria-label="Read later actions"
                className="sm:min-w-0 min-w-[200px]"
              >
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

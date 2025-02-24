import { ArticleInterface } from '../interfaces'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import MainSectionLayout from '../components/layout/MainSectionLayout'
import EntriesList from '../components/EntriesList'
import { useArticles } from '../IndexArticlesContext'
import { Button, Tooltip } from '@heroui/react'
import { RiRefreshLine, RiCheckDoubleLine } from '@remixicon/react'
import { useNotification } from '../NotificationContext'
import { updateArticlesAsReadByFolder } from '../helpers/feedsData'

export const Route = createFileRoute('/folders/$folderName')({
  component: Folder,
})

export default function Folder() {
  const { addNotification } = useNotification()
  const { folderName: folderParam } = Route.useParams()
  const [accountIdStr, folderName] = folderParam.split('-')
  const accountId = Number(accountIdStr)
  const { articles, setArticles, page, setPage, hasMore, setHasMore } =
    useArticles(folderName)

  useEffect(() => {
    if (page === 1 && articles.length == 0) {
      fetchArticles()
    }
  }, [page])

  const fetchArticles = async () => {
    try {
      const message = await invoke<string>('list_articles', {
        page,
        items: 10,
        filters: { folder_eq: folderName, read_eq: 0, account_id_eq: accountId },
      })

      const new_articles: ArticleInterface[] = JSON.parse(message)

      setArticles((prevArticles) => [...prevArticles, ...new_articles])

      if (new_articles.length === 0) {
        setHasMore(false)
      }

      setPage((prevPage) => prevPage + 1)
    } catch (error) {
      console.error('Error fetching articles:', error)
    }
  }

  const handleReloadButton = () => {
    setPage(1)
    setArticles([])

    addNotification('Reloaded', 'Entries are reloaded!', 'primary')
  }

  const handleUpdateArticlesAsRead = async () => {
    await updateArticlesAsReadByFolder(folderName, accountId)
    resetArticleList()

    addNotification('Updated', 'All entries were updated as read!', 'primary')
  }

  const resetArticleList = () => {
    setArticles([])
    setPage(1)
  }

  return (
    <MainSectionLayout>
      <div className="flex flex-col p-4 max-w-screen-md mx-auto">
        <div className="flex flex-col border-b py-4 justify-between items-start">
          <div className="flex flex-row justify-between w-full">
            <div className="flex flex-row">
              <h1 className="text-xl md:text-3xl font-bold">{folderName}</h1>
            </div>

            <div className="flex flex-row items-center gap-2">
              <Tooltip content="Update All Articles of The Folder As Read">
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onPress={handleUpdateArticlesAsRead}
                >
                  <RiCheckDoubleLine></RiCheckDoubleLine>
                </Button>
              </Tooltip>
              <Tooltip content="Reload The Page's Articles">
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
          articles={articles}
          fetchArticles={fetchArticles}
          hasMore={hasMore}
          header={true}
        />
      </div>
    </MainSectionLayout>
  )
}

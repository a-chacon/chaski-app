import { createLazyFileRoute, Navigate } from '@tanstack/react-router'
import MainSectionLayout from '../components/layout/MainSectionLayout'
import { Button, Tooltip } from "@heroui/react"
import { RiRefreshLine, RiCheckDoubleLine } from '@remixicon/react'
import { useEffect } from 'react'
import { ArticleInterface } from '../interfaces'
import { invoke } from '@tauri-apps/api/core'
import IndexArticles from '../components/IndexArticles'
import { useArticles } from '../IndexArticlesContext'
import { useNotification } from '../NotificationContext'
import { updateAllArticlesAsRead } from '../helpers/feedsData'

export const Route = createLazyFileRoute('/')({
  component: () => <Navigate to="/today" />,
  errorComponent: () => <Navigate to="/onboarding" />,
})

export default function App() {
  const { addNotification } = useNotification()
  const { articles, setArticles, page, setPage, hasMore, setHasMore } =
    useArticles('/')

  useEffect(() => {
    if (page === 1 && articles.length == 0) {
      fetchArticles()
    }
  }, [page])

  const fetchArticles = async () => {
    try {
      const message = await invoke<string>('list_articles', {
        page: page,
        items: 10,
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

    addNotification('Reloading', 'Entries are reloaded!', 'secondary')
  }

  const handleUpdateArticlesAsRead = async () => {
    await updateAllArticlesAsRead()
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
        <div className="flex border-b border-default-500 py-4 justify-between items-start">
          <div>
            <h1 className="text-3xl pt-2 font-bold">All</h1>
            <h2 className="pt-1 pb-4">
              Explore the latest articles and updates from your favorite
              sources, all in one place.
            </h2>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Tooltip content="Update All Articles As Read">
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onClick={handleUpdateArticlesAsRead}
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
                onClick={handleReloadButton}
              >
                <RiRefreshLine></RiRefreshLine>
              </Button>
            </Tooltip>
          </div>
        </div>
        <IndexArticles
          key="index"
          articles={articles}
          fetchArticles={fetchArticles}
          hasMore={hasMore}
          header={true}
        />
      </div>
    </MainSectionLayout>
  )
}

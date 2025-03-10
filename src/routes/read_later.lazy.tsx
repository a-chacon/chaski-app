import { createLazyFileRoute } from '@tanstack/react-router'
import MainSectionLayout from '../components/layout/MainSectionLayout'
import { Button } from "@heroui/react"
import { RiRefreshLine } from '@remixicon/react'
import { useEffect } from 'react'
import { ArticleInterface } from '../interfaces'
import { invoke } from '@tauri-apps/api/core'
import EntriesList from '../components/EntriesList'
import { useArticles } from '../IndexArticlesContext'

export const Route = createLazyFileRoute('/read_later')({
  component: ReadLater,
})

export default function ReadLater() {
  const { articles, setArticles, page, setPage, hasMore, setHasMore } = useArticles("/read_later");

  useEffect(() => {
    if (page === 1 && articles.length == 0) {
      fetchArticles()
    }
  }, [page])

  const fetchArticles = async () => {
    try {
      const message = await invoke<string>('list_articles', {
        page: page,
        items: 20,
        filters: {
          read_later_eq: 1
        }
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
    setPage(1);
    setArticles([]);
  }

  return (
    <MainSectionLayout>
      <div className="flex flex-col p-4 max-w-screen-md mx-auto">
        <div className="flex border-b border-default-500 py-4 justify-between items-start">
          <div>
            <h1 className="text-3xl pt-2 font-bold">Read Later</h1>
            <h2 className="pt-1 pb-4">Curate your journey, one article at a time.</h2>
          </div>
          <div>
            <Button color="primary" isIconOnly variant="light" size="sm" onClick={handleReloadButton}>
              <RiRefreshLine></RiRefreshLine>
            </Button>
          </div>
        </div>
        <EntriesList
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

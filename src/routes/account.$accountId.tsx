import { ArticleInterface, AccountInterface } from '../interfaces'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import {
  Button,
  Tooltip,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/react'
import { RiRefreshLine, RiDownloadCloudLine, RiDeleteBinLine } from "@remixicon/react";
import MainSectionLayout from '../components/layout/MainSectionLayout'
import IndexArticles from '../components/IndexArticles'
import { useAppContext } from "../AppContext";
import { useArticles } from '../IndexArticlesContext'
import { useNavigate } from '@tanstack/react-router';
import { showAccount, fullSync, deleteAccount } from '../helpers/accountsData'

export const Route = createFileRoute('/account/$accountId')({
  component: RouteComponent,
})
export default function RouteComponent() {
  const { accountId } = Route.useParams()
  const { articles, setArticles, page, setPage, hasMore, setHasMore } =
    useArticles(accountId)
  const [account, setAccount] = useState<AccountInterface | null>(null)
  const deleteModal = useDisclosure();
  const navigate = useNavigate({ from: '/' })
  const {
    setAccounts,
    accounts
  } = useAppContext();

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const accountData = await showAccount(parseInt(accountId))
        setAccount(accountData)
      } catch (error) {
        console.error('Error fetching account:', error)
      }
    }

    fetchAccount()
  }, [accountId])

  useEffect(() => {
    if (page === 1 && articles.length == 0) {
      fetchArticles()
    }
  }, [page])

  const handleReloadButton = async () => {
    setPage(1)
    setArticles([])
    setHasMore(true)
    await fetchArticles()
  }

  const handleFullSync = async () => {
    if (account?.kind === 'greaderapi') {
      try {
        await fullSync(parseInt(accountId))
        handleReloadButton()
      } catch (error) {
        console.error('Error during full sync:', error)
      }
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount(parseInt(accountId));
      setAccounts(prevAccounts =>
        prevAccounts.filter(acc => acc.id !== parseInt(accountId))
      );
      navigate({ to: '/today' })
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const fetchArticles = async () => {
    try {
      const message = await invoke<string>('list_articles', {
        page,
        items: 10,
        filters: { account_id_eq: parseInt(accountId), read_eq: 0 },
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


  return (
    <MainSectionLayout>
      <div className="flex flex-col p-4 max-w-screen-md mx-auto">
        <div className="flex flex-col border-b py-4 justify-between items-start">
          <div className="flex flex-row justify-between w-full">
            <div className="flex flex-row">

              <div className="flex flex-col gap-2">
                <h1 className="text-xl md:text-3xl font-bold">
                  {account ? account.name : `Account #${accountId}`}
                </h1>
                <div className="text-sm text-default-500">
                  <span>Type: {account?.kind}</span>
                  {account?.kind === 'greaderapi' && (
                    <>
                      <span> • Server: {account.server_url}</span>
                      <span> • User: {account.credentials!.username}</span>
                    </>
                  )}
                </div>
              </div>

            </div>

            <div className="flex flex-row items-center gap-2">
              <Tooltip content="Reload Articles">
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onPress={handleReloadButton}
                >
                  <RiRefreshLine />
                </Button>
              </Tooltip>
              {account?.kind === 'greaderapi' && (
                <Tooltip content="Full Synchronization">
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onPress={handleFullSync}
                  >
                    <RiDownloadCloudLine />
                  </Button>
                </Tooltip>
              )}
              <Tooltip content="Delete Account">
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  color="danger"
                  onPress={deleteModal.onOpen}
                >
                  <RiDeleteBinLine />
                </Button>
              </Tooltip>

              <Modal isOpen={deleteModal.isOpen} onOpenChange={deleteModal.onOpenChange}>
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex flex-col gap-1">Delete Account</ModalHeader>
                      <ModalBody>
                        <p>
                          Are you sure you want to delete this account? This action cannot be undone.
                        </p>
                        <p className="text-danger">
                          All associated data will be permanently removed.
                        </p>
                      </ModalBody>
                      <ModalFooter>
                        <Button color="default" variant="light" onPress={onClose}>
                          Cancel
                        </Button>
                        <Button color="danger" onPress={() => {
                          handleDeleteAccount();
                          onClose();
                        }}>
                          Delete Account
                        </Button>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>
            </div>
          </div>
        </div>
        <IndexArticles
          key={accountId}
          articles={articles}
          fetchArticles={fetchArticles}
          hasMore={hasMore}
          header={true}
        />
      </div>
    </MainSectionLayout>
  )
}


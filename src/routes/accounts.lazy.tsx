import { createLazyFileRoute } from '@tanstack/react-router'
import AccountsList from '../components/AccountsList'
import { useDisclosure, Button } from '@heroui/react'
import MainSectionLayout from '../components/layout/MainSectionLayout';
import NewAccountModal from '../components/NewAccountModal';
import { useAppContext } from "../AppContext";

export const Route = createLazyFileRoute('/accounts')({
  component: Accounts,
})

function Accounts() {

  const {
    accounts,
  } = useAppContext();

  const newAccountModal = useDisclosure()

  return (
    <MainSectionLayout>
      <div className="flex flex-col p-4 max-w-screen-md mx-auto">
        <h1 className="text-3xl font-semibold p-4 text-center mx-auto">
          Accounts
        </h1>
        <AccountsList accounts={accounts} />

        <Button color="primary" className="w-96 mx-auto" onPress={newAccountModal.onOpen}>
          Add An Account
        </Button>
        <NewAccountModal
          isOpen={newAccountModal.isOpen}
          onOpen={newAccountModal.onOpen}
          onClose={newAccountModal.onClose}
          onOpenChange={newAccountModal.onOpenChange}
        />
      </div>
    </MainSectionLayout >
  )
}

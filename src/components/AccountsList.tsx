import { Card, CardBody } from '@heroui/react';
import { AccountInterface } from '../interfaces';
import { useTranslation } from 'react-i18next';

interface AccountCardProps {
  account: AccountInterface;
}

function AccountCard({ account }: AccountCardProps) {
  const { t } = useTranslation('accounts');
  return (
    <Card className="w-96 mb-4">
      <CardBody>
        <h3 className="text-lg font-semibold">{account.name}</h3>
        <p className="text-sm text-gray-500">{t('type')}: {account.kind}</p>
        <p className="text-xs text-gray-400">{t('created')}: {new Date(account.created_at).toLocaleDateString()}</p>
      </CardBody>
    </Card>
  );
}

interface AccountsListProps {
  accounts: AccountInterface[];
}

export default function AccountsList({ accounts }: AccountsListProps) {
  return (
    <div className="flex flex-col items-center my-4 gap-2">
      {accounts.map((account) => (
        <AccountCard
          key={account.id || account.name}
          account={account}
        />
      ))}
    </div>
  );
}

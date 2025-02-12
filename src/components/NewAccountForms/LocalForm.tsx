import React from "react";
import { AccountInterface } from "../../interfaces";
import { createAccount } from "../../helpers/accountsData";
import { Form, Input, Button } from "@heroui/react";
import { useAppContext } from "../../AppContext";

interface SyncLoginFormProps {
  onClose: () => void;
}

const LocalForm: React.FC<SyncLoginFormProps> = ({ onClose }) => {

  const {
    setAccounts,
  } = useAppContext();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const accountData: AccountInterface = {
      name: formData.get('name') as string,
      kind: 'local',
      updated_at: new Date(),
      created_at: new Date()
    };

    try {
      const newAccount = await createAccount(accountData);
      setAccounts((prevAccounts: AccountInterface[]) => {
        const updatedAccounts: AccountInterface[] = [...prevAccounts, newAccount];
        return updatedAccounts;
      });
      onClose();
    } catch (error) {
      console.error('Failed to create account:', error);
    }
  };

  return (
    <Form
      className="w-full flex flex-col gap-4 py-4"
      validationBehavior="native"
      onSubmit={onSubmit}
    >
      <Input
        isRequired
        label="Account Identifier"
        labelPlacement="outside"
        name="name"
        placeholder="Enter a name for the local RSS account."
        type="text"
      />

      <div className="flex w-full justify-end">
        <Button color="primary" type="submit">
          Create
        </Button>
      </div>
    </Form>
  );
}


export default LocalForm;

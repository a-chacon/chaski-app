import React, { useState } from "react";
import { AccountInterface } from "../../interfaces";
import { createAccount, fullSync } from "../../helpers/accountsData";
import { Form, Input, Button } from "@heroui/react";
import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";
import { useAppContext } from "../../AppContext";

interface SyncLoginFormProps {
  onClose: () => void;
}

const GReaderForm: React.FC<SyncLoginFormProps> = ({ onClose }) => {
  const {
    setAccounts,
  } = useAppContext();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const credentials = {
      username: formData.get('username') as string,
      password: formData.get('password') as string
    };

    let serverUrl = formData.get('server') as string;

    if (!/^https?:\/\//i.test(serverUrl)) {
      serverUrl = `http://${serverUrl}`;
    }

    const accountData: AccountInterface = {
      name: serverUrl,
      kind: 'greaderapi',
      credentials: credentials,
      server_url: serverUrl,
      updated_at: new Date(),
      created_at: new Date()
    };

    try {
      const newAccount = await createAccount(accountData);
      fullSync(newAccount.id!);

      setAccounts((prevAccounts: AccountInterface[]) => {
        const updatedAccounts: AccountInterface[] = [...prevAccounts, newAccount];
        return updatedAccounts;
      })
      onClose();
    } catch (error) {
      setErrorMessage(`Please try again. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Failed to create account:', error);
    } finally {
      setIsSubmitting(false);
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
        errorMessage="Please enter a valid url"
        label="Server Url"
        labelPlacement="outside"
        name="server"
        placeholder="Enter your server url"
        type="url"
      />

      <Input
        isRequired
        errorMessage="Please enter a valid username"
        label="Username"
        labelPlacement="outside"
        name="username"
        placeholder="Enter your username"
        type="text"
      />

      <Input
        isRequired
        errorMessage="Please enter a valid password"
        label="Password"
        labelPlacement="outside"
        name="password"
        placeholder="Enter your password"
        type={isPasswordVisible ? "text" : "password"}
        endContent={
          <button
            className="focus:outline-none"
            type="button"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
          >
            {isPasswordVisible ? (
              <RiEyeLine></RiEyeLine>
            ) : (
              <RiEyeOffLine></RiEyeOffLine>
            )}
          </button>
        }
      />

      {errorMessage && (
        <div className="text-red-500 text-sm mt-2">
          {errorMessage}
        </div>
      )}

      <div className="flex w-full justify-end gap-2">
        <Button
          color="primary"
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </Button>
      </div>
    </Form>
  );
}

export default GReaderForm;

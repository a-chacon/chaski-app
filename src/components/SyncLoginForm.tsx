import React from "react";
import { Form, Input, Button } from "@heroui/react";

interface SyncLoginFormProps {
  setSuccessfulLogin: React.Dispatch<React.SetStateAction<boolean>>,
}

const SyncLoginForm: React.FC<SyncLoginFormProps> = ({ setSuccessfulLogin }) => {
  const [action, setAction] = React.useState("");

  return (
    <Form
      className="w-full flex flex-col gap-4"
      validationBehavior="native"
      onReset={() => setAction("reset")}
      onSubmit={(e) => {
        e.preventDefault();
        let data = Object.fromEntries(new FormData(e.currentTarget));

        setAction(`submit ${JSON.stringify(data)}`);
      }}
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
        type="password"
      />

      <div className="flex gap-2 justify-end">
        <Button color="primary" type="submit">
          Submit
        </Button>
        <Button type="reset" variant="flat">
          Reset
        </Button>
      </div>
      {action && (
        <div className="text-small text-default-500">
          Action: <code>{action}</code>
        </div>
      )}
    </Form>
  );
}


export default SyncLoginForm;

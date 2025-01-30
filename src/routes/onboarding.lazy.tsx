import { createLazyFileRoute } from '@tanstack/react-router'
import { load } from '@tauri-apps/plugin-store';
import {
  Button,
  useDisclosure
} from "@heroui/react";
import NewAccountModal from '../components/NewAccountModal';
import { useState } from 'react';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useNavigate } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/onboarding')({
  component: Onboarding,
})

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate({ from: '/onboarding' })
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure({
    onClose: () => {
      if (step === 3) {
        goNext();
      }
    }
  });


  const complete = async () => {
    const store = await load('settings.json', { autoSave: true });
    await store.set('onboarding-completed', { value: true });
  }

  const goNext = () => {
    if (step + 1 == 5) {
      complete()
      navigate({ to: '/' })
    }
    setStep((prevStep) => Math.min(prevStep + 1, 4));
  }

  const goBack = () => {
    setStep((prevStep) => Math.max(prevStep - 1, 1));
  }


  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-5">
            <img src="/chaski.png" alt="" className='w-20' />
            <h1 className="text-3xl font-bold">Welcome to Chaski! 👋</h1>
            <p className="text-lg text-default-600">
              Your personal feed reader for staying in control of your content.
            </p>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold">Make it yours 🎨</h2>
              <p className="text-lg text-default-600">
                Personalize your experience with your favorite look and feel
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg text-default-600">Choose your theme:</h3>
              <div>
                <ThemeSwitcher />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold">Connect your feeds 📚</h2>
              <p className="text-lg text-default-600">
                Add your RSS accounts now or set them up later - your choice!
              </p>
            </div>
            <div className='flex flex-col gap-3 w-1/2'>
              <Button
                color="primary"
                size="md"
                onPress={onOpen}
                className="font-semibold"
              >
                Add Account
              </Button>
              <Button
                color="primary"
                variant="faded"
                size="md"
                onPress={goNext}
                className="font-semibold"
              >
                Skip for now
              </Button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">You're all set! 🎉</h2>
            <p className="text-lg text-default-600">
              <strong>Did you know?</strong> The name "Chaski" comes from the Inca Chasquis, the swift messengers who carried important messages across the empire. 🏃‍♂️
            </p>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className='z-50 w-full h-full absolute top-0 left-0 bg-background'>
      <div className="grid h-screen place-items-center">
        <div className='w-11/12 md:w-8/12'>
          {renderStepContent()}
        </div>

        <div className="absolute bottom-10 flex justify-between w-full p-10">
          <Button onClick={goBack}
            color="primary"
            variant="light"
            isDisabled={step === 1}
          >Back</Button>
          <Button onClick={goNext}
            color="primary"
            variant="flat"
          >
            {step === 4 ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>
      <NewAccountModal
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        onOpenChange={onOpenChange}
      />
    </div>
  );
}


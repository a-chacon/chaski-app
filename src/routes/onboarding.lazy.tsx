import { createLazyFileRoute } from '@tanstack/react-router'
import { load } from '@tauri-apps/plugin-store';
import {
  Button,
  Card, CardFooter, CardBody, useDisclosure
} from "@heroui/react";
import { useState } from 'react';
import { RiCloudOffLine, RiCloudLine } from '@remixicon/react';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useNavigate } from '@tanstack/react-router';
import SyncLoginModal from '../components/SyncLoginModal';

export const Route = createLazyFileRoute('/onboarding')({
  component: Onboarding,
})

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate({ from: '/onboarding' })
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [successfulLogin, setSuccessfulLogin] = useState(false)


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

  const handleModeSelection = async (mode: string) => {
    const store = await load('settings.json', { autoSave: true });
    if (mode == "local") {
      await store.set('app-mode', { value: "local" });
      goNext();
    } else if (mode == "remote") {


    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <img src="/chaski.png" alt="" className='w-20' />
            <h1 className="pt-1 pb-4 text-3xl font-bold">Welcome to Chaski! 👋</h1>
            <p className="text-lg">A Feed Reader App for those who want to control their content.</p>
          </div>
        );
      case 2:
        return (
          <div>
            <div className="py-4">
              <h2 className="pt-1 text-3xl font-bold">Make yourself at home</h2>
              <p className="text-lg">Personalize your experience with your favorite look</p>
            </div>
            <div className="py-2">
              <h3 className="pb-4">Choose your prefered color:</h3>
              <ThemeSwitcher></ThemeSwitcher>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <div className='py-4'>
              <h2 className="pt-1 pb-4 text-3xl font-bold">Choose the mode</h2>
              <p className="text-lg">How will you use this app?</p>
            </div>
            <div className='grid grid-cols-2 gap-5'>
              <Card className="border-none hover:bg-default" radius="lg" isPressable onPress={onOpen}>
                <CardBody className="overflow-visible p-10">
                  <RiCloudLine className='w-20 h-20 mx-auto my-auto' />
                </CardBody>
                <CardFooter className='flex flex-col text-left'>
                  <h2 className="text-lg font-bold p-2">Client App (Google Reader API)</h2>
                  <p className='py-1'>Connect to servers like FreshRSS, Miniflux, or Tiny Tiny RSS.</p>
                </CardFooter>
              </Card>
              <Card className="border-none bg-primary-500 hover:bg-primary-600" radius="lg" isPressable onPress={() => handleModeSelection("local")}>
                <CardBody className="overflow-visible p-10">
                  <RiCloudOffLine className='w-20 h-20 mx-auto my-auto' />
                </CardBody>
                <CardFooter className='flex flex-col text-left'>
                  <h2 className="text-lg font-bold p-2">Local Aggregator</h2>
                  <p className='py-1'>All data stays on your device. No external servers.</p>
                </CardFooter>
              </Card>
            </div>
            <SyncLoginModal
              setSuccessfulLogin={setSuccessfulLogin}
              isOpen={isOpen}
              onOpen={onOpen}
              onClose={onClose}
              onOpenChange={onOpenChange}
            />
          </div>
        );

      case 4:
        return (
          <div>
            <h2 className="pt-1 pb-4 text-3xl font-bold">Enjoy it! 🚀</h2>
            <p className="text-lg"><strong>A final tip:</strong> The name "Chaski" comes from the Inca Chasquis, the swift messengers who carried important messages across the empire.</p>
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
    </div>
  );
}


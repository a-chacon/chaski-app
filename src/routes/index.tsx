import { createFileRoute } from '@tanstack/react-router'
import { load } from '@tauri-apps/plugin-store';

export const Route = createFileRoute('/')({
  loader: async () => {
    const store = await load('settings.json', { autoSave: true });
    const onboardingCompleted = await store.get<{ value: boolean }>('onboarding-completed');
    if (!onboardingCompleted?.value) {
      throw new Error('Onboarding Incomplete')
    }
  },
})


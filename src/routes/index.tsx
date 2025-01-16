import { createFileRoute } from '@tanstack/react-router'
import { load } from '@tauri-apps/plugin-store';

export const Route = createFileRoute('/')({
  loader: async () => {
    const store = await load('settings.json', { autoSave: true });
    const firstval = await store.get<{ value: boolean }>('onboarding-completed');
    if (!firstval) {
      await store.set('onboarding-completed', { value: false });
    }
    const val = await store.get<{ value: boolean }>('onboarding-completed');
    if (!val?.value) {
      throw new Error('Onboarding Incomplete')
    }
  },
})


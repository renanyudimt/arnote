import { RouterProvider } from 'react-router-dom'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { DevPanel } from '@/features/dev-panel'

import { router } from './router'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false
    },
    mutations: {
      retry: false
    }
  }
})

export function App(): React.JSX.Element {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
      {import.meta.env.DEV && <DevPanel />}
    </>
  )
}

import { RouterProvider } from 'react-router-dom'

import { DevPanel } from '@/features/dev-panel'

import { router } from './router'

export function App(): React.JSX.Element {
  return (
    <>
      <RouterProvider router={router} />
      {import.meta.env.DEV && <DevPanel />}
    </>
  )
}

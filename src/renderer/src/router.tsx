import { createHashRouter } from 'react-router-dom'

import { HomePage } from '@/features/home'
import { SessionPage } from '@/features/session'
import { SessionDetailPage } from '@/features/session-detail'
import { SettingsPage } from '@/features/settings'

export const router = createHashRouter([
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/session',
    element: <SessionPage />
  },
  {
    path: '/session/:id',
    element: <SessionDetailPage />
  },
  {
    path: '/settings',
    element: <SettingsPage />
  }
])

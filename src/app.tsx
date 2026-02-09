import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from '@/components/error-boundary'
import { AuthenticatedLayout } from '@/components/layouts/authenticated-layout'

// Pages
import { LandingPage } from '@/pages/landing-page'
import { AuthPage } from '@/pages/auth-page'
import { JoinRoomPage } from '@/pages/join-room-page'
import { RoomLobbyPage } from '@/pages/room-lobby-page'
import { GameRoomPage } from '@/pages/game-room-page'
import { NotFoundPage } from '@/pages/not-found-page'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          
          {/* Protected Routes */}
          <Route path="/join-room" element={<AuthenticatedLayout />}>
            <Route index element={<JoinRoomPage />} />
          </Route>
          <Route path="/room/:roomId" element={<AuthenticatedLayout />}>
            <Route index element={<RoomLobbyPage />} />
            <Route path="game" element={<GameRoomPage />} />
          </Route>
          
          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
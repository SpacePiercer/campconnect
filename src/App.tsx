import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthPage from './pages/AuthPage'
import ExplorePage from './pages/ExplorePage'
import MyHikesPage from './pages/MyHikesPage'
import CreateHikePage from './pages/CreateHikePage'
import ProfilePage from './pages/ProfilePage'
import HubPage from './pages/HubPage'
import TabBar from './components/TabBar'

function Shell() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-svh flex items-center justify-center text-4xl">🏕️</div>
    )
  }
  if (!session) return <AuthPage />

  return (
    <div className="max-w-md mx-auto min-h-svh pb-20">
      <Routes>
        <Route path="/" element={<ExplorePage />} />
        <Route path="/mine" element={<MyHikesPage />} />
        <Route path="/create" element={<CreateHikePage />} />
        <Route path="/edit/:id" element={<CreateHikePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/hike/:id" element={<HubPage />} />
      </Routes>
      <TabBar />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </AuthProvider>
  )
}

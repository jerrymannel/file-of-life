import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { initDB } from './db/database'
import { Layout } from './components/Layout'
import { RecordsListPage } from './pages/RecordsListPage'
import { FormPage } from './pages/FormPage'
import { PrintPage } from './pages/PrintPage'

function App() {
  const [dbReady, setDbReady] = useState(false)
  const [dbError, setDbError] = useState<string | null>(null)

  useEffect(() => {
    initDB()
      .then(() => setDbReady(true))
      .catch((err: unknown) => {
        setDbError(String(err))
      })
  }, [])

  if (dbError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 max-w-sm text-center">
          <p className="font-medium text-destructive mb-2">Failed to initialize database</p>
          <p className="text-sm text-muted-foreground">{dbError}</p>
        </div>
      </div>
    )
  }

  if (!dbReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Initializing database...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><RecordsListPage /></Layout>} />
        <Route path="/new" element={<Layout><FormPage /></Layout>} />
        <Route path="/edit/:id" element={<Layout><FormPage /></Layout>} />
        <Route path="/print/:id" element={<Layout><PrintPage /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

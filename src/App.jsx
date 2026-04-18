import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import AIFinderPage from './pages/AIFinderPage'
import BuyerMatchingPage from './pages/BuyerMatchingPage'
import DealsPage from './pages/DealsPage'
import DashboardPage from './pages/DashboardPage'
import DataManagementPage from './pages/DataManagementPage'
import NewsPage from './pages/NewsPage'
import ProspectEntryPage from './pages/ProspectEntryPage'
import AboutPage from './pages/AboutPage'
import AIDueDiligencePage from './pages/AIDueDiligencePage'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ai-finder" element={<AIFinderPage />} />
          <Route path="/buyer-matching" element={<BuyerMatchingPage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/data-management" element={<DataManagementPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/prospect-entry" element={<ProspectEntryPage />} />
          <Route path="/ai-due-diligence" element={<AIDueDiligencePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App

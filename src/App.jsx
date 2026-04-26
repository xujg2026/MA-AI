import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import AIFinderPage from './pages/AIFinderPage'
import BuyerMatchingPage from './pages/BuyerMatchingPage'
import BuyerMatchInputPage from './pages/BuyerMatchInputPage'
import DealsPage from './pages/DealsPage'
import DashboardPage from './pages/DashboardPage'
import DataManagementPage from './pages/DataManagementPage'
import NewsPage from './pages/NewsPage'
import AboutPage from './pages/AboutPage'
import AIDueDiligencePage from './pages/AIDueDiligencePage'
import ProjectListPage from './pages/ProjectListPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import ProjectEditPage from './pages/ProjectEditPage'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ai-finder" element={<AIFinderPage />} />
          <Route path="/buyer-matching" element={<BuyerMatchingPage />} />
          <Route path="/buyer-match-input" element={<BuyerMatchInputPage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/data-management" element={<DataManagementPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/ai-due-diligence" element={<AIDueDiligencePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/projects" element={<ProjectListPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/projects/:id/edit" element={<ProjectEditPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App

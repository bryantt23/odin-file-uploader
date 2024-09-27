import './App.css'
import FolderList from './components/FolderList'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import FolderContent from './components/FolderContent'

function App() {
  return (
    <Router>
      <div>
        <h1>Odin File Uploader</h1>
        <Routes>
          <Route path="/" element={<FolderList />} />
          <Route path="/:directory" element={<FolderContent />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

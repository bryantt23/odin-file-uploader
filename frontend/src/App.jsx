import './App.css'
import FolderList from './components/FolderList'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import FolderContent from './components/FolderContent'
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Login } from './components/Login';

const Header = () => {
  const { user, logout } = useAuth()
  return (<header>
    <h1>Odin File Uploader</h1>
    <nav>
      <Link to="/">Home</Link>
      {user ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  </header>)
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div>
          <Header />
          <h1>Odin File Uploader</h1>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><FolderList /></ProtectedRoute>} />
            <Route path="/:directory" element={<ProtectedRoute><FolderContent /></ProtectedRoute>} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App

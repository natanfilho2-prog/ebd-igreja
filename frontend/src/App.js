import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import GerenciarPerguntas from './pages/Professor/GerenciarPerguntas';
import Rankings from './pages/Professor/Rankings';

// Páginas do Aluno
import Quiz from './pages/Aluno/Quiz';
import Presenca from './pages/Aluno/Presenca';

// Páginas do Professor
import Login from './pages/Professor/Login';
import Dashboard from './pages/Professor/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('professor_token') === 'fake-token-123'
  );

  function handleLogin() {
    setIsAuthenticated(true);
  }

  function handleLogout() {
    localStorage.removeItem('professor_token');
    localStorage.removeItem('professor_email');
    setIsAuthenticated(false);
  }

  return (
    <BrowserRouter>
      <div style={styles.navbar}>
        <div style={styles.navContainer}>
          <Link to="/" style={styles.logo}>
            📚 EBD - Escola Bíblica Dominical
          </Link>
          <div style={styles.navLinks}>
            <Link to="/" style={styles.navLink}>Quiz</Link>
            <Link to="/presenca" style={styles.navLink}>Presença</Link>
            {isAuthenticated ? (
              <>
                <Link to="/professor/dashboard" style={styles.navLink}>Dashboard</Link>
                <button onClick={handleLogout} style={styles.logoutButton}>
                  Sair
                </button>
              </>
            ) : (
              <Link to="/professor/login" style={styles.navLink}>Professor</Link>
            )}
          </div>
        </div>
      </div>

      <div style={styles.content}>
        <Routes>
          {/* Rotas do Aluno */}
          <Route path="/" element={<Quiz />} />
          <Route path="/presenca" element={<Presenca />} />

          {/* Rotas do Professor */}
          <Route path="/professor/login" element={<Login onLogin={handleLogin} />} />
          <Route
            path="/professor/dashboard"
            element={
              isAuthenticated ? <Dashboard /> : <Navigate to="/professor/login" />
            }
          />
          <Route
            path="/professor/perguntas"
            element={
              isAuthenticated ? <GerenciarPerguntas /> : <Navigate to="/professor/login" />
            }
          />
          <Route
            path="/professor/rankings"
            element={
              isAuthenticated ? <Rankings /> : <Navigate to="/professor/login" />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const styles = {
  navbar: {
    backgroundColor: '#2c3e50',
    padding: '1rem',
    color: 'white'
  },
  navContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1.2rem',
    fontWeight: 'bold'
  },
  navLinks: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    padding: '0.5rem',
    borderRadius: '4px',
    transition: 'background 0.3s'
  },
  logoutButton: {
    backgroundColor: 'transparent',
    border: '1px solid white',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  content: {
    minHeight: 'calc(100vh - 80px)',
    backgroundColor: '#f5f5f5'
  }
};

export default App;
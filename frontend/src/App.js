import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { colors } from './styles/globalStyles';

// Páginas do Aluno
import QuizLicao from './pages/Aluno/QuizLicao';
import Presenca from './pages/Aluno/Presenca';

// Páginas do Professor
import Login from './pages/Professor/Login';
import Dashboard from './pages/Professor/Dashboard';
import GerenciarLicoes from './pages/Professor/GerenciarLicoes';
import GerenciarPerguntas from './pages/Professor/GerenciarPerguntas';
import Rankings from './pages/Professor/Rankings';

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
            {isAuthenticated ? (
              <>
                <Link to="/professor/dashboard" style={styles.navLink}>Dashboard</Link>
                <Link to="/professor/licoes" style={styles.navLink}>Lições</Link>
                <Link to="/professor/perguntas" style={styles.navLink}>Perguntas</Link>
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
          {/* Rota principal redireciona para login */}
          <Route path="/" element={<Navigate to="/professor/login" />} />

          {/* Rotas do Aluno (acesso direto por link) */}
          <Route path="/quiz/:licaoId" element={<QuizLicao />} />
          <Route path="/presenca/:licaoId" element={<Presenca />} />

          {/* Rotas do Professor */}
          <Route path="/professor/login" element={<Login onLogin={handleLogin} />} />
          <Route
            path="/professor/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/professor/login" />}
          />
          <Route
            path="/professor/licoes"
            element={isAuthenticated ? <GerenciarLicoes /> : <Navigate to="/professor/login" />}
          />
          <Route
            path="/professor/perguntas"
            element={isAuthenticated ? <GerenciarPerguntas /> : <Navigate to="/professor/login" />}
          />
          <Route
            path="/professor/rankings"
            element={isAuthenticated ? <Rankings /> : <Navigate to="/professor/login" />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const styles = {
  navbar: {
    backgroundColor: colors.primaryDark,
    padding: '1rem',
    color: colors.white,
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  navContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    color: colors.white,
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
    color: colors.white,
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    transition: 'all 0.3s',
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.1)'
    }
  },
  logoutButton: {
    backgroundColor: 'transparent',
    border: `1px solid ${colors.white}`,
    color: colors.white,
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    ':hover': {
      backgroundColor: colors.danger,
      borderColor: colors.danger
    }
  },
  content: {
    minHeight: 'calc(100vh - 80px)',
    backgroundColor: colors.gray100
  }
};

export default App;
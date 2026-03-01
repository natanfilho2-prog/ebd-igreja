import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setErro('');

        try {
            // Por enquanto, usaremos um login simples
            // Depois implementaremos JWT
            if (email === 'admin@igreja.com' && senha === '123456') {
                // Salvar token fake
                localStorage.setItem('professor_token', 'fake-token-123');
                localStorage.setItem('professor_email', email);
                
                onLogin();
                navigate('/professor/dashboard');
            } else {
                setErro('E-mail ou senha inválidos');
            }
        } catch (error) {
            setErro('Erro ao fazer login. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.titulo}>🔐 Área do Professor</h2>
                
                {erro && (
                    <div style={styles.erro}>
                        {erro}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            placeholder="admin@igreja.com"
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Senha</label>
                        <input
                            type="password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            style={styles.input}
                            placeholder="••••••"
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{
                            ...styles.botao,
                            ...(loading ? styles.botaoDesabilitado : {})
                        }}
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <div style={styles.info}>
                    <p>Login de demonstração:</p>
                    <p>E-mail: admin@igreja.com</p>
                    <p>Senha: 123456</p>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        backgroundColor: '#f5f5f5'
    },
    card: {
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
    },
    titulo: {
        textAlign: 'center',
        color: '#333',
        marginBottom: '30px'
    },
    erro: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '20px',
        textAlign: 'center'
    },
    form: {
        marginBottom: '20px'
    },
    inputGroup: {
        marginBottom: '20px'
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold',
        color: '#333'
    },
    input: {
        width: '100%',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '16px',
        boxSizing: 'border-box'
    },
    botao: {
        backgroundColor: '#2196F3',
        color: 'white',
        padding: '15px',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        cursor: 'pointer',
        width: '100%'
    },
    botaoDesabilitado: {
        backgroundColor: '#90caf9',
        cursor: 'not-allowed'
    },
    info: {
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#e3f2fd',
        borderRadius: '4px',
        fontSize: '14px',
        color: '#1976d2',
        textAlign: 'center'
    }
};

export default Login;
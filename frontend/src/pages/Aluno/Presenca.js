import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';

function Presenca() {
    const [aluno, setAluno] = useState({
        nome: '',
        email: '',
        turma: ''
    });
    const [loading, setLoading] = useState(false);
    const [sucesso, setSucesso] = useState(false);
    const [jaRegistrado, setJaRegistrado] = useState(false);
    const [dataHoje] = useState(new Date().toLocaleDateString('pt-BR'));

    useEffect(() => {
        // Se tiver email no localStorage, preencher automaticamente
        const emailSalvo = localStorage.getItem('aluno_email');
        const nomeSalvo = localStorage.getItem('aluno_nome');
        const turmaSalva = localStorage.getItem('aluno_turma');
        
        if (emailSalvo && nomeSalvo) {
            setAluno({
                nome: nomeSalvo,
                email: emailSalvo,
                turma: turmaSalva || ''
            });
            verificarPresenca(emailSalvo);
        }
    }, []);

    async function verificarPresenca(email) {
        try {
            const response = await api.get(`/presenca/verificar/${email}`);
            setJaRegistrado(response.data.presente);
        } catch (error) {
            console.error('Erro ao verificar presença:', error);
        }
    }

    function handleAlunoChange(e) {
        setAluno({
            ...aluno,
            [e.target.name]: e.target.value
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!aluno.nome || !aluno.email) {
            alert('Por favor, preencha nome e email');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/presenca', {
                nome_aluno: aluno.nome,
                email_aluno: aluno.email,
                turma: aluno.turma || null
            });

            // Salvar dados para próxima vez
            localStorage.setItem('aluno_email', aluno.email);
            localStorage.setItem('aluno_nome', aluno.nome);
            if (aluno.turma) localStorage.setItem('aluno_turma', aluno.turma);

            setSucesso(true);
            setJaRegistrado(true);
        } catch (error) {
            alert('Erro ao registrar presença. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <Loading />;

    return (
        <div style={styles.container}>
            <h2>📋 Registro de Presença</h2>
            <p style={styles.data}>Data: {dataHoje}</p>

            {jaRegistrado ? (
                <div style={styles.cardSucesso}>
                    <div style={styles.iconeSucesso}>✅</div>
                    <h3>Presença já registrada hoje!</h3>
                    <p>Obrigado por participar, {aluno.nome}.</p>
                    <p>Deus abençoe sua aula!</p>
                </div>
            ) : sucesso ? (
                <div style={styles.cardSucesso}>
                    <div style={styles.iconeSucesso}>✅</div>
                    <h3>Presença registrada com sucesso!</h3>
                    <p>Bem-vindo(a), {aluno.nome}!</p>
                    <p>Sua presença foi confirmada.</p>
                    <button 
                        onClick={() => window.location.reload()}
                        style={styles.botao}
                    >
                        Ok
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.infoBox}>
                        <p>Registre sua presença na Escola Bíblica Dominical.</p>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Nome completo *</label>
                        <input
                            type="text"
                            name="nome"
                            value={aluno.nome}
                            onChange={handleAlunoChange}
                            style={styles.input}
                            placeholder="Digite seu nome completo"
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>E-mail *</label>
                        <input
                            type="email"
                            name="email"
                            value={aluno.email}
                            onChange={handleAlunoChange}
                            style={styles.input}
                            placeholder="Digite seu e-mail"
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Turma (opcional)</label>
                        <input
                            type="text"
                            name="turma"
                            value={aluno.turma}
                            onChange={handleAlunoChange}
                            style={styles.input}
                            placeholder="Ex: Adultos, Jovens, Crianças"
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
                        {loading ? 'Registrando...' : 'Registrar Presença'}
                    </button>
                </form>
            )}

            <div style={styles.infoExtra}>
                <p>🙏 "Não deixemos de congregar-nos" - Hebreus 10:25</p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
    },
    data: {
        fontSize: '18px',
        color: '#666',
        textAlign: 'center',
        marginBottom: '30px'
    },
    form: {
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    infoBox: {
        backgroundColor: '#e3f2fd',
        padding: '15px',
        borderRadius: '4px',
        marginBottom: '20px',
        textAlign: 'center',
        color: '#1976d2'
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
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '15px 30px',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        cursor: 'pointer',
        width: '100%',
        marginTop: '10px'
    },
    botaoDesabilitado: {
        backgroundColor: '#cccccc',
        cursor: 'not-allowed'
    },
    cardSucesso: {
        backgroundColor: '#d4edda',
        color: '#155724',
        padding: '40px',
        borderRadius: '8px',
        textAlign: 'center',
        border: '1px solid #c3e6cb'
    },
    iconeSucesso: {
        fontSize: '64px',
        marginBottom: '20px'
    },
    infoExtra: {
        marginTop: '30px',
        textAlign: 'center',
        color: '#666',
        fontStyle: 'italic'
    }
};

export default Presenca;
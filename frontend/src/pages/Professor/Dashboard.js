import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Loading from '../../components/Loading';

function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [ano, setAno] = useState(new Date().getFullYear());
    const [trimestre, setTrimestre] = useState(1);
    const [estatisticas, setEstatisticas] = useState(null);

    useEffect(() => {
        carregarDados();
    }, [ano, trimestre]);

    async function carregarDados() {
        setLoading(true);
        try {
            const response = await api.get(`/rankings/filtered?ano=${ano}&trimestre=${trimestre}`);
            setEstatisticas(response.data);
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
            alert('Erro ao carregar dados. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <Loading />;

    return (
        <div style={styles.container}>
            <h1>📊 Dashboard do Professor</h1>

            {/* Filtros */}
            <div style={styles.filtros}>
                <div style={styles.filtroGroup}>
                    <label>Ano:</label>
                    <select value={ano} onChange={e => setAno(parseInt(e.target.value))} style={styles.select}>
                        {[2024, 2025, 2026].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
                <div style={styles.filtroGroup}>
                    <label>Trimestre:</label>
                    <select value={trimestre} onChange={e => setTrimestre(parseInt(e.target.value))} style={styles.select}>
                        <option value={1}>1º Trimestre (Jan-Mar)</option>
                        <option value={2}>2º Trimestre (Abr-Jun)</option>
                        <option value={3}>3º Trimestre (Jul-Set)</option>
                        <option value={4}>4º Trimestre (Out-Dez)</option>
                    </select>
                </div>
            </div>

            {/* Cards */}
            <div style={styles.cardsGrid}>
                <div style={styles.card}>
                    <div style={styles.cardIcon}>👥</div>
                    <div style={styles.cardContent}>
                        <h3>Alunos Participantes</h3>
                        <p style={styles.cardNumero}>{estatisticas?.total_alunos || 0}</p>
                    </div>
                </div>
                <div style={styles.card}>
                    <div style={styles.cardIcon}>📝</div>
                    <div style={styles.cardContent}>
                        <h3>Envios de Quiz</h3>
                        <p style={styles.cardNumero}>{estatisticas?.total_envios || 0}</p>
                    </div>
                </div>
            </div>

            {/* Top 5 Alunos */}
            <div style={styles.secao}>
                <h2>🏆 Top 5 Alunos (Trimestre)</h2>
                {estatisticas?.top_alunos && estatisticas.top_alunos.length > 0 ? (
                    <div style={styles.tabelaContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.tableHeader}>Pos</th>
                                    <th style={styles.tableHeader}>Nome</th>
                                    <th style={styles.tableHeader}>Média Quiz (%)</th>
                                    <th style={styles.tableHeader}>Presença (%)</th>
                                    <th style={styles.tableHeader}>Quizzes</th>
                                    <th style={styles.tableHeader}>Pontuação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {estatisticas.top_alunos.map((aluno, idx) => (
                                    <tr key={idx}>
                                        <td style={styles.tableCell}>{idx + 1}º</td>
                                        <td style={styles.tableCell}>{aluno.nome}</td>
                                        <td style={styles.tableCell}>{aluno.media_quiz}%</td>
                                        <td style={styles.tableCell}>{aluno.media_presenca}%</td>
                                        <td style={styles.tableCell}>{aluno.total_quizzes}</td>
                                        <td style={styles.tableCell}>{aluno.pontuacao_rank}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p style={styles.semDados}>Nenhum dado disponível para este trimestre.</p>
                )}
            </div>

            {/* Ações Rápidas */}
            <div style={styles.secao}>
                <h2>⚡ Ações Rápidas</h2>
                <div style={styles.botoesGrid}>
                    <Link to="/professor/perguntas" style={styles.botaoAcao}>
                        <span style={styles.botaoIcone}>➕</span>
                        Nova Pergunta
                    </Link>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px'
    },
    filtros: {
        display: 'flex',
        gap: '20px',
        marginBottom: '30px',
        backgroundColor: '#fff',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    filtroGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    select: {
        padding: '6px 12px',
        borderRadius: '4px',
        border: '1px solid #ddd'
    },
    cardsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
    },
    card: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
    },
    cardIcon: {
        fontSize: '40px'
    },
    cardContent: {
        flex: 1
    },
    cardNumero: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#2196F3',
        margin: '5px 0 0'
    },
    secao: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '30px'
    },
    tabelaContainer: {
        overflowX: 'auto'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '10px'
    },
    tableHeader: {
        padding: '12px',
        textAlign: 'left',
        borderBottom: '1px solid #ddd',
        fontWeight: 'bold'
    },
    tableCell: {
        padding: '12px',
        textAlign: 'left',
        borderBottom: '1px solid #ddd'
    },
    semDados: {
        textAlign: 'center',
        color: '#999',
        padding: '30px'
    },
    botoesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        marginTop: '15px'
    },
    botaoAcao: {
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px',
        textAlign: 'center',
        textDecoration: 'none',
        color: '#333',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        border: '1px solid #dee2e6',
        transition: 'all 0.3s'
    },
    botaoIcone: {
        fontSize: '24px'
    }
};

export default Dashboard;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Loading from '../../components/Loading';

function Dashboard() {
    const [estatisticas, setEstatisticas] = useState(null);
    const [ultimasPresencas, setUltimasPresencas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        carregarDados();
    }, []);

    async function carregarDados() {
        try {
            // Carregar estatísticas
            const statsResponse = await api.get('/rankings/estatisticas');
            setEstatisticas(statsResponse.data);

            // Carregar presenças de hoje
            const presencaResponse = await api.get('/presenca/data');
            setUltimasPresencas(presencaResponse.data.presentes || []);
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <Loading />;

    return (
        <div style={styles.container}>
            <h1>📊 Dashboard do Professor</h1>

            {/* Cards de Estatísticas */}
            <div style={styles.cardsGrid}>
                <div style={styles.card}>
                    <div style={styles.cardIcon}>👥</div>
                    <div style={styles.cardContent}>
                        <h3>Total de Alunos</h3>
                        <p style={styles.cardNumero}>{estatisticas?.total_alunos || 0}</p>
                    </div>
                </div>

                <div style={styles.card}>
                    <div style={styles.cardIcon}>📝</div>
                    <div style={styles.cardContent}>
                        <h3>Respostas</h3>
                        <p style={styles.cardNumero}>{estatisticas?.total_respostas || 0}</p>
                    </div>
                </div>

                <div style={styles.card}>
                    <div style={styles.cardIcon}>✅</div>
                    <div style={styles.cardContent}>
                        <h3>Média de Acertos</h3>
                        <p style={styles.cardNumero}>{estatisticas?.media_acertos || 0}%</p>
                    </div>
                </div>

                <div style={styles.card}>
                    <div style={styles.cardIcon}>📅</div>
                    <div style={styles.cardContent}>
                        <h3>Presenças Hoje</h3>
                        <p style={styles.cardNumero}>{estatisticas?.presencas_hoje || 0}</p>
                    </div>
                </div>
            </div>

            {/* Top Alunos */}
            <div style={styles.secao}>
                <h2>🏆 Top 3 Alunos</h2>
                <div style={styles.topAlunos}>
                    {estatisticas?.top_alunos?.map((aluno, index) => (
                        <div key={index} style={styles.topAlunoCard}>
                            <div style={styles.topAlunoPosicao}>{index + 1}º</div>
                            <div style={styles.topAlunoInfo}>
                                <h4>{aluno.nome}</h4>
                                <p>{aluno.respostas} respostas • {aluno.percentual}% acertos</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Presenças de Hoje */}
            <div style={styles.secao}>
                <h2>📋 Alunos Presentes Hoje</h2>
                <div style={styles.tabelaContainer}>
                    {ultimasPresencas.length > 0 ? (
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.tableHeader}>Nome</th>
                                    <th style={styles.tableHeader}>Turma</th>
                                    <th style={styles.tableHeader}>E-mail</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ultimasPresencas.map((presenca, index) => (
                                    <tr key={index}>
                                        <td style={styles.tableCell}>{presenca.nome}</td>
                                        <td style={styles.tableCell}>{presenca.turma || '—'}</td>
                                        <td style={styles.tableCell}>{presenca.email}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p style={styles.semDados}>Nenhuma presença registrada hoje</p>
                    )}
                </div>
            </div>

            {/* Links Rápidos */}
            <div style={styles.secao}>
                <h2>⚡ Ações Rápidas</h2>
                <div style={styles.botoesGrid}>
                    <Link to="/professor/perguntas" style={styles.botaoAcao}>
                        <span style={styles.botaoIcone}>➕</span>
                        Nova Pergunta
                    </Link>
                    <Link to="/professor/rankings" style={styles.botaoAcao}>
                        <span style={styles.botaoIcone}>📊</span>
                        Rankings
                    </Link>
                    <Link to="/professor/presencas" style={styles.botaoAcao}>
                        <span style={styles.botaoIcone}>📋</span>
                        Lista de Presença
                    </Link>
                    <Link to="/professor/exportar" style={styles.botaoAcao}>
                        <span style={styles.botaoIcone}>📥</span>
                        Exportar Dados
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
    topAlunos: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px'
    },
    topAlunoCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
    },
    topAlunoPosicao: {
        width: '40px',
        height: '40px',
        backgroundColor: '#FFD700',
        color: '#333',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '20px'
    },
    topAlunoInfo: {
        flex: 1,
        margin: 0
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
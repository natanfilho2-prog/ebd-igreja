import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';

function Rankings() {
    const [activeTab, setActiveTab] = useState('participacao');
    const [participacao, setParticipacao] = useState([]);
    const [presenca, setPresenca] = useState([]);
    const [turmas, setTurmas] = useState([]);
    const [turmaSelecionada, setTurmaSelecionada] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        carregarDados();
    }, []);

    async function carregarDados() {
        try {
            const [partResponse, presResponse] = await Promise.all([
                api.get('/rankings/participacao'),
                api.get('/rankings/presenca')
            ]);
            
            setParticipacao(partResponse.data);
            setPresenca(presResponse.data);
            
            // Extrair turmas únicas
            const todasTurmas = [...new Set([
                ...partResponse.data.map(a => a.turma),
                ...presResponse.data.map(a => a.turma)
            ].filter(Boolean))];
            setTurmas(todasTurmas);
            
        } catch (error) {
            console.error('Erro ao carregar rankings:', error);
        } finally {
            setLoading(false);
        }
    }

    async function carregarRankingTurma(turma) {
        setLoading(true);
        try {
            const response = await api.get(`/rankings/turma/${encodeURIComponent(turma)}`);
            // Atualizar conforme necessário
        } catch (error) {
            console.error('Erro ao carregar ranking da turma:', error);
        } finally {
            setLoading(false);
        }
    }

    function handleTurmaChange(e) {
        const turma = e.target.value;
        setTurmaSelecionada(turma);
        if (turma) {
            carregarRankingTurma(turma);
        }
    }

    if (loading) return <Loading />;

    return (
        <div style={styles.container}>
            <h1>📊 Rankings</h1>

            {/* Abas */}
            <div style={styles.tabs}>
                <button
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'participacao' ? styles.tabAtiva : {})
                    }}
                    onClick={() => setActiveTab('participacao')}
                >
                    🎯 Participação
                </button>
                <button
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'presenca' ? styles.tabAtiva : {})
                    }}
                    onClick={() => setActiveTab('presenca')}
                >
                    📅 Presença
                </button>
                <button
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'turmas' ? styles.tabAtiva : {})
                    }}
                    onClick={() => setActiveTab('turmas')}
                >
                    👥 Por Turma
                </button>
            </div>

            {/* Filtro de Turma (quando aplicável) */}
            {activeTab === 'turmas' && (
                <div style={styles.filtroTurma}>
                    <select 
                        value={turmaSelecionada} 
                        onChange={handleTurmaChange}
                        style={styles.select}
                    >
                        <option value="">Selecione uma turma</option>
                        {turmas.map(turma => (
                            <option key={turma} value={turma}>{turma}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Conteúdo das Abas */}
            <div style={styles.conteudo}>
                {activeTab === 'participacao' && (
                    <div>
                        <h2>Ranking de Participação nos Quizzes</h2>
                        <div style={styles.tabelaContainer}>
                            <table style={styles.tabela}>
                                <thead>
                                    <tr>
                                        <th>Pos</th>
                                        <th>Nome</th>
                                        <th>Turma</th>
                                        <th>Total Respostas</th>
                                        <th>Acertos</th>
                                        <th>% Acerto</th>
                                        <th>Dias</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {participacao.map((aluno, index) => (
                                        <tr key={aluno.id}>
                                            <td style={styles.posicao}>
                                                {index === 0 && '🥇'}
                                                {index === 1 && '🥈'}
                                                {index === 2 && '🥉'}
                                                {index > 2 && `#${index + 1}`}
                                            </td>
                                            <td>{aluno.nome}</td>
                                            <td>{aluno.turma || '—'}</td>
                                            <td style={styles.numero}>{aluno.total_respostas}</td>
                                            <td style={styles.numero}>{aluno.acertos}</td>
                                            <td style={styles.numero}>
                                                <span style={{
                                                    color: aluno.percentual_acerto >= 70 ? '#28a745' : '#dc3545'
                                                }}>
                                                    {aluno.percentual_acerto}%
                                                </span>
                                            </td>
                                            <td style={styles.numero}>{aluno.dias_participacao}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'presenca' && (
                    <div>
                        <h2>Ranking de Presença</h2>
                        <div style={styles.tabelaContainer}>
                            <table style={styles.tabela}>
                                <thead>
                                    <tr>
                                        <th>Pos</th>
                                        <th>Nome</th>
                                        <th>Turma</th>
                                        <th>Total Presenças</th>
                                        <th>Primeira Presença</th>
                                        <th>Última Presença</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {presenca.map((aluno, index) => (
                                        <tr key={aluno.id}>
                                            <td style={styles.posicao}>
                                                {index === 0 && '🥇'}
                                                {index === 1 && '🥈'}
                                                {index === 2 && '🥉'}
                                                {index > 2 && `#${index + 1}`}
                                            </td>
                                            <td>{aluno.nome}</td>
                                            <td>{aluno.turma || '—'}</td>
                                            <td style={styles.numero}>{aluno.total_presencas}</td>
                                            <td>{new Date(aluno.primeira_presenca).toLocaleDateString()}</td>
                                            <td>{new Date(aluno.ultima_presenca).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'turmas' && turmaSelecionada && (
                    <div>
                        <h2>Turma: {turmaSelecionada}</h2>
                        <p>Em desenvolvimento... Carregando dados específicos da turma.</p>
                    </div>
                )}
            </div>

            {/* Botões de Exportação */}
            <div style={styles.exportBotoes}>
                <button style={styles.botaoExportar}>
                    📥 Exportar Ranking (CSV)
                </button>
                <button style={styles.botaoExportar}>
                    📥 Exportar Presenças (CSV)
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '20px'
    },
    tabs: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        borderBottom: '2px solid #dee2e6',
        paddingBottom: '10px'
    },
    tab: {
        padding: '10px 20px',
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        fontSize: '16px',
        borderRadius: '4px 4px 0 0'
    },
    tabAtiva: {
        backgroundColor: '#007bff',
        color: 'white'
    },
    filtroTurma: {
        marginBottom: '20px'
    },
    select: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '16px'
    },
    conteudo: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
    },
    tabelaContainer: {
        overflowX: 'auto'
    },
    tabela: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '10px'
    },
    tabela: {
        borderBottom: '1px solid #ddd'
    },
    tabela: {
        padding: '12px',
        textAlign: 'left'
    },
    posicao: {
        fontSize: '18px'
    },
    numero: {
        textAlign: 'center'
    },
    exportBotoes: {
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end'
    },
    botaoExportar: {
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer'
    }
};

export default Rankings;
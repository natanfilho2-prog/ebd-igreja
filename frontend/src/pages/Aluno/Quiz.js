import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';

function Quiz() {
    const [perguntas, setPerguntas] = useState([]);
    const [respostas, setRespostas] = useState({});
    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [aluno, setAluno] = useState({
        nome: '',
        email: '',
        turma: ''
    });

    useEffect(() => {
        carregarPerguntas();
    }, []);

    async function carregarPerguntas() {
        try {
            const response = await api.get('/perguntas');
            setPerguntas(response.data);
            // Inicializar respostas vazias
            const respostasIniciais = {};
            response.data.forEach(p => {
                respostasIniciais[p.id] = '';
            });
            setRespostas(respostasIniciais);
        } catch (error) {
            alert('Erro ao carregar perguntas. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }

    function handleRespostaChange(perguntaId, alternativa) {
        setRespostas({
            ...respostas,
            [perguntaId]: alternativa
        });
    }

    function handleAlunoChange(e) {
        setAluno({
            ...aluno,
            [e.target.name]: e.target.value
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        // Validar dados do aluno
        if (!aluno.nome || !aluno.email) {
            alert('Por favor, preencha nome e email');
            return;
        }

        // Validar se todas as perguntas foram respondidas
        const perguntasRespondidas = Object.values(respostas).filter(r => r !== '').length;
        if (perguntasRespondidas !== perguntas.length) {
            alert(`Responda todas as ${perguntas.length} perguntas antes de enviar`);
            return;
        }

        setEnviando(true);

        try {
            // Preparar dados para enviar
            const respostasArray = Object.keys(respostas).map(perguntaId => ({
                pergunta_id: parseInt(perguntaId),
                alternativa: respostas[perguntaId]
            }));

            const dados = {
                nome_aluno: aluno.nome,
                email_aluno: aluno.email,
                turma: aluno.turma || null,
                respostas: respostasArray
            };

            const response = await api.post('/respostas', dados);
            setResultado(response.data);
        } catch (error) {
            alert('Erro ao enviar respostas. Tente novamente.');
        } finally {
            setEnviando(false);
        }
    }

    if (loading) return <Loading />;

    if (resultado) {
        return (
            <div style={styles.container}>
                <h2>Resultado do Quiz</h2>
                <div style={styles.resultadoCard}>
                    <p style={styles.pontuacao}>
                        Você acertou {resultado.pontuacao} de {resultado.total_perguntas} perguntas
                    </p>
                    <p style={styles.percentual}>
                        {(resultado.pontuacao / resultado.total_perguntas * 100).toFixed(1)}% de acerto
                    </p>
                    {resultado.aprovado ? (
                        <p style={{...styles.status, ...styles.aprovado}}>✅ Parabéns! Você foi bem!</p>
                    ) : (
                        <p style={{...styles.status, ...styles.reprovado}}>📚 Estude mais e tente novamente</p>
                    )}
                    
                    <h3>Respostas Corretas:</h3>
                    <div style={styles.respostasCorretas}>
                        {resultado.respostas_corretas.map((r, index) => (
                            <div key={r.pergunta_id} style={styles.respostaItem}>
                                <strong>Pergunta {index + 1}:</strong> Alternativa {r.resposta_correta}
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={() => window.location.reload()}
                        style={styles.botao}
                    >
                        Fazer Novo Quiz
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h2>Quiz da Escola Bíblica Dominical</h2>
            
            <form onSubmit={handleSubmit}>
                <div style={styles.alunoInfo}>
                    <h3>Dados do Aluno</h3>
                    <input
                        type="text"
                        name="nome"
                        placeholder="Nome completo"
                        value={aluno.nome}
                        onChange={handleAlunoChange}
                        style={styles.input}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={aluno.email}
                        onChange={handleAlunoChange}
                        style={styles.input}
                        required
                    />
                    <input
                        type="text"
                        name="turma"
                        placeholder="Turma (opcional)"
                        value={aluno.turma}
                        onChange={handleAlunoChange}
                        style={styles.input}
                    />
                </div>

                <h3>Perguntas</h3>
                {perguntas.map((pergunta, index) => (
                    <div key={pergunta.id} style={styles.perguntaCard}>
                        <p style={styles.perguntaEnunciado}>
                            <strong>{index + 1}.</strong> {pergunta.enunciado}
                        </p>
                        <div style={styles.opcoes}>
                            {['A', 'B', 'C'].map(letra => (
                                <label key={letra} style={styles.opcao}>
                                    <input
                                        type="radio"
                                        name={`pergunta-${pergunta.id}`}
                                        value={letra}
                                        checked={respostas[pergunta.id] === letra}
                                        onChange={() => handleRespostaChange(pergunta.id, letra)}
                                        style={styles.radio}
                                    />
                                    <span>
                                        <strong>{letra}.</strong> {pergunta[`opcao_${letra.toLowerCase()}`]}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}

                <button 
                    type="submit" 
                    disabled={enviando}
                    style={{
                        ...styles.botao,
                        ...(enviando ? styles.botaoDesabilitado : {})
                    }}
                >
                    {enviando ? 'Enviando...' : 'Enviar Respostas'}
                </button>
            </form>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
    },
    alunoInfo: {
        backgroundColor: '#f5f5f5',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px'
    },
    input: {
        width: '100%',
        padding: '10px',
        margin: '10px 0',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '16px'
    },
    perguntaCard: {
        backgroundColor: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    perguntaEnunciado: {
        fontSize: '18px',
        marginBottom: '15px',
        color: '#333'
    },
    opcoes: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    opcao: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    radio: {
        width: '18px',
        height: '18px',
        cursor: 'pointer'
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
        marginTop: '20px'
    },
    botaoDesabilitado: {
        backgroundColor: '#cccccc',
        cursor: 'not-allowed'
    },
    resultadoCard: {
        backgroundColor: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '30px',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    pontuacao: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#333'
    },
    percentual: {
        fontSize: '20px',
        color: '#666',
        marginBottom: '20px'
    },
    status: {
        fontSize: '18px',
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '20px'
    },
    aprovado: {
        backgroundColor: '#d4edda',
        color: '#155724',
        border: '1px solid #c3e6cb'
    },
    reprovado: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        border: '1px solid #f5c6cb'
    },
    respostasCorretas: {
        textAlign: 'left',
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px'
    },
    respostaItem: {
        padding: '8px',
        borderBottom: '1px solid #dee2e6'
    }
};

export default Quiz;
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';
import { 
    colors, 
    globalStyles, 
    quizStyles,
    combineStyles 
} from '../../styles/globalStyles';

function QuizEstilizado() {
    const [perguntas, setPerguntas] = useState([]);
    const [respostas, setRespostas] = useState({});
    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [perguntaAtual, setPerguntaAtual] = useState(0);
    const [aluno, setAluno] = useState({
        nome: '',
        email: '',
        turma: ''
    });
    const [showAlunoForm, setShowAlunoForm] = useState(true);

    useEffect(() => {
        carregarPerguntas();
    }, []);

    async function carregarPerguntas() {
        try {
            const response = await api.get('/perguntas');
            setPerguntas(response.data);
        } catch (error) {
            alert('Erro ao carregar perguntas. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }

    function handleRespostaChange(alternativa) {
        setRespostas({
            ...respostas,
            [perguntas[perguntaAtual]?.id]: alternativa
        });
        
        // Pequena animação - avança automaticamente (opcional)
        setTimeout(() => {
            if (perguntaAtual < perguntas.length - 1) {
                setPerguntaAtual(perguntaAtual + 1);
            }
        }, 300);
    }

    function handleAlunoChange(e) {
        setAluno({
            ...aluno,
            [e.target.name]: e.target.value
        });
    }

    function handleAlunoSubmit(e) {
        e.preventDefault();
        if (!aluno.nome || !aluno.email) {
            alert('Por favor, preencha nome e email');
            return;
        }
        setShowAlunoForm(false);
    }

    async function handleSubmit() {
        // Validar se todas as perguntas foram respondidas
        const perguntasRespondidas = Object.values(respostas).filter(r => r).length;
        if (perguntasRespondidas !== perguntas.length) {
            alert(`Responda todas as ${perguntas.length} perguntas antes de enviar`);
            return;
        }

        setEnviando(true);

        try {
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

    function handleVoltar() {
        if (perguntaAtual > 0) {
            setPerguntaAtual(perguntaAtual - 1);
        }
    }

    if (loading) return <Loading />;

    if (resultado) {
        const percentual = (resultado.pontuacao / resultado.total_perguntas * 100).toFixed(0);
        
        return (
            <div style={globalStyles.container}>
                <div style={combineStyles(globalStyles.card, styles.resultadoCard)}>
                    <div style={styles.resultadoIcone}>
                        {resultado.aprovado ? '🎉' : '📚'}
                    </div>
                    <h2 style={globalStyles.h2}>
                        {resultado.aprovado ? 'Parabéns!' : 'Continue estudando!'}
                    </h2>
                    
                    <div style={styles.resultadoPontuacao}>
                        <div style={quizStyles.circuloProgresso}>
                            <svg width="120" height="120" viewBox="0 0 120 120">
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="54"
                                    fill="none"
                                    stroke="#e0e0e0"
                                    strokeWidth="12"
                                />
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="54"
                                    fill="none"
                                    stroke={resultado.aprovado ? colors.success : colors.warning}
                                    strokeWidth="12"
                                    strokeDasharray="339.292"
                                    strokeDashoffset={339.292 - (339.292 * percentual / 100)}
                                    strokeLinecap="round"
                                    transform="rotate(-90 60 60)"
                                    style={quizStyles.progressoAnimado}
                                />
                            </svg>
                            <div style={styles.percentualTexto}>
                                {percentual}%
                            </div>
                        </div>
                        <p style={globalStyles.mt2}>
                            Você acertou {resultado.pontuacao} de {resultado.total_perguntas} perguntas
                        </p>
                    </div>

                    <div style={styles.respostasCorretas}>
                        <h3 style={globalStyles.h3}>✅ Respostas Corretas</h3>
                        <div style={styles.listaRespostas}>
                            {resultado.respostas_corretas.map((r, index) => (
                                <div key={r.pergunta_id} style={styles.itemResposta}>
                                    <span style={styles.perguntaIndex}>{index + 1}</span>
                                    <span>Alternativa {r.resposta_correta}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={() => window.location.reload()}
                        style={globalStyles.buttonPrimary}
                    >
                        🔄 Fazer Novo Quiz
                    </button>
                </div>
            </div>
        );
    }

    if (showAlunoForm) {
        return (
            <div style={globalStyles.container}>
                <div style={globalStyles.card}>
                    <div style={globalStyles.cardHeader}>
                        <h1 style={{ margin: 0, color: colors.white }}>📚 Escola Bíblica Dominical</h1>
                        <p style={{ margin: '10px 0 0', opacity: 0.9 }}>Quiz de Conhecimento Bíblico</p>
                    </div>

                    <form onSubmit={handleAlunoSubmit} style={globalStyles.p4}>
                        <div style={globalStyles.mb3}>
                            <label style={globalStyles.label}>Seu nome *</label>
                            <input
                                type="text"
                                name="nome"
                                value={aluno.nome}
                                onChange={handleAlunoChange}
                                style={globalStyles.input}
                                placeholder="Digite seu nome completo"
                                required
                            />
                        </div>

                        <div style={globalStyles.mb3}>
                            <label style={globalStyles.label}>Seu e-mail *</label>
                            <input
                                type="email"
                                name="email"
                                value={aluno.email}
                                onChange={handleAlunoChange}
                                style={globalStyles.input}
                                placeholder="Digite seu e-mail"
                                required
                            />
                        </div>

                        <div style={globalStyles.mb4}>
                            <label style={globalStyles.label}>Turma (opcional)</label>
                            <input
                                type="text"
                                name="turma"
                                value={aluno.turma}
                                onChange={handleAlunoChange}
                                style={globalStyles.input}
                                placeholder="Ex: Adultos, Jovens, Crianças"
                            />
                        </div>

                        <button type="submit" style={globalStyles.buttonPrimary}>
                            ▶️ Iniciar Quiz
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div style={globalStyles.container}>
            <div style={globalStyles.card}>
                <div style={globalStyles.cardHeader}>
                    <h1 style={{ margin: 0, color: colors.white }}>📚 Quiz Bíblico</h1>
                    <p style={{ margin: '10px 0 0', opacity: 0.9 }}>
                        {perguntaAtual + 1} de {perguntas.length} perguntas
                    </p>
                </div>

                {/* Barra de progresso */}
                <div style={quizStyles.progressBar}>
                    <div 
                        style={{
                            ...quizStyles.progressFill,
                            width: `${((perguntaAtual + 1) / perguntas.length) * 100}%`
                        }}
                    />
                </div>

                {/* Pergunta atual */}
                <div style={globalStyles.p4}>
                    <h2 style={quizStyles.perguntaEnunciado}>
                        {perguntaAtual + 1}. {perguntas[perguntaAtual]?.enunciado}
                    </h2>

                    <div style={globalStyles.flexColumn}>
                        {['A', 'B', 'C'].map(letra => (
                            <button
                                key={letra}
                                onClick={() => handleRespostaChange(letra)}
                                style={combineStyles(
                                    quizStyles.opcao,
                                    respostas[perguntas[perguntaAtual]?.id] === letra 
                                        ? quizStyles.opcaoSelecionada 
                                        : {}
                                )}
                            >
                                <span style={{ fontWeight: 'bold', marginRight: '15px' }}>
                                    {letra}
                                </span>
                                <span style={{ flex: 1 }}>
                                    {perguntas[perguntaAtual]?.[`opcao_${letra.toLowerCase()}`]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Navegação */}
                <div style={combineStyles(globalStyles.flexBetween, globalStyles.p4, { borderTop: `1px solid ${colors.gray200}` })}>
                    <button 
                        onClick={handleVoltar}
                        style={combineStyles(
                            globalStyles.buttonSecondary,
                            perguntaAtual === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}
                        )}
                        disabled={perguntaAtual === 0}
                    >
                        ← Anterior
                    </button>
                    
                    {perguntaAtual === perguntas.length - 1 ? (
                        <button 
                            onClick={handleSubmit}
                            disabled={enviando}
                            style={combineStyles(
                                globalStyles.buttonSuccess,
                                enviando ? { opacity: 0.5, cursor: 'not-allowed' } : {}
                            )}
                        >
                            {enviando ? 'Enviando...' : '✅ Finalizar'}
                        </button>
                    ) : (
                        <button 
                            onClick={() => setPerguntaAtual(perguntaAtual + 1)}
                            style={globalStyles.buttonPrimary}
                        >
                            Próximo →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Estilos específicos que não estão nos globais
const styles = {
    resultadoCard: {
        padding: '40px',
        textAlign: 'center'
    },
    resultadoIcone: {
        fontSize: '4rem',
        marginBottom: '20px'
    },
    resultadoPontuacao: {
        marginBottom: '40px'
    },
    percentualTexto: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '1.8rem',
        fontWeight: 'bold',
        color: colors.gray800
    },
    respostasCorretas: {
        textAlign: 'left',
        backgroundColor: colors.gray100,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '30px'
    },
    listaRespostas: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '10px',
        marginTop: '15px'
    },
    itemResposta: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 12px',
        backgroundColor: colors.white,
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    perguntaIndex: {
        backgroundColor: colors.primary,
        color: colors.white,
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.9rem',
        fontWeight: 'bold'
    }
};

export default QuizEstilizado;
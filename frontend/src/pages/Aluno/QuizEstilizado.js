import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';

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
            [perguntas[perguntaAtual].id]: alternativa
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
            <div style={styles.resultadoContainer}>
                <div style={styles.resultadoCard}>
                    <div style={styles.resultadoIcone}>
                        {resultado.aprovado ? '🎉' : '📚'}
                    </div>
                    <h2 style={styles.resultadoTitulo}>
                        {resultado.aprovado ? 'Parabéns!' : 'Continue estudando!'}
                    </h2>
                    
                    <div style={styles.resultadoPontuacao}>
                        <div style={styles.circuloProgresso}>
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
                                    stroke={resultado.aprovado ? '#4CAF50' : '#FF9800'}
                                    strokeWidth="12"
                                    strokeDasharray="339.292"
                                    strokeDashoffset={339.292 - (339.292 * percentual / 100)}
                                    strokeLinecap="round"
                                    transform="rotate(-90 60 60)"
                                    style={styles.progressoAnimado}
                                />
                            </svg>
                            <div style={styles.percentualTexto}>
                                {percentual}%
                            </div>
                        </div>
                        <p style={styles.resultadoTexto}>
                            Você acertou {resultado.pontuacao} de {resultado.total_perguntas} perguntas
                        </p>
                    </div>

                    <div style={styles.respostasCorretas}>
                        <h3>✅ Respostas Corretas</h3>
                        <div style={styles.listaRespostas}>
                            {resultado.respostas_corretas.map((r, index) => (
                                <div key={r.pergunta_id} style={styles.itemResposta}>
                                    <span style={styles.perguntaIndex}>{index + 1}</span>
                                    <span style={styles.respostaLetra}>
                                        Alternativa {r.resposta_correta}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={() => window.location.reload()}
                        style={styles.botaoNovo}
                    >
                        🔄 Fazer Novo Quiz
                    </button>
                </div>
            </div>
        );
    }

    if (showAlunoForm) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.header}>
                        <h1>📚 Escola Bíblica Dominical</h1>
                        <p>Quiz de Conhecimento Bíblico</p>
                    </div>

                    <form onSubmit={handleAlunoSubmit} style={styles.form}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Seu nome *</label>
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

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Seu e-mail *</label>
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

                        <div style={styles.formGroup}>
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

                        <button type="submit" style={styles.botaoIniciar}>
                            ▶️ Iniciar Quiz
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h1>📚 Quiz Bíblico</h1>
                    <p>{perguntaAtual + 1} de {perguntas.length} perguntas</p>
                </div>

                {/* Barra de progresso */}
                <div style={styles.progressBar}>
                    <div 
                        style={{
                            ...styles.progressFill,
                            width: `${((perguntaAtual + 1) / perguntas.length) * 100}%`
                        }}
                    />
                </div>

                {/* Pergunta atual */}
                <div style={styles.perguntaContainer}>
                    <h2 style={styles.perguntaEnunciado}>
                        {perguntaAtual + 1}. {perguntas[perguntaAtual]?.enunciado}
                    </h2>

                    <div style={styles.opcoes}>
                        {['A', 'B', 'C'].map(letra => (
                            <button
                                key={letra}
                                onClick={() => handleRespostaChange(letra)}
                                style={{
                                    ...styles.opcao,
                                    ...(respostas[perguntas[perguntaAtual]?.id] === letra 
                                        ? styles.opcaoSelecionada 
                                        : {})
                                }}
                            >
                                <span style={styles.opcaoLetra}>{letra}</span>
                                <span style={styles.opcaoTexto}>
                                    {perguntas[perguntaAtual]?.[`opcao_${letra.toLowerCase()}`]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Navegação */}
                <div style={styles.navegacao}>
                    <button 
                        onClick={handleVoltar}
                        style={{
                            ...styles.botaoNav,
                            ...(perguntaAtual === 0 ? styles.botaoDisabled : {})
                        }}
                        disabled={perguntaAtual === 0}
                    >
                        ← Anterior
                    </button>
                    
                    {perguntaAtual === perguntas.length - 1 ? (
                        <button 
                            onClick={handleSubmit}
                            disabled={enviando}
                            style={{
                                ...styles.botaoNav,
                                ...styles.botaoEnviar,
                                ...(enviando ? styles.botaoDisabled : {})
                            }}
                        >
                            {enviando ? 'Enviando...' : '✅ Finalizar'}
                        </button>
                    ) : (
                        <button 
                            onClick={() => setPerguntaAtual(perguntaAtual + 1)}
                            style={{
                                ...styles.botaoNav,
                                ...(perguntaAtual === perguntas.length - 1 ? styles.botaoDisabled : {})
                            }}
                        >
                            Próximo →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '800px',
        margin: '40px auto',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        border: '1px solid #f0f0f0'
    },
    header: {
        backgroundColor: '#7C3AED',
        color: 'white',
        padding: '30px',
        textAlign: 'center'
    },
    header: {
        margin: 0,
        fontSize: '2rem'
    },
    header: {
        margin: '10px 0 0',
        opacity: 0.9
    },
    progressBar: {
        height: '8px',
        backgroundColor: '#f0f0f0',
        width: '100%'
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#7C3AED',
        transition: 'width 0.3s ease'
    },
    perguntaContainer: {
        padding: '30px'
    },
    perguntaEnunciado: {
        fontSize: '1.5rem',
        color: '#333',
        marginBottom: '30px',
        lineHeight: '1.5'
    },
    opcoes: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    opcao: {
        display: 'flex',
        alignItems: 'center',
        padding: '16px 20px',
        backgroundColor: '#f8f9fa',
        border: '2px solid #e9ecef',
        borderRadius: '12px',
        cursor: 'pointer',
        fontSize: '1.1rem',
        transition: 'all 0.2s ease',
        width: '100%',
        textAlign: 'left'
    },
    opcaoSelecionada: {
        backgroundColor: '#7C3AED',
        borderColor: '#7C3AED',
        color: 'white'
    },
    opcaoLetra: {
        fontWeight: 'bold',
        marginRight: '15px',
        minWidth: '30px'
    },
    opcaoTexto: {
        flex: 1
    },
    navegacao: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '20px 30px',
        borderTop: '1px solid #f0f0f0'
    },
    botaoNav: {
        padding: '12px 24px',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    botaoEnviar: {
        backgroundColor: '#10B981',
        color: 'white'
    },
    botaoDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed'
    },
    form: {
        padding: '30px'
    },
    formGroup: {
        marginBottom: '20px'
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '500',
        color: '#333'
    },
    input: {
        width: '100%',
        padding: '14px',
        border: '2px solid #e9ecef',
        borderRadius: '10px',
        fontSize: '1rem',
        transition: 'border-color 0.2s'
    },
    botaoIniciar: {
        width: '100%',
        padding: '16px',
        backgroundColor: '#7C3AED',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    resultadoContainer: {
        maxWidth: '800px',
        margin: '40px auto',
        padding: '20px'
    },
    resultadoCard: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
    },
    resultadoIcone: {
        fontSize: '4rem',
        marginBottom: '20px'
    },
    resultadoTitulo: {
        fontSize: '2rem',
        color: '#333',
        marginBottom: '30px'
    },
    resultadoPontuacao: {
        marginBottom: '40px'
    },
    circuloProgresso: {
        position: 'relative',
        width: '120px',
        height: '120px',
        margin: '0 auto 20px'
    },
    progressoAnimado: {
        transition: 'stroke-dashoffset 0.5s ease'
    },
    percentualTexto: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '1.8rem',
        fontWeight: 'bold'
    },
    resultadoTexto: {
        fontSize: '1.2rem',
        color: '#666'
    },
    respostasCorretas: {
        textAlign: 'left',
        backgroundColor: '#f8f9fa',
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
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    perguntaIndex: {
        backgroundColor: '#7C3AED',
        color: 'white',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.9rem',
        fontWeight: 'bold'
    },
    respostaLetra: {
        color: '#333'
    },
    botaoNovo: {
        padding: '16px 32px',
        backgroundColor: '#7C3AED',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '1.2rem',
        cursor: 'pointer',
        transition: 'all 0.2s'
    }
};

export default QuizEstilizado;
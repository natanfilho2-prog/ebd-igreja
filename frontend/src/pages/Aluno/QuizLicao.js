import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Loading from '../../components/Loading';
import { colors, globalStyles, combineStyles, quizStyles } from '../../styles/globalStyles';

function QuizLicao() {
    const { licaoId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [licao, setLicao] = useState(null);
    const [perguntas, setPerguntas] = useState([]);

    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [mostrarQuiz, setMostrarQuiz] = useState(false);
    const [respostas, setRespostas] = useState({});
    const [enviando, setEnviando] = useState(false);
    const [perguntaAtual, setPerguntaAtual] = useState(0);
    const [submetido, setSubmetido] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [jaRespondeu, setJaRespondeu] = useState(false); // apenas para exibir mensagem

    useEffect(() => {
        carregarLicaoEPerguntas();
    }, [licaoId]);

    async function carregarLicaoEPerguntas() {
        try {
            const response = await api.get(`/quiz/${licaoId}`);
            setLicao(response.data.licao);
            setPerguntas(response.data.perguntas);
        } catch (error) {
            console.error('Erro ao carregar lição:', error);
            alert('Erro ao carregar o quiz. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }

    async function handleIdentificacao(e) {
        e.preventDefault();
        if (!nome.trim() || !telefone.trim()) {
            alert('Preencha nome e telefone');
            return;
        }
        const telefoneLimpo = telefone.replace(/\D/g, '');
        if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
            alert('Telefone inválido. Digite com DDD (ex: 11999999999)');
            return;
        }

        // Verifica se já respondeu
        try {
            const response = await api.get(`/quiz/${licaoId}/resultado?telefone=${telefoneLimpo}`);
            if (response.data) {
                // Já respondeu: exibe resultado
                setResultado(response.data);
                setSubmetido(true);
                setJaRespondeu(true);
                setMostrarQuiz(false);
                return;
            }
        } catch (error) {
            if (error.response?.status === 404) {
                // Nunca respondeu: libera o quiz
                setMostrarQuiz(true);
                setJaRespondeu(false);
                setResultado(null);
                setSubmetido(false);
                const init = {};
                perguntas.forEach(p => { init[p.id] = ''; });
                setRespostas(init);
                setPerguntaAtual(0);
                return;
            }
            console.error('Erro ao verificar resposta:', error);
            alert('Erro ao verificar seu cadastro. Tente novamente.');
        }
    }

    // Buscar resultado para o telefone informado (usado pelo botão "Ver resultado")
    const buscarResultado = async (telefoneNumero) => {
        try {
            const response = await api.get(`/quiz/${licaoId}/resultado?telefone=${telefoneNumero}`);
            if (response.data) {
                setResultado(response.data);
                setSubmetido(true);
                setMostrarQuiz(false);
            } else {
                alert('Nenhum resultado encontrado para este telefone.');
            }
        } catch (error) {
            console.error('Erro ao buscar resultado:', error);
            alert('Erro ao carregar resultado. Tente novamente.');
        }
    };

    function handleRespostaChange(alternativa) {
        setRespostas({
            ...respostas,
            [perguntas[perguntaAtual].id]: alternativa
        });
        setTimeout(() => {
            if (perguntaAtual < perguntas.length - 1) {
                setPerguntaAtual(perguntaAtual + 1);
            }
        }, 300);
    }

    function handleVoltar() {
        if (perguntaAtual > 0) {
            setPerguntaAtual(perguntaAtual - 1);
        }
    }

    async function handleSubmit() {
        const todasRespondidas = perguntas.every(p => respostas[p.id] && respostas[p.id] !== '');
        if (!todasRespondidas) {
            alert('Responda todas as perguntas antes de finalizar.');
            return;
        }

        setEnviando(true);
        const respostasArray = perguntas.map(p => ({
            pergunta_id: p.id,
            alternativa: respostas[p.id]
        }));

        try {
            const response = await api.post(`/quiz/${licaoId}`, {
                nome: nome.trim(),
                telefone: telefone.replace(/\D/g, ''),
                respostas: respostasArray
            });
            setResultado(response.data);
            setSubmetido(true);
            setMostrarQuiz(false);
        } catch (error) {
            console.error('Erro ao enviar:', error);
            if (error.response?.status === 409) {
                alert('Você já respondeu este quiz. Use o botão "Ver resultado".');
            } else {
                alert('Erro ao enviar respostas. Tente novamente.');
            }
        } finally {
            setEnviando(false);
        }
    }

    function renderResultado() {
        if (!resultado) return null;
        const detalhes = resultado.detalhes || resultado.respostas;
        if (!detalhes || detalhes.length === 0) {
            return <div>Erro: resultado não encontrado</div>;
        }
        const percentual = resultado.percentual || 0;
        const aprovado = percentual >= 70;

        return (
            <div style={globalStyles.container}>
                <div style={combineStyles(globalStyles.card, styles.resultadoCard)}>
                    <div style={styles.resultadoIcone}>{aprovado ? '🎉' : '📚'}</div>
                    <h2>{aprovado ? 'Parabéns!' : 'Continue estudando!'}</h2>
                    <div style={styles.resultadoPontuacao}>
                        <div style={quizStyles.circuloProgresso}>
                            <svg width="120" height="120" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="54" fill="none" stroke="#e0e0e0" strokeWidth="12" />
                                <circle cx="60" cy="60" r="54" fill="none"
                                    stroke={aprovado ? colors.success : colors.warning}
                                    strokeWidth="12"
                                    strokeDasharray="339.292"
                                    strokeDashoffset={339.292 - (339.292 * percentual / 100)}
                                    strokeLinecap="round"
                                    transform="rotate(-90 60 60)"
                                    style={quizStyles.progressoAnimado} />
                            </svg>
                            <div style={styles.percentualTexto}>{percentual}%</div>
                        </div>
                        <p>Você acertou {resultado.pontuacao} de {resultado.total_perguntas} perguntas</p>
                    </div>

                    <div style={styles.detalhesResultado}>
                        <h3>Detalhamento</h3>
                        {detalhes.map((r, idx) => (
                            <div key={r.pergunta_id} style={styles.detalheItem}>
                                <div style={styles.detalheEnunciado}>
                                    <strong>{idx + 1}.</strong> {r.enunciado}
                                </div>
                                <div style={styles.detalheResposta}>
                                    <span>✅ Sua resposta: <strong>{r.resposta_aluno}</strong> - {r.opcoes?.[r.resposta_aluno] || ''}</span>
                                    {!r.correta && (
                                        <span style={{ color: colors.danger, marginLeft: 16 }}>
                                            ❌ Correto: {r.resposta_correta} - {r.opcoes?.[r.resposta_correta] || ''}
                                        </span>
                                    )}
                                </div>
                                {r.correta && <span style={{ color: colors.success }}>✓ Correta</span>}
                            </div>
                        ))}
                    </div>
                    <button onClick={() => navigate(`/quiz/${licaoId}`)} style={globalStyles.buttonPrimary}>
    Voltar para o início da lição
</button>
                </div>
            </div>
        );
    }

    if (loading) return <Loading />;
    if (submetido) return renderResultado();

    // Tela de identificação (sempre exibida antes do quiz)
    return (
        <div style={globalStyles.container}>
            <div style={globalStyles.card}>
                <div style={globalStyles.cardHeader}>
                    <h1>{licao?.titulo || 'Quiz Bíblico'}</h1>
                    {licao?.descricao && <p>{licao.descricao}</p>}
                </div>
                <div style={globalStyles.p4}>
                    <h3>Identificação</h3>
                    <p>Preencha seus dados para começar</p>
                    <form onSubmit={handleIdentificacao}>
                        <div style={globalStyles.mb3}>
                            <label style={globalStyles.label}>Nome completo *</label>
                            <input
                                type="text"
                                value={nome}
                                onChange={e => setNome(e.target.value)}
                                style={globalStyles.input}
                                placeholder="Ex: João Silva"
                                required
                            />
                        </div>
                        <div style={globalStyles.mb4}>
                            <label style={globalStyles.label}>Telefone (WhatsApp) *</label>
                            <input
                                type="tel"
                                value={telefone}
                                onChange={e => setTelefone(e.target.value)}
                                style={globalStyles.input}
                                placeholder="Ex: 11999999999"
                                required
                            />
                            <small>Somente números, com DDD</small>
                        </div>
                        <button type="submit" style={globalStyles.buttonPrimary}>
                            Iniciar Quiz
                        </button>
                    </form>
                    {jaRespondeu && (
                        <div style={globalStyles.alertWarning}>
                            <p>Você já respondeu este quiz.
                                <button
                                    onClick={() => {
                                        const tel = telefone.replace(/\D/g, '');
                                        if (tel) buscarResultado(tel);
                                        else alert('Preencha o telefone primeiro.');
                                    }}
                                    style={{ background: 'none', border: 'none', color: '#92400E', textDecoration: 'underline', cursor: 'pointer' }}
                                >
                                    Ver resultado
                                </button>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Estilos (mesmos do código anterior)
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
    detalhesResultado: {
        textAlign: 'left',
        marginTop: '30px',
        padding: '20px',
        backgroundColor: colors.gray100,
        borderRadius: '12px',
        marginBottom: '30px'
    },
    detalheItem: {
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: `1px solid ${colors.gray300}`
    },
    detalheEnunciado: {
        fontWeight: 'bold',
        marginBottom: '8px'
    },
    detalheResposta: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginTop: '8px',
        fontSize: '0.95rem'
    }
};

export default QuizLicao;
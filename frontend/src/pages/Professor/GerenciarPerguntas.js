import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';

function GerenciarPerguntas() {
    const [licoes, setLicoes] = useState([]);
    const [licaoSelecionada, setLicaoSelecionada] = useState('');
    const [perguntas, setPerguntas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        carregarLicoes();
    }, []);

    async function carregarLicoes() {
        try {
            const response = await api.get('/licoes');
            setLicoes(response.data);
        } catch (error) {
            alert('Erro ao carregar lições');
        }
    }

    async function carregarPerguntas(licaoId) {
        if (!licaoId) return;
        setLoading(true);
        try {
            const response = await api.get(`/perguntas/licao/${licaoId}`);
            const perguntasExistentes = response.data;
            // Garantir que temos 6 perguntas (preencher com vazias se faltar)
            const perguntasCompletas = [...perguntasExistentes];
            while (perguntasCompletas.length < 6) {
                perguntasCompletas.push({
                    enunciado: '',
                    opcao_a: '',
                    opcao_b: '',
                    opcao_c: '',
                    resposta_correta: 'A'
                });
            }
            setPerguntas(perguntasCompletas.slice(0, 6));
        } catch (error) {
            console.error('Erro ao carregar perguntas:', error);
            // Iniciar com 6 perguntas vazias
            setPerguntas(Array(6).fill().map(() => ({
                enunciado: '',
                opcao_a: '',
                opcao_b: '',
                opcao_c: '',
                resposta_correta: 'A'
            })));
        } finally {
            setLoading(false);
        }
    }

    function handlePerguntaChange(index, field, value) {
        const novas = [...perguntas];
        novas[index][field] = value;
        setPerguntas(novas);
    }

    async function handleSalvar() {
        // Validar todas as perguntas
        for (let i = 0; i < perguntas.length; i++) {
            const p = perguntas[i];
            if (!p.enunciado || !p.opcao_a || !p.opcao_b || !p.opcao_c) {
                alert(`Preencha todos os campos da pergunta ${i + 1}`);
                return;
            }
        }

        setSalvando(true);
        try {
            await api.put(`/perguntas/licao/${licaoSelecionada}`, { perguntas });
            alert('Perguntas salvas com sucesso!');
            // Recarregar para mostrar os dados atualizados
            carregarPerguntas(licaoSelecionada);
        } catch (error) {
            alert('Erro ao salvar perguntas: ' + (error.response?.data?.error || error.message));
        } finally {
            setSalvando(false);
        }
    }

    if (licoes.length === 0 && !loading) {
        return (
            <div style={styles.container}>
                <h2>Nenhuma lição cadastrada</h2>
                <p>Antes de criar perguntas, cadastre uma lição.</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>📝 Gerenciar Perguntas da Lição</h1>
                <div style={styles.selector}>
                    <label htmlFor="licao">Selecione a lição:</label>
                    <select
                        id="licao"
                        value={licaoSelecionada}
                        onChange={(e) => {
                            const id = e.target.value;
                            setLicaoSelecionada(id);
                            if (id) carregarPerguntas(id);
                        }}
                        style={styles.select}
                    >
                        <option value="">-- Escolha uma lição --</option>
                        {licoes.map(licao => (
                            <option key={licao.id} value={licao.id}>
                                Lição {licao.numero_licao} – {licao.titulo}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {licaoSelecionada && (
                <>
                    {loading ? (
                        <Loading />
                    ) : (
                        <>
                            <p style={{ marginBottom: '20px' }}>
                                Preencha as 6 perguntas da lição. Todas devem ser preenchidas.
                            </p>
                            {perguntas.map((pergunta, idx) => (
                                <div key={idx} style={styles.perguntaCard}>
                                    <h3>Pergunta {idx + 1}</h3>
                                    <div style={styles.formGroup}>
                                        <label>Enunciado *</label>
                                        <textarea
                                            value={pergunta.enunciado}
                                            onChange={(e) => handlePerguntaChange(idx, 'enunciado', e.target.value)}
                                            rows="2"
                                            style={styles.textarea}
                                            required
                                        />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label>Opção A *</label>
                                        <input
                                            type="text"
                                            value={pergunta.opcao_a}
                                            onChange={(e) => handlePerguntaChange(idx, 'opcao_a', e.target.value)}
                                            style={styles.input}
                                            required
                                        />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label>Opção B *</label>
                                        <input
                                            type="text"
                                            value={pergunta.opcao_b}
                                            onChange={(e) => handlePerguntaChange(idx, 'opcao_b', e.target.value)}
                                            style={styles.input}
                                            required
                                        />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label>Opção C *</label>
                                        <input
                                            type="text"
                                            value={pergunta.opcao_c}
                                            onChange={(e) => handlePerguntaChange(idx, 'opcao_c', e.target.value)}
                                            style={styles.input}
                                            required
                                        />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label>Resposta Correta *</label>
                                        <select
                                            value={pergunta.resposta_correta}
                                            onChange={(e) => handlePerguntaChange(idx, 'resposta_correta', e.target.value)}
                                            style={styles.select}
                                        >
                                            <option value="A">A</option>
                                            <option value="B">B</option>
                                            <option value="C">C</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                            <div style={styles.botaoContainer}>
                                <button onClick={handleSalvar} disabled={salvando} style={styles.botaoSalvar}>
                                    {salvando ? 'Salvando...' : 'Salvar todas as perguntas'}
                                </button>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '20px'
    },
    header: {
        marginBottom: '30px'
    },
    selector: {
        marginTop: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    select: {
        padding: '8px 12px',
        fontSize: '1rem',
        border: '1px solid #ddd',
        borderRadius: '4px'
    },
    perguntaCard: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '30px'
    },
    formGroup: {
        marginBottom: '15px'
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '16px'
    },
    textarea: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '16px',
        fontFamily: 'inherit'
    },
    botaoContainer: {
        textAlign: 'center',
        marginTop: '20px'
    },
    botaoSalvar: {
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '4px',
        fontSize: '16px',
        cursor: 'pointer'
    }
};

export default GerenciarPerguntas;
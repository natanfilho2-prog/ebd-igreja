import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';

function GerenciarPerguntas() {
    const [perguntas, setPerguntas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    const [formData, setFormData] = useState({
        enunciado: '',
        opcao_a: '',
        opcao_b: '',
        opcao_c: '',
        resposta_correta: 'A'
    });

    useEffect(() => {
        carregarPerguntas();
    }, []);

    async function carregarPerguntas() {
        try {
            const response = await api.get('/perguntas');
            setPerguntas(response.data);
        } catch (error) {
            alert('Erro ao carregar perguntas');
        } finally {
            setLoading(false);
        }
    }

    function handleInputChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    function handleEditar(pergunta) {
        setFormData({
            enunciado: pergunta.enunciado,
            opcao_a: pergunta.opcao_a,
            opcao_b: pergunta.opcao_b,
            opcao_c: pergunta.opcao_c,
            resposta_correta: pergunta.resposta_correta
        });
        setEditandoId(pergunta.id);
        setMostrarForm(true);
    }

    function handleNovo() {
        setFormData({
            enunciado: '',
            opcao_a: '',
            opcao_b: '',
            opcao_c: '',
            resposta_correta: 'A'
        });
        setEditandoId(null);
        setMostrarForm(true);
    }

    async function handleSubmit(e) {
        e.preventDefault();

        // Validações
        if (!formData.enunciado || !formData.opcao_a || !formData.opcao_b || !formData.opcao_c) {
            alert('Preencha todos os campos');
            return;
        }

        try {
            if (editandoId) {
                // Atualizar
                await api.put(`/perguntas/${editandoId}`, formData);
                alert('Pergunta atualizada com sucesso!');
            } else {
                // Criar nova
                await api.post('/perguntas', formData);
                alert('Pergunta criada com sucesso!');
            }
            
            setMostrarForm(false);
            carregarPerguntas();
        } catch (error) {
            alert('Erro ao salvar pergunta');
        }
    }

    async function handleDeletar(id) {
        if (!window.confirm('Tem certeza que deseja excluir esta pergunta?')) {
            return;
        }

        try {
            await api.delete(`/perguntas/${id}`);
            alert('Pergunta excluída com sucesso!');
            carregarPerguntas();
        } catch (error) {
            alert('Erro ao excluir pergunta');
        }
    }

    function handleCancelar() {
        setMostrarForm(false);
        setEditandoId(null);
    }

    if (loading) return <Loading />;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>📝 Gerenciar Perguntas</h1>
                <button onClick={handleNovo} style={styles.botaoNovo}>
                    ➕ Nova Pergunta
                </button>
            </div>

            {mostrarForm && (
                <div style={styles.formContainer}>
                    <h2>{editandoId ? 'Editar Pergunta' : 'Nova Pergunta'}</h2>
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Enunciado da Pergunta:</label>
                            <textarea
                                name="enunciado"
                                value={formData.enunciado}
                                onChange={handleInputChange}
                                style={styles.textarea}
                                rows="3"
                                required
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Opção A:</label>
                            <input
                                type="text"
                                name="opcao_a"
                                value={formData.opcao_a}
                                onChange={handleInputChange}
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Opção B:</label>
                            <input
                                type="text"
                                name="opcao_b"
                                value={formData.opcao_b}
                                onChange={handleInputChange}
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Opção C:</label>
                            <input
                                type="text"
                                name="opcao_c"
                                value={formData.opcao_c}
                                onChange={handleInputChange}
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Resposta Correta:</label>
                            <select
                                name="resposta_correta"
                                value={formData.resposta_correta}
                                onChange={handleInputChange}
                                style={styles.select}
                            >
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                            </select>
                        </div>

                        <div style={styles.formBotoes}>
                            <button type="submit" style={styles.botaoSalvar}>
                                {editandoId ? 'Atualizar' : 'Salvar'}
                            </button>
                            <button type="button" onClick={handleCancelar} style={styles.botaoCancelar}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={styles.listaPerguntas}>
                {perguntas.length === 0 ? (
                    <p style={styles.semDados}>Nenhuma pergunta cadastrada ainda.</p>
                ) : (
                    perguntas.map((pergunta, index) => (
                        <div key={pergunta.id} style={styles.perguntaCard}>
                            <div style={styles.perguntaHeader}>
                                <span style={styles.perguntaNumero}>#{index + 1}</span>
                                <div style={styles.perguntaAcoes}>
                                    <button 
                                        onClick={() => handleEditar(pergunta)}
                                        style={styles.botaoEditar}
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button 
                                        onClick={() => handleDeletar(pergunta.id)}
                                        style={styles.botaoExcluir}
                                    >
                                        🗑️ Excluir
                                    </button>
                                </div>
                            </div>
                            <p style={styles.perguntaEnunciado}>{pergunta.enunciado}</p>
                            <div style={styles.opcoesLista}>
                                <div style={{
                                    ...styles.opcaoItem,
                                    backgroundColor: pergunta.resposta_correta === 'A' ? '#d4edda' : '#f8f9fa'
                                }}>
                                    <strong>A)</strong> {pergunta.opcao_a}
                                    {pergunta.resposta_correta === 'A' && <span style={styles.correta}> ✓ Correta</span>}
                                </div>
                                <div style={{
                                    ...styles.opcaoItem,
                                    backgroundColor: pergunta.resposta_correta === 'B' ? '#d4edda' : '#f8f9fa'
                                }}>
                                    <strong>B)</strong> {pergunta.opcao_b}
                                    {pergunta.resposta_correta === 'B' && <span style={styles.correta}> ✓ Correta</span>}
                                </div>
                                <div style={{
                                    ...styles.opcaoItem,
                                    backgroundColor: pergunta.resposta_correta === 'C' ? '#d4edda' : '#f8f9fa'
                                }}>
                                    <strong>C)</strong> {pergunta.opcao_c}
                                    {pergunta.resposta_correta === 'C' && <span style={styles.correta}> ✓ Correta</span>}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '900px',
        margin: '0 auto',
        padding: '20px'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
    },
    botaoNovo: {
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        fontSize: '16px',
        cursor: 'pointer'
    },
    formContainer: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '30px'
    },
    form: {
        marginTop: '20px'
    },
    formGroup: {
        marginBottom: '15px'
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold'
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
    select: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '16px'
    },
    formBotoes: {
        display: 'flex',
        gap: '10px',
        marginTop: '20px'
    },
    botaoSalvar: {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        fontSize: '16px',
        cursor: 'pointer',
        flex: 1
    },
    botaoCancelar: {
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        fontSize: '16px',
        cursor: 'pointer',
        flex: 1
    },
    listaPerguntas: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    perguntaCard: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    perguntaHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
    },
    perguntaNumero: {
        backgroundColor: '#007bff',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '4px',
        fontSize: '14px'
    },
    perguntaAcoes: {
        display: 'flex',
        gap: '10px'
    },
    botaoEditar: {
        backgroundColor: '#ffc107',
        color: '#333',
        border: 'none',
        padding: '5px 10px',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    botaoExcluir: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '5px 10px',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    perguntaEnunciado: {
        fontSize: '18px',
        fontWeight: 'bold',
        marginBottom: '15px'
    },
    opcoesLista: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    opcaoItem: {
        padding: '10px',
        borderRadius: '4px'
    },
    correta: {
        color: '#28a745',
        fontWeight: 'bold',
        marginLeft: '10px'
    },
    semDados: {
        textAlign: 'center',
        color: '#999',
        padding: '40px'
    }
};

export default GerenciarPerguntas;
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';
import { colors, globalStyles, combineStyles } from '../../styles/globalStyles';

function GerenciarLicoes() {
    const [licoes, setLicoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    const [ano, setAno] = useState(new Date().getFullYear());
    const [trimestre, setTrimestre] = useState(1);
    const [formData, setFormData] = useState({
        titulo: '',
        numero_licao: '',
        data_limite: '',
        descricao: '',
        palavra_chave: ''
    });

    useEffect(() => {
        carregarLicoes();
    }, [ano, trimestre]);

    async function carregarLicoes() {
        setLoading(true);
        try {
            const response = await api.get(`/licoes?ano=${ano}&trimestre=${trimestre}`);
            setLicoes(response.data);
        } catch (error) {
            alert('Erro ao carregar lições');
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

    function handleEditar(licao) {
        setFormData({
            titulo: licao.titulo,
            numero_licao: licao.numero_licao,
            data_limite: licao.data_limite.split('T')[0],
            descricao: licao.descricao || '',
            palavra_chave: licao.palavra_chave || ''
        });
        setEditandoId(licao.id);
        setMostrarForm(true);
    }

    function handleNovo() {
        setFormData({
            titulo: '',
            numero_licao: '',
            data_limite: '',
            descricao: '',
            palavra_chave: ''
        });
        setEditandoId(null);
        setMostrarForm(true);
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!formData.titulo || !formData.numero_licao || !formData.data_limite) {
            alert('Preencha título, número e data limite');
            return;
        }

        const dados = {
            titulo: formData.titulo,
            numero_licao: parseInt(formData.numero_licao),
            data_limite: formData.data_limite,
            descricao: formData.descricao,
            palavra_chave: formData.palavra_chave
        };

        try {
            if (editandoId) {
                await api.put(`/licoes/${editandoId}`, dados);
                alert('Liçao atualizada com sucesso!');
            } else {
                await api.post('/licoes', dados);
                alert('Liçao criada com sucesso!');
            }
            setMostrarForm(false);
            carregarLicoes();
        } catch (error) {
            alert('Erro ao salvar lição: ' + (error.response?.data?.error || error.message));
        }
    }

    async function handleDeletar(id) {
        if (!window.confirm('Tem certeza que deseja excluir esta lição?')) {
            return;
        }

        try {
            await api.delete(`/licoes/${id}`);
            alert('Liçao excluída com sucesso!');
            carregarLicoes();
        } catch (error) {
            alert(error.response?.data?.error || 'Erro ao excluir lição');
        }
    }

    function handleCancelar() {
        setMostrarForm(false);
        setEditandoId(null);
    }

    function getStatusBadge(status) {
        if (status === 'expirada') {
            return { text: 'Expirada', color: colors.danger, background: '#FEE2E2' };
        }
        return { text: 'Ativa', color: colors.success, background: '#D1FAE5' };
    }

    const copiarLink = (link, tipo) => {
        navigator.clipboard.writeText(link);
        alert(`Link do ${tipo} copiado!`);
    };

    if (loading) return <Loading />;

    return (
        <div style={globalStyles.container}>
            <div style={combineStyles(globalStyles.flexBetween, { marginBottom: '30px' })}>
                <h1 style={globalStyles.h2}>📚 Gerenciar Lições do Trimestre</h1>
                <button onClick={handleNovo} style={globalStyles.buttonPrimary}>
                    ➕ Nova Lição
                </button>
            </div>

            {/* Filtros */}
            <div style={styles.filtros}>
                <div style={styles.filtroGroup}>
                    <label>Ano:</label>
                    <select value={ano} onChange={e => setAno(parseInt(e.target.value))} style={styles.select}>
                        {[2024, 2025, 2026, 2027].map(y => (
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

            {mostrarForm && (
                <div style={combineStyles(globalStyles.card, globalStyles.p4, { marginBottom: '30px' })}>
                    <h2 style={globalStyles.h3}>{editandoId ? 'Editar Lição' : 'Nova Lição'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div style={globalStyles.mb3}>
                            <label style={globalStyles.label}>Número da Lição *</label>
                            <input
                                type="number"
                                name="numero_licao"
                                value={formData.numero_licao}
                                onChange={handleInputChange}
                                style={globalStyles.input}
                                min="1"
                                required
                            />
                        </div>

                        <div style={globalStyles.mb3}>
                            <label style={globalStyles.label}>Título da Lição *</label>
                            <input
                                type="text"
                                name="titulo"
                                value={formData.titulo}
                                onChange={handleInputChange}
                                style={globalStyles.input}
                                placeholder="Ex: Lição 1 - A Criação"
                                required
                            />
                        </div>

                        <div style={globalStyles.mb3}>
                            <label style={globalStyles.label}>Data Limite *</label>
                            <input
                                type="date"
                                name="data_limite"
                                value={formData.data_limite}
                                onChange={handleInputChange}
                                style={globalStyles.input}
                                required
                            />
                            <small style={{ color: colors.gray600 }}>
                                Alunos podem responder até 23:59 desta data
                            </small>
                        </div>

                        <div style={globalStyles.mb3}>
                            <label style={globalStyles.label}>Palavra-chave (para presença) *</label>
                            <input
                                type="text"
                                name="palavra_chave"
                                value={formData.palavra_chave}
                                onChange={handleInputChange}
                                style={globalStyles.input}
                                placeholder="Ex: criacao, pao, etc."
                                required
                            />
                            <small style={{ color: colors.gray600 }}>
                                Será exigida ao registrar a presença
                            </small>
                        </div>

                        <div style={globalStyles.mb4}>
                            <label style={globalStyles.label}>Professor</label>
                            <textarea
                                name="descricao"
                                value={formData.descricao}
                                onChange={handleInputChange}
                                style={globalStyles.input}
                                placeholder="Descrição da lição"
                            />
                        </div>

                        <div style={globalStyles.flexBetween}>
                            <button type="submit" style={globalStyles.buttonPrimary}>
                                {editandoId ? 'Atualizar' : 'Salvar'}
                            </button>
                            <button type="button" onClick={handleCancelar} style={globalStyles.buttonSecondary}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={globalStyles.card}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={globalStyles.table}>
                        <thead>
                            <tr>
                                <th style={globalStyles.tableHeader}>#</th>
                                <th style={globalStyles.tableHeader}>Título</th>
                                <th style={globalStyles.tableHeader}>Palavra-chave</th>
                                <th style={globalStyles.tableHeader}>Data Limite</th>
                                <th style={globalStyles.tableHeader}>Status</th>
                                <th style={globalStyles.tableHeader}>Perguntas</th>
                                <th style={globalStyles.tableHeader}>Links</th>
                                <th style={globalStyles.tableHeader}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {licoes.map((licao) => {
                                const status = getStatusBadge(licao.status);
                                const quizLink = `${window.location.origin}/quiz/${licao.id}`;
                                const presencaLinks = `${window.location.origin}/presenca/${licao.id}`;
                                return (
                                    <tr key={licao.id}>
                                        <td style={globalStyles.tableCell}>#{licao.numero_licao}</td>
                                        <td style={globalStyles.tableCell}>
                                            <strong>{licao.titulo}</strong>
                                            {licao.descricao && (
                                                <div style={{ fontSize: '0.9rem', color: colors.gray600, marginTop: '4px' }}>
                                                    {licao.descricao}
                                                </div>
                                            )}
                                        </td>
                                        <td style={globalStyles.tableCell}>
                                            <code style={{ backgroundColor: colors.gray100, padding: '2px 6px', borderRadius: '4px' }}>
                                                {licao.palavra_chave || '—'}
                                            </code>
                                        </td>
                                        <td style={globalStyles.tableCell}>
                                            {new Date(licao.data_limite).toLocaleDateString()}
                                        </td>
                                        <td style={globalStyles.tableCell}>
                                            <span style={{
                                                backgroundColor: status.background,
                                                color: status.color,
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                fontSize: '0.9rem',
                                                fontWeight: 'bold'
                                            }}>
                                                {status.text}
                                            </span>
                                        </td>
                                        <td style={globalStyles.tableCell}>
                                            <span style={{
                                                backgroundColor: colors.gray100,
                                                padding: '4px 8px',
                                                borderRadius: '12px'
                                            }}>
                                                {licao.total_perguntas || 0} perguntas
                                            </span>
                                        </td>
                                        <td style={globalStyles.tableCell}>
                                            <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                                                <button
                                                    onClick={() => copiarLink(quizLink, 'Quiz')}
                                                    style={{ ...globalStyles.buttonSecondary, padding: '4px 8px', fontSize: '0.8rem' }}
                                                >
                                                    🔗 Copiar Quiz
                                                </button>
                                                <button
                                                    onClick={() => copiarLink(presencaLinks, 'Presença')}
                                                    style={{ ...globalStyles.buttonSecondary, padding: '4px 8px', fontSize: '0.8rem' }}
                                                >
                                                    📋 Copiar Presença
                                                </button>
                                            </div>
                                        </td>
                                        <td style={globalStyles.tableCell}>
                                            <button
                                                onClick={() => window.location.href = `/professor/perguntas?licao=${licao.id}`}
                                                style={{ ...globalStyles.buttonSecondary, marginRight: '8px', padding: '4px 12px' }}
                                            >
                                                ✏️ Perguntas
                                            </button>
                                            <button
                                                onClick={() => handleEditar(licao)}
                                                style={{ ...globalStyles.buttonSecondary, marginRight: '8px', padding: '4px 12px' }}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDeletar(licao.id)}
                                                style={{ ...globalStyles.buttonSecondary, padding: '4px 12px', color: colors.danger }}
                                            >
                                                Excluir
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {licoes.length === 0 && (
                                <tr>
                                    <td colSpan="8" style={{ ...globalStyles.tableCell, textAlign: 'center', color: colors.gray600 }}>
                                        Nenhuma lição cadastrada para este trimestre.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

const styles = {
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
    }
};

export default GerenciarLicoes;
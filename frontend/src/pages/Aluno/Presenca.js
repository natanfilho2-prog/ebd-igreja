import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Loading from '../../components/Loading';
import { globalStyles } from '../../styles/globalStyles';

function Presenca() {
    const { licaoId } = useParams();
    const navigate = useNavigate();
    const [licao, setLicao] = useState(null);
    const [loading, setLoading] = useState(true);
    const [nome, setNome] = useState('');
    const [palavraChave, setPalavraChave] = useState('');
    const [status, setStatus] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const [jaMarcou, setJaMarcou] = useState(false);

    useEffect(() => {
        carregarLicao();
        // Não tentamos verificar presença antes do submit; será feita pelo backend.
    }, [licaoId]);

    async function carregarLicao() {
        try {
            const response = await api.get(`/licoes/${licaoId}`);
            setLicao(response.data);
        } catch (error) {
            console.error(error);
            alert('Lição não encontrada');
            navigate('/');
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!nome.trim() || !palavraChave.trim()) {
            setStatus({ success: false, message: 'Preencha nome e palavra-chave' });
            return;
        }
        setEnviando(true);
        setStatus(null);

        try {
            const response = await api.post(`/presenca/${licaoId}`, {
                nome: nome.trim(),
                palavra_chave: palavraChave.trim()
            });
            setStatus({ success: true, message: response.data.message });
            setJaMarcou(true);
        } catch (error) {
            const msg = error.response?.data?.error || 'Erro ao registrar presença';
            setStatus({ success: false, message: msg });
        } finally {
            setEnviando(false);
        }
    }

    if (loading) return <Loading />;
    if (!licao) return <div>Lição não encontrada</div>;

    return (
        <div style={globalStyles.container}>
            <div style={globalStyles.card}>
                <div style={globalStyles.cardHeader}>
                    <h1>Presença: {licao.titulo}</h1>
                </div>
                <div style={globalStyles.p4}>
                    <p>Marque sua presença nesta lição.</p>
                    <form onSubmit={handleSubmit}>
                        <div style={globalStyles.mb3}>
                            <label style={globalStyles.label}>Seu nome completo *</label>
                            <input
                                type="text"
                                value={nome}
                                onChange={e => setNome(e.target.value)}
                                style={globalStyles.input}
                                placeholder="Ex: Maria da Silva"
                                required
                                disabled={jaMarcou}
                            />
                        </div>
                        <div style={globalStyles.mb4}>
                            <label style={globalStyles.label}>Palavra-chave *</label>
                            <input
                                type="text"
                                value={palavraChave}
                                onChange={e => setPalavraChave(e.target.value)}
                                style={globalStyles.input}
                                placeholder="Digite a palavra-chave da lição"
                                required
                                disabled={jaMarcou}
                            />
                        </div>
                        {!jaMarcou && (
                            <button type="submit" style={globalStyles.buttonPrimary} disabled={enviando}>
                                {enviando ? 'Registrando...' : 'Registrar Presença'}
                            </button>
                        )}
                    </form>

                    {status && (
                        <div style={{
                            marginTop: '20px',
                            padding: '10px',
                            borderRadius: '8px',
                            backgroundColor: status.success ? '#d4edda' : '#f8d7da',
                            color: status.success ? '#155724' : '#721c24',
                            border: `1px solid ${status.success ? '#c3e6cb' : '#f5c6cb'}`
                        }}>
                            {status.message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Presenca;
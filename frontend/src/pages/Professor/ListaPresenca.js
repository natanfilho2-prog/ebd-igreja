import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';

function ListaPresenca() {
    const [data, setData] = useState(new Date().toISOString().split('T')[0]);
    const [presencas, setPresencas] = useState([]);
    const [loading, setLoading] = useState(false);

    async function buscarPresencas() {
        setLoading(true);
        try {
            const response = await api.get(`/presenca/data/${data}`);
            setPresencas(response.data.presentes || []);
        } catch (error) {
            console.error('Erro ao buscar presenças:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        buscarPresencas();
    }, [data]);

    return (
        <div style={styles.container}>
            <h1>📋 Lista de Presença</h1>

            <div style={styles.filtros}>
                <input
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    style={styles.dateInput}
                />
                <button onClick={buscarPresencas} style={styles.botaoBuscar}>
                    🔍 Buscar
                </button>
            </div>

            {loading ? <Loading /> : (
                <div style={styles.resultado}>
                    <h3>Presenças em {new Date(data).toLocaleDateString()}</h3>
                    <p>Total: {presencas.length} alunos</p>

                    <table style={styles.tabela}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Nome</th>
                                <th>Turma</th>
                                <th>E-mail</th>
                            </tr>
                        </thead>
                        <tbody>
                            {presencas.map((presenca, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{presenca.nome}</td>
                                    <td>{presenca.turma || '—'}</td>
                                    <td>{presenca.email}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px'
    },
    filtros: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px'
    },
    dateInput: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '16px',
        flex: 1
    },
    botaoBuscar: {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    resultado: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    tabela: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px'
    },
    tabela: {
        borderBottom: '1px solid #ddd'
    },
    tabela: {
        padding: '12px',
        textAlign: 'left'
    }
};

export default ListaPresenca;
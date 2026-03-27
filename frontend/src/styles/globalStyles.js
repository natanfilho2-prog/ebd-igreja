// ============================================
// CORES PRIMÁRIAS DO TEMA
// ============================================
export const colors = {
    primary: '#7C3AED',        // Roxo principal
    primaryLight: '#9F7AEA',   // Roxo claro
    primaryDark: '#5B21B6',    // Roxo escuro
    success: '#10B981',        // Verde
    warning: '#F59E0B',        // Laranja
    danger: '#EF4444',         // Vermelho
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray600: '#4B5563',
    gray800: '#1F2937',
    white: '#FFFFFF',
    black: '#000000'
};

// ============================================
// ANIMAÇÕES GLOBAIS
// ============================================
export const animations = `
    @keyframes slideIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

// ============================================
// ESTILOS GLOBAIS REUTILIZÁVEIS
// ============================================
export const globalStyles = {
    // Container principal
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    },

    // Cards
    card: {
        backgroundColor: colors.white,
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        border: `1px solid ${colors.gray200}`,
        transition: 'all 0.3s ease'
    },

    // Headers de cards
    cardHeader: {
        backgroundColor: colors.primary,
        color: colors.white,
        padding: '30px',
        textAlign: 'center'
    },

    // Botões primários
    buttonPrimary: {
        backgroundColor: colors.primary,
        color: colors.white,
        border: 'none',
        borderRadius: '10px',
        padding: '12px 24px',
        fontSize: '1rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ':hover': {
            backgroundColor: colors.primaryDark,
            transform: 'translateY(-2px)',
            boxShadow: '0 5px 15px rgba(124, 58, 237, 0.3)'
        }
    },

    // Botões secundários
    buttonSecondary: {
        backgroundColor: colors.gray100,
        color: colors.gray800,
        border: `1px solid ${colors.gray300}`,
        borderRadius: '10px',
        padding: '12px 24px',
        fontSize: '1rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },

    // Botões de sucesso
    buttonSuccess: {
        backgroundColor: colors.success,
        color: colors.white,
        border: 'none',
        borderRadius: '10px',
        padding: '12px 24px',
        fontSize: '1rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },

    // Inputs
    input: {
        width: '100%',
        padding: '14px',
        border: `2px solid ${colors.gray200}`,
        borderRadius: '10px',
        fontSize: '1rem',
        transition: 'border-color 0.2s',
        outline: 'none',
        ':focus': {
            borderColor: colors.primary
        }
    },

    // Labels
    label: {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '500',
        color: colors.gray800
    },

    // Tabelas
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '10px'
    },

    tableHeader: {
        padding: '12px',
        textAlign: 'left',
        borderBottom: `1px solid ${colors.gray300}`,
        fontWeight: 'bold',
        backgroundColor: colors.gray100
    },

    tableCell: {
        padding: '12px',
        textAlign: 'left',
        borderBottom: `1px solid ${colors.gray200}`
    },

    // Grids
    grid2: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px'
    },

    grid3: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px'
    },

    grid4: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px'
    },

    // Flex layouts
    flexBetween: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    flexCenter: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },

    flexColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },

    // Margens e paddings utilitários
    mt1: { marginTop: '5px' },
    mt2: { marginTop: '10px' },
    mt3: { marginTop: '15px' },
    mt4: { marginTop: '20px' },
    mt5: { marginTop: '30px' },

    mb1: { marginBottom: '5px' },
    mb2: { marginBottom: '10px' },
    mb3: { marginBottom: '15px' },
    mb4: { marginBottom: '20px' },
    mb5: { marginBottom: '30px' },

    p1: { padding: '5px' },
    p2: { padding: '10px' },
    p3: { padding: '15px' },
    p4: { padding: '20px' },
    p5: { padding: '30px' },

    // Textos
    textCenter: { textAlign: 'center' },
    textLeft: { textAlign: 'left' },
    textRight: { textAlign: 'right' },
    
    h1: { fontSize: '2.5rem', fontWeight: 'bold', color: colors.gray800 },
    h2: { fontSize: '2rem', fontWeight: 'bold', color: colors.gray800 },
    h3: { fontSize: '1.5rem', fontWeight: 'bold', color: colors.gray800 },
    
    // Loading spinner
    loadingSpinner: {
        border: `4px solid ${colors.gray200}`,
        borderTop: `4px solid ${colors.primary}`,
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite'
    },

    // Alertas
    alertSuccess: {
        backgroundColor: '#D1FAE5',
        color: '#065F46',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #A7F3D0',
        marginBottom: '20px'
    },

    alertError: {
        backgroundColor: '#FEE2E2',
        color: '#991B1B',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #FECACA',
        marginBottom: '20px'
    },

    alertWarning: {
        backgroundColor: '#FEF3C7',
        color: '#92400E',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #FDE68A',
        marginBottom: '20px'
    }
};

// ============================================
// ESTILOS ESPECÍFICOS DO QUIZ
// ============================================
export const quizStyles = {
    progressBar: {
        height: '8px',
        backgroundColor: colors.gray200,
        width: '100%'
    },

    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
        transition: 'width 0.3s ease'
    },

    perguntaEnunciado: {
        fontSize: '1.5rem',
        color: colors.gray800,
        marginBottom: '30px',
        lineHeight: '1.5'
    },

    opcao: {
        display: 'flex',
        alignItems: 'center',
        padding: '16px 20px',
        backgroundColor: colors.gray100,
        border: `2px solid ${colors.gray200}`,
        borderRadius: '12px',
        cursor: 'pointer',
        fontSize: '1.1rem',
        transition: 'all 0.2s ease',
        width: '100%',
        textAlign: 'left',
        ':hover': {
            backgroundColor: colors.gray200,
            transform: 'scale(1.02)'
        }
    },

    opcaoSelecionada: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        color: colors.white
    },

    circuloProgresso: {
        position: 'relative',
        width: '120px',
        height: '120px',
        margin: '0 auto 20px'
    },

    progressoAnimado: {
        transition: 'stroke-dashoffset 0.5s ease'
    }
};

// ============================================
// ESTILOS ESPECÍFICOS DO DASHBOARD
// ============================================
export const dashboardStyles = {
    cardEstatistica: {
        backgroundColor: colors.white,
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        transition: 'transform 0.2s',
        ':hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
        }
    },

    cardIcon: {
        fontSize: '40px'
    },

    cardNumero: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: colors.primary,
        margin: '5px 0 0'
    },

    topAlunoCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        padding: '15px',
        backgroundColor: colors.gray100,
        borderRadius: '10px',
        transition: 'transform 0.2s',
        ':hover': {
            transform: 'translateX(5px)',
            backgroundColor: colors.gray200
        }
    },

    topAlunoPosicao: {
        width: '40px',
        height: '40px',
        backgroundColor: '#FFD700',
        color: colors.gray800,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '20px'
    }
};

// ============================================
// ESTILOS ESPECÍFICOS DE RANKINGS
// ============================================
export const rankingStyles = {
    tabs: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        borderBottom: `2px solid ${colors.gray200}`,
        paddingBottom: '10px'
    },

    tab: {
        padding: '10px 20px',
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        fontSize: '16px',
        borderRadius: '8px 8px 0 0',
        transition: 'all 0.2s'
    },

    tabAtiva: {
        backgroundColor: colors.primary,
        color: colors.white
    },

    posicao: {
        fontSize: '18px'
    },

    medalhaOuro: {
        backgroundColor: '#FFD700',
        color: colors.gray800,
        padding: '4px 8px',
        borderRadius: '20px',
        fontWeight: 'bold'
    },

    medalhaPrata: {
        backgroundColor: '#C0C0C0',
        color: colors.gray800,
        padding: '4px 8px',
        borderRadius: '20px',
        fontWeight: 'bold'
    },

    medalhaBronze: {
        backgroundColor: '#CD7F32',
        color: colors.white,
        padding: '4px 8px',
        borderRadius: '20px',
        fontWeight: 'bold'
    }
};

// ============================================
// ESTILOS ESPECÍFICOS DE PRESENÇA
// ============================================
export const presencaStyles = {
    cardSucesso: {
        backgroundColor: '#D1FAE5',
        color: '#065F46',
        padding: '40px',
        borderRadius: '16px',
        textAlign: 'center',
        border: '1px solid #A7F3D0',
        animation: 'slideIn 0.5s ease'
    },

    iconeSucesso: {
        fontSize: '64px',
        marginBottom: '20px',
        animation: 'pulse 2s infinite'
    },

    data: {
        fontSize: '18px',
        color: colors.gray600,
        textAlign: 'center',
        marginBottom: '30px'
    },

    infoBox: {
        backgroundColor: '#EFF6FF',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center',
        color: colors.primary
    }
};

// Função utilitária para combinar estilos
export const combineStyles = (...styles) => {
    return Object.assign({}, ...styles);
};
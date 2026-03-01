import axios from 'axios';

// Detectar ambiente
const isDevelopment = process.env.NODE_ENV === 'development';

// URL base da API
const API_URL = isDevelopment 
    ? 'http://localhost:3000' 
    : process.env.REACT_APP_API_URL || 'https://seu-backend.onrender.com';

console.log('📡 API URL:', API_URL);
console.log('🌍 Ambiente:', process.env.NODE_ENV);

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000 // 10 segundos de timeout
});

// Interceptor para log
api.interceptors.request.use(request => {
    if (isDevelopment) {
        console.log('📤 Requisição:', request.method, request.url);
    }
    return request;
});

api.interceptors.response.use(
    response => {
        if (isDevelopment) {
            console.log('📥 Resposta:', response.status, response.config.url);
        }
        return response;
    },
    error => {
        console.error('❌ Erro na API:', error.message);
        if (error.code === 'ECONNABORTED') {
            alert('O servidor demorou muito para responder. Tente novamente.');
        }
        return Promise.reject(error);
    }
);

export default api;
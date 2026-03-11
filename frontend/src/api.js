import axios from 'axios';

const getBaseURL = () => {
    const host = window.location.hostname;

    // Se estiver no desenvolvimento local
    if (host === 'localhost' || host === '127.0.0.1') {
        return 'http://localhost:8000/api';
    }

    // Se estiver no Coolify, tentamos o subdomínio 'api-igreja'
    // IMPORTANTE: O usuário precisa criar esse CNAME ou Registro A no DNS dele.
    if (host.includes('techinteligente.site')) {
        return `https://api-igreja.techinteligente.site/api`;
    }

    // Fallback: tenta o mesmo domínio (útil se o usuário configurar proxy /api no Coolify)
    return `${window.location.origin}/api`;
};

const API_BASE_URL = getBaseURL();
console.log("🚀 API URL Tentada:", API_BASE_URL);

const api = axios.create({ baseURL: API_BASE_URL });

export { API_BASE_URL };
export default api;

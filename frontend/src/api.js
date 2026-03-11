import axios from 'axios';

// Define a URL base dinamicamente para evitar erros de 'localhost' em produção.
// Se estiver rodando localmente (localhost), usa a porta 8000.
// Se estiver no domínio do Coolify (igreja.techinteligente.site), troca 'igreja' por 'api-igreja'.
const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8000/api'
    : `https://${window.location.hostname.replace('igreja', 'api-igreja')}/api`;

const api = axios.create({ baseURL: API_BASE_URL });

export { API_BASE_URL };
export default api;

import axios from 'axios';
import { push } from 'svelte-spa-router';

axios.defaults.baseURL = 'http://127.0.0.1:8000/';

let refreshToken = false;
const cache = {};

axios.interceptors.response.use(resp => resp, async error => {
    if (error.response.status === 401 && !refreshToken) {
        refreshToken = true;

        const response = await axios.post('auth/refresh-token', {}, { withCredentials: true });

        if (response.status === 200) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;

            return axios(error.config);
        }
    }
    
    refreshToken = false;
    return error;
    }
);

axios.interceptors.request.use(request => {
  // Solo cacheamos métodos GET (para simplificar)
  if (request.method === 'get') {
    const cacheKey = `${request.url}?${JSON.stringify(request.params || {})}`;
    if (cache[cacheKey]) {
      // Retornamos una promesa resuelta con la data cacheada
      return Promise.reject({ __fromCache: true, data: cache[cacheKey], config: request });
    }
  }
  return request;
});

const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  console.log('Token cargado:', token);
}

if (token) {
  // Opcionalmente, podrías hacer una llamada a un endpoint para validar el token antes de redirigir.
  push('/home');
}

// axios.interceptors.response.use(
//   response => {
//     // Si es GET, guardamos la respuesta en cache
//     if (response.config.method === 'get') {
//       const cacheKey = `${response.config.url}?${JSON.stringify(response.config.params || {})}`;
//       cache[cacheKey] = response.data;
//     }
//     return response;
//   },
//   async error => {
//     // Si es la respuesta del cache, la devolvemos como un response simulado
//     if (error.__fromCache) {
//       return Promise.resolve({ data: error.data, status: 200, config: error.config });
//     }
    
//     if (error.response && error.response.status === 401 && !refreshToken) {
//       refreshToken = true;
//       const response = await axios.post('auth/refresh-token', {}, { withCredentials: true });
//       if (response.status === 200) {
//         axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
//         return axios(error.config);
//       }
//     }
//     refreshToken = false;
//     return Promise.reject(error);
//   }
// );
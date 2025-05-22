import axios from 'axios';

export function getCachedAccidentes() {
    return axios.get('http://127.0.0.1:8000/proxy/')
        .then(response => response.data);
}
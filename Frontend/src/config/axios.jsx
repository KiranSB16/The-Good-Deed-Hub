// import axios from "axios";

// const instance = axios.create({
//     baseURL: "http://localhost:3800",
//     timeout: 15000,
//     headers: {
//         'Content-Type': 'application/json'
//     }
// });

// instance.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem('authToken');
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => Promise.reject(error)
// );

// instance.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         console.error('API Error:', {
//             status: error.response?.status,
//             data: error.response?.data,
//             message: error.message
//         });
//         return Promise.reject(error);
//     }
// );

// export default instance;

import axios from "axios";

const instance = axios.create({
    baseURL: "http://localhost:3800",
    timeout: 15000
});

instance.interceptors.request.use(
    (config) => {
        // Don't set Content-Type for FormData - axios will set it automatically with boundary
        if (!(config.data instanceof FormData)) {
            config.headers['Content-Type'] = 'application/json';
        }

        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Rest of your interceptors remain the same
export default instance;